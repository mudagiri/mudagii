const CFG={VERSION:'MUDAGIRI_SHEET_V2',SHEETS:{DIAG:'Diagnoses_V2',EVENT:'Events_V2',META:'Meta'}};
function setupMudagiriV2(){
 const ss=SpreadsheetApp.getActive();
 ensure_(ss,CFG.SHEETS.DIAG,['diagnosis_id','created_at','schema_version','type_model_version','methodology_version','household','age','monthly_income','monthly_saving','type_code','axis_fv','axis_pi','axis_au','strength_fv','strength_pi','strength_au','near_middle_fv','near_middle_pi','near_middle_au','monthly_improvement','future_goal','needs_review_json','expenses_json','raw_type_answers_json','raw_json','tone_mode']);
 ensure_(ss,CFG.SHEETS.EVENT,['event_id','diagnosis_id','created_at','name','data_json']);
 ensure_(ss,CFG.SHEETS.META,['key','value']);
 const m=ss.getSheetByName(CFG.SHEETS.META); upsertKV_(m,'schema_version',CFG.VERSION);upsertKV_(m,'updated_at',new Date().toISOString());
 return 'OK: '+CFG.VERSION;
}
function doGet(){return ContentService.createTextOutput(JSON.stringify({ok:true,version:CFG.VERSION})).setMimeType(ContentService.MimeType.JSON)}
function doPost(e){
 const lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  setupMudagiriV2(); const body=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
  if(body.kind==='diagnosis') saveDiagnosis_(body); else if(body.kind==='event') saveEvent_(body); else throw new Error('unknown kind');
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
 }catch(err){return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON)}
 finally{lock.releaseLock()}
}
function saveDiagnosis_(b){
 const s=SpreadsheetApp.getActive().getSheetByName(CFG.SHEETS.DIAG),id=String(b.diagnosisId||'');if(!id)throw new Error('diagnosisId required');
 if(find_(s,1,id)>1)return; const t=b.type||{},a=t.axes||{},st=t.strength||{},nm=t.nearMiddle||{};
 s.appendRow([id,b.createdAt||new Date().toISOString(),b.schemaVersion||CFG.VERSION,b.typeModelVersion||'',b.methodologyVersion||'',b.household||'',num_(b.age),num_(b.monthlyIncome),num_(b.monthlySaving),t.code||'',num_(a.fv),num_(a.pi),num_(a.au),num_(st.fv),num_(st.pi),num_(st.au),!!nm.fv,!!nm.pi,!!nm.au,num_(b.monthlyImprovement),b.goal||'',JSON.stringify(b.needsReview||[]),JSON.stringify(b.expenses||{}),JSON.stringify(b.typeAnswers||{}),JSON.stringify(b),b.toneMode||'']);
}
function saveEvent_(b){
 const ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(CFG.SHEETS.EVENT),id=String(b.eventId||'');if(!id)throw new Error('eventId required');if(find_(s,1,id)>1)return;
 s.appendRow([id,b.diagnosisId||'',b.createdAt||new Date().toISOString(),b.name||'',JSON.stringify(b.data||{})]);
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
