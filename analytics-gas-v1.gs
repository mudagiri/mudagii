/**
 * MUDAGIRI Analytics GAS V1
 * Spreadsheet: ムダギリ診断_ANALYTICS_V1
 * Receives event_v3 / diagnosis_v3 / lead_v3 from persistence-v3.ts.
 */
const SPREADSHEET_ID = '1hsGzFlwr0-7hj4DkUs6dET_zik2uNPG7tkp9JZf12Xo';

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (body.kind === 'event_v3') appendEvent_(body);
      else if (body.kind === 'diagnosis_v3') upsertDiagnosis_(body);
      else if (body.kind === 'lead_v3') upsertLead_(body);
      else throw new Error('Unsupported kind: ' + body.kind);
    } finally {
      lock.releaseLock();
    }
    return json_({ok:true});
  } catch (err) {
    console.error(err);
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function doGet() {
  return json_({ok:true,service:'mudagiri-analytics-v1'});
}

function appendEvent_(v) {
  const d = v.data || {};
  append_('EVENTS', [
    new Date(), v.eventId || '', v.anonymousUserId || '', v.diagnosisId || '',
    v.name || '', v.createdAt || '', d.step ?? '', d.index ?? '', d.total ?? '',
    d.category ?? '', d.kind ?? '', d.questionId ?? '', d.typeCode ?? '',
    d.format ?? '', d.source ?? '', d.mode ?? '', JSON.stringify(d)
  ]);
}

function upsertDiagnosis_(v) {
  const result = v.result || {};
  const methodology = v.methodology || {};
  upsert_('DIAGNOSES', 2, v.diagnosisId, [
    new Date(), v.diagnosisId || '', v.anonymousUserId || '', v.createdAt || '',
    result.typeCode || '', result.typeName || '', v.toneMode || '',
    v.annualIncomeBand || '', result.improvement?.monthly ?? '',
    JSON.stringify(result.battleTargets || []), methodology.diagnosis || '',
    methodology.resolver || '', methodology.type || '', JSON.stringify(v)
  ]);
}

function upsertLead_(v) {
  upsert_('LEADS', 3, v.diagnosisId, [
    new Date(), v.leadId || '', v.diagnosisId || '', v.anonymousUserId || '',
    v.createdAt || '', v.source || '', v.toneMode || '', v.typeCode || '',
    v.typeName || '', v.annualIncomeBand || '', v.monthlyImprovement ?? '',
    v.firstQuest == null ? '' : JSON.stringify(v.firstQuest), JSON.stringify(v)
  ]);
}

function append_(sheetName, row) {
  const sh = sheet_(sheetName);
  sh.appendRow(row);
}

function upsert_(sheetName, keyColumn, key, row) {
  if (!key) throw new Error(sheetName + ': missing key');
  const sh = sheet_(sheetName);
  const last = sh.getLastRow();
  if (last >= 2) {
    const finder = sh.getRange(2, keyColumn, last - 1, 1)
      .createTextFinder(String(key)).matchEntireCell(true).findNext();
    if (finder) {
      sh.getRange(finder.getRow(), 1, 1, row.length).setValues([row]);
      return;
    }
  }
  sh.appendRow(row);
}

function sheet_(name) {
  const sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sh) throw new Error('Missing sheet: ' + name);
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run once in Apps Script editor before web-app deployment. */
function smokeTest() {
  const id = 'smoke_' + Date.now();
  appendEvent_({
    eventId:id, anonymousUserId:'smoke_user', diagnosisId:'smoke_diag',
    name:'analytics_smoke_test', createdAt:new Date().toISOString(),
    data:{source:'gas_editor'}
  });
}
