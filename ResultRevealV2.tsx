import React, { useEffect, useMemo, useState } from 'react';

type Props = { result:any; onComplete:()=>void; onEvent?:(name:string,data?:Record<string,unknown>)=>void };
const yen=(n:number)=>new Intl.NumberFormat('ja-JP').format(Math.round(n||0));

export default function ResultRevealV2({result,onComplete,onEvent}:Props){
  const [step,setStep]=useState(0);
  const reduced=useMemo(()=>typeof window!=='undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,[]);
  const cutCount=(result.categories||[]).filter((x:any)=>x.state==='defeated'||x.bucket==='cut').length || result.enemies?.filter((x:any)=>Number(x.reducible)>0).length || 0;
  const protectedCount=(result.categories||[]).filter((x:any)=>x.state==='spared'||x.bucket==='protected').length || 0;
  const reviewCount=(result.categories||[]).filter((x:any)=>x.state==='needsReview'||x.bucket==='review').length || result.needsReview?.length || 0;
  const steps=[
    {key:'complete',eyebrow:'QUEST COMPLETE',icon:<span className="text-5xl" aria-hidden="true">🏆</span>,title:'12体の判定、完了。',body:'高いだけでは斬っていません。あなたの価値観まで含めて判定しました。'},
    {key:'battle',eyebrow:'BATTLE REPORT',icon:<span className="text-5xl" aria-hidden="true">⚔️</span>,title:`討伐候補 ${cutCount}体`,body:`守った支出 ${protectedCount}件 / 要鑑定 ${reviewCount}件。ムダだけを残しました。`},
    {key:'title',eyebrow:'TITLE ACQUIRED',icon:<span className="text-5xl" aria-hidden="true">✨</span>,title:result.type?.name||'称号獲得',body:result.type?.content?.catchphrase||'あなたのお金の使い方から称号を獲得しました。'},
    {key:'money',eyebrow:'MUDAGIRI RESULT',icon:<span className="text-5xl" aria-hidden="true">🛡️</span>,title:`月 ${yen(result.improvement?.monthly)}円`,body:`1年 ${yen(result.improvement?.annual)}円 / 5年 ${yen(result.improvement?.fiveYear)}円 の推定改善余地`},
  ];
  useEffect(()=>{ onEvent?.('result_reveal_step',{step:steps[step].key,index:step}); },[step]);
  useEffect(()=>{
    if(reduced) return;
    if(step>=steps.length-1) return;
    const id=window.setTimeout(()=>setStep(s=>s+1),900);
    return ()=>window.clearTimeout(id);
  },[step,reduced]);
  const s=steps[step];
  return <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100"><img src="./assets/page/result-victory-background.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-35 image-pixelated"/><div className="absolute inset-0 bg-zinc-950/60"/><div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10 text-center" aria-live="polite">
    <div className="text-xs font-black tracking-[.28em] text-amber-400">{s.eyebrow}</div>
    <div className="rpg-window mx-auto mt-6 grid h-28 w-28 place-items-center border-2 border-amber-400/70 bg-zinc-900">{s.icon}</div>
    <h1 className="mt-7 text-3xl font-black">{s.title}</h1><p className="mt-3 text-sm leading-6 text-zinc-400">{s.body}</p>
    <div className="mt-7 flex justify-center gap-2" aria-label={`結果開封 ${step+1}/${steps.length}`}>{steps.map((x,i)=><span key={x.key} className={`h-1.5 border border-zinc-800 ${i<=step?'w-8 bg-amber-400':'w-3 bg-zinc-950'}`}/>)}</div>
    {step<steps.length-1 ? <button onClick={()=>setStep(s=>Math.min(steps.length-1,s+1))} className="rpg-command mt-7 w-full border-2 border-zinc-700 bg-zinc-900 p-4 font-black">タップして進む</button> : <button onClick={()=>{onEvent?.('result_reveal_complete',{type:result.type?.code});onComplete();}} className="rpg-primary mt-7 w-full p-4 font-black">診断結果を見る →</button>}
    <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-600"><span aria-hidden="true">♥</span>好きなものは、斬らない。ムダだけ、斬る。</div>
  </div></main>;
}
