#!/usr/bin/env python3
"""產生客戶授權版（放在企業內部網站使用）。

公開版（GitHub）的 docs/assets/js/license.js 為 null，網頁不顯示任何授權資訊；
本工具會複製一份課程（網站＋內容原始檔＋建置程式），寫入該客戶的授權資訊後打包成 zip，原始專案不會被修改。

用法（在專案根目錄執行）：
  python3 tools/make_license_package.py --company "○○股份有限公司" --dept "資訊處" --no L-2026-001 \
      --start 2026-11-01 --end 2027-10-31 --domains elearning.example.com,intranet.example.com

參數：
  --company  授權公司名稱（必填）       --dept     授權單位（選填）
  --no       授權編號（預設 L-今天日期） --start/--end  授權期間（YYYY-MM-DD；不填 end = 永久）
  --domains  授權網域，逗號分隔（選填；網站放在其他網域時頁面會顯示提醒）
  --note     授權用途（預設：內部教育訓練使用）
  --pptx     一併附上講師簡報 PPTX（預設不附）
  --out      輸出資料夾（預設：專案根目錄的 dist/）

網頁顯示位置：頁首授權標籤、首頁「○○ 內部教育訓練專用」、每頁頁尾授權說明、結業證書「授權單位」與解答頁。
授權到期或網域不符時，頁面頂端會顯示紅色提醒。
"""
import argparse
import datetime
import json
import os
import re
import shutil
import tempfile
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 不放進授權版的資料夾與檔案（講師用素材、內部撰寫規格、簡報建置工具等）
EXCLUDE_DIRS = {".git", "dist", "node_modules", "__pycache__", os.path.join("slides", "assets")}
EXCLUDE_FILES = {
    "README.md", ".gitignore", os.path.join("content", "SPEC.md"),
    *(os.path.join("tools", f) for f in (
        "make_license_package.py", "build_pptx.js", "package.json", "package-lock.json",
        "crop_characters.py", "allan_sheet.jpg", "arale_sheet.jpg")),
}
EXCLUDE_PATTERNS = [r"\.pptx$", r"\.pyc$", r"\.tmp$"]

CUSTOMER_README = """# ISO/IEC 42001:2023 人工智慧管理系統線上課程（授權版）

授權公司：{company}{dept}
授權編號：{no}
授權期間：{period}
授權用途：{note}
{domains}
## 架設方式
1. **先將 zip 檔「全部解壓縮」**（在 zip 檔上按右鍵 →「全部解壓縮…」）。
   請勿直接在壓縮檔中點開 index.html，否則樣式、圖片與程式不會一起載入，畫面會變成純文字。
2. 擇一方式架設：
   - 把 **`docs` 資料夾內的全部內容** 上傳到企業內部網站的課程目錄（IIS、Nginx、Apache 或任何靜態網站空間皆可），
     以瀏覽器開啟該目錄的 `index.html`。
   - 或把整個資料夾上傳，根目錄的 `index.html` 會自動轉到 `docs/` 課程首頁。
   - 也可以直接在電腦上雙擊解壓縮後的 `docs/index.html` 使用。

- 線上文字教材：`docs/text/ch00.html` 起
- 互動影音教材：`docs/video.html`
- 課後測驗與結業證書：`docs/quiz.html`（通過分數、講師名稱與測驗結果回傳網址可在 `docs/assets/js/quiz-data.js` 設定，
  回傳方式請見 `tools/google_apps_script.gs`）

## 修改教材（選用）
- 文字教材原稿：`content/text/*.md`；修改後執行 `python3 tools/build_site.py`
- 互動影音腳本：`content/video/*.json`；修改後執行 `python3 tools/build_audio.py`（需安裝 `tools/requirements.txt`，會重新產生有修改的句子語音）

## 授權說明
本教材經授權供上述公司{note}。授權資訊記載於 `docs/assets/js/license.js`，請勿修改或移除；
未經授權，請勿轉載、複製或對外公開。授權續約或擴充請洽 Allan Lo顧問（http://www.123hi.org）。

標準條文內容依 ISO/IEC 42001:2023 整理，條文解釋以 ISO/IEC 42001:2023 英文版為唯一詮釋依據。

---
教材規劃製作：Allan Lo顧問（http://www.123hi.org）・2026 年 10 月
Copyright © 2026 Allan Lo. All rights reserved.
"""


def valid_date(s):
    if not s:
        return ""
    datetime.date.fromisoformat(s)
    return s


def main():
    ap = argparse.ArgumentParser(description="產生客戶授權版")
    ap.add_argument("--company", required=True)
    ap.add_argument("--dept", default="")
    ap.add_argument("--no", default="")
    ap.add_argument("--start", default=datetime.date.today().isoformat(), type=valid_date)
    ap.add_argument("--end", default="", type=valid_date)
    ap.add_argument("--domains", default="")
    ap.add_argument("--note", default="內部教育訓練使用")
    ap.add_argument("--pptx", action="store_true")
    ap.add_argument("--out", default=os.path.join(ROOT, "dist"))
    a = ap.parse_args()

    no = a.no or "L-" + datetime.date.today().strftime("%Y%m%d")
    lic = {"company": a.company.strip(), "dept": a.dept.strip(), "no": no, "start": a.start, "end": a.end,
           "domains": [d.strip().lower() for d in a.domains.split(",") if d.strip()], "note": a.note.strip()}
    if lic["end"] and lic["start"] and lic["end"] < lic["start"]:
        ap.error("--end 不可早於 --start")
    safe = re.sub(r'[\\/:*?"<>|\s]+', "_", lic["company"])
    name = f"ISO42001_AIMS_授權版_{safe}_{no}"
    os.makedirs(a.out, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        dst = os.path.join(td, name)

        def ignore(dirpath, names):
            rel = os.path.relpath(dirpath, ROOT)
            out = []
            for n in names:
                r = os.path.normpath(os.path.join(rel, n)) if rel != "." else n
                rp = r.replace(os.sep, "/")
                if n in EXCLUDE_DIRS or r in EXCLUDE_DIRS or r in EXCLUDE_FILES:
                    out.append(n)
                elif any(re.search(p, rp) for p in EXCLUDE_PATTERNS) and not (a.pptx and rp.endswith(".pptx")):
                    out.append(n)
            return out

        shutil.copytree(ROOT, dst, ignore=ignore)
        with open(os.path.join(dst, "docs", "assets", "js", "license.js"), "w", encoding="utf-8") as f:
            f.write("/* 授權資訊：請勿修改或移除。授權續約請洽 Allan Lo顧問（http://www.123hi.org） */\n")
            f.write("window.COURSE_LICENSE = " + json.dumps(lic, ensure_ascii=False, indent=1) + ";\n")
        period = f"{lic['start']} ～ {lic['end']}" if lic["end"] else f"{lic['start']} 起"
        with open(os.path.join(dst, "README_授權版.md"), "w", encoding="utf-8") as f:
            f.write(CUSTOMER_README.format(
                company=lic["company"], dept=("　" + lic["dept"]) if lic["dept"] else "", no=no, period=period,
                note=lic["note"], domains=("授權網域：" + "、".join(lic["domains"]) + "\n") if lic["domains"] else ""))
        zpath = os.path.join(a.out, name + ".zip")
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
            for base, _, files in os.walk(dst):
                for fn in files:
                    full = os.path.join(base, fn)
                    z.write(full, os.path.relpath(full, td))
    size = os.path.getsize(zpath) / 1e6
    print(f"已產生授權版：{zpath}（{size:.1f} MB）")
    print(f"授權公司：{lic['company']}｜編號：{no}｜期間：{period}" + (f"｜網域：{', '.join(lic['domains'])}" if lic["domains"] else ""))


if __name__ == "__main__":
    main()
