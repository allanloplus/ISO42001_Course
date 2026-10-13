"""從角色設定圖裁切 Allan 講師與助教阿拉蕾的素材（半身、全身、表情包），並將外圍白底轉為透明。

用法：python3 tools/crop_characters.py
來源：tools/allan_sheet.jpg、tools/arale_sheet.jpg（講師提供的角色設定圖）
輸出：docs/assets/img/（網站用 webp）、slides/assets/（簡報用 png）
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "docs" / "assets" / "img"
PPT = ROOT / "slides" / "assets"

# 原圖座標 (left, top, right, bottom)
ALLAN = {
    "half": (80, 85, 768, 880),
    "full": (80, 85, 768, 1468),
    "expr": {
        "smile": (765, 795, 1022, 1120),
        "laugh": (1075, 795, 1332, 1120),
        "think": (1380, 795, 1642, 1120),
        "confused": (1636, 795, 1972, 1120),
        "surprised": (765, 1135, 1022, 1470),
        "point": (1043, 1135, 1332, 1470),
        "wink": (1383, 1135, 1642, 1470),
        "talk": (1703, 1135, 1958, 1470),
    },
}
ARALE = {
    "half": (1548, 155, 1985, 740),
    "full": (72, 805, 428, 1470),
    "expr": {
        "laugh": (440, 810, 792, 1110),
        "think": (826, 810, 1178, 1110),
        "surprised": (1214, 810, 1564, 1110),
        "confused": (1598, 810, 1950, 1110),
        "talk": (440, 1146, 792, 1446),
        "sad": (826, 1146, 1178, 1446),
        "thumbsup": (1214, 1146, 1564, 1446),
        "excited": (1598, 1146, 1950, 1446),
    },
}


def transparent(img, tol=236):
    """由四邊進行 flood fill，把與邊緣相連的白底改為透明（角色有粗黑外框，不會滲入內部）。"""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if r >= tol and g >= tol and b >= tol:
            px[x, y] = (255, 255, 255, 0)
            stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return despeckle(img)


def despeckle(img, min_px=600):
    """移除裁切邊緣殘留的小碎點（與主體不相連的小區塊）。"""
    w, h = img.size
    alpha = img.getchannel("A").load()
    px = img.load()
    seen = bytearray(w * h)
    for sy in range(h):
        for sx in range(w):
            if seen[sy * w + sx] or alpha[sx, sy] == 0:
                continue
            comp, stack = [], [(sx, sy)]
            seen[sy * w + sx] = 1
            while stack:
                x, y = stack.pop()
                comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and alpha[nx, ny] > 0:
                        seen[ny * w + nx] = 1
                        stack.append((nx, ny))
            if len(comp) < min_px:
                for x, y in comp:
                    px[x, y] = (255, 255, 255, 0)
    return img.crop(img.getbbox())


def square(img, size):
    """置中、底部對齊放進正方形透明畫布（表情包統一尺寸）。"""
    img = img.copy()
    img.thumbnail((size, size), Image.LANCZOS)
    c = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    c.paste(img, ((size - img.width) // 2, size - img.height), img)
    return c


def save(img, name, web_size=None, ppt=True):
    web = img.copy()
    if web_size:
        web.thumbnail(web_size, Image.LANCZOS)
    web.save(WEB / f"{name}.webp", quality=84, method=6)
    if ppt:
        img.save(PPT / f"{name}.png", optimize=True)


def main():
    (WEB / "expr").mkdir(parents=True, exist_ok=True)
    PPT.mkdir(parents=True, exist_ok=True)
    for who, spec, sheet in (("allan", ALLAN, "allan_sheet.jpg"), ("arale", ARALE, "arale_sheet.jpg")):
        src = Image.open(ROOT / "tools" / sheet).convert("RGB")
        half = transparent(src.crop(spec["half"]))
        full = transparent(src.crop(spec["full"]))
        save(half, who, (560, 700))
        save(full, f"{who}_full", (520, 1000))
        for name, box in spec["expr"].items():
            e = square(transparent(src.crop(box)), 360)
            e.save(WEB / "expr" / f"{who}_{name}.webp", quality=84, method=6)
            e.save(PPT / f"{who}_{name}.png", optimize=True)
        # 簡報對話框頭像：用微笑／大笑表情
        head = Image.open(PPT / f"{who}_{'smile' if who == 'allan' else 'laugh'}.png")
        bg = Image.new("RGBA", head.size, (255, 255, 255, 255))
        bg.alpha_composite(head)
        bg.convert("RGB").save(PPT / f"{who}_head.png", optimize=True)

    # 首頁主視覺：兩位角色全身並排
    a = Image.open(PPT / "allan_full.png")
    r = Image.open(PPT / "arale_full.png")
    H = 1000
    a = a.resize((int(a.width * H / a.height), H), Image.LANCZOS)
    rh = int(H * 0.78)
    r = r.resize((int(r.width * rh / r.height), rh), Image.LANCZOS)
    W = r.width + a.width + 40
    hero = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    hero.alpha_composite(r, (0, H - rh))
    hero.alpha_composite(a, (r.width + 40, 0))
    hero.thumbnail((900, 900), Image.LANCZOS)
    hero.save(WEB / "hero.webp", quality=84, method=6)
    print("done")


if __name__ == "__main__":
    main()
