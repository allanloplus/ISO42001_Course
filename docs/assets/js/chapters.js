/* 課程章節表（文字教材、互動影音、首頁共用） */
window.COURSE = {
  title: "ISO/IEC 42001:2023 人工智慧管理系統",
  subtitle: "標準詳解 × 管理案例 × 稽核實務",
  chapters: [
    { id: "ch00", group: "課程導覽", title: "課程導覽：為什麼需要 ISO 42001？AI 治理與法規趨勢", short: "課程導覽與 AI 治理趨勢" },
    { id: "ch01", group: "標準基礎", title: "標準架構、適用範圍與用語定義（條文 1–3）", short: "標準架構與用語定義" },
    { id: "ch02", group: "條文詳解", title: "條文 4：組織全景與 AI 角色定位", short: "條文 4 組織全景" },
    { id: "ch03", group: "條文詳解", title: "條文 5：領導作為與人工智慧政策", short: "條文 5 領導作為" },
    { id: "ch04", group: "條文詳解", title: "條文 6.1.1–6.1.3：AI 風險評鑑、風險處理與適用性聲明", short: "條文 6 風險評鑑與 SoA" },
    { id: "ch05", group: "條文詳解", title: "條文 6.1.4、6.2、6.3：AI 系統衝擊評鑑、AI 目標與變更規劃", short: "條文 6 衝擊評鑑與目標" },
    { id: "ch06", group: "條文詳解", title: "條文 7：支援（資源、能力、認知、溝通、文件化資訊）", short: "條文 7 支援" },
    { id: "ch07", group: "條文詳解", title: "條文 8：運作", short: "條文 8 運作" },
    { id: "ch08", group: "條文詳解", title: "條文 9：績效評估（監督量測、內部稽核、管理審查）", short: "條文 9 績效評估" },
    { id: "ch09", group: "條文詳解", title: "條文 10：改善（持續改善、不符合事項與矯正措施）", short: "條文 10 改善" },
    { id: "ch10", group: "附錄 A/B 控制措施", title: "附錄 A/B（一）：A.2 政策、A.3 內部組織、A.4 資源、A.5 衝擊評鑑", short: "A.2–A.5 控制措施" },
    { id: "ch11", group: "附錄 A/B 控制措施", title: "附錄 A/B（二）：A.6 人工智慧系統生命週期", short: "A.6 AI 生命週期" },
    { id: "ch12", group: "附錄 A/B 控制措施", title: "附錄 A/B（三）：A.7 資料、A.8 關注方資訊、A.9 使用、A.10 第三方與客戶", short: "A.7–A.10 控制措施" },
    { id: "ch13", group: "整合與導入", title: "附錄 C/D、與 ISO 27001/27701/9001 整合及導入路徑", short: "附錄 C/D 與整合導入" },
    { id: "ch14", group: "管理案例", title: "管理案例集：六大產業 AIMS 實戰", short: "六大產業管理案例" },
    { id: "ch15", group: "稽核實務", title: "稽核實務（一）：驗證流程、ISO/IEC 42006 與稽核技巧", short: "驗證流程與稽核技巧" },
    { id: "ch16", group: "稽核實務", title: "稽核實務（二）：常見不符合事項、開立寫法與稽核檢查表", short: "常見不符合與檢查表" },
    { id: "ch17", group: "總複習", title: "總複習與課後測驗說明", short: "總複習與測驗說明" }
  ]
};

/* 學習進度（僅存在學員自己的瀏覽器） */
window.Progress = {
  key: "iso42001-progress-v1",
  load() {
    try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { return {}; }
  },
  save(p) {
    try { localStorage.setItem(this.key, JSON.stringify(p)); } catch (e) { /* 私密模式等情況忽略 */ }
  },
  mark(id, kind) {
    const p = this.load();
    p[id] = p[id] || {};
    p[id][kind] = true;
    this.save(p);
  },
  get(id) { return this.load()[id] || {}; }
};
