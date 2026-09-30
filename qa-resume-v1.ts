import {strict as assert} from 'node:assert';
import {ACTIVE_RESULT_KEY,JOURNEY_DRAFT_KEY,readActiveResultV1,readJourneyDraftV1} from './resume-state-v1';

class Mem {
 m=new Map<string,string>();
 getItem(k:string){return this.m.get(k)??null}
 setItem(k:string,v:string){this.m.set(k,v)}
 removeItem(k:string){this.m.delete(k)}
}
const base={schemaVersion:'MUDAGIRI_JOURNEY_DRAFT_V1',diagnosisId:'d1',anonymousUserId:'u1',updatedAt:new Date().toISOString(),toneMode:'serious',scene:'scan',questionIndex:2,householdSizePending:false,flow:{},annualIncomeBand:'unknown',scanIndex:3,rawExpenses:{},scanTouched:{},appraisalIndex:0,appraisalAnswers:{},typeIndex:0,typeAnswers:{}};
const s=new Mem();
s.setItem(JOURNEY_DRAFT_KEY,JSON.stringify(base));
assert.equal(readJourneyDraftV1(s as any)?.diagnosisId,'d1');
for(const scene of ['mode','profile','incomeCalibration','scan','scanComplete','appraisal','appraisalComplete','typeQuiz','typeComplete','battleIntro']){s.setItem(JOURNEY_DRAFT_KEY,JSON.stringify({...base,scene}));assert.equal(readJourneyDraftV1(s as any)?.scene,scene)}
for(const scene of ['opening','battle','battleComplete','garbage']){s.setItem(JOURNEY_DRAFT_KEY,JSON.stringify({...base,scene}));assert.equal(readJourneyDraftV1(s as any),null)}
s.setItem(JOURNEY_DRAFT_KEY,'{bad');assert.equal(readJourneyDraftV1(s as any),null);
s.setItem(JOURNEY_DRAFT_KEY,JSON.stringify({...base,schemaVersion:'OLD'}));assert.equal(readJourneyDraftV1(s as any),null);
s.setItem(JOURNEY_DRAFT_KEY,JSON.stringify({...base,typeIndex:99}));assert.equal(readJourneyDraftV1(s as any),null);
s.setItem(ACTIVE_RESULT_KEY,JSON.stringify({schemaVersion:'MUDAGIRI_ACTIVE_RESULT_V1',diagnosisId:'d2',anonymousUserId:'u1',completedAt:new Date().toISOString(),methodology:{diagnosis:'x',resolver:'y',type:'z'},completed:{typeAnswers:{}}}));
assert.equal(readActiveResultV1(s as any)?.diagnosisId,'d2');
s.setItem(ACTIVE_RESULT_KEY,'{bad');assert.equal(readActiveResultV1(s as any),null);
s.setItem(ACTIVE_RESULT_KEY,JSON.stringify({schemaVersion:'OLD'}));assert.equal(readActiveResultV1(s as any),null);
console.log('resume-v1 storage QA: PASS');
