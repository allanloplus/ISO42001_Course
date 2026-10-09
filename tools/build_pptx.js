/* 實體課程簡報產生器：ISO/IEC 42001:2023 人工智慧管理系統（3 小時）
 *
 * 安裝：cd tools && npm install
 * 執行：node tools/build_pptx.js   → slides/ISO42001_實體課程簡報_3小時.pptx
 */
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "slides", "ISO42001_實體課程簡報_3小時.pptx");
const ASSET = f => path.join(ROOT, "slides", "assets", f);
const APPLY_THEME = process.env.PPTX_APPLY_THEME; // 選用：pptx skill 的 apply_theme.js 路徑

const THEME = {
  name: "AIMS Course",
  headFontFace: "Microsoft JhengHei",
  bodyFontFace: "Microsoft JhengHei",
  colors: {
    dk1: "1B2433", lt1: "FFFFFF", dk2: "14213D", lt2: "EEF2F8",
    accent1: "0F8B8D", accent2: "FF5C80", accent3: "E8961E", accent4: "3157D5",
    accent5: "7A5AF8", accent6: "2E9E5B", hlink: "3157D5", folHlink: "7A5AF8"
  }
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "ISO/IEC 42001:2023 人工智慧管理系統 實體課程";
pres.author = "Allan";
pres.subject = "ISO/IEC 42001 標準詳解、管理案例與稽核實務";
const C = pres.SchemeColor;
const W = 13.333, H = 7.5, MX = 0.6;

// ---------- 版面（layouts） ----------
pres.defineSlideMaster({
  title: "TITLE", background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.55, w: 7.6, h: 2.0, fontSize: 40, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 3.75, w: 7.6, h: 1.6, fontSize: 20, color: C.background2, valign: "top", align: "left", margin: 0 }, text: "" } }
  ]
});
pres.defineSlideMaster({
  title: "SECTION", background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 2.3, y: 2.55, w: 8.2, h: 1.1, fontSize: 40, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 2.3, y: 3.7, w: 8.2, h: 1.3, fontSize: 20, color: C.background2, valign: "top", align: "left", margin: 0 }, text: "" } }
  ]
});
const footer = [
  { text: { text: "ISO/IEC 42001:2023 人工智慧管理系統｜講師 Allan", options: { x: MX, y: 7.02, w: 7, h: 0.3, fontSize: 10, color: "8A93A6", margin: 0 } } }
];
pres.defineSlideMaster({
  title: "CONTENT", background: { color: C.background1 },
  slideNumber: { x: 12.2, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: "8A93A6", align: "right" },
  objects: [
    ...footer,
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.32, w: W - 2 * MX, h: 0.85, fontSize: 30, bold: true, color: C.text2, valign: "middle", margin: 0 }, text: "" } }
  ]
});
pres.defineSlideMaster({
  title: "EXERCISE", background: { color: "FFF1F4" },
  slideNumber: { x: 12.2, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: "8A93A6", align: "right" },
  objects: [
    ...footer,
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.32, w: W - 2 * MX, h: 0.85, fontSize: 30, bold: true, color: C.accent2, valign: "middle", margin: 0 }, text: "" } }
  ]
});

// ---------- 圖示 ----------
const iconCache = {};
async function icon(name, color = "FFFFFF") {
  const key = name + color;
  if (iconCache[key]) return iconCache[key];
  const Comp = Fa[name];
  if (!Comp) throw new Error("icon not found: " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return (iconCache[key] = "image/png;base64," + buf.toString("base64"));
}

// ---------- 共用元件 ----------
let section = "";
let objN = 0;
const oid = p => `${p}-${++objN}`;

function slideOf(master, title, notes) {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (title) s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
}
function startSection(title) { section = title; pres.addSection({ title }); }

function sectionSlide(no, title, sub, minutes, notes) {
  const s = slideOf("SECTION", null, notes);
  s.addText(title, { placeholder: "title" });
  s.addText(sub, { placeholder: "body" });
  s.addShape(pres.shapes.OVAL, { x: 0.75, y: 2.6, w: 1.25, h: 1.25, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: oid("section-num") });
  s.addText(String(no), { x: 0.75, y: 2.6, w: 1.25, h: 1.25, fontSize: 40, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: oid("section-num-text") });
  if (minutes) s.addText(`⏱ 建議時間 ${minutes} 分鐘`, { x: 2.3, y: 5.15, w: 6, h: 0.4, fontSize: 14, color: C.accent3, isTextBox: true, margin: 0, objectName: oid("section-time") });
  s.addImage({ path: ASSET("allan.png"), x: 10.35, y: 2.55, w: 2.3, h: 2.3 * 948 / 560, objectName: oid("allan"), altText: "Allan 講師" });
  return s;
}

// 講師／助教對話框（本簡報的視覺主軸）
function bubble(s, who, text, x, y, w, h, fs = 14) {
  fs += 2;
  const isA = who === "A";
  const color = isA ? C.accent4 : C.accent2;
  s.addImage({ path: ASSET(isA ? "allan_head.png" : "arale_head.png"), x, y: y + (h - 0.9) / 2, w: 0.9, h: 0.9, rounding: true, objectName: oid(isA ? "allan-avatar" : "arale-avatar"), altText: isA ? "Allan 講師" : "助教阿拉蕾" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 1.05, y, w: w - 1.05, h, rectRadius: 0.12, fill: { color: isA ? "EAF0FF" : "FFE8EE" }, line: { color, width: 1.25 }, objectName: oid("bubble") });
  s.addText([
    { text: (isA ? "Allan 講師：" : "阿拉蕾："), options: { bold: true, color } },
    { text, options: { color: C.text1 } }
  ], { x: x + 1.2, y, w: w - 1.35, h, fontSize: fs, valign: "middle", isTextBox: true, margin: 0, objectName: oid("bubble-text") });
}

async function cards(s, items, o) {
  const cols = o.cols || items.length;
  const rows = Math.ceil(items.length / cols);
  const gap = o.gap ?? 0.3;
  const cw = (o.w - gap * (cols - 1)) / cols;
  const ch = (o.h - gap * (rows - 1)) / rows;
  const palette = [C.accent1, C.accent4, C.accent2, C.accent3, C.accent5, C.accent6];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const x = o.x + (i % cols) * (cw + gap), y = o.y + Math.floor(i / cols) * (ch + gap);
    const col = it.color || palette[i % palette.length];
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, rectRadius: 0.1, fill: { color: o.fill || C.background2 }, line: { color: o.fill || C.background2 }, objectName: oid("card") });
    let ty = y + 0.2;
    const hasIcon = !!(it.icon || it.badge);
    if (hasIcon) {
      s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.2, w: 0.62, h: 0.62, fill: { color: col }, line: { color: col }, objectName: oid("card-icon-bg") });
      if (it.icon) s.addImage({ data: await icon(it.icon), x: x + 0.34, y: y + 0.34, w: 0.34, h: 0.34, objectName: oid("card-icon") });
      else s.addText(it.badge, { x: x + 0.2, y: y + 0.2, w: 0.62, h: 0.62, fontSize: it.badge.length > 2 ? 12 : 18, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: oid("card-badge") });
    }
    const titleX = hasIcon ? x + 0.95 : x + 0.25;
    s.addText(it.title, { x: titleX, y: y + 0.18, w: cw - (titleX - x) - 0.15, h: 0.66, fontSize: (o.titleSize || 17) + 2, bold: true, color: C.text2, valign: "middle", isTextBox: true, margin: 0, fit: "shrink", objectName: oid("card-title") });
    ty = y + 0.95;
    if (it.text) {
      const body = Array.isArray(it.text)
        ? it.text.map((t, k) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: k < it.text.length - 1, paraSpaceAfter: 3 } }))
        : it.text;
      s.addText(body, { x: x + 0.25, y: ty, w: cw - 0.45, h: y + ch - ty - 0.15, fontSize: Math.round((o.textSize || 14) * 1.22), color: C.text1, valign: "top", isTextBox: true, margin: 0, objectName: oid("card-text") });
    }
  }
}

function table(s, rows, o) {
  const fs = (o.fontSize || 13) + (o.fontSize && o.fontSize <= 12 ? 1 : 2);
  const data = rows.map((r, ri) => r.map(cell => {
    const t = typeof cell === "string" ? cell : cell.text;
    const extra = typeof cell === "string" ? {} : cell.options || {};
    return {
      text: t, options: Object.assign({
        fontSize: fs, color: ri === 0 ? C.background1 : C.text1, bold: ri === 0,
        fill: { color: ri === 0 ? C.text2 : (ri % 2 ? C.background1 : C.background2) },
        valign: "middle", margin: [0.05, 0.08, 0.05, 0.08]
      }, extra)
    };
  }));
  s.addTable(data, { x: o.x, y: o.y, w: o.w, colW: o.colW, border: { type: "solid", pt: 0.75, color: "D5DCE8" }, rowH: o.rowH, autoPage: false, objectName: oid("table") });
}

function flow(s, steps, o) {
  const n = steps.length, gap = o.gap ?? 0.28;
  const bw = (o.w - gap * (n - 1)) / n;
  const palette = o.colors || [C.accent4, C.accent1, C.accent6, C.accent3, C.accent2, C.accent5, C.accent4, C.accent1];
  steps.forEach((st, i) => {
    const x = o.x + i * (bw + gap);
    const col = palette[i % palette.length];
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: o.y, w: bw, h: 0.62, rectRadius: 0.08, fill: { color: col }, line: { color: col }, objectName: oid("flow-head") });
    s.addText(st.head, { x, y: o.y, w: bw, h: 0.62, fontSize: (o.headSize || 15) + 1, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0.04, fit: "shrink", objectName: oid("flow-head-text") });
    if (st.body) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: o.y + 0.72, w: bw, h: o.h - 0.72, rectRadius: 0.08, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: oid("flow-body") });
      s.addText(st.body, { x: x + 0.12, y: o.y + 0.82, w: bw - 0.24, h: o.h - 0.92, fontSize: Math.round((o.bodySize || 13) * 1.2), color: C.text1, valign: "top", isTextBox: true, margin: 0, objectName: oid("flow-body-text") });
    }
    if (i < n - 1) s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: x + bw + gap * 0.25, y: o.y + 0.2, w: gap * 0.5, h: 0.22, rotate: 90, fill: { color: "9AA6BC" }, line: { color: "9AA6BC" }, objectName: oid("flow-arrow") });
  });
}

function bullets(s, items, o) {
  const runs = items.map((t, i) => {
    if (Array.isArray(t)) return { text: t[0], options: { bullet: { indent: 18 }, indentLevel: 1, fontSize: (o.fontSize || 18) - 2, breakLine: i < items.length - 1, paraSpaceAfter: 4, color: "4A556B" } };
    return { text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1, paraSpaceAfter: 8 } };
  });
  s.addText(runs, { x: o.x, y: o.y, w: o.w, h: o.h, fontSize: o.fontSize || 18, color: C.text1, valign: "top", isTextBox: true, margin: 0, objectName: oid("bullets") });
}

function tag(s, text, x, y, w, color) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.42, rectRadius: 0.2, fill: { color: color || C.accent1 }, line: { color: color || C.accent1 }, objectName: oid("tag") });
  s.addText(text, { x, y, w, h: 0.42, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: oid("tag-text") });
}

function stat(s, num, label, x, y, w, color) {
  s.addText(num, { x, y, w, h: 1.0, fontSize: 54, bold: true, color: color || C.accent1, align: "center", valign: "bottom", isTextBox: true, margin: 0, objectName: oid("stat-num") });
  s.addText(label, { x, y: y + 1.05, w, h: 0.6, fontSize: 14, color: "4A556B", align: "center", valign: "top", isTextBox: true, margin: 0, objectName: oid("stat-label") });
}

const N = (time, main, ask) => `【建議時間】${time}\n【講述重點】\n${main}${ask ? "\n【互動／阿拉蕾串場】\n" + ask : ""}`;

// ================= 投影片內容 =================
async function build() {
  // ---------- 開場 ----------
  startSection("開場");
  {
    const s = slideOf("TITLE", null, N("2 分鐘", "歡迎學員，自我介紹前先用一句話破題：「AI 已經在你公司裡了，只是你可能還沒管它。」說明今天 3 小時的課程會從標準條文、管理案例一路走到稽核現場。", "請學員舉手：公司有在用 ChatGPT、Copilot 或任何 AI 工具的請舉手——通常幾乎全場都會舉手，順勢帶出今天主題。"));
    s.addText("ISO/IEC 42001:2023\n人工智慧管理系統", { placeholder: "title" });
    s.addText("標準詳解 × 管理案例 × 稽核實務\n講師 Allan｜助教 阿拉蕾", { placeholder: "body" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.75, y: 0.75, w: 4.0, h: 6.0, rectRadius: 0.2, fill: { color: C.background1 }, line: { color: C.background1 }, objectName: oid("hero-frame") });
    s.addImage({ path: ASSET("allan.png"), x: 9.85, y: 1.0, w: 2.75, h: 2.75 * 948 / 560, objectName: oid("hero-allan"), altText: "Allan 講師" });
    s.addImage({ path: ASSET("arale.png"), x: 8.85, y: 4.35, w: 2.2, h: 2.2 * 380 / 420, objectName: oid("hero-arale"), altText: "助教阿拉蕾" });
    tag(s, "實體課程 3 小時", 0.7, 5.75, 2.4, C.accent2);
    tag(s, "含線上影音與課後測驗", 3.3, 5.75, 3.0, C.accent1);
  }
  {
    const s = slideOf("CONTENT", "今天的講師與助教", N("3 分鐘", "介紹講師背景：長期擔任 ISMS／PIMS 輔導顧問並兼任驗證機構稽核員，看過很多組織從 27001 走到 27701、現在走到 42001。說明助教阿拉蕾會在簡報中以對話框出現，代表學員心中的疑問。", "阿拉蕾：「老師，我只聽得懂 AI，聽不懂 ISO 怎麼辦？」——回答：今天就是要把條文翻成人話。"));
    s.addImage({ path: ASSET("allan.png"), x: 0.9, y: 1.45, w: 2.6, h: 2.6 * 948 / 560, objectName: oid("allan-full"), altText: "Allan 講師" });
    await cards(s, [
      { icon: "FaUserTie", title: "Allan 講師", text: ["資深 ISMS／PIMS 輔導顧問", "驗證機構稽核員（第三方稽核）", "專長：資訊安全、企業 MIS 管理", "口頭禪：「證據呢？」"] },
      { icon: "FaSmile", title: "助教 阿拉蕾", color: C.accent2, text: ["元氣滿滿的好奇寶寶", "幫大家問出「不敢問的笨問題」", "負責比喻、吐槽、整理重點", "招呼語：「んちゃ～」"] }
    ], { x: 4.0, y: 1.5, w: 8.7, h: 3.0, cols: 2 });
    s.addImage({ path: ASSET("arale.png"), x: 4.05, y: 4.8, w: 1.95, h: 1.95 * 380 / 420, objectName: oid("arale-full"), altText: "助教阿拉蕾" });
    bubble(s, "R", "老師～我只懂 AI、不懂 ISO，今天跟得上嗎？", 6.25, 5.05, 6.45, 0.95, 15);
  }
  {
    const s = slideOf("CONTENT", "課程目標與議程（3 小時）", N("3 分鐘", "說明三大目標：看懂條文、會做（案例）、能稽核。對照議程說明時間配置，中間休息 10 分鐘。告知課後有線上文字教材與互動影音，內容比簡報更完整，並有 10 題測驗、80 分通過可下載結業證書。"));
    table(s, [
      ["時段", "單元", "重點"],
      ["0:00–0:10", "開場", "課程目標、學員現況調查"],
      ["0:10–0:25", "一、AI 治理趨勢", "AI 新風險、法規（EU AI Act、台灣 AI 基本法）、標準家族"],
      ["0:25–0:40", "二、標準架構與用語", "HS 調和結構、42001 vs 27001、關鍵用語"],
      ["0:40–1:00", "三、條文 4–5", "組織全景、AI 角色、範圍、領導與 AI 政策"],
      ["1:00–1:30", "四、條文 6", "AI 風險評鑑／處理、SoA、AI 系統衝擊評鑑、目標"],
      ["1:30–1:40", "休息", "☕"],
      ["1:40–2:00", "五、條文 7–10", "支援、運作、績效評估、改善"],
      ["2:00–2:25", "六、附錄 A／B 與整合", "38 項控制措施、與 27001／27701／9001 整合"],
      ["2:25–2:35", "七、管理案例", "產業案例與分組討論"],
      ["2:35–2:55", "八、稽核實務", "驗證流程、42006、常見不符合事項"],
      ["2:55–3:00", "總結", "十大金句、課後學習與測驗"]
    ], { x: MX, y: 1.4, w: 8.4, colW: [1.35, 2.35, 4.7], fontSize: 13, rowH: 0.42 });
    await cards(s, [
      { icon: "FaBook", title: "看懂條文", text: "條文 4–10、附錄 A 38 項控制措施" },
      { icon: "FaTools", title: "會做", text: "風險評鑑、衝擊評鑑、SoA 與文件" },
      { icon: "FaSearch", title: "能稽核", text: "稽核提問、證據、不符合寫法" }
    ], { x: 9.35, y: 1.4, w: 3.4, h: 5.2, cols: 1, gap: 0.25, textSize: 14 });
  }
  {
    const s = slideOf("EXERCISE", "暖身：你的公司用了哪些 AI？", N("2 分鐘", "請學員在 1 分鐘內寫下公司正在使用或開發的 AI，並分類。目的：讓學員意識到「AI 系統清冊」是導入 42001 的第一步，而且自己公司很可能低估了 AI 使用量（影子 AI）。", "邀請 2–3 位學員分享，阿拉蕾：「我們公司連會議紀錄都是 AI 寫的耶！那也算嗎？」——算，那是 AI 使用者角色。"));
    await cards(s, [
      { icon: "FaComments", title: "生成式 AI 工具", text: ["ChatGPT、Copilot、Gemini", "會議摘要、翻譯、寫程式"] },
      { icon: "FaCogs", title: "內建 AI 的系統", text: ["CRM 的商機預測", "資安設備的異常偵測", "ERP 的需求預測"] },
      { icon: "FaRobot", title: "自行開發的 AI", text: ["客服機器人、推薦系統", "瑕疵檢測、信用評分"] },
      { icon: "FaCloud", title: "提供給客戶的 AI", text: ["AI SaaS 服務", "嵌入 AI 的產品"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.4, cols: 4 });
    bubble(s, "A", "先盤點，才知道要管什麼。導入 42001 的第一份文件，往往就是「AI 系統清冊」。", MX, 5.25, 7.4, 1.0, 15);
    bubble(s, "R", "那「偷偷用」的影子 AI 也要算進去嗎？", 8.3, 5.25, 4.4, 1.0, 15);
  }

  // ---------- 一、AI 治理趨勢 ----------
  startSection("一、AI 治理趨勢");
  sectionSlide(1, "AI 治理趨勢", "為什麼需要 ISO/IEC 42001？", 15, N("0.5 分鐘", "進入第一單元。"));
  {
    const s = slideOf("CONTENT", "AI 帶來傳統 IT 管理沒有的三種新風險", N("3 分鐘", "引用標準「介紹」：(1) 自動決策可能不透明、無法解釋；(2) 以資料與機器學習取代人寫的邏輯，改變系統開發、論證與部署方式；(3) 持續學習的系統會在使用中改變行為。因此組織應把要求事項的重點放在 AI 獨有的特性上，而不是重做一套 IT 管理。", "阿拉蕾：「所以 AI 會自己變心？」——對，模型漂移就是 AI 的「變心」，要靠監控抓出來。"));
    await cards(s, [
      { icon: "FaEyeSlash", title: "不透明、難解釋", text: "自動決策有時以不透明、無法解釋的方式進行，需要超越傳統 IT 系統的管理。" },
      { icon: "FaDatabase", title: "資料驅動", text: "用資料分析與機器學習取代人寫的邏輯，改變系統的開發、論證與部署方式。" },
      { icon: "FaSync", title: "持續學習會改變行為", text: "持續學習的 AI 在使用中改變行為，需特別考量才能確保持續負責任地使用。" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.3, cols: 3, textSize: 15 });
    bubble(s, "A", "42001 不是重做一套 IT 管理，而是把力氣放在「AI 獨有的特性」上——這是標準介紹裡講得很清楚的。", MX, 5.15, W - 2 * MX, 1.0, 15);
  }
  {
    const s = slideOf("CONTENT", "三個警示事件：AI 出事，誰負責？", N("4 分鐘", "三個公開事件：\n1. 2018 年報導 Amazon 實驗性 AI 履歷篩選工具對女性求職者產生偏差而停用 → 資料偏差、衝擊評鑑。\n2. 2023 年 Samsung 員工將機密原始碼貼入 ChatGPT，公司其後限制生成式 AI 使用 → AI 使用政策、認知訓練。\n3. 2024 年 Moffatt v. Air Canada，客服聊天機器人提供錯誤退款政策，法庭判航空公司須負責 → 組織要對 AI 輸出負責、使用者資訊與人為監管。\n只講公開報導的事實，勿延伸細節。", "問學員：這三件事分別對應到 42001 的哪個控制措施？（A.5／A.7、A.2／A.9、A.8／A.9）"));
    await cards(s, [
      { icon: "FaUserCheck", title: "2018｜AI 履歷篩選偏差", text: ["報導：Amazon 實驗性工具對女性求職者產生偏差而停用", "對應：A.7.4 資料品質、A.5 衝擊評鑑"] },
      { icon: "FaUserSecret", title: "2023｜機密貼進 ChatGPT", text: ["Samsung 員工貼入機密原始碼，公司限制生成式 AI", "對應：A.2 AI 政策、A.9 負責任使用、7.3 認知"] },
      { icon: "FaGavel", title: "2024｜聊天機器人亂答", text: ["Air Canada 客服機器人給錯退款政策，法庭判公司負責", "對應：A.8.2 使用者資訊、A.9.3 人為監管"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.5, cols: 3, textSize: 14 });
    bubble(s, "R", "原來「是 AI 說的，不是我說的」這招行不通喔！", MX, 5.3, 7.0, 0.95, 15);
  }
  {
    const s = slideOf("CONTENT", "全球 AI 治理框架比較", N("3 分鐘", "比較四個框架的性質：EU AI Act 是具罰則的法規（風險分級）；台灣《人工智慧基本法》是原則性立法（2025-12-23 三讀、2026-01-14 公布施行，國科會為主管機關，數位部訂風險分類框架）；NIST AI RMF 是自願性框架；ISO/IEC 42001 是可驗證的管理系統標準。重點：42001 可以當成落實法規與框架的「管理骨架」。"));
    table(s, [
      ["", "EU AI Act", "台灣 AI 基本法", "NIST AI RMF 1.0", "ISO/IEC 42001"],
      ["性質", "歐盟法規（有罰則）", "原則性立法", "自願性框架", "可驗證的管理系統標準"],
      ["時間", "2024-08-01 生效，分階段適用", "2025-12-23 三讀\n2026-01-14 公布施行", "2023-01 發布", "2023-12 發布"],
      ["核心", "風險分級：禁止、高風險、透明義務、最低風險", "七大原則；數位部訂風險分類框架", "Govern、Map、Measure、Manage", "PDCA 管理系統 + 附錄 A 38 項控制措施"],
      ["對企業的意義", "進入歐盟市場須符合", "各目的事業主管機關將訂管理規範", "風險管理方法參考", "第三方驗證，展現當責證據"]
    ], { x: MX, y: 1.45, w: W - 2 * MX, colW: [1.6, 2.75, 2.75, 2.25, 2.78], fontSize: 13, rowH: [0.45, 0.6, 0.8, 0.95, 0.8] });
    bubble(s, "A", "法規告訴你「要做到什麼」，42001 給你「怎麼管起來、怎麼證明」的骨架。", MX, 5.65, W - 2 * MX, 0.85, 15);
  }
  {
    const s = slideOf("CONTENT", "EU AI Act 時程與台灣 AI 基本法重點", N("3 分鐘", "EU AI Act：2024-08-01 生效；2025-02-02 禁止性規定適用；2025-08-02 通用目的 AI（GPAI）義務適用；2026 年「Digital Omnibus on AI」修法延後高風險義務——附件 III 獨立高風險系統 2027-12-02、附件 I 產品內嵌 AI 2028-08-02。\n台灣 AI 基本法七大原則：永續發展與福祉、人類自主、隱私保護與資料治理、資安與安全、透明與可解釋、公平與不歧視、問責。", "阿拉蕾：「延後了，那我們是不是可以先放著？」——不行，延後的是罰則適用時間，準備工作（清冊、評鑑、文件）至少要一年以上。"));
    flow(s, [
      { head: "2024-08-01", body: "EU AI Act 生效" },
      { head: "2025-02-02", body: "禁止性規定適用" },
      { head: "2025-08-02", body: "通用目的 AI（GPAI）義務適用" },
      { head: "2027-12-02", body: "附件 III 高風險系統適用（Digital Omnibus 延後）" },
      { head: "2028-08-02", body: "附件 I 產品內嵌 AI 適用" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 1.9, headSize: 15, bodySize: 14 });
    s.addText("台灣《人工智慧基本法》七大原則", { x: MX, y: 3.65, w: 8, h: 0.45, fontSize: 18, bold: true, color: C.text2, isTextBox: true, margin: 0, objectName: oid("h") });
    const pr = ["永續發展與福祉", "人類自主", "隱私保護與資料治理", "資安與安全", "透明與可解釋", "公平與不歧視", "問責"];
    pr.forEach((t, i) => tag(s, t, MX + (i % 4) * 3.05, 4.25 + Math.floor(i / 4) * 0.6, 2.85, [C.accent1, C.accent4, C.accent6, C.accent3, C.accent5, C.accent2, C.text2][i]));
    bubble(s, "A", "延後的是適用日期，不是義務本身。現在開始準備剛剛好。", MX, 5.65, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "ISO AI 標準家族地圖", N("2 分鐘", "42001 是唯一可驗證的要求標準；22989 是引用標準（術語）；23894 是 AI 風險管理指引；42005（2025-05）是 AI 系統衝擊評鑑指引；42006（2025-07）是對驗證機構的要求（補充 17021-1）；38507 是治理；5338 生命週期；5259 系列資料品質。"));
    await cards(s, [
      { badge: "要求", title: "ISO/IEC 42001", text: "AI 管理系統要求（可驗證）", color: C.accent2 },
      { badge: "術語", title: "ISO/IEC 22989", text: "AI 概念與術語（引用標準）" },
      { badge: "風險", title: "ISO/IEC 23894", text: "AI 風險管理指引" },
      { badge: "衝擊", title: "ISO/IEC 42005", text: "AI 系統衝擊評鑑（2025）" },
      { badge: "驗證", title: "ISO/IEC 42006", text: "AIMS 驗證機構要求（2025）" },
      { badge: "治理", title: "ISO/IEC 38507", text: "AI 對組織治理的影響" },
      { badge: "週期", title: "ISO/IEC 5338", text: "AI 系統生命週期流程" },
      { badge: "資料", title: "ISO/IEC 5259 系列", text: "分析與機器學習資料品質" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 4.0, cols: 4, gap: 0.25, titleSize: 16, textSize: 14 });
    bubble(s, "R", "只有 42001 可以拿證書，其他都是「參考書」對吧？", MX, 5.75, 7.2, 0.8, 15);
  }

  // ---------- 二、標準架構 ----------
  startSection("二、標準架構與用語");
  sectionSlide(2, "標準架構與用語", "條文 1–3、HS 調和結構、42001 vs 27001", 15, N("0.5 分鐘", "進入第二單元。"));
  {
    const s = slideOf("CONTENT", "ISO/IEC 42001 全貌：條文 1–10 + 附錄 A–D", N("3 分鐘", "條文 1–3 為範圍、引用標準、用語；條文 4–10 為要求事項（應）；附錄 A（規範性）控制目標與控制措施、附錄 B（規範性）實作指引；附錄 C、D 為資訊性。強調附錄 B 雖為規範性，但組織不需在 SoA 記錄實作指引的納入或排除。"));
    flow(s, [
      { head: "4 組織全景", body: "議題、關注方、範圍、AI 角色" },
      { head: "5 領導作為", body: "承諾、AI 政策、角色權責" },
      { head: "6 規劃", body: "風險評鑑、處理、SoA、衝擊評鑑、目標" },
      { head: "7 支援", body: "資源、能力、認知、溝通、文件" },
      { head: "8 運作", body: "依規劃執行評鑑與處理" },
      { head: "9 績效評估", body: "監督量測、內稽、管審" },
      { head: "10 改善", body: "持續改善、矯正措施" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.0, headSize: 14, bodySize: 13, gap: 0.2 });
    await cards(s, [
      { badge: "A", title: "附錄 A（規範性）", text: "參考控制目標與控制措施：9 領域、38 項" },
      { badge: "B", title: "附錄 B（規範性）", text: "控制措施實作指引（不需在 SoA 說明納入／排除）" },
      { badge: "C", title: "附錄 C（資訊性）", text: "潛在 AI 組織目標與風險來源" },
      { badge: "D", title: "附錄 D（資訊性）", text: "各領域應用、與其他管理系統整合" }
    ], { x: MX, y: 3.75, w: W - 2 * MX, h: 2.0, cols: 4, gap: 0.25, titleSize: 16, textSize: 14 });
    bubble(s, "A", "條文 4–10 是「應」做的骨架，附錄 A 是依風險挑選的「工具箱」。", MX, 5.95, W - 2 * MX, 0.75, 15);
  }
  {
    const s = slideOf("CONTENT", "與 ISO/IEC 27001 的比較：同骨架、不同重點", N("3 分鐘", "兩者都採用 HS 調和結構，因此政策、內稽、管審、文管可直接整合。差異：42001 多了 6.1.4 AI 系統衝擊評鑑（對個人、群體、社會）、AI 角色決定、AI 生命週期與資料控制；SoA 文字上未明文要求寫實施狀態（27001 有）；6.1.2 未明文要求識別風險擁有者（27001 有）——但實務上建議仍記錄。"));
    table(s, [
      ["比較項目", "ISO/IEC 27001:2022", "ISO/IEC 42001:2023"],
      ["管理對象", "資訊安全（機密性、完整性、可用性）", "AI 系統的負責任開發、提供與使用"],
      ["架構", "HS 調和結構，條文 4–10", "HS 調和結構，條文 4–10"],
      ["附錄 A", "93 項控制措施、4 大主題", "38 項控制措施、9 個領域"],
      ["特有要求", "資訊安全風險評鑑", "AI 風險評鑑 + 6.1.4 AI 系統衝擊評鑑"],
      ["評估對象", "以組織資訊資產為中心", "組織、個人或群體、社會"],
      ["SoA", "含實施狀態", "必要控制措施 + 納入／排除理由"]
    ], { x: MX, y: 1.45, w: 8.2, colW: [1.7, 3.15, 3.35], fontSize: 13, rowH: 0.55 });
    await cards(s, [
      { icon: "FaRecycle", title: "可直接整合", text: ["政策架構、文件管制", "內部稽核、管理審查", "矯正措施流程"] },
      { icon: "FaStar", title: "42001 特有", text: ["AI 角色判定", "衝擊評鑑", "AI 生命週期與資料"] }
    ], { x: 9.1, y: 1.45, w: 3.63, h: 4.4, cols: 1, gap: 0.25 });
  }
  {
    const s = slideOf("CONTENT", "一定要會的 6 個關鍵用語（條文 3）", N("3 分鐘", "條文 3 共 26 個用語。挑 6 個最常考、最常被誤解的：3.2 關注方、3.7 風險（不確定性之影響，可正可負）、3.21 控制措施（維持和／或修改風險）、3.22 治理機構、3.24 AI 系統衝擊評鑑、3.26 適用性聲明。另提 3.25 資料品質。"));
    await cards(s, [
      { badge: "3.2", title: "關注方", text: "可影響、受影響，或知覺本身將受決策或活動影響之個人或組織" },
      { badge: "3.7", title: "風險", text: "不確定性之影響；影響可為正向或負向偏離" },
      { badge: "3.21", title: "控制措施", text: "維持和／或修改風險的措施；未必都發揮預期效果" },
      { badge: "3.22", title: "治理機構", text: "負責組織之績效及符合性之個人或群體（如董事會）" },
      { badge: "3.24", title: "AI 系統衝擊評鑑", text: "正式且文件化的流程，識別、評估並處理對個人、群體或社會的衝擊" },
      { badge: "3.26", title: "適用性聲明", text: "記錄所有必要控制措施及其納入或排除理由的文件" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 4.3, cols: 3, gap: 0.25, titleSize: 16, textSize: 14 });
    bubble(s, "R", "「關注方」就是英文的 interested party，跟 27001 一樣對吧！", MX, 5.95, 7.3, 0.75, 15);
  }
  {
    const s = slideOf("CONTENT", "「應」「宜」「可」：稽核判定的分水嶺", N("2 分鐘", "條文本文的「應（shall）」是要求事項，未做到即可能開立不符合；附錄 B 實作指引多用「宜（should）」，是建議；「可（may/can）」表示允許或可能性。但注意：組織若在 SoA 選了某控制措施，附錄 A 的控制措施文字（應）就成為組織要落實的承諾。", "阿拉蕾：「那附錄 B 寫的我都可以不理？」——可以不照抄，但你要說得出自己的做法如何達成控制目標。"));
    await cards(s, [
      { badge: "應", title: "shall｜要求", text: ["條文 4–10、附錄 A 控制措施", "未做到 → 可能開立不符合"], color: C.accent2 },
      { badge: "宜", title: "should｜建議", text: ["附錄 B 實作指引", "可調整，但要能達成控制目標"], color: C.accent3 },
      { badge: "可", title: "may / can｜允許、可能", text: ["提供選擇或說明可能性", "依組織情境決定"], color: C.accent1 }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.2, cols: 3 });
    bubble(s, "A", "稽核員不會因為你沒照抄附錄 B 開缺失，但會問：你的控制措施怎麼證明有效？", MX, 5.0, W - 2 * MX, 0.9, 15);
  }

  // ---------- 三、條文 4–5 ----------
  startSection("三、條文 4–5");
  sectionSlide(3, "條文 4–5：組織全景與領導", "先弄清楚自己是誰、在哪裡，再談老闆怎麼帶", 20, N("0.5 分鐘", "進入第三單元。"));
  {
    const s = slideOf("CONTENT", "4.1 理解組織及其全景", N("3 分鐘", "4.1 三件「應」做的事：(1) 決定內外部議題；(2) 決定氣候變遷是否為相關議題（2024 年 Amd 1 增修）；(3) 考慮 AI 系統的預期用途並決定組織在 AI 系統中的角色。備考 2 列出外部（法律、監管政策、激勵與後果、文化倫理、競爭）與內部（治理、契約義務、預期用途）考量。"));
    await cards(s, [
      { icon: "FaGlobeAsia", title: "外部議題", text: ["適用法律（含禁止 AI 的規定）", "監管政策、指引與決策", "文化、價值觀與倫理", "競爭格局與趨勢"] },
      { icon: "FaBuilding", title: "內部議題", text: ["組織治理、目標、政策程序", "契約義務", "預計開發或使用 AI 的預期用途"] },
      { icon: "FaLeaf", title: "氣候變遷", text: ["應「決定」是否為相關議題", "AI 運算耗能、碳排", "要有判定紀錄，不可空白"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.4, cols: 3 });
    bubble(s, "A", "稽核現場常見：議題清單有了，但「氣候變遷是否相關」沒有任何決定紀錄——這就是缺口。", MX, 5.2, W - 2 * MX, 0.95, 15);
  }
  {
    const s = slideOf("CONTENT", "決定你的 AI 角色：角色決定適用的要求", N("3 分鐘", "4.1 備考 1 列出角色：AI 提供者（含平台、產品或服務提供者）、AI 製造者（開發者、設計師、營運者、測試評鑑員、部署者等）、AI 客戶（含使用者）、AI 合作夥伴（系統整合商、資料提供者）、AI 主體（資料主體等）、相關當局。備考 3：處理 PII 時也要判定 PII 控制者或處理者。同一組織可同時有多個角色，且依 AI 系統不同而不同。", "問學員：只用 Copilot 的公司是什麼角色？（AI 客戶／使用者）賣 AI SaaS 的呢？（提供者 + 製造者）"));
    await cards(s, [
      { icon: "FaStore", title: "AI 提供者", text: "平台、產品或服務提供者" },
      { icon: "FaCode", title: "AI 製造者", text: "開發、設計、營運、測試、部署" },
      { icon: "FaUsers", title: "AI 客戶", text: "含 AI 使用者" },
      { icon: "FaHandshake", title: "AI 合作夥伴", text: "系統整合商、資料提供者" },
      { icon: "FaUser", title: "AI 主體", text: "資料主體與其他受影響者" },
      { icon: "FaLandmark", title: "相關當局", text: "政策制定者、監管機構" }
    ], { x: MX, y: 1.45, w: 8.3, h: 4.3, cols: 3, gap: 0.22, titleSize: 16, textSize: 14 });
    bubble(s, "R", "所以同一家公司，對 A 系統是提供者、對 B 系統是使用者？", 9.15, 1.6, 3.58, 1.9, 14);
    bubble(s, "A", "沒錯！角色要「逐一 AI 系統」判定，並寫進 AI 系統清冊。", 9.15, 3.75, 3.58, 1.9, 14);
  }
  {
    const s = slideOf("CONTENT", "4.2 關注方與 4.3 範圍界定", N("3 分鐘", "4.2：決定關注方、其相關要求、以及哪些要透過 AIMS 解決（第三點常被漏掉）。4.3：考量 4.1、4.2 決定範圍並以文件化資訊提供。範圍要寫清楚 AI 系統、角色、組織單位與地點。舉樂購電商範例。"));
    table(s, [
      ["關注方", "需要與期望", "透過 AIMS 處理？"],
      ["消費者", "知道在跟 AI 對話、答案正確、可轉真人", "是：A.8.2、A.9.3"],
      ["主管機關", "個資保護、消費者保護", "是：法規要求登錄"],
      ["AI 供應商", "合約與使用條款遵循", "是：A.10.3"],
      ["員工", "清楚的 AI 使用守則", "是：7.3、A.9.2"]
    ], { x: MX, y: 1.45, w: 6.6, colW: [1.4, 3.1, 2.1], fontSize: 13, rowH: 0.55 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.5, y: 1.45, w: 5.23, h: 3.0, rectRadius: 0.1, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: oid("scope-box") });
    s.addText([
      { text: "範圍聲明範例（虛擬案例）", options: { bold: true, color: C.accent1, breakLine: true } },
      { text: "樂購電商股份有限公司「生成式 AI 客服系統」之設計、開發、提供與維運，涵蓋台北總部電商事業部、資訊部及客服中心；組織角色為 AI 提供者與 AI 製造者，並為所使用外部大型語言模型服務之 AI 客戶。", options: { color: C.text1 } }
    ], { x: 7.75, y: 1.6, w: 4.8, h: 2.75, fontSize: 14, valign: "top", isTextBox: true, margin: 0, objectName: oid("scope-text") });
    bubble(s, "A", "範圍寫「全公司 AI」通常太空泛；寫清楚哪些 AI 系統、哪些角色、哪些單位，稽核才有邊界。", 7.5, 4.7, 5.23, 1.5, 14);
  }
  {
    const s = slideOf("CONTENT", "5.1 領導及承諾：老闆要「做」，不是只「簽」", N("3 分鐘", "5.1 列出最高管理階層展現領導的方式：確保 AI 政策與目標與策略相容、整合入營運流程、資源可取得、傳達重要性、確保達成預期結果、指揮支援人員、宣導持續改善、支持其他管理角色。備考 2：建立負責任使用、開發與管理 AI 的文化。稽核時會訪談高階主管，看他能否說出 AI 政策重點與目標。"));
    table(s, [
      ["5.1 要求", "稽核員會看的證據"],
      ["AI 政策與目標和策略方向相容", "董事會／經營會議紀錄、策略文件"],
      ["整合入組織營運流程", "採購、專案、變更流程中的 AI 檢核點"],
      ["確保資源可取得", "預算、人力配置、工具採購紀錄"],
      ["傳達有效 AI 管理的重要性", "主管公告、訓練開場致詞、內部通訊"],
      ["指揮及支援人員、宣導持續改善", "管理審查決議與追蹤"]
    ], { x: MX, y: 1.45, w: 7.8, colW: [3.5, 4.3], fontSize: 14, rowH: 0.6 });
    bubble(s, "R", "老闆很忙耶，稽核員真的會去問老闆嗎？", 8.7, 1.5, 4.03, 1.5, 14);
    bubble(s, "A", "會！我通常第一場就訪談高階主管：「公司的 AI 政策你最在意哪一條？」", 8.7, 3.2, 4.03, 1.9, 14);
  }
  {
    const s = slideOf("CONTENT", "5.2 AI 政策 + A.2：一份好政策的骨架", N("3 分鐘", "5.2 要求 AI 政策：適合組織目的、提供設定 AI 目標的框架、承諾滿足適用要求、承諾持續改善；並以文件化資訊提供、參考其他政策、在組織內傳達、適切時提供予關注方。A.2.2–A.2.4 再加上：制定文件化 AI 政策、與其他政策一致、定期審查。B.2.2 建議涵蓋原則、偏離與例外處理流程。"));
    await cards(s, [
      { badge: "5.2", title: "條文要求", text: ["適合組織目的", "提供設定 AI 目標的框架", "承諾滿足適用要求", "承諾持續改善"] },
      { badge: "A.2", title: "控制措施", text: ["A.2.2 文件化 AI 政策", "A.2.3 與其他政策一致", "A.2.4 定期審查"] },
      { badge: "B.2", title: "實作建議", text: ["指導所有 AI 活動的原則", "政策偏離與例外處理流程", "涵蓋資源、衝擊評鑑、開發等主題"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.4, cols: 3 });
    bubble(s, "A", "常見缺失：AI 政策寫得很漂亮，卻沒說明跟資安政策、個資政策怎麼銜接（A.2.3）。", MX, 5.2, W - 2 * MX, 0.95, 15);
  }
  {
    const s = slideOf("CONTENT", "5.3 角色、責任及權限：AI 治理組織", N("3 分鐘", "5.3 要求指派責任與權限：確保 AIMS 符合標準、向最高管理階層報告 AIMS 績效。A.3.2 / B.3.2 列出可能需定義角色的領域：風險管理、衝擊評鑑、資產資源、資安、安全、隱私、開發、績效、人為監管、供應商關係、法遵、資料品質。RACI 每項活動只能有一個 A。"));
    flow(s, [
      { head: "董事會／治理機構", body: "核定 AI 政策方向、監督" },
      { head: "AI 治理委員會", body: "最高管理階層主持；核准風險處理計畫與剩餘風險" },
      { head: "AIMS 管理代表", body: "推動 AIMS、彙整績效向上報告（5.3 b）" },
      { head: "AI 系統負責人", body: "各 AI 系統之風險、衝擊評鑑與運作" },
      { head: "跨職能成員", body: "資安、法遵、個資、資料、人為監管" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.6, headSize: 14, bodySize: 14 });
    table(s, [
      ["活動", "治理委員會", "管理代表", "AI 系統負責人", "法遵／個資"],
      ["AI 風險處理計畫核准", "A", "C", "R", "C"],
      ["AI 系統衝擊評鑑", "I", "C", "A／R", "C"],
      ["AI 關注事項通報（A.3.3）", "I", "A", "R", "R"]
    ], { x: MX, y: 4.35, w: W - 2 * MX, colW: [3.9, 2.0, 2.0, 2.0, 2.23], fontSize: 13, rowH: 0.45 });
  }

  // ---------- 四、條文 6 ----------
  startSection("四、條文 6 規劃");
  sectionSlide(4, "條文 6：規劃", "AI 風險評鑑、風險處理、SoA、AI 系統衝擊評鑑與目標", 30, N("0.5 分鐘", "進入本課程最核心的單元。"));
  {
    const s = slideOf("CONTENT", "6.1.1 先訂「AI 風險準則」", N("3 分鐘", "6.1.1 要求建立並維持支持四件事的 AI 風險準則：區分可接受與不可接受的風險、執行 AI 風險評鑑、進行 AI 風險處理、評鑑 AI 風險的衝擊。並依 AI 系統的領域與應用全景、預期用途、內外部全景決定風險與機會；範圍內多個 AI 系統時，應針對每個或每組系統決定。保留識別與因應 AI 風險及機會的文件化資訊。"));
    await cards(s, [
      { icon: "FaBalanceScale", title: "區分可接受／不可接受", text: "例：風險等級 ≥ 15 為不可接受，須處理" },
      { icon: "FaClipboardList", title: "執行 AI 風險評鑑", text: "評分方法、可能性與後果定義" },
      { icon: "FaTools", title: "進行 AI 風險處理", text: "處理選項與核准權責" },
      { icon: "FaUsers", title: "評鑑 AI 風險的衝擊", text: "後果涵蓋組織、個人、社會" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.6, cols: 4, gap: 0.25, titleSize: 16 });
    bubble(s, "A", "沒有準則的風險評鑑，就像沒有及格線的考試——每次結果都不能比較，違反 6.1.2 b)。", MX, 4.4, W - 2 * MX, 0.9, 15);
    bubble(s, "R", "那準則誰來定？", MX, 5.5, 4.5, 0.8, 15);
    bubble(s, "A", "最高管理階層核定，並與 AI 政策、目標一致。", 5.3, 5.5, 7.43, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "6.1.2 AI 風險評鑑流程", N("3 分鐘", "6.1.2 a)–e)：a) 參考並與 AI 政策和目標一致；b) 重複評鑑能產生一致、有效、可比較的結果；c) 識別有助於或阻礙達成 AI 目標的風險；d) 分析：評鑑對組織、個人和社會的潛在後果、評鑑可能性、決定風險等級（備考：可參考 6.1.4 衝擊評鑑結果）；e) 評估：與準則比較、訂定處理優先序。保存流程的文件化資訊；8.2 再保存結果。"));
    flow(s, [
      { head: "a) 與政策目標一致", body: "以 AI 政策與 AI 目標為基準" },
      { head: "b) 可重複可比較", body: "一致、有效、可比較的結果" },
      { head: "c) 識別", body: "有助於或阻礙 AI 目標的風險" },
      { head: "d) 分析", body: "後果：組織／個人／社會\n可能性 → 風險等級" },
      { head: "e) 評估", body: "與風險準則比較\n訂處理優先序" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.6, headSize: 14, bodySize: 14 });
    bubble(s, "A", "和 27001 最大的差別在 d)1)：後果不只看組織，還要看對「個人和社會」的後果。", MX, 4.4, W - 2 * MX, 0.9, 15);
    bubble(s, "R", "所以衝擊評鑑的結果可以直接拿來當後果評分的輸入！", MX, 5.5, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "AI 特有風險：傳統資安清單找不到的", N("3 分鐘", "附錄 C 風險來源：環境複雜性、缺乏透明與可解釋性、自動化水平、機器學習相關（資料品質、資料汙染）、硬體問題、生命週期問題、技術成熟度。B.6.2.3／B.6.2.6 點名 AI 特定資安威脅：資料汙染、模型竊取、模型反轉。提示注入是業界依「包括但不限於」延伸納入，非標準原文。"));
    await cards(s, [
      { icon: "FaBalanceScaleLeft", title: "偏差與不公平", text: "訓練資料代表性不足，對特定群體不利" },
      { icon: "FaCommentSlash", title: "幻覺與錯誤輸出", text: "生成式 AI 一本正經地說錯" },
      { icon: "FaChartLine", title: "模型／資料漂移", text: "上線後生產資料改變，效能下滑" },
      { icon: "FaBiohazard", title: "資料汙染", text: "訓練資料被惡意植入（標準點名）" },
      { icon: "FaUserSecret", title: "模型竊取／反轉", text: "盜取模型或反推訓練資料（標準點名）" },
      { icon: "FaSyringe", title: "提示注入", text: "誘導 LLM 違反指令（業界延伸）" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 4.2, cols: 3, gap: 0.25, titleSize: 16, textSize: 14 });
    bubble(s, "R", "這些都要放進風險登錄表嗎？", MX, 5.9, 4.6, 0.8, 15);
    bubble(s, "A", "依你的 AI 系統與角色挑相關的，並對照附錄 C 風險來源。", 5.4, 5.9, 7.33, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "AI 風險登錄表範例（虛擬案例：福爾摩沙銀行）", N("3 分鐘", "示範欄位：AI 系統、風險來源（對照附錄 C）、情境、後果（組織／個人／社會）、可能性、等級、處理選項、控制措施、負責人、剩餘風險。強調後果三面向與控制措施對應到附錄 A。數值為虛擬範例。"));
    table(s, [
      ["AI 系統", "風險來源", "風險情境", "後果（組／個／社）", "可能性", "等級", "處理", "控制措施", "剩餘"],
      ["AI 信用評分", "資料品質（C.3.4）", "歷史資料使特定族群核准率偏低", "中／高／中", "3", "15 不可接受", "降低", "A.7.4、A.6.2.4、A.9.3", "8"],
      ["AI 信用評分", "透明性（C.3.2）", "客戶被拒卻無法得知主要原因", "中／高／低", "3", "12", "降低", "A.8.2、A.6.2.7", "6"],
      ["反詐騙模型", "生命週期（C.3.6）", "詐騙手法改變造成漂移、漏報", "高／高／中", "4", "16 不可接受", "降低", "A.6.2.6、A.6.2.8", "8"],
      ["客服 LLM", "安全（C.2.10）", "提示注入導致洩漏客戶資料", "高／高／低", "2", "10", "降低", "A.6.2.3、A.10.3", "4"]
    ], { x: MX, y: 1.45, w: W - 2 * MX, colW: [1.25, 1.45, 2.5, 1.45, 0.75, 1.15, 0.75, 1.95, 0.88], fontSize: 12, rowH: [0.5, 0.8, 0.8, 0.8, 0.8] });
    bubble(s, "A", "稽核員會從登錄表任選一列，往下追：控制措施有沒有實施？剩餘風險誰核准？", MX, 5.8, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "6.1.3 AI 風險處理：a) 到 g)", N("3 分鐘", "a) 選擇處理選項；b) 決定所有必須實作的控制措施並與附錄 A 比較，確認未忽略必要控制措施；c) 考量附錄 A；d) 是否需要附錄 A 以外的控制措施；e) 考慮附錄 B 實作指引；f) 產生 SoA；g) 制訂風險處理計畫。並獲得指定管理層對處理計畫的核准及剩餘風險接受。必要控制措施應與 6.2 目標一致、文件化、傳達、適切時提供給關注方。"));
    flow(s, [
      { head: "a) 選處理選項", body: "降低、避免、移轉、保留" },
      { head: "b)–d) 決定控制", body: "與附錄 A 比對\n必要時增加額外控制" },
      { head: "e) 參考附錄 B", body: "實作指引" },
      { head: "f) 產生 SoA", body: "必要控制措施\n納入／排除理由" },
      { head: "g) 處理計畫", body: "指定管理層核准\n接受剩餘風險" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.5, headSize: 14, bodySize: 14 });
    bubble(s, "R", "附錄 A 38 項全部都要做嗎？", MX, 4.3, 5.2, 0.85, 15);
    bubble(s, "A", "不用！依風險挑選，排除要寫理由；需要的話還可以加附錄 A 以外的控制措施。", 6.0, 4.3, 6.73, 0.85, 15);
    bubble(s, "A", "最常見的缺失：剩餘風險沒有任何核准紀錄。", MX, 5.4, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "適用性聲明（SoA）範例與排除理由", N("3 分鐘", "SoA 須含必要控制措施與納入／排除理由；排除理由可為風險評鑑認為不需要，或適用外部要求不需要。實施狀態欄 42001 未明文要求，屬建議作法。展示一個好的排除理由與一個不好的。"));
    table(s, [
      ["控制措施", "適用", "理由", "實施狀態（建議）"],
      ["A.6.2.8 事件日誌紀錄", "納入", "風險 R-03 漂移監控需求；法規留存要求", "已實施"],
      ["A.7.3 資料之獲取", "納入", "使用外購與內部資料訓練", "實施中"],
      ["A.10.4 客戶", "納入", "提供 AI SaaS 給企業客戶", "已實施"],
      ["A.6.2.2 系統要求與規範", "排除？", "✗「本公司不開發 AI」——但有微調外部模型", "—"],
      ["A.6.1.3 設計開發流程", "排除", "✓ 僅為 AI 使用者，經風險評鑑無開發活動（R-12）", "—"]
    ], { x: MX, y: 1.45, w: 8.6, colW: [2.4, 0.9, 3.7, 1.6], fontSize: 13, rowH: 0.6 });
    await cards(s, [
      { icon: "FaCheck", title: "好的排除理由", text: ["引用風險評鑑結果", "引用外部要求", "與 AI 角色一致"], color: C.accent6 },
      { icon: "FaTimes", title: "不好的排除理由", text: ["「不適用」三個字", "與實際活動矛盾", "沒有人審查"], color: C.accent2 }
    ], { x: 9.5, y: 1.45, w: 3.23, h: 4.6, cols: 1, gap: 0.25 });
  }
  {
    const s = slideOf("CONTENT", "6.1.4 AI 系統衝擊評鑑 vs AI 風險評鑑", N("3 分鐘", "6.1.4：定義流程評鑑 AI 系統開發、提供或使用可能對個人或群體，或兩者，以及社會的潛在後果；應決定部署、預期用途與可預見的濫用之後果；考量特定技術與社會全景及司法管轄區；結果文件化，適切時提供給關注方；並在風險評鑑中考慮其結果。ISO/IEC 42005:2025 提供詳細指引。"));
    table(s, [
      ["比較", "AI 風險評鑑（6.1.2）", "AI 系統衝擊評鑑（6.1.4）"],
      ["關注焦點", "對達成 AI 目標的不確定性影響", "對個人或群體及社會的潛在後果"],
      ["視角", "組織視角為主（也看個人、社會後果）", "受影響者視角"],
      ["必須考量", "可能性 × 後果 → 等級", "部署、預期用途、可預見的濫用、司法管轄區"],
      ["產出", "風險等級、處理優先序", "衝擊結果文件，可提供給關注方"],
      ["關係", "輸入衝擊評鑑結果", "結果應納入風險評鑑考慮"]
    ], { x: MX, y: 1.45, w: 8.4, colW: [1.6, 3.3, 3.5], fontSize: 13, rowH: 0.62 });
    bubble(s, "R", "風險評鑑問「公司會不會受傷」，衝擊評鑑問「別人會不會受傷」？", 9.25, 1.5, 3.48, 2.0, 14);
    bubble(s, "A", "說得好！兩者要互相輸入，不是各做各的。", 9.25, 3.75, 3.48, 1.6, 14);
  }
  {
    const s = slideOf("CONTENT", "衝擊評鑑要看哪些面向？", N("3 分鐘", "B.5.2：考慮 AI 是否影響個人的法律地位或生活機會、身心健康、普遍人權、社會。B.5.4 對個人或群體：公平性、當責性、透明性與可解釋性、資安與隱私、安全與健康、財務後果、可及性、人權；需特別考量兒童、身障者、老年人、工人等。B.5.5 對社會：環境永續、經濟、政府、健康與安全、規範傳統文化價值。"));
    await cards(s, [
      { icon: "FaUser", title: "個人或群體（A.5.4）", text: ["公平性、當責性", "透明性與可解釋性", "資安與隱私、安全與健康", "財務後果、可及性、人權", "特別關注兒童、身障者、長者、工人"] },
      { icon: "FaGlobe", title: "社會（A.5.5）", text: ["環境永續（能耗、碳排、用水）", "經濟（金融服務可及性、就業）", "政府（錯誤資訊、刑事司法）", "健康與安全", "規範、傳統、文化與價值觀"] },
      { icon: "FaExclamationTriangle", title: "觸發時機（B.5.2）", text: ["預期目的與處境的關鍵性", "AI 技術複雜度與自動化程度", "處理資料的類型與敏感性", "以上任一重大變更"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 4.0, cols: 3, textSize: 14 });
    bubble(s, "A", "記得寫「可預見的濫用」：例如履歷篩選被拿去做裁員排序。", MX, 5.75, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "6.2 AI 目標與 6.3 變更之規劃", N("3 分鐘", "6.2 AI 目標應：與 AI 政策一致、可量測（若可行）、考量適用要求、受監控、被傳達、適切時更新、文件化；規劃時決定待辦事項、資源、負責人、完成時間、結果評估方式。附錄 C 提供目標參考（當責、公平、隱私、穩健、安全、透明可解釋…）。6.3：變更 AIMS 應以規劃的方式執行。"));
    table(s, [
      ["AI 目標（虛擬範例）", "指標", "負責人", "期限", "評估方式"],
      ["信用評分對不同群體公平", "核准率比值 ≥ 0.8", "風控 AI 負責人", "2026 Q4", "每季偏差報告"],
      ["客服 AI 回答正確", "抽測正確率 ≥ 95%", "客服 AI 負責人", "每月", "人工抽樣 200 則"],
      ["使用者知情", "AI 揭露覆蓋率 100%", "產品經理", "2026 Q2", "上線檢核表"],
      ["全員 AI 認知", "訓練完成率 ≥ 95%", "人資", "2026 Q3", "訓練系統紀錄"]
    ], { x: MX, y: 1.45, w: 8.5, colW: [2.5, 1.9, 1.5, 1.1, 1.5], fontSize: 13, rowH: 0.62 });
    await cards(s, [
      { icon: "FaBullseye", title: "6.2 七個「應」", text: ["一致、可量測、考量要求", "受監控、傳達、更新、文件化"] },
      { icon: "FaRoute", title: "6.3 變更規劃", text: ["目的與後果", "資源、權責重新分配"] }
    ], { x: 9.4, y: 1.45, w: 3.33, h: 4.4, cols: 1, gap: 0.25 });
  }
  {
    const s = slideOf("EXERCISE", "分組演練：樂購電商「生成式 AI 客服」", N("6 分鐘", "4 人一組，6 分鐘。情境：樂購電商（虛擬案例）上線 LLM 客服，可回答退換貨政策、查詢訂單。請各組產出：(1) 組織角色；(2) 兩個 AI 風險（含後果三面向）；(3) 一個對個人或社會的衝擊與可預見的濫用；(4) 對應的附錄 A 控制措施。參考答案：角色＝提供者＋製造者＋外部 LLM 的客戶；風險＝幻覺給錯政策（Air Canada 類型）、提示注入洩漏訂單資料；衝擊＝消費者權益受損、長者不知道在跟 AI 對話；控制＝A.8.2、A.9.3、A.6.2.4、A.6.2.8、A.10.3。", "請 2 組報告，講師講評。阿拉蕾：「我會先問 AI『你是真人嗎？』哈哈」——這正是 A.8.2 要回答的。"));
    await cards(s, [
      { badge: "1", title: "判定角色", text: "對自有客服系統與外部 LLM 各是什麼角色？" },
      { badge: "2", title: "兩個 AI 風險", text: "情境、後果（組織／個人／社會）、等級" },
      { badge: "3", title: "衝擊與濫用", text: "誰會受影響？可預見的濫用是什麼？" },
      { badge: "4", title: "控制措施", text: "挑 3–5 個附錄 A 控制措施並說明理由" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.6, cols: 4, gap: 0.25, titleSize: 16 });
    s.addImage({ path: ASSET("arale.png"), x: MX, y: 4.35, w: 2.3, h: 2.3 * 380 / 420, objectName: oid("arale-ex"), altText: "助教阿拉蕾" });
    bubble(s, "R", "計時 6 分鐘！每組派一位報告，講最有梗的那一個風險就好～", 3.15, 4.55, 9.58, 1.0, 16);
    tag(s, "⏱ 6 分鐘", 3.15, 5.85, 1.8, C.accent2);
  }
  {
    const s = slideOf("TITLE", null, N("10 分鐘", "休息 10 分鐘。提醒學員：線上影音第 4、5 章可以複習剛才的內容。"));
    s.addText("休息 10 分鐘 ☕", { placeholder: "title" });
    s.addText("下一節：條文 7–10 支援、運作、績效評估與改善\n阿拉蕾：「要準時回來喔，不然我會用 んちゃ 光線喚醒你！」", { placeholder: "body" });
    s.addImage({ path: ASSET("arale.png"), x: 9.3, y: 2.0, w: 3.3, h: 3.3 * 380 / 420, objectName: oid("arale-break"), altText: "助教阿拉蕾" });
  }

  // ---------- 五、條文 7–10 ----------
  startSection("五、條文 7–10");
  sectionSlide(5, "條文 7–10", "支援、運作、績效評估、改善", 20, N("0.5 分鐘", "進入第五單元，PDCA 的 D、C、A。"));
  {
    const s = slideOf("CONTENT", "7.1–7.3 資源、能力、認知", N("3 分鐘", "7.1 決定並提供 AIMS 所需資源（連結 A.4）。7.2 決定影響 AI 績效人員的必要能力，確保能勝任，必要時採取行動並評估有效性，保存能力證據。7.3 人員應認知 AI 政策、自身貢獻、未遵循的後果。示範 AI 職能矩陣。"));
    table(s, [
      ["角色", "必要能力", "能力證據"],
      ["資料科學家", "模型開發、偏差檢測、驗證方法", "學經歷、訓練紀錄、作品審查"],
      ["MLOps 工程師", "部署、監控、版本與變更管理", "證照、內部考核"],
      ["AI 風險管理者", "AI 風險／衝擊評鑑、法規", "訓練證明、評鑑報告審查"],
      ["人為監管者", "判讀 AI 輸出、覆寫時機", "上崗訓練與測驗紀錄"],
      ["內部稽核員", "42001 條文、稽核技巧、AI 基礎", "內稽員訓練證書"]
    ], { x: MX, y: 1.45, w: 8.3, colW: [1.9, 3.4, 3.0], fontSize: 13, rowH: 0.6 });
    await cards(s, [
      { icon: "FaBullhorn", title: "7.3 全員認知", text: ["AI 政策重點", "AI 使用守則：哪些資料不能貼", "違規後果"] }
    ], { x: 9.2, y: 1.45, w: 3.53, h: 2.4, cols: 1 });
    bubble(s, "R", "所以「上過課」不等於「有能力」？", 9.2, 4.1, 3.53, 1.0, 14);
    bubble(s, "A", "對，7.2 還要評估行動有效性。", 9.2, 5.25, 3.53, 1.0, 14);
  }
  {
    const s = slideOf("CONTENT", "7.4 溝通與 7.5 文件化資訊", N("3 分鐘", "7.4 決定溝通什麼、何時、對象、方式。7.5 包含標準要求與組織認為必要的文件化資訊；建立更新時注意識別、格式、審查核可；控制時注意可用、保護、分發存取、儲存保存、變更、留存處置，以及外部來源文件。列出條文明確要求的文件化資訊清單。"));
    s.addText("條文明確要求的文件化資訊（必備清單）", { x: MX, y: 1.4, w: 8, h: 0.45, fontSize: 18, bold: true, color: C.text2, isTextBox: true, margin: 0, objectName: oid("h") });
    const docs = ["4.3 AIMS 範圍", "5.2 AI 政策", "6.1.1 風險與機會因應行動", "6.1.2 AI 風險評鑑流程", "6.1.3 AI 風險處理流程", "6.1.3 適用性聲明 SoA", "6.1.4 衝擊評鑑結果", "6.2 AI 目標", "7.2 能力證據", "8.1 流程依規劃執行之證據", "8.2 風險評鑑結果", "8.3 風險處理結果", "8.4 衝擊評鑑結果", "9.1 監督量測結果", "9.2 稽核方案與結果", "9.3 管理審查結果", "10.2 不符合與矯正措施"];
    docs.forEach((d, i) => {
      const x = MX + (i % 3) * 3.0, y = 1.95 + Math.floor(i / 3) * 0.72;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.85, h: 0.6, rectRadius: 0.08, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: oid("doc") });
      s.addText(d, { x: x + 0.12, y, w: 2.65, h: 0.6, fontSize: 13, color: C.text1, valign: "middle", isTextBox: true, margin: 0, objectName: oid("doc-text") });
    });
    bubble(s, "A", "清單只是最低要求。7.5.1 b) 還包括「組織認為對 AIMS 有效性必要」的文件。", 9.75, 1.95, 2.98, 3.0, 14);
  }
  {
    const s = slideOf("CONTENT", "條文 8 運作：把規劃變成日常", N("3 分鐘", "8.1 規劃、實作及控制流程，建立準則並依準則控制；實施 6.1.3 決定的控制措施並監督有效性；提供足以有信心流程依規劃執行的文件化資訊；控制規劃變更、審查非預期變更；確保外部提供的流程、產品或服務受控（如外部 LLM API、雲端 AI 服務）。8.2／8.3／8.4：依規劃期間或重大變更時執行風險評鑑、風險處理、衝擊評鑑並保存結果。"));
    await cards(s, [
      { badge: "8.1", title: "運作規劃及控制", text: ["建立流程準則並依準則控制", "監督控制措施有效性", "控制外部提供的 AI 服務"] },
      { badge: "8.2", title: "AI 風險評鑑", text: ["依規劃期間", "或提議／發生重大變更時", "保存所有結果"] },
      { badge: "8.3", title: "AI 風險處理", text: ["實施處理計畫並驗證有效性", "新風險 → 依 6.1.3 處理", "處理無效 → 審查並更新計畫"] },
      { badge: "8.4", title: "AI 系統衝擊評鑑", text: ["依規劃期間", "或發生重大變更時", "保存所有結果"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.0, cols: 4, gap: 0.25, titleSize: 16 });
    s.addText("「重大變更」觸發範例：", { x: MX, y: 4.75, w: 3, h: 0.45, fontSize: 16, bold: true, color: C.text2, isTextBox: true, margin: 0, objectName: oid("h") });
    ["模型更版或換供應商", "訓練資料來源變更", "預期用途擴大", "上線新國家／地區", "自動化程度提高"].forEach((t, i) => tag(s, t, MX + (i % 5) * 2.45, 5.35, 2.3, [C.accent4, C.accent1, C.accent2, C.accent3, C.accent5][i]));
    bubble(s, "R", "外部 LLM 換新版本也算重大變更嗎？", MX, 6.0, 6.0, 0.75, 14);
  }
  {
    const s = slideOf("CONTENT", "9.1 監督量測：AIMS 與 AI 系統兩種績效", N("3 分鐘", "9.1 決定需監督量測的事項、方法、時間、分析評估時間，保存結果證據，並評估 AIMS 績效與有效性。3.11 註 3：績效同時指 AI 系統的結果與 AIMS 的結果。舉例 KPI。B.6.2.6 提到可用 F1 等指標，並以非 AI 作法為基準。"));
    stat(s, "95%", "客服 AI 抽測正確率目標", MX, 1.6, 2.9, C.accent1);
    stat(s, "0.8", "偏差：群體核准率比值下限", MX + 3.05, 1.6, 2.9, C.accent4);
    stat(s, "3 天", "AI 申訴回覆時效", MX + 6.1, 1.6, 2.9, C.accent2);
    stat(s, "100%", "高風險 AI 年度衝擊評鑑完成率", MX + 9.15, 1.6, 2.9, C.accent3);
    s.addText("以上數值皆為虛擬範例，門檻由組織依風險準則自訂", { x: MX, y: 3.4, w: 8, h: 0.35, fontSize: 12, color: "8A93A6", isTextBox: true, margin: 0, objectName: oid("caption") });
    await cards(s, [
      { icon: "FaRobot", title: "AI 系統績效", text: ["準確率、F1、誤判率", "漂移告警數、人為覆寫率", "生成式 AI 幻覺率"] },
      { icon: "FaChartBar", title: "AIMS 績效", text: ["目標達成率、訓練完成率", "事故與申訴處理時效", "矯正措施如期結案率"] }
    ], { x: MX, y: 3.95, w: W - 2 * MX, h: 2.3, cols: 2 });
  }
  {
    const s = slideOf("CONTENT", "9.2 內部稽核與 9.3 管理審查", N("3 分鐘", "9.2：依規劃期間內稽，確認符合組織要求與本標準、有效實作維持；稽核方案含頻率、方法、責任、規劃與報告；考量重要流程與先前結果；定義目標準則範圍、確保客觀公正、結果向管理階層報告。AI 技術專家可陪同提供意見，結論由稽核員作出。9.3.2 輸入 a)–e)；9.3.3 輸出：持續改善機會決策與變更需要。"));
    await cards(s, [
      { icon: "FaSearch", title: "9.2 內部稽核", text: ["稽核方案：頻率、方法、責任", "納入重要流程與前次結果", "稽核員客觀公正，不稽核自己的工作", "建議涵蓋 AI 技術流程（資料、模型、監控）"] },
      { icon: "FaUsersCog", title: "9.3.2 管理審查輸入", text: ["a) 過往決議處理狀態", "b) 內外部議題變更", "c) 關注方需要與期望變更", "d) 績效趨勢：不符合、監督量測、稽核結果", "e) 持續改善機會"] },
      { icon: "FaFlagCheckered", title: "9.3.3 管理審查結果", text: ["持續改善機會相關決策", "AIMS 變更的需要", "保存文件化資訊作為證據"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 4.0, cols: 3, textSize: 14 });
    bubble(s, "A", "管審紀錄常見缺失：輸入少了 b)、c)，或只有報告、沒有「決策」。", MX, 5.75, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "10.2 不符合事項及矯正措施：以 AI 偏差事件為例", N("3 分鐘", "10.2：a) 反應（控制、矯正、處理後果）；b) 評估消除原因的需要（審查、決定原因、是否有類似不符合）；c) 實作；d) 審查有效性；e) 必要時變更 AIMS。矯正措施應切合影響。保存性質、行動與結果之證據。以才庫人力（虛擬案例）AI 履歷篩選偏差示範 5 Why。"));
    flow(s, [
      { head: "a) 反應", body: "暫停自動淘汰，改人工複審" },
      { head: "b) 找原因", body: "5 Why → 訓練資料代表性不足，且無偏差測試關卡" },
      { head: "b)3) 類似？", body: "檢查其他 AI 系統是否也缺偏差測試" },
      { head: "c) 實作", body: "補資料、加入發布前偏差檢測" },
      { head: "d) 有效性", body: "連續三個月偏差指標達標" },
      { head: "e) 變更 AIMS", body: "修訂開發流程與發布準則" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.8, headSize: 14, bodySize: 14, gap: 0.2 });
    bubble(s, "R", "只把模型重新訓練一次，算矯正措施嗎？", MX, 4.6, 5.6, 0.9, 15);
    bubble(s, "A", "那只是「矯正」。3.17 矯正措施要消除根本原因、防止再發生。", 6.4, 4.6, 6.33, 0.9, 15);
  }

  // ---------- 六、附錄 A ----------
  startSection("六、附錄 A／B 與整合");
  sectionSlide(6, "附錄 A／B：38 項控制措施", "9 個領域逐一拆解，並與 27001／27701／9001 整合", 25, N("0.5 分鐘", "進入第六單元。"));
  {
    const s = slideOf("CONTENT", "附錄 A 全景：9 個領域、38 項控制措施", N("2 分鐘", "各領域控制措施數：A.2 政策 3、A.3 內部組織 2、A.4 資源 5、A.5 衝擊評鑑 4、A.6 生命週期 9、A.7 資料 5、A.8 關注方資訊 4、A.9 使用 3、A.10 第三方與客戶 3，合計 38。"));
    const doms = [["A.2", "AI 相關政策", 3], ["A.3", "內部組織", 2], ["A.4", "AI 系統資源", 5], ["A.5", "AI 系統衝擊評鑑", 4], ["A.6", "AI 系統生命週期", 9], ["A.7", "AI 系統之資料", 5], ["A.8", "關注方資訊", 4], ["A.9", "AI 系統之使用", 3], ["A.10", "第三方與客戶", 3]];
    await cards(s, doms.map(d => ({ badge: d[0], title: `${d[1]}｜${d[2]} 項` })), { x: MX, y: 1.45, w: 8.4, h: 4.8, cols: 3, gap: 0.22, titleSize: 16 });
    stat(s, "38", "項控制措施", 9.3, 1.7, 3.4, C.accent2);
    stat(s, "9", "個控制目標領域", 9.3, 3.7, 3.4, C.accent1);
  }
  {
    const s = slideOf("CONTENT", "A.2 政策、A.3 內部組織、A.4 資源", N("3 分鐘", "A.2 已在 5.2 講過。A.3.2 角色與責任；A.3.3 關注事項通報流程，B.3.3 要求 a)–h)：保密或匿名、推廣給員工與契約人員、由具資格人員負責、調查與解決權限、及時升級、防報復、保密下的報告、適當時間內回應；可參考 ISO 37002。A.4.2–A.4.6 文件化資源：資料、工具、系統與運算、人力。"));
    await cards(s, [
      { badge: "A.3.3", title: "關注事項通報機制", text: ["保密或匿名選項", "推廣給員工及契約人員", "具資格人員負責、有調查權限", "及時升級、防止報復", "在適當時間內回應"] },
      { badge: "A.4", title: "AI 系統資源文件化", text: ["A.4.3 資料資源：來源、更新日、分類、標記、偏差", "A.4.4 工具資源：演算法、模型、工具", "A.4.5 系統與運算：地端／雲端／邊緣", "A.4.6 人力資源與能力"] }
    ], { x: MX, y: 1.45, w: 8.6, h: 4.4, cols: 2, textSize: 14 });
    bubble(s, "R", "員工發現 AI 怪怪的，要跟誰說？", 9.5, 1.5, 3.23, 1.7, 14);
    bubble(s, "A", "A.3.3 就是要回答這題，而且可以匿名、不能被報復。", 9.5, 3.45, 3.23, 2.0, 14);
  }
  {
    const s = slideOf("CONTENT", "A.5 衝擊評鑑 與 A.6.1 開發的管理指導", N("3 分鐘", "A.5.2 建立衝擊評鑑流程；A.5.3 文件化結果並於規定期間留存；A.5.4 對個人或群體；A.5.5 對社會。B.5.3 文件化項目：預期用途與可預見誤用、正負面衝擊、可預見故障與緩解、適用人口群體、系統複雜性、人為監管、就業與技能。A.6.1.2 負責任開發目標並整合到生命週期；A.6.1.3 負責任設計開發流程（B.6.1.3：生命週期階段、測試、人為監管、衝擊評鑑時點、訓練資料規則、發布準則、核准簽核、變更控制…）。"));
    await cards(s, [
      { badge: "A.5", title: "衝擊評鑑 4 項", text: ["A.5.2 建立流程", "A.5.3 文件化並留存", "A.5.4 對個人或群體", "A.5.5 對社會"] },
      { badge: "A.6.1.2", title: "負責任開發目標", text: ["例：把「公平性」納入需求、資料、訓練、驗證各階段", "要求使用特定偏差測試工具"] },
      { badge: "A.6.1.3", title: "負責任設計開發流程", text: ["生命週期階段、測試要求", "人為監管、衝擊評鑑時點", "訓練資料規則、發布準則", "核准簽核、變更控制"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 4.0, cols: 3, textSize: 14 });
    bubble(s, "A", "目標要「整合進流程」：只寫在政策裡、開發流程沒有對應關卡，就是缺口。", MX, 5.75, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "A.6.2 AI 系統生命週期：七個控制點", N("3 分鐘", "A.6.2.2 要求與規範（新系統或重大增強）；A.6.2.3 設計開發文件化（含 AI 特定資安威脅：資料汙染、模型竊取、模型反轉）；A.6.2.4 驗證與確認（測試方法、測試資料代表性、發布準則、可接受錯誤率）；A.6.2.5 部署計畫，部署前滿足要求；A.6.2.6 運作與監控，至少含系統與性能監控、維修、更新、支援，注意漂移；A.6.2.7 技術文件化依關注方提供；A.6.2.8 事件日誌至少在使用時啟用。"));
    flow(s, [
      { head: "A.6.2.2", body: "要求與規範\n為何開發、資料要求" },
      { head: "A.6.2.3", body: "設計開發文件化\n含 AI 資安威脅" },
      { head: "A.6.2.4", body: "驗證與確認\n評估準則、錯誤率" },
      { head: "A.6.2.5", body: "部署\n發布準則與簽核" },
      { head: "A.6.2.6", body: "運作與監控\n漂移、維修、更新" },
      { head: "A.6.2.7", body: "技術文件\n依關注方提供" },
      { head: "A.6.2.8", body: "事件日誌\n至少使用時啟用" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.5, headSize: 14, bodySize: 13, gap: 0.18 });
    table(s, [
      ["發布準則範例（虛擬：反詐騙模型）", "門檻"],
      ["測試集召回率", "≥ 組織訂定之值，且不低於現行規則引擎"],
      ["各客群誤報率差異", "在可接受範圍內並經風控主管審查"],
      ["衝擊評鑑", "已更新並經核准"],
      ["回復計畫（rollback）", "已演練"]
    ], { x: MX, y: 4.25, w: 8.2, colW: [3.4, 4.8], fontSize: 13, rowH: 0.48 });
    bubble(s, "R", "日誌要記什麼？", 9.1, 4.3, 3.63, 0.85, 14);
    bubble(s, "A", "時間、輸入資料、輸出、超出範圍的情況，並依留存政策保存。", 9.1, 5.3, 3.63, 1.15, 14);
  }
  {
    const s = slideOf("CONTENT", "A.7 AI 系統之資料：5 項控制", N("3 分鐘", "A.7.2 開發與增強用資料的管理流程（隱私資安、透明性、代表性、準確完整）；A.7.3 資料之獲取（類別、數量、來源、特徵、人口統計與偏差、前處理、資料權利如 PII 與版權、詮釋資料）；A.7.4 資料品質要求並確保符合（ISO/IEC 5259、TR 24027）；A.7.5 資料來歷流程（ISO 8000-2：建立、更新、轉錄、抽象、驗證、控制轉移）；A.7.6 資料準備準則與方法（清理、補缺、正規化、標記、編碼）。"));
    await cards(s, [
      { badge: "7.2", title: "資料管理流程", text: "隱私資安、代表性、準確完整" },
      { badge: "7.3", title: "資料之獲取", text: "來源、權利（PII、版權）、偏差" },
      { badge: "7.4", title: "資料品質", text: "定義要求並確保符合" },
      { badge: "7.5", title: "資料來歷", text: "建立、更新、轉移的紀錄" },
      { badge: "7.6", title: "資料準備", text: "清理、補缺、正規化、標記" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.4, cols: 5, gap: 0.2, titleSize: 15, textSize: 14 });
    table(s, [
      ["資料卡（Datasheet）建議欄位", "說明"],
      ["來源與取得方式", "內部、外購、公開、合成；授權條件"],
      ["分類與用途", "訓練／驗證／測試／生產"],
      ["品質與偏差", "缺漏率、群體分佈、已知偏差"],
      ["來歷與版本", "建立、修改、轉移紀錄與版本號"]
    ], { x: MX, y: 4.15, w: 8.2, colW: [3.0, 5.2], fontSize: 13, rowH: 0.48 });
    bubble(s, "A", "稽核員最愛問：「這個模型用哪一版資料訓練的？拿來看看。」", 9.1, 4.2, 3.63, 2.0, 14);
  }
  {
    const s = slideOf("CONTENT", "A.8 關注方資訊 與 A.9 AI 系統之使用", N("3 分鐘", "A.8.2 向使用者提供必要資訊（B.8.2：系統目的、正在與 AI 互動、如何互動、如何及何時覆寫、技術要求、人為監管需求、準確性與績效、衝擊評鑑相關資訊…）；A.8.3 外部通報不良衝擊機制；A.8.4 事故溝通規劃；A.8.5 向關注方報告的義務。A.9.2 負責任使用流程；A.9.3 負責任使用目標（含有意義的人為監管）；A.9.4 依預期用途與文件使用。"));
    await cards(s, [
      { badge: "A.8", title: "讓關注方知道", text: ["8.2 告知「正在與 AI 互動」與如何覆寫", "8.3 提供外部通報不良衝擊管道", "8.4 事故通知規劃（類型、時程、對象）", "8.5 向主管機關等報告的義務"] },
      { badge: "A.9", title: "負責任地使用", text: ["9.2 使用流程：核可、成本、採購、法規", "9.3 目標：公平、當責、透明、可靠、安全…", "有意義的人為監管：有權覆寫", "9.4 依預期用途與隨附文件使用"] }
    ], { x: MX, y: 1.45, w: 8.4, h: 4.2, cols: 2, textSize: 14 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.3, y: 1.45, w: 3.43, h: 2.3, rectRadius: 0.1, fill: { color: "FFE8EE" }, line: { color: C.accent2 }, objectName: oid("disclose") });
    s.addText([{ text: "AI 揭露範例\n", options: { bold: true, color: C.accent2 } }, { text: "「您好，我是樂購 AI 客服小幫手，回覆由 AI 產生，可能有誤；如需真人服務請輸入『轉真人』。」", options: { color: C.text1 } }], { x: 9.45, y: 1.55, w: 3.15, h: 2.1, fontSize: 14, valign: "top", isTextBox: true, margin: 0, objectName: oid("disclose-text") });
    bubble(s, "A", "人為監管若只是「按確認」，就是流於形式。", 9.3, 4.0, 3.43, 1.65, 14);
  }
  {
    const s = slideOf("CONTENT", "A.10 第三方與客戶：責任要寫進合約", N("3 分鐘", "A.10.2 生命週期內責任在組織、夥伴、供應商、客戶與第三方間分配（含 PII 控制者／處理者，參考 29100、27701）；A.10.3 確保供應商提供的服務、產品或材料符合負責任方法，依風險決定選擇、要求與持續監督，必要時要求矯正措施，並要求適當文件；A.10.4 考量客戶的期望與需求，傳達適用領域的限制。"));
    table(s, [
      ["供應商 AI 評估問卷（節錄）", "對應"],
      ["模型訓練資料來源與授權？是否使用我方資料再訓練？", "A.7.3、A.10.3"],
      ["是否提供模型卡、效能限制與已知風險？", "A.6.2.7、A.8.2"],
      ["模型更版是否事先通知？", "A.6.2.6、8.1"],
      ["事故通知時限與聯絡窗口？", "A.8.4"],
      ["是否取得 ISO/IEC 42001、27001 驗證？", "A.10.3"]
    ], { x: MX, y: 1.45, w: 8.4, colW: [6.4, 2.0], fontSize: 13, rowH: 0.58 });
    await cards(s, [
      { badge: "10.2", title: "責任分配", text: "資料、模型、部署、使用各由誰負責" },
      { badge: "10.3", title: "供應商", text: "依風險選擇、要求、持續監督" },
      { badge: "10.4", title: "客戶", text: "了解期望，傳達適用限制" }
    ], { x: 9.3, y: 1.45, w: 3.43, h: 4.9, cols: 1, gap: 0.2, titleSize: 15, textSize: 14 });
  }
  {
    const s = slideOf("CONTENT", "附錄 C：AI 目標與風險來源", N("2 分鐘", "C.2 目標：當責性、AI 專業知識、訓練測試資料可用性與品質、環境影響、公平性、可維護性、隱私性、穩健性、安全性、資安、透明性和可解釋性（11 項）。C.3 風險來源：環境複雜性、缺乏透明可解釋、自動化水平、機器學習相關、硬體問題、生命週期問題、技術成熟度（7 項）。可作為風險識別工作坊的提示清單。"));
    await cards(s, [
      { icon: "FaBullseye", title: "C.2 潛在組織目標（11）", text: ["當責性、AI 專業知識、資料可用性與品質", "環境影響、公平性、可維護性", "隱私性、穩健性、安全性、資安", "透明性和可解釋性"] },
      { icon: "FaExclamationCircle", title: "C.3 風險來源（7）", text: ["環境的複雜性", "缺乏透明性和可解釋性", "自動化水平、機器學習相關", "系統硬體、生命週期、技術成熟度"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.6, cols: 2, textSize: 15 });
    bubble(s, "A", "風險識別工作坊時，把附錄 C 當「提示卡」逐張問一遍，就不容易漏。", MX, 5.4, W - 2 * MX, 0.85, 15);
  }
  {
    const s = slideOf("CONTENT", "與 ISO 27001／27701／9001 整合（附錄 D）", N("3 分鐘", "HS 結構讓政策、風險方法、內稽、管審、文管、矯正措施可整合為 IMS。附錄 D.2：資安是多數情況下達成 AI 目標的關鍵（27001）；AI 處理 PII 時可與 27701 整合；與 9001 聯合實作可提升客戶信心，補充風險管理、軟體開發、供應鏈協作。42001 特有：AI 角色、衝擊評鑑、AI 生命週期、資料控制。"));
    table(s, [
      ["管理要素", "ISO 27001", "ISO 27701", "ISO 9001", "ISO 42001 加什麼"],
      ["政策", "資安政策", "隱私政策", "品質政策", "AI 政策（A.2.3 一致性）"],
      ["風險", "資安風險評鑑", "隱私風險", "風險與機會", "AI 風險 + 衝擊評鑑"],
      ["供應商", "供應商資安", "PII 處理者", "外部提供", "AI 供應商、責任分配"],
      ["事故", "資安事故管理", "PII 外洩通報", "不符合", "AI 事故溝通（A.8.4）"],
      ["稽核／管審", "共用", "共用", "共用", "納入 AI 技術流程"]
    ], { x: MX, y: 1.45, w: W - 2 * MX, colW: [1.8, 2.3, 2.3, 2.1, 3.63], fontSize: 13, rowH: 0.58 });
    bubble(s, "A", "已有 27001／27701 的組織，通常可沿用一半以上的管理流程，重點補 AI 特有部分。", MX, 5.25, W - 2 * MX, 0.9, 15);
  }
  {
    const s = slideOf("CONTENT", "導入路徑：約 6–9 個月", N("2 分鐘", "建議里程碑（依組織規模調整）：盤點 AI 系統清冊與角色 → 差距分析 → 政策與治理組織 → 風險／衝擊評鑑方法與執行 → SoA 與處理計畫 → 控制措施實作 → 教育訓練 → 運作與紀錄累積 → 內部稽核 → 管理審查 → 第一、二階段驗證。"));
    flow(s, [
      { head: "1–2 月", body: "AI 系統清冊\n角色判定\n差距分析" },
      { head: "2–3 月", body: "AI 政策\n治理組織\n風險準則" },
      { head: "3–4 月", body: "風險評鑑\n衝擊評鑑\nSoA" },
      { head: "4–6 月", body: "控制措施實作\n教育訓練\n紀錄累積" },
      { head: "6–7 月", body: "內部稽核\n管理審查\n矯正措施" },
      { head: "7–9 月", body: "第一階段\n第二階段\n取得證書" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.0, headSize: 15, bodySize: 14, gap: 0.2 });
    bubble(s, "R", "可以三個月就拿證書嗎？", MX, 4.85, 5.0, 0.9, 15);
    bubble(s, "A", "驗證要看「運作有效性」，紀錄要累積一段時間，太趕通常第二階段會卡關。", 5.8, 4.85, 6.93, 0.9, 15);
  }

  // ---------- 七、管理案例 ----------
  startSection("七、管理案例");
  sectionSlide(7, "管理案例", "六大產業的 AIMS 實戰（虛擬案例）", 10, N("0.5 分鐘", "進入第七單元，案例詳細內容在線上教材第 14 章。"));
  {
    const s = slideOf("CONTENT", "六大產業案例總覽（虛擬案例）", N("4 分鐘", "快速走過六個案例的角色、主要風險與關鍵控制措施，詳細內容請學員課後閱讀線上第 14 章。重點：不同產業、不同角色，SoA 與風險重點完全不同。"));
    await cards(s, [
      { icon: "FaUniversity", title: "福爾摩沙銀行｜信用評分＋反詐騙", text: "偏差、可解釋、漂移 → A.7.4、A.8.2、A.6.2.6" },
      { icon: "FaIndustry", title: "鴻光精密｜AOI 瑕疵檢測", text: "漏檢、環境變化 → A.6.2.4、A.6.2.6、9.1" },
      { icon: "FaShoppingCart", title: "樂購電商｜生成式 AI 客服", text: "幻覺、提示注入 → A.8.2、A.9.3、A.10.3" },
      { icon: "FaHospital", title: "仁心醫院｜醫療影像輔助判讀", text: "安全與健康、人為監管 → A.5.4、A.9.3、A.9.4" },
      { icon: "FaUserCheck", title: "才庫人力｜AI 履歷篩選", text: "就業公平、可預見濫用 → A.5、A.7.4、10.2" },
      { icon: "FaCloud", title: "智聯科技｜AI SaaS 提供者", text: "客戶要求驗證、責任分配 → A.10.2、A.10.4、A.6.2.7" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 4.5, cols: 3, gap: 0.25, titleSize: 15, textSize: 14 });
    bubble(s, "R", "同樣是 AI，銀行跟工廠要管的東西差好多！", MX, 6.1, 7.0, 0.7, 14);
  }
  {
    const s = slideOf("CONTENT", "案例：一般企業員工使用生成式 AI（AI 使用者角色）", N("3 分鐘", "最多組織的起點：只是「使用」AI。角色＝AI 客戶／使用者。關鍵控制：A.2 AI 使用政策、A.9.2 負責任使用流程（核可工具清單、禁止輸入機密與個資）、7.3 認知、A.10.3 供應商（企業版條款、不得拿資料訓練）、A.3.3 通報。SoA 可合理排除 A.6.1.3 等開發類控制，但要寫理由。對照 2023 年 Samsung 事件。"));
    flow(s, [
      { head: "政策", body: "AI 使用政策\n核可工具清單" },
      { head: "守則", body: "機密、個資不得輸入\n輸出須人工確認" },
      { head: "技術", body: "企業版帳號\nDLP、存取控制" },
      { head: "訓練", body: "全員認知\n案例宣導" },
      { head: "監督", body: "使用紀錄抽查\n通報管道" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.4, headSize: 15, bodySize: 14 });
    bubble(s, "R", "只是用 ChatGPT 也能拿 42001 證書嗎？", MX, 4.25, 5.8, 0.9, 15);
    bubble(s, "A", "可以，範圍與 SoA 依「使用者」角色界定；但排除開發類控制要有風險評鑑依據。", 6.6, 4.25, 6.13, 0.9, 15);
    bubble(s, "A", "AI 使用政策最好跟資安政策、個資政策交叉引用（A.2.3），否則員工只會看到三份互相矛盾的規定。", MX, 5.4, W - 2 * MX, 0.9, 15);
  }
  {
    const s = slideOf("EXERCISE", "討論：你是顧問，你會怎麼做？", N("3 分鐘", "情境（虛擬）：智聯科技提供 AI SaaS，大客戶要求半年內取得 42001 驗證，並要求提供模型效能與限制說明。請學員回答：先做哪三件事？參考答案：(1) 界定範圍與角色（提供者／製造者），盤點 AI 系統；(2) 風險與衝擊評鑑、SoA，特別是 A.10.2 責任分配、A.10.4 客戶、A.6.2.7 技術文件、A.8.2；(3) 建立運作紀錄、內稽、管審，規劃驗證時程。", "阿拉蕾：「我會先跟客戶說『んちゃ～請給我九個月』！」——其實也沒錯，期望管理很重要。"));
    await cards(s, [
      { badge: "Q1", title: "範圍與角色", text: "智聯科技對 SaaS 與其使用的雲端模型各是什麼角色？" },
      { badge: "Q2", title: "優先控制措施", text: "客戶最在意哪些？（提示：A.10、A.6.2.7、A.8.2）" },
      { badge: "Q3", title: "時程與證據", text: "半年內要累積哪些運作紀錄才過得了第二階段？" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.8, cols: 3 });
    s.addImage({ path: ASSET("allan.png"), x: MX, y: 4.45, w: 1.4, h: 1.4 * 948 / 560, objectName: oid("allan-ex"), altText: "Allan 講師" });
    bubble(s, "A", "給大家 3 分鐘討論。提示：先問「客戶要的是證書，還是要的是信任？」", 2.3, 4.7, 10.43, 1.0, 16);
  }

  // ---------- 八、稽核實務 ----------
  startSection("八、稽核實務");
  sectionSlide(8, "稽核實務", "驗證流程、ISO/IEC 42006、證據與不符合事項", 20, N("0.5 分鐘", "進入第八單元，從稽核員的角度看 AIMS。"));
  {
    const s = slideOf("CONTENT", "AIMS 驗證流程", N("3 分鐘", "依 ISO/IEC 17021-1 + ISO/IEC 42006：申請與合約審查 → 第一階段（文件與準備度審查）→ 第二階段（實施有效性）→ 不符合矯正 → 技術審查與發證；證書 3 年有效，每年監督稽核，第 3 年重新驗證。人天、矯正期限依驗證機構規定。"));
    flow(s, [
      { head: "申請", body: "範圍、AI 系統數量、角色" },
      { head: "第一階段", body: "文件與準備度審查" },
      { head: "第二階段", body: "實施有效性稽核" },
      { head: "矯正／發證", body: "不符合矯正、技術審查" },
      { head: "監督稽核", body: "第 1、2 年每年一次" },
      { head: "重新驗證", body: "第 3 年，證書 3 年有效" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.4, headSize: 15, bodySize: 14, gap: 0.2 });
    await cards(s, [
      { icon: "FaCertificate", title: "ISO/IEC 42006:2025", text: ["對 AIMS 驗證機構的要求", "補充 ISO/IEC 17021-1", "要求稽核團隊具備 AI 相關能力"] },
      { icon: "FaClipboardCheck", title: "第一階段必看", text: ["範圍、AI 政策、AI 系統清冊與角色", "風險準則、風險／衝擊評鑑結果", "SoA、處理計畫、內稽與管審紀錄"] }
    ], { x: MX, y: 4.15, w: W - 2 * MX, h: 2.4, cols: 2, textSize: 14 });
  }
  {
    const s = slideOf("CONTENT", "第二階段：跟著一個 AI 系統走完一生（追蹤稽核法）", N("3 分鐘", "抽樣建議：高風險的、新上線的、外部提供的 AI 系統各挑一個（一高一新一外）。挑一個 AI 系統，從需求、資料、開發、驗證、部署、監控、事故、變更一路追，對照 SoA 宣稱的控制措施是否真的運作。"));
    flow(s, [
      { head: "需求", body: "A.6.2.2 為何開發" },
      { head: "資料", body: "A.7 來歷、品質" },
      { head: "開發", body: "A.6.2.3 設計文件" },
      { head: "驗證", body: "A.6.2.4 發布準則" },
      { head: "部署", body: "A.6.2.5 簽核" },
      { head: "監控", body: "A.6.2.6 漂移" },
      { head: "日誌事故", body: "A.6.2.8、A.8.4" },
      { head: "變更", body: "8.2–8.4 重評" }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 2.0, headSize: 13, bodySize: 13, gap: 0.15 });
    await cards(s, [
      { icon: "FaFileAlt", title: "文件", text: "政策、程序、評鑑報告、模型卡" },
      { icon: "FaComments", title: "訪談", text: "高階主管、資料科學家、MLOps、人為監管者" },
      { icon: "FaDesktop", title: "觀察／系統紀錄", text: "監控儀表板、日誌、版本紀錄、工單" }
    ], { x: MX, y: 3.75, w: W - 2 * MX, h: 1.8, cols: 3, titleSize: 16, textSize: 14 });
    bubble(s, "A", "三角驗證：文件說有、人說得出、系統查得到，三者一致才算證據充分。", MX, 5.8, W - 2 * MX, 0.8, 15);
  }
  {
    const s = slideOf("CONTENT", "稽核員的口袋提問", N("3 分鐘", "示範訪談題。高階主管：AI 政策中你最在意哪一條？最近一次管審對 AI 做了什麼決定？剩餘風險是誰核准的？資料科學家：這版模型用哪一版資料訓練？上線前通過了哪些發布準則？偏差怎麼測？MLOps：漂移怎麼發現？最近一次告警怎麼處理？日誌保存多久？"));
    await cards(s, [
      { icon: "FaUserTie", title: "問高階主管", text: ["AI 政策你最在意哪一條？", "最近一次管審對 AI 做了什麼決定？", "不可接受的 AI 風險是誰核准接受的？"] },
      { icon: "FaBrain", title: "問資料科學家", text: ["這版模型用哪一版資料訓練？", "上線前通過哪些發布準則？", "偏差怎麼測、結果在哪？"] },
      { icon: "FaServer", title: "問 MLOps", text: ["漂移怎麼發現？最近一次告警？", "模型更版走什麼變更流程？", "事件日誌記什麼、保存多久？"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.8, cols: 3, textSize: 14 });
    bubble(s, "R", "老師的口頭禪是不是「證據呢？」", MX, 5.55, 5.2, 0.9, 15);
    bubble(s, "A", "對！而且要「拿來看看」，不是「應該有」。", 6.0, 5.55, 6.73, 0.9, 15);
  }
  {
    const s = slideOf("CONTENT", "稽核發現的等級", N("2 分鐘", "主要不符合：未實施或系統性失效、可能導致 AIMS 無法達成預期結果（例：完全沒有衝擊評鑑流程）；次要不符合：個別、偶發的未符合（例：一份評鑑缺核准簽名）；觀察事項：目前符合但有潛在風險；改善機會：可做得更好。實際定義與判定依驗證機構規定。"));
    await cards(s, [
      { badge: "主要", title: "主要不符合", text: "系統性失效或缺漏，例：完全沒有 AI 系統衝擊評鑑流程", color: C.accent2 },
      { badge: "次要", title: "次要不符合", text: "個別、偶發，例：一份衝擊評鑑缺核准紀錄", color: C.accent3 },
      { badge: "觀察", title: "觀察事項", text: "目前符合，但若不處理可能演變為不符合", color: C.accent4 },
      { badge: "機會", title: "改善機會", text: "可做得更好，例：導入自動化偏差監控", color: C.accent6 }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.0, cols: 4, gap: 0.25, titleSize: 16 });
    bubble(s, "A", "判斷三問：影響範圍是個別還是系統？會不會讓 AIMS 失效？有沒有直接傷害關注方？", MX, 4.8, W - 2 * MX, 0.95, 15);
  }
  {
    const s = slideOf("CONTENT", "不符合事項三段式寫法", N("3 分鐘", "要求事項（條文依據）＋客觀證據（可查證的事實，含文件編號、日期、抽樣數）＋不符合陳述。示範 NC：衝擊評鑑未涵蓋可預見的濫用。避免主觀評語與建議解法寫進不符合陳述。"));
    table(s, [
      ["段落", "範例（虛擬：才庫人力）"],
      ["要求事項", "ISO/IEC 42001 6.1.4：AI 系統衝擊評鑑應決定 AI 系統的部署、預期用途和可預見的濫用對個人或群體及社會的潛在後果。"],
      ["客觀證據", "抽查「AI 履歷篩選系統」衝擊評鑑報告（IA-2026-03，2026-03-15 核准），內容僅涵蓋預期用途，未分析系統被用於內部裁員排序等可預見濫用情境。"],
      ["不符合陳述", "組織之 AI 系統衝擊評鑑未涵蓋可預見的濫用，不符合 6.1.4 要求。"]
    ], { x: MX, y: 1.45, w: W - 2 * MX, colW: [1.8, 10.33], fontSize: 14, rowH: [0.5, 0.95, 1.2, 0.7] });
    bubble(s, "R", "那「建議導入更好的工具」可以寫在不符合裡嗎？", MX, 5.15, 6.0, 0.95, 15);
    bubble(s, "A", "不行，不符合只寫事實。建議另列改善機會，解法由受稽方決定。", 6.8, 5.15, 5.93, 0.95, 15);
  }
  {
    const s = slideOf("CONTENT", "AI 情境常見不符合 Top 10", N("3 分鐘", "從線上第 16 章 17 個範例中挑 10 個最常見的。提醒學員：這份清單也是導入時的自我檢核表。"));
    const top = [
      ["4.1", "AI 系統清冊不完整、未判定 AI 角色"],
      ["6.1.1", "風險準則未定義可接受風險"],
      ["6.1.3", "SoA 排除控制措施無理由"],
      ["6.1.3", "剩餘風險未經指定管理層核准"],
      ["6.1.4", "衝擊評鑑未涵蓋可預見的濫用"],
      ["6.2", "AI 目標不可量測、未監控"],
      ["A.7.5", "資料來歷無紀錄"],
      ["A.6.2.4", "驗證確認未定義發布準則"],
      ["A.8.2", "未告知使用者正在與 AI 互動"],
      ["10.2", "矯正措施未確認有效性"]
    ];
    top.forEach((t, i) => {
      const x = MX + (i % 2) * 6.15, y = 1.45 + Math.floor(i / 2) * 0.98;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.95, h: 0.8, rectRadius: 0.08, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: oid("nc") });
      s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.12, w: 0.56, h: 0.56, fill: { color: i < 5 ? C.accent2 : C.accent3 }, line: { color: i < 5 ? C.accent2 : C.accent3 }, objectName: oid("nc-num") });
      s.addText(String(i + 1), { x: x + 0.15, y: y + 0.12, w: 0.56, h: 0.56, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: oid("nc-n") });
      s.addText([{ text: t[0] + "　", options: { bold: true, color: C.accent1 } }, { text: t[1], options: { color: C.text1 } }], { x: x + 0.85, y, w: 5.0, h: 0.8, fontSize: 15, valign: "middle", isTextBox: true, margin: 0, objectName: oid("nc-t") });
    });
  }

  // ---------- 總結 ----------
  startSection("總結");
  {
    const s = slideOf("CONTENT", "導入與稽核十大金句", N("3 分鐘", "逐句快速複習，可請學員一起念。"));
    const q = [
      "先盤點 AI 系統，再談管理", "角色決定要求：逐一系統判定", "沒有準則的評鑑無法比較",
      "後果要看組織、個人、社會", "衝擊評鑑要寫可預見的濫用", "SoA 排除一定要有理由",
      "剩餘風險要有人簽名負責", "發布準則是上線的門票", "人為監管要有權覆寫", "證據要「拿來看看」"
    ];
    q.forEach((t, i) => {
      const x = MX + (i % 2) * 6.15, y = 1.45 + Math.floor(i / 2) * 0.98;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.95, h: 0.8, rectRadius: 0.08, fill: { color: i % 2 ? "FFE8EE" : "E6F4F4" }, line: { color: i % 2 ? "FFE8EE" : "E6F4F4" }, objectName: oid("quote") });
      s.addText([{ text: `${i + 1}. `, options: { bold: true, color: i % 2 ? C.accent2 : C.accent1 } }, { text: t, options: { color: C.text1 } }], { x: x + 0.25, y, w: 5.6, h: 0.8, fontSize: 17, valign: "middle", isTextBox: true, margin: 0, objectName: oid("quote-t") });
    });
  }
  {
    const s = slideOf("CONTENT", "課後學習：線上教材、互動影音、課後測驗", N("1.5 分鐘", "說明線上課程網站（GitHub Pages：docs 資料夾）。三種資源：18 章文字教材（比今天簡報更完整）、講師與阿拉蕾的互動影音（可選章節、調速、有逐字稿與隨堂題）、10 題課後測驗（80 分通過，填寫公司名稱、單位、姓名、職稱、e-mail 後可下載結業證書，附題目與解答；未通過請重新閱讀或再測驗）。請講師將網址替換成實際發布位置。"));
    await cards(s, [
      { icon: "FaBookOpen", title: "文字教材 18 章", text: ["條文、白話解說、實務作法", "管理案例、稽核重點", "每章自我檢測"] },
      { icon: "FaVideo", title: "互動影音", text: ["講師＋阿拉蕾對話教學", "選章節、跳段、調速、逐字稿", "隨堂互動題"] },
      { icon: "FaAward", title: "課後測驗", text: ["10 題，80 分通過", "下載結業證書（附題目與解答）", "未通過可重讀後再測"] }
    ], { x: MX, y: 1.45, w: W - 2 * MX, h: 3.2, cols: 3, textSize: 15 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: MX, y: 4.95, w: W - 2 * MX, h: 0.8, rectRadius: 0.1, fill: { color: C.text2 }, line: { color: C.text2 }, objectName: oid("url-box") });
    s.addText("課程網站：https://allanloplus.github.io/ISO42001_Course/", { x: MX + 0.3, y: 4.95, w: W - 2 * MX - 0.6, h: 0.8, fontSize: 18, bold: true, color: C.background1, valign: "middle", isTextBox: true, margin: 0, objectName: oid("url") });
    bubble(s, "R", "測驗沒過不要哭，回去看影音就會了～んちゃ！", MX, 5.95, 7.5, 0.8, 15);
  }
  {
    const s = slideOf("TITLE", null, N("2 分鐘", "開放提問並感謝學員。"));
    s.addText("Q & A\n謝謝大家！", { placeholder: "title" });
    s.addText("Allan 講師 × 助教阿拉蕾\n「AI 要管，也管得動。」", { placeholder: "body" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.75, y: 0.75, w: 4.0, h: 6.0, rectRadius: 0.2, fill: { color: C.background1 }, line: { color: C.background1 }, objectName: oid("end-frame") });
    s.addImage({ path: ASSET("allan.png"), x: 9.85, y: 1.0, w: 2.75, h: 2.75 * 948 / 560, objectName: oid("end-allan"), altText: "Allan 講師" });
    s.addImage({ path: ASSET("arale.png"), x: 8.85, y: 4.35, w: 2.2, h: 2.2 * 380 / 420, objectName: oid("end-arale"), altText: "助教阿拉蕾" });
  }

  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) {
    const { applyTheme } = require(APPLY_THEME);
    await applyTheme(OUT, THEME);
  }
  console.log("written", OUT, "slides:", pres.slides.length);
}

build().catch(e => { console.error(e); process.exit(1); });
