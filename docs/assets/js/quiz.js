/* 課後測驗：學員資料 → 作答 → 判定 → 通過證書（PNG／PDF 含題目與解答）或重新學習 */
(function () {
  const CFG = window.QUIZ_CONFIG, BANK = window.QUIZ, CH = window.COURSE.chapters;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const FIELDS = ["company", "unit", "name", "title", "email"];
  const LABEL = { company: "公司名稱", unit: "單位", name: "姓名", title: "職稱", email: "E-mail" };
  const SS = "iso42001-quiz-info";
  const FONT = '"Noto Sans TC","PingFang TC","Microsoft JhengHei","Heiti TC",sans-serif';
  const SERIF = '"Noto Serif TC","Songti TC","PMingLiU","MingLiU",serif';
  let info = null, paper = null, result = null;

  // 個資告知：依是否設定回傳網址顯示不同說明
  $("#privacyNotice").innerHTML = CFG.submitUrl
    ? "🔒 <b>個人資料蒐集告知：</b>以上資料僅用於製作您的結業證書及課程結業紀錄，將傳送至課程管理者保存，不會作其他用途或未經同意提供予第三人；您可向課程管理者要求查詢、更正或刪除。若不提供，將無法核發證書。"
    : "🔒 <b>個人資料告知：</b>以上資料僅用於在您的瀏覽器中產生結業證書，<b>不會上傳至任何伺服器</b>。若不提供，將無法核發證書。";

  // 回填上次輸入
  try { const s = JSON.parse(sessionStorage.getItem(SS)); if (s) FIELDS.forEach(f => { if (s[f]) $("#" + f).value = s[f]; }); } catch (e) { }

  function validate() {
    let ok = true;
    const v = {};
    FIELDS.forEach(f => {
      const input = $("#" + f), err = input.parentElement.querySelector(".err");
      const val = input.value.trim().replace(/\s+/g, " ");
      v[f] = val;
      let msg = "";
      if (!val) msg = `請填寫${LABEL[f]}`;
      else if (f === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) msg = "E-mail 格式不正確";
      err.textContent = msg;
      if (msg) ok = false;
    });
    if (!$("#agree").checked) { ok = false; alert("請勾選同意個人資料蒐集告知事項。"); }
    return ok ? v : null;
  }

  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function buildPaper() {
    // 題目順序與選項順序皆隨機
    paper = shuffle(BANK.map((q, i) => i)).map(i => {
      const q = BANK[i];
      const order = shuffle(q.options.map((o, k) => k));
      return { src: i, q: q.q, options: order.map(k => q.options[k]), answer: order.indexOf(q.answer), explain: q.explain, ch: q.ch, pick: null };
    });
    const form = $("#quizForm");
    form.innerHTML = "";
    paper.forEach((p, n) => {
      const d = document.createElement("div");
      d.className = "qitem";
      d.innerHTML = `<div class="qt">${n + 1}. ${esc(p.q)}</div>` + p.options.map((o, k) =>
        `<label><input type="radio" name="q${n}" value="${k}"><span>(${"ABCD"[k]}) ${esc(o)}</span></label>`).join("");
      d.addEventListener("change", e => { p.pick = +e.target.value; d.classList.remove("missing"); prog(); });
      form.appendChild(d);
    });
    prog();
  }
  function prog() { $("#qProg").style.width = (paper.filter(p => p.pick != null).length / paper.length * 100) + "%"; }

  function show(step) {
    ["#stepInfo", "#stepQuiz", "#stepResult"].forEach(s => $(s).hidden = s !== step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $("#infoForm").addEventListener("submit", e => {
    e.preventDefault();
    const v = validate();
    if (!v) return;
    info = v;
    try { sessionStorage.setItem(SS, JSON.stringify(v)); } catch (e2) { }
    $("#who").textContent = `${v.company}／${v.unit}／${v.name} ${v.title}`;
    buildPaper();
    show("#stepQuiz");
  });
  $("#backInfo").onclick = () => show("#stepInfo");

  $("#submitQuiz").onclick = () => {
    const missing = paper.map((p, i) => p.pick == null ? i : -1).filter(i => i >= 0);
    if (missing.length) {
      document.querySelectorAll(".qitem").forEach((d, i) => d.classList.toggle("missing", missing.includes(i)));
      alert(`尚有 ${missing.length} 題未作答：第 ${missing.map(i => i + 1).join("、")} 題`);
      document.querySelectorAll(".qitem")[missing[0]].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const correct = paper.filter(p => p.pick === p.answer).length;
    const score = correct * CFG.points;
    const passed = score >= CFG.passScore;
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const certNo = `AIMS-${date.replace(/-/g, "")}-${hash(info.email + info.name + now.getTime()).slice(0, 6)}`;
    result = { score, correct, passed, date, certNo };
    report();
    passed ? renderPass() : renderFail();
    show("#stepResult");
  };

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36).toUpperCase().padStart(7, "0");
  }

  function report() {
    if (!CFG.submitUrl) return;
    const body = JSON.stringify(Object.assign({}, info, { score: result.score, passed: result.passed, certNo: result.certNo, date: result.date, course: CFG.courseName }));
    fetch(CFG.submitUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body }).catch(() => { });
  }

  // ---------- 未通過 ----------
  function renderFail() {
    const wrong = paper.filter(p => p.pick !== p.answer);
    const chs = [...new Set(wrong.map(p => p.ch))].sort();
    const links = chs.map(id => { const c = CH.find(x => x.id === id); const n = CH.indexOf(c); return `<li><b>第 ${n} 章 ${esc(c.short)}</b>　<a href="text/${id}.html">📖 文字教材</a>　<a href="video.html?ch=${id}">▶ 互動影音</a></li>`; }).join("");
    $("#stepResult").innerHTML = `
      <h2 style="margin-top:0">測驗結果</h2>
      <div class="score fail">${result.score} 分</div>
      <p>答對 ${result.correct} / ${paper.length} 題，<b>未達 ${CFG.passScore} 分通過標準</b>。別灰心！阿拉蕾說：「再複習一下就一定可以的啦～んちゃ！」</p>
      <p>答錯的題目為：第 ${paper.map((p, i) => p.pick !== p.answer ? i + 1 : 0).filter(Boolean).join("、")} 題。建議重新閱讀以下章節：</p>
      <ul>${links}</ul>
      <p class="notice">為確保學習成效，未通過時不公布標準答案。請重新閱讀後再次測驗（重新測驗時題目與選項順序會重新排列）。</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" id="retry">🔄 重新測驗</button>
        <a class="btn soft" href="index.html">📚 回到課程首頁重新閱讀</a>
      </div>`;
    $("#retry").onclick = () => { buildPaper(); show("#stepQuiz"); };
  }

  // ---------- 通過 ----------
  function renderPass() {
    $("#stepResult").innerHTML = `
      <h2 style="margin-top:0">🎉 恭喜通過！</h2>
      <div class="score pass">${result.score} 分</div>
      <p>答對 ${result.correct} / ${paper.length} 題。以下為您的結業證書，可下載 PNG 圖檔，或下載 PDF（第 1 頁為證書，後續頁為測驗題目與解答）。</p>
      <canvas id="certCanvas" width="2000" height="1414" aria-label="結業證書"></canvas>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0">
        <button class="btn" id="dlPdf">📄 下載證書 PDF（含題目與解答）</button>
        <button class="btn soft" id="dlPng">🖼 下載證書 PNG</button>
        <button class="btn soft" id="dlQa">📝 下載題目與解答 PNG</button>
      </div>
      <h3>測驗題目與解答</h3>
      <ol class="answer-list">${paper.map(p => `<li>${esc(p.q)}<br>
        ${p.options.map((o, k) => `<span style="${k === p.answer ? "color:var(--ok);font-weight:700" : ""}">(${"ABCD"[k]}) ${esc(o)}${k === p.answer ? " ✔" : ""}</span>`).join("<br>")}
        <br><small>您的答案：(${"ABCD"[p.pick]}) ${p.pick === p.answer ? "✅ 正確" : "❌ 錯誤"}　｜　解析：${esc(p.explain)}</small></li>`).join("")}</ol>
      <a class="btn soft" href="index.html">回到課程首頁</a>`;
    const imgs = loadImgs(["assets/img/allan.webp", "assets/img/arale.webp"]);
    imgs.then(([a, r]) => {
      const cv = $("#certCanvas");
      drawCert(cv, a, r);
      // 以 file:// 開啟時圖片會污染 canvas，改為不含頭像重繪以便下載
      try { cv.toDataURL(); } catch (e) { drawCert(cv, null, null); }
    });
    const base = `ISO42001結業證書_${info.name}_${result.certNo}`;
    $("#dlPng").onclick = () => download($("#certCanvas").toDataURL("image/png"), base + ".png");
    $("#dlQa").onclick = () => qaPages().forEach((c, i, all) => download(c.toDataURL("image/png"), `${base}_題目與解答${all.length > 1 ? "_" + (i + 1) : ""}.png`));
    $("#dlPdf").onclick = async () => {
      const btn = $("#dlPdf");
      btn.disabled = true; btn.textContent = "產生 PDF 中…";
      try {
        await loadScript("assets/vendor/jspdf.umd.min.js");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
        doc.addImage($("#certCanvas").toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 297, 210);
        qaPages().forEach(c => { doc.addPage("a4", "portrait"); doc.addImage(c.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, 210, 297); });
        doc.save(base + ".pdf");
      } catch (e) {
        alert("PDF 元件載入失敗（瀏覽器不支援），將改用列印功能，請在列印視窗選擇「另存為 PDF」。");
        printFallback();
      }
      btn.disabled = false; btn.textContent = "📄 下載證書 PDF（含題目與解答）";
    };
  }

  const loadImgs = srcs => Promise.all(srcs.map(s => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = s; })));
  const loadScript = src => new Promise((res, rej) => { if (window.jspdf) return res(); const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  function download(url, name) { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  function printFallback() {
    const w = window.open("", "_blank");
    if (!w) return;
    const pages = [$("#certCanvas")].concat(qaPages()).map(c => `<img src="${c.toDataURL("image/png")}" style="width:100%;page-break-after:always">`).join("");
    w.document.write(`<!doctype html><title>結業證書</title><body style="margin:0">${pages}<script>onload=function(){print()}<\/script></body>`);
    w.document.close();
  }

  // ---------- 證書繪製 ----------
  function fitText(ctx, text, maxW, size, weight, family) {
    let s = size;
    do { ctx.font = `${weight} ${s}px ${family}`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 16);
  }
  function drawCert(cv, allan, arale) {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height;
    // 背景與邊框
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#fffdf6"); g.addColorStop(1, "#f3f6ff");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = "#1f4fd1"; c.lineWidth = 18; c.strokeRect(40, 40, W - 80, H - 80);
    c.strokeStyle = "#c9a227"; c.lineWidth = 5; c.strokeRect(78, 78, W - 156, H - 156);
    // 角落裝飾
    c.fillStyle = "#c9a227";
    [[78, 78], [W - 78, 78], [78, H - 78], [W - 78, H - 78]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.fill(); });
    c.textAlign = "center"; c.textBaseline = "alphabetic";
    c.fillStyle = "#0f8b8d"; c.font = `700 34px ${FONT}`; c.fillText("ISO/IEC 42001:2023  ARTIFICIAL INTELLIGENCE MANAGEMENT SYSTEM", W / 2, 205);
    c.fillStyle = "#1f2a44"; c.font = `900 120px ${SERIF}`; c.fillText("結 業 證 書", W / 2, 350);
    c.fillStyle = "#8a94a8"; c.font = `600 38px ${FONT}`; c.fillText("CERTIFICATE OF COMPLETION", W / 2, 410);
    c.fillStyle = "#333"; c.font = `500 44px ${FONT}`; c.fillText("茲證明", W / 2, 510);
    c.fillStyle = "#1f4fd1"; fitText(c, info.name, 1100, 110, 900, SERIF); c.fillText(info.name, W / 2, 640);
    c.strokeStyle = "#c9a227"; c.lineWidth = 3; c.beginPath(); c.moveTo(W / 2 - 420, 668); c.lineTo(W / 2 + 420, 668); c.stroke();
    c.fillStyle = "#333";
    const line1 = `${info.company}　${info.unit}　${info.title}`;
    fitText(c, line1, 1500, 44, 500, FONT); c.fillText(line1, W / 2, 745);
    c.font = `500 44px ${FONT}`;
    c.fillText(`已完成「${CFG.courseName}」`, W / 2, 830);
    c.fillText(`並通過課後測驗，成績 ${result.score} 分，特頒此證。`, W / 2, 900);
    // 證書資訊
    c.textAlign = "left"; c.fillStyle = "#555"; c.font = `500 32px ${FONT}`;
    c.fillText(`證書編號：${result.certNo}`, 200, 1120);
    c.fillText(`發證日期：${result.date}`, 200, 1170);
    c.fillText(`E-mail：${info.email}`, 200, 1220);
    // 講師簽名
    c.textAlign = "center";
    c.font = `italic 700 70px "Brush Script MT","Segoe Script",cursive`; c.fillStyle = "#1f2a44"; c.fillText(CFG.instructor, W - 520, 1150);
    c.strokeStyle = "#333"; c.lineWidth = 2; c.beginPath(); c.moveTo(W - 700, 1175); c.lineTo(W - 340, 1175); c.stroke();
    c.font = `500 32px ${FONT}`; c.fillStyle = "#555"; c.fillText(`課程講師　${CFG.instructor}`, W - 520, 1222);
    // 通過章戳
    c.save(); c.translate(W / 2, 1150); c.rotate(-0.18);
    c.strokeStyle = "rgba(198,47,60,.85)"; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, 105, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 88, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "rgba(198,47,60,.9)"; c.font = `900 56px ${FONT}`; c.fillText("PASS", 0, 12); c.font = `700 24px ${FONT}`; c.fillText("測驗通過", 0, 52);
    c.restore();
    // 講師與助教
    if (arale) drawRound(c, arale, 120, 420, 230, 208);
    if (allan) drawRound(c, allan, W - 330, 360, 200, 338);
  }
  function drawRound(c, img, x, y, w, h) {
    c.save(); c.beginPath();
    const r = 24; c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    c.fillStyle = "#fff"; c.fill(); c.clip(); c.drawImage(img, x, y, w, h); c.restore();
    c.strokeStyle = "#dde2ec"; c.lineWidth = 3; c.strokeRect(x, y, w, h);
  }

  // ---------- 題目與解答頁（A4 直式） ----------
  function wrap(c, text, maxW) {
    const out = []; let line = "";
    for (const ch of text) {
      if (c.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch;
    }
    if (line) out.push(line);
    return out;
  }
  function qaPages() {
    const W = 1240, H = 1754, M = 90, maxW = W - M * 2;
    const pages = [];
    let cv, c, y;
    const newPage = () => {
      cv = document.createElement("canvas"); cv.width = W; cv.height = H; c = cv.getContext("2d");
      c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
      c.fillStyle = "#1f4fd1"; c.font = `800 34px ${FONT}`; c.textAlign = "left";
      c.fillText("ISO/IEC 42001 課後測驗　題目與解答", M, 100);
      c.fillStyle = "#666"; c.font = `400 20px ${FONT}`;
      c.fillText(`${info.name}｜${info.company} ${info.unit}｜成績 ${result.score} 分｜證書編號 ${result.certNo}｜${result.date}`, M, 140);
      c.strokeStyle = "#dde2ec"; c.lineWidth = 2; c.beginPath(); c.moveTo(M, 160); c.lineTo(W - M, 160); c.stroke();
      y = 205; pages.push(cv);
    };
    const put = (text, font, color, lh, indent) => {
      c.font = font; c.fillStyle = color;
      wrap(c, text, maxW - (indent || 0)).forEach(l => {
        if (y > H - 90) { newPage(); c.font = font; c.fillStyle = color; }
        c.fillText(l, M + (indent || 0), y); y += lh;
      });
    };
    newPage();
    paper.forEach((p, i) => {
      // 預估本題高度，不足時換頁
      if (y > H - 420) newPage();
      put(`${i + 1}. ${p.q}`, `700 25px ${FONT}`, "#1d2433", 38, 0);
      p.options.forEach((o, k) => put(`(${"ABCD"[k]}) ${o}${k === p.answer ? "　✔ 正確答案" : ""}`, `${k === p.answer ? 700 : 400} 23px ${FONT}`, k === p.answer ? "#138a4b" : "#333", 34, 24));
      put(`您的答案：(${"ABCD"[p.pick]}) ${p.pick === p.answer ? "正確" : "錯誤"}`, `600 21px ${FONT}`, p.pick === p.answer ? "#138a4b" : "#c62f3c", 32, 24);
      put(`解析：${p.explain}`, `400 21px ${FONT}`, "#555", 32, 24);
      y += 22;
    });
    pages.forEach((p, i) => { const cc = p.getContext("2d"); cc.fillStyle = "#999"; cc.font = `400 18px ${FONT}`; cc.textAlign = "center"; cc.fillText(`第 ${i + 1} / ${pages.length} 頁`, W / 2, H - 45); });
    return pages;
  }
})();
