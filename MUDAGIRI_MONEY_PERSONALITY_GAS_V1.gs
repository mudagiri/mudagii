const MP_CFG={
  DATA_VERSION:'MUDAGIRI_MONEY_PERSONALITY_DATA_V1',
  GAS_VERSION:'MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0',
  SHEETS:{
    SESSIONS:'①セッション',
    RESPONSES:'②回答',
    FLAGS:'③Cognitiveフラグ',
    RESULTS:'④結果',
    DEBRIEF:'⑤Debrief',
    META:'_設定'
  }
};

const MP_SESSION_HEADERS=[
  'session_id','anonymous_user_id','participant_id','form_id','schema_version','pilot_version',
  'started_at','completed_at','duration_ms','response_count','cognitive_mode','variant',
  'parent_session_id','source_url','user_agent','received_at','raw_json'
];
const MP_RESPONSE_HEADERS=[
  'row_key','session_id','anonymous_user_id','participant_id','item_id','factor','item_format',
  'position','final_response_json','normalized_trait_score','received_at'
];
const MP_FLAG_HEADERS=[
  'row_key','session_id','parent_session_id','anonymous_user_id','participant_id','item_id','item_kind',
  'flags_json','visit_count','total_view_ms','received_at'
];
const MP_RESULT_HEADERS=[
  'session_id','anonymous_user_id','participant_id','completed_at','job_code','job_name','primary_style',
  'secondary_style','time_state','decision_state','awareness_state','result_content_version',
  'core_count','adaptive_answer_count','separator_count','received_at'
];
const MP_DEBRIEF_HEADERS=[
  'session_id','parent_session_id','anonymous_user_id','participant_id','completed_at','job_fit','result_fit',
  'question_clarity','length_comfort','separator_naturalness','share_intent','household_intent',
  'screenshot_targets_json','best_fit_text','mismatch_text','comment','flagged_item_count','flag_counts_json','received_at'
];
const MP_META_HEADERS=['key','value','note'];

function setupMoneyPersonalityPilotV1(){
  const ss=SpreadsheetApp.getActive();
  ensureSheet_(ss,MP_CFG.SHEETS.SESSIONS,MP_SESSION_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.RESPONSES,MP_RESPONSE_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.FLAGS,MP_FLAG_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.RESULTS,MP_RESULT_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.DEBRIEF,MP_DEBRIEF_HEADERS);
  const meta=ensureSheet_(ss,MP_CFG.SHEETS.META,MP_META_HEADERS);
  upsertKV_(meta,'data_version',MP_CFG.DATA_VERSION,'Money Personality dedicated backend');
  upsertKV_(meta,'gas_version',MP_CFG.GAS_VERSION,'Money Personality dedicated GAS');
  upsertKV_(meta,'household_backend_separated','TRUE','Household diagnosis GAS is intentionally separate');
  upsertKV_(meta,'join_key','anonymous_user_id','Shared anonymous ID joins Money Personality to Household Diagnosis');
  upsertKV_(meta,'updated_at',new Date().toISOString(),'Last setup');
  try{meta.hideSheet()}catch(_){}
  return 'OK: '+MP_CFG.DATA_VERSION+' / '+MP_CFG.GAS_VERSION;
}

function doGet(){
  return jsonOut_({
    ok:true,
    data_version:MP_CFG.DATA_VERSION,
    gas_version:MP_CFG.GAS_VERSION,
    backend:'money_personality',
    household_backend_separated:true
  });
}

function doPost(e){
  const lock=LockService.getScriptLock();
  lock.waitLock(10000);
  try{
    ensureRuntime_();
    const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    if(body.kind!=='money_personality_pilot_v1')throw new Error('unknown kind');
    validatePayload_(body);
    savePayload_(body);
    return jsonOut_({ok:true,session_id:String(body.sessionId),backend:'money_personality'});
  }catch(err){
    return jsonOut_({ok:false,error:String(err),backend:'money_personality'});
  }finally{
    try{lock.releaseLock()}catch(_){}
  }
}

function savePayload_(b){
  const ss=SpreadsheetApp.getActive();
  const now=new Date().toISOString();
  const q=b.quality||{};
  const sessionId=String(b.sessionId||'');
  const anonymousUserId=String(b.anonymousUserId||'');
  const participantId=String(b.participantId||'');
  const formId=String(b.formId||'');
  const parentSessionId=String(q.parentSessionId||'');
  const responses=Array.isArray(b.item_responses)?b.item_responses:[];

  const session={
    session_id:sessionId,
    anonymous_user_id:anonymousUserId,
    participant_id:participantId,
    form_id:formId,
    schema_version:String(b.schemaVersion||''),
    pilot_version:String(b.pilotVersion||''),
    started_at:b.startedAt||'',
    completed_at:b.completedAt||now,
    duration_ms:numOrBlank_(b.durationMs),
    response_count:numOrBlank_(b.responseCount!=null?b.responseCount:b.answerCount),
    cognitive_mode:q.cognitiveMode===true?'TRUE':'FALSE',
    variant:String(q.variant||''),
    parent_session_id:parentSessionId,
    source_url:String(q.sourceUrl||''),
    user_agent:String(q.userAgent||''),
    received_at:now,
    raw_json:safeJson_(b)
  };
  upsertByKey_(ss.getSheetByName(MP_CFG.SHEETS.SESSIONS),MP_SESSION_HEADERS,session,1,sessionId);

  responses.forEach((r,index)=>{
    const itemId=String(r&&r.item_id||'');
    if(!itemId)return;
    const position=Number(r&&r.position)||index+1;
    const rowKey=sessionId+'::'+String(position)+'::'+itemId;
    const row={
      row_key:rowKey,
      session_id:sessionId,
      anonymous_user_id:anonymousUserId,
      participant_id:participantId,
      item_id:itemId,
      factor:String(r.factor||''),
      item_format:String(r.item_format||''),
      position,
      final_response_json:safeJson_(r.final_response),
      normalized_trait_score:numOrBlank_(r.normalized_trait_score),
      received_at:now
    };
    upsertByKey_(ss.getSheetByName(MP_CFG.SHEETS.RESPONSES),MP_RESPONSE_HEADERS,row,1,rowKey);
  });

  if(formId==='PUBLIC_ADAPTIVE')saveResult_(ss,b,now);
  if(formId==='PUBLIC_COGNITIVE_DEBRIEF'){
    saveCognitiveFlags_(ss,b,now);
    saveDebrief_(ss,b,now);
  }
}

function saveResult_(ss,b,now){
  const q=b.quality||{};
  const axes=q.axisStates||{};
  const row={
    session_id:String(b.sessionId||''),
    anonymous_user_id:String(b.anonymousUserId||''),
    participant_id:String(b.participantId||''),
    completed_at:b.completedAt||now,
    job_code:String(q.jobCode||''),
    job_name:String(q.jobName||''),
    primary_style:String(q.primaryStyle||''),
    secondary_style:String(q.secondaryStyle||''),
    time_state:String(axes.TIME||''),
    decision_state:String(axes.DECISION||''),
    awareness_state:String(axes.AWARENESS||''),
    result_content_version:String(q.resultContentVersion||''),
    core_count:numOrBlank_(q.coreCount),
    adaptive_answer_count:numOrBlank_(q.adaptiveAnswerCount),
    separator_count:numOrBlank_(q.separatorCount),
    received_at:now
  };
  upsertByKey_(ss.getSheetByName(MP_CFG.SHEETS.RESULTS),MP_RESULT_HEADERS,row,1,row.session_id);
}

function saveCognitiveFlags_(ss,b,now){
  const q=b.quality||{};
  const sessionId=String(b.sessionId||'');
  const parentSessionId=String(q.parentSessionId||'');
  const anonymousUserId=String(b.anonymousUserId||'');
  const participantId=String(b.participantId||'');
  (Array.isArray(b.item_responses)?b.item_responses:[]).forEach(r=>{
    if(String(r.factor||'')!=='COGNITIVE_ITEM_NOTE')return;
    const x=(r&&typeof r.final_response==='object'&&r.final_response)?r.final_response:{};
    const itemId=String(r.item_id||'');
    if(!itemId)return;
    const rowKey=sessionId+'::'+itemId;
    const row={
      row_key:rowKey,
      session_id:sessionId,
      parent_session_id:parentSessionId,
      anonymous_user_id:anonymousUserId,
      participant_id:participantId,
      item_id:itemId,
      item_kind:String(r.item_format||''),
      flags_json:safeJson_(Array.isArray(x.flags)?x.flags:[]),
      visit_count:numOrBlank_(x.visitCount),
      total_view_ms:numOrBlank_(x.totalViewMs),
      received_at:now
    };
    upsertByKey_(ss.getSheetByName(MP_CFG.SHEETS.FLAGS),MP_FLAG_HEADERS,row,1,rowKey);
  });
}

function saveDebrief_(ss,b,now){
  const q=b.quality||{};
  const values={};
  (Array.isArray(b.item_responses)?b.item_responses:[]).forEach(r=>{
    if(String(r.factor||'')==='COGNITIVE_DEBRIEF')values[String(r.item_id||'')]=r.final_response;
  });
  const row={
    session_id:String(b.sessionId||''),
    parent_session_id:String(q.parentSessionId||''),
    anonymous_user_id:String(b.anonymousUserId||''),
    participant_id:String(b.participantId||''),
    completed_at:b.completedAt||now,
    job_fit:numOrBlank_(values.JOB_FIT),
    result_fit:numOrBlank_(values.RESULT_FIT),
    question_clarity:numOrBlank_(values.QUESTION_CLARITY),
    length_comfort:numOrBlank_(values.LENGTH_COMFORT),
    separator_naturalness:numOrBlank_(values.SEPARATOR_NATURALNESS),
    share_intent:numOrBlank_(values.SHARE_INTENT),
    household_intent:numOrBlank_(values.HOUSEHOLD_INTENT),
    screenshot_targets_json:safeJson_(values.SCREENSHOT_TARGETS||[]),
    best_fit_text:String(values.BEST_FIT_TEXT||''),
    mismatch_text:String(values.MISMATCH_TEXT||''),
    comment:String(values.COMMENT||''),
    flagged_item_count:numOrBlank_(q.flaggedItemCount),
    flag_counts_json:safeJson_(q.flagCounts||{}),
    received_at:now
  };
  upsertByKey_(ss.getSheetByName(MP_CFG.SHEETS.DEBRIEF),MP_DEBRIEF_HEADERS,row,1,row.session_id);
}

function validatePayload_(b){
  if(!b||typeof b!=='object')throw new Error('payload required');
  if(!String(b.sessionId||''))throw new Error('sessionId required');
  if(!String(b.participantId||''))throw new Error('participantId required');
  if(!String(b.anonymousUserId||''))throw new Error('anonymousUserId required');
  const formId=String(b.formId||'');
  if(['PUBLIC_ADAPTIVE','PUBLIC_COGNITIVE_DEBRIEF'].indexOf(formId)<0)throw new Error('unsupported formId');
  const responses=Array.isArray(b.item_responses)?b.item_responses:[];
  if(responses.length>250)throw new Error('too many responses');
  const raw=safeJson_(b);
  ['monthly_take_home','annual_income','confirmed_saving','bank_account','credit_card','rawExpenses','scopeV4'].forEach(k=>{
    if(raw.indexOf(k)>=0)throw new Error('household data not allowed: '+k);
  });
}

function ensureRuntime_(){
  const ss=SpreadsheetApp.getActive();
  ensureSheet_(ss,MP_CFG.SHEETS.SESSIONS,MP_SESSION_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.RESPONSES,MP_RESPONSE_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.FLAGS,MP_FLAG_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.RESULTS,MP_RESULT_HEADERS);
  ensureSheet_(ss,MP_CFG.SHEETS.DEBRIEF,MP_DEBRIEF_HEADERS);
  const meta=ensureSheet_(ss,MP_CFG.SHEETS.META,MP_META_HEADERS);
  try{meta.hideSheet()}catch(_){}
}

function ensureSheet_(ss,name,headers){
  let s=ss.getSheetByName(name);
  if(!s)s=ss.insertSheet(name);
  if(s.getMaxColumns()<headers.length)s.insertColumnsAfter(s.getMaxColumns(),headers.length-s.getMaxColumns());
  const current=s.getRange(1,1,1,headers.length).getValues()[0];
  if(current.join('\u0001')!==headers.join('\u0001'))s.getRange(1,1,1,headers.length).setValues([headers]);
  s.setFrozenRows(1);
  return s;
}

function upsertByKey_(sheet,headers,obj,keyColumn,key){
  if(!sheet)throw new Error('sheet missing');
  const last=sheet.getLastRow();
  let row=0;
  if(last>=2){
    const finder=sheet.getRange(2,keyColumn,last-1,1).createTextFinder(String(key)).matchEntireCell(true).findNext();
    if(finder)row=finder.getRow();
  }
  if(!row)row=Math.max(2,last+1);
  const values=headers.map(h=>obj[h]===undefined?'':obj[h]);
  sheet.getRange(row,1,1,headers.length).setValues([values]);
}

function upsertKV_(sheet,key,value,note){
  upsertByKey_(sheet,MP_META_HEADERS,{key:key,value:value,note:note},1,key);
}
function numOrBlank_(v){
  if(v===null||v===undefined||v==='')return '';
  const n=Number(v);return Number.isFinite(n)?n:'';
}
function safeJson_(v){
  try{return JSON.stringify(v===undefined?null:v)}catch(_){return ''}
}
function jsonOut_(v){
  return ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);
}
