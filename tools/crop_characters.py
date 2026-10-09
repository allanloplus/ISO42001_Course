"""從講師提供的插圖裁切 Allan 講師（半身）與助教阿拉蕾，產生網頁與簡報用角色圖。

用法：python3 tools/crop_characters.py <原始插圖> [輸出資料夾]
"""
import sys
from PIL import Image, ImageDraw

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "docs/assets/img"
im = Image.open(src).convert("RGB")
W, H = im.size
WHITE = (255, 255, 255)

# 兩個角色在原圖中的分界線（Allan 頭部左側輪廓）
BOUNDARY = [(452, 180), (462, 270), (466, 340), (476, 400), (488, 450), (503, 500), (510, 560), (505, 598)]

# Allan：把分界線左側（阿拉蕾帽子、臉）與筆電塗白，保留揮手的手
a = im.copy()
d = ImageDraw.Draw(a)
d.polygon([(0, 0), (452, 0)] + BOUNDARY + [(425, 598), (0, 598)], fill=WHITE)
d.rectangle((0, 598, 432, H), fill=WHITE)
allan = a.crop((420, 6, 1018, 1018))

# 阿拉蕾：把分界線右側（Allan 臉）與手、筆電塗白
b = im.copy()
d = ImageDraw.Draw(b)
d.polygon([(452, 0), (W, 0), (W, 598)] + BOUNDARY[::-1], fill=WHITE)
d.rectangle((420, 585, W, H), fill=WHITE)
arale = b.crop((96, 286, 516, 666))

for name, img, size in (("allan", allan, 560), ("arale", arale, 420)):
    img.thumbnail((size, size * 2))
    img.save(f"{out}/{name}.webp", quality=82)
    img.save(f"{out}/{name}.png", optimize=True)

im.save(f"{out}/hero.webp", quality=80)
im.save(f"{out}/hero.jpg", quality=84)
print("done")
