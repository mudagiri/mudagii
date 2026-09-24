import React, { useMemo, useState } from 'react';
import type { Category } from './mudagiri-diagnosis-v2';
import { getEnemyContent } from './enemy-content-v2';
import { MODE_COPY, type ToneMode } from './tone-mode-v3';

type BattleItem = { category:Category; state:'defeat'|'spared'|'needs_review'; actual:number; comparable?:number|null; monthlyImprovement?:number };
const fmt=(n:number)=>new Intl.NumberFormat('ja-JP').format(Math.round(n));
const stateMeta={
 defeat:{label:'WEAK POINT',mark:'⚔',className:'text-rose-300'},
 spared:{label:'NO ATTACK',mark:'♥',className:'text-emerald-300'},
 needs_review:{label:'UNKNOWN',mark:'?',className:'text-amber-300'},
} as const;

export default function BattleSequenceV2({items,toneMode='serious',onComplete,onEvent}:{items:BattleItem[];toneMode?:ToneMode;onComplete:()=>void;onEvent?:(name:string,data?:Record<string,unknown>)=>void}){
 const [index,setIndex]=useState(0); const current=items[index];
 const content=useMemo(()=>current?getEnemyContent(current.category):null,[current]);
 if(!current||!content) return <button onClick={onComplete} className="rpg-primary w-full p-4 font-black">▶ 結果へ進む</button>;
 const last=index===items.length-1, meta=stateMeta[current.state];
 const base=current.state==='defeat'?content.defeat:current.state==='spared'?content.spared:content.needsReview;
 const mode=current.state==='defeat'?MODE_COPY[toneMode].defeat:current.state==='spared'?MODE_COPY[toneMode].spared:MODE_COPY[toneMode].review;
 function advance(){onEvent?.('mudagiri_battle_resolved',{category:current.category,state:current.state,index:index+1});last?onComplete():setIndex(i=>i+1)}
 return <section className="pt-2" aria-label={`バトル ${index+1}/${items.length}`}>
  <div className="rpg-status text-[11px]"><span>BATTLE {index+1} / {items.length}</span><span>QUEST</span></div>
  <div className="rpg-window mt-3 overflow-hidden">
   <div className="battle-stage relative min-h-64 overflow-hidden p-5 text-center"><img src="./assets/page/battle-background.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-55 image-pixelated"/><img src="./assets/page/encounter-vs.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-[.10] mix-blend-screen image-pixelated"/><div className="absolute inset-0 bg-gradient-to-b from-zinc-950/25 via-transparent to-zinc-950/80"/><div className="relative z-10">
    <div className="text-[11px] font-black tracking-[.18em] text-amber-300">{content.name} が あらわれた！</div>
    <div className="mx-auto mt-5 h-36 w-36 border-b-2 border-zinc-600" aria-hidden="true"><img src={`./assets/enemies/${current.category}/${current.state==='defeat'?'defeated':current.state==='spared'?'escape':'encounter'}.webp`} alt="" className="h-full w-full object-contain image-pixelated" /></div>
    <div className="mt-3 text-xs font-black text-zinc-300">{content.catchcopy}</div>
   </div></div>
   <div className="border-t-2 border-white bg-zinc-950 p-4">
    <div className="rpg-dialogue p-4 pr-8 text-left"><p className="text-sm font-bold leading-6 text-zinc-100">{content.encounter}</p></div>
    <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-y border-zinc-700 py-3 text-sm">
      <dt className="text-zinc-400">あなた</dt><dd className="text-right font-black">¥{fmt(current.actual)}</dd>
      <dt className="text-zinc-400">近い世帯</dt><dd className="text-right font-black">{current.comparable==null?'—':`約 ¥${fmt(current.comparable)}`}</dd>
    </dl>
    <div className="mt-3 border-l-4 border-amber-300 bg-zinc-900 p-4">
      <div className={`text-xs font-black tracking-[.16em] ${meta.className}`}>{meta.mark} {meta.label}</div>
      {current.state==='defeat'&&<div className="mt-2 text-2xl font-black text-amber-300">月 ¥{fmt(current.monthlyImprovement??0)} <span className="text-xs text-zinc-400">改善余地</span></div>}
      <p className="mt-2 text-sm leading-6 text-zinc-300">{mode} {base}</p>
    </div>
    <div className="mt-4 flex items-end gap-3">
      <img src="./assets/mudagiri-kun-canonical.png" alt="ムダギリくん" className="h-16 w-16 shrink-0 border-2 border-white bg-sky-500 object-cover object-[62%_66%] image-pixelated"/>
      <button onClick={advance} className="rpg-primary min-h-14 flex-1 px-4 py-3 text-left font-black">▶ {last?'QUEST COMPLETE':'次の敵へ'}</button>
    </div>
   </div>
  </div>
 </section>;
}
