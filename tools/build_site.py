"""文字教材建置：content/text/chNN.md → docs/text/chNN.html

用法：python3 tools/build_site.py
"""
import html
import json
import re
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "content" / "text"
OUT = ROOT / "docs" / "text"


def load_chapters():
    js = (ROOT / "docs" / "assets" / "js" / "chapters.js").read_text(encoding="utf-8")
    body = js[js.index("chapters: [") + len("chapters: "): js.index("]\n};") + 1]
    body = re.sub(r"(\w+):", r'"\1":', body)
    return json.loads(body)


CALLOUTS = [
    ("💡", "allan", "../assets/img/allan.webp", "Allan 講師"),
    ("🎀", "arale", "../assets/img/arale.webp", "助教阿拉蕾"),
    ("⚠️", "warn", None, None),
    ("🔍", "audit", None, None),
]


def slug(text, used):
    s = re.sub(r"<[^>]+>", "", text)
    s = re.sub(r"[\s　]+", "-", s.strip())
    s = re.sub(r"[^\w\-.]", "", s)[:40] or "sec"
    base, i = s, 2
    while s in used:
        s = f"{base}-{i}"
        i += 1
    used.add(s)
    return s


def render(md_text):
    md_text = re.sub(r"<details>", '<details markdown="1">', md_text)
    md_text = re.sub(r"(<details markdown=\"1\">)(<summary>.*?</summary>)", r"\1\n\2\n", md_text)
    h = markdown.markdown(md_text, extensions=["tables", "fenced_code", "md_in_html", "sane_lists"])

    # 標註講師／助教／警示／稽核提示框
    def bq(m):
        inner = m.group(1)
        for icon, cls, img, name in CALLOUTS:
            if re.match(r"\s*<p>\s*<strong>\s*" + re.escape(icon), inner):
                if img:
                    inner = re.sub(r"^\s*<p>", f'<p class="who"><img class="avatar" src="{img}" alt="{name}">', inner, count=1)
                return f'<blockquote class="{cls}">{inner}</blockquote>'
        return m.group(0)

    h = re.sub(r"<blockquote>(.*?)</blockquote>", bq, h, flags=re.S)

    # h2 錨點與本章目錄
    used, toc = set(), []

    def h2(m):
        sid = slug(m.group(1), used)
        toc.append((sid, re.sub(r"<[^>]+>", "", m.group(1))))
        return f'<h2 id="{sid}">{m.group(1)}</h2>'

    h = re.sub(r"<h2>(.*?)</h2>", h2, h)
    return h, toc


PAGE = """<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{short}｜文字教材｜ISO 42001 線上課程</title>
<link rel="icon" href="../assets/img/allan.webp">
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
<header class="topbar">
  <button class="menu-btn" onclick="document.querySelector('.toc').classList.toggle('open')" aria-label="章節選單">☰ 章節</button>
  <a class="logo" href="../index.html">ISO <span>42001</span> 線上課程</a>
  <nav>
    <a href="../index.html">首頁</a>
    <a class="active" href="ch00.html">文字教材</a>
    <a href="../video.html?ch={id}">互動影音</a>
    <a href="../quiz.html">課後測驗</a>
  </nav>
</header>
<div class="reader">
  <aside class="toc" aria-label="章節選擇">{sidebar}</aside>
  <article class="doc">
    {h1}
    <div class="doc-actions">
      <a class="btn pink" href="../video.html?ch={id}">▶ 觀看本章互動影音</a>
      <button class="btn soft" id="markRead">✓ 標記本章已讀</button>
      <button class="btn soft" onclick="window.print()">🖨 列印／存 PDF</button>
    </div>
    {toc_box}
    {body}
    <div class="pager">{prev}{next}</div>
  </article>
</div>
<footer class="site">ISO/IEC 42001:2023 人工智慧管理系統線上課程｜講師 Allan・助教 阿拉蕾｜標準條文以 ISO/IEC 42001:2023 英文版為唯一詮釋依據</footer>
<script src="../assets/js/chapters.js"></script>
<script>
(function () {{
  var id = "{id}", btn = document.getElementById("markRead");
  function refresh() {{
    var p = Progress.load();
    document.querySelectorAll(".toc a[data-id]").forEach(function (a) {{
      a.classList.toggle("ok", !!(p[a.dataset.id] && p[a.dataset.id].text));
    }});
    if (p[id] && p[id].text) btn.textContent = "✓ 本章已讀完";
  }}
  btn.onclick = function () {{ Progress.mark(id, "text"); refresh(); }};
  window.addEventListener("scroll", function () {{
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 300) {{ Progress.mark(id, "text"); refresh(); }}
  }}, {{ passive: true }});
  document.querySelectorAll(".toc a").forEach(function (a) {{ a.addEventListener("click", function () {{ document.querySelector(".toc").classList.remove("open"); }}); }});
  refresh();
}})();
</script>
</body>
</html>
"""


def main():
    chapters = load_chapters()
    OUT.mkdir(parents=True, exist_ok=True)
    groups = []
    for c in chapters:
        if not groups or groups[-1][0] != c["group"]:
            groups.append((c["group"], []))
        groups[-1][1].append(c)
    built = 0
    for i, c in enumerate(chapters):
        src = SRC / f"{c['id']}.md"
        if not src.exists():
            print("缺少", src.name)
            continue
        body, toc = render(src.read_text(encoding="utf-8"))
        m = re.search(r"<h1>.*?</h1>", body, flags=re.S)
        h1 = m.group(0) if m else ""
        body = body.replace(h1, "", 1)
        side = []
        for g, cs in groups:
            side.append(f"<h4>{html.escape(g)}</h4>")
            for x in cs:
                cur = ' class="current"' if x["id"] == c["id"] else ""
                n = chapters.index(x)
                side.append(f'<a{cur} data-id="{x["id"]}" href="{x["id"]}.html">{n:02d}｜{html.escape(x["short"])}</a>')
        toc_box = ""
        if toc:
            items = "".join(f'<li><a href="#{sid}">{html.escape(t)}</a></li>' for sid, t in toc)
            toc_box = f'<details class="mini-toc" open><summary>📑 本章目錄</summary><ol>{items}</ol></details>'
        prev = next_ = "<span></span>"
        if i > 0:
            p = chapters[i - 1]
            prev = f'<a href="{p["id"]}.html"><small>← 上一章</small>{html.escape(p["short"])}</a>'
        if i + 1 < len(chapters):
            n = chapters[i + 1]
            next_ = f'<a class="next" href="{n["id"]}.html"><small>下一章 →</small>{html.escape(n["short"])}</a>'
        else:
            next_ = '<a class="next" href="../quiz.html"><small>完成全部章節 →</small>前往課後測驗</a>'
        page = PAGE.format(id=c["id"], short=html.escape(c["short"]), sidebar="\n".join(side),
                           toc_box=toc_box, body=body, h1=h1, prev=prev, next=next_)
        (OUT / f"{c['id']}.html").write_text(page, encoding="utf-8")
        built += 1
    print(f"已建置 {built} 章文字教材")


if __name__ == "__main__":
    main()
