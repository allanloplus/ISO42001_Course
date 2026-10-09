/* 互動影音播放器：逐句語音 + 字卡 + 角色動畫 + 互動檢核點
 * 設計重點：每句語音為獨立小檔（數十 KB），點下播放即可開始，並預先載入後續 3 句，
 * 避免整段影片長時間緩衝。 */
(function () {
  const params = new URLSearchParams(location.search);
  const chapters = window.COURSE.chapters;
  let chId = params.get("ch") || chapters[0].id;
  if (!chapters.some(c => c.id === chId)) chId = chapters[0].id;
  const chIndex = chapters.findIndex(c => c.id === chId);
  const NAMES = { A: "Allan 講師", R: "助教 阿拉蕾" };
  const POS_KEY = "iso42001-video-pos-" + chId;

  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // 章節選單
  const sel = $("#chapterSelect");
  chapters.forEach((c, i) => {
    const o = el("option", null, `${String(i).padStart(2, "0")}｜${esc(c.short)}`);
    o.value = c.id; if (c.id === chId) o.selected = true; sel.appendChild(o);
  });
  sel.addEventListener("change", () => { location.search = "?ch=" + sel.value; });
  $("#readLink").href = `text/${chId}.html`;
  document.title = `${chapters[chIndex].short}｜互動影音｜ISO 42001 線上課程`;

  // 載入本章腳本（小型 JS 檔，file:// 也可使用）
  const sc = document.createElement("script");
  sc.src = `data/video/${chId}.js`;
  sc.onload = () => init(window.VIDEO_DATA);
  sc.onerror = () => { $("#overlay").innerHTML = "<h2>本章影音尚未建置</h2><p>請先閱讀文字教材。</p>"; };
  document.head.appendChild(sc);

  function init(data) {
    const scenes = data.scenes;
    const audio = new Audio();
    audio.preload = "auto";
    const preloaded = new Map();
    const st = { si: 0, li: 0, phase: "lines", playing: false, rate: 1, subs: true, answers: {}, timer: null, started: false };

    const stage = $("#stage"), card = $("#card"), bubble = $("#bubble"), who = $("#who"), txt = $("#txt");
    const chars = { A: $("#allan"), R: $("#arale") };
    const playBtn = $("#play"), loading = $("#loading");

    $("#chTitle").textContent = data.title;

    // 總時長（建置時已量測每句長度）
    const allLines = [];
    scenes.forEach((s, i) => { s.lines.forEach(l => allLines.push([i, l])); (s.after || []).forEach(l => allLines.push([i, l])); });
    const totalMs = allLines.reduce((a, [, l]) => a + (l.d || 3000), 0);
    const fmt = ms => { const t = Math.round(ms / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };

    // 段落進度條與目錄
    const segbar = $("#segbar"), list = $("#sceneList");
    scenes.forEach((s, i) => {
      const seg = el("span", s.type === "quiz" ? "quiz" : "", "<i></i>");
      seg.title = `${i + 1}. ${s.title}`;
      seg.onclick = () => goScene(i, true);
      segbar.appendChild(seg);
      const b = el("button", null, `<span class="n">${i + 1}</span>${s.type === "quiz" ? "❓ " : ""}${esc(s.title)}`);
      b.onclick = () => goScene(i, true);
      list.appendChild(b);
    });

    // 逐字稿
    const tr = $("#transcriptBody");
    scenes.forEach((s, i) => {
      tr.appendChild(el("h4", null, `${i + 1}. ${esc(s.title)}`));
      const add = l => tr.appendChild(el("p", null, `<b class="${l.s}">${NAMES[l.s]}：</b>${esc(l.t)}`));
      s.lines.forEach(add);
      if (s.type === "quiz") {
        tr.appendChild(el("p", null, `<b>【互動題】</b>${esc(s.q)}<br>${s.options.map((o, k) => `(${"ABCD"[k]}) ${esc(o)}`).join("　")}`));
        tr.appendChild(el("p", null, `<b>【解答】</b>(${"ABCD"[s.answer]}) ${esc(s.explain)}`));
        (s.after || []).forEach(add);
      }
    });

    const list_ = () => st.phase === "after" ? (scenes[st.si].after || []) : scenes[st.si].lines;

    function renderScene() {
      const s = scenes[st.si];
      card.innerHTML = "";
      card.appendChild(el("div", "kicker", `${data.title.split("　")[0]}　·　${st.si + 1} / ${scenes.length}`));
      card.appendChild(el("h2", null, esc(s.title)));
      if (s.type === "quiz") {
        card.appendChild(el("div", "q", "❓ " + esc(s.q)));
        const box = el("div", "opts");
        s.options.forEach((o, k) => {
          const b = el("button", "opt", `<b>${"ABCD"[k]}.</b> ${esc(o)}`);
          b.onclick = () => answer(k);
          box.appendChild(b);
        });
        card.appendChild(box);
        if (st.answers[st.si] != null) showAnswer(st.answers[st.si], false);
      } else {
        const ul = el("ul");
        (s.bullets || []).forEach((t, k) => { const li = el("li", null, esc(t)); li.style.animationDelay = (0.25 + k * 0.55) + "s"; ul.appendChild(li); });
        card.appendChild(ul);
      }
      [...list.children].forEach((b, i) => b.classList.toggle("cur", i === st.si));
      [...segbar.children].forEach((g, i) => {
        g.classList.toggle("cur", i === st.si);
        g.firstChild.style.width = i < st.si ? "100%" : "0";
      });
      list.children[st.si].scrollIntoView({ block: "nearest" });
      try { localStorage.setItem(POS_KEY, String(st.si)); } catch (e) { }
    }

    function showAnswer(k, speak) {
      const s = scenes[st.si];
      st.answers[st.si] = k;
      card.querySelectorAll(".opt").forEach((b, i) => {
        b.disabled = true;
        if (i === s.answer) b.classList.add("right");
        else if (i === k) b.classList.add("wrong");
      });
      const ok = k === s.answer;
      card.querySelector(".explain")?.remove();
      card.appendChild(el("div", "explain", `${ok ? "🎉 答對了！" : "😅 差一點！正確答案是 " + "ABCD"[s.answer]}　${esc(s.explain)}`));
      if (speak) { stopAudio(); st.phase = "after"; st.li = 0; st.playing = true; updatePlayBtn(); playLine(); }
    }
    function answer(k) { if (st.answers[st.si] == null) showAnswer(k, true); }

    function setSpeaker(s) {
      bubble.className = "bubble " + s + (st.subs ? "" : " hidden-sub");
      who.textContent = NAMES[s];
      for (const k in chars) {
        chars[k].classList.toggle("idle", k !== s);
        chars[k].classList.toggle("talking", k === s && st.playing);
      }
    }

    function updateProgress() {
      const lines = list_();
      const seg = segbar.children[st.si];
      const s = scenes[st.si];
      const n = s.lines.length + (s.after || []).length;
      const done = (st.phase === "after" ? s.lines.length : 0) + st.li;
      seg.firstChild.style.width = Math.min(100, (done / Math.max(1, n)) * 100) + "%";
      let ms = 0;
      for (let i = 0; i < st.si; i++) { scenes[i].lines.forEach(l => ms += l.d || 3000); (scenes[i].after || []).forEach(l => ms += l.d || 3000); }
      if (st.phase === "after") s.lines.forEach(l => ms += l.d || 3000);
      for (let i = 0; i < st.li && i < lines.length; i++) ms += lines[i].d || 3000;
      $("#time").textContent = `${fmt(ms)} / ${fmt(totalMs)}`;
    }

    function upcoming(n) {
      const out = []; let si = st.si, li = st.li + 1, ph = st.phase;
      while (out.length < n && si < scenes.length) {
        const L = ph === "after" ? (scenes[si].after || []) : scenes[si].lines;
        if (li < L.length) { out.push(L[li++]); continue; }
        if (ph === "lines" && scenes[si].type === "quiz") { ph = "after"; li = 0; continue; }
        si++; li = 0; ph = "lines";
      }
      return out;
    }
    function preload() {
      upcoming(3).forEach(l => {
        if (l.a && !preloaded.has(l.a)) { const a = new Audio(); a.preload = "auto"; a.src = l.a; preloaded.set(l.a, a); }
      });
      if (preloaded.size > 40) { const k = preloaded.keys().next().value; preloaded.delete(k); }
    }

    function stopAudio() { clearTimeout(st.timer); audio.pause(); }

    function playLine() {
      const lines = list_();
      const line = lines[st.li];
      if (!line) return next();
      setSpeaker(line.s);
      txt.textContent = line.t;
      updateProgress();
      if (!st.playing) return;
      clearTimeout(st.timer);
      if (line.a) {
        audio.src = line.a;
        audio.playbackRate = st.rate;
        audio.play().catch(() => fallback(line));
      } else fallback(line);
      preload();
    }
    function fallback(line) {
      // 無法播放語音時，依字數計時自動前進（仍可閱讀字幕）
      clearTimeout(st.timer);
      st.timer = setTimeout(next, Math.max(2200, line.t.length * 240) / st.rate);
    }
    audio.addEventListener("ended", () => { if (st.playing) next(); });
    audio.addEventListener("error", () => { if (st.playing) fallback(list_()[st.li] || { t: "" }); });
    audio.addEventListener("waiting", () => loading.style.display = "block");
    audio.addEventListener("playing", () => loading.style.display = "none");

    function next() {
      st.li++;
      if (st.li < list_().length) return playLine();
      const s = scenes[st.si];
      if (st.phase === "lines" && s.type === "quiz") {
        if (st.answers[st.si] == null) {
          // 等待學員作答
          st.li = list_().length - 1;
          for (const k in chars) chars[k].classList.remove("talking");
          txt.textContent = "👉 請點選上方的答案，作答後會繼續播放喔！";
          return;
        }
        st.phase = "after"; st.li = 0;
        if ((s.after || []).length) return playLine();
      }
      goScene(st.si + 1, false);
    }

    function goScene(i, manual) {
      stopAudio();
      if (i >= scenes.length) return finish();
      if (i < 0) i = 0;
      st.si = i; st.li = 0; st.phase = "lines";
      renderScene();
      if (manual && !st.started) { st.started = true; $("#overlay").style.display = "none"; st.playing = true; updatePlayBtn(); }
      playLine();
    }

    function prevLine() {
      stopAudio();
      if (st.li > 0) { st.li--; return playLine(); }
      if (st.phase === "after") { st.phase = "lines"; st.li = scenes[st.si].lines.length - 1; return playLine(); }
      goScene(st.si - 1, false);
    }
    function nextLine() { stopAudio(); next(); }

    function togglePlay() {
      if (!st.started) return start(0);
      st.playing = !st.playing;
      updatePlayBtn();
      if (st.playing) {
        const line = list_()[st.li];
        if (line && line.a && audio.src && !audio.ended && audio.currentTime > 0) audio.play().catch(() => fallback(line));
        else playLine();
      } else stopAudio();
      for (const k in chars) chars[k].classList.toggle("talking", st.playing && !chars[k].classList.contains("idle"));
    }
    function updatePlayBtn() { playBtn.textContent = st.playing ? "⏸" : "▶"; playBtn.title = st.playing ? "暫停 (空白鍵)" : "播放 (空白鍵)"; }

    function start(at) {
      st.started = true; st.playing = true;
      $("#overlay").style.display = "none";
      updatePlayBtn();
      goScene(at, false);
    }

    function finish() {
      st.playing = false; updatePlayBtn();
      for (const k in chars) chars[k].classList.remove("talking");
      [...segbar.children].forEach(g => g.firstChild.style.width = "100%");
      window.Progress.mark(chId, "video");
      try { localStorage.removeItem(POS_KEY); } catch (e) { }
      const nx = chapters[chIndex + 1];
      const ov = $("#overlay");
      ov.innerHTML = `<h2>🎉 本章影音完成！</h2><p>${esc(data.title)}</p>
        <div class="row">
          ${nx ? `<a class="btn pink" href="video.html?ch=${nx.id}">下一章：${esc(nx.short)} ▶</a>` : `<a class="btn pink" href="quiz.html">前往課後測驗 ✍️</a>`}
          <a class="btn" href="text/${chId}.html">閱讀本章文字教材 📖</a>
          <button class="btn soft" id="replay">重看本章 ↺</button>
        </div>`;
      ov.style.display = "flex";
      $("#replay").onclick = () => { ov.style.display = "none"; start(0); };
    }

    // 開場覆蓋層（腳本很小，立即可按）
    let saved = 0;
    try { saved = parseInt(localStorage.getItem(POS_KEY) || "0", 10) || 0; } catch (e) { }
    if (saved >= scenes.length) saved = 0;
    const ov = $("#overlay");
    ov.innerHTML = `<h2>${esc(data.title)}</h2>
      <p>共 ${scenes.length} 段・約 ${Math.max(1, Math.round(totalMs / 60000))} 分鐘・含 ${scenes.filter(s => s.type === "quiz").length} 個互動題</p>
      <button class="big" id="startBtn">▶ 開始播放</button>
      ${saved > 0 ? `<button class="btn soft" id="resumeBtn">從上次的第 ${saved + 1} 段繼續</button>` : ""}
      <p style="font-size:13px;opacity:.8">快捷鍵：空白鍵 播放/暫停　← → 上/下一句　F 全螢幕</p>`;
    $("#startBtn").onclick = () => start(0);
    if (saved > 0) $("#resumeBtn").onclick = () => start(saved);
    renderScene();
    setSpeaker(scenes[0].lines[0].s);
    txt.textContent = scenes[0].lines[0].t;
    updateProgress();
    // 預先載入第一句語音，按下播放可立即發聲
    const first = scenes[0].lines[0];
    if (first.a) { audio.src = first.a; audio.load(); }

    // 控制列
    playBtn.onclick = togglePlay;
    $("#prevLine").onclick = prevLine;
    $("#nextLine").onclick = nextLine;
    $("#prevScene").onclick = () => goScene(st.si - 1, true);
    $("#nextScene").onclick = () => goScene(st.si + 1, true);
    $("#rate").onchange = e => { st.rate = parseFloat(e.target.value); audio.playbackRate = st.rate; };
    $("#subs").onclick = e => { st.subs = !st.subs; e.target.textContent = st.subs ? "字幕：開" : "字幕：關"; bubble.classList.toggle("hidden-sub", !st.subs); };
    $("#fs").onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else stage.requestFullscreen?.(); };
    document.addEventListener("keydown", e => {
      if (e.target.closest("select,input,textarea")) return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowRight") nextLine();
      else if (e.code === "ArrowLeft") prevLine();
      else if (e.key === "f" || e.key === "F") $("#fs").click();
    });
  }
})();
