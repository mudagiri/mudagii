import type { TypeCode } from './result-payload-v2';

export type AxisKey='fv'|'pi'|'au'|'se';
export type AnswerValue=-2|-1|1|2;
export interface TypeQuestion { id:string; axis:AxisKey; text:string; left:string; right:string; }
export interface AxisScores { fv:number; pi:number; au:number; se:number; }

export const TYPE_QUESTIONS:TypeQuestion[]=[
 {id:'Q1',axis:'fv',text:'家計を見直すなら、まず気になるのは？',left:'毎月自動で出ていく固定費',right:'月によって変わる買い物・外食'},
 {id:'Q2',axis:'fv',text:'「使いすぎた」と感じるのはどっち？',left:'契約を放置して払い続けた時',right:'その月に使いすぎた時'},
 {id:'Q3',axis:'pi',text:'欲しいものを見つけた時は？',left:'一度考えてから買うことが多い',right:'その場の勢いで買うことが多い'},
 {id:'Q4',axis:'pi',text:'旅行や大きな買い物は？',left:'先に予算を決めたい',right:'楽しさ優先で後から調整する'},
 {id:'Q5',axis:'au',text:'先月、何にいくら使ったか聞かれたら？',left:'だいたい答えられる',right:'意外と答えられない'},
 {id:'Q6',axis:'au',text:'カードや口座の明細は？',left:'定期的に確認する',right:'必要な時しか見ない'},
 {id:'Q7',axis:'se',text:'臨時収入が入ったら近いのは？',left:'まず貯蓄・投資に回したい',right:'欲しかった体験や物に使いたい'},
 {id:'Q8',axis:'se',text:'お金を使って一番得たいものは？',left:'将来への安心',right:'今の生活の充実'},
];

export function scoreTypeAnswers(answers:Record<string,AnswerValue|undefined>, observedUnknownRate?:number){
 const raw:AxisScores={fv:0,pi:0,au:0,se:0}; const counts:Record<AxisKey,number>={fv:0,pi:0,au:0,se:0};
 for(const q of TYPE_QUESTIONS){const v=answers[q.id]; if(v!==undefined){raw[q.axis]+=v;counts[q.axis]++;}}
 const norm=(k:AxisKey)=>counts[k]?Math.round(raw[k]/(counts[k]*2)*100):0;
 let scores:AxisScores={fv:norm('fv'),pi:norm('pi'),au:norm('au'),se:norm('se')};
 // A/U only: questionnaire 70% + observed unknown-spend behavior 30% when available.
 if(observedUnknownRate!==undefined){const observed=Math.max(-100,Math.min(100,100-observedUnknownRate*200)); scores.au=Math.round(scores.au*.7+observed*.3);}
 const code=((scores.fv>=0?'F':'V')+(scores.pi>=0?'P':'I')+(scores.au>=0?'A':'U')+(scores.se>=0?'S':'E')) as TypeCode;
 return {code,scores,axes:{fv:{score:scores.fv,strength:Math.abs(scores.fv)/100,boundary:Math.abs(scores.fv)<15},pi:{score:scores.pi,strength:Math.abs(scores.pi)/100,boundary:Math.abs(scores.pi)<15},au:{score:scores.au,strength:Math.abs(scores.au)/100,boundary:Math.abs(scores.au)<15},se:{score:scores.se,strength:Math.abs(scores.se)/100,boundary:Math.abs(scores.se)<15}}};
}
