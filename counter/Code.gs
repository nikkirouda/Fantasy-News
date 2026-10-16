/** @OnlyCurrentDoc */
// The league's own counter: paste into the Google Sheet's Apps Script editor
// (Extensions > Apps Script), run setup() once, then Deploy > New deployment >
// Web app, Execute as: Me, Who has access: Anyone. Put the web-app URL in
// counter.js (ENDPOINT). Each visit adds one row to "hits"; "Summary" adds up.

function doGet(e) {
  var p = (e && e.parameter) || {};
  var ev = String(p.ev || '');
  if (['view', 'play', 'half', 'end'].indexOf(ev) < 0) {
    return ContentService.createTextOutput('ignored');
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('hits');
  sheet.appendRow([new Date(), String(p.page || '').slice(0, 200), ev,
                   String(p.v || '').slice(0, 16)]);
  return ContentService.createTextOutput('ok');
}

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hits = ss.getSheetByName('hits') || ss.insertSheet('hits');
  if (hits.getLastRow() === 0) hits.appendRow(['when', 'page', 'event', 'visitor']);
  hits.setFrozenRows(1);
  var sum = ss.getSheetByName('Summary') || ss.insertSheet('Summary', 0);
  sum.clear();
  sum.getRange('A1').setValue('Per page: views, plays, half-heard, finished, distinct visitors');
  sum.getRange('A3').setFormula(
    "=QUERY(hits!A2:D, \"select B, count(C) where B is not null group by B pivot C\", 0)");
  sum.getRange('H1').setValue('Distinct visitors, all pages');
  sum.getRange('H2').setFormula('=COUNTUNIQUE(hits!D2:D)');
  sum.getRange('H4').setValue('Distinct visitors per page');
  sum.getRange('H5').setFormula(
    "=QUERY(UNIQUE(FILTER({hits!B2:B, hits!D2:D}, hits!B2:B<>\"\")), \"select Col1, count(Col2) group by Col1\", 0)");
  var blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(blank);
}
