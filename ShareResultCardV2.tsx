import React from 'react';
import type { TypeCode } from './result-payload-v2';
import { getTypeContentV31 } from './type-content-v3.1';
const yen=(n:number)=>new Intl.NumberFormat('ja-JP').format(Math.round(n||0));
type Props={typeCode:TypeCode;typeName:string;typeCatchphrase?:string;battleScore:number;fiveYear:number;topEnemyName?:string;privacyMode?:boolean;};
export default function ShareResultCardV2({typeCode,typeName,typeCatchphrase,battleScore,fiveYear,topEnemyName,privacyMode=false}:Props){
 return <div id="mudagiri-share-card" className="relative aspect-[4/5] w-full overflow-hidden border-4 border-zinc-950 bg-sky-500 p-4 text-zinc-950 shadow-2xl"><img src="./assets/page/share-card-template.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-35 image-pixelated"/>
  <div className="absolute inset-x-0 bottom-0 h-[30%] bg-emerald-500/70"/><div className="relative z-10 flex h-full flex-col">
   <div className="border-4 border-zinc-950 bg-white/95 px-3 py-2 text-center shadow-[5px_5px_0_#18181b]"><div className="text-[10px] font-black tracking-[.25em]">MUDAGIRI DIAGNOSIS</div><div className="mt-1 text-2xl font-black text-amber-500 [text-shadow:2px_2px_0_#18181b]">ムダギリ診断</div></div>
   <div className="mt-4 border-4 border-zinc-950 bg-zinc-950 px-3 py-2 text-center text-xs font-black leading-5 text-white">{getTypeContentV31(typeCode).shareHook}</div>
   <div className="mt-3 text-center"><div className="text-[10px] font-black">あなたの称号</div><div className="mx-auto mt-1 inline-block border-4 border-zinc-950 bg-amber-300 px-4 py-2 text-xl font-black shadow-[4px_4px_0_#18181b]">{typeName}</div>{typeCatchphrase&&<div className="mx-auto mt-2 max-w-[90%] text-[10px] font-bold leading-4">{typeCatchphrase}</div>}</div>
   <div className="mx-auto mt-3 grid h-24 w-24 place-items-center overflow-hidden border-4 border-zinc-950 bg-white shadow-[4px_4px_0_#18181b]"><img src="./assets/mudagiri-kun-canonical.png" alt="ムダギリくん" className="h-full w-full object-cover object-[62%_66%] image-pixelated"/></div>
   <div className="mt-3 grid grid-cols-2 gap-2"><div className="border-4 border-zinc-950 bg-white p-2 text-center shadow-[3px_3px_0_#18181b]"><div className="text-[9px] font-black">BATTLE SCORE</div><div className="text-2xl font-black">{battleScore}<span className="text-[10px]">/100</span></div></div><div className="border-4 border-zinc-950 bg-white p-2 text-center shadow-[3px_3px_0_#18181b]"><div className="text-[9px] font-black">5年の改善余地</div><div className="mt-1 text-lg font-black">{privacyMode?'ひみつ':`¥${yen(fiveYear)}`}</div></div></div>
   {topEnemyName&&<div className="mt-2 border-4 border-zinc-950 bg-white px-3 py-2 text-center text-xs font-black shadow-[3px_3px_0_#18181b]">👾 討伐優先：{topEnemyName}</div>}
   <div className="mt-auto bg-zinc-950 px-3 py-2 text-center text-xs font-black text-white">好きなものは、斬らない。ムダだけ、斬る。<br/><span className="text-amber-300">あなたは何タイプ？　#ムダギリ診断</span></div>
  </div></div>;
}
