/**
 * ムダギリ診断 V1 - Google Sheets persistence backend
 * Bound Apps Script: run setupMudagiriSheets() once, then deploy as Web App.
 */
const MG = {
  version: 'MUDAGIRI_DATA_V1.0',
  sheets: {
    diagnoses: 'Diagnoses',
    categories: 'DiagnosisCategories',
    events: 'FunnelEvents',
    leads: 'Leads'
  },
  categories: ['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'],
  outcomes: ['cut','protected','unreviewed','clear'],
  amountStates: ['known','zero','unknown'],
  events: ['diagnosis_started','diagnosis_completed','result_viewed','future_goal_selected','line_clicked','line_connected','appointment_cta_clicked','appointment_booked','valid_appointment','conversion'],
  leadStages: ['anonymous','line_connected','appointment_intent','booked','attended','qualified','won','lost']
};

const HEADERS = {};
HEADERS[MG.sheets.diagnoses] = [
  'diagnosis_id','anonymous_user_id','schema_version','created_at','updated_at',
  'consent_analytics','consent_crm','consent_benchmark',
  'prefecture','age','age_band','family_profile','household','annual_income','income_band',
  'monthly_take_home_income','monthly_saving_investment','free_cash_flow','emergency_months','saving_rate',
  'tone_mode','global_satisfaction','future_goal','type_code','axis_fv','axis_pi','axis_au','axis_se',
  'battle_score','monthly_improvement','annual_improvement','five_year_improvement','methodology_version',
  'utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer','landing_path','payload_json'
];
HEADERS[MG.sheets.categories] = [
  'diagnosis_id','anonymous_user_id','category','amount','amount_state','comparable','difference','satisfaction','outcome','monthly_improvement','updated_at'
];
HEADERS[MG.sheets.events] = [
  'event_id','anonymous_user_id','diagnosis_id','event_name','created_at','data_json'
];
HEADERS[MG.sheets.leads] = [
  'lead_id','anonymous_user_id','diagnosis_id','created_at','updated_at','stage','line_user_id','source','campaign','future_goal','type_code','annual_income_band','family_profile','needs_review','unknown_categories','monthly_improvement','appointment_cta_clicked_at','appointment_booked_at','appointment_attended_at','appointment_qualified','appointment_outcome','payload_json'
];

function setupMudagiriSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const headers = HEADERS[name];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  });
  return 'OK: ' + Object.keys(HEADERS).join(', ');
}

function doGet() {
  return json_({ok:true, service:'mudagiri-gas-v1', version:MG.version, time:new Date().toISOString()});
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = parseBody_(e);
    if (body.v !== 1) throw new Error('UNSUPPORTED_VERSION');
    if (!['diagnosis','lead','event'].includes(body.op)) throw new Error('INVALID_OPERATION');
    if (!body.payload || typeof body.payload !== 'object') throw new Error('INVALID_PAYLOAD');

    if (body.op === 'diagnosis') saveDiagnosis_(body.payload);
    if (body.op === 'lead') saveLead_(body.payload);
    if (body.op === 'event') saveEvent_(body.payload);
    return json_({ok:true, op:body.op});
  } catch (err) {
    return json_({ok:false, error:String(err && err.message ? err.message : err)});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function saveDiagnosis_(p) {
  required_(p, ['diagnosisId','anonymousUserId']);
  if (p.schemaVersion && p.schemaVersion !== MG.version) throw new Error('INVALID_SCHEMA_VERSION');
  if (!Array.isArray(p.categories) || p.categories.length !== 12) throw new Error('DIAGNOSIS_REQUIRES_12_CATEGORIES');
  const names = p.categories.map(x => x.category);
  MG.categories.forEach(c => { if (!names.includes(c)) throw new Error('MISSING_CATEGORY_' + c); });

  const now = new Date().toISOString();
  const x = v => v === undefined || v === null ? '' : v;
  const a = p.acquisition || {};
  const row = [
    p.diagnosisId,p.anonymousUserId,x(p.schemaVersion || MG.version),x(p.createdAt),now,
    !!(p.consent && p.consent.analytics),!!(p.consent && p.consent.crm),!!(p.consent && p.consent.benchmark),
    x(p.profile && p.profile.prefecture),x(p.profile && p.profile.age),x(p.profile && p.profile.ageBand),x(p.profile && p.profile.familyProfile),x(p.profile && p.profile.household),x(p.profile && p.profile.annualIncome),x(p.profile && p.profile.incomeBand),
    x(p.finance && p.finance.monthlyTakeHomeIncome),x(p.finance && p.finance.monthlySavingInvestment),x(p.finance && p.finance.freeCashFlow),x(p.finance && p.finance.emergencyMonths),x(p.finance && p.finance.savingRate),
    x(p.experience && p.experience.toneMode),x(p.experience && p.experience.globalSatisfaction),x(p.experience && p.experience.futureGoal),x(p.type && p.type.code),x(p.type && p.type.axes && p.type.axes.fv),x(p.type && p.type.axes && p.type.axes.pi),x(p.type && p.type.axes && p.type.axes.au),x(p.type && p.type.axes && p.type.axes.se),
    x(p.battle && p.battle.score),x(p.battle && p.battle.monthlyImprovement),x(p.battle && p.battle.annualImprovement),x(p.battle && p.battle.fiveYearImprovement),x(p.methodologyVersion),
    x(a.source),x(a.medium),x(a.campaign),x(a.content),x(a.term),x(a.referrer),x(a.landingPath),JSON.stringify(p)
  ];
  upsert_(MG.sheets.diagnoses, 'diagnosis_id', p.diagnosisId, row);

  p.categories.forEach(c => {
    if (!MG.categories.includes(c.category)) throw new Error('INVALID_CATEGORY_' + c.category);
    if (!MG.amountStates.includes(c.amountState)) throw new Error('INVALID_AMOUNT_STATE_' + c.amountState);
    if (!MG.outcomes.includes(c.outcome)) throw new Error('INVALID_OUTCOME_' + c.outcome);
    const cr = [p.diagnosisId,p.anonymousUserId,c.category,x(c.amount),c.amountState,x(c.comparable),x(c.difference),x(c.satisfaction),c.outcome,x(c.monthlyImprovement),now];
    upsertComposite_(MG.sheets.categories, ['diagnosis_id','category'], [p.diagnosisId,c.category], cr);
  });
}

function saveLead_(p) {
  required_(p, ['diagnosisId','anonymousUserId']);
  const now = new Date().toISOString();
  const x = v => v === undefined || v === null ? '' : v;
  const ap = p.appointment || {};
  const row = [
    x(p.leadId),p.anonymousUserId,p.diagnosisId,x(p.createdAt),now,x(p.stage || 'anonymous'),x(p.lineUserId),x(p.source),x(p.campaign),x(p.futureGoal),x(p.typeCode),x(p.annualIncomeBand),x(p.familyProfile),
    Array.isArray(p.needsReview)?p.needsReview.join(','):'',Array.isArray(p.unknownCategories)?p.unknownCategories.join(','):'',x(p.monthlyImprovement),
    x(ap.ctaClickedAt),x(ap.bookedAt),x(ap.attendedAt),x(ap.qualified),x(ap.outcome),JSON.stringify(p)
  ];
  upsert_(MG.sheets.leads, 'diagnosis_id', p.diagnosisId, row);
}

function saveEvent_(p) {
  required_(p, ['eventId','anonymousUserId','diagnosisId','name','createdAt']);
  if (!MG.events.includes(p.name)) throw new Error('INVALID_EVENT_' + p.name);
  const row = [p.eventId,p.anonymousUserId,p.diagnosisId,p.name,p.createdAt,JSON.stringify(p.data || {})];
  upsert_(MG.sheets.events, 'event_id', p.eventId, row);
}

function upsert_(sheetName, keyHeader, key, row) {
  const sh = sheet_(sheetName), headers = HEADERS[sheetName];
  const col = headers.indexOf(keyHeader) + 1;
  if (!col) throw new Error('KEY_HEADER_NOT_FOUND');
  const found = findRow_(sh, col, key);
  writeRow_(sh, found || sh.getLastRow() + 1, row, headers.length);
}

function upsertComposite_(sheetName, keyHeaders, keys, row) {
  const sh = sheet_(sheetName), headers = HEADERS[sheetName];
  const cols = keyHeaders.map(h => headers.indexOf(h) + 1);
  const last = sh.getLastRow(); let found = 0;
  if (last >= 2) {
    const values = sh.getRange(2, 1, last - 1, headers.length).getValues();
    for (let i=0;i<values.length;i++) {
      if (cols.every((c,j) => String(values[i][c-1]) === String(keys[j]))) { found = i + 2; break; }
    }
  }
  writeRow_(sh, found || last + 1, row, headers.length);
}

function findRow_(sh, col, key) {
  const last = sh.getLastRow(); if (last < 2) return 0;
  const vals = sh.getRange(2, col, last - 1, 1).getValues();
  for (let i=0;i<vals.length;i++) if (String(vals[i][0]) === String(key)) return i + 2;
  return 0;
}

function writeRow_(sh, rowNum, row, width) {
  const out = row.slice(0, width); while (out.length < width) out.push('');
  sh.getRange(rowNum, 1, 1, width).setValues([out]);
}

function sheet_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('SHEET_NOT_FOUND_' + name);
  return sh;
}

function required_(obj, keys) { keys.forEach(k => { if (obj[k] === undefined || obj[k] === null || obj[k] === '') throw new Error('MISSING_' + k); }); }
function parseBody_(e) { if (!e || !e.postData || !e.postData.contents) throw new Error('EMPTY_BODY'); return JSON.parse(e.postData.contents); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
