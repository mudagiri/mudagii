import React,{useEffect,useMemo,useRef,useState} from 'react';
import {TYPE_CONTENT_V31} from './type-content-v3.1';

const yen=(n:number)=>new Intl.NumberFormat('ja-JP').format(Math.round(n));
const signedYen=(n:number)=>n>0?'+¥'+yen(n):n<0?'-¥'+yen(Math.abs(n)):'±¥0';
const TYPE_ART:Record<string,string>={
 FPA:'./assets/types/v31/TYPE_FPA.png',FPU:'./assets/types/v31/TYPE_FPU.png',
 FIA:'./assets/types/v31/TYPE_FIA.png',FIU:'./assets/types/v31/TYPE_FIU.png',
 VPA:'./assets/types/v31/TYPE_VPA.png',VPU:'./assets/types/v31/TYPE_VPU.png',
 VIA:'./assets/types/v31/TYPE_VIA.png',VIU:'./assets/types/v31/TYPE_VIU.png',
};
const TYPE_ORDER=['FPA','FPU','FIA','FIU','VPA','VPU','VIA','VIU'] as const;
const ART={
 clear:'./assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png',
 guide:'./assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png',
 quest:'./assets/battle1/MUDAGIRI_BATTLE_SWING.png',
 save:'./assets/prebattle/MUDAGIRI_PROFILE_Q5.png',
 friend:'./assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png',
} as const;
const STATUS_META:any={
 cut:{mark:'⚔️',label:'斬る'},
 optimize:{mark:'✨',label:'整える'},
 protect:{mark:'🛡️',label:'守る'},
 inspect:{mark:'🔍',label:'見極める'},
 ok:{mark:'○',label:'今はそのままでOK'},
 na:{mark:'⚪',label:'対象外'},
};
const GOALS=[
 ['home','🏠','住まい'],['family','👨‍👩‍👧','家族・教育'],['travel','✈️','旅行・趣味'],['invest','📈','資産形成'],
 ['challenge','🚀','独立・挑戦'],['safety','☂️','もしもの備え'],['retirement','🌱','老後'],['undecided','…','まだ決めていない'],
] as const;

function roundHero(n:number){
 if(n<5000)return Math.round(n/100)*100;
 if(n<50000)return Math.round(n/500)*500;
 return Math.round(n/1000)*1000;
}
function approx(n:number){
 const a=Math.abs(n);
 if(a>=10000){
  const v=Math.round(a/1000)/10;
  return '約'+(Number.isInteger(v)?v.toFixed(0):v.toFixed(1))+'万円';
 }
 return '約'+yen(roundHero(a))+'円';
}
function rangeText(lo:number,hi:number){
 if(lo>0&&Math.round(lo)!==Math.round(hi))return approx(lo).replace('約','')+'〜'+approx(hi);
 return approx(hi);
}
function monthlyText(lo:number,hi:number){
 const l=roundHero(lo),u=roundHero(hi);
 if(l>0&&u>l)return '月 約'+yen(l)+'〜'+yen(u)+'円';
 if(l>0)return '月 約'+yen(l)+'円';
 if(u>0)return '最大 月約'+yen(u)+'円';
 return '';
}
function handoffCode(id:string){
 const clean=String(id||'').replace(/[^a-zA-Z0-9]/g,'').toUpperCase();
 return 'MG-'+(clean.slice(-12)||'UNKNOWN');
}
function toneLine(mode:string){
 if(mode==='gentle')return '好きなものまで削らなくて大丈夫。整えられるところだけ見よう。';
 if(mode==='hell')return '大事な支出まで斬るほど雑じゃない。狙うのは惰性とムダだけだ。';
 return '高いから斬るんじゃない。大事なものを守って、整えられるところだけだ。';
}
function TypeAxis({label,value,positive,positiveText,negativeText,middle}:{label:string;value:number;positive:boolean;positiveText:string;negativeText:string;middle?:boolean}){
 const pct=middle?50:positive?50+Math.min(50,value/2):50-Math.min(50,value/2);
 return <div className="v5-axis"><div><span>{label}</span><b>{middle?'バランス型':positive?positiveText:negativeText}</b></div><div className="v5-axis-track"><i style={{left:pct+'%'}}/></div></div>;
}
function loadImg(src:string){return new Promise<HTMLImageElement|null>(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src})}
async function makeTypeShareFile(vm:any){
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');if(!x)return null;
 x.fillStyle='#0b1724';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#b6a8ff';x.lineWidth=8;x.strokeRect(44,44,992,1262);
 x.textAlign='center';x.fillStyle='#f4d76b';x.font='900 34px system-ui';x.fillText('ムダギリ診断',540,110);
 const img=await loadImg(TYPE_ART[vm.type.code]||'');if(img){const sc=Math.min(390/img.naturalWidth,390/img.naturalHeight);x.imageSmoothingEnabled=false;x.drawImage(img,540-img.naturalWidth*sc/2,180,img.naturalWidth*sc,img.naturalHeight*sc)}
 x.fillStyle='#fff';x.font='900 62px system-ui';x.fillText(vm.type.name,540,650);
 x.fillStyle='#f4d76b';x.font='800 30px system-ui';x.fillText(vm.type.catchphrase??'',540,710);
 x.fillStyle='#dce5ed';x.font='800 26px system-ui';x.fillText('友達は何タイプ？',540,1100);
 x.fillStyle='#b6a8ff';x.font='900 28px system-ui';x.fillText('#ムダギリ診断',540,1160);
 x.fillStyle='#8e9cab';x.font='700 18px system-ui';x.fillText('収入・支出金額・地域は画像に含まれません',540,1260);
 const blob=await new Promise<Blob|null>(r=>c.toBlob(r,'image/png'));return blob?new File([blob],`mudagiri-${vm.type.code}.png`,{type:'image/png'}):null;
}

export default function ResultScreenV5({vm,onLine,onEvent,onRestart,onBeforeExternal}:{vm:any;onLine?:(x:any)=>void;onEvent?:(n:string,p?:any)=>void;onRestart?:()=>void;onBeforeExternal?:()=>void}){
 const [goal,setGoal]=useState<string|null>(null);
 const [open,setOpen]=useState<string|null>(null);
 const [linePrompt,setLinePrompt]=useState<null|'after_next_quest'|'consult_route'>(null);
 const [precisionOpen,setPrecisionOpen]=useState(false);
 const [precisionText,setPrecisionText]=useState('');
 const [precisionApplied,setPrecisionApplied]=useState<number|null>(null);
 const shareFile=useRef<File|null>(null);
 const goalMeta=GOALS.find(x=>x[0]===goal)??null;
 const precisionMax=vm.precisionTarget?.cUpper??0;
 const precisionCandidate=Number(precisionText||0);
 const precisionValid=precisionOpen&&precisionText!==''&&Number.isFinite(precisionCandidate)&&precisionCandidate>=0&&precisionCandidate<=precisionMax;
 const adjusted=useMemo(()=>{
  if(precisionApplied===null||!vm.precisionTarget)return {lower:vm.potential.lower,upper:vm.potential.upper};
  const lower=vm.potential.lower+precisionApplied;
  const upper=Math.max(lower,vm.potential.upper-vm.precisionTarget.cUpper+precisionApplied);
  return {lower,upper};
 },[vm,precisionApplied]);

 useEffect(()=>{onEvent?.('result_viewed',{version:vm.version,typeCode:vm.type.code});makeTypeShareFile(vm).then(f=>{shareFile.current=f})},[]);
 async function share(platform:string){
  const url=new URL(window.location.origin+window.location.pathname);url.searchParams.set('ref','share');url.searchParams.set('type',vm.type.code);url.searchParams.set('src',platform);
  const text=`${vm.type.shareHook??vm.type.catchphrase??''}\n\nムダギリ診断 →「${vm.type.name}」\nあなたは何タイプ？\n${url.toString()}\n#ムダギリ診断`;
  onEvent?.('share_clicked',{typeCode:vm.type.code,platform});onBeforeExternal?.();
  if(platform==='x'){window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');return}
  if(platform==='line'){window.location.href='https://line.me/R/share?text='+encodeURIComponent(text);return}
  try{
   const f=shareFile.current;
   if(f&&navigator.share&&navigator.canShare?.({files:[f]})){await navigator.share({title:'ムダギリ診断',text,files:[f]});return}
   if(navigator.share){await navigator.share({title:'ムダギリ診断',text});return}
   await navigator.clipboard?.writeText(text);
  }catch{}
 }
 function openLine(place:'after_next_quest'|'consult_route'){onEvent?.('line_clicked',{placement:place,typeCode:vm.type.code,firstQuest:vm.firstQuest?.category??null});setLinePrompt(place)}
 async function confirmLine(){
  if(!linePrompt)return;const code=handoffCode(vm.diagnosisId);try{await navigator.clipboard?.writeText('ムダギリ診断 引き継ぎコード：'+code)}catch{}
  onBeforeExternal?.();onLine?.({diagnosisId:vm.diagnosisId,firstQuest:vm.firstQuest?.category??null,placement:linePrompt,handoffCode:code,goal:goal??null,consultPrimary:'lifeplan',consultSelectedTopic:'lifeplan',insuranceReview:!!vm.consultRoute?.insuranceReview});
 }
 const activeRows=vm.rows.filter((x:any)=>x.v5Status!=='ok'&&x.v5Status!=='na');
 const positionRows=vm.positionRows.filter((x:any)=>x.known);
 const topRows=activeRows.slice(0,6);
 const future5=adjusted.upper*60;
 return <>
 <style>{CSS}</style>
 {linePrompt&&<div className="v5-modal-bg"><section className="v5-modal" role="dialog" aria-modal="true"><div className="v5-kicker">LINE SAVE</div><h2>診断結果をLINEに保存</h2><p>今回の診断と照合するコードをコピーしてLINEを開きます。</p><strong className="v5-code">{handoffCode(vm.diagnosisId)}</strong><small>コード自体に収入・支出額は含まれません。</small><button className="v5-primary" onClick={confirmLine}>コードをコピーしてLINEを開く ▶</button><button className="v5-link" onClick={()=>setLinePrompt(null)}>あとで</button></section></div>}
 <main className="v5"><div className="v5-inner">
  <section className="v5-clear">
   <img src={ART.clear} alt="" aria-hidden="true"/>
   <div><div className="v5-kicker">MUDAGIRI QUEST CLEAR!</div><h1>家計クエスト、クリア！</h1><p>12カテゴリと、お金の使い方のクセを解析しました。</p></div>
   <div className="v5-talk">ムダギリくん「おつかれ。ここから戦果を見ていくぞ。」</div>
  </section>

  <section className="v5-card v5-type">
   <div className="v5-kicker">MONEY TYPE UNLOCKED</div>
   <img className="v5-type-art" src={TYPE_ART[vm.type.code]} alt="" aria-hidden="true"/>
   <small>あなたのお金の使い方は――</small><h2>{vm.type.name}</h2><h3>{vm.type.catchphrase}</h3><p>{vm.type.description}</p>
   <div className="v5-axes">
    <TypeAxis label="時間軸" value={vm.type.axisStrength.fv} positive={(vm.type.axes.fv??0)>=0} positiveText="未来寄り" negativeText="今寄り" middle={vm.type.nearMiddle?.fv}/>
    <TypeAxis label="決め方" value={vm.type.axisStrength.pi} positive={(vm.type.axes.pi??0)>=0} positiveText="計画寄り" negativeText="直感寄り" middle={vm.type.nearMiddle?.pi}/>
    <TypeAxis label="把握" value={vm.type.axisStrength.au} positive={(vm.type.axes.au??0)>=0} positiveText="普段から把握" negativeText="必要時に確認" middle={vm.type.nearMiddle?.au}/>
   </div>
   <div className="v5-type-notes"><div><small>強み</small><b>{vm.type.strengthLabel}</b></div><div><small>死角</small><b>{vm.type.blindSpot}</b></div></div>
   <button className="v5-small-share" onClick={()=>share('type_top')}>↗ タイプだけシェア</button>
  </section>

  <section className="v5-card v5-position">
   <div className="v5-head"><div><div className="v5-kicker">HOUSEHOLD POSITION</div><h2>あなたの家計、普通と比べてどう？</h2></div><img src={ART.guide} alt="" aria-hidden="true"/></div>
   <p>あなたの条件に合わせて、比較できる項目だけを見ています。</p>
   <div className="v5-position-list">
    {positionRows.map((x:any)=><div className="v5-position-row" key={x.category}>
     <div><b>{x.label}</b><small>{x.comparisonContext?.criteria?.join(' × ')||x.evidenceLabel}</small></div>
     <div className="v5-position-value">{x.comparisonDifference!==null?<strong>{signedYen(x.comparisonDifference)}<em>/月</em></strong>:<strong>料金帯比較</strong>}<span className={"is-"+String(x.positionLabel).replace(/[^ぁ-んァ-ヶ一-龠]/g,'')}>{x.positionLabel??'比較条件を確認'}</span></div>
    </div>)}
   </div>
   <div className="v5-note"><b>この差額＝ムダ額ではありません。</b><span>あなたに近い条件の比較目安との差です。</span></div>
  </section>

  <section className="v5-card v5-verdict">
   <div className="v5-kicker">MUDAGIRI VERDICT</div><h2>高いから斬るんじゃない。</h2>
   <div className="v5-talk">{toneLine(vm.toneMode)}</div>
   <div className="v5-counts"><div><b>⚔️ {vm.v5Counts.cut}</b><span>斬る</span></div><div><b>✨ {vm.v5Counts.optimize}</b><span>整える</span></div><div><b>🛡️ {vm.v5Counts.protect}</b><span>守る</span></div><div><b>🔍 {vm.v5Counts.inspect}</b><span>見極める</span></div></div>
   {topRows.length>0&&<div className="v5-verdict-list">{topRows.map((x:any)=><div key={x.category} className={"v5-verdict-row is-"+x.v5Status}><span>{STATUS_META[x.v5Status].mark}</span><div><b>{x.label}</b><small>{x.positionLabel?x.positionLabel+' / ':''}{x.appraisalSummary??x.reason}</small></div><strong>{STATUS_META[x.v5Status].label}</strong></div>)}</div>}
  </section>

  <section className="v5-card v5-future">
   <div className="v5-kicker">FUTURE MONEY</div><h2>未来に回せる可能性</h2>
   {adjusted.upper>0?<><strong className="v5-money">{monthlyText(adjusted.lower,adjusted.upper)}</strong><p>大切なものは残しながら、家計を整えることで生まれる可能性です。</p>
   <details className="v5-evidence"><summary>この数字の内訳を見る⌄</summary><div><span>確認できている金額</span><b>¥{yen(vm.potential.confirmedA)}/月</b></div><div><span>比較から見える追加余地</span><b>最大 ¥{yen(vm.potential.cUpper)}/月</b></div>{precisionApplied!==null&&<div><span>精度UPで本人確認した金額</span><b>¥{yen(precisionApplied)}/月</b></div>}<small>比較差額をそのまま足しているわけではありません。</small></details></>:vm.potential.reviewCount>0?<><strong className="v5-money is-text">見直しポイント {vm.potential.reviewCount}件</strong><p>金額はまだ責任をもって確定できません。中身を確認すると見えてきます。</p></>:<><strong className="v5-money is-text">今は大きく整えるところなし</strong><p>現在の回答では、強い見直しシグナルはありません。</p></>}
  </section>

  {adjusted.upper>0&&<section className="v5-card v5-impact">
   <div className="v5-kicker">FUTURE IMPACT</div><h2>積み重なると、これくらい。</h2>
   <div className="v5-impact-grid"><div><span>1年</span><b>{rangeText(adjusted.lower*12,adjusted.upper*12)}</b></div><div><span>5年</span><b>{rangeText(adjusted.lower*60,adjusted.upper*60)}</b></div><div className="is-10"><span>10年</span><b>{rangeText(adjusted.lower*120,adjusted.upper*120)}</b></div></div>
   <small>※今と同じ状態が続いた場合の単純累計です。運用益は含みません。</small>
  </section>}

  <section className="v5-card v5-goal">
   <div className="v5-kicker">GOAL QUEST</div><h2>このお金、何に回せたらうれしい？</h2>
   <div className="v5-goals">{GOALS.map(g=><button key={g[0]} className={goal===g[0]?'is-active':''} onClick={()=>{setGoal(g[0]);onEvent?.('goal_selected',{goal:g[0]})}}><span>{g[1]}</span><b>{g[2]}</b></button>)}</div>
   {goalMeta&&adjusted.upper>0&&<div className="v5-goal-result"><small>{goalMeta[1]} {goalMeta[2]}</small><b>5年で最大 {approx(future5)}</b><p>「削るため」じゃなく、やりたいことへ回すために整える。</p></div>}
  </section>

  <section className="v5-card v5-next">
   <div className="v5-head"><div><div className="v5-kicker">NEXT QUEST</div><h2>まずやることは、1つだけ。</h2></div><img src={ART.quest} alt="" aria-hidden="true"/></div>
   {vm.firstQuest?<><div className="v5-next-target"><span>{STATUS_META[vm.firstQuest.v5Status].mark}</span><div><small>{vm.firstQuest.label}</small><b>{vm.firstQuest.nextAction}</b></div></div>{vm.firstQuest.aAmount>0&&<p><strong>月¥{yen(vm.firstQuest.aAmount)}</strong> → 年¥{yen(vm.firstQuest.aAmount*12)}</p>}<div className="v5-talk">ムダギリくん「全部いじる必要はない。まずこいつだけだ。」</div></>:<p>現在の回答では、強く優先する見直し項目はありません。今の状態を維持しよう。</p>}
  </section>

  {vm.precisionTarget&&<section className="v5-card v5-precision">
   <div className="v5-kicker">PRECISION UP QUEST</div><h2>あと1問で、もう少しあなた向けに絞れるぞ。</h2>
   <p><b>{vm.precisionTarget.label}</b>で、無理なく減らせそうな月額は？</p>
   {!precisionOpen?<button className="v5-secondary" onClick={()=>setPrecisionOpen(true)}>1問だけ答える ▶</button>:<div className="v5-precision-input"><label><input inputMode="numeric" value={precisionText} onChange={e=>setPrecisionText(e.target.value.replace(/[^0-9]/g,''))}/><b>円/月</b></label><small>最大 ¥{yen(precisionMax)} まで。0円でもOK。</small>{precisionText!==''&&!precisionValid&&<small className="is-error">0〜¥{yen(precisionMax)}の範囲で入力してください。</small>}<button className="v5-secondary" disabled={!precisionValid} onClick={()=>{setPrecisionApplied(precisionCandidate);onEvent?.('precision_answered',{category:vm.precisionTarget.category})}}>この金額で反映する</button></div>}
   {precisionApplied!==null&&<div className="v5-precision-done">✓ あなたの回答を反映しました。上の「未来に回せる可能性」を更新しています。</div>}
  </section>}

  <section className="v5-card v5-save">
   <div className="v5-head"><div><div className="v5-kicker">SAVE QUEST</div><h2>この結果、あとで見返せるようにする？</h2></div><img src={ART.save} alt="" aria-hidden="true"/></div>
   <p>タイプ・家計ポジション・選んだGoal・NEXT QUESTをLINEへ引き継げます。</p>
   <button className="v5-primary" onClick={()=>openLine('after_next_quest')}>診断結果をLINEに保存する ▶</button><small>✓ 無料　✓ あとで見返せる　✓ 登録しただけで相談予約にはなりません</small>
  </section>

  <section className="v5-card v5-life">
   <div className="v5-kicker">LIFE PLAN QUEST</div><h2>今の家計で、やりたい未来に届く？</h2>
   <p>今回分かったのは「今のお金の使い方」。貯蓄・保険・住宅・教育・投資・将来収入までつなげると、<b>何を削るかではなく、何にいくら使えるか</b>が見えてきます。</p>
   {goalMeta&&goalMeta[0]!=='undecided'&&<div className="v5-life-goal">今回選んだ未来：<b>{goalMeta[1]} {goalMeta[2]}</b></div>}
   {vm.consultRoute?.insuranceReview&&<div className="v5-life-signal">🛡 保険は保障内容まで確認すると、必要な支出か整えられる支出かを判断できます。</div>}
   <button className="v5-primary is-life" onClick={()=>openLine('consult_route')}>未来のお金を整理してみる ▶</button>
  </section>

  <details className="v5-card v5-codex"><summary><div><div className="v5-kicker">12 CATEGORY CODEX</div><h2>12カテゴリの鑑定結果を詳しく見る</h2></div><span>⌄</span></summary>
   <div className="v5-codex-list">{vm.rows.map((x:any)=><div className="v5-codex-row" key={x.category}><button onClick={()=>setOpen(open===x.category?null:x.category)}><span>{STATUS_META[x.v5Status].mark} <b>{x.label}</b></span><span>{x.v5StatusLabel}　⌄</span></button>{open===x.category&&<div className="v5-detail"><p><b>あなた：</b>{x.known?'¥'+yen(x.amount)+'/月':'未把握'}</p>{x.comparable!==null&&<p><b>比較目安：</b>¥{yen(x.comparable)}/月</p>}{x.comparisonDifference!==null&&<p><b>比較差額：</b>{signedYen(x.comparisonDifference)}/月 <small>※ムダ額ではありません</small></p>}{x.v5ReferenceSecondary?.map((r:any)=><p key={r.sourceVersion}><b>{r.label}：</b>¥{yen(r.monthly)}/月 <small>※別の比較レンズ。主比較とは合成しません</small></p>)}{x.positionLabel&&<p><b>家計ポジション：</b>{x.positionLabel}</p>}{x.appraisalSummary&&<p><b>あなたの回答：</b>{x.appraisalSummary}</p>}<p><b>判定：</b>{STATUS_META[x.v5Status].mark} {x.v5StatusLabel}</p><p><b>理由：</b>{x.reason}</p><p><b>次に確認：</b>{x.nextAction}</p>{x.cUpper>0&&<p><b>Potential算入：</b>最大 ¥{yen(x.cUpper)}/月 <small>※比較差額そのものではありません</small></p>}{x.detailReview&&<p className="is-warn">差が大きいため、内訳確認を推奨します。</p>}</div>}</div>)}</div>
  </details>

  <section className="v5-card v5-friend">
   <div className="v5-head"><div><div className="v5-kicker">FRIEND QUEST</div><h2>友達は何タイプ？</h2></div><img src={ART.friend} alt="" aria-hidden="true"/></div>
   <div className="v5-talk">ムダギリくん「お前の金額は出さない。タイプだけ見せてやれ。」</div>
   <details><summary>8タイプ全部を見る⌄</summary><div className="v5-types">{TYPE_ORDER.map(code=>{const t=(TYPE_CONTENT_V31 as any)[code];return <div className={code===vm.type.code?'is-mine':''} key={code}><img src={TYPE_ART[code]} alt=""/><small>{code===vm.type.code?'あなた':'TYPE '+code}</small><b>{t.name}</b></div>})}</div></details>
   <div className="v5-share-grid"><button onClick={()=>share('x')}>𝕏</button><button onClick={()=>share('instagram')}>Instagram</button><button onClick={()=>share('threads')}>Threads</button><button onClick={()=>share('line')}>LINE</button></div>
   <small>収入・支出金額・都道府県・Potentialは共有されません。</small>
  </section>

  <button className="v5-restart" onClick={onRestart}>診断をやり直す</button>
 </div></main></>;
}

const CSS=`
*{box-sizing:border-box}.v5{min-height:100dvh;padding:0 0 calc(42px + env(safe-area-inset-bottom));background:linear-gradient(180deg,#102333 0%,#0b1925 48%,#07111a 100%);color:#f7f9fb;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.v5-inner{width:min(100%,430px);margin:auto}.v5 section{margin:14px 12px;padding:20px;border-radius:18px}.v5-card{border:1px solid #385064;background:#173047;box-shadow:0 14px 34px rgba(0,0,0,.18)}.v5-kicker{color:#f4d76b;font-size:10px;font-weight:1000;letter-spacing:.12em}.v5 h1,.v5 h2,.v5 h3,.v5 p{margin:0}.v5 h1{margin-top:6px;font-size:30px}.v5 h2{margin-top:6px;font-size:24px;line-height:1.25}.v5 h3{margin-top:7px;font-size:15px;line-height:1.5}.v5 p{margin-top:9px;color:#d5dee6;line-height:1.7;font-size:13px}.v5 small{display:block;color:#aebdca;line-height:1.55}.v5-clear{position:relative;margin:0!important;padding:32px 20px 22px!important;border-radius:0!important;background:linear-gradient(150deg,#19364c,#0f2231)}.v5-clear>img{position:absolute;right:14px;top:16px;width:82px;height:82px;object-fit:contain}.v5-clear>div:first-of-type{padding-right:72px}.v5-talk{margin-top:13px;padding:10px 12px;border:1px solid rgba(244,215,107,.32);border-radius:11px;background:rgba(7,17,26,.42);font-size:12px;font-weight:800;line-height:1.6}.v5-type{text-align:center;background:linear-gradient(160deg,#28305d,#182743 54%,#122238);border-color:#776bc2}.v5-type-art{width:160px;height:160px;object-fit:contain;image-rendering:pixelated}.v5-type h2{color:#f4df82;font-size:34px}.v5-type h3{color:#fff}.v5-axes{margin-top:14px;padding:12px;border-radius:12px;background:#101f32}.v5-axis+ .v5-axis{margin-top:10px}.v5-axis>div:first-child{display:flex;justify-content:space-between;font-size:10px}.v5-axis-track{position:relative;height:5px;margin-top:6px;border-radius:999px;background:#334760}.v5-axis-track i{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:#b6a8ff;transform:translate(-50%,-50%)}.v5-type-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.v5-type-notes>div{padding:10px;border:1px solid #425878;border-radius:10px;background:#112337;text-align:left}.v5-type-notes b,.v5-type-notes small{display:block}.v5-small-share{min-height:48px;margin-top:14px;padding:0 18px;border:1px solid #8f83d8;border-radius:12px;background:#252a52;color:#fff;font-weight:900}.v5-head{display:flex;justify-content:space-between;gap:12px}.v5-head>div{min-width:0}.v5-head>img{width:72px;height:72px;object-fit:contain}.v5-position{background:linear-gradient(160deg,#17435a,#153247);border-color:#459bc0}.v5-position-list{margin-top:14px}.v5-position-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-top:1px solid rgba(255,255,255,.10)}.v5-position-row:first-child{border-top:0}.v5-position-row>div:first-child{min-width:0}.v5-position-row b,.v5-position-row small{display:block}.v5-position-value{text-align:right;flex:0 0 auto}.v5-position-value strong{display:block;color:#ffe082;font-size:16px}.v5-position-value strong em{font-size:9px;font-style:normal;color:#b9c6cf}.v5-position-value span{display:inline-block;margin-top:4px;padding:3px 7px;border-radius:999px;background:#102335;color:#d8e5ee;font-size:9px;font-weight:900}.v5-note{margin-top:12px;padding:11px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#0f2738}.v5-note b,.v5-note span{display:block;font-size:11px}.v5-note span{margin-top:3px;color:#b5c5d1}.v5-verdict{background:linear-gradient(160deg,#17413f,#18303b)}.v5-counts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:14px}.v5-counts>div{padding:10px 3px;border:1px solid #3f605f;border-radius:10px;background:#10272e;text-align:center}.v5-counts b,.v5-counts span{display:block}.v5-counts b{font-size:15px}.v5-counts span{margin-top:3px;font-size:9px;color:#bbc9ce}.v5-verdict-list{margin-top:12px}.v5-verdict-row{display:flex;align-items:center;gap:9px;padding:11px 0;border-top:1px solid rgba(255,255,255,.10)}.v5-verdict-row>span{font-size:20px}.v5-verdict-row>div{flex:1;min-width:0}.v5-verdict-row b,.v5-verdict-row small{display:block}.v5-verdict-row>strong{font-size:11px}.v5-future{background:linear-gradient(155deg,#f5e6a6,#f3c85e);border:0;color:#18202a;text-align:center}.v5-future .v5-kicker{color:#775d04}.v5-future h2{color:#18202a}.v5-future p,.v5-future small{color:#4e4a35}.v5-money{display:block;margin-top:13px;font-size:clamp(32px,9vw,42px);line-height:1.15;letter-spacing:-.03em}.v5-money.is-text{font-size:27px}.v5-evidence{margin-top:16px;border:1px solid rgba(32,32,20,.18);border-radius:11px;background:rgba(255,255,255,.40);text-align:left}.v5-evidence summary{min-height:48px;padding:14px;font-weight:900;cursor:pointer}.v5-evidence>div{display:flex;justify-content:space-between;padding:9px 14px;border-top:1px solid rgba(20,20,10,.10);font-size:12px}.v5-evidence>small{padding:10px 14px}.v5-impact{background:#f2f5f7;color:#13202a}.v5-impact .v5-kicker{color:#8b6b06}.v5-impact h2{color:#13202a}.v5-impact small{color:#66727a}.v5-impact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.v5-impact-grid>div{padding:13px 5px;border:1px solid #cad4dc;border-radius:11px;background:#fff;text-align:center}.v5-impact-grid span,.v5-impact-grid b{display:block}.v5-impact-grid span{font-size:10px;color:#65737c}.v5-impact-grid b{margin-top:6px;font-size:17px}.v5-impact-grid .is-10{border-color:#d5a91c;background:#fff7cf}.v5-impact-grid .is-10 b{font-size:24px;color:#745802}.v5-goal{background:linear-gradient(160deg,#25365c,#18304c);border-color:#687bc1}.v5-goals{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px}.v5-goals button{min-height:62px;padding:8px;border:1px solid #516680;border-radius:12px;background:#10243a;color:#eaf0f4;text-align:left}.v5-goals button span{font-size:20px}.v5-goals button b{display:block;margin-top:2px;font-size:11px}.v5-goals button.is-active{border-color:#f4d76b;background:#31405a;box-shadow:0 0 0 2px rgba(244,215,107,.10)}.v5-goal-result{margin-top:13px;padding:13px;border:1px solid #6e82a0;border-radius:12px;background:#10243a}.v5-goal-result b{display:block;margin-top:5px;color:#f4d76b;font-size:22px}.v5-next{background:linear-gradient(160deg,#3c3420,#243020);border-color:#c49d25}.v5-next-target{display:flex;align-items:center;gap:10px;margin-top:14px;padding:13px;border:1px solid #8c7838;border-radius:12px;background:#20291e}.v5-next-target>span{font-size:26px}.v5-next-target small,.v5-next-target b{display:block}.v5-next-target b{margin-top:3px;font-size:16px}.v5-precision{background:#1e3040}.v5-secondary,.v5-primary{width:100%;min-height:52px;margin-top:14px;border:0;border-radius:12px;font-weight:1000;touch-action:manipulation}.v5-secondary{background:#e8edf1;color:#14202a}.v5-secondary:disabled{opacity:.45}.v5-precision-input label{display:flex;align-items:center;margin-top:12px;padding:0 12px;border:1px solid #52687a;border-radius:11px;background:#0d1d2a}.v5-precision-input input{flex:1;min-width:0;height:52px;border:0;outline:0;background:transparent;color:#fff;font-size:22px;font-weight:900}.v5-precision-input label b{font-size:12px}.v5-precision-input .is-error{color:#ffad99}.v5-precision-done{margin-top:10px;color:#8ee1bf;font-size:11px}.v5-save{background:linear-gradient(160deg,#183e2b,#163126);border-color:#4dbf79}.v5-primary{background:#4fd778;color:#082013;box-shadow:0 6px 0 #258744}.v5-primary.is-life{background:#79d5c0;box-shadow:0 6px 0 #348b7b}.v5-life{background:linear-gradient(160deg,#174451,#183a45);border-color:#5bb5a7}.v5-life-goal,.v5-life-signal{margin-top:12px;padding:11px;border:1px solid #4d746f;border-radius:10px;background:#102b32;font-size:12px}.v5-codex{padding:0!important;overflow:hidden}.v5-codex>summary{display:flex;justify-content:space-between;align-items:center;min-height:76px;padding:16px 18px;cursor:pointer}.v5-codex>summary h2{font-size:18px}.v5-codex-list{border-top:1px solid #3a5264}.v5-codex-row>button{display:flex;justify-content:space-between;width:100%;min-height:52px;padding:0 15px;border:0;border-top:1px solid rgba(255,255,255,.08);background:#132b3e;color:#fff;text-align:left}.v5-codex-row>button span{align-self:center}.v5-detail{padding:12px 15px 15px;background:#0f2231}.v5-detail p{font-size:11px}.v5-detail .is-warn{color:#ffcc7c}.v5-friend{background:linear-gradient(160deg,#292853,#1c2745);border-color:#7169b8}.v5-friend details{margin-top:12px}.v5-friend summary{min-height:48px;padding:13px;border:1px solid #5b608e;border-radius:10px;background:#171f38;font-weight:900}.v5-types{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:9px}.v5-types>div{padding:8px;border:1px solid #454e72;border-radius:10px;background:#141d34;text-align:center}.v5-types>div.is-mine{border-color:#f4d76b}.v5-types img{width:74px;height:74px;object-fit:contain}.v5-types small,.v5-types b{display:block}.v5-share-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:14px}.v5-share-grid button{min-height:48px;border:1px solid #5e6791;border-radius:10px;background:#172039;color:#fff;font-size:10px;font-weight:900}.v5-restart{display:block;min-height:48px;margin:24px auto 0;padding:10px 14px;border:0;background:transparent;color:#aab9c6;text-decoration:underline}.v5-link{display:block;min-height:48px;margin:12px auto 0;padding:10px 14px;border:0;background:transparent;color:#8c99a3;text-decoration:underline}.v5-modal-bg{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(2,7,12,.82)}.v5-modal{width:min(100%,390px);padding:22px;border:1px solid #52677a;border-radius:17px;background:#132638;color:#fff}.v5-code{display:block;margin-top:12px;padding:12px;border:1px dashed #71869a;border-radius:10px;background:#0b1925;text-align:center;font-size:22px;letter-spacing:.08em}@media(max-width:380px){.v5 section{margin-left:8px;margin-right:8px}.v5 h2{font-size:22px}.v5-counts{gap:4px}.v5-counts b{font-size:13px}.v5-impact-grid b{font-size:14px}.v5-impact-grid .is-10 b{font-size:20px}.v5-type h2{font-size:30px}}
`;
