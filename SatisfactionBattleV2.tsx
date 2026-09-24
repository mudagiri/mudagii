import React from 'react';
import type { Category } from './mudagiri-diagnosis-v2';
import { ENEMY_CONTENT } from './enemy-content-v2';
import type { SatisfactionQuestion } from './satisfaction-resolver-v2';

type Sat='waste'|'inertia'|'satisfied'|'verySatisfied';
const choices:{key:Sat;label:string;reply:string}[]=[
 {key:'waste',label:'正直、ムダかも',reply:'討伐候補としてチェックする。'},
 {key:'inertia',label:'惰性もある',reply:'惰性の部分だけ狙う。'},
 {key:'satisfied',label:'まあ満足してる',reply:'満足を壊さない範囲だけ見る。'},
 {key:'verySatisfied',label:'かなり満足！',reply:'了解。これは守る。斧をしまおう。'},
];
export default function SatisfactionBattleV2({questions,index,values,onPick,onBack}:{questions:SatisfactionQuestion[];index:number;values:Partial<Record<Category,Sat>>;onPick:(category:Category,value:Sat)=>void;onBack?:()=>void}){
 const q=questions[index]; if(!q)return null; const enemy=ENEMY_CONTENT[q.category]; const current=values[q.category];
 return <section className="mt-6">
  <div className="mb-3 flex items-center justify-between text-xs font-black"><span className="text-amber-400">VALUE CHECK {index+1}</span><span className="text-zinc-500">{index+1} / {questions.length}</span></div>
  <div className="h-1.5 overflow-hidden border border-zinc-800 bg-zinc-950"><div className="h-full bg-amber-400 transition-all" style={{width:`${((index+1)/questions.length)*100}%`}}/></div>
  <div className="rpg-window mt-5 border-2 p-5 text-center">
   <div className="rpg-enemy-marker mx-auto h-28 w-28 overflow-hidden border-2 border-zinc-700 bg-zinc-950" aria-hidden><img src={enemy.image} alt="" className="h-full w-full object-contain image-pixelated" /></div>
   <div className="mt-4 text-xs font-black tracking-[.16em] text-rose-300">{enemy.name} が あらわれた！</div>
   <h3 className="mt-2 text-xl font-black">こいつ、本当に斬っていい？</h3>
   <p className="mt-3 text-sm leading-6 text-zinc-400">{enemy.encounter}</p>
   {q.excess!=null&&<div className="mt-4 border border-zinc-800 bg-zinc-950 p-3 text-sm"><span className="text-zinc-500">近い世帯との差 </span><b className="text-amber-400">約¥{Math.round(q.excess).toLocaleString()}/月</b><div className="mt-1 text-[11px] text-zinc-600">※ 差額＝ムダではありません</div></div>}
  </div>
  <div className="mt-4 grid gap-2">{choices.map(c=><button key={c.key} onClick={()=>onPick(q.category,c.key)} className={`rpg-command border p-4 text-left transition active:translate-y-px ${current===c.key?'is-selected border-amber-400 bg-amber-400 text-zinc-950':'border-zinc-700 bg-zinc-950'}`}><div className="font-black">{c.label}</div><div className={`mt-1 text-xs ${current===c.key?'text-zinc-800':'text-zinc-500'}`}>{c.reply}</div></button>)}</div>
  {index>0&&onBack&&<button onClick={onBack} className="mt-4 w-full p-2 text-xs font-bold text-zinc-500">← 1体戻る</button>}
 </section>
}
