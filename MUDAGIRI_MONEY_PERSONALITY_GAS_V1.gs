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


/**
 * Private owner-run rarity audit (never callable from doGet / doPost).
 * Reads only ①セッション and ④結果. No new Sheet, no data mutation.
 * The GAS editor's Run menu is the intended entry point.
 */
function auditMoneyPersonalityPrevalenceV1(){
  const ss=SpreadsheetApp.getActive();
  const sessions=ss.getSheetByName(MP_CFG.SHEETS.SESSIONS);
  const results=ss.getSheetByName(MP_CFG.SHEETS.RESULTS);
  if(!sessions||!results)throw new Error('Dedicated Money Personality tabs missing');
  const audit=computeMoneyPersonalityPrevalenceV1_(
    sessions.getDataRange().getValues(),
    results.getDataRange().getValues()
  );
  // Log only aggregate counts; never anonymous IDs, user agents, raw URLs or answers.
  Logger.log('MONEY_PERSONALITY_PREVALENCE_AUDIT_V1 '+JSON.stringify(audit));
  return audit;
}

/**
 * Pure aggregation: works on original dedicated V1 sheet headers.
 * Output has no session_id, participant_id, anonymous_user_id, raw_json or URL.
 * Dedupe policy: earliest valid first assessment per anonymous browser ID.
 */
function computeMoneyPersonalityPrevalenceV1_(sessionValues,resultValues){
  const jobs=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
  const styles=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
  const validJob=new Set(jobs),validStyle=new Set(styles);
  function rows_(matrix,required){
    if(!Array.isArray(matrix)||matrix.length===0)throw new Error('No headers');
    const headers=matrix[0].map(String);
    required.forEach(col=>{if(headers.indexOf(col)<0)throw new Error('Missing column '+col)});
    return matrix.slice(1).filter(row=>Array.isArray(row)&&row.some(v=>v!==''&&v!==null&&v!==undefined))
      .map(values=>{
        const out={};
        headers.forEach((key,i)=>out[key]=values[i]===undefined?'':values[i]);
        return out;
      });
  }
  const sessions=rows_(sessionValues,[
    'session_id','anonymous_user_id','form_id','cognitive_mode',
    'source_url','raw_json'
  ]);
  const results=rows_(resultValues,[
    'session_id','anonymous_user_id','job_code','primary_style','completed_at'
  ]);
  const excluded={
    orphanResult:0,notAdaptive:0,testOrDebug:0,preview:0,
    missingIdentity:0,invalidResult:0,mismatchedIdentity:0,
    invalidDate:0,duplicateAnonymous:0,duplicateSession:0,
    missingAuditFlags:0
  };
  const sessionById=new Map();
  sessions.forEach(row=>{
    const id=String(row.session_id||'');
    if(!id)return;
    if(sessionById.has(id))excluded.duplicateSession++;
    sessionById.set(id,row);
  });
  const candidates=[];
  const seenSessionResults=new Set();
  results.forEach(result=>{
    const id=String(result.session_id||'');
    if(!id||seenSessionResults.has(id)){
      excluded.duplicateSession++;
      return;
    }
    seenSessionResults.add(id);
    const sess=sessionById.get(id);
    if(!sess){excluded.orphanResult++;return;}
    if(String(sess.form_id)!=='PUBLIC_ADAPTIVE'){
      excluded.notAdaptive++;return;
    }
    let raw=null;
    if(String(sess.raw_json||'')){
      try{raw=JSON.parse(String(sess.raw_json))}catch(_){}
    }
    if(!raw||!raw.quality||typeof raw.quality.debugMode!=='boolean'){
      excluded.missingAuditFlags++;return;
    }
    const q=raw.quality;
    const cognitiveFlag=String(sess.cognitive_mode||'').toUpperCase()==='TRUE';
    const variant=String(q.variant||'');
    const idText=[String(sess.participant_id||''),id].join(' ');
    if(cognitiveFlag||q.cognitiveMode===true||q.debugMode===true||
      /COGNITIVE|DEBUG/i.test(variant)||/(^|[\s_-])(qa|test|e2e)([\s_-]|$)/i.test(idText)){
      excluded.testOrDebug++;return;
    }
    const source=String(sess.source_url||'');
    // Exclude preview builds, localhost and local test hosts from real-population reports.
    if(/\/pilot\/money-type\/?|localhost|127\.0\.0\.1|example\.test/i.test(source)){
      excluded.preview++;return;
    }
    const anon=String(sess.anonymous_user_id||'');
    const resultAnon=String(result.anonymous_user_id||'');
    if(!anon){excluded.missingIdentity++;return;}
    if(resultAnon!==anon){excluded.mismatchedIdentity++;return;}
    const job=String(result.job_code||''),style=String(result.primary_style||'');
    if(!validJob.has(job)||!validStyle.has(style)){
      excluded.invalidResult++;return;
    }
    const at=Date.parse(String(result.completed_at||''));
    if(!Number.isFinite(at)){
      excluded.invalidDate++;return;
    }
    candidates.push({anon,sessionId:id,job,style,at,source:prevalenceSourceCategoryV1_(source)});
  });
  candidates.sort((a,b)=>a.at-b.at||a.sessionId.localeCompare(b.sessionId));
  const byJob={},byStyle={},byType={},bySource={};
  jobs.forEach(j=>{byJob[j]=0;styles.forEach(s=>byType[j+'-'+s]=0)});
  styles.forEach(s=>byStyle[s]=0);
  ['x','instagram','threads','line','other_social','other','unspecified'].forEach(k=>bySource[k]=0);
  const counted=new Set();
  candidates.forEach(c=>{
    if(counted.has(c.anon)){excluded.duplicateAnonymous++;return;}
    counted.add(c.anon);
    byJob[c.job]++;byStyle[c.style]++;byType[c.job+'-'+c.style]++;bySource[c.source]++;
  });
  const n=counted.size;
  const summarize=(counts)=>Object.keys(counts).sort().map(code=>{
    const count=counts[code];
    const pct=n?Math.round(count*10000/n)/100:null;
    const ci=n?prevalenceWilsonIntervalV1_(count,n):null;
    return {code,count,percent:pct,ci95:ci};
  });
  const jobRows=summarize(byJob),styleRows=summarize(byStyle),typeRows=summarize(byType),sourceRows=summarize(bySource);
  return {
    version:'MUDAGIRI_REAL_PREVALENCE_AUDIT_V1',
    kind:'ADMIN_AGGREGATE_NOT_POPULATION_ESTIMATE',
    source:'dedicated_money_personality_sheet_v1',
    rawSessionRows:sessions.length,rawResultRows:results.length,
    eligibleBeforeAnonymousDedupe:candidates.length,
    uniqueCompletedBrowserIds:n,
    exclusionCounts:excluded,
    byJob:jobRows,byStyle:styleRows,byType:typeRows,bySource:sourceRows,
    publication:{
      ready:false,
      // Even if enough responses are present, an owner must inspect sample
      // composition, consent/data retention and CI coverage before publication.
      preliminaryMinimumReached:n>=5000,
      minUniqueResponses:5000,
      minimumCellCount:30,
      scope:'診断を完了した匿名ブラウザID（日本人全体ではない）',
      notes:'Never publish until owner review; unsupported UTM is unspecified, not direct',
    }
  };
}
function prevalenceSourceCategoryV1_(rawUrl){
  const s=String(rawUrl||'');
  const match=s.match(/[?&](utm_source|source)=([^&#]+)/i);
  if(!match)return 'unspecified';
  let value=match[2];
  try{value=decodeURIComponent(value.replace(/\+/g,' '))}catch(_){}
  value=value.toLowerCase();
  if(/^(x|twitter)$/.test(value))return 'x';
  if(/^(instagram|ig|insta)$/.test(value))return 'instagram';
  if(/^(threads|thread)$/.test(value))return 'threads';
  if(/^(line|line_official|official_line)$/.test(value))return 'line';
  if(/^(facebook|fb|tiktok|youtube|social)$/.test(value))return 'other_social';
  return 'other';
}
function prevalenceWilsonIntervalV1_(count,n){
  if(n<=0)return null;
  const z=1.95996398454,p=count/n,z2=z*z;
  const denominator=1+z2/n,center=(p+z2/(2*n))/denominator;
  const half=z*Math.sqrt((p*(1-p)+z2/(4*n))/n)/denominator;
  return [Math.round(Math.max(0,center-half)*10000)/100,
          Math.round(Math.min(1,center+half)*10000)/100];
}
