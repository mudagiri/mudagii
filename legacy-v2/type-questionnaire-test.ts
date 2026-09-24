import {TYPE_QUESTIONS,scoreTypeAnswers,AnswerValue} from './type-questionnaire-v2';
function assert(x:boolean,m:string){if(!x)throw new Error(m)}
assert(TYPE_QUESTIONS.length===8,'8 questions');
assert(['fv','pi','au','se'].every(a=>TYPE_QUESTIONS.filter(q=>q.axis===a).length===2),'2 per axis');
const vals:AnswerValue[]=[-2,-1,1,2]; const reached=new Set<string>();
for(const fv of vals)for(const pi of vals)for(const au of vals)for(const se of vals){const ans:any={Q1:fv,Q2:fv,Q3:pi,Q4:pi,Q5:au,Q6:au,Q7:se,Q8:se}; reached.add(scoreTypeAnswers(ans).code)}
assert(reached.size===16,'all 16 types reachable');
const a:any={Q1:2,Q2:2,Q3:2,Q4:2,Q5:2,Q6:2,Q7:2,Q8:2};
const r=scoreTypeAnswers(a); assert(r.code==='FPAS','positive poles'); assert(Object.values(r.scores).every(v=>v===100),'normalized 100');
const b:any={Q1:-2,Q2:-2,Q3:-2,Q4:-2,Q5:-2,Q6:-2,Q7:-2,Q8:-2}; assert(scoreTypeAnswers(b).code==='VIUE','negative poles');
console.log('TYPE QUESTIONNAIRE: PASS | 8 questions | 2/axis | 16/16 types reachable');
