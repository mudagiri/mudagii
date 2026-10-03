const CFG={
  VERSION:'MUDAGIRI_DATA_ASSET_V1',
  APP_SCHEMA:'MUDAGIRI_SHEET_V3',
  GAS_VERSION:'MUDAGIRI_GAS_V4_0',
  VISIBLE:{HOME:'①ホーム',PEOPLE:'②どんな人？',SPEND:'③何に使ってる？',CONV:'④誰が面談する？',QUALITY:'⑤データ信頼度',STORE:'⑥データ保管庫'},
  HIDDEN:{DIAG:'_診断_raw',CAT:'_支出_raw',EVENT:'_イベント_raw',CONV:'_面談_raw',QUALITY:'_品質_raw',PILOT:'_性格Pilot_raw',META:'_設定'}
};
const CATS=['rent','mobile','energy','insurance','sub','food','daily','fun','beautyFashion','car','childEducation','selfDevelopment'];
const CAT_LABEL={rent:'住居',mobile:'通信',energy:'光熱',insurance:'保険',sub:'サブスク',food:'食費',daily:'日用品',fun:'娯楽・交際',beautyFashion:'美容・服飾',car:'車',childEducation:'子ども教育',selfDevelopment:'自己投資'};
const CAT_QUALITY_COL={rent:'住居品質',mobile:'通信品質',energy:'光熱品質',insurance:'保険品質',sub:'サブスク品質',food:'食費品質',daily:'日用品品質',fun:'娯楽・交際品質',beautyFashion:'美容・服飾品質',car:'車品質',childEducation:'子ども教育品質',selfDevelopment:'自己投資品質'};
const STORE_HEADERS=[
 '診断ID','匿名継続ID','診断日時','最終更新','診断範囲','都道府県','年齢','年齢帯','世帯構成','世帯人数','大人人数','子ども人数','住居形態','住居サブタイプ','年収帯','手取り月額',
 '診断タイプコード','診断タイプ','住居','通信','光熱','保険','サブスク','食費','日用品','娯楽・交際','美容・服飾','車','子ども教育','自己投資','支出合計',
 '最優先見直し','確認できた改善額','見直し余地下限','見直し余地上限','見直し対象数','LINEクリック','LINE遷移（コード発行）','引継ぎコード','未来目的','相談テーマ','相談希望','面談予約','面談実施','提案','成約','成約商品','売上','粗利',
 '初回/再診断','前回診断ID','再診断間隔日','全体信頼度','統計利用可','品質注意理由','流入元','流入媒体','キャンペーン','シェア経由','診断モード','診断メソッド版',
 '住居品質','通信品質','光熱品質','保険品質','サブスク品質','食費品質','日用品品質','娯楽・交際品質','美容・服飾品質','車品質','子ども教育品質','自己投資品質','備考'
];
const DIAG_HEADERS=['diagnosis_id','anonymous_user_id','created_at','updated_at','diagnosis_scope','prefecture','age','age_band','household_type','household_size','adult_count','child_count','housing_tenure','housing_subtype','annual_income_band','monthly_take_home','type_code','type_name','first_quest','confirmed_monthly','potential_lower','potential_upper','tone_mode','utm_source','utm_medium','utm_campaign','share_ref','raw_json'];
const CAT_HEADERS=['diagnosis_id','anonymous_user_id','created_at','category_code','category_label','applicability','known','input_amount','diagnosis_amount','personal_burden','household_total','analysis_scope','comparison_amount','comparison_amount_scope','comparison_benchmark','comparison_quality','confirmed_saving','final_status','psychology_tags','appraisal_json','quality_grade','quality_flags_json'];
const EVENT_HEADERS=['event_id','anonymous_user_id','diagnosis_id','created_at','name','data_json'];
const CONV_HEADERS=['conversion_id','anonymous_user_id','diagnosis_id','created_at','stage','source','product','revenue','gross_profit','data_json'];
const QUALITY_HEADERS=['diagnosis_id','anonymous_user_id','updated_at','score','grade','stat_eligible','duration_seconds','max_same_amount_count','rapid_repeat_count','known_category_count','flags_json'];
const PILOT_HEADERS=['session_id','participant_id','form_id','started_at','completed_at','duration_ms','pilot_version','response_count','responses_json','quality_json','user_agent','source_url'];
const META_HEADERS=['key','value','note'];
const TYPES=['鉄壁マネー要塞','穴あき家計の番人','未来キープストッカー','未来直感ゾンビ','メリハリ消費の賢者','ご褒美予算ブレイカー','直感消費エンターテイナー','感情課金バーサーカー'];

function setupMudagiriDataAssetV1(){
  const ss=SpreadsheetApp.getActive();
  ensureVisible_(ss,CFG.VISIBLE.STORE,STORE_HEADERS);
  ensureVisibleShells_(ss);
  ensureHidden_(ss,CFG.HIDDEN.DIAG,DIAG_HEADERS);
  ensureHidden_(ss,CFG.HIDDEN.CAT,CAT_HEADERS);
  ensureHidden_(ss,CFG.HIDDEN.EVENT,EVENT_HEADERS);
  ensureHidden_(ss,CFG.HIDDEN.CONV,CONV_HEADERS);
  ensureHidden_(ss,CFG.HIDDEN.QUALITY,QUALITY_HEADERS);
  ensureHidden_(ss,CFG.HIDDEN.PILOT,PILOT_HEADERS);
  const meta=ensureHidden_(ss,CFG.HIDDEN.META,META_HEADERS);
  upsertKV_(meta,'schema_version',CFG.VERSION,'Data asset contract');
  upsertKV_(meta,'app_schema_version',CFG.APP_SCHEMA,'Frontend snapshot schema');
  upsertKV_(meta,'gas_version',CFG.GAS_VERSION,'Production GAS');
  upsertKV_(meta,'internal_min_n','10','Internal insight display threshold; tune after real data');
  upsertKV_(meta,'external_min_n','30','External benchmark minimum candidate; privacy review still required');
  upsertKV_(meta,'updated_at',new Date().toISOString(),'Last setup');
  setupFilterValidations_(ss);
  refreshMudagiriDashboards();
  return 'OK: '+CFG.VERSION+' / '+CFG.GAS_VERSION;
}
function setupMudagiriV4(){return setupMudagiriDataAssetV1()}

function onOpen(){
  try{
    SpreadsheetApp.getUi().createMenu('ムダギリデータ')
      .addItem('全画面を更新','refreshMudagiriDashboards')
      .addItem('ホームだけ更新','refreshHome')
      .addSeparator()
      .addItem('初期設定を再確認','setupMudagiriDataAssetV1')
      .addToUi();
    refreshHome();
  }catch(_){}
}
function onEdit(e){
  try{
    if(!e||!e.range)return;
    const name=e.range.getSheet().getName();
    const a1=e.range.getA1Notation();
    if(name===CFG.VISIBLE.PEOPLE&&['B6','D6','F6','H6','J6','L6'].indexOf(a1)>=0){
      refreshPeople_(); refreshSpend_(); refreshConversion_(); return;
    }
    if(name===CFG.VISIBLE.SPEND&&a1==='J5'){refreshSpend_();refreshConversion_()}
  }catch(_){}
}
function refreshHome(){ensureRuntime_();refreshHome_()}
function refreshMudagiriDashboards(){
  ensureRuntime_();
  refreshHome_();refreshPeople_();refreshSpend_();refreshConversion_();refreshQuality_();
}

function doGet(){
  return ContentService.createTextOutput(JSON.stringify({ok:true,schema_version:CFG.VERSION,gas_version:CFG.GAS_VERSION}))
    .setMimeType(ContentService.MimeType.JSON);
}
function doPost(e){
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try{
    ensureRuntime_();
    const b=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    if(b.kind==='diagnosis_v3')saveDiagnosis_(b);
    else if(b.kind==='event_v3')saveEvent_(b);
    else if(b.kind==='lead_v3')saveLead_(b);
    else if(b.kind==='conversion_v1')saveConversion_(b);
    else if(b.kind==='money_personality_pilot_v1')saveMoneyPersonalityPilot_(b);
    else throw new Error('unknown kind');
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }finally{try{lock.releaseLock()}catch(_){}}
}

/**
 * Future LINE/CRM/manual bridge.
 * stage: consult_requested | appointment_booked | appointment_attended | proposal_made | contracted
 */
function recordConversion(diagnosisId,stage,extra){
  ensureRuntime_();
  const x=extra||{};
  saveConversion_({
    conversionId:'manual_'+Date.now(),
    diagnosisId:String(diagnosisId||''),
    anonymousUserId:x.anonymousUserId||'',
    createdAt:x.createdAt||new Date().toISOString(),
    stage:String(stage||''),
    source:x.source||'manual',
    product:x.product||'',
    revenue:x.revenue,
    grossProfit:x.grossProfit,
    data:x
  });
  refreshHome_();refreshConversion_();
}

function saveDiagnosis_(b){
  const ss=SpreadsheetApp.getActive(),now=new Date().toISOString();
  const id=String(b.diagnosisId||''); if(!id)throw new Error('diagnosisId required');
  const p=(b.scopeV4&&b.scopeV4.profile)||b.profile||{};
  const r=b.result||{},a5=r.analyticsV5||{},pot=a5.potential||{},acq=b.acquisition||{};
  const diag={
    diagnosis_id:id,anonymous_user_id:b.anonymousUserId||'',created_at:b.createdAt||now,updated_at:now,
    diagnosis_scope:p.diagnosisScope||'',prefecture:p.prefecture||'',age:numOrBlank_(p.age),age_band:ageBand_(p.age),
    household_type:Number(p.householdSize)===1?'single':(p.householdSize?'multi':''),household_size:numOrBlank_(p.householdSize),adult_count:numOrBlank_(p.adultCount),child_count:numOrBlank_(p.childCount),
    housing_tenure:p.housingTenure||'',housing_subtype:p.housingSubtype||'',annual_income_band:b.annualIncomeBand||p.annualIncomeBand||'',monthly_take_home:numOrBlank_(p.monthlyTakeHome),
    type_code:r.typeCode||'',type_name:r.typeName||'',first_quest:a5.firstQuest||'',confirmed_monthly:numOrBlank_(pot.confirmedA!=null?pot.confirmedA:(r.improvement&&r.improvement.monthly)),
    potential_lower:numOrBlank_(pot.lower),potential_upper:numOrBlank_(pot.upper),tone_mode:b.toneMode||'',
    utm_source:acq.source||'',utm_medium:acq.medium||'',utm_campaign:acq.campaign||'',share_ref:acq.shareRef||'',raw_json:json_(b)
  };
  upsertByKey_(ss.getSheetByName(CFG.HIDDEN.DIAG),DIAG_HEADERS,diag,1,id);
  saveCategories_(b,diag);

  const prev=previousDiagnosis_(ss,b.anonymousUserId||'',id,b.createdAt||now);
  const raw=b.rawExpenses||{}, amounts={};
  CATS.forEach(c=>{const rr=raw[c]||{}; amounts[c]=rr.known===true&&rr.amount!=null?Number(rr.amount):''});
  const total=CATS.reduce((sum,c)=>sum+(typeof amounts[c]==='number'&&Number.isFinite(amounts[c])?amounts[c]:0),0);
  const summary={
    '診断ID':id,'匿名継続ID':b.anonymousUserId||'','診断日時':b.createdAt||now,'最終更新':now,'診断範囲':scopeLabel_(p.diagnosisScope),
    '都道府県':p.prefecture||'','年齢':numOrBlank_(p.age),'年齢帯':ageBand_(p.age),'世帯構成':Number(p.householdSize)===1?'単身':(p.householdSize?'複数':''),
    '世帯人数':numOrBlank_(p.householdSize),'大人人数':numOrBlank_(p.adultCount),'子ども人数':numOrBlank_(p.childCount),
    '住居形態':housingTenureLabel_(p.housingTenure),'住居サブタイプ':housingSubtypeLabel_(p.housingSubtype),'年収帯':incomeLabel_(b.annualIncomeBand||p.annualIncomeBand),
    '手取り月額':numOrBlank_(p.monthlyTakeHome),'診断タイプコード':r.typeCode||'','診断タイプ':r.typeName||'',
    '住居':amounts.rent,'通信':amounts.mobile,'光熱':amounts.energy,'保険':amounts.insurance,'サブスク':amounts.sub,'食費':amounts.food,'日用品':amounts.daily,
    '娯楽・交際':amounts.fun,'美容・服飾':amounts.beautyFashion,'車':amounts.car,'子ども教育':amounts.childEducation,'自己投資':amounts.selfDevelopment,'支出合計':total,
    '最優先見直し':CAT_LABEL[a5.firstQuest]||a5.firstQuest||'','確認できた改善額':numOrBlank_(pot.confirmedA!=null?pot.confirmedA:(r.improvement&&r.improvement.monthly)),
    '見直し余地下限':numOrBlank_(pot.lower),'見直し余地上限':numOrBlank_(pot.upper),'見直し対象数':numOrBlank_(pot.reviewCount),
    '初回/再診断':prev?'再診断':'初回','前回診断ID':prev?prev.id:'','再診断間隔日':prev?daysBetween_(prev.createdAt,b.createdAt||now):'',
    '流入元':acq.source||'','流入媒体':acq.medium||'','キャンペーン':acq.campaign||'','シェア経由':acq.shareRef?'TRUE':'FALSE',
    '診断モード':b.toneMode||'','診断メソッド版':(b.methodology&&b.methodology.diagnosis)||''
  };
  upsertStore_(summary);
  recalcQuality_(id,b);
}

function saveCategories_(b,diag){
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.HIDDEN.CAT),id=diag.diagnosis_id;
  const pv4=b.persistenceV4||{},baseBy={}; (pv4.categories||[]).forEach(x=>baseBy[x.category]=x);
  const r=b.result||{},details=r.finalDetails||{},statuses=r.finalStatuses||{},raw=b.rawExpenses||{},ap=b.appraisal||{};
  const created=b.createdAt||new Date().toISOString();
  CATS.forEach(c=>{
    const x=baseBy[c]||{},d=details[c]||{},st=statuses[c]||{},rr=raw[c]||{},aa=ap[c]||{};
    const diagnosisScope=((b.scopeV4&&b.scopeV4.profile&&b.scopeV4.profile.diagnosisScope)||'');
    const obj={
      diagnosis_id:id,anonymous_user_id:b.anonymousUserId||'',created_at:created,category_code:c,category_label:CAT_LABEL[c]||c,
      applicability:x.amountState==='na'?'na':(rr.applicability||'applicable'),known:x.amountState?x.amountState==='known':rr.known===true,input_amount:numOrBlank_(rr.amount),
      diagnosis_amount:numOrBlank_(x.diagnosisAmount),personal_burden:numOrBlank_(x.personalBurden),household_total:numOrBlank_(x.householdTotal),
      analysis_scope:diagnosisScope==='household'?'household_total':'personal_burden',
      comparison_amount:numOrBlank_(x.comparisonAmount),comparison_amount_scope:x.comparisonAmountScope||d.comparisonAmountScope||'',
      comparison_benchmark:numOrBlank_(x.comparisonBenchmark!=null?x.comparisonBenchmark:d.comparable),comparison_quality:x.comparisonQuality||d.comparisonQuality||'',
      confirmed_saving:numOrBlank_(x.confirmedSaving!=null?x.confirmedSaving:d.confirmedSaving),final_status:x.outcome||st.status||'',
      psychology_tags:psychologyTags_(c,aa).join('|'),appraisal_json:json_(aa),quality_grade:'',quality_flags_json:''
    };
    upsertComposite_(s,CAT_HEADERS,obj,['diagnosis_id','category_code'],[id,c]);
  });
}

function saveEvent_(b){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.HIDDEN.EVENT),id=String(b.eventId||''); if(!id)throw new Error('eventId required');
  if(find_(s,1,id)>1)return;
  s.appendRow(rowFrom_(EVENT_HEADERS,{event_id:id,anonymous_user_id:b.anonymousUserId||'',diagnosis_id:b.diagnosisId||'',created_at:b.createdAt||new Date().toISOString(),name:b.name||'',data_json:json_(b.data||{})}));
  if(b.diagnosisId){
    if(b.name==='line_clicked')patchStore_(String(b.diagnosisId),{'LINEクリック':'TRUE','最終更新':new Date().toISOString()});
    if((b.name==='goal_selected'||b.name==='future_goal_selected')&&b.data&&b.data.goal)patchStore_(String(b.diagnosisId),{'未来目的':String(b.data.goal)});
    if(b.name==='diagnosis_completed')recalcQuality_(String(b.diagnosisId),null);
  }
}

function saveMoneyPersonalityPilot_(b){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.HIDDEN.PILOT);
  const id=String(b.sessionId||''); if(!id)throw new Error('sessionId required');
  const obj={
    session_id:id,
    participant_id:String(b.participantId||''),
    form_id:String(b.formId||''),
    started_at:b.startedAt||'',
    completed_at:b.completedAt||new Date().toISOString(),
    duration_ms:numOrBlank_(b.durationMs),
    pilot_version:String(b.pilotVersion||''),
    response_count:numOrBlank_(b.responseCount!=null?b.responseCount:b.response_count),
    responses_json:json_(b.item_responses||b.responses||[]),
    quality_json:json_(b.quality||{}),
    user_agent:(b.quality&&b.quality.userAgent)||'',
    source_url:(b.quality&&b.quality.sourceUrl)||''
  };
  upsertByKey_(s,PILOT_HEADERS,obj,1,id);
}

function saveLead_(b){
  const id=String(b.diagnosisId||''); if(!id)throw new Error('diagnosisId required');
  const now=b.createdAt||new Date().toISOString();
  const convId=String(b.leadId||('lead_'+id));
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.HIDDEN.CONV);
  if(find_(s,1,convId)<2)s.appendRow(rowFrom_(CONV_HEADERS,{
    conversion_id:convId,anonymous_user_id:b.anonymousUserId||'',diagnosis_id:id,created_at:now,stage:'line_handoff',source:b.source||'result_line_cta',
    product:'',revenue:'',gross_profit:'',data_json:json_(b)
  }));
  patchStore_(id,{
    'LINE遷移（コード発行）':'TRUE','引継ぎコード':b.handoffCode||'','相談テーマ':b.consultSelectedTopic||b.consultPrimary||'',
    '未来目的':b.futureGoal||b.goal||'','最終更新':new Date().toISOString()
  });
}

function saveConversion_(b){
  const id=String(b.diagnosisId||''); if(!id)throw new Error('diagnosisId required');
  const stage=String(b.stage||''); if(['consult_requested','appointment_booked','appointment_attended','proposal_made','contracted'].indexOf(stage)<0)throw new Error('invalid stage');
  const now=b.createdAt||new Date().toISOString(),convId=String(b.conversionId||('cv_'+stage+'_'+id+'_'+Date.now()));
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.HIDDEN.CONV);
  if(find_(s,1,convId)<2)s.appendRow(rowFrom_(CONV_HEADERS,{
    conversion_id:convId,anonymous_user_id:b.anonymousUserId||'',diagnosis_id:id,created_at:now,stage:stage,source:b.source||'external',
    product:b.product||'',revenue:numOrBlank_(b.revenue),gross_profit:numOrBlank_(b.grossProfit),data_json:json_(b.data||b)
  }));
  const patch={'最終更新':new Date().toISOString()};
  if(stage==='consult_requested')patch['相談希望']='TRUE';
  if(stage==='appointment_booked')patch['面談予約']='TRUE';
  if(stage==='appointment_attended')patch['面談実施']='TRUE';
  if(stage==='proposal_made')patch['提案']='TRUE';
  if(stage==='contracted'){patch['成約']='TRUE';patch['成約商品']=b.product||'';patch['売上']=numOrBlank_(b.revenue);patch['粗利']=numOrBlank_(b.grossProfit)}
  patchStore_(id,patch);
}

function recalcQuality_(diagnosisId,snapshot){
  const ss=SpreadsheetApp.getActive();
  let b=snapshot;
  if(!b){
    const d=ss.getSheetByName(CFG.HIDDEN.DIAG),row=find_(d,1,diagnosisId);
    if(row>1){try{b=JSON.parse(String(d.getRange(row,DIAG_HEADERS.indexOf('raw_json')+1).getValue()||'{}'))}catch(_){b=null}}
  }
  if(!b)return;
  const raw=b.rawExpenses||{},p=(b.scopeV4&&b.scopeV4.profile)||b.profile||{},flags=[],catFlags={},amounts=[];
  let knownCount=0;
  CATS.forEach(c=>{
    catFlags[c]=[];
    const rr=raw[c]||{};
    if(rr.known===true&&rr.amount!=null&&Number.isFinite(Number(rr.amount))){
      knownCount++; amounts.push({c:c,v:Number(rr.amount)});
    }
  });
  let score=100,maxSame=0;
  const groups={};
  amounts.filter(x=>x.v>0).forEach(x=>{const k=String(x.v);(groups[k]||(groups[k]=[])).push(x.c)});
  Object.keys(groups).forEach(k=>{maxSame=Math.max(maxSame,groups[k].length)});
  if(maxSame>=8){score-=30;flags.push('SAME_AMOUNT_8PLUS');Object.keys(groups).forEach(k=>{if(groups[k].length>=8)groups[k].forEach(c=>catFlags[c].push('SAME_AMOUNT_PATTERN'))})}
  else if(maxSame>=6){score-=15;flags.push('SAME_AMOUNT_6PLUS');Object.keys(groups).forEach(k=>{if(groups[k].length>=6)groups[k].forEach(c=>catFlags[c].push('SAME_AMOUNT_PATTERN'))})}
  if(knownCount>=8&&amounts.reduce((s,x)=>s+x.v,0)===0){score-=35;flags.push('ALL_ZERO_PATTERN')}
  const duration=diagnosisDurationSeconds_(diagnosisId);
  if(duration!==null&&duration<25){score-=30;flags.push('EXTREME_FAST')}
  else if(duration!==null&&duration<45){score-=15;flags.push('VERY_FAST')}
  const repeats=rapidRepeatCount_(b.anonymousUserId||'',diagnosisId,b.createdAt||new Date().toISOString());
  if(repeats>=3){score-=25;flags.push('RAPID_REPEAT_3PLUS')}
  else if(repeats===2){score-=10;flags.push('RAPID_REPEAT_2')}
  const child=raw.childEducation||{};
  if(Number(p.childCount||0)===0&&child.known===true&&Number(child.amount||0)>0){score-=20;flags.push('CHILD_EDU_WITHOUT_CHILD');catFlags.childEducation.push('HOUSEHOLD_MISMATCH')}
  const sub=raw.sub||{},sap=(b.appraisal&&b.appraisal.sub)||{};
  if(sub.known===true&&Number.isFinite(Number(sap.subUnusedAmount))&&Number(sap.subUnusedAmount)>Number(sub.amount||0)){score-=10;flags.push('SUB_UNUSED_GT_TOTAL');catFlags.sub.push('APPRAISAL_MISMATCH')}
  score=Math.max(0,Math.min(100,score));
  const grade=score>=90?'A':score>=75?'B':score>=50?'C':'D',eligible=grade==='A'||grade==='B';
  const q={diagnosis_id:diagnosisId,anonymous_user_id:b.anonymousUserId||'',updated_at:new Date().toISOString(),score:score,grade:grade,stat_eligible:eligible?'TRUE':'FALSE',
    duration_seconds:duration===null?'':duration,max_same_amount_count:maxSame,rapid_repeat_count:repeats,known_category_count:knownCount,flags_json:json_(flags)};
  upsertByKey_(ss.getSheetByName(CFG.HIDDEN.QUALITY),QUALITY_HEADERS,q,1,diagnosisId);
  const patch={'全体信頼度':grade,'統計利用可':eligible?'TRUE':'FALSE','品質注意理由':flags.join(' / ')};
  const catSheet=ss.getSheetByName(CFG.HIDDEN.CAT);
  const matches=findCompositeRows_(catSheet,1,diagnosisId);
  matches.forEach(row=>{
    const c=String(catSheet.getRange(row,CAT_HEADERS.indexOf('category_code')+1).getValue()||'');
    const known=String(catSheet.getRange(row,CAT_HEADERS.indexOf('known')+1).getValue()).toUpperCase()==='TRUE';
    const app=String(catSheet.getRange(row,CAT_HEADERS.indexOf('applicability')+1).getValue()||'');
    let cg='';
    if(known&&app!=='na'){
      cg=grade;
      if((catFlags[c]||[]).length){
        if((catFlags[c]||[]).indexOf('HOUSEHOLD_MISMATCH')>=0)cg='D';
        else if(cg==='A'||cg==='B')cg='C';
      }
    }
    catSheet.getRange(row,CAT_HEADERS.indexOf('quality_grade')+1).setValue(cg);
    catSheet.getRange(row,CAT_HEADERS.indexOf('quality_flags_json')+1).setValue(json_(catFlags[c]||[]));
    if(CAT_QUALITY_COL[c])patch[CAT_QUALITY_COL[c]]=cg;
  });
  patchStore_(diagnosisId,patch);
}

function diagnosisDurationSeconds_(diagnosisId){
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.HIDDEN.EVENT),last=s.getLastRow(); if(last<2)return null;
  const vals=s.getRange(2,1,last-1,EVENT_HEADERS.length).getValues(),idx=headerIndex_(EVENT_HEADERS),times=[];
  vals.forEach(r=>{if(String(r[idx.diagnosis_id])===String(diagnosisId)&&(r[idx.name]==='diagnosis_started'||r[idx.name]==='diagnosis_completed')){const t=Date.parse(r[idx.created_at]);if(Number.isFinite(t))times.push(t)}});
  if(times.length<2)return null; return Math.max(0,Math.round((Math.max.apply(null,times)-Math.min.apply(null,times))/1000));
}
function rapidRepeatCount_(anonymousId,diagnosisId,createdAt){
  if(!anonymousId)return 0;
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.VISIBLE.STORE),last=s.getLastRow(); if(last<2)return 0;
  const vals=s.getRange(2,1,last-1,STORE_HEADERS.length).getValues(),idx=headerIndex_(STORE_HEADERS),t0=Date.parse(createdAt); let n=0;
  vals.forEach(r=>{
    if(String(r[idx['匿名継続ID']])!==String(anonymousId)||String(r[idx['診断ID']])===String(diagnosisId))return;
    const t=Date.parse(r[idx['診断日時']]); if(Number.isFinite(t)&&Number.isFinite(t0)&&Math.abs(t0-t)<=30*60*1000)n++;
  });
  return n;
}

function refreshHome_(){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.VISIBLE.HOME),rows=storeObjects_(),n=rows.length;
  const q=rows.filter(r=>truth_(r['統計利用可'])).length,line=rows.filter(r=>truth_(r['LINEクリック'])).length,handoff=rows.filter(r=>truth_(r['LINE遷移（コード発行）'])).length;
  const consult=rows.filter(r=>truth_(r['相談希望'])).length,book=rows.filter(r=>truth_(r['面談予約'])).length,attend=rows.filter(r=>truth_(r['面談実施'])).length,contract=rows.filter(r=>truth_(r['成約'])).length;
  const repeat=rows.filter(r=>r['初回/再診断']==='再診断').length,bad=rows.filter(r=>r['全体信頼度']==='C'||r['全体信頼度']==='D').length;
  setMergedValue_(s,'A12:B12',n);setMergedValue_(s,'C12:D12',q);setMergedValue_(s,'E12:F12',rate_(q,n));setMergedValue_(s,'G12:H12',rate_(line,n));setMergedValue_(s,'I12:K12',rate_(handoff,n));
  setMergedValue_(s,'A15:B15',rate_(book,n));setMergedValue_(s,'C15:D15',rate_(attend,n));setMergedValue_(s,'E15:F15',rate_(contract,n));setMergedValue_(s,'G15:H15',rate_(repeat,n));setMergedValue_(s,'I15:K15',latest_(rows.map(r=>r['最終更新'])));
  s.getRange('A19:B23').setValues([['診断完了',n],['LINEクリック',line],['LINE遷移',handoff],['面談予約',book],['面談実施',attend]]);
  s.getRange('D19:E23').setValues([['成約',contract],['再診断',repeat],['統計利用可',q],['品質C/D',bad],['相談希望',consult]]);
  ['E12','G12','I12','A15','C15','E15','G15'].forEach(a=>s.getRange(a).setNumberFormat('0.0%'));
}
function refreshPeople_(){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.VISIBLE.PEOPLE),filters=getFilters_(),all=storeObjects_(),matched=all.filter(r=>matchFilters_(r,filters)),qualified=matched.filter(r=>truth_(r['統計利用可']));
  setMergedValue_(s,'A9:B10',matched.length);setMergedValue_(s,'D9:E10',qualified.length);setMergedValue_(s,'G9:H10',rate_(qualified.length,matched.length));
  const typeCounts=countBy_(qualified,'診断タイプ'),top=topKey_(typeCounts);setMergedValue_(s,'J9:L10',top||'-');
  s.getRange('G9').setNumberFormat('0.0%');
  const typeRows=TYPES.map(t=>[t,typeCounts[t]||0,rate_(typeCounts[t]||0,qualified.length)]);s.getRange('A14:C21').setValues(typeRows);s.getRange('C14:C21').setNumberFormat('0.0%');
  const ages=['10代','20代','30代','40代','50代','60代','70代以上'],ageCounts=countBy_(qualified,'年齢帯');
  s.getRange('E14:G20').setValues(ages.map(x=>[x,ageCounts[x]||0,rate_(ageCounts[x]||0,qualified.length)]));s.getRange('G14:G20').setNumberFormat('0.0%');
  const hh=countBy_(qualified,'世帯構成');s.getRange('I22:K23').setValues([['単身',hh['単身']||0,rate_(hh['単身']||0,qualified.length)],['複数',hh['複数']||0,rate_(hh['複数']||0,qualified.length)]]);s.getRange('K22:K23').setNumberFormat('0.0%');
  const line=matched.filter(r=>truth_(r['LINE遷移（コード発行）'])).length,att=matched.filter(r=>truth_(r['面談実施'])).length,rep=matched.filter(r=>r['初回/再診断']==='再診断').length;
  const ageTop=topKey_(ageCounts)||'-';
  s.getRange('I13').setValue('最多年齢帯：'+ageTop+'\nLINE遷移率：'+pct_(rate_(line,matched.length))+'\n面談実施率：'+pct_(rate_(att,matched.length))+'\n再診断率：'+pct_(rate_(rep,matched.length))+'\n※n='+matched.length);
}
function refreshSpend_(){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.VISIBLE.SPEND),filters=getFilters_(),scope=String(s.getRange('J5').getValue()||'個人負担'),summary=storeObjects_(),summaryMap={};
  summary.filter(r=>matchFilters_(r,filters)&&truth_(r['統計利用可'])).forEach(r=>summaryMap[String(r['診断ID'])]=r);
  const allMap={}; summary.filter(r=>truth_(r['統計利用可'])).forEach(r=>allMap[String(r['診断ID'])]=r);
  const cat=categoryObjects_(),out=[];
  CATS.forEach(c=>{
    const selected=[],ratios=[],overall=[];
    cat.forEach(x=>{
      if(x.category_code!==c||!(x.quality_grade==='A'||x.quality_grade==='B'))return;
      const amount=scope==='世帯合計'?num_(x.household_total):num_(x.personal_burden);
      if(amount===null)return;
      const sid=String(x.diagnosis_id);
      if(allMap[sid])overall.push(amount);
      if(summaryMap[sid]){
        selected.push(amount);
        const take=num_(summaryMap[sid]['手取り月額']); if(take&&take>0)ratios.push(amount/take);
      }
    });
    const med=percentile_(selected,.5),overallMed=percentile_(overall,.5);
    out.push([CAT_LABEL[c],selected.length,mean_(selected),percentile_(selected,.25),med,percentile_(selected,.75),percentile_(selected,.9),percentile_(ratios,.5),overallMed,overallMed&&med!==null?med/overallMed:null]);
  });
  s.getRange('A9:J20').setValues(out);s.getRange('C9:G20').setNumberFormat('#,##0');s.getRange('H9:H20').setNumberFormat('0.0%');s.getRange('I9:I20').setNumberFormat('#,##0');s.getRange('J9:J20').setNumberFormat('0.0%');
}
function refreshConversion_(){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.VISIBLE.CONV),filters=getFilters_(),rows=storeObjects_().filter(r=>matchFilters_(r,filters));
  const byType={};TYPES.forEach(t=>byType[t]=rows.filter(r=>r['診断タイプ']===t));
  s.getRange('A9:H16').setValues(TYPES.map(t=>{const a=byType[t],n=a.length;return[t,n,rate_(a.filter(r=>truth_(r['LINEクリック'])).length,n),rate_(a.filter(r=>truth_(r['LINE遷移（コード発行）'])).length,n),rate_(a.filter(r=>truth_(r['相談希望'])).length,n),rate_(a.filter(r=>truth_(r['面談予約'])).length,n),rate_(a.filter(r=>truth_(r['面談実施'])).length,n),rate_(a.filter(r=>truth_(r['成約'])).length,n)]}));
  s.getRange('C9:H16').setNumberFormat('0.0%');
  const scope=String(ss.getSheetByName(CFG.VISIBLE.SPEND).getRange('J5').getValue()||'個人負担'),rowMap={};rows.forEach(r=>rowMap[String(r['診断ID'])]=r);
  const cat=categoryObjects_(),sp=[];
  CATS.forEach(c=>{
    const yes=[],no=[];
    cat.forEach(x=>{
      if(x.category_code!==c||!(x.quality_grade==='A'||x.quality_grade==='B'))return;
      const r=rowMap[String(x.diagnosis_id)];if(!r)return;
      const amount=scope==='世帯合計'?num_(x.household_total):num_(x.personal_burden);if(amount===null)return;
      (truth_(r['面談実施'])?yes:no).push(amount);
    });
    const y=percentile_(yes,.5),n=percentile_(no,.5),d=(y!==null&&n!==null)?y-n:null;
    sp.push([CAT_LABEL[c],y,n,d,n&&d!==null?d/n:null]);
  });
  s.getRange('A20:E31').setValues(sp);s.getRange('B20:D31').setNumberFormat('#,##0');s.getRange('E20:E31').setNumberFormat('0.0%');
  const insight=conversionSegmentInsights_(rows,filters);s.getRange('G20:K27').setValues(insight);s.getRange('J20:K27').setNumberFormat('0.0%');
  s.getRange('G30').setValue(psychologyInsightText_(rows));
}
function refreshQuality_(){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.VISIBLE.QUALITY),rows=storeObjects_(),n=rows.length,q=rows.filter(r=>truth_(r['統計利用可'])).length,bad=rows.filter(r=>r['全体信頼度']==='C'||r['全体信頼度']==='D').length;
  setMergedValue_(s,'A6:B7',n);setMergedValue_(s,'C6:D7',q);setMergedValue_(s,'E6:F7',rate_(q,n));setMergedValue_(s,'G6:I7',bad);s.getRange('E6').setNumberFormat('0.0%');
  const grades=countBy_(rows,'全体信頼度');s.getRange('A11:C14').setValues(['A','B','C','D'].map(g=>[g,grades[g]||0,rate_(grades[g]||0,n)]));s.getRange('C11:C14').setNumberFormat('0.0%');
  const cats=categoryObjects_(),out=[];
  CATS.forEach(c=>{
    const xs=cats.filter(x=>x.category_code===c),known=xs.filter(x=>truth_(x.known)&&x.applicability!=='na'),ab=known.filter(x=>x.quality_grade==='A'||x.quality_grade==='B').length;
    out.push([CAT_LABEL[c],known.length,ab,rate_(ab,known.length),xs.length-known.length]);
  });
  s.getRange('E11:I22').setValues(out);s.getRange('H11:H22').setNumberFormat('0.0%');
}

function conversionSegmentInsights_(rows,filters){
  const defs=[['年齢帯','年齢帯','age'],['世帯','世帯構成','household'],['年収','年収帯','income'],['住居','住居形態','housing'],['タイプ','診断タイプ','type'],['地域','都道府県','prefecture']];
  const minN=Number(metaValue_('internal_min_n')||10),cands=[];
  defs.forEach(d=>{
    const base=storeObjects_().filter(r=>matchFiltersExcept_(r,filters,d[2]));
    const groups={};base.forEach(r=>{const k=String(r[d[1]]||'');if(!k)return;(groups[k]||(groups[k]=[])).push(r)});
    const overall=rate_(base.filter(r=>truth_(r['面談実施'])).length,base.length);
    Object.keys(groups).forEach(k=>{const a=groups[k],n=a.length;if(n<minN)return;const rt=rate_(a.filter(r=>truth_(r['面談実施'])).length,n);cands.push([d[0],k,n,rt,rt-overall])});
  });
  cands.sort((a,b)=>b[3]-a[3]||b[2]-a[2]);
  const out=cands.slice(0,8);while(out.length<8)out.push(['-','-',0,0,0]);return out;
}
function psychologyInsightText_(rows){
  const ids={};rows.forEach(r=>ids[String(r['診断ID'])]=r);
  const minN=Number(metaValue_('internal_min_n')||10),tags={};
  categoryObjects_().forEach(x=>{
    const r=ids[String(x.diagnosis_id)];if(!r)return;
    String(x.psychology_tags||'').split('|').filter(Boolean).forEach(t=>{const z=tags[t]||(tags[t]={ids:{},att:{}});z.ids[String(x.diagnosis_id)]=1;if(truth_(r['面談実施']))z.att[String(x.diagnosis_id)]=1});
  });
  const arr=Object.keys(tags).map(t=>[t,Object.keys(tags[t].ids).length,rate_(Object.keys(tags[t].att).length,Object.keys(tags[t].ids).length)]).filter(x=>x[1]>=minN).sort((a,b)=>b[2]-a[2]||b[1]-a[1]).slice(0,5);
  if(!arr.length)return 'データ蓄積後に、保険内容不明・未使用サブスク・住居負担感などの心理タグと面談実施率を表示します。';
  return arr.map(x=>x[0]+'：面談実施率 '+pct_(x[2])+'（n='+x[1]+'）').join('\n');
}

function psychologyTags_(category,a){
  const t=[];
  if(a.satisfaction==='verySatisfied')t.push('満足度高い');
  if(a.satisfaction==='satisfied')t.push('満足');
  if(a.satisfaction==='waste')t.push('ムダ感あり');
  if(a.satisfaction==='inertia')t.push('惰性感あり');
  if(category==='rent'){if(a.rentPreference==='burdenHigh')t.push('住居負担大');if(a.rentPreference==='burdenSome')t.push('住居負担あり');if(a.rentPreference==='protect')t.push('住居維持希望')}
  if(category==='insurance'){if(a.insurancePurpose==='unclear')t.push('保険内容不明');if(a.insurancePurpose==='clear')t.push('保険内容把握');if(a.insuranceLastReview==='over3y'||a.insuranceLastReview==='never')t.push('保険3年以上未見直し')}
  if(category==='sub'){if(a.subUsage==='one'||a.subUsage==='several')t.push('未使用サブスクあり');if(Number(a.subUnusedAmount||0)>0)t.push('未使用額あり')}
  if(category==='car'){if(a.carNeed==='burden')t.push('車負担感あり');if(a.carNeed==='notNeeded')t.push('車不要感あり')}
  if(category==='selfDevelopment'){if(a.selfDevelopmentValue==='inertia')t.push('自己投資惰性');if(a.selfDevelopmentValue==='unclear')t.push('自己投資目的不明')}
  if(category==='childEducation'){if(a.educationPreference==='reviewHigh'||a.educationPreference==='reviewSome')t.push('教育費見直し意向')}
  return t;
}

function ensureRuntime_(){
  const ss=SpreadsheetApp.getActive();
  ensureVisible_(ss,CFG.VISIBLE.STORE,STORE_HEADERS);
  ensureHidden_(ss,CFG.HIDDEN.DIAG,DIAG_HEADERS);ensureHidden_(ss,CFG.HIDDEN.CAT,CAT_HEADERS);ensureHidden_(ss,CFG.HIDDEN.EVENT,EVENT_HEADERS);ensureHidden_(ss,CFG.HIDDEN.CONV,CONV_HEADERS);ensureHidden_(ss,CFG.HIDDEN.QUALITY,QUALITY_HEADERS);ensureHidden_(ss,CFG.HIDDEN.PILOT,PILOT_HEADERS);ensureHidden_(ss,CFG.HIDDEN.META,META_HEADERS);
}
function ensureVisibleShells_(ss){
  [CFG.VISIBLE.HOME,CFG.VISIBLE.PEOPLE,CFG.VISIBLE.SPEND,CFG.VISIBLE.CONV,CFG.VISIBLE.QUALITY].forEach(n=>{if(!ss.getSheetByName(n))ss.insertSheet(n)});
}
function ensureVisible_(ss,name,headers){
  let s=ss.getSheetByName(name);if(!s)s=ss.insertSheet(name);
  if(s.getLastRow()===0){s.getRange(1,1,1,headers.length).setValues([headers]);styleHeader_(s,headers.length)}
  else{
    const cur=s.getRange(1,1,1,headers.length).getValues()[0];
    for(let i=0;i<headers.length;i++)if(String(cur[i]||'')!==headers[i])throw new Error('HEADER_MISMATCH:'+name+':'+(i+1)+':'+cur[i]+'!='+headers[i]);
  }
  return s;
}
function ensureHidden_(ss,name,headers){
  let s=ss.getSheetByName(name);if(!s)s=ss.insertSheet(name);
  if(s.getLastRow()===0){s.getRange(1,1,1,headers.length).setValues([headers]);styleHeader_(s,headers.length)}
  else{
    const cur=s.getRange(1,1,1,headers.length).getValues()[0];
    for(let i=0;i<headers.length;i++)if(String(cur[i]||'')!==headers[i])throw new Error('HEADER_MISMATCH:'+name+':'+(i+1)+':'+cur[i]+'!='+headers[i]);
  }
  try{s.hideSheet()}catch(_){}
  return s;
}
function setupFilterValidations_(ss){
  const s=ss.getSheetByName(CFG.VISIBLE.PEOPLE);if(!s)return;
  const prefectures=['すべて','北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];
  [['B6',prefectures],['D6',['すべて','10代','20代','30代','40代','50代','60代','70代以上']],['F6',['すべて','単身','複数']],['H6',['すべて','500万円未満','500〜599万円','600〜699万円','700〜799万円','800〜999万円','1000万円以上','不明']],['J6',['すべて','賃貸','持ち家','その他','不明']],['L6',['すべて'].concat(TYPES)]].forEach(x=>s.getRange(x[0]).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(x[1],true).setAllowInvalid(false).build()));
  const spend=ss.getSheetByName(CFG.VISIBLE.SPEND);if(spend)spend.getRange('J5').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['個人負担','世帯合計'],true).setAllowInvalid(false).build());
}
function getFilters_(){
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.VISIBLE.PEOPLE),v=s?s.getRange('B6:L6').getValues()[0]:[];
  return {prefecture:v[0]||'すべて',age:v[2]||'すべて',household:v[4]||'すべて',income:v[6]||'すべて',housing:v[8]||'すべて',type:v[10]||'すべて'};
}
function matchFilters_(r,f){
  return (f.prefecture==='すべて'||r['都道府県']===f.prefecture)&&(f.age==='すべて'||r['年齢帯']===f.age)&&(f.household==='すべて'||r['世帯構成']===f.household)&&(f.income==='すべて'||r['年収帯']===f.income)&&(f.housing==='すべて'||r['住居形態']===f.housing)&&(f.type==='すべて'||r['診断タイプ']===f.type);
}
function matchFiltersExcept_(r,f,except){
  const x={prefecture:f.prefecture,age:f.age,household:f.household,income:f.income,housing:f.housing,type:f.type};x[except]='すべて';return matchFilters_(r,x);
}
function storeObjects_(){
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.VISIBLE.STORE),last=s.getLastRow();if(last<2)return[];
  const vals=s.getRange(2,1,last-1,STORE_HEADERS.length).getValues(),idx=headerIndex_(STORE_HEADERS);
  return vals.filter(r=>r[idx['診断ID']]).map(r=>{const o={};STORE_HEADERS.forEach((h,i)=>o[h]=r[i]);return o});
}
function categoryObjects_(){
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.HIDDEN.CAT),last=s.getLastRow();if(last<2)return[];
  const vals=s.getRange(2,1,last-1,CAT_HEADERS.length).getValues();
  return vals.filter(r=>r[0]).map(r=>{const o={};CAT_HEADERS.forEach((h,i)=>o[h]=r[i]);return o});
}
function upsertStore_(obj){const s=SpreadsheetApp.getActive().getSheetByName(CFG.VISIBLE.STORE),id=String(obj['診断ID']||'');if(!id)throw new Error('diagnosis id required');const r=find_(s,1,id),row=r>1?s.getRange(r,1,1,STORE_HEADERS.length).getValues()[0]:new Array(STORE_HEADERS.length).fill('');STORE_HEADERS.forEach((h,i)=>{if(Object.prototype.hasOwnProperty.call(obj,h))row[i]=obj[h]});if(r>1)s.getRange(r,1,1,row.length).setValues([row]);else s.appendRow(row)}
function patchStore_(id,patch){if(!id)return;const s=SpreadsheetApp.getActive().getSheetByName(CFG.VISIBLE.STORE),r=find_(s,1,id);if(r<2)return;Object.keys(patch).forEach(h=>{const i=STORE_HEADERS.indexOf(h);if(i>=0)s.getRange(r,i+1).setValue(patch[h])})}
function previousDiagnosis_(ss,anonymousId,currentId,createdAt){
  if(!anonymousId)return null;const s=ss.getSheetByName(CFG.VISIBLE.STORE),last=s.getLastRow();if(last<2)return null;
  const vals=s.getRange(2,1,last-1,STORE_HEADERS.length).getValues(),idx=headerIndex_(STORE_HEADERS),t0=Date.parse(createdAt),cand=[];
  vals.forEach(r=>{if(String(r[idx['匿名継続ID']])!==String(anonymousId)||String(r[idx['診断ID']])===String(currentId))return;const t=Date.parse(r[idx['診断日時']]);if(Number.isFinite(t)&&(!Number.isFinite(t0)||t<t0))cand.push({id:String(r[idx['診断ID']]),createdAt:r[idx['診断日時']],t:t})});
  cand.sort((a,b)=>b.t-a.t);return cand[0]||null;
}

function upsertByKey_(s,headers,obj,keyCol,key){const row=rowFrom_(headers,obj),r=find_(s,keyCol,key);if(r>1)s.getRange(r,1,1,row.length).setValues([row]);else s.appendRow(row)}
function upsertComposite_(s,headers,obj,keyNames,keyValues){const last=s.getLastRow();let row=-1;if(last>=2){const vals=s.getRange(2,1,last-1,headers.length).getValues();for(let i=0;i<vals.length;i++){let ok=true;for(let k=0;k<keyNames.length;k++){const ci=headers.indexOf(keyNames[k]);if(String(vals[i][ci])!==String(keyValues[k])){ok=false;break}}if(ok){row=i+2;break}}}const out=rowFrom_(headers,obj);if(row>1)s.getRange(row,1,1,out.length).setValues([out]);else s.appendRow(out)}
function findCompositeRows_(s,col,value){if(!s||s.getLastRow()<2)return[];const f=s.getRange(2,col,s.getLastRow()-1,1).createTextFinder(String(value)).matchEntireCell(true).findAll();return f.map(x=>x.getRow())}
function rowFrom_(headers,obj){return headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:'')}
function find_(s,col,v){if(!s||s.getLastRow()<2)return-1;const f=s.getRange(2,col,s.getLastRow()-1,1).createTextFinder(String(v)).matchEntireCell(true).findNext();return f?f.getRow():-1}
function headerIndex_(headers){const o={};headers.forEach((h,i)=>o[h]=i);return o}
function styleHeader_(s,n){s.getRange(1,1,1,n).setFontWeight('bold').setBackground('#0B1724').setFontColor('#ffffff').setWrap(true);s.setFrozenRows(1)}
function setMergedValue_(s,a1,v){s.getRange(a1.split(':')[0]).setValue(v)}
function numOrBlank_(v){if(v===null||v===undefined||v==='')return '';const n=Number(v);return Number.isFinite(n)?n:''}
function num_(v){if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null}
function json_(v){try{return JSON.stringify(v)}catch(_){return ''}}
function truth_(v){return v===true||String(v).toUpperCase()==='TRUE'||v===1||String(v)==='1'}
function rate_(a,b){return b?Number(a||0)/Number(b):0}
function pct_(v){return (Number(v||0)*100).toFixed(1)+'%'}
function mean_(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null}
function percentile_(xs,p){if(!xs.length)return null;const a=xs.slice().sort((x,y)=>x-y),i=(a.length-1)*p,l=Math.floor(i),u=Math.ceil(i);return l===u?a[l]:a[l]+(a[u]-a[l])*(i-l)}
function countBy_(rows,key){const o={};rows.forEach(r=>{const k=String(r[key]||'');if(k)o[k]=(o[k]||0)+1});return o}
function topKey_(o){return Object.keys(o).sort((a,b)=>o[b]-o[a])[0]||''}
function latest_(xs){const a=xs.map(x=>({v:x,t:Date.parse(x)})).filter(x=>Number.isFinite(x.t)).sort((x,y)=>y.t-x.t);return a.length?String(a[0].v):'-'}
function daysBetween_(a,b){const x=Date.parse(a),y=Date.parse(b);return Number.isFinite(x)&&Number.isFinite(y)?Math.max(0,Math.round((y-x)/86400000)):''}
function ageBand_(age){const n=Number(age);if(!Number.isFinite(n))return'';if(n<20)return'10代';if(n<30)return'20代';if(n<40)return'30代';if(n<50)return'40代';if(n<60)return'50代';if(n<70)return'60代';return'70代以上'}
function scopeLabel_(v){return v==='household'?'世帯':v==='personal'?'個人':''}
function incomeLabel_(v){return ({under500:'500万円未満','500_599':'500〜599万円','600_699':'600〜699万円','700_799':'700〜799万円','800_999':'800〜999万円','1000plus':'1000万円以上',unknown:'不明'})[v]||v||''}
function housingTenureLabel_(v){return ({rental:'賃貸',owned:'持ち家',family_home:'その他',company_housing:'その他',other:'その他'})[v]||v||'不明'}
function housingSubtypeLabel_(v){return ({private_rental:'民間賃貸',public_rental:'公営賃貸',unknown_rental:'賃貸（種別不明）',mortgage:'ローンあり',no_mortgage:'ローンなし',other:'その他'})[v]||v||''}
function metaValue_(key){const s=SpreadsheetApp.getActive().getSheetByName(CFG.HIDDEN.META),r=find_(s,1,key);return r>1?s.getRange(r,2).getValue():''}
function upsertKV_(s,k,v,note){const r=find_(s,1,k),row=[k,v,note||''];if(r>1)s.getRange(r,1,1,3).setValues([row]);else s.appendRow(row)}
