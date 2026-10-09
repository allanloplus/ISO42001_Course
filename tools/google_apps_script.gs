/**
 * （選用）課後測驗紀錄回傳：Google Apps Script Web App 範例
 *
 * 1. 建立一份 Google 試算表 → 擴充功能 → Apps Script，貼上本程式。
 * 2. 部署 → 新增部署作業 → 類型「網頁應用程式」，執行身分「我」，存取權「所有人」。
 * 3. 把部署網址填入 docs/assets/js/quiz-data.js 的 QUIZ_CONFIG.submitUrl。
 * 4. 個資告知文字會自動切換為「傳送至課程管理者保存」版本，請依貴單位個資政策調整。
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('測驗紀錄')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('測驗紀錄');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['時間', '公司名稱', '單位', '姓名', '職稱', 'E-mail', '分數', '通過', '證書編號', '課程']);
  }
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), d.company, d.unit, d.name, d.title, d.email, d.score,
    d.passed ? '通過' : '未通過', d.passed ? d.certNo : '', d.course]);
  return ContentService.createTextOutput('ok');
}
