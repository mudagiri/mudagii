const CFG={VERSION:'MUDAGIRI_SHEET_V3',SHEETS:{DIAG:'Diagnoses_V3',EVENT:'Events_V3',LEAD:'Leads_V3',META:'Meta'}};
const CATS=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
const CAT_LABEL={mobile:'通信費',energy:'光熱費',sub:'サブスク',car:'車',food:'食費',daily:'日用品',fun:'娯楽・交際',beautyFashion:'美容・服飾',rent:'住居費',insurance:'保険',childEducation:'子ども教育費',selfDevelopment:'自己投資'};
const DIAG_BASE_HEADERS=['diagnosis_id','created_at','schema_version','type_model_version','methodology_version','household','age','monthly_income','monthly_saving','type_code','axis_fv','axis_pi','axis_au','strength_fv','strength_pi','strength_au','near_middle_fv','near_middle_pi','near_middle_au','monthly_improvement','future_goal','needs_review_json','expenses_json','raw_type_answers_json','raw_json','tone_mode'];
const HUMAN_HEADERS=['都道府県','働き方','住居タイプ','年収帯'].concat(CATS.flatMap(c=>[CAT_LABEL[c]+' 入力額',CAT_LABEL[c]+' 追加鑑定',CAT_LABEL[c]+' 最終判定',CAT_LABEL[c]+' 比較基準',CAT_LABEL[c]+' 基準との差',CAT_LABEL[c]+' 確定改善額']),['見直しクエスト','診断タイプ名']);
function setupMudagiriV3(){
 const ss=SpreadsheetApp.getActive();
 ensure_(ss,CFG.SHEETS.DIAG,DIAG_BASE_HEADERS.concat(HUMAN_HEADERS));
 ensure_(ss,CFG.SHEETS.EVENT,['event_id','anonymous_user_id','diagnosis_id','created_at','name','data_json']);
 ensure_(ss,CFG.SHEETS.LEAD,['lead_id','anonymous_user_id','diagnosis_id','created_at','stage','source','type_code','annual_income_band','needs_review_json','monthly_improvement','first_quest','raw_json']);
 ensure_(ss,CFG.SHEETS.META,['key','value']);
 const m=ss.getSheetByName(CFG.SHEETS.META); upsertKV_(m,'schema_version',CFG.VERSION);upsertKV_(m,'updated_at',new Date().toISOString());
 return 'OK: '+CFG.VERSION;
}
function doGet(){return ContentService.createTextOutput(JSON.stringify({ok:true,version:CFG.VERSION})).setMimeType(ContentService.MimeType.JSON)}
function doPost(e){
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  setupMudagiriV3(); const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
  if(body.kind==='diagnosis_v3') saveDiagnosis_(body); else if(body.kind==='event_v3') saveEvent_(body); else if(body.kind==='lead_v3') saveLead_(body); else throw new Error('unknown kind');
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
 }catch(err){return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON)}
 finally{lock.releaseLock()}
}
function saveDiagnosis_(b){
 const s=SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.DIAG),id=String(b.diagnosisId||'');if(!id)throw new Error('diagnosisId required');
 const p=b.profile||{},m=b.methodology||{},r=b.result||{},statuses=r.finalStatuses||{};
 const review=Object.keys(statuses).filter(k=>statuses[k]&&(statuses[k].status==='review'||statuses[k].status==='battle'));
 const base=[id,b.createdAt||new Date().toISOString(),b.schemaVersion||CFG.VERSION,m.type||'',m.diagnosis||'',p.household||'',num_(p.age),num_(p.monthlyTakeHome),'',r.typeCode||'','','','','','','',false,false,false,num_(r.improvement&&r.improvement.monthly),'',JSON.stringify(review),JSON.stringify(b.rawExpenses||{}),JSON.stringify(b.typeAnswers||{}),JSON.stringify(b),b.toneMode||''];
 const raw=b.rawExpenses||{}, ap=b.appraisal||{}, details=r.finalDetails||{}, fs=r.finalStatuses||{};
 const human=[p.prefecture||'',p.workStyle||'',p.housingType||'',b.annualIncomeBand||'']
   .concat(CATS.flatMap(c=>[
     expense_(raw[c]),
     appraisal_(c,ap[c]),
     status_(fs[c]),
     numOrBlank_(details[c]&&details[c].comparable),
     numOrBlank_(details[c]&&details[c].comparisonDifference),
     numOrBlank_(details[c]&&details[c].confirmedSaving)
   ]))
   .concat([(r.battleTargets||[]).map(c=>CAT_LABEL[c]||c).join(' / '),r.typeName||'']);
 const row=base.concat(human);
 const found=find_(s,1,id);if(found>1)s.getRange(found,1,1,row.length).setValues([row]);else s.appendRow(row);
}
function saveEvent_(b){
 const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.SHEETS.EVENT),id=String(b.eventId||'');if(!id)throw new Error('eventId required');if(find_(s,1,id)>1)return;
 s.appendRow([id,b.anonymousUserId||'',b.diagnosisId||'',b.createdAt||new Date().toISOString(),b.name||'',JSON.stringify(b.data||{})]);
 // The diagnosis row is initially saved before the user chooses a future goal.
 // Keep the denormalized future_goal column synchronized from its event.
 if(b.name==='future_goal_selected'&&b.diagnosisId&&b.data&&b.data.goal){
   const d=ss.getSheetByName(CFG.SHEETS.DIAG),r=find_(d,1,String(b.diagnosisId));
   if(r>1)d.getRange(r,21).setValue(String(b.data.goal));
 }
}
function ensure_(ss,n,h){
 let s=ss.getSheetByName(n);if(!s)s=ss.insertSheet(n);
 if(s.getLastRow()===0){s.getRange(1,1,1,h.length).setValues([h]).setFontWeight('bold').setBackground('#111827').setFontColor('#ffffff');return s}
 const current=s.getRange(1,1,1,Math.max(s.getLastColumn(),1)).getValues()[0].map(String);
 h.forEach((name,i)=>{if(current[i]!==name&&i>=current.length)s.getRange(1,i+1).setValue(name).setFontWeight('bold').setBackground('#111827').setFontColor('#ffffff')});
 return s
}
function find_(s,col,v){if(s.getLastRow()<2)return-1;const f=s.getRange(2,col,s.getLastRow()-1,1).createTextFinder(v).matchEntireCell(true).findNext();return f?f.getRow():-1}
function num_(v){const n=Number(v);return Number.isFinite(n)?n:''}
function upsertKV_(s,k,v){const r=find_(s,1,k);if(r>1)s.getRange(r,2).setValue(v);else s.appendRow([k,v])}

function saveLead_(b){
 const s=SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.LEAD),id=String(b.diagnosisId||'');if(!id)throw new Error('diagnosisId required');
 const row=[b.leadId||('lead_'+id),b.anonymousUserId||'',id,b.createdAt||new Date().toISOString(),b.stage||'anonymous',b.source||'',b.typeCode||'',b.annualIncomeBand||'',JSON.stringify(b.needsReview||[]),num_(b.monthlyImprovement),b.firstQuest||'',JSON.stringify(b)];
 const r=find_(s,3,id);if(r>1)s.getRange(r,1,1,row.length).setValues([row]);else s.appendRow(row);
}

function expense_(x){if(!x)return '';if(x.applicability==='na')return '対象外';if(!x.known)return '不明';return numOrBlank_(x.amount)}
function numOrBlank_(v){if(v===null||v===undefined||v==='')return '';const n=Number(v);return Number.isFinite(n)?n:''}
function status_(x){const s=x&&x.status;return ({battle:'見直しクエスト',protect:'守る支出',safe:'問題なし',review:'要確認',na:'対象外'})[s]||''}
function appraisal_(cat,a){if(!a)return '';
 const map={
  satisfaction:{waste:'かなり見直したい',inertia:'少し見直したい',satisfied:'今くらいでいい',verySatisfied:'大切なので守りたい'},
  rentPreference:{burdenHigh:'かなり負担を感じる',burdenSome:'少し負担を感じる',reasonable:'今の家なら妥当',protect:'今の住環境を優先'},
  insuranceLastReview:{within1y:'最近見直した', '1to3y':'だいたい把握している',over3y:'しばらく見直してない',never:'見直したことがない',unknown:'見直し時期不明'},
  insurancePurpose:{clear:'目的明確',mostly:'目的はだいたい把握',unclear:'よく分からない'},
  educationPreference:{reviewHigh:'かなり見直したい',reviewSome:'少し負担を感じる',necessary:'必要な教育費',protect:'優先して守りたい'},
  selfDevelopmentValue:{inertia:'惰性になってる',unclear:'効果がよく分からない',purpose:'目的は明確',results:'成果につながってる'},
  subUsage:{none:'使っていないものなし',one:'使っていないもの1つ',several:'使っていないもの複数',unknown:'利用状況不明'},
  carNeed:{essential:'生活・仕事に必須',useful:'あるとかなり便利',burden:'負担が気になってる',notNeeded:'なくても困らないかも'}
 };
 const out=[];
 if(a.satisfaction)out.push(map.satisfaction[a.satisfaction]||a.satisfaction);
 if(a.rentPreference)out.push(map.rentPreference[a.rentPreference]||a.rentPreference);
 if(a.insurancePurpose||a.insuranceLastReview){if(a.insurancePurpose==='unclear')out.push('よく分からない');else if(a.insuranceLastReview==='over3y'||a.insuranceLastReview==='never')out.push('しばらく見直してない');else if(a.insurancePurpose==='clear')out.push('かなり把握している');else out.push('だいたい把握している')}
 if(a.educationStage)out.push('教育段階:'+a.educationStage);
 if(a.educationPreference)out.push(map.educationPreference[a.educationPreference]||a.educationPreference);
 if(a.selfDevelopmentValue)out.push(map.selfDevelopmentValue[a.selfDevelopmentValue]||a.selfDevelopmentValue);
 if(a.subUsage)out.push(map.subUsage[a.subUsage]||a.subUsage);
 if(a.subUnusedAmount!==undefined&&a.subUnusedAmount!==null)out.push('未使用 '+numOrBlank_(a.subUnusedAmount)+'円/月');
 if(a.carNeed)out.push(map.carNeed[a.carNeed]||a.carNeed);
 return out.join(' / ')
}
