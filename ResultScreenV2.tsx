import React, { useEffect, useMemo, useState } from 'react';
import ShareResultCardV2 from './ShareResultCardV2';
import ResultRevealV2 from './ResultRevealV2';
import { UX_COPY_V2 } from './ux-copy-v2';
import { buildShareText } from './share-copy-v2';
import { MODE_COPY, type ToneMode } from './tone-mode-v3';
import MethodologyDisclosureV1 from './MethodologyDisclosureV1';

type Payload = any;

const yen = (n:number) => new Intl.NumberFormat('ja-JP').format(Math.round(n || 0));
const goalLabel:Record<string,string> = { investment:'資産形成',travel:'旅行',home:'住まい',children:'子ども',hobby:'趣味',saving:'貯金',other:'やりたいこと' };
const categoryLabel:Record<string,string> = {mobile:'通信費',energy:'光熱費',sub:'サブスク',car:'車関連',food:'食費',daily:'日用品',fun:'娯楽・交際費',beautyFashion:'美容・服飾',rent:'住居費',insurance:'保険',childEducation:'教育費',selfDevelopment:'自己投資'};

const enemyMeta:Record<string,{icon:string;catchcopy:string;encounter:string}> = {
  mobile:{icon:'🦖',catchcopy:'情弱を狙う回線の恐竜',encounter:'通信ザウルスが あらわれた！'},
  energy:{icon:'⚡',catchcopy:'ジワジワ削る感電型',encounter:'電気ウナギ魔人が あらわれた！'},
  sub:{icon:'🌀',catchcopy:'使ってないのに毎月吸い取る',encounter:'サブスクサキュバスが あらわれた！'},
  car:{icon:'🚗',catchcopy:'所有欲に憑く固定費モンスター',encounter:'ムダカーが あらわれた！'},
  food:{icon:'🍖',catchcopy:'満足なら斬らない。惰性だけ狙う',encounter:'クイダオーレが あらわれた！'},
  daily:{icon:'🧻',catchcopy:'小さな出費を群れで積み上げる',encounter:'チリツモコビトが あらわれた！'},
  fun:{icon:'🎉',catchcopy:'楽しい支出は守る。惰性だけ討伐',encounter:'アソビスギーが あらわれた！'},
  beautyFashion:{icon:'💎',catchcopy:'満足度の低い見栄課金に潜む',encounter:'ミエハリーヌが あらわれた！'},
};


function Meter({value}:{value:number}){
  return <div className="h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-amber-400 transition-all" style={{width:`${Math.max(0,Math.min(100,value))}%`}} /></div>;
}

export default function ResultScreenV2({result,toneMode='serious',familyProfile='single',onLine,onEvent}:{result:Payload;toneMode?:ToneMode;familyProfile?:'single'|'couple'|'children'|'other';onLine?:(context?:Record<string,unknown>)=>void;onEvent?:(name:string,data?:Record<string,unknown>)=>void}){
  const [goal,setGoal] = useState<string>(result.futureGoal || '');
  const [revealed,setRevealed] = useState(true);
  const [showShareCard,setShowShareCard] = useState(false);
  const [privacyShare,setPrivacyShare] = useState(true);
  const top = result.enemies?.[0];

  useEffect(()=>{onEvent?.('result_viewed',{type:result.type?.code,typeModelVersion:result.type?.modelVersion||'TYPE_MODEL_V3_1_8',battleScore:result.battle?.score});},[]);
  const comparisons = useMemo(() => (result.comparison?.categories || []).filter((x:any)=>x.comparable != null && x.difference > 0).sort((a:any,b:any)=>b.difference-a.difference).slice(0,3),[result]);
  const sat = result.satisfaction?.global || 3;
  const satText = ['','かなり満足','まあ満足','普通','少しモヤる','ムダを感じる'][sat];
  const goalEntries = familyProfile==='children' ? [['travel','家族旅行'],['children','教育・子ども'],['home','住まい'],['investment','資産形成'],['saving','もしもの備え'],['other','その他']] : [['travel','旅行'],['hobby','趣味'],['investment','資産形成'],['home','住まい'],['saving','安心資金'],['other','その他']];

  async function shareResult(){
    const text=buildShareText({code:result.type?.code,battleScore:result.battle?.score,fiveYear:result.improvement?.fiveYear,topEnemyName:top?.name,privacy:privacyShare,variant:'curiosity'});
    onEvent?.('mudagiri_share_click',{type:result.type?.code,privacy:privacyShare});
    if(typeof navigator!=='undefined' && navigator.share){ try{ await navigator.share({title:'ムダギリ診断',text}); return; }catch{} }
    if(typeof navigator!=='undefined' && navigator.clipboard){ await navigator.clipboard.writeText(text); alert('診断結果をコピーしました'); }
  }


  if(!revealed) return <ResultRevealV2 result={result} onComplete={()=>setRevealed(true)} onEvent={onEvent}/>;

  const allBuckets = [
    {key:'cut', label:'斬る', mark:'⚔', tone:'text-rose-300', items:result.buckets?.cut || []},
    {key:'protected', label:'守る', mark:'♥', tone:'text-emerald-300', items:result.buckets?.protected || []},
    {key:'unreviewed', label:'まだ斬らない', mark:'?', tone:'text-amber-300', items:result.buckets?.unreviewed || []},
    {key:'clear', label:'異常なし', mark:'○', tone:'text-zinc-400', items:result.buckets?.clear || []},
  ];

  return <main className="mudagiri-shell min-h-screen bg-zinc-950 text-zinc-100">
    <div className="mx-auto max-w-md px-4 pb-28 pt-5">
      {/* ENDING 01 — identity. One event, not a dashboard card. */}
      <section className="rpg-window mb-7">
        <div className="border-b-2 border-zinc-100 px-4 py-2 text-[10px] font-black tracking-[.24em] text-amber-400">QUEST COMPLETE / TITLE ACQUIRED</div>
        <div className="px-5 py-7 text-center">
          <div className="text-[10px] font-black tracking-[.2em] text-zinc-500">あなたの称号</div>
          <h1 className="mt-2 text-3xl font-black leading-tight text-amber-400">{result.type?.name}</h1>
          {result.type?.content?.catchphrase && <p className="mx-auto mt-4 max-w-xs text-sm font-black leading-6">「{result.type.content.catchphrase}」</p>}
          <div className="mt-5 border-t border-zinc-700 pt-4 text-left text-xs leading-6 text-zinc-400">{result.type?.content?.summary}</div>
        </div>
      </section>

      {/* ENDING 02 — score as a status line, not two KPI cards. */}
      <section className="mb-8">
        <div className="mb-2 flex items-end justify-between border-b-2 border-zinc-700 pb-2">
          <div><div className="text-[10px] font-black tracking-[.18em] text-zinc-500">BATTLE SCORE</div><div className="mt-1 text-sm font-black">家計の守備力</div></div>
          <div className="text-4xl font-black text-amber-400">{result.battle?.score}<span className="text-sm text-zinc-600"> /100</span></div>
        </div>
        <Meter value={result.battle?.score}/>
        <div className="mt-3 flex justify-between text-xs"><span className="text-zinc-500">お金の満足度</span><span className="font-black">{satText}</span></div>
      </section>

      {/* ENDING 03 — the money reveal is the hero moment. */}
      <section className="mb-8 border-y-2 border-zinc-100 py-7 text-center">
        <div className="text-[11px] font-black tracking-[.2em] text-amber-400">MUDAGIRI RESULT</div>
        <div className="mt-2 text-sm font-black">見つかった推定改善余地</div>
        <div className="mt-3 text-5xl font-black tracking-tight">¥{yen(result.improvement?.monthly)}</div>
        <div className="mt-1 text-xs font-bold text-zinc-500">/ 月</div>
        <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 divide-x divide-zinc-700 border-y border-zinc-700 py-3">
          <div><div className="text-[10px] text-zinc-600">1 YEAR</div><div className="mt-1 font-black">¥{yen(result.improvement?.annual)}</div></div>
          <div><div className="text-[10px] text-zinc-600">5 YEARS</div><div className="mt-1 font-black text-amber-400">¥{yen(result.improvement?.fiveYear)}</div></div>
        </div>
        <p className="mx-auto mt-4 max-w-xs text-[10px] leading-5 text-zinc-600">現在の診断条件から算定した推定値。投資収益は含めず、5年は月額×60ヶ月で表示しています。</p>
      </section>

      {/* ENDING 05 — trust proof: we deliberately spared valued spending. */}
      {!!result.spared?.length && <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between border-b border-emerald-900 pb-2"><h2 className="font-black text-emerald-300">♥ 今回、斬らなかったもの</h2><span className="text-[10px] text-zinc-600">SPARED</span></div>
        {result.spared.map((x:any)=><div key={x.category} className="border-b border-zinc-800 py-3"><div className="flex items-center justify-between"><span className="font-black">{categoryLabel[x.category] || x.category}</span><span className="font-black">¥{yen(x.actual)}</span></div><p className="mt-1 text-xs leading-5 text-zinc-500">{x.content?.spared}</p></div>)}
        <p className="mt-3 text-xs font-bold leading-5 text-zinc-400">高くても、あなたが価値を感じているなら斬らない。</p>
      </section>}

      {/* ENDING 04 — future pacing immediately after the amount. */}
      <section className="relative mb-8 overflow-hidden border border-zinc-800">
        <img src="./assets/page/future-goal-key-visual.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-45 image-pixelated"/>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/55 via-zinc-950/75 to-zinc-950"/>
        <div className="relative z-10 p-5">
        <div className="text-[10px] font-black tracking-[.18em] text-amber-400">NEXT QUEST</div>
        <h2 className="mt-1 text-xl font-black">この改善余地、何に変えたい？</h2>
        <p className="mt-2 text-xs leading-5 text-zinc-300">削ることがゴールじゃない。取り戻したお金の行き先を決める。</p>
        <div className="mt-4 border-y border-zinc-700 bg-zinc-950/65">
          {goalEntries.map(([k,v])=><button key={k} onClick={()=>{setGoal(k);onEvent?.('future_goal_selected',{goal:k,type:result.type?.code,typeModelVersion:result.type?.modelVersion||'TYPE_MODEL_V3_1_8'});}} className={`rpg-command ${goal===k?'is-selected':''} flex w-full items-center px-2 py-3 text-left text-sm font-black`}>{v}</button>)}
        </div>
        {goal && <div className="mt-4 border border-amber-400/50 bg-zinc-950/75 p-3 text-center text-xs font-black text-amber-300">5年で約 ¥{yen(result.improvement?.fiveYear)} を「{goalEntries.find(([k])=>k===goal)?.[1]||goal}」へ。</div>}
        </div>
      </section>

      {/* ENDING 06 — comparison is evidence, not a judgement. */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between border-b border-zinc-700 pb-2"><h2 className="font-black">似た世帯との比較</h2><span className="text-[10px] text-zinc-600">REFERENCE</span></div>
        {comparisons.length ? comparisons.map((x:any)=><div key={x.category} className="flex items-center justify-between border-b border-zinc-800 py-3 text-sm"><span className="text-zinc-400">{categoryLabel[x.category] || x.category}</span><span className="font-black">+¥{yen(x.difference)} /月</span></div>) : <p className="py-3 text-sm text-zinc-500">大きく上回っている主要項目はありません。</p>}
        <p className="mt-3 text-xs leading-5 text-zinc-500">この差額を、そのままムダとは判定していません。<b className="text-zinc-200">好きなものは、斬らない。ムダだけ、斬る。</b></p>
      </section>

      {/* ENDING 07 — encounter ranking as a quest log. */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between border-b-2 border-zinc-700 pb-2"><h2 className="font-black">今回の討伐優先度</h2><span className="text-[10px] text-zinc-600">QUEST LOG</span></div>
        {result.enemies?.length ? result.enemies.slice(0,3).map((e:any,idx:number)=><div key={e.category} className="flex items-center gap-3 border-b border-zinc-800 py-4"><div className="grid h-9 w-9 shrink-0 place-items-center border border-zinc-700 font-black text-amber-400">{idx+1}</div><div className="min-w-0 flex-1"><div className="font-black">{e.name}</div><div className="mt-1 truncate text-[11px] text-zinc-500">{enemyMeta[e.category]?.catchcopy || '改善余地を検知'}</div></div><div className="text-right"><div className="font-black">¥{yen(e.monthlyImprovement)}</div><div className="text-[10px] text-zinc-600">/月</div></div></div>) : <p className="py-4 text-sm text-zinc-500">自動判定できる大きなムダ敵は見つかりませんでした。</p>}
      </section>

      {/* ENDING 08 — all 12 categories, rendered like a status ledger. */}
      {!!result.buckets && <section className="mb-8">
        <div className="mb-3 border-b-2 border-zinc-700 pb-2"><h2 className="font-black">12項目の判定</h2><p className="mt-1 text-[11px] text-zinc-600">高い＝ムダにはしていません。</p></div>
        {allBuckets.map(group=><div key={group.key} className="grid grid-cols-[7.5rem_1fr] border-b border-zinc-800 py-3"><div className={`text-xs font-black ${group.tone}`}>{group.mark} {group.label} <span className="text-zinc-600">{group.items.length}</span></div><div className="text-right text-xs leading-5 text-zinc-400">{group.items.length ? group.items.map((x:any)=>categoryLabel[x.category] || x.category).join(' / ') : '—'}</div></div>)}
      </section>}

      {!!result.needsReview?.length && <section className="rpg-window relative mb-8 overflow-hidden">
        <img src="./assets/page/unresolved-background.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-35 image-pixelated"/>
        <div className="absolute inset-0 bg-zinc-950/70"/>
        <div className="relative z-10 border-b-2 border-zinc-100 px-4 py-2 text-[10px] font-black tracking-[.2em] text-amber-400">UNKNOWN ENEMY</div>
        <div className="relative z-10 p-4"><h2 className="text-lg font-black">まだ終わりじゃない…</h2><p className="mt-1 text-sm font-black">自動では判定できない項目が {result.needsReview.length}つ残っています</p><p className="mt-2 text-xs leading-5 text-zinc-300">これは「ムダ」という意味ではありません。保障内容や目的など、金額だけでは判断できない項目です。</p>{result.needsReview.map((x:any)=><div key={x.category} className="mt-4 border-t border-zinc-700 pt-3"><div className="flex justify-between gap-3 text-sm font-black"><span>{x.content?.name || categoryLabel[x.category] || x.category}</span><span>{x.amountKnown===false?'金額不明':`¥${yen(x.actual)}`}</span></div><p className="mt-1 text-xs leading-5 text-zinc-500">{x.content?.needsReview || x.reason}</p></div>)}</div>
      </section>}

      {/* Primary conversion. The UI stays in-world, but the action is explicit. */}
      <section className="mb-8 border-y-2 border-amber-400 py-6 text-center">
        <div className="text-[10px] font-black tracking-[.18em] text-amber-400">SAVE POINT / LINE</div><div className="mt-2 text-xs font-black text-zinc-300">次は「何からやるか」です。</div>
        <h2 className="mt-2 text-2xl font-black">{(result.needsReview?.length||0)>0?`残り${result.needsReview.length}体、まだ要鑑定。`:MODE_COPY[toneMode].lineTitle}</h2>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-400">{goal?`あなたが選んだ「${goalEntries.find(([k])=>k===goal)?.[1]||goal}」につなげるため、討伐順を整理します。`:MODE_COPY[toneMode].lineBody}</p>
        {!!result.lineUnlock?.actions?.length && <div className="mx-auto mt-4 max-w-xs border-y border-zinc-800 py-3 text-xs text-zinc-400">あなた専用の討伐リスト　自分でできる {result.lineUnlock.actions.filter((a:any)=>a.tier==='SELF_ACTION').length}件　/　要確認 {result.lineUnlock.actions.filter((a:any)=>a.tier!=='SELF_ACTION').length}件</div>}
        <button onClick={()=>{onEvent?.('mudagiri_line_click',{type:result.type?.code,hiddenMonthlyImprovement:result.lineUnlock?.hiddenMonthlyImprovement}); if(onLine){onLine({type:result.type?.code,hiddenMonthlyImprovement:result.lineUnlock?.hiddenMonthlyImprovement});}else if(typeof window!=='undefined'){window.location.href='https://lin.ee/ZeLu7i6';}}} className="rpg-primary mt-5 flex w-full items-center justify-center gap-2 px-4 py-4 font-black">{MODE_COPY[toneMode].lineCta || '▶ LINEに討伐リストを保存'}<span aria-hidden="true">›</span></button>
        <p className="mt-3 text-[10px] leading-5 text-zinc-600">{UX_COPY_V2.line.trust}</p>

      </section>

      {/* Secondary conversion comes after LINE. */}
      <section className="border-t border-zinc-800 pt-5">
        <div className="flex items-center justify-between"><div><div className="text-sm font-black">結果カードをシェア</div><div className="mt-1 text-[11px] text-zinc-600">金額は隠してシェアできます。</div></div><button onClick={()=>setShowShareCard(v=>!v)} className="border border-zinc-700 px-3 py-2 text-xs font-black">{showShareCard?'閉じる':'見る'}</button></div>
        {showShareCard && <div className="mt-4"><ShareResultCardV2 typeCode={result.type?.code} typeName={result.type?.name} typeCatchphrase={result.type?.content?.catchphrase} battleScore={result.battle?.score} fiveYear={result.improvement?.fiveYear} topEnemyName={top?.name} privacyMode={privacyShare}/></div>}
        <label className="mt-4 flex items-center gap-3 border-y border-zinc-800 py-3 text-xs text-zinc-400"><input type="checkbox" checked={privacyShare} onChange={e=>setPrivacyShare(e.target.checked)} className="h-4 w-4"/><span>改善金額を隠す</span></label>
        <button onClick={shareResult} className="mt-3 flex w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-950 px-4 py-4 font-black"><span aria-hidden="true" className="text-amber-400">↗</span>診断結果をシェア</button>
      </section>
    <MethodologyDisclosureV1/>
      </div>
  </main>;
}
