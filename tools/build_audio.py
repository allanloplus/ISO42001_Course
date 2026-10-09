"""互動影音語音建置：content/video/chNN.json → docs/audio/chNN/*.mp3 + docs/data/video/chNN.js

- Allan 講師：台灣男聲 zh-TW-YunJheNeural
- 助教阿拉蕾：台灣年輕女聲 zh-TW-HsiaoYuNeural（略提高音調、語速）
- 每句台詞一個小檔（約 20–60 KB），播放器可立即開始播放並預載後續句子。
- 以「聲音+文字」雜湊命名，內容未變更的句子不會重新產生。

用法：python3 tools/build_audio.py [ch04 ch05 ...]   （不帶參數 = 全部章節）
"""
import asyncio
import hashlib
import json
import os
import re
import ssl
import sys
from pathlib import Path

import edge_tts
import edge_tts.communicate as _comm

# 雲端環境經由代理連線時，使用系統 CA bundle
_CA = os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt"
if os.path.exists(_CA):
    _comm._SSL_CTX = ssl.create_default_context(cafile=_CA)

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "content" / "video"
AUDIO = ROOT / "docs" / "audio"
DATA = ROOT / "docs" / "data" / "video"

VOICES = {
    "A": dict(voice="zh-TW-YunJheNeural", rate="+0%", pitch="+0Hz"),
    "R": dict(voice="zh-TW-HsiaoYuNeural", rate="+6%", pitch="+18Hz"),
}
BITRATE = 48000  # edge-tts 預設輸出 24kHz 48kbps mono mp3

DIG = "零一二三四五六七八九"


def zh_int(n: int) -> str:
    """0–99 轉中文數字（條文編號用）。"""
    if n < 10:
        return DIG[n]
    if n < 20:
        return "十" + (DIG[n % 10] if n % 10 else "")
    return DIG[n // 10] + "十" + (DIG[n % 10] if n % 10 else "")


def clause(m: re.Match) -> str:
    parts = m.group(0).split(".")
    if parts[0] == "0":  # 小數，例如 0.85
        return "零點" + "".join(DIG[int(c)] for c in parts[1])
    return "點".join(zh_int(int(p)) for p in parts)


def normalize(text: str) -> str:
    """把書面寫法轉成 TTS 的口語念法。"""
    t = text
    t = t.replace("ISO/IEC", "ISO IEC").replace("/", "、")
    t = re.sub(r"(?<![A-Za-z])SoA(?![A-Za-z])", "S O A", t)
    t = re.sub(r"(?<![A-Za-z])AIMS(?![A-Za-z])", "A I M S", t)
    t = re.sub(r"(?<![A-Za-z])ISMS(?![A-Za-z])", "I S M S", t)
    t = re.sub(r"(?<![A-Za-z])PIMS(?![A-Za-z])", "P I M S", t)
    t = re.sub(r"(?<![A-Za-z])MLOps(?![A-Za-z])", "M L Ops", t)
    t = re.sub(r":(?=\d{4})", " ", t)  # 42001:2023 → 42001 2023
    # 附錄控制措施：A.6.2.4 → A 六點二點四
    t = re.sub(r"(?<![A-Za-z])([A-D])\.(?=\d)", r"\1 ", t)
    # 條文編號／小數：6.1.2 → 六點一點二
    t = re.sub(r"(?<![\d.])\d{1,2}(?:\.\d{1,2}){1,3}(?![\d.])", clause, t)
    # 標準編號、年份等 4–6 位數字逐字念：42001 → 四二零零一
    t = re.sub(r"(?<!\d)\d{4,6}(?!\d)", lambda m: "".join(DIG[int(c)] for c in m.group(0)), t)
    t = t.replace("～", "，").replace("…", "，")
    return t


def line_hash(sp: str, text: str) -> str:
    v = VOICES[sp]
    key = f"{v['voice']}|{v['rate']}|{v['pitch']}|{normalize(text)}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:10]


async def synth(sem, sp, text, path: Path):
    v = VOICES[sp]
    async with sem:
        for attempt in range(5):
            try:
                tmp = path.with_suffix(".tmp")
                await edge_tts.Communicate(normalize(text), v["voice"], rate=v["rate"], pitch=v["pitch"]).save(str(tmp))
                if tmp.stat().st_size < 1000:
                    raise RuntimeError("audio too small")
                tmp.rename(path)
                return
            except Exception as e:  # 網路不穩時重試
                if attempt == 4:
                    raise
                await asyncio.sleep(2 * (attempt + 1))


async def build(ch: str, sem):
    data = json.loads((SRC / f"{ch}.json").read_text(encoding="utf-8"))
    outdir = AUDIO / ch
    outdir.mkdir(parents=True, exist_ok=True)
    jobs, keep, n = [], set(), 0
    for sc in data["scenes"]:
        for key in ("lines", "after"):
            for line in sc.get(key, []) or []:
                n += 1
                name = f"{n:03d}-{line_hash(line['s'], line['t'])}.mp3"
                keep.add(name)
                p = outdir / name
                line["a"] = f"audio/{ch}/{name}"
                if not p.exists():
                    jobs.append(synth(sem, line["s"], line["t"], p))
    if jobs:
        await asyncio.gather(*jobs)
    for f in outdir.iterdir():  # 清除已不使用的舊語音
        if f.name not in keep:
            f.unlink()
    total = 0
    for sc in data["scenes"]:
        for key in ("lines", "after"):
            for line in sc.get(key, []) or []:
                size = (ROOT / "docs" / line["a"]).stat().st_size
                line["d"] = int(size * 8 * 1000 / BITRATE)
                total += line["d"]
    DATA.mkdir(parents=True, exist_ok=True)
    js = "window.VIDEO_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (DATA / f"{ch}.js").write_text(js, encoding="utf-8")
    print(f"{ch}: {n} 句，新產生 {len(jobs)} 句，長度約 {total / 60000:.1f} 分鐘")


async def main():
    chs = sys.argv[1:] or sorted(p.stem for p in SRC.glob("ch*.json"))
    sem = asyncio.Semaphore(6)
    for ch in chs:
        await build(ch, sem)


if __name__ == "__main__":
    asyncio.run(main())
