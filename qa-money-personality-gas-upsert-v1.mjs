import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// In-memory sandbox tests the actual GAS entrypoints, never the connected Sheet.
class Sheet {
  constructor(name){this.name=name;this.rows=[];this.columns=26;}
  getMaxColumns(){return this.columns;}
  insertColumnsAfter(_last,extra){this.columns+=extra;}
  getLastRow(){return this.rows.length;}
  setFrozenRows(){}
  hideSheet(){}
  cell(row,col){return this.rows[row-1]?.[col-1]??'';}
  put(row,col,value){while(this.rows.length<row)this.rows.push([]);this.rows[row-1][col-1]=value;}
  getRange(row,col,nr=1,nc=1){
    const sheet=this;
    return {
      getValues(){return Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>sheet.cell(row+i,col+j)));},
      setValues(values){
        assert.equal(values.length,nr);
        for(let i=0;i<nr;i++){
          assert.equal(values[i].length,nc);
          for(let j=0;j<nc;j++)sheet.put(row+i,col+j,values[i][j]);
        }
      },
      createTextFinder(wanted){
        return {
          matchEntireCell(){return this;},
          findNext(){
            for(let i=0;i<nr;i++)if(String(sheet.cell(row+i,col))===String(wanted)){
              return {getRow:()=>row+i};
            }
            return null;
          },
        };
      },
    };
  }
  getDataRange(){return this.getRange(1,1,Math.max(1,this.rows.length),this.columns);}
  records(){
    const [header,...rest]=this.rows;
    return rest.map(row=>Object.fromEntries(header.map((name,i)=>[name,row[i]??''])));
  }
}
const sheets=new Map();
const book={
  getSheetByName(name){return sheets.get(name)??null;},
  insertSheet(name){const s=new Sheet(name);sheets.set(name,s);return s;},
};
let locks=0,unlocks=0;
const context={
  SpreadsheetApp:{getActive(){return book;}},
  LockService:{getScriptLock(){return {waitLock(){locks++},releaseLock(){unlocks++}};}},
  ContentService:{MimeType:{JSON:'JSON'},createTextOutput(contents){
    return {contents,setMimeType(){return this;}};
  }},
  Logger:{log(){throw Error('Audit logging is not part of this test');}},
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('./MUDAGIRI_MONEY_PERSONALITY_GAS_V1.gs',import.meta.url),'utf8'),context);
const get=JSON.parse(context.doGet().contents);
assert.deepEqual({backend:get.backend,version:get.gas_version},
  {backend:'money_personality',version:'MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0'});
function post(payload){
  return JSON.parse(context.doPost({postData:{contents:JSON.stringify(payload)}}).contents);
}
const mk=(sessionId,anon,cohort='PUBLIC',debug=false)=>({
  kind:'money_personality_pilot_v1',
  schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_V1',
  pilotVersion:'PUBLIC_ADAPTIVE_V1',
  sessionId,anonymousUserId:anon,participantId:'mpp_participant_'+sessionId,
  formId:'PUBLIC_ADAPTIVE',startedAt:'2026-10-09T00:00:00.000Z',
  completedAt:'2026-10-09T00:05:00.000Z',
  durationMs:300000,responseCount:1,answerCount:1,
  item_responses:[{item_id:'F01',factor:'FUTURE',position:1,final_response:3,normalized_trait_score:3,item_format:'bipolar_5'}],
  quality:{cognitiveMode:false,debugMode:debug,collectionCohort:cohort,variant:'PUBLIC_ADAPTIVE',
    jobCode:'FDM',primaryStyle:'DRIVE',secondaryStyle:'ENJOY',
    coreCount:30,adaptiveAnswerCount:0,separatorCount:0,
    sourceUrl:'https://mudagiri.github.io/mudagii/pilot/money-type/?utm_source=x',
    axisStates:{TIME:'CLEAR',DECISION:'CLEAR',AWARENESS:'CLEAR'}}
});
assert.equal(post(mk('public_session_1','public_user_1')).ok,true);
assert.equal(post(mk('public_session_1','public_user_1')).ok,true,'idempotent retry');
assert.equal(post(mk('pilot_session_1','pilot_user_1','PILOT')).ok,true);
assert.equal(post(mk('qa_test_fake','qa_test_browser','PILOT',true)).ok,true);
const sessions=sheets.get('①セッション').records();
const results=sheets.get('④結果').records();
const answers=sheets.get('②回答').records();
assert.equal(sessions.length,3,'same session must not create duplicate rows');
assert.equal(results.length,3,'same result must not be duplicated');
assert.equal(answers.length,3,'same answer must not be duplicated');
const audit=context.computeMoneyPersonalityPrevalenceV1_(
  sheets.get('①セッション').getDataRange().getValues(),
  sheets.get('④結果').getDataRange().getValues()
);
assert.equal(audit.uniqueCompletedBrowserIds,1,'PUBLIC included at live /pilot path');
assert.equal(audit.pilotSample.uniqueCompletedBrowserIds,1,'PILOT segregated');
assert.equal(audit.exclusionCounts.testOrDebug,1,'debug session excluded');
assert.equal(audit.byType.find(x=>x.code==='FDM-DRIVE').count,1);
assert.equal(audit.pilotSample.byType.find(x=>x.code==='FDM-DRIVE').count,1);
assert.equal(audit.publication.ready,false);
const invalid=mk('household_attempt','household_browser');
invalid.monthly_take_home=400000;
assert.equal(post(invalid).ok,false,'household financial data must be rejected');
assert.equal(sheets.get('①セッション').records().length,3,'invalid payload must not write session');
assert.equal(locks,unlocks,'GAS lock must always be released');
console.log(JSON.stringify({suite:'MUDAGIRI_MONEY_PERSONALITY_GAS_POST_INMEMORY_V1',
  ok:true,publicCount:audit.uniqueCompletedBrowserIds,pilotCount:audit.pilotSample.uniqueCompletedBrowserIds,
  QAExcluded:audit.exclusionCounts.testOrDebug,upsert:true,invalidHouseholdRejected:true,
  externalSheetsModified:false}));
