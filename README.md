# ISO/IEC 42001:2023 人工智慧管理系統 — 完整課程

講師 **Allan** × 助教 **阿拉蕾**｜標準詳解 × 管理案例 × 稽核實務

| 交付項目 | 位置 | 說明 |
|---|---|---|
| 實體課程簡報（3 小時） | `slides/ISO42001_實體課程簡報_3小時.pptx` | 66 張投影片，9 個單元＋分組演練；每張都有講者備註（建議時間、講述重點、互動與阿拉蕾串場台詞） |
| 線上課程網站 | `docs/` | 首頁＋章節選擇、文字教材、互動影音、課後測驗，可直接用 GitHub Pages 發布 |
| 文字教材原稿 | `content/text/ch00.md`–`ch17.md` | 18 章，約 13 萬中文字；內容比簡報完整（條文要求、白話解說、實務作法、管理案例、稽核重點、自我檢測） |
| 互動影音腳本 | `content/video/ch00.json`–`ch17.json` | 講師與助教的對話腳本，含隨堂互動題 |
| 課後測驗 | `docs/quiz.html`、`docs/assets/js/quiz-data.js` | 10 題，80 分通過；通過可下載證書（PDF 含題目與解答／PNG） |

## 線上課程網站功能

- **章節選擇**：首頁可依「標準基礎／條文詳解／附錄控制措施／案例／稽核」篩選章節；文字教材左側也有章節選單，影音頁上方有章節下拉選單。
- **文字教材**：每章有本章目錄、上一章／下一章、標記已讀；學習進度存在學員自己的瀏覽器。
- **互動影音**：
  - 講師與助教的對話式動畫，Allan 用台灣男聲（zh-TW-YunJheNeural），阿拉蕾用年輕女聲（zh-TW-HsiaoYuNeural，調高音調）。
  - 字卡會逐點出現，說話的角色會跳動。
  - 每章有 2–5 個互動題，影片會暫停等學員作答，答完再接著播放。
  - 可跳段、上一句／下一句、調速（0.8x–1.75x）、開關字幕、全螢幕，並附逐字稿；會記住上次看到的段落。
  - **載入速度**：每句語音都是獨立小檔（約 20–60 KB），按下播放立即發聲，並在背景預載後續 3 句，不需要等整段影片緩衝。
- **課後測驗**：
  - 作答前須填公司名稱、單位、姓名、職稱、e-mail，並勾選個資告知同意。
  - 題目與選項順序每次都會重新隨機排列。
  - **通過（≥ 80 分）**：產生結業證書，可下載 PDF（第 1 頁證書，後續頁為題目、正確答案、學員作答與解析）或 PNG。
  - **未通過**：顯示答錯題號與建議重讀的章節（附文字教材與影音連結），不公布答案，可重新測驗。

## 發布到 GitHub Pages

課程網址：**https://allanloplus.github.io/ISO42001_Course/**

1. 先把本分支合併到 `main`（或在 Pages 設定中直接選本分支）。
2. GitHub 儲存庫 → **Settings → Pages** → Source 選 **Deploy from a branch**，Branch 選 `main`，資料夾選以下其一：
   - **`/ (root)`**：根目錄的 `index.html` 會自動轉到 `docs/` 課程首頁（課程頁網址為 `…/ISO42001_Course/docs/`）。
   - **`/docs`**：課程首頁直接就在 `…/ISO42001_Course/`。
3. 儲存庫名稱需為 `ISO42001_Course`，Pages 網址才會是上面這個路徑。簡報第 65 張已改為這個網址。

也可以在 `docs` 資料夾內直接用任何靜態網站伺服器開啟（例如 `npx http-server docs`）。

## （選用）收集測驗通過名單

預設狀態下，學員資料只用來在瀏覽器裡產生證書，**不會上傳**。如果需要集中收集結業名單：

1. 依 `tools/google_apps_script.gs` 的說明，建立 Google 試算表與 Apps Script Web App。
2. 把部署網址填入 `docs/assets/js/quiz-data.js` 的 `submitUrl`。

填入後，個資告知文字會自動改為「傳送至課程管理者保存」版本；請依貴單位的個資政策調整用語。

## 客戶授權版（企業內部網站）

GitHub 上的公開版不顯示任何授權資訊（`docs/assets/js/license.js` 為 `null`）。要提供給客戶放在企業內部網站時，在專案根目錄執行：

```bash
python3 tools/make_license_package.py --company "○○股份有限公司" --dept "資訊處" \
    --no L-2026-001 --start 2026-11-01 --end 2027-10-31 --domains elearning.example.com
```

會在 `dist/` 產生 `ISO42001_AIMS_授權版_○○股份有限公司_L-2026-001.zip`（原始專案不會被修改；`dist/` 不會進版控），內含：
- 完整網站 `docs/`（文字教材、互動影音與語音、課後測驗），`license.js` 已寫入該客戶的授權資訊
- 內容原始檔 `content/` 與網站、語音建置程式（客戶可自行修改教材後重建）
- 給客戶的 `README_授權版.md`（架設方式與授權說明）
- 不含講師簡報（要附上請加 `--pptx`）、角色設定原圖、內部撰寫規格與簡報建置工具

網頁會顯示：頁首「授權：○○股份有限公司」、首頁「○○股份有限公司 內部教育訓練專用」、每頁頁尾授權說明（公司、編號、期間）、結業證書「授權單位」與解答頁授權說明；測驗紀錄回傳時也會附上授權公司與編號。
授權到期或網站不在 `--domains` 指定的網域時，頁面頂端會出現紅色提醒（`--end`、`--domains` 不填則不檢查；在 localhost 測試時不檢查網域）。
若客戶直接在 zip 壓縮檔中點開網頁，頁面會提示「請先解壓縮再開啟」。

> 注意：授權資訊是寫在網頁檔案裡的，取得原始檔的人在技術上仍可自行修改；此機制用於標示與提醒，正式的使用範圍請以授權合約約定。

## 重新建置

```bash
pip install -r tools/requirements.txt
python3 tools/build_site.py                # Markdown → docs/text/*.html
python3 tools/build_audio.py [ch04 ...]    # 影音腳本 → 語音 + docs/data/video/*.js（只重產有修改的句子）
cd tools && npm install && cd .. && node tools/build_pptx.js   # 重新產生 PPTX
python3 tools/crop_characters.py          # 由角色設定圖裁切半身、全身與表情包
```

修改教材的流程：編輯 `content/text/*.md` 或 `content/video/*.json` → 執行上面對應的指令 → commit。

## 注意事項

- 標準條文內容依 ISO/IEC 42001:2023 中文譯本整理；譯本聲明「各項原義應當以英文為唯一詮釋依據」。
- 管理案例中的公司（福爾摩沙銀行、鴻光精密、樂購電商、仁心醫院、才庫人力、智聯科技、海遠國際）皆為虛擬。
- 語音由 Microsoft Edge 線上 TTS 合成。
- 角色圖（半身、全身、各 8 種表情）裁切自講師提供的角色設定圖 `tools/allan_sheet.jpg`、`tools/arale_sheet.jpg`；互動影音與簡報對話框會依台詞內容自動切換表情。

## 著作權

教材規劃製作：Allan Lo顧問（http://www.123hi.org）・2026 年 10 月
Copyright © 2026 Allan Lo. All rights reserved.
