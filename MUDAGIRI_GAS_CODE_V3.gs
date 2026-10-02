const CFG={
  VERSION:'MUDAGIRI_ANALYTICS_V1',
  APP_SCHEMA:'MUDAGIRI_SHEET_V3',
  SHEETS:{DIAG:'02_Diagnoses',CAT:'03_Categories',EVENT:'04_Events',LEAD:'05_Leads',META:'09_Meta'}
};
const CATS=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
const CAT_LABEL={mobile:'通信費',energy:'光熱（電気・ガス・水道）',sub:'サブスク',car:'車',food:'食費',daily:'日用品（家事消耗）',fun:'娯楽・交際',beautyFashion:'美容・服飾',rent:'住居',insurance:'保険',childEducation:'子ども教育',selfDevelopment:'自己投資'};

const DIAG_HEADERS=['diagnosis_id','anonymous_user_id','created_at','updated_at','schema_version','diagnosis_methodology','resolver_version','type_model_version','result_vm_version','tone_mode','utm_source','utm_medium','utm_campaign','utm_content','utm_term','share_ref','share_type','referrer','landing_path','diagnosis_scope','prefecture','age','household_type','household_size','adult_count','child_count','housing_tenure','housing_subtype','annual_income_band','monthly_take_home','monthly_saving','bundled_contribution_amount','type_code','type_name','axis_fv','axis_pi','axis_au','strength_fv','strength_pi','strength_au','near_middle_fv','near_middle_pi','near_middle_au','confirmed_monthly','potential_lower','potential_upper','potential_mode','review_count','first_quest','future_goal','needs_review_json','battle_targets_json','encounter_targets_json','secondary_review_targets_json','raw_json'];
const CAT_HEADERS=['diagnosis_id','category_code','category_label','created_at','updated_at','known','applicability','input_amount','diagnosis_amount','personal_burden','household_total','comparison_amount','comparison_amount_scope','comparison_benchmark','benchmark_eligible','comparison_quality','comparison_source_version','comparison_difference','position_available','position_label','position_method','position_ratio','final_status','v5_status','v5_status_label','attention_flag','confirmed_saving','potential_c_upper','c_eligible','detail_review','battle_basis','appraisal_summary','next_action','appraisal_json','benchmark_meta_json'];
const EVENT_HEADERS=['event_id','anonymous_user_id','diagnosis_id','created_at','name','data_json'];
const LEAD_HEADERS=['lead_id','anonymous_user_id','diagnosis_id','created_at','updated_at','stage','source','type_code','type_name','annual_income_band','first_quest','handoff_code','cta_placement','future_goal','consult_primary','consult_selected_topic','insurance_review','home_structure','solar_eligible','confirmed_monthly','potential_lower','potential_upper','needs_review_json','consult_route_json','raw_json'];
const META_HEADERS=['key','value','note'];

function setupMudagiriAnalyticsV1(){
  const ss=SpreadsheetApp.getActive();
  ensureExact_(ss,CFG.SHEETS.DIAG,DIAG_HEADERS);
  ensureExact_(ss,CFG.SHEETS.CAT,CAT_HEADERS);
  ensureExact_(ss,CFG.SHEETS.EVENT,EVENT_HEADERS);
  ensureExact_(ss,CFG.SHEETS.LEAD,LEAD_HEADERS);
  ensureExact_(ss,CFG.SHEETS.META,META_HEADERS);
  const meta=ss.getSheetByName(CFG.SHEETS.META);
  upsertKV_(meta,'schema_version',CFG.VERSION,'Workbook/GAS data contract');
  upsertKV_(meta,'app_schema_version',CFG.APP_SCHEMA,'Frontend snapshot schema');
  upsertKV_(meta,'gas_version','MUDAGIRI_GAS_V3_0','Production GAS');
  upsertKV_(meta,'updated_at',new Date().toISOString(),'Last setup');
  return 'OK: '+CFG.VERSION;
}
function setupMudagiriV4(){return setupMudagiriAnalyticsV1()}

function doGet(){
  return ContentService.createTextOutput(JSON.stringify({ok:true,schema_version:CFG.VERSION,gas_version:'MUDAGIRI_GAS_V3_0'}))
    .setMimeType(ContentService.MimeType.JSON);
}
function doPost(e){
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try{
    setupMudagiriAnalyticsV1();
    const b=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    if(b.kind==='diagnosis_v3')saveDiagnosis_(b);
    else if(b.kind==='event_v3')saveEvent_(b);
    else if(b.kind==='lead_v3')saveLead_(b);
    else throw new Error('unknown kind');
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }finally{lock.releaseLock()}
}

function saveDiagnosis_(b){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.SHEETS.DIAG);
  const id=String(b.diagnosisId||''); if(!id)throw new Error('diagnosisId required');
  const p=(b.scopeV4&&b.scopeV4.profile)||b.profile||{};
  const r=b.result||{}, a5=r.analyticsV5||{}, pot=a5.potential||{}, acq=b.acquisition||{}, axes=r.typeAxes||{}, str=r.typeStrength||{}, mid=r.typeNearMiddle||{};
  const now=new Date().toISOString();
  const review=Object.keys(r.finalStatuses||{}).filter(k=>{const x=r.finalStatuses[k]||{};return x.status==='review'||x.status==='battle'});
  const obj={
    diagnosis_id:id,anonymous_user_id:b.anonymousUserId||'',created_at:b.createdAt||now,updated_at:now,schema_version:b.schemaVersion||CFG.APP_SCHEMA,
    diagnosis_methodology:(b.methodology&&b.methodology.diagnosis)||'',resolver_version:(b.methodology&&b.methodology.resolver)||'',type_model_version:(b.methodology&&b.methodology.type)||'',
    result_vm_version:a5.resultVmVersion||'',tone_mode:b.toneMode||'',
    utm_source:acq.source||'',utm_medium:acq.medium||'',utm_campaign:acq.campaign||'',utm_content:acq.content||'',utm_term:acq.term||'',share_ref:acq.shareRef||'',share_type:acq.shareType||'',referrer:acq.referrer||'',landing_path:acq.landingPath||'',
    diagnosis_scope:p.diagnosisScope||'',prefecture:p.prefecture||'',age:numOrBlank_(p.age),household_type:Number(p.householdSize)===1?'single':(p.householdSize?'multi':''),household_size:numOrBlank_(p.householdSize),adult_count:numOrBlank_(p.adultCount),child_count:numOrBlank_(p.childCount),
    housing_tenure:p.housingTenure||'',housing_subtype:p.housingSubtype||'',annual_income_band:b.annualIncomeBand||p.annualIncomeBand||'',monthly_take_home:numOrBlank_(p.monthlyTakeHome),monthly_saving:'',bundled_contribution_amount:numOrBlank_(p.bundledContributionAmount),
    type_code:r.typeCode||'',type_name:r.typeName||'',axis_fv:numOrBlank_(axes.fv),axis_pi:numOrBlank_(axes.pi),axis_au:numOrBlank_(axes.au),strength_fv:numOrBlank_(str.fv),strength_pi:numOrBlank_(str.pi),strength_au:numOrBlank_(str.au),
    near_middle_fv:boolCell_(mid.fv),near_middle_pi:boolCell_(mid.pi),near_middle_au:boolCell_(mid.au),
    confirmed_monthly:numOrBlank_(pot.confirmedA!=null?pot.confirmedA:(r.improvement&&r.improvement.monthly)),potential_lower:numOrBlank_(pot.lower),potential_upper:numOrBlank_(pot.upper),potential_mode:pot.mode||'',review_count:numOrBlank_(pot.reviewCount),
    first_quest:a5.firstQuest||'',future_goal:'',needs_review_json:json_(review),battle_targets_json:json_(r.battleTargets||[]),encounter_targets_json:json_(r.encounterTargets||[]),secondary_review_targets_json:json_(r.secondaryReviewTargets||[]),raw_json:json_(b)
  };
  const found=find_(s,1,id);
  if(found>1){
    const goalCol=DIAG_HEADERS.indexOf('future_goal')+1;
    const existingGoal=s.getRange(found,goalCol).getValue();
    if(existingGoal)obj.future_goal=existingGoal;
  }
  upsertByKey_(s,DIAG_HEADERS,obj,1,id);
  saveCategories_(b);
}

function saveCategories_(b){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.SHEETS.CAT),id=String(b.diagnosisId||'');
  const pv4=b.persistenceV4||{}, baseBy={}; (pv4.categories||[]).forEach(x=>baseBy[x.category]=x);
  const r=b.result||{}, details=r.finalDetails||{}, statuses=r.finalStatuses||{}, a5=r.analyticsV5||{}, v5=a5.rows||{}, raw=b.rawExpenses||{}, ap=b.appraisal||{};
  const now=new Date().toISOString(), created=b.createdAt||now;
  CATS.forEach(c=>{
    const x=baseBy[c]||{}, d=details[c]||{}, st=statuses[c]||{}, v=v5[c]||{}, rr=raw[c]||{}, aa=ap[c]||{};
    const obj={
      diagnosis_id:id,category_code:c,category_label:CAT_LABEL[c]||c,created_at:created,updated_at:now,
      known:x.amountState?x.amountState==='known':rr.known===true,applicability:x.amountState==='na'?'na':(rr.applicability||'applicable'),input_amount:numOrBlank_(rr.amount),
      diagnosis_amount:numOrBlank_(x.diagnosisAmount),personal_burden:numOrBlank_(x.personalBurden),household_total:numOrBlank_(x.householdTotal),
      comparison_amount:numOrBlank_(x.comparisonAmount),comparison_amount_scope:x.comparisonAmountScope||d.comparisonAmountScope||'',comparison_benchmark:numOrBlank_(x.comparisonBenchmark!=null?x.comparisonBenchmark:d.comparable),
      benchmark_eligible:boolCell_(x.benchmarkEligible),comparison_quality:x.comparisonQuality||d.comparisonQuality||'',comparison_source_version:x.comparisonSourceVersion||d.sourceVersion||'',comparison_difference:numOrBlank_(d.comparisonDifference),
      position_available:boolCell_(v.positionAvailable),position_label:v.positionLabel||'',position_method:v.positionMethod||'',position_ratio:numOrBlank_(v.positionRatio),
      final_status:x.outcome||st.status||'',v5_status:v.v5Status||'',v5_status_label:v.v5StatusLabel||'',attention_flag:boolCell_(st.attentionFlag),
      confirmed_saving:numOrBlank_(x.confirmedSaving!=null?x.confirmedSaving:d.confirmedSaving),potential_c_upper:numOrBlank_(v.cUpper),c_eligible:boolCell_(v.cEligible),detail_review:boolCell_(v.detailReview),
      battle_basis:d.battleBasis||'',appraisal_summary:v.appraisalSummary||'',next_action:v.nextAction||'',appraisal_json:json_(aa),benchmark_meta_json:json_(d.benchmarkMeta||null)
    };
    upsertCategory_(s,obj);
  });
}

function saveEvent_(b){
  const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.SHEETS.EVENT),id=String(b.eventId||''); if(!id)throw new Error('eventId required');
  if(find_(s,1,id)>1)return;
  s.appendRow(rowFrom_(EVENT_HEADERS,{event_id:id,anonymous_user_id:b.anonymousUserId||'',diagnosis_id:b.diagnosisId||'',created_at:b.createdAt||new Date().toISOString(),name:b.name||'',data_json:json_(b.data||{})}));
  if((b.name==='goal_selected'||b.name==='future_goal_selected')&&b.diagnosisId&&b.data&&b.data.goal){
    setByDiagnosis_(ss.getSheetByName(CFG.SHEETS.DIAG),DIAG_HEADERS,'future_goal',String(b.diagnosisId),String(b.data.goal));
    setByDiagnosis_(ss.getSheetByName(CFG.SHEETS.LEAD),LEAD_HEADERS,'future_goal',String(b.diagnosisId),String(b.data.goal));
  }
}

function saveLead_(b){
  const s=SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.LEAD),id=String(b.diagnosisId||''); if(!id)throw new Error('diagnosisId required');
  const now=new Date().toISOString();
  const obj={
    lead_id:b.leadId||('lead_'+id),anonymous_user_id:b.anonymousUserId||'',diagnosis_id:id,created_at:b.createdAt||now,updated_at:now,stage:b.stage||'anonymous',source:b.source||'result_line_cta',
    type_code:b.typeCode||'',type_name:b.typeName||'',annual_income_band:b.annualIncomeBand||'',first_quest:b.firstQuest||'',handoff_code:b.handoffCode||'',cta_placement:b.ctaPlacement||'',
    future_goal:b.futureGoal||b.goal||'',consult_primary:b.consultPrimary||'',consult_selected_topic:b.consultSelectedTopic||b.consultPrimary||'',insurance_review:boolCell_(b.insuranceReview),home_structure:b.homeStructure||'',solar_eligible:boolCell_(b.solarEligible),
    confirmed_monthly:numOrBlank_(b.confirmedMonthly!=null?b.confirmedMonthly:b.monthlyImprovement),potential_lower:numOrBlank_(b.potentialLower),potential_upper:numOrBlank_(b.potentialUpper),
    needs_review_json:json_(b.needsReview||[]),consult_route_json:json_(b.consultRoute||null),raw_json:json_(b)
  };
  upsertByKey_(s,LEAD_HEADERS,obj,3,id);
}

function ensureExact_(ss,name,headers){
  let s=ss.getSheetByName(name); if(!s)s=ss.insertSheet(name);
  if(s.getLastRow()===0){s.getRange(1,1,1,headers.length).setValues([headers]);styleHeader_(s,headers.length);return s}
  const cur=s.getRange(1,1,1,Math.max(s.getLastColumn(),headers.length)).getValues()[0];
  for(let i=0;i<headers.length;i++)if(String(cur[i]||'')!==headers[i])throw new Error('HEADER_MISMATCH:'+name+':'+(i+1)+':'+cur[i]+'!='+headers[i]);
  return s;
}
function styleHeader_(s,n){s.getRange(1,1,1,n).setFontWeight('bold').setBackground('#0B1724').setFontColor('#ffffff').setWrap(true);s.setFrozenRows(1)}
function upsertByKey_(s,headers,obj,keyCol,key){const row=rowFrom_(headers,obj),r=find_(s,keyCol,key);if(r>1)s.getRange(r,1,1,row.length).setValues([row]);else s.appendRow(row)}
function upsertCategory_(s,obj){
  const last=s.getLastRow(); let row=-1;
  if(last>=2){const vals=s.getRange(2,1,last-1,2).getValues();for(let i=0;i<vals.length;i++)if(String(vals[i][0])===String(obj.diagnosis_id)&&String(vals[i][1])===String(obj.category_code)){row=i+2;break}}
  const out=rowFrom_(CAT_HEADERS,obj); if(row>1)s.getRange(row,1,1,out.length).setValues([out]);else s.appendRow(out);
}
function setByDiagnosis_(s,headers,field,diagnosisId,value){if(!s)return;const row=find_(s,headers.indexOf('diagnosis_id')+1,diagnosisId);if(row>1)s.getRange(row,headers.indexOf(field)+1).setValue(value)}
function rowFrom_(headers,obj){return headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:'')}
function find_(s,col,v){if(!s||s.getLastRow()<2)return-1;const f=s.getRange(2,col,s.getLastRow()-1,1).createTextFinder(String(v)).matchEntireCell(true).findNext();return f?f.getRow():-1}
function numOrBlank_(v){if(v===null||v===undefined||v==='')return '';const n=Number(v);return Number.isFinite(n)?n:''}
function boolCell_(v){return v===true?'TRUE':v===false?'FALSE':''}
function json_(v){try{return JSON.stringify(v)}catch(_){return ''}}
function upsertKV_(s,k,v,note){const r=find_(s,1,k);const row=[k,v,note||''];if(r>1)s.getRange(r,1,1,3).setValues([row]);else s.appendRow(row)}
