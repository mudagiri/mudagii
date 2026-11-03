import type {AxisId,EngineEvaluation} from './classifierV1';
import {displayScore,FACTOR_PUBLIC_LABEL} from './publicFlowV1';

/** Use the exact classifier state; never re-classify via a UI ratio. */
export type ResultAxisRow={title:string;left:string;right:string;lean:string;pos:number};
const ROWS=[
 {axis:'TIME',title:'時間の向き',a:'FUTURE',b:'IMMEDIATE'},
 {axis:'DECISION',title:'決め方',a:'DELIBERATION',b:'INTUITION'},
 {axis:'AWARENESS',title:'確認のタイミング',a:'MONITORING',b:'PERIODIC'},
] as const;
const LABEL:Record<AxisId,string>={TIME:'時間の向き',DECISION:'決め方',AWARENESS:'確認のタイミング'};

export function buildResultAxisRows(evaluation:EngineEvaluation):ResultAxisRow[]{
 return ROWS.map(({axis,title,a,b})=>{
  const x=evaluation.axes[axis],av=displayScore(x.scoreA),bv=displayScore(x.scoreB);
  const pos=Math.max(0,Math.min(100,Math.round(50+(bv-av)/2)));
  const left=FACTOR_PUBLIC_LABEL[a],right=FACTOR_PUBLIC_LABEL[b];
  const winner=x.dominant===x.poleA?left:x.dominant===x.poleB?right:null;
  const lean=x.balanceState==='BALANCED'
   ?x.absoluteState==='HIGH_HIGH'?'両方強い':x.absoluteState==='LOW_LOW'?'どちらも控えめ':'ほぼ半々'
   :x.balanceState==='LEAN'?(winner?`やや${winner}寄り`:'差が小さい')
   :(winner?`${winner}寄り`:'判定保留');
  return {title,left,right,lean,pos};
 });
}

/** Forced separators choose the closer label without eliminating the other trait. */
export function buildResultBalanceNote(evaluation:EngineEvaluation):string|null{
 const balanced=(['TIME','DECISION','AWARENESS'] as const)
   .filter(axis=>evaluation.axes[axis].balanceState==='BALANCED').map(axis=>LABEL[axis]);
 const styleClose=evaluation.style.dualLike;
 if(!balanced.length&&!styleClose)return null;
 const axesText=balanced.length
   ?`${balanced.join('・')}は、両方の特徴が近かったよ。最後の確認で、よりしっくりくる方を選んでもらった。`:'';
 const styleText=styleClose?'大切にする価値観も、上位2つがかなり近かったよ。':'';
 return `${axesText}${styleText} 片方の特徴がなくなるわけじゃないから、どっちも自分っぽくてOK。`.trim();
}
