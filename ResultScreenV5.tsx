import React,{useEffect,useMemo,useRef,useState} from 'react';
import {TYPE_CONTENT_V31} from './type-content-v3.1';
import {ENEMY_ASSETS} from './enemy-assets-v1';

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
 cut:{mark:'⚔️',label:'斬る',help:'今すぐ止めやすい'},
 optimize:{mark:'✨',label:'整える',help:'価値は残して見直せそう'},
 protect:{mark:'🛡️',label:'守る',help:'大事なので今は維持'},
 inspect:{mark:'🔍',label:'見極める',help:'まず中身の確認が必要'},
 ok:{mark:'○',label:'今はそのままでOK',help:'今は触らなくてOK'},
 na:{mark:'⚪',label:'対象外',help:'比較対象外'},
};
const GOALS=[
 ['home','住まい'],['family','家族・教育'],['travel','旅行・趣味'],['invest','資産形成'],
 ['challenge','独立・挑戦'],['safety','もしもの備え'],['retirement','老後'],['undecided','まだ決めていない'],
] as const;

function roundHero(n:number){
 if(n<5000)return Math.round(n/100)*100;
 if(n<50000)return Math.round(n/500)*500;
 return Math.round(n/1000)*1000;
}
function approx(n:number){
 const a=Math.abs(n);
 if(a>=100000)return '約'+yen(Math.round(a/10000))+'万円';
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
 const [selectedTypeCode,setSelectedTypeCode]=useState<string|null>(null);
 const [atlasOpen,setAtlasOpen]=useState(false);
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
 const positionRows=vm.positionRows.filter((x:any)=>x.known&&Number(x.amount)>0);
 const positionRank=(label:string|null)=>label==='かなり高め'?5:label==='やや高め'?4:label==='標準圏'?3:label==='やや低め'?2:label==='かなり低め'?1:0;
 const atlasRows=[...positionRows].map((x:any,i:number)=>({...x,_displayIndex:i})).sort((a:any,b:any)=>{
  const action=(x:any)=>x.v5Status==='cut'||x.v5Status==='optimize'||x.v5Status==='inspect'?1:0;
  const byPosition=positionRank(b.positionLabel)-positionRank(a.positionLabel);if(byPosition)return byPosition;
  const byAction=action(b)-action(a);if(byAction)return byAction;
  const byGap=Math.max(0,b.comparisonDifference??0)-Math.max(0,a.comparisonDifference??0);if(byGap)return byGap;
  return a._displayIndex-b._displayIndex;
 });
 const atlasTop=atlasRows.slice(0,3),atlasRest=atlasRows.slice(3);
 const statusRows=(status:string)=>vm.rows.filter((x:any)=>x.v5Status===status&&x.known&&Number(x.amount)>0);
 const openEnemyDetail=(category:string)=>{
  setAtlasOpen(true);setOpen(category);
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('enemy-'+category)?.scrollIntoView({behavior:'smooth',block:'center'})));
 };
 const future5=adjusted.upper*60;
 const enemyDetail=(x:any)=> <div className="v5-detail v51-atlas-detail">
  <p><b>あなた：</b>{x.known?'¥'+yen(x.amount)+'/月':'未把握'}</p>
  {x.comparable!==null&&<p><b>比較目安：</b>¥{yen(x.comparable)}/月</p>}
  {x.comparisonDifference!==null&&<p><b>比較差額：</b>{signedYen(x.comparisonDifference)}/月 <small>※ムダ額ではありません</small></p>}
  {x.v5ReferenceSecondary?.map((r:any)=><p key={r.sourceVersion}><b>{r.label}：</b>¥{yen(r.monthly)}/月 <small>※別の比較レンズ。主比較とは合成しません</small></p>)}
  {x.positionLabel&&<p><b>家計ポジション：</b>{x.positionLabel}</p>}
  {x.appraisalSummary&&<p><b>あなたの回答：</b>{x.appraisalSummary}</p>}
  <p><b>判定：</b>{STATUS_META[x.v5Status].mark} {x.v5StatusLabel}</p>
  <p><b>理由：</b>{x.reason}</p>
  <p><b>次に確認：</b>{x.nextAction}</p>
  {x.cUpper>0&&<p><b>この支出の見直し余地：</b>最大 ¥{yen(x.cUpper)}/月 <small>※比較差額をそのまま削れるという意味ではありません</small></p>}
  {x.detailReview&&<p className="is-warn">差が大きいため、内訳確認を推奨します。</p>}
 </div>;
 return <>
 <style>{CSS}</style>
 {linePrompt&&<div className="v5-modal-bg"><section className="v5-modal" role="dialog" aria-modal="true"><div className="v5-kicker">LINE SAVE</div><h2>診断結果をLINEに保存</h2><p>今回の診断と照合するコードをコピーしてLINEを開きます。</p><strong className="v5-code">{handoffCode(vm.diagnosisId)}</strong><small>コード自体に収入・支出額は含まれません。</small><button className="v5-primary" onClick={confirmLine}>コードをコピーしてLINEを開く ▶</button><button className="v5-link" onClick={()=>setLinePrompt(null)}>あとで</button></section></div>}
 {selectedTypeCode&&(()=>{const t=(TYPE_CONTENT_V31 as any)[selectedTypeCode];return <div className="v5-modal-bg" onClick={()=>setSelectedTypeCode(null)}><section className="v5-modal v51-type-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><button className="v51-modal-close" onClick={()=>setSelectedTypeCode(null)} aria-label="閉じる">×</button><img src={TYPE_ART[selectedTypeCode]} alt="" aria-hidden="true"/><small>{selectedTypeCode===vm.type.code?'YOUR TYPE':'8タイプ図鑑'}</small><h2>{t.name}</h2><strong>{t.catchphrase}</strong><p>{t.summary}</p><div className="v51-modal-notes"><div><span>強み</span><b>{t.strength}</b></div><div><span>死角</span><b>{t.blindSpot}</b></div></div></section></div>})()}
 <main className="v5"><div className="v5-inner">
  <section className="v5-clear v51-clear" data-section="QUEST COMPLETE">
   <div className="v51-clear-fx" aria-hidden="true"/>
   <div className="v51-clear-copy">
    <div className="v51-eyebrow">QUEST COMPLETE!</div>
    <h1>家計クエスト<br/><strong>完全クリア！</strong></h1>
    <p>12体の鑑定が終わった。</p>
   </div>
   <img className="v51-clear-mudagiri" src={ART.clear} alt="" aria-hidden="true"/>
   <div className="v51-clear-talk">ムダギリくん「おつかれ！ここから戦果を確認するぞ。」</div>
   <div className="v51-scroll-cue">戦果を見る <span>↓</span></div>
  </section>

  <section className="v5-card v5-type v51-type" data-section="MONEY TYPE UNLOCKED">
   <div className="v51-type-spark s1" aria-hidden="true">✦</div><div className="v51-type-spark s2" aria-hidden="true">✧</div><div className="v51-type-spark s3" aria-hidden="true">✦</div>
   <div className="v51-type-ribbon">称号を獲得！</div>
   <div className="v5-kicker v51-deco-kicker">TYPE UNLOCKED</div>
   <div className="v51-type-art-frame"><img className="v5-type-art" src={TYPE_ART[vm.type.code]} alt="" aria-hidden="true"/></div>
   <h2>{vm.type.name}</h2>
   <h3>{vm.type.catchphrase}</h3>
   <div className="v51-axis-badges">
    <span>{vm.type.nearMiddle?.fv?'バランス型':(vm.type.axes.fv??0)>=0?'未来寄り':'今寄り'}</span>
    <span>{vm.type.nearMiddle?.pi?'バランス型':(vm.type.axes.pi??0)>=0?'計画寄り':'直感寄り'}</span>
    <span>{vm.type.nearMiddle?.au?'バランス型':(vm.type.axes.au??0)>=0?'普段から把握':'必要時に確認'}</span>
   </div>
   <p className="v51-type-summary">{vm.type.description}</p>
   <details className="v51-type-detail"><summary>タイプを詳しく見る⌄</summary>
    <div className="v5-axes">
     <TypeAxis label="時間軸" value={vm.type.axisStrength.fv} positive={(vm.type.axes.fv??0)>=0} positiveText="未来寄り" negativeText="今寄り" middle={vm.type.nearMiddle?.fv}/>
     <TypeAxis label="決め方" value={vm.type.axisStrength.pi} positive={(vm.type.axes.pi??0)>=0} positiveText="計画寄り" negativeText="直感寄り" middle={vm.type.nearMiddle?.pi}/>
     <TypeAxis label="把握" value={vm.type.axisStrength.au} positive={(vm.type.axes.au??0)>=0} positiveText="普段から把握" negativeText="必要時に確認" middle={vm.type.nearMiddle?.au}/>
    </div>
    <div className="v5-type-notes"><div><small>強み</small><b>{vm.type.strengthLabel}</b></div><div><small>死角</small><b>{vm.type.blindSpot}</b></div></div>
   </details>
   <button className="v5-small-share" onClick={()=>share('type_top')}>↗ この称号だけシェア</button>
  </section>

  <section className="v51-type-preview" aria-label="8タイプ図鑑">
   <div className="v51-section-label"><span>8タイプ図鑑</span><small>ほかのタイプものぞいてみる</small></div>
   <div className="v51-type-grid">
    {TYPE_ORDER.map(code=>{const t=(TYPE_CONTENT_V31 as any)[code];return <button type="button" className={code===vm.type.code?'is-mine':''} key={code} onClick={()=>setSelectedTypeCode(code)}><span className="v51-type-thumb"><img src={TYPE_ART[code]} alt=""/></span><small>{code===vm.type.code?'YOU':'TYPE'}</small><b>{t.name}</b></button>})}
   </div>
  </section>

  <section className="v5-card v5-position v51-atlas" data-section="HOUSEHOLD POSITION">
   <div className="v51-atlas-head">
    <div><div className="v51-jp-kicker">敵図鑑</div><h2>目立った敵は、<br/>こいつらだ。</h2><p>比較できる支出だけを、現在地として見ています。</p></div>
    <img src={ART.guide} alt="" aria-hidden="true"/>
   </div>
   <div className="v51-enemy-deck">
    {atlasTop.map((x:any)=>{const enemy=(ENEMY_ASSETS as any)[x.category];const level=positionRank(x.positionLabel);const isOpen=open===x.category;return <div key={x.category} id={"enemy-"+x.category} className="v51-atlas-entry">
     <button type="button" className={"v51-enemy-card is-"+x.v5Status+(isOpen?' is-open':'')} onClick={()=>setOpen(isOpen?null:x.category)} aria-expanded={isOpen}>
      <div className="v51-enemy-portrait"><img src={enemy.normal} alt={enemy.name}/><span>{STATUS_META[x.v5Status].mark} {x.v5StatusLabel}</span></div>
      <div className="v51-enemy-copy"><small>{x.label}</small><h3>{enemy.name}</h3><div className="v51-position-badge">{x.positionLabel??'比較条件を確認'}</div>
       <div className="v51-position-gauge" aria-label={"比較ポジション "+(x.positionLabel??'')}><i/><i/><i/><i/><i/><b style={{width:(level*20)+'%'}}/></div>
       <div className="v51-enemy-money"><span>あなた <strong>¥{yen(x.amount)}</strong></span>{x.comparable!==null&&<span>比較目安 <strong>¥{yen(x.comparable)}</strong></span>}</div>
       {x.comparisonDifference!==null&&<div className={"v51-gap "+(x.comparisonDifference>0?'is-plus':'is-minus')}>{signedYen(x.comparisonDifference)}<small>/月</small></div>}
       <small className="v51-enemy-criteria">{x.comparisonContext?.criteria?.join(' × ')||x.evidenceLabel}</small>
       <span className="v51-tap-detail">{isOpen?'詳細を閉じる ↑':'タップで詳細を見る ↓'}</span>
      </div>
     </button>
     {isOpen&&enemyDetail(x)}
    </div>})}
   </div>
   {atlasRest.length>0&&<><button type="button" className="v51-atlas-more" onClick={()=>setAtlasOpen(v=>!v)}>{atlasOpen?'閉じる':'残りの敵も見る（'+atlasRest.length+'体）'} <span>{atlasOpen?'↑':'↓'}</span></button>
    {atlasOpen&&<div className="v51-atlas-rest">{atlasRest.map((x:any)=>{const enemy=(ENEMY_ASSETS as any)[x.category];const isOpen=open===x.category;return <div key={x.category} id={"enemy-"+x.category} className={"v51-atlas-mini-entry is-"+x.v5Status}>
     <button type="button" className="v51-enemy-mini" onClick={()=>setOpen(isOpen?null:x.category)} aria-expanded={isOpen}><img src={enemy.normal} alt=""/><div><b>{enemy.name}</b><small>{x.label} / {x.positionLabel??'比較保留'}</small></div><strong>{STATUS_META[x.v5Status].mark}</strong><span>{isOpen?'↑':'⌄'}</span></button>
     {isOpen&&enemyDetail(x)}
    </div>})}</div>}</>}
   <div className="v5-note v51-atlas-note"><b>この差額＝ムダ額ではありません。</b><span>あなたに近い条件の比較目安との差です。</span></div>
  </section>

  <section className="v5-card v5-verdict v51-verdict" data-section="MUDAGIRI VERDICT">
   <div className="v51-verdict-title"><div><div className="v51-jp-kicker">今回の戦果</div><h2>仕分け完了！</h2></div><img src={ART.quest} alt="" aria-hidden="true"/></div>
   <div className="v51-verdict-talk">ムダギリくん「{toneLine(vm.toneMode)}」</div>
   <div className="v51-battle-groups">
    {[
      ['cut','討伐候補',vm.v5Counts.cut],
      ['optimize','整えられる敵',vm.v5Counts.optimize],
      ['protect','守る支出',vm.v5Counts.protect],
      ['inspect','見極める敵',vm.v5Counts.inspect],
    ].map(([status,label,count]:any)=><div key={status} className={"v51-battle-group is-"+status}>
      <div className="v51-battle-group-head"><span>{STATUS_META[status].mark}</span><b>{label}</b><strong>{count}体</strong></div>
      <div className="v51-status-help">{STATUS_META[status].help}</div>
      <div className="v51-battle-portraits">{statusRows(status).slice(0,6).map((x:any)=>{const enemy=(ENEMY_ASSETS as any)[x.category];return <button type="button" key={x.category} title={enemy.name+"の詳細を見る"} aria-label={enemy.name+"の詳細を見る"} onClick={()=>openEnemyDetail(x.category)}><img src={enemy.normal} alt=""/></button>})}{Number(count)>6&&<em>+{Number(count)-6}</em>}{Number(count)===0&&<small>なし</small>}</div>
     </div>)}
   </div>
   <div className="v51-verdict-foot">敵をタップすると、その場で鑑定理由まで確認できます。</div>
  </section>

  <section className="v5-card v5-future v51-future" data-section="FUTURE MONEY">
   <div className="v51-future-head"><div><div className="v51-jp-kicker is-dark">未来の戦利品</div><h2>未来に回せる可能性</h2></div><img src={ART.guide} alt="" aria-hidden="true"/></div>
   {adjusted.upper>0?<><div className="v51-money-hero" aria-label={monthlyText(adjusted.lower,adjusted.upper)}>
    <span className="v51-money-prefix">{adjusted.lower>0?'毎月':'毎月 最大'}</span>
    {adjusted.lower>0&&roundHero(adjusted.upper)>roundHero(adjusted.lower)?<><strong>{yen(roundHero(adjusted.lower))}</strong><i>〜</i><strong>{yen(roundHero(adjusted.upper))}</strong></>:<strong>{yen(roundHero(adjusted.upper))}</strong>}
    <span className="v51-money-unit">円</span>
   </div>
   <div className="v51-future-talk">ムダギリくん「全部削る金額じゃないぞ。ここから“本当に整えられる分”を見つけるんだ。」</div>
   <details className="v5-evidence"><summary>この数字の内訳を見る⌄</summary><div><span>確認できている金額</span><b>¥{yen(vm.potential.confirmedA)}/月</b></div><div><span>比較から見える追加余地</span><b>最大 ¥{yen(vm.potential.cUpper)}/月</b></div>{precisionApplied!==null&&<div><span>精度UPで本人確認した金額</span><b>¥{yen(precisionApplied)}/月</b></div>}<small>比較差額をそのまま足しているわけではありません。</small></details></>:vm.potential.reviewCount>0?<><strong className="v5-money is-text">見直しポイント {vm.potential.reviewCount}件</strong><div className="v51-future-talk">ムダギリくん「金額はまだ決めつけない。中身を見れば、次に整える場所が見えてくるぞ。」</div></>:<><strong className="v5-money is-text">今は大きく整えるところなし</strong><div className="v51-future-talk">ムダギリくん「無理にムダを作る必要はない。今の状態を守りながら未来を決めよう。」</div></>}
  </section>

  {adjusted.upper>0&&<section className="v5-card v5-impact v51-impact">
   <div className="v51-jp-kicker is-dark">積み重ねた戦利品</div><h2>積み重ねると、ここまで変わる。</h2>
   <div className="v5-impact-grid"><div><span>1年</span><b>{rangeText(adjusted.lower*12,adjusted.upper*12)}</b></div><div><span>5年</span><b>{rangeText(adjusted.lower*60,adjusted.upper*60)}</b></div><div className="is-10"><span>10年</span><b>{rangeText(adjusted.lower*120,adjusted.upper*120)}</b><i aria-hidden="true"/></div></div>
   <small>※今と同じ状態が続いた場合の単純累計です。運用益は含みません。</small>
  </section>}

  <section className="v5-card v5-goal v51-goal" data-section="GOAL QUEST">
   <div className="v51-jp-kicker">目的地を選ぶ</div><h2>{adjusted.upper>0?'この戦利品、どの未来へ回す？':'これからのお金、どの未来に使いたい？'}</h2>{adjusted.upper<=0&&<p>今は大きな見直し余地がなくても、使いたい未来を決めると次の家計整理がしやすくなります。</p>}
   <div className="v5-goals v51-goals">{GOALS.map(g=><button key={g[0]} className={goal===g[0]?'is-active':''} onClick={()=>{setGoal(g[0]);onEvent?.('goal_selected',{goal:g[0]})}}><span className={"v51-goal-emblem is-"+g[0]} aria-hidden="true"><i/><i/><i/></span><b>{g[1]}</b></button>)}</div>
   {goalMeta&&adjusted.upper>0&&<div className="v5-goal-result v51-goal-result"><small>選んだ目的地：{goalMeta[1]}</small><b>5年で最大 {approx(future5)}</b><p>「削るため」じゃなく、やりたいことへ回すために整える。</p></div>}
  </section>

  <section className="v5-card v5-next v51-next" data-section="NEXT QUEST">
   <div className="v51-next-head"><div><div className="v51-jp-kicker">次のターゲット</div><h2>まず狙うのは、こいつだけ。</h2></div><img src={ART.quest} alt="" aria-hidden="true"/></div>
   {vm.firstQuest?(()=>{const enemy=(ENEMY_ASSETS as any)[vm.firstQuest.category];return <div className="v51-target-lock">
     <div className="v51-target-enemy"><div className="v51-lock-ring" aria-hidden="true"/><img src={enemy.normal} alt={enemy.name}/><small>{enemy.name}</small></div>
     <div className="v51-target-copy"><span>MISSION</span><b>{vm.firstQuest.nextAction}</b><div className="v51-target-reward"><small>報酬</small>{vm.firstQuest.aAmount>0?<strong>月 ¥{yen(vm.firstQuest.aAmount)}<em> / 年 ¥{yen(vm.firstQuest.aAmount*12)}</em></strong>:<strong>まずは明細確認で正体を暴く</strong>}</div></div>
    </div>})():<div className="v51-target-clear"><strong>今は大きな討伐対象なし。</strong><span>現在の状態を維持しよう。</span></div>}
   <div className="v51-next-talk">ムダギリくん「全部いじる必要はない。まずこいつだけだ。」</div>
  </section>

  {vm.precisionTarget&&<section className="v5-card v5-precision">
   <div className="v51-jp-kicker">鑑定レベルUP</div><h2>あと1問で、もう少しあなた向けに絞れるぞ。</h2>
   <p><b>{vm.precisionTarget.label}</b>で、無理なく減らせそうな月額は？</p>
   {!precisionOpen?<button className="v5-secondary" onClick={()=>setPrecisionOpen(true)}>1問だけ答える ▶</button>:<div className="v5-precision-input"><label><input inputMode="numeric" value={precisionText} onChange={e=>setPrecisionText(e.target.value.replace(/[^0-9]/g,''))}/><b>円/月</b></label><small>最大 ¥{yen(precisionMax)} まで。0円でもOK。</small>{precisionText!==''&&!precisionValid&&<small className="is-error">0〜¥{yen(precisionMax)}の範囲で入力してください。</small>}<button className="v5-secondary" disabled={!precisionValid} onClick={()=>{setPrecisionApplied(precisionCandidate);onEvent?.('precision_answered',{category:vm.precisionTarget.category})}}>この金額で反映する</button></div>}
   {precisionApplied!==null&&<div className="v5-precision-done">✓ あなたの回答を反映しました。上の「未来に回せる可能性」を更新しています。</div>}
  </section>}

  <section className="v5-card v5-save v51-save" data-section="SAVE QUEST">
   <div className="v51-save-icon"><img src={ART.save} alt="" aria-hidden="true"/></div>
   <div className="v51-save-copy"><div className="v51-jp-kicker">セーブポイント</div><h2>この戦果をLINEに保存しておく？</h2><p>タイプ・家計ポジション・目的地・NEXT TARGETをあとで見返せます。</p></div>
   <button className="v5-primary v51-save-button" onClick={()=>openLine('after_next_quest')}>結果をLINEに保存 ▶</button><small>無料 / あとで見返せる / 登録だけで相談予約にはなりません</small>
  </section>

  <section className="v5-card v5-life v51-life" data-section="LIFE PLAN QUEST">
   <div className="v51-life-path" aria-hidden="true"><i/><i/><i/></div>
   <div className="v51-life-head"><div><div className="v51-jp-kicker">次の章へ</div><h2>今の家計で、<br/>やりたい未来に届く？</h2></div><img src={ART.guide} alt="" aria-hidden="true"/></div>
   <p>今回分かったのは「今のお金の使い方」。貯蓄・保険・住宅・教育・投資・将来収入までつなげると、<b>何を削るかではなく、何にいくら使えるか</b>が見えてきます。</p>
   {goalMeta&&goalMeta[0]!=='undecided'&&<div className="v5-life-goal">今回選んだ未来：<b>{goalMeta[1]}</b></div>}
   {vm.consultRoute?.insuranceReview&&<div className="v5-life-signal">保険は保障内容まで確認すると、必要な支出か整えられる支出かを判断できます。</div>}
   <button className="v5-primary is-life" onClick={()=>openLine('consult_route')}>未来のお金を整理してみる ▶</button>
  </section>

  <section className="v5-card v5-friend v51-friend" data-section="FRIEND QUEST">
   <div className="v51-friend-head"><div><div className="v51-jp-kicker">8タイプ図鑑</div><h2>友達は何タイプ？</h2></div><img src={ART.friend} alt="" aria-hidden="true"/></div>
   <div className="v51-friend-talk">ムダギリくん「お前の金額は出さない。称号だけ見せてやれ。」</div>
   <div className="v51-full-type-grid">{TYPE_ORDER.map(code=>{const t=(TYPE_CONTENT_V31 as any)[code];return <button type="button" className={code===vm.type.code?'is-mine':''} key={code} onClick={()=>setSelectedTypeCode(code)}><img src={TYPE_ART[code]} alt=""/><small>{code===vm.type.code?'あなた':'TYPE '+code}</small><b>{t.name}</b><span>{t.catchphrase}</span></button>})}</div>
   <div className="v5-share-grid v51-share-grid"><button onClick={()=>share('x')}>𝕏</button><button onClick={()=>share('instagram')}>Instagram</button><button onClick={()=>share('threads')}>Threads</button><button onClick={()=>share('line')}>LINE</button></div>
   <small>収入・支出金額・都道府県・Potentialは共有されません。</small>
  </section>

  <button className="v5-restart" onClick={onRestart}>診断をやり直す</button>
 </div></main></>;
}

const CSS=`
*{box-sizing:border-box}.v5{min-height:100dvh;padding:0 0 calc(42px + env(safe-area-inset-bottom));background:linear-gradient(180deg,#102333 0%,#0b1925 48%,#07111a 100%);color:#f7f9fb;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.v5-inner{width:min(100%,430px);margin:auto}.v5 section{margin:14px 12px;padding:20px;border-radius:18px}.v5-card{border:1px solid #385064;background:#173047;box-shadow:0 14px 34px rgba(0,0,0,.18)}.v5-kicker{color:#f4d76b;font-size:10px;font-weight:1000;letter-spacing:.12em}.v5 h1,.v5 h2,.v5 h3,.v5 p{margin:0}.v5 h1{margin-top:6px;font-size:30px}.v5 h2{margin-top:6px;font-size:24px;line-height:1.25}.v5 h3{margin-top:7px;font-size:15px;line-height:1.5}.v5 p{margin-top:9px;color:#d5dee6;line-height:1.7;font-size:13px}.v5 small{display:block;color:#aebdca;line-height:1.55}.v5-clear{position:relative;margin:0!important;padding:32px 20px 22px!important;border-radius:0!important;background:linear-gradient(150deg,#19364c,#0f2231)}.v5-clear>img{position:absolute;right:14px;top:16px;width:82px;height:82px;object-fit:contain}.v5-clear>div:first-of-type{padding-right:72px}.v5-talk{margin-top:13px;padding:10px 12px;border:1px solid rgba(244,215,107,.32);border-radius:11px;background:rgba(7,17,26,.42);font-size:12px;font-weight:800;line-height:1.6}.v5-type{text-align:center;background:linear-gradient(160deg,#28305d,#182743 54%,#122238);border-color:#776bc2}.v5-type-art{width:160px;height:160px;object-fit:contain;image-rendering:pixelated}.v5-type h2{color:#f4df82;font-size:34px}.v5-type h3{color:#fff}.v5-axes{margin-top:14px;padding:12px;border-radius:12px;background:#101f32}.v5-axis+ .v5-axis{margin-top:10px}.v5-axis>div:first-child{display:flex;justify-content:space-between;font-size:10px}.v5-axis-track{position:relative;height:5px;margin-top:6px;border-radius:999px;background:#334760}.v5-axis-track i{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:#b6a8ff;transform:translate(-50%,-50%)}.v5-type-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.v5-type-notes>div{padding:10px;border:1px solid #425878;border-radius:10px;background:#112337;text-align:left}.v5-type-notes b,.v5-type-notes small{display:block}.v5-small-share{min-height:48px;margin-top:14px;padding:0 18px;border:1px solid #8f83d8;border-radius:12px;background:#252a52;color:#fff;font-weight:900}.v5-head{display:flex;justify-content:space-between;gap:12px}.v5-head>div{min-width:0}.v5-head>img{width:72px;height:72px;object-fit:contain}.v5-position{background:linear-gradient(160deg,#17435a,#153247);border-color:#459bc0}.v5-position-list{margin-top:14px}.v5-position-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-top:1px solid rgba(255,255,255,.10)}.v5-position-row:first-child{border-top:0}.v5-position-row>div:first-child{min-width:0}.v5-position-row b,.v5-position-row small{display:block}.v5-position-criteria{margin-top:2px;color:#8fa8b8!important;font-size:9px!important}.v5-position-value{text-align:right;flex:0 0 auto}.v5-position-value strong{display:block;color:#ffe082;font-size:16px}.v5-position-value strong em{font-size:9px;font-style:normal;color:#b9c6cf}.v5-position-value span{display:inline-block;margin-top:4px;padding:3px 7px;border-radius:999px;background:#102335;color:#d8e5ee;font-size:9px;font-weight:900}.v5-note{margin-top:12px;padding:11px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#0f2738}.v5-note b,.v5-note span{display:block;font-size:11px}.v5-note span{margin-top:3px;color:#b5c5d1}.v5-verdict{background:linear-gradient(160deg,#17413f,#18303b)}.v5-counts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:14px}.v5-counts>div{padding:10px 3px;border:1px solid #3f605f;border-radius:10px;background:#10272e;text-align:center}.v5-counts b,.v5-counts span{display:block}.v5-counts b{font-size:15px}.v5-counts span{margin-top:3px;font-size:9px;color:#bbc9ce}.v5-verdict-list{margin-top:12px}.v5-verdict-row{display:flex;align-items:center;gap:9px;padding:11px 0;border-top:1px solid rgba(255,255,255,.10)}.v5-verdict-row>span{font-size:20px}.v5-verdict-row>div{flex:1;min-width:0}.v5-verdict-row b,.v5-verdict-row small{display:block}.v5-verdict-row>strong{font-size:11px}.v5-future{background:linear-gradient(155deg,#f5e6a6,#f3c85e);border:0;color:#18202a;text-align:center}.v5-future .v5-kicker{color:#775d04}.v5-future h2{color:#18202a}.v5-future p,.v5-future small{color:#4e4a35}.v5-money{display:block;margin-top:13px;font-size:clamp(32px,9vw,42px);line-height:1.15;letter-spacing:-.03em}.v5-money.is-text{font-size:27px}.v5-evidence{margin-top:16px;border:1px solid rgba(32,32,20,.18);border-radius:11px;background:rgba(255,255,255,.40);text-align:left}.v5-evidence summary{min-height:48px;padding:14px;font-weight:900;cursor:pointer}.v5-evidence>div{display:flex;justify-content:space-between;padding:9px 14px;border-top:1px solid rgba(20,20,10,.10);font-size:12px}.v5-evidence>small{padding:10px 14px}.v5-impact{background:#f2f5f7;color:#13202a}.v5-impact .v5-kicker{color:#8b6b06}.v5-impact h2{color:#13202a}.v5-impact small{color:#66727a}.v5-impact-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px}.v5-impact-grid>div{padding:13px 5px;border:1px solid #cad4dc;border-radius:11px;background:#fff;text-align:center}.v5-impact-grid span,.v5-impact-grid b{display:block}.v5-impact-grid span{font-size:10px;color:#65737c}.v5-impact-grid b{margin-top:6px;font-size:20px;line-height:1.2;white-space:nowrap}.v5-impact-grid .is-10{grid-column:1/-1;padding:18px 8px;border-color:#d5a91c;background:#fff7cf}.v5-impact-grid .is-10 b{font-size:32px;color:#745802}.v5-goal{background:linear-gradient(160deg,#25365c,#18304c);border-color:#687bc1}.v5-goals{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px}.v5-goals button{min-height:62px;padding:8px;border:1px solid #516680;border-radius:12px;background:#10243a;color:#eaf0f4;text-align:left}.v5-goals button span{font-size:20px}.v5-goals button b{display:block;margin-top:2px;font-size:11px}.v5-goals button.is-active{border-color:#f4d76b;background:#31405a;box-shadow:0 0 0 2px rgba(244,215,107,.10)}.v5-goal-result{margin-top:13px;padding:13px;border:1px solid #6e82a0;border-radius:12px;background:#10243a}.v5-goal-result b{display:block;margin-top:5px;color:#f4d76b;font-size:22px}.v5-next{background:linear-gradient(160deg,#3c3420,#243020);border-color:#c49d25}.v5-next-target{display:flex;align-items:center;gap:10px;margin-top:14px;padding:13px;border:1px solid #8c7838;border-radius:12px;background:#20291e}.v5-next-target>span{font-size:26px}.v5-next-target small,.v5-next-target b{display:block}.v5-next-target b{margin-top:3px;font-size:16px}.v5-precision{background:#1e3040}.v5-secondary,.v5-primary{width:100%;min-height:52px;margin-top:14px;border:0;border-radius:12px;font-weight:1000;touch-action:manipulation}.v5-secondary{background:#e8edf1;color:#14202a}.v5-secondary:disabled{opacity:.45}.v5-precision-input label{display:flex;align-items:center;margin-top:12px;padding:0 12px;border:1px solid #52687a;border-radius:11px;background:#0d1d2a}.v5-precision-input input{flex:1;min-width:0;height:52px;border:0;outline:0;background:transparent;color:#fff;font-size:22px;font-weight:900}.v5-precision-input label b{font-size:12px}.v5-precision-input .is-error{color:#ffad99}.v5-precision-done{margin-top:10px;color:#8ee1bf;font-size:11px}.v5-save{background:linear-gradient(160deg,#183e2b,#163126);border-color:#4dbf79}.v5-primary{background:#4fd778;color:#082013;box-shadow:0 6px 0 #258744}.v5-primary.is-life{background:#79d5c0;box-shadow:0 6px 0 #348b7b}.v5-life{background:linear-gradient(160deg,#174451,#183a45);border-color:#5bb5a7}.v5-life-goal,.v5-life-signal{margin-top:12px;padding:11px;border:1px solid #4d746f;border-radius:10px;background:#102b32;font-size:12px}.v5-codex{padding:0!important;overflow:hidden}.v5-codex>summary{display:flex;justify-content:space-between;align-items:center;min-height:76px;padding:16px 18px;cursor:pointer}.v5-codex>summary h2{font-size:18px}.v5-codex-list{border-top:1px solid #3a5264}.v5-codex-row>button{display:flex;justify-content:space-between;width:100%;min-height:52px;padding:0 15px;border:0;border-top:1px solid rgba(255,255,255,.08);background:#132b3e;color:#fff;text-align:left}.v5-codex-row>button span{align-self:center}.v5-detail{padding:12px 15px 15px;background:#0f2231}.v5-detail p{font-size:11px}.v5-detail .is-warn{color:#ffcc7c}.v5-friend{background:linear-gradient(160deg,#292853,#1c2745);border-color:#7169b8}.v5-friend details{margin-top:12px}.v5-friend summary{min-height:48px;padding:13px;border:1px solid #5b608e;border-radius:10px;background:#171f38;font-weight:900}.v5-types{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:9px}.v5-types>div{padding:8px;border:1px solid #454e72;border-radius:10px;background:#141d34;text-align:center}.v5-types>div.is-mine{border-color:#f4d76b}.v5-types img{width:74px;height:74px;object-fit:contain}.v5-types small,.v5-types b{display:block}.v5-share-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:14px}.v5-share-grid button{min-height:48px;border:1px solid #5e6791;border-radius:10px;background:#172039;color:#fff;font-size:10px;font-weight:900}.v5-restart{display:block;min-height:48px;margin:24px auto 0;padding:10px 14px;border:0;background:transparent;color:#aab9c6;text-decoration:underline}.v5-link{display:block;min-height:48px;margin:12px auto 0;padding:10px 14px;border:0;background:transparent;color:#8c99a3;text-decoration:underline}.v5-modal-bg{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(2,7,12,.82)}.v5-modal{width:min(100%,390px);padding:22px;border:1px solid #52677a;border-radius:17px;background:#132638;color:#fff}.v5-code{display:block;margin-top:12px;padding:12px;border:1px dashed #71869a;border-radius:10px;background:#0b1925;text-align:center;font-size:22px;letter-spacing:.08em}
/* Result V5.1 visual shell */
.v51-clear{min-height:480px!important;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;background:
 linear-gradient(180deg,rgba(4,14,24,.10) 0%,rgba(5,17,27,.18) 36%,rgba(5,17,27,.92) 100%),
 url('./assets/battle1/BG-003_SCAN_BATTLE.png') center 43%/cover no-repeat!important;border-bottom:1px solid rgba(244,215,107,.32)}
.v51-clear::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 68% 50%,rgba(255,232,117,.22),transparent 30%)}
.v51-clear-fx{position:absolute;right:-16px;bottom:118px;width:230px;height:230px;background:url('./assets/battle1/FX-01_REVEAL.png') center/contain no-repeat;opacity:.24;filter:drop-shadow(0 0 16px rgba(255,225,105,.28))}
.v51-clear-copy{position:relative;z-index:2;width:68%;text-shadow:0 2px 10px rgba(0,0,0,.75)}
.v51-eyebrow{color:#ffe77d;font-weight:1000;letter-spacing:.12em;font-size:12px}
.v51-clear h1{font-size:37px!important;line-height:1.08!important;margin-top:8px!important}.v51-clear h1 strong{color:#ffe27b}
.v51-clear p{font-size:14px!important;color:#f2f6f8!important;font-weight:800}
.v51-clear-mudagiri{position:absolute!important;z-index:2;right:10px!important;bottom:112px!important;top:auto!important;width:142px!important;height:142px!important;object-fit:contain;filter:drop-shadow(0 8px 8px rgba(0,0,0,.45))}
.v51-clear-talk{position:relative;z-index:3;margin-top:18px;padding:12px 14px;border:1px solid rgba(255,224,101,.55);border-radius:12px;background:rgba(5,19,30,.88);font-size:12px;font-weight:900;line-height:1.65}
.v51-scroll-cue{position:relative;z-index:3;margin-top:12px;text-align:center;color:#dfebf2;font-size:11px;font-weight:900;letter-spacing:.05em}.v51-scroll-cue span{color:#ffe27b;font-size:16px}
.v51-type{position:relative;overflow:hidden;padding:25px 18px 20px!important;border:2px solid #c5a9ff!important;background:
 radial-gradient(circle at 50% 24%,rgba(190,153,255,.28),transparent 29%),
 linear-gradient(160deg,#31265c 0%,#19274a 52%,#101d34 100%)!important;box-shadow:0 0 0 3px rgba(90,69,146,.35),0 18px 45px rgba(0,0,0,.34),inset 0 0 30px rgba(172,134,255,.08)!important}
.v51-type::before,.v51-type::after{content:"";position:absolute;width:52px;height:52px;border-color:#f4d76b;opacity:.7}.v51-type::before{left:8px;top:8px;border-left:2px solid;border-top:2px solid}.v51-type::after{right:8px;bottom:8px;border-right:2px solid;border-bottom:2px solid}
.v51-type-ribbon{display:inline-block;position:relative;z-index:2;margin-bottom:4px;padding:7px 17px;border:1px solid #e6c866;background:linear-gradient(180deg,#51401c,#2d2415);clip-path:polygon(8% 0,92% 0,100% 50%,92% 100%,8% 100%,0 50%);color:#ffe786;font-size:12px;font-weight:1000;letter-spacing:.08em}
.v51-deco-kicker{opacity:.72;margin-top:5px}.v51-type-art-frame{position:relative;width:210px;height:210px;margin:6px auto 0;display:grid;place-items:center}
.v51-type-art-frame::before{content:"";position:absolute;inset:18px;border:1px solid rgba(244,215,107,.6);transform:rotate(45deg);background:radial-gradient(circle,rgba(194,164,255,.20),transparent 62%);box-shadow:0 0 30px rgba(198,161,255,.25)}
.v51-type .v5-type-art{position:relative;z-index:2;width:190px!important;height:190px!important;filter:drop-shadow(0 12px 14px rgba(0,0,0,.42))}
.v51-type h2{position:relative;z-index:2;margin-top:2px!important;font-size:36px!important;line-height:1.12!important;text-shadow:0 2px 0 rgba(80,50,5,.55),0 0 14px rgba(246,218,122,.20)}
.v51-type h3{font-size:16px!important}.v51-type-summary{font-size:13px!important;color:#ced8e4!important}
.v51-axis-badges{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-top:14px}.v51-axis-badges span{padding:6px 9px;border:1px solid rgba(190,171,255,.48);border-radius:999px;background:rgba(10,24,43,.72);font-size:10px;font-weight:900;color:#f5f1ff}
.v51-type-detail{margin-top:14px;border:1px solid rgba(177,159,225,.32);border-radius:12px;background:rgba(8,21,37,.55);text-align:left}.v51-type-detail summary{min-height:48px;display:flex;align-items:center;justify-content:center;color:#d8cef8;font-size:11px;font-weight:900;cursor:pointer}
.v51-type-spark{position:absolute;color:#ffe781;text-shadow:0 0 10px #ffe781;animation:v51twinkle 2.2s ease-in-out infinite}.v51-type-spark.s1{top:86px;left:33px;font-size:26px}.v51-type-spark.s2{top:152px;right:28px;font-size:20px;animation-delay:.6s}.v51-type-spark.s3{top:265px;left:42px;font-size:16px;animation-delay:1.1s}
@keyframes v51twinkle{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
.v51-type-preview{margin:14px 12px!important;padding:14px!important;border:1px solid #5d557f;border-radius:15px!important;background:linear-gradient(180deg,#171f3a,#101929)}
.v51-section-label{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}.v51-section-label>span{color:#f4d76b;font-size:14px;font-weight:1000}.v51-section-label small{font-size:9px;text-align:right}
.v51-type-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:11px}.v51-type-grid button{min-width:0;min-height:112px;padding:7px 4px;border:1px solid #39496b;border-radius:10px;background:#111b31;color:#fff;touch-action:manipulation}.v51-type-grid button.is-mine{border-color:#f4d76b;box-shadow:0 0 0 2px rgba(244,215,107,.14),0 0 14px rgba(244,215,107,.12)}
.v51-type-thumb{display:block;width:58px;height:58px;margin:auto;border-radius:50%;background:radial-gradient(circle,#313a6c,#121a31 70%);overflow:hidden}.v51-type-thumb img{width:100%;height:100%;object-fit:contain}.v51-type-grid small{margin-top:4px;font-size:8px;color:#aeb8d2}.v51-type-grid b{display:block;margin-top:2px;font-size:9px;line-height:1.25;word-break:keep-all}
.v51-type-modal{text-align:center;position:relative}.v51-type-modal>img{width:150px;height:150px;object-fit:contain}.v51-type-modal>strong{display:block;margin-top:7px;color:#f4d76b;font-size:14px}.v51-type-modal .v51-modal-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px;text-align:left}.v51-modal-notes>div{padding:9px;border:1px solid #425978;border-radius:9px;background:#0d1d2c}.v51-modal-notes span,.v51-modal-notes b{display:block}.v51-modal-notes span{color:#9fb0bf;font-size:9px}.v51-modal-notes b{margin-top:3px;font-size:11px;line-height:1.5}.v51-modal-close{position:absolute;right:10px;top:8px;width:48px;height:48px;border:0;background:transparent;color:#fff;font-size:28px}

.v51-jp-kicker{color:#f4d76b;font-size:12px;font-weight:1000;letter-spacing:.08em}.v51-atlas{padding:18px 14px!important;background:linear-gradient(160deg,#14394d,#10283a 58%,#0d2030)!important;border-color:#4f9cbb!important}.v51-atlas-head{display:flex;gap:10px;align-items:flex-start}.v51-atlas-head>div{flex:1;min-width:0}.v51-atlas-head h2{font-size:27px!important;line-height:1.18!important}.v51-atlas-head>img{width:86px;height:86px;object-fit:contain;filter:drop-shadow(0 7px 7px rgba(0,0,0,.35))}
.v51-enemy-deck{display:grid;gap:11px;margin-top:15px}.v51-enemy-card{position:relative;display:grid;grid-template-columns:112px 1fr;gap:10px;width:100%;min-height:150px;padding:10px;border:1px solid #42687c;border-radius:14px;background:linear-gradient(145deg,#0d2231,#153447);color:#fff;text-align:left;overflow:hidden;touch-action:manipulation}.v51-enemy-card::after{content:"";position:absolute;inset:auto 0 0;height:3px;background:#8094a2}.v51-enemy-card.is-cut::after{background:#e8675f}.v51-enemy-card.is-optimize::after{background:#f4d76b}.v51-enemy-card.is-protect::after{background:#65cbb8}.v51-enemy-card.is-inspect::after{background:#a991ea}
.v51-enemy-portrait{position:relative;display:grid;place-items:center;border-radius:11px;background:radial-gradient(circle at 50% 40%,rgba(79,151,181,.24),rgba(5,17,27,.78) 70%)}.v51-enemy-portrait img{width:104px;height:104px;object-fit:contain;filter:drop-shadow(0 8px 7px rgba(0,0,0,.42))}.v51-enemy-portrait>span{position:absolute;left:4px;right:4px;bottom:4px;padding:4px 3px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(5,14,23,.86);text-align:center;font-size:9px;font-weight:1000}
.v51-enemy-copy>small{color:#8faabc;font-size:9px}.v51-enemy-copy h3{margin:1px 0 0!important;font-size:18px!important;line-height:1.2!important}.v51-position-badge{display:inline-block;margin-top:5px;padding:3px 7px;border:1px solid rgba(255,224,112,.35);border-radius:999px;color:#ffe27b;font-size:10px;font-weight:1000}.v51-position-gauge{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:2px;height:5px;margin-top:8px;overflow:hidden}.v51-position-gauge i{background:#29465a;border-radius:3px}.v51-position-gauge b{position:absolute;left:0;top:0;bottom:0;max-width:100%;border-radius:3px;background:linear-gradient(90deg,#54c8da,#f0d06e,#ef845e)}
.v51-enemy-money{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px}.v51-enemy-money span{font-size:9px;color:#9fb3c1}.v51-enemy-money strong{display:block;margin-top:1px;color:#f5f8fa;font-size:11px}.v51-gap{margin-top:6px;color:#ffe27b;font-size:17px;font-weight:1000}.v51-gap.is-minus{color:#8fe0c4}.v51-gap small{display:inline!important;margin-left:2px;font-size:9px;color:inherit}.v51-enemy-criteria{margin-top:4px!important;font-size:8px!important;color:#7793a5!important}.v51-atlas-more{width:100%;min-height:50px;margin-top:12px;border:1px solid #3d6478;border-radius:11px;background:#0c2131;color:#dce8ee;font-weight:900}.v51-atlas-rest{margin-top:8px;border-top:1px solid rgba(255,255,255,.1)}.v51-enemy-mini{display:flex;align-items:center;gap:9px;min-height:62px;padding:7px 4px;border-bottom:1px solid rgba(255,255,255,.08)}.v51-enemy-mini img{width:48px;height:48px;object-fit:contain}.v51-enemy-mini>div{flex:1;min-width:0}.v51-enemy-mini b,.v51-enemy-mini small{display:block}.v51-enemy-mini b{font-size:12px}.v51-enemy-mini small{font-size:9px}.v51-enemy-mini>strong{font-size:18px}.v51-atlas-note{margin-top:12px!important}
.v51-verdict{padding:18px 14px!important;background:linear-gradient(160deg,#173d3d,#102d33 56%,#0d222b)!important;border-color:#4d8f86!important}.v51-verdict-title{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.v51-verdict-title h2{font-size:29px!important}.v51-verdict-title img{width:94px;height:94px;object-fit:contain;filter:drop-shadow(0 8px 7px rgba(0,0,0,.35))}.v51-verdict-talk{margin-top:8px;padding:11px 12px;border:1px solid rgba(244,215,107,.32);border-radius:10px;background:rgba(5,18,24,.56);font-size:11px;font-weight:900;line-height:1.6}.v51-battle-groups{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.v51-battle-group{min-height:118px;padding:9px;border:1px solid #35565a;border-radius:11px;background:rgba(7,26,31,.58)}.v51-battle-group.is-cut{border-color:rgba(232,103,95,.45)}.v51-battle-group.is-optimize{border-color:rgba(244,215,107,.48)}.v51-battle-group.is-protect{border-color:rgba(101,203,184,.42)}.v51-battle-group.is-inspect{border-color:rgba(169,145,234,.42)}.v51-battle-group-head{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:4px}.v51-battle-group-head span{font-size:16px}.v51-battle-group-head b{font-size:10px}.v51-battle-group-head strong{font-size:14px;color:#fff}.v51-battle-portraits{display:flex;align-items:center;flex-wrap:wrap;gap:3px;margin-top:7px;min-height:50px}.v51-battle-portraits>span{width:38px;height:38px;border-radius:50%;background:#0b1c26;overflow:hidden;border:1px solid rgba(255,255,255,.12)}.v51-battle-portraits img{width:100%;height:100%;object-fit:contain}.v51-battle-portraits em{font-style:normal;font-size:10px;color:#dce7e9}.v51-battle-portraits small{font-size:9px}.v51-verdict-foot{margin-top:11px;text-align:center;color:#86a3a8;font-size:9px}

.v51-jp-kicker.is-dark{color:#755a00}.v51-future{position:relative;overflow:hidden;padding:18px 16px 20px!important;background:
 radial-gradient(circle at 88% 10%,rgba(255,255,255,.55),transparent 24%),
 linear-gradient(155deg,#fff0b4,#f4cb5d)!important}.v51-future::after{content:"";position:absolute;right:-35px;bottom:-40px;width:160px;height:160px;background:url('./assets/battle1/FX-01_REVEAL.png') center/contain no-repeat;opacity:.09}.v51-future-head{position:relative;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;text-align:left}.v51-future-head>img{width:96px;height:96px;object-fit:contain;filter:drop-shadow(0 7px 7px rgba(70,45,0,.22))}.v51-future-talk{position:relative;z-index:2;margin:13px auto 0;padding:11px 12px;border:1px solid rgba(92,69,0,.22);border-radius:10px;background:rgba(255,250,222,.56);color:#4a3c16;font-size:11px;font-weight:900;line-height:1.6;text-align:left}
.v51-impact{position:relative;overflow:hidden}.v51-impact-grid{}.v51-impact .is-10{position:relative;overflow:hidden}.v51-impact .is-10 i{position:absolute;right:-8px;bottom:-28px;width:100px;height:100px;background:url('./assets/battle1/FX-01_REVEAL.png') center/contain no-repeat;opacity:.10}
.v51-goal{background:linear-gradient(160deg,#25365c,#152a45 65%,#101f35)!important}.v51-goal h2{font-size:28px!important}.v51-goals button{display:grid!important;grid-template-columns:56px 1fr;align-items:center;gap:10px;min-height:76px!important;padding:9px 10px!important}.v51-goals button b{font-size:12px!important}.v51-goal-emblem{position:relative;display:block;width:52px;height:52px;border:1px solid #6379a1;border-radius:8px;background:linear-gradient(145deg,#193453,#0e2037);box-shadow:inset 0 0 0 3px rgba(255,255,255,.025)}.v51-goal-emblem i{position:absolute;display:block;background:#f3d56f;box-shadow:2px 2px 0 rgba(0,0,0,.22)}.v51-goal-emblem.is-home i:nth-child(1){width:28px;height:20px;left:12px;top:22px}.v51-goal-emblem.is-home i:nth-child(2){width:26px;height:26px;left:13px;top:10px;transform:rotate(45deg)}.v51-goal-emblem.is-home i:nth-child(3){width:8px;height:14px;left:22px;top:28px;background:#18304c}.v51-goal-emblem.is-family i:nth-child(1){width:10px;height:10px;border-radius:50%;left:8px;top:12px}.v51-goal-emblem.is-family i:nth-child(2){width:10px;height:10px;border-radius:50%;left:21px;top:8px}.v51-goal-emblem.is-family i:nth-child(3){width:10px;height:10px;border-radius:50%;left:34px;top:12px}.v51-goal-emblem.is-family::after{content:"";position:absolute;left:7px;right:7px;bottom:11px;height:16px;background:#f3d56f;clip-path:polygon(0 100%,8% 35%,28% 25%,40% 0,60% 0,72% 25%,92% 35%,100% 100%)}.v51-goal-emblem.is-travel i:nth-child(1){width:30px;height:6px;left:11px;top:23px;transform:rotate(-20deg)}.v51-goal-emblem.is-travel i:nth-child(2){width:14px;height:5px;left:8px;top:16px;transform:rotate(20deg)}.v51-goal-emblem.is-travel i:nth-child(3){width:14px;height:5px;right:8px;top:27px;transform:rotate(20deg)}.v51-goal-emblem.is-invest i:nth-child(1){width:7px;height:10px;left:9px;bottom:9px}.v51-goal-emblem.is-invest i:nth-child(2){width:7px;height:18px;left:22px;bottom:9px}.v51-goal-emblem.is-invest i:nth-child(3){width:7px;height:28px;left:35px;bottom:9px}.v51-goal-emblem.is-challenge i:nth-child(1){width:5px;height:30px;left:14px;top:10px}.v51-goal-emblem.is-challenge i:nth-child(2){width:22px;height:14px;left:18px;top:10px;clip-path:polygon(0 0,100% 0,72% 50%,100% 100%,0 100%)}.v51-goal-emblem.is-challenge i:nth-child(3){width:24px;height:4px;left:14px;bottom:9px}.v51-goal-emblem.is-safety::before{content:"";position:absolute;left:12px;top:8px;width:28px;height:34px;background:#f3d56f;clip-path:polygon(50% 0,100% 17%,92% 70%,50% 100%,8% 70%,0 17%)}.v51-goal-emblem.is-safety i{display:none}.v51-goal-emblem.is-retirement i:nth-child(1){width:5px;height:23px;left:24px;bottom:8px;background:#9dde86}.v51-goal-emblem.is-retirement i:nth-child(2){width:15px;height:10px;left:11px;top:16px;background:#9dde86;transform:rotate(25deg);border-radius:60% 0}.v51-goal-emblem.is-retirement i:nth-child(3){width:15px;height:10px;right:10px;top:12px;background:#9dde86;transform:rotate(-25deg);border-radius:0 60%}.v51-goal-emblem.is-undecided i:nth-child(1){width:7px;height:7px;border-radius:50%;left:10px;top:23px}.v51-goal-emblem.is-undecided i:nth-child(2){width:7px;height:7px;border-radius:50%;left:23px;top:23px}.v51-goal-emblem.is-undecided i:nth-child(3){width:7px;height:7px;border-radius:50%;left:36px;top:23px}
.v51-next{padding:18px 14px!important;background:radial-gradient(circle at 78% 18%,rgba(190,50,42,.12),transparent 30%),linear-gradient(155deg,#292515,#151d18 58%,#0c1517)!important;border-color:#d3a927!important}.v51-next-head{display:flex;justify-content:space-between;gap:8px}.v51-next-head h2{font-size:29px!important}.v51-next-head>img{width:96px;height:96px;object-fit:contain}.v51-target-lock{display:grid;grid-template-columns:130px 1fr;gap:12px;margin-top:12px;padding:12px;border:1px solid #806d2c;border-radius:14px;background:linear-gradient(145deg,#0e1818,#202314)}.v51-target-enemy{position:relative;min-height:145px;display:grid;place-items:center}.v51-target-enemy img{position:relative;z-index:2;width:120px;height:120px;object-fit:contain;filter:drop-shadow(0 9px 8px rgba(0,0,0,.5))}.v51-target-enemy small{position:absolute;left:0;right:0;bottom:0;text-align:center;color:#f5da73;font-size:9px;font-weight:900}.v51-lock-ring{position:absolute;width:106px;height:106px;border:1px solid rgba(230,86,68,.75);border-radius:50%;box-shadow:0 0 0 8px rgba(230,86,68,.08),0 0 18px rgba(230,86,68,.2)}.v51-lock-ring::before,.v51-lock-ring::after{content:"";position:absolute;background:#e65644}.v51-lock-ring::before{left:-10px;right:-10px;top:52px;height:1px}.v51-lock-ring::after{top:-10px;bottom:-10px;left:52px;width:1px}.v51-target-copy{align-self:center}.v51-target-copy>span{color:#ddc15d;font-size:9px;font-weight:1000;letter-spacing:.12em}.v51-target-copy>b{display:block;margin-top:5px;font-size:16px;line-height:1.45}.v51-target-reward{margin-top:12px;padding:8px 9px;border:1px solid rgba(244,215,107,.25);border-radius:8px;background:#121b16}.v51-target-reward small{color:#9fa987;font-size:8px}.v51-target-reward strong{display:block;margin-top:2px;color:#ffe17a;font-size:13px}.v51-target-reward em{display:block;margin-top:2px;color:#d7dfd0;font-size:9px;font-style:normal}.v51-next-talk{margin-top:11px;padding:10px;border:1px solid rgba(244,215,107,.26);border-radius:9px;background:#101a17;font-size:10px;font-weight:900}.v51-target-clear strong,.v51-target-clear span{display:block}.v51-target-clear{margin-top:12px;padding:14px;border:1px solid #5c6738;border-radius:11px}.v51-target-clear span{margin-top:4px;color:#aab7a3;font-size:10px}
.v51-save{display:grid;grid-template-columns:68px 1fr;gap:10px;padding:14px!important;background:#122b25!important;border-color:#3c7968!important}.v51-save-icon{grid-row:1/3;display:grid;place-items:start center}.v51-save-icon img{width:62px;height:62px;object-fit:contain}.v51-save-copy h2{font-size:19px!important}.v51-save-copy p{font-size:11px!important}.v51-save-button{grid-column:1/-1;margin-top:5px!important;min-height:48px!important;box-shadow:0 4px 0 #258744!important}.v51-save>small{grid-column:1/-1;font-size:9px;text-align:center}
.v51-life{position:relative;overflow:hidden;padding:18px 16px!important;background:linear-gradient(155deg,#174451,#15323f 64%,#102732)!important}.v51-life-head{display:flex;justify-content:space-between;gap:10px}.v51-life-head h2{font-size:29px!important}.v51-life-head img{width:92px;height:92px;object-fit:contain}.v51-life-path{position:absolute;right:14px;bottom:18px;width:120px;height:80px;opacity:.13}.v51-life-path::before{content:"";position:absolute;left:6px;right:8px;top:38px;border-top:2px dashed #9fe3d2;transform:rotate(-12deg)}.v51-life-path i{position:absolute;width:9px;height:9px;border:2px solid #9fe3d2;border-radius:50%}.v51-life-path i:nth-child(1){left:5px;top:43px}.v51-life-path i:nth-child(2){left:55px;top:28px}.v51-life-path i:nth-child(3){right:6px;top:12px}
.v51-codex{background:#142b3f!important}.v51-codex-row>button{min-height:64px!important;padding:5px 12px!important}.v51-codex-name{display:flex!important;align-items:center!important;gap:8px!important}.v51-codex-name>img{width:46px;height:46px;object-fit:contain}.v51-codex-name>span{display:block}.v51-codex-name b,.v51-codex-name small{display:block}.v51-codex-name b{font-size:11px}.v51-codex-name small{font-size:8px;color:#8fa5b4}
.v51-friend{padding:18px 14px!important;background:linear-gradient(155deg,#2b2856,#171f3d 62%,#11192f)!important}.v51-friend-head{display:flex;justify-content:space-between;gap:10px}.v51-friend-head h2{font-size:26px!important;white-space:nowrap}.v51-friend-head img{width:92px;height:92px;object-fit:contain}.v51-friend-talk{margin-top:8px;padding:10px;border:1px solid rgba(244,215,107,.28);border-radius:9px;background:#11182d;font-size:10px;font-weight:900}.v51-full-type-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.v51-full-type-grid button{min-height:158px;padding:8px;border:1px solid #454e75;border-radius:11px;background:#121b34;color:#fff;text-align:center}.v51-full-type-grid button.is-mine{border-color:#f4d76b;box-shadow:0 0 0 2px rgba(244,215,107,.13)}.v51-full-type-grid img{width:86px;height:86px;object-fit:contain}.v51-full-type-grid small,.v51-full-type-grid b,.v51-full-type-grid span{display:block}.v51-full-type-grid small{font-size:8px;color:#9facce}.v51-full-type-grid b{margin-top:2px;font-size:11px}.v51-full-type-grid span{margin-top:3px;color:#aab4cc;font-size:8px;line-height:1.35}.v51-share-grid{margin-top:13px}

.v51-enemy-card.is-open{border-color:#e6c969;box-shadow:0 0 0 2px rgba(230,201,105,.10)}
.v51-tap-detail{display:block;margin-top:7px;color:#9ec6d8;font-size:9px;font-weight:900}
.v51-atlas-detail{margin:7px 2px 12px;padding:12px 13px;border:1px solid #41647a;border-radius:11px;background:rgba(6,20,30,.78);animation:v51detailin .16s ease-out}.v51-atlas-detail p{margin:0!important;font-size:11px!important;line-height:1.65!important;color:#dce5ea!important}.v51-atlas-detail p+p{margin-top:7px!important}.v51-atlas-detail small{display:inline!important;font-size:9px!important}.v51-atlas-detail .is-warn{color:#f1cb78!important}
.v51-atlas-mini-entry{border-bottom:1px solid rgba(255,255,255,.08)}.v51-atlas-mini-entry:last-child{border-bottom:0}.v51-enemy-mini{width:100%;border:0!important;background:transparent!important;color:#fff;text-align:left}.v51-enemy-mini>span{width:22px;text-align:center;color:#9db5c3;font-weight:900}.v51-atlas-mini-entry .v51-atlas-detail{margin:0 0 10px}
@keyframes v51detailin{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}

.v51-status-help{margin-top:4px;color:#9fb7b5;font-size:8px;font-weight:800;line-height:1.35}
.v51-battle-portraits>button{width:42px;height:42px;padding:0;border:1px solid rgba(255,255,255,.13);border-radius:50%;background:#0b1c26;overflow:hidden;cursor:pointer;touch-action:manipulation;transition:transform .14s ease,border-color .14s ease}.v51-battle-portraits>button:active{transform:scale(.92)}.v51-battle-portraits>button img{width:100%;height:100%;object-fit:contain}
.v51-money-hero{display:flex;align-items:baseline;justify-content:center;flex-wrap:wrap;gap:3px 5px;margin:20px auto 10px;color:#142332;font-family:"Arial Black","Helvetica Neue",system-ui,sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.055em;line-height:.92;text-align:center;text-shadow:0 2px 0 rgba(255,255,255,.35)}
.v51-money-prefix{flex-basis:100%;margin-bottom:7px;color:#604a05;font-family:system-ui,sans-serif;font-size:16px;font-weight:1000;letter-spacing:.06em;line-height:1}
.v51-money-hero strong{font-size:clamp(48px,13.2vw,70px);font-weight:1000;white-space:nowrap}.v51-money-hero i{font-size:33px;font-style:normal;font-weight:1000;letter-spacing:0}.v51-money-unit{font-size:29px;font-weight:1000;letter-spacing:-.04em}
.v51-impact>h2{font-size:34px!important;line-height:1.08!important;letter-spacing:-.045em;font-weight:1000!important}.v51-impact .v5-impact-grid b{font-family:"Arial Black","Helvetica Neue",system-ui,sans-serif;font-weight:1000;letter-spacing:-.055em}.v51-impact .v5-impact-grid .is-10 b{font-size:clamp(38px,10vw,54px)!important;line-height:1!important;text-shadow:0 2px 0 rgba(255,255,255,.55)}
@media(prefers-reduced-motion:reduce){.v51-type-spark{animation:none}}
@media(max-width:380px){.v5 section{margin-left:8px;margin-right:8px}.v5 h2{font-size:22px}.v5-counts{gap:4px}.v5-counts b{font-size:13px}.v5-impact-grid b{font-size:18px}.v5-impact-grid .is-10 b{font-size:28px}.v5-type h2{font-size:30px}}
`;
