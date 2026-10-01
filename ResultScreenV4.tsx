import React,{useEffect,useRef,useState} from 'react';
import {TYPE_CONTENT_V31} from './type-content-v3.1';
import {consultTopicCopyV1,type ConsultTopicV1} from './consult-route-v1';

const yen=(n:number|null)=>n===null?'未把握':new Intl.NumberFormat('ja-JP').format(Math.round(n));
const mark:Record<string,string>={battle:'⚔️',protect:'🛡️',safe:'✓',review:'🔍',na:'⚪'};
const modeName:Record<string,string>={gentle:'😇 甘やかしムダギリ',serious:'⚔️ 正論ムダギリ',hell:'💀 地獄ムダギリ'};
// GitHub Pages is hosted under /mudagii/. Root-absolute /assets/... points at
// mudagiri.github.io/assets and 404s, so keep result art relative to Vite's base.
const TYPE_ART_V31:Record<string,string>={
 FPA:'./assets/types/v31/TYPE_FPA.png',FPU:'./assets/types/v31/TYPE_FPU.png',
 FIA:'./assets/types/v31/TYPE_FIA.png',FIU:'./assets/types/v31/TYPE_FIU.png',
 VPA:'./assets/types/v31/TYPE_VPA.png',VPU:'./assets/types/v31/TYPE_VPU.png',
 VIA:'./assets/types/v31/TYPE_VIA.png',VIU:'./assets/types/v31/TYPE_VIU.png',
};
const TYPE_ORDER_V31=['FPA','FPU','FIA','FIU','VPA','VPU','VIA','VIU'] as const;
const MUDAGIRI_RESULT_ART={
 clear:'./assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png',
 benchmark:'./assets/battle1/MUDAGIRI_BATTLE_READY.png',
 verdict:'./assets/battle1/MUDAGIRI_BATTLE.png',
 guide:'./assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png',
 share:'./assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png',
 shareHint:'./assets/prebattle/MUDAGIRI_PROFILE_Q2.png',
 quest:'./assets/battle1/MUDAGIRI_BATTLE_SWING.png',
 save:'./assets/prebattle/MUDAGIRI_PROFILE_Q5.png',
 friend:'./assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png',
} as const;

function typeArt(code:string){return TYPE_ART_V31[code]??'';}
function lineHandoffCode(diagnosisId:string){
 const clean=String(diagnosisId||'').replace(/[^a-zA-Z0-9]/g,'').toUpperCase();
 return 'MG-'+(clean.slice(-12)||'UNKNOWN');
}
function resultTone(mode:string){return mode==='hell'?{gap:'家計のクセ、数字に出てるぞ。',warning:'おっと、全部ムダ認定は早い。この差はあくまで基準との差だ。',confirmed:'で、本当に斬っていいと確認できたのはここ',verdict:'討伐結果、集計するぞ。',next:'次に斬り込むなら、ここだ。',save:'戦果は消える前に保存しとけ。'}:mode==='serious'?{gap:'まず、基準との差を確認。',warning:'差があるだけではムダとは判定しません。',confirmed:'その中で、削減可能と確認できた金額',verdict:'今回の家計判定',next:'次にやることは、1つだけ。',save:'診断結果を残しておきましょう。'}:{gap:'まずは、近い条件の基準と比べてみよう。',warning:'高くても、必要な支出までムダ扱いしないから安心してね。',confirmed:'その中で、無理なく見直せると確認できた金額',verdict:'今回の家計、こんな感じだったよ。',next:'まずはここから見てみよう。',save:'せっかくの診断、あとで見返せるようにしよう。'};}

function TypeAxis({label,value,positive,positiveText,negativeText,middle}:{label:string;value:number;positive:boolean;positiveText:string;negativeText:string;middle?:boolean}){
 const pct=middle?50:positive?50+Math.min(50,value/2):50-Math.min(50,value/2);
 const tendency=middle?'バランス型':positive?positiveText:negativeText;
 return <div className="rv3-axis"><div><span>{label}</span><b>{tendency}</b></div><div className="rv3-axis-track"><i style={{left:`${pct}%`}}/></div></div>
}

function axisTendency(vm:any,axis:'fv'|'pi'|'au'){
 const middle=vm.type.nearMiddle?.[axis]; if(middle)return 'バランス型';
 const positive=(vm.type.axes?.[axis]??0)>=0;
 if(axis==='fv')return positive?'未来寄り':'今寄り';
 if(axis==='pi')return positive?'計画寄り':'直感寄り';
 return positive?'普段から把握':'必要時に確認';
}
function drawCenteredWrapped(x:CanvasRenderingContext2D,text:string,cx:number,y:number,maxWidth:number,lineHeight:number,maxLines=2){
 const chars=[...text];let line='',lines:string[]=[];
 for(const ch of chars){const next=line+ch;if(x.measureText(next).width>maxWidth&&line){lines.push(line);line=ch}else line=next}
 if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&x.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}
 lines.forEach((v,i)=>x.fillText(v,cx,y+i*lineHeight));return lines.length;
}
function loadCanvasImage(src:string){return new Promise<HTMLImageElement|null>(resolve=>{if(!src){resolve(null);return}const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src})}
function signedYen(n:number){
 if(n>0)return '+¥'+yen(n);
 if(n<0)return '-¥'+yen(Math.abs(n));
 return '±¥0';
}
function approxImpactYen(n:number){
 const sign=n>0?'+':n<0?'-':'±';
 const a=Math.abs(n);
 if(a===0)return '±0円';
 if(a>=10000)return sign+'約'+new Intl.NumberFormat('ja-JP').format(Math.round(a/10000))+'万円';
 return sign+'約'+new Intl.NumberFormat('ja-JP').format(Math.round(a/1000)*1000)+'円';
}
function comparisonGroupLabel(label:string){
 return label==='あなたの支出'?'日常の支出':label;
}


function useOnceVisible(onEvent:((n:string,p?:any)=>void)|undefined,eventName:string,payload:any){
 const ref=useRef<HTMLElement|null>(null);
 const fired=useRef(false);
 useEffect(()=>{
  const el=ref.current;if(!el||fired.current)return;
  if(typeof IntersectionObserver==='undefined'){fired.current=true;onEvent?.(eventName,payload);return}
  const observer=new IntersectionObserver(entries=>{
   if(fired.current)return;
   if(entries.some(x=>x.isIntersecting&&x.intersectionRatio>=.35)){
    fired.current=true;
    onEvent?.(eventName,payload);
    observer.disconnect();
   }
  },{threshold:[.35]});
  observer.observe(el);
  return()=>observer.disconnect();
 },[onEvent,eventName]);
 return ref;
}

async function makeTypeShareFile(vm:any){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const x=canvas.getContext('2d');if(!x)return null;
 x.fillStyle='#07111b';x.fillRect(0,0,1080,1350);
 x.strokeStyle='#f5cc39';x.lineWidth=8;x.strokeRect(44,44,992,1262);
 x.textAlign='center';
 x.fillStyle='#f5cc39';x.fillRect(72,70,230,52);
 x.fillStyle='#07111b';x.font='1000 23px system-ui,sans-serif';x.fillText('ムダギリ診断',187,104);
 x.fillStyle='#f5cc39';x.font='900 32px system-ui,sans-serif';x.fillText('MONEY TYPE UNLOCKED',540,150);
 x.fillStyle='#87929d';x.font='800 19px system-ui,sans-serif';x.fillText('家計RPG診断',540,184);
 x.fillStyle='#101c27';x.fillRect(420,188,240,54);x.strokeStyle='#344454';x.lineWidth=2;x.strokeRect(420,188,240,54);
 x.fillStyle='#fff';x.font='900 25px system-ui,sans-serif';x.fillText('TYPE '+vm.type.code,540,224);
 const art=await loadCanvasImage(typeArt(vm.type.code));
 if(art){
  const maxW=360,maxH=330,scale=Math.min(maxW/art.naturalWidth,maxH/art.naturalHeight);
  const w=art.naturalWidth*scale,h=art.naturalHeight*scale;
  x.imageSmoothingEnabled=false;x.drawImage(art,(1080-w)/2,285-h/2,w,h);
 }
 x.fillStyle='#fff';x.font='900 64px system-ui,sans-serif';
 const nameLines=drawCenteredWrapped(x,vm.type.name,540,500,900,72,2);
 x.fillStyle='#f5cc39';x.font='900 31px system-ui,sans-serif';
 drawCenteredWrapped(x,vm.type.catchphrase??'',540,nameLines>1?635:590,880,42,2);

 x.fillStyle='#87929d';x.font='900 20px system-ui,sans-serif';x.fillText('YOUR STRENGTH',540,730);
 x.fillStyle='#0d1721';x.fillRect(125,755,830,128);
 x.strokeStyle='rgba(245,204,57,.55)';x.lineWidth=2;x.strokeRect(125,755,830,128);
 x.fillStyle='#fff';x.font='900 30px system-ui,sans-serif';
 drawCenteredWrapped(x,vm.type.strengthLabel??'',540,810,760,38,2);

 const traits=[axisTendency(vm,'fv'),axisTendency(vm,'pi'),axisTendency(vm,'au')];
 traits.forEach((v,i)=>{
  const left=120+i*285;
  x.fillStyle='#101c27';x.fillRect(left,930,270,78);
  x.strokeStyle='#344454';x.strokeRect(left,930,270,78);
  x.fillStyle='#fff';x.font='900 24px system-ui,sans-serif';x.fillText(v,left+135,978);
 });
 x.fillStyle='#87929d';x.font='800 19px system-ui,sans-serif';x.fillText('気をつけたいところ',540,1070);
 x.fillStyle='#dce4eb';x.font='800 23px system-ui,sans-serif';
 drawCenteredWrapped(x,vm.type.blindSpot??'',540,1110,820,32,2);
 const mascot=await loadCanvasImage(MUDAGIRI_RESULT_ART.share);
 if(mascot){
  const maxW=118,maxH=118,scale=Math.min(maxW/mascot.naturalWidth,maxH/mascot.naturalHeight);
  const w=mascot.naturalWidth*scale,h=mascot.naturalHeight*scale;
  x.imageSmoothingEnabled=false;
  x.drawImage(mascot,875-w/2,1135-h/2,w,h);
 }
 x.fillStyle='#fff';x.font='900 34px system-ui,sans-serif';x.fillText('友達は何タイプ？',460,1215);
 x.fillStyle='#f5cc39';x.font='900 28px system-ui,sans-serif';x.fillText('#ムダギリ診断',460,1260);
 x.fillStyle='#87929d';x.font='700 18px system-ui,sans-serif';x.fillText('収入・支出金額・都道府県は画像に含まれません',540,1300);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
 return blob?new File([blob],`mudagiri-${vm.type.code}.png`,{type:'image/png'}):null;
}

export default function ResultScreenV4({vm,onLine,onEvent,onRestart,onBeforeExternal}:{vm:any;onLine?:(x:any)=>void;onEvent?:(n:string,p?:any)=>void;onRestart?:()=>void;onBeforeExternal?:()=>void}){
 const [open,setOpen]=useState<string|null>(null);
 const tone=resultTone(vm.toneMode);
 const [revealed,setRevealed]=useState(false);
 const shareFileRef=useRef<File|null>(null);
 const [linePrompt,setLinePrompt]=useState<null|'after_next_quest'|'result_bottom'|'consult_route'>(null);
 const [homeStructure,setHomeStructure]=useState<'detached'|'other'|null>(null);
 const recommendedConsultTopic:ConsultTopicV1=vm.consultRoute?.primary??'lifeplan';
 const [consultTopic,setConsultTopic]=useState<ConsultTopicV1>(recommendedConsultTopic);
 const consultCopy=consultTopicCopyV1(consultTopic);
 const handoffCode=lineHandoffCode(vm.diagnosisId);
 const earlyLineRef=useOnceVisible(onEvent,'line_cta_viewed',{placement:'after_next_quest',typeCode:vm.type.code,firstQuest:vm.firstQuest?.category??null});
 const bottomLineRef=useOnceVisible(onEvent,'line_cta_viewed',{placement:'result_bottom',typeCode:vm.type.code,firstQuest:vm.firstQuest?.category??null});
 useEffect(()=>{
   onEvent?.('result_viewed',{version:vm.version,typeCode:vm.type.code});
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   const id=window.setTimeout(()=>setRevealed(true),reduced?0:180);
   return()=>window.clearTimeout(id);
 },[]);
 useEffect(()=>{
  let active=true;
  shareFileRef.current=null;
  makeTypeShareFile(vm).then(file=>{if(active)shareFileRef.current=file});
  return()=>{active=false};
 },[vm.type.code]);
 async function nativeShare(platform:'instagram'|'threads'|'other'|'challenge'='other'){
  const hook=vm.type.shareHook??vm.type.catchphrase??vm.type.description??'';
  const shareUrl=new URL(window.location.origin+window.location.pathname);
  shareUrl.searchParams.set('ref','share');
  shareUrl.searchParams.set('type',vm.type.code);
  shareUrl.searchParams.set('src',platform);
  const text=`${hook}\n\nムダギリ診断 →「${vm.type.name}」\n${vm.type.catchphrase??''}\n\nあなたは何タイプ？\n${shareUrl.toString()}\n#ムダギリ診断`;
  onEvent?.('share_clicked',{typeCode:vm.type.code,platform});
  onBeforeExternal?.();
  try{
   const file=shareFileRef.current;
   if(file&&navigator.share&&navigator.canShare?.({files:[file]})){
    await navigator.share({title:'ムダギリ診断',text,files:[file]});
    onEvent?.('share_completed',{typeCode:vm.type.code,platform,format:'image'});
    return;
   }
   if(navigator.share){
    await navigator.share({title:'ムダギリ診断',text});
    onEvent?.('share_completed',{typeCode:vm.type.code,platform,format:'text'});
    return;
   }
  }catch(err){
   if(err instanceof DOMException&&err.name==='AbortError')return;
  }
  try{
   await navigator.clipboard?.writeText(text);
   onEvent?.('share_completed',{typeCode:vm.type.code,platform,fallback:'clipboard'});
  }catch{}
 }
 function shareX(){
  const hook=vm.type.shareHook??vm.type.catchphrase??vm.type.description??'';
  const shareUrl=new URL(window.location.origin+window.location.pathname);
  shareUrl.searchParams.set('ref','share');shareUrl.searchParams.set('type',vm.type.code);shareUrl.searchParams.set('src','x');
  const text=`${hook}\n\nムダギリ診断 →「${vm.type.name}」\n${vm.type.catchphrase??''}\n\nあなたは何タイプ？\n#ムダギリ診断`;
  onEvent?.('share_clicked',{typeCode:vm.type.code,platform:'x'});
  onBeforeExternal?.();
  window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(shareUrl.toString()),'_blank','noopener,noreferrer');
 }
 function shareLineFriend(){
  const shareUrl=new URL(window.location.origin+window.location.pathname);
  shareUrl.searchParams.set('ref','share');shareUrl.searchParams.set('type',vm.type.code);shareUrl.searchParams.set('src','line_friend');
  const text=`ムダギリ診断で「${vm.type.name}」だった！\n${vm.type.catchphrase??''}\n\nあなたは何タイプ？\n${shareUrl.toString()}\n#ムダギリ診断`;
  onEvent?.('share_clicked',{typeCode:vm.type.code,platform:'line_friend'});
  onBeforeExternal?.();
  window.location.href='https://line.me/R/share?text='+encodeURIComponent(text);
 }
 function lineHandoff(placement:'after_next_quest'|'result_bottom'|'consult_route'){
  onEvent?.('line_clicked',{placement,typeCode:vm.type.code,firstQuest:vm.firstQuest?.category??null});
  onEvent?.('line_handoff_prompted',{placement,typeCode:vm.type.code});
  setLinePrompt(placement);
 }
 async function confirmLineHandoff(){
  if(!linePrompt)return;
  const placement=linePrompt;
  const message=`ムダギリ診断 引き継ぎコード：${handoffCode}`;
  let copied=false;
  try{await navigator.clipboard?.writeText(message);copied=true}catch{}
  onBeforeExternal?.();
  onEvent?.('line_handoff_confirmed',{placement,typeCode:vm.type.code,firstQuest:vm.firstQuest?.category??null,copied});
  onLine?.({
   diagnosisId:vm.diagnosisId,
   firstQuest:vm.firstQuest?.category,
   placement,
   handoffCode,
   consultPrimary:vm.consultRoute?.primary??'lifeplan',
   consultSelectedTopic:consultTopic,
   insuranceReview:!!vm.consultRoute?.insuranceReview,
   homeStructure,
   solarEligible:homeStructure==='detached'
  });
 }

 const comparableRows=(vm.rows??[]).filter((x:any)=>x.known&&x.comparable!==null&&x.comparisonDifference!==null);
 const positiveComparableRows=comparableRows.filter((x:any)=>x.comparisonDifference>0).sort((a:any,b:any)=>b.comparisonDifference-a.comparisonDifference);
 const topBenchmarkRow=positiveComparableRows[0]??[...comparableRows].sort((a:any,b:any)=>Math.abs(b.comparisonDifference)-Math.abs(a.comparisonDifference))[0]??null;
 const otherBenchmarkRows=topBenchmarkRow?comparableRows.filter((x:any)=>x.category!==topBenchmarkRow.category):comparableRows;
 return <>
 <style>{CSS}</style>
 {linePrompt&&<div className="rv3-line-modal-backdrop" role="presentation">
  <section className="rv3-line-modal" role="dialog" aria-modal="true" aria-labelledby="rv3-line-modal-title">
   <div className="rv3-kicker">LINE HANDOFF</div>
   <h2 id="rv3-line-modal-title">LINEへ診断を引き継ぐ</h2>
   <p>友だち追加後、このコードをトークで送ってください。今回の診断と照合できます。</p>
   <div className="rv3-handoff-code"><small>引き継ぎコード</small><strong>{handoffCode}</strong></div>
   <p className="rv3-handoff-note">コード自体には収入・支出額は含まれません。</p>
   <button className="rv3-primary" onClick={confirmLineHandoff}>コードをコピーしてLINEを開く ▶</button>
   <button className="rv3-restart" onClick={()=>{onEvent?.('line_handoff_dismissed',{placement:linePrompt});setLinePrompt(null)}}>あとで</button>
  </section>
 </div>}
 <main className="rv3"><div className="rv3-inner">
  <section className="rv3-clear">
   <img className="rv3-mudagiri rv3-mudagiri-clear" src={MUDAGIRI_RESULT_ART.clear} alt="" aria-hidden="true" decoding="async"/>
   <div className="rv3-kicker">MUDAGIRI QUEST CLEAR!</div>
   <h1>ムダギリ家計クエスト、完了！</h1>
   <p>金額だけでなく、「必要か」「満足しているか」まで含めて12項目を鑑定しました。</p>
   <div className="rv3-mudagiri-speech">ムダギリくん「おつかれ！ここから戦果を見ていくぞ。」</div>
  </section>

  <div className={`rv3-reveal ${revealed?'is-visible':''}`} aria-hidden={!revealed}>
  <section className="rv3-title rv3-type-card">
   <div className="rv3-kicker">MONEY TYPE UNLOCKED</div><div className="rv3-muted">あなたのお金の使い方は――</div>
   {typeArt(vm.type.code)&&<img className="rv3-type-art" src={typeArt(vm.type.code)} alt="" aria-hidden="true" decoding="async"/>}
   <h2>{vm.type.name}</h2>{vm.type.catchphrase&&<h3 className="rv3-catch">{vm.type.catchphrase}</h3>}{vm.type.description&&<p>{vm.type.description}</p>}
   {vm.type.axisStrength&&<div className="rv3-axes" aria-label="お金タイプ3軸">
    <TypeAxis label="時間軸" value={vm.type.axisStrength.fv} positive={(vm.type.axes?.fv??0)>=0} negativeText="今寄り" positiveText="未来寄り" middle={vm.type.nearMiddle?.fv}/>
    <TypeAxis label="決め方" value={vm.type.axisStrength.pi} positive={(vm.type.axes?.pi??0)>=0} negativeText="直感寄り" positiveText="計画寄り" middle={vm.type.nearMiddle?.pi}/>
    <TypeAxis label="把握" value={vm.type.axisStrength.au} positive={(vm.type.axes?.au??0)>=0} negativeText="必要時に確認" positiveText="普段から把握" middle={vm.type.nearMiddle?.au}/>
   </div>}
   <div className="rv3-type-notes">{vm.type.strengthLabel&&<div><small>強み</small><b>{vm.type.strengthLabel}</b></div>}{vm.type.blindSpot&&<div><small>死角</small><b>{vm.type.blindSpot}</b></div>}</div>
   <div className="rv3-type-stamp"><span>TYPE {vm.type.code}</span><span>{modeName[vm.toneMode]??vm.toneMode} MODE</span></div><small>8問から見えた、あなたのお金の使い方の傾向です</small>
  </section>

  <section className="rv3-social-share">
   <div className="rv3-mini-guide-row">
    <div><div className="rv3-kicker">SHARE YOUR TYPE</div><h3>このタイプ、友だちにも見せる？</h3><p>金額・収入・都道府県はシェア画像に入りません。</p></div>
    <img className="rv3-mudagiri rv3-mudagiri-cameo" src={MUDAGIRI_RESULT_ART.shareHint} alt="" aria-hidden="true" decoding="async"/>
   </div>
   <div className="rv3-social-grid">
    <button type="button" className="is-x" onClick={shareX}><b>𝕏</b><span>X</span></button>
    <button type="button" className="is-instagram" onClick={()=>nativeShare('instagram')}><b>◎</b><span>Instagram</span></button>
    <button type="button" className="is-threads" onClick={()=>nativeShare('threads')}><b>@</b><span>Threads</span></button>
    <button type="button" className="is-line" onClick={shareLineFriend}><b>LINE</b><span>友だちへ</span></button>
    <button type="button" className="is-more" onClick={()=>nativeShare('other')}><b>↗</b><span>その他</span></button>
   </div>
   <small>X・友だちLINEは投稿/送信画面へ。Instagram・Threadsはタイプ画像付きの共有メニューを開きます。</small>
  </section>

  <section className="rv3-benchmark">
   <div className="rv3-section-guide">
    <div><div className="rv3-kicker">HOUSEHOLD BENCHMARK</div><h3>{tone.gap}</h3></div>
    <img className="rv3-mudagiri rv3-mudagiri-small" src={MUDAGIRI_RESULT_ART.benchmark} alt="" aria-hidden="true" decoding="async"/>
   </div>
   <p className="rv3-muted">あなたの条件に合わせて、比較できる項目だけを比べています。比較単位が違う支出は合算しません。</p>

   <div className="rv3-scope-groups">
    {(vm.comparisonGroups??[]).map((g:any)=><div className="rv3-benchmark-hero" key={g.scopeLabel}>
     <small>{comparisonGroupLabel(g.scopeLabel)}・{g.categoryCount}項目</small>
     <strong>{signedYen(g.differenceMonthly)}<em>/月</em></strong>
     <div className="rv3-impact-grid">
      <div className="is-1y"><span>1年なら</span><b>{approxImpactYen(g.differenceMonthly*12)}</b></div>
      <div className="is-5y"><span>5年なら</span><b>{approxImpactYen(g.differenceMonthly*60)}</b></div>
      <div className="is-10y"><span>10年なら</span><b>{approxImpactYen(g.differenceMonthly*120)}</b></div>
     </div>
     <small>現在の基準差が同じまま続いた場合の単純累計。削減可能額ではありません。</small>
    </div>)}
   </div>

   {topBenchmarkRow&&<div className="rv3-top-gap">
    <div className="rv3-top-gap-head"><span>いちばん差が大きかった項目</span><b>{topBenchmarkRow.label}</b></div>
    <div className="rv3-top-gap-values">
     <div><small>{topBenchmarkRow.comparisonAmountLabel??'あなた'}</small><b>¥{yen(topBenchmarkRow.comparisonAmount??topBenchmarkRow.amount)}<em>/月</em></b></div>
     <div><small>基準</small><b>¥{yen(topBenchmarkRow.comparable)}<em>/月</em></b></div>
    </div>
    <div className="rv3-top-gap-diff"><span>基準との差</span><strong>{signedYen(topBenchmarkRow.comparisonDifference)}<em>/月</em></strong></div>
    <small>{topBenchmarkRow.comparisonContext?.criteria?.join(' × ')||topBenchmarkRow.comparator.label}</small>
    <p>この差をそのままムダとは判定していません。必要性や満足度を含めて、下の鑑定結果で判断しています。</p>
   </div>}

   {otherBenchmarkRows.length>0&&<details className="rv3-benchmark-details">
    <summary>ほかの比較項目も見る <strong>{otherBenchmarkRows.length}件</strong><span>⌄</span></summary>
    <div className="rv3-benchmark-list">{otherBenchmarkRows.map((x:any)=><div className="rv3-benchmark-row" key={`b-${x.category}`}>
     <div><b>{x.label}</b><small>{x.comparisonContext?.criteria?.join(' × ')||x.comparator.label}</small></div>
     <div className="rv3-benchmark-values"><span>{x.comparisonAmountLabel??'あなた'} ¥{yen(x.comparisonAmount??x.amount)}</span><span>基準 ¥{yen(x.comparable)}</span><strong>{signedYen(x.comparisonDifference)}</strong></div>
    </div>)}</div>
   </details>}

   <p className="rv3-benchmark-warning"><b>{tone.warning}</b><br/>これはあくまで基準との差。必要性や満足度も確認して、本当に見直せる金額は下で別に判定しています。</p>
   <div className={`rv3-confirmed-gap ${vm.improvement.monthly>0?'':'is-zero'}`}><small>{tone.confirmed}</small>{vm.improvement.monthly>0?<><strong>月 ¥{yen(vm.improvement.monthly)}</strong><span>年間 ¥{yen(vm.improvement.annual)}</span></>:<><strong>月 ¥0</strong><span>比較差だけを理由に、無理にムダ認定していません</span></>}</div>
  </section>

  {vm.bundledContribution&&<section className="rv3-bundled"><div className="rv3-kicker">LIVING COST BUNDLE</div><h3>{vm.bundledContribution.label}</h3><strong>月 ¥{yen(vm.bundledContribution.amount)}</strong><p>{vm.bundledContribution.note}</p></section>}

  <section className="rv3-verdict rv3-verdict-open">
   <div className="rv3-section-guide">
    <div><div className="rv3-kicker">HOUSEHOLD VERDICT</div><h3>{tone.verdict}</h3></div>
    <img className="rv3-mudagiri rv3-mudagiri-small" src={MUDAGIRI_RESULT_ART.verdict} alt="" aria-hidden="true" decoding="async"/>
   </div>
   <div className="rv3-verdict-grid">
    <div className="is-cut"><b>{vm.battleTargets.length}</b><span>⚔️ 削減確定</span></div>
    <div className="is-review"><b>{vm.encounterTargets.length}</b><span>🎯 優先チェック</span></div>
    <div className="is-protect"><b>{vm.counts.protect}</b><span>🛡️ 守る支出</span></div>
   </div>
   {vm.battleTargets.length===0&&vm.encounterTargets.length>0&&<p className="rv3-verdict-message">削減確定が0でも、見直し余地がないわけではありません。今回は<strong>{vm.encounterTargets.length}項目</strong>が「確認する価値あり」でした。</p>}
   <p className="rv3-note">高い支出＝ムダとは判定していません。必要性や満足度が確認できた支出は「守る支出」として扱います。</p>
  </section>



  <section className="rv3-next">
   <div className="rv3-mini-guide-row is-next">
    <div><div className="rv3-kicker">NEXT QUEST</div><h3>{vm.firstQuest?tone.next:'今の家計を維持するために。'}</h3></div>
    <img className="rv3-mudagiri rv3-mudagiri-cameo" src={MUDAGIRI_RESULT_ART.quest} alt="" aria-hidden="true" decoding="async"/>
   </div>
   {vm.firstQuest?<><div className="rv3-quest">{vm.firstQuest.status==='battle'?'⚔️':vm.firstQuest.encounterStrength==='strong'?'🎯':'🔍'} {vm.firstQuest.label}</div><p><b>{vm.firstQuest.nextCheck}</b></p>{vm.firstQuest.appraisalSummary&&<p className="rv3-next-answer">「{vm.firstQuest.appraisalSummary}」という回答をもとに選びました。</p>}<small>まずはこれだけでOK。ほかの項目は下で確認できます。</small></>:<p>現在の回答では、強く優先する見直し項目はありません。定期的に明細を確認して今の状態を維持しましょう。</p>}
  </section>

  <section className="rv3-consult-route">
   <div className="rv3-consult-head">
    <div><div className="rv3-kicker">PROFESSIONAL QUEST</div><h3>プロと整理するなら、どこから？</h3></div>
    <img className="rv3-mudagiri rv3-mudagiri-guide" src={MUDAGIRI_RESULT_ART.guide} alt="" aria-hidden="true" decoding="async"/>
   </div>
   <p>診断上のNEXT QUESTとは別に、家計をプロと深掘りする入口です。</p>

   <div className="rv3-consult-tabs" role="group" aria-label="相談テーマ">
    {(['insurance','lifeplan','investment'] as ConsultTopicV1[]).map(topic=>{
     const item=consultTopicCopyV1(topic);
     const recommended=topic===recommendedConsultTopic;
     return <button type="button" key={topic} className={(consultTopic===topic?'is-active ':'')+(recommended?'is-recommended':'')} onClick={()=>{setConsultTopic(topic);onEvent?.('consult_topic_selected',{topic,recommended})}}>
      {recommended&&<small>今回のおすすめ</small>}
      <b>{item.label}</b>
     </button>;
    })}
   </div>

   <div className="rv3-consult-copy">
    <small>{consultTopic===recommendedConsultTopic?'今回の診断からおすすめ':'選んだ相談テーマ'}</small>
    <b>{consultCopy.title}</b>
    <p>{consultCopy.body}</p>
   </div>

   {consultTopic==='insurance'&&vm.consultRoute?.insuranceReview&&<div className="rv3-consult-reason">
    <span>今回の診断では</span>
    <b>保険内容を一度確認する価値あり</b>
    <small>保険料の高さだけではなく、保障目的や見直し状況から案内しています。</small>
   </div>}
   {consultTopic==='insurance'&&!vm.consultRoute?.insuranceReview&&<div className="rv3-consult-reason is-neutral">
    <span>保険は最優先判定ではありません</span>
    <b>それでも保障内容だけ確認することはできます</b>
    <small>診断結果を曲げず、希望があれば整理する入口として表示しています。</small>
   </div>}

   {vm.consultRoute?.homeStructureRequired&&<div className="rv3-home-qualifier">
    <span>持ち家の方だけ、もう1つ</span>
    <b>今のお住まいは？</b>
    <div>
     <button type="button" className={homeStructure==='detached'?'is-active':''} onClick={()=>{setHomeStructure('detached');onEvent?.('consult_home_structure_selected',{value:'detached',primary:recommendedConsultTopic})}}>🏠 戸建て</button>
     <button type="button" className={homeStructure==='other'?'is-active':''} onClick={()=>{setHomeStructure('other');onEvent?.('consult_home_structure_selected',{value:'other',primary:recommendedConsultTopic})}}>🏢 マンション等</button>
    </div>
   </div>}
   {homeStructure==='detached'&&<div className="rv3-solar-route">
    <span>戸建てなら追加チェック</span>
    <b>太陽光・蓄電池も「入れる前提なし」で適性確認</b>
    <p>屋根条件・電気使用量・既存設備で向き不向きが変わるため、設置ありきではなく住宅固定費として確認します。</p>
   </div>}
   <button className="rv3-primary" onClick={()=>{onEvent?.('consult_route_clicked',{recommended:recommendedConsultTopic,selected:consultTopic,solarEligible:homeStructure==='detached'});lineHandoff('consult_route')}}>{consultCopy.button}</button>
   <small>{consultCopy.note}{homeStructure==='detached'?'　戸建ての住宅固定費チェックも一緒に引き継ぎます。':''}</small>
  </section>

  <section ref={earlyLineRef as any} className="rv3-line-early">
   <div className="rv3-mini-guide-row is-save">
    <div><div className="rv3-kicker">SAVE NEXT QUEST</div><h3>この結果、あとで見返せるようにする？</h3><p>{vm.firstQuest?<>まず確認する<strong>「{vm.firstQuest.label}」</strong>を含む今回の診断を、LINEで照合できる引き継ぎコードを発行できます。</>:<>今回の診断をLINEで照合できる引き継ぎコードを発行できます。</>}</p></div>
    <img className="rv3-mudagiri rv3-mudagiri-cameo" src={MUDAGIRI_RESULT_ART.save} alt="" aria-hidden="true" decoding="async"/>
   </div>
   <button className="rv3-primary" onClick={()=>lineHandoff('after_next_quest')}>無料でLINEへ引き継ぐ ▶</button>
   <small>✓ 無料　✓ 診断コードを発行　✓ 登録しただけで相談予約にはなりません</small>
  </section>

  <details className="rv3-section rv3-book-shell" onToggle={(e)=>{if((e.currentTarget as HTMLDetailsElement).open)onEvent?.('result_book_opened',{typeCode:vm.type.code})}}><summary><div><h3>📖 12カテゴリ鑑定図鑑</h3><p className="rv3-muted">気になる項目だけ詳しく確認</p></div><span>見る⌄</span></summary><div className="rv3-book">{vm.rows.map((x:any)=><div className="rv3-book-row" key={x.category}><button onClick={()=>setOpen(open===x.category?null:x.category)}><span>{mark[x.status]} <b>{x.label}</b></span><span className="rv3-muted">{x.status==='battle'?'削減確定':x.status==='protect'?'守る':x.status==='review'?'要確認':x.status==='safe'?'優先なし':'対象外'}　⌄</span></button>{open===x.category&&<div className="rv3-detail"><div><b>{x.diagnosisAmountLabel??'あなた'}：</b>{x.known?`¥${yen(x.amount)}/月`:'金額未把握'}</div>{x.householdTotal!==null&&x.householdTotal!==undefined&&x.householdTotal!==x.amount&&<div><b>家全体：</b>¥{yen(x.householdTotal)}/月</div>}{x.comparisonAmount!==null&&x.comparisonAmount!==undefined&&x.comparisonAmount!==x.amount&&x.comparisonAmount!==x.householdTotal&&<div><b>{x.comparisonAmountLabel??'比較対象'}：</b>¥{yen(x.comparisonAmount)}/月</div>}<div><b>{x.comparable!==null?'比較の目安':'判定の見方'}：</b>{x.evidenceLabel??x.comparator.label}{x.comparable!==null?` ¥${yen(x.comparable)}/月`:''}</div>{x.referenceDetail&&<div><b>料金の目安：</b>{x.referenceDetail}</div>}{x.comparisonContext?.criteria?.length>0&&<div><b>比較条件：</b>{x.comparisonContext.criteria.join(' × ')}</div>}{x.comparisonDifference!==null&&x.comparisonDifference>0&&<div><b>比較差：</b>+¥{yen(x.comparisonDifference)} <small>※ムダ額・削減可能額ではありません</small></div>}{x.reviewPotential?.available&&x.reviewPotential.delta>0&&<div className={`rv3-potential is-${x.reviewPotential.level}`}><b>{x.reviewPotential.label}</b><small>基準との差から見た「見直した場合の家計インパクト」。確定した削減額ではありません。</small></div>}{x.appraisalSummary&&<div><b>あなたの回答：</b>{x.appraisalSummary}</div>}<div><b>判定理由：</b>{x.reason}</div><div><b>次に確認：</b>{x.nextCheck}</div></div>}</div>)}</div></details>

  <section className="rv3-viral-loop">
   <div className="rv3-mini-guide-row is-friend">
    <div><div className="rv3-kicker">FRIEND QUEST</div><h3>友達は何タイプ？</h3><p>8タイプを見比べると、「あの人これっぽい」が見つかるかも。</p></div>
    <img className="rv3-mudagiri rv3-mudagiri-cameo" src={MUDAGIRI_RESULT_ART.friend} alt="" aria-hidden="true" decoding="async"/>
   </div>
   <details className="rv3-type-gallery">
    <summary>8タイプ全部を見る <span>⌄</span></summary>
    <div className="rv3-type-gallery-grid">
     {TYPE_ORDER_V31.map((code)=>{
      const item=(TYPE_CONTENT_V31 as Record<string,any>)[code];
      const mine=code===vm.type.code;
      return <div className={`rv3-mini-type ${mine?'is-mine':''}`} key={code}>
       <div className="rv3-mini-type-head">{mine&&<span>あなた</span>}<small>TYPE {code}</small></div>
       <img src={typeArt(code)} alt="" aria-hidden="true" decoding="async"/>
       <b>{item.name}</b>
       <p>{item.catchphrase}</p>
      </div>;
     })}
    </div>
   </details>
   <button type="button" className="rv3-friend-invite" onClick={()=>nativeShare('challenge')}>友達にも診断させる ▶</button>
   <small>診断リンクとあなたのタイプカードを共有します。金額は共有されません。</small>
  </section>


  <section ref={bottomLineRef as any} className="rv3-next rv3-save"><div className="rv3-kicker">SAVE YOUR QUEST</div><h3>{tone.save}</h3><p>このページを閉じても困らないように、LINEで<strong>今回の診断結果と「次にやる1つ」</strong>を照合できる引き継ぎコードを発行します。</p><div className="rv3-save-preview"><span>LINEへ引き継げる診断情報</span><b>🏷️ {vm.type.name}の診断結果</b><b>🎯 {vm.firstQuest ? "まず確認する「"+vm.firstQuest.label+"」" : "今の家計を維持するチェックポイント"}</b><b>🗺️ 12カテゴリの判定を照合する診断ID</b><small>必要なら、その後に家計の見直し相談へ進めます。まずは診断の引き継ぎだけでOKです。</small></div><button className="rv3-primary" onClick={()=>lineHandoff('result_bottom')}>LINEへ診断を引き継ぐ ▶</button><small>✓ 無料　✓ あとで見返せる　✓ 登録しただけで相談予約にはなりません</small><button className="rv3-restart" onClick={onRestart}>診断をやり直す</button></section>
  </div></div></main></>
}
const CSS=`
.rv3-line-modal-backdrop{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(2,7,12,.82);backdrop-filter:blur(4px)}.rv3-line-modal{width:min(100%,390px);padding:22px 18px 18px;border:1px solid rgba(245,204,57,.65);border-radius:16px;background:#0b141e;color:#fff;box-shadow:0 24px 70px rgba(0,0,0,.55);font-family:ui-sans-serif,system-ui,-apple-system,"Noto Sans JP",sans-serif}.rv3-line-modal h2{margin:8px 0 0;font-size:22px;line-height:1.35}.rv3-line-modal p{margin:10px 0 0;color:#b7c1cb;font-size:13px;line-height:1.7}.rv3-handoff-code{margin-top:16px;padding:14px;border:1px solid #344454;border-radius:12px;background:#07111b;text-align:center}.rv3-handoff-code small{display:block;color:#87929d;font-size:10px;font-weight:900;letter-spacing:.08em}.rv3-handoff-code strong{display:block;margin-top:5px;color:#f5cc39;font-size:24px;letter-spacing:.08em}.rv3-line-modal .rv3-primary{min-height:56px}.rv3-line-modal .rv3-restart{min-height:48px}.rv3-handoff-note{text-align:center;font-size:10px!important;color:#87929d!important}
.rv3{min-height:100svh;min-height:100dvh;background:#070d14;color:#fff;overflow-x:hidden;font-family:ui-sans-serif,system-ui,-apple-system,"Noto Sans JP",sans-serif}.rv3 *{box-sizing:border-box}.rv3 button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}.rv3 button:active{transform:translateY(1px) scale(.995)}.rv3-inner{width:min(100%,430px);margin:0 auto;padding-bottom:max(72px,env(safe-area-inset-bottom))}
.rv3 section{padding:24px 20px}.rv3-clear{min-height:220px;display:grid;align-content:center;text-align:center}.rv3-clear h1{margin:18px 0 0;font-size:28px;line-height:1.25}.rv3-clear p{margin:10px 0 0;color:#aeb8c2;font-size:13px;line-height:1.6}.rv3-kicker{color:#f5cc39;font-size:12px;font-weight:1000;letter-spacing:.15em}.rv3-count{display:flex;justify-content:center;gap:8px;margin-top:18px;font-size:11px}.rv3-count span{padding:7px 9px;border:1px solid #293644;border-radius:999px;background:#0d1721}.rv3-count b{font-size:13px}
.rv3-reveal{opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .35s ease,transform .35s ease}.rv3-reveal.is-visible{opacity:1;transform:none;pointer-events:auto}
.rv3-bundled{border-top:1px solid #17212b;background:#0d1721}.rv3-bundled h3{margin:8px 0}.rv3-bundled strong{display:block;color:#f5cc39;font-size:28px}.rv3-bundled p{margin:8px 0 0;color:#aeb8c2;font-size:12px;line-height:1.6}.rv3-title{border-block:1px solid #24303c;text-align:center}.rv3-title h2{margin:9px 0 4px;color:#f5cc39;font-size:30px;line-height:1.15}.rv3-title p,.rv3-card p{font-size:13px;line-height:1.65;color:#c7d0d9}.rv3-catch{margin:8px 0 0;font-size:15px}.rv3-axes{display:grid;gap:10px;margin:20px 0 12px;padding:14px;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-axis>div:first-child{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:#87929d}.rv3-axis b{color:#dce4eb;font-size:12px;text-align:right}.rv3-axis-track{position:relative;height:6px;margin-top:6px;border-radius:999px;background:#24303c}.rv3-axis-track i{position:absolute;top:50%;width:12px;height:12px;border:2px solid #07111b;border-radius:50%;background:#f5cc39;transform:translate(-50%,-50%)}.rv3-type-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;text-align:left}.rv3-type-notes>div:first-child{border-color:rgba(245,204,57,.58)!important;background:rgba(245,204,57,.06)!important}.rv3-type-notes>div:first-child small{color:#f5cc39}.rv3-type-notes>div:first-child b{font-size:13px!important}.rv3-type-notes>div{padding:10px;border:1px solid #293644;border-radius:9px;background:#0d1721}.rv3-type-notes small{margin:0}.rv3-type-notes b{display:block;margin-top:3px;font-size:11px;line-height:1.45}.rv3 small{display:block;margin-top:8px;color:#87929d;font-size:11px;line-height:1.6}.rv3-mode{margin-top:8px;color:#9da8b3;font-size:12px}
.rv3-primary{width:100%;min-height:56px;margin-top:20px;border:1px solid #fff;border-radius:12px;background:#f5cc39;color:#07111b;font-weight:1000;font-size:15px;box-shadow:0 7px 0 #9d7e0e}.rv3-primary:active{transform:translateY(3px);box-shadow:0 4px 0 #9d7e0e}.rv3-restart{display:block;min-height:48px;margin:22px auto 0;padding:8px 12px;border:0;background:transparent;color:#87929d;text-decoration:underline;font-size:12px}
.rv3-consult-route{margin:14px 14px 0;padding:20px 18px!important;border:1px solid rgba(245,204,57,.58);border-radius:16px;background:linear-gradient(180deg,#111c27,#0b141d);box-shadow:0 14px 30px rgba(0,0,0,.22)}.rv3-consult-route h3{margin:8px 0 0;font-size:20px;line-height:1.4}.rv3-consult-route>p{margin:8px 0 0;color:#b8c2cc;font-size:12px;line-height:1.7}.rv3-consult-reason{margin-top:14px;padding:12px;border:1px solid #314151;border-radius:11px;background:#0a131c}.rv3-consult-reason span,.rv3-consult-reason b,.rv3-consult-reason small{display:block}.rv3-consult-reason span{color:#87929d;font-size:9px;font-weight:900}.rv3-consult-reason b{margin-top:4px;color:#fff;font-size:14px;line-height:1.45}.rv3-consult-reason small{margin-top:5px!important}.rv3-home-qualifier{margin-top:14px;padding-top:12px;border-top:1px solid #293644}.rv3-home-qualifier>span,.rv3-home-qualifier>b{display:block}.rv3-home-qualifier>span{color:#87929d;font-size:9px;font-weight:900}.rv3-home-qualifier>b{margin-top:4px;font-size:14px}.rv3-home-qualifier>div{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}.rv3-home-qualifier button{min-height:48px;border:1px solid #344454;border-radius:10px;background:#0a131c;color:#fff;font-size:12px;font-weight:900}.rv3-home-qualifier button.is-active{border-color:#f5cc39;background:rgba(245,204,57,.09);color:#f5cc39}.rv3-solar-route{margin-top:12px;padding:12px;border:1px solid rgba(61,214,91,.42);border-radius:11px;background:rgba(61,214,91,.05)}.rv3-solar-route span,.rv3-solar-route b{display:block}.rv3-solar-route span{color:#72df88;font-size:9px;font-weight:1000}.rv3-solar-route b{margin-top:4px;font-size:13px;line-height:1.45}.rv3-solar-route p{margin:6px 0 0;color:#9fb1a5;font-size:10px;line-height:1.55}
.rv3-viral-loop{margin:0 12px 18px;padding:18px 16px!important;border:1px solid rgba(245,204,57,.34);border-radius:16px;background:linear-gradient(180deg,#0d1823,#09121b)}.rv3-viral-loop h3{margin:7px 0 0;font-size:20px}.rv3-viral-loop>p{margin:7px 0 0;color:#aeb8c2;font-size:12px;line-height:1.65}.rv3-type-gallery{margin-top:14px}.rv3-type-gallery>summary{min-height:52px!important;padding:0 14px;border:1px solid #344454;border-radius:11px;background:#101c27;font-size:15px;font-weight:1000;cursor:pointer;list-style:none}.rv3-type-gallery>summary::-webkit-details-marker{display:none}.rv3-type-gallery>summary span{margin-left:auto;color:#f5cc39}.rv3-type-gallery-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.rv3-mini-type{position:relative;min-width:0;padding:10px;border:1px solid #293644;border-radius:12px;background:#0b141d;text-align:center}.rv3-mini-type.is-mine{border-color:#f5cc39;box-shadow:inset 0 0 0 1px rgba(245,204,57,.32)}.rv3-mini-type-head{display:flex;align-items:center;justify-content:space-between;min-height:18px}.rv3-mini-type-head span{padding:2px 5px;border-radius:999px;background:#f5cc39;color:#07111b;font-size:8px;font-weight:1000}.rv3-mini-type-head small{margin:0 0 0 auto!important;font-size:8px!important}.rv3-mini-type img{display:block;width:74px;height:74px;margin:5px auto 2px;object-fit:contain;image-rendering:pixelated}.rv3-mini-type>b{display:block;font-size:11px;line-height:1.35}.rv3-mini-type p{margin:4px 0 0;color:#87929d;font-size:8px;line-height:1.4}.rv3-friend-invite{width:100%;min-height:54px;margin-top:14px;border:1px solid #fff;border-radius:11px;background:#fff;color:#07111b;font-size:14px;font-weight:1000}
.rv3-social-share{margin:0 12px 14px;padding:18px 16px!important;border:1px solid #293644;border-radius:16px;background:#0b141d}.rv3-social-share h3{margin:7px 0 0;font-size:18px}.rv3-social-share p{margin:7px 0 0;color:#9da8b3;font-size:11px;line-height:1.6}.rv3-social-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:14px}.rv3-social-grid button{min-width:0;min-height:64px;padding:7px 3px;border:1px solid #334252;border-radius:11px;background:#101c27;color:#fff;font-weight:900}.rv3-social-grid button b,.rv3-social-grid button span{display:block}.rv3-social-grid button b{font-size:16px}.rv3-social-grid button span{margin-top:4px;font-size:9px;line-height:1.1}.rv3-social-grid .is-line{border-color:rgba(61,214,91,.55)}.rv3-social-grid .is-x{border-color:#596775}.rv3-social-grid .is-instagram,.rv3-social-grid .is-threads{border-color:rgba(245,204,57,.38)}
.rv3-benchmark{border-top:1px solid #17212b}.rv3-benchmark h3{margin:8px 0 0;font-size:22px}.rv3-benchmark-hero{margin:16px 0;padding:18px 14px;border:1px solid rgba(245,204,57,.5);border-radius:14px;text-align:center;background:#101c27}.rv3-benchmark-hero strong{display:block;margin:5px 0;color:#f5cc39;font-size:34px;line-height:1}.rv3-benchmark-hero strong em{font-size:12px;font-style:normal}.rv3-benchmark-hero span,.rv3-benchmark-hero small{display:block}.rv3-scope-groups{display:grid;gap:8px}.rv3-scope-groups .rv3-benchmark-hero{margin:8px 0}.rv3-impact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:14px}.rv3-impact-grid>div{padding:9px 4px;border:1px solid #2a3946;border-radius:9px;background:#0b151f}.rv3-impact-grid span,.rv3-impact-grid b{display:block}.rv3-impact-grid span{color:#87929d;font-size:9px}.rv3-impact-grid b{margin-top:3px;color:#fff;font-size:13px}
.rv3-benchmark-hero span{font-size:13px}.rv3-benchmark-hero small{margin-top:6px;color:#9da8b3;font-size:10px;line-height:1.5}.rv3-benchmark-details{margin:12px 0}.rv3-top-gap{margin:18px 0 14px;padding:16px;border:1px solid rgba(245,204,57,.48);border-radius:14px;background:#0d1721}.rv3-top-gap-head span{display:block;color:#87929d;font-size:10px;font-weight:900}.rv3-top-gap-head b{display:block;margin-top:4px;font-size:20px}.rv3-top-gap-values{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.rv3-top-gap-values>div{padding:10px;border:1px solid #2c3946;border-radius:10px;background:#09131d}.rv3-top-gap-values small{margin:0}.rv3-top-gap-values b{display:block;margin-top:3px;font-size:16px}.rv3-top-gap-values em,.rv3-top-gap-diff em{font-size:10px;font-style:normal}.rv3-top-gap-diff{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-top:10px;padding:10px 0;border-top:1px solid #293644}.rv3-top-gap-diff span{font-size:11px;color:#aeb8c2}.rv3-top-gap-diff strong{color:#f5cc39;font-size:22px}.rv3-top-gap p{margin:10px 0 0;color:#9da8b3;font-size:11px;line-height:1.65}
.rv3-benchmark-details>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;padding:14px 15px;border:1px solid #2a3946;border-radius:12px;background:#0d1721;font-weight:900;font-size:17px}.rv3-benchmark-details>summary::-webkit-details-marker{display:none}.rv3-benchmark-details>summary strong{margin-left:auto;color:#f5cc39;font-size:13px}.rv3-benchmark-details>summary span{color:#f5cc39}.rv3-benchmark-details[open]>summary{border-radius:12px 12px 0 0}.rv3-benchmark-list{margin-top:10px;border-top:1px solid #293644}.rv3-benchmark-row{display:grid;grid-template-columns:1fr auto;gap:12px;padding:13px 0;border-bottom:1px solid #293644}.rv3-benchmark-row b{font-size:13px}.rv3-benchmark-row small{margin-top:3px}.rv3-benchmark-values{display:grid;text-align:right;font-size:10px;color:#9da8b3}.rv3-benchmark-values strong{margin-top:3px;color:#f5cc39;font-size:16px}.rv3-benchmark-warning{margin-top:16px;padding:12px;border:1px solid #344454;border-radius:10px;background:#101c27;color:#aeb8c2;font-size:11px;line-height:1.7}.rv3-benchmark-warning b{color:#fff}.rv3-confirmed-gap{margin-top:14px;padding:14px;border:1px solid rgba(245,204,57,.45);border-radius:12px;text-align:center}.rv3-confirmed-gap strong,.rv3-confirmed-gap span{display:block}.rv3-confirmed-gap strong{margin-top:4px;color:#f5cc39;font-size:26px}.rv3-confirmed-gap span{margin-top:3px;font-size:12px}.rv3-verdict{border-top:1px solid #17212b;text-align:center}.rv3-verdict h3{margin:8px 0 0;font-size:22px}.rv3-verdict-details>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px}.rv3-verdict-details>summary::-webkit-details-marker{display:none}.rv3-verdict-details>summary>span{font-size:11px;color:#f5cc39;white-space:nowrap}.rv3-verdict-details>summary h3{margin-bottom:0}.rv3-verdict-details[open]>summary{margin-bottom:14px}.rv3-verdict-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:18px}.rv3-verdict-grid>div{padding:14px 4px;border:1px solid #293644;border-radius:10px;background:#0d1721}.rv3-verdict-grid b{display:block;font-size:26px;color:#f5cc39}.rv3-verdict-grid span{display:block;margin-top:4px;font-size:10px;color:#c7d0d9}.rv3-reward{text-align:center}.rv3-money{margin-top:10px;font-size:46px;font-weight:1000;line-height:1}.rv3-grid{display:grid;grid-template-columns:1fr 1fr;margin-top:22px;padding:14px 0;border-block:1px solid #24303c}.rv3-grid>div+div{border-left:1px solid #24303c}.rv3-note{color:#87929d;font-size:11px;line-height:1.7}
.rv3-section{border-top:1px solid #17212b}.rv3-section h3,.rv3-message h3,.rv3-next h3{margin:0;font-size:20px}.rv3-card{margin-top:14px;padding:15px;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-row{display:flex;justify-content:space-between;gap:12px}.rv3-diff{margin-top:8px;padding:8px 10px;border:1px solid #344454;border-radius:8px;background:#101c27;font-size:12px;font-weight:900}.rv3-diff small{margin-top:2px}.rv3-answer{margin-top:9px;padding:9px 10px;border-left:3px solid #f5cc39;background:#111e2b;color:#dce4eb;font-size:12px;line-height:1.55}.rv3-muted{color:#87929d;font-size:12px;line-height:1.6}
.rv3-book-shell>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px}.rv3-book-shell>summary::-webkit-details-marker{display:none}.rv3-book-shell>summary h3{margin:0}.rv3-book-shell>summary p{margin:4px 0 0}.rv3-book-shell>summary>span{font-size:11px;color:#f5cc39;white-space:nowrap}.rv3-book-shell[open]>summary{margin-bottom:14px}.rv3-book{margin-top:14px;border-top:1px solid #293644}.rv3-book-row{border-bottom:1px solid #293644}.rv3-book-row>button{display:flex;width:100%;min-height:58px;align-items:center;justify-content:space-between;gap:12px;padding:0;border:0;background:transparent;color:#fff;text-align:left;touch-action:manipulation}.rv3-potential{margin-top:8px;padding:9px 10px;border:1px solid #2d3a47;border-radius:10px;background:#0b151f;display:grid;gap:3px}.rv3-potential b{font-size:12px}.rv3-potential small{font-size:10px;line-height:1.45;color:#9eabb7}.rv3-potential.is-high b{color:#f5cc39}.rv3-potential.is-medium b{color:#d9e1e8}
.rv3-detail{padding:0 0 15px;color:#aeb8c2;font-size:12px;line-height:1.7}
.rv3-message{margin:8px 20px 28px;padding:18px!important;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-explain{margin-top:10px;padding:10px;border-radius:9px;background:#111e2b;font-size:12px}.rv3-explain b{margin-left:4px}.rv3-explain span{display:block;margin-top:4px;color:#9eabb7;line-height:1.5}.rv3-message p,.rv3-next p{color:#aeb8c2;font-size:13px;line-height:1.7}
.rv3-next{margin:0 20px;padding:20px!important;border:2px solid #f5cc39;border-radius:14px;background:#0b141e}.rv3-quest{margin-top:10px;padding:15px;background:#111e2b;font-weight:1000}.rv3-next-answer{padding:9px 10px;border-left:3px solid #f5cc39;background:#111e2b;font-size:12px!important}
.rv3-line-early{margin:14px 20px 0;padding:18px 18px 20px!important;border:1px solid rgba(245,204,57,.55);border-radius:14px;background:linear-gradient(180deg,#111d28,#0b141d);box-shadow:0 12px 28px rgba(0,0,0,.2)}.rv3-line-early h3{margin:7px 0 0;font-size:18px;line-height:1.4}.rv3-line-early p{margin:8px 0 0;color:#aeb8c2;font-size:12px;line-height:1.7}.rv3-line-early p strong{color:#fff}.rv3-line-early .rv3-primary{margin-top:14px}.rv3-line-early>small{text-align:center}

@media(max-width:390px){.rv3-inner{width:100%}.rv3 section{padding-left:16px;padding-right:16px}.rv3-type-card{margin-left:10px;margin-right:10px;padding-left:14px!important;padding-right:14px!important}.rv3-next{margin-left:14px;margin-right:14px;padding:18px!important}.rv3-line-early{margin-left:14px;margin-right:14px;padding:16px!important}.rv3-early-share{padding-left:16px!important;padding-right:16px!important}.rv3-early-share b{font-size:12px}.rv3-early-share button{padding:0 12px;font-size:12px}.rv3-type-notes{grid-template-columns:1fr}.rv3-social-grid{gap:5px}.rv3-social-grid button{min-height:60px}.rv3-impact-grid b{font-size:11px}.rv3-benchmark-row{gap:8px}.rv3-benchmark-values{font-size:9px}}
@media(max-height:700px){.rv3 section{padding-top:22px;padding-bottom:22px}.rv3-clear{min-height:190px}.rv3-clear h1{font-size:24px}.rv3-title h2{font-size:27px}.rv3-money{font-size:40px}.rv3-type-art{width:112px;height:112px;margin-top:8px}}

/* Result polish V3: reward light, Mudagiri guide roles, readable long-horizon impact */
.rv3{background:
 radial-gradient(circle at 50% 0,rgba(35,73,103,.42) 0,rgba(10,24,36,.16) 32%,transparent 55%),
 linear-gradient(180deg,#0a1722 0%,#07111a 46%,#060c12 100%)}
.rv3-clear{position:relative;min-height:300px;padding-top:28px!important;overflow:hidden;background:linear-gradient(180deg,rgba(29,57,79,.76),rgba(10,23,34,.35) 72%,transparent)}
.rv3-clear:before{content:"";position:absolute;inset:-80px -30px auto;height:250px;background:radial-gradient(circle,rgba(245,204,57,.16),transparent 66%);pointer-events:none}
.rv3-clear h1{position:relative;margin:8px 0 0;font-size:30px}
.rv3-clear p{position:relative}
.rv3-mudagiri{display:block;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 10px 18px rgba(0,0,0,.28))}
.rv3-mudagiri-clear{position:relative;width:112px;height:112px;margin:0 auto 8px}
.rv3-mudagiri-small{width:76px;height:76px;flex:0 0 76px}
.rv3-mudagiri-guide{width:88px;height:88px;flex:0 0 88px}
.rv3-mudagiri-speech{position:relative;width:max-content;max-width:92%;margin:14px auto 0;padding:8px 11px;border:1px solid rgba(245,204,57,.38);border-radius:10px;background:rgba(9,20,29,.78);color:#d9e1e8;font-size:11px;font-weight:800}
.rv3-section-guide,.rv3-consult-head{display:flex;align-items:center;justify-content:space-between;gap:14px}
.rv3-section-guide>div,.rv3-consult-head>div{min-width:0;flex:1}
.rv3-benchmark{background:linear-gradient(180deg,rgba(18,37,53,.55),rgba(7,17,26,0))}
.rv3-benchmark-hero{background:linear-gradient(180deg,#142536,#0d1b28)!important;box-shadow:0 10px 24px rgba(0,0,0,.16)}
.rv3-impact-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}
.rv3-impact-grid>div{padding:12px 6px!important;background:#0b1722!important}
.rv3-impact-grid span{font-size:10px!important;font-weight:900;letter-spacing:.03em}
.rv3-impact-grid b{margin-top:5px!important;font-size:19px!important;line-height:1.15}
.rv3-impact-grid .is-10y{grid-column:1/-1;padding:15px 8px!important;border-color:rgba(245,204,57,.62)!important;background:linear-gradient(180deg,rgba(245,204,57,.10),#0c1823)!important}
.rv3-impact-grid .is-10y span{color:#f5cc39!important;font-size:11px!important}
.rv3-impact-grid .is-10y b{color:#f5cc39!important;font-size:clamp(30px,8vw,36px)!important;letter-spacing:-.02em}
.rv3-verdict-open{background:linear-gradient(180deg,rgba(15,31,45,.72),rgba(8,18,27,.35))}
.rv3-verdict-open .rv3-verdict-grid{margin-top:12px}
.rv3-verdict-grid>div{padding:15px 3px!important;background:#0d1a26!important}
.rv3-verdict-grid .is-cut{border-color:rgba(238,113,75,.45)}
.rv3-verdict-grid .is-review{border-color:rgba(245,204,57,.58)}
.rv3-verdict-grid .is-protect{border-color:rgba(73,190,177,.42)}
.rv3-verdict-grid .is-cut b{color:#ef8b68}
.rv3-verdict-grid .is-review b{color:#f5cc39}
.rv3-verdict-grid .is-protect b{color:#68cfc2}
.rv3-verdict-message{margin:12px 0 0;padding:10px 12px;border:1px solid rgba(245,204,57,.34);border-radius:10px;background:rgba(245,204,57,.055);color:#cbd4dc;font-size:11px;line-height:1.65}
.rv3-verdict-message strong{color:#f5cc39}
.rv3-consult-route{background:linear-gradient(180deg,#15283a,#0c1925)!important}
.rv3-consult-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:14px}
.rv3-consult-tabs button{position:relative;min-width:0;min-height:58px;padding:13px 5px 7px;border:1px solid #405164;border-radius:10px;background:#0a151f;color:#d9e2e9;font-size:11px;font-weight:1000}
.rv3-consult-tabs button b{display:block;line-height:1.25}
.rv3-consult-tabs button small{position:absolute;top:-8px;left:50%;width:max-content;margin:0!important;padding:2px 5px;border-radius:999px;background:#f5cc39;color:#07111b;font-size:7px;transform:translateX(-50%)}
.rv3-consult-tabs button.is-active{border-color:#f5cc39;background:rgba(245,204,57,.09);color:#f5cc39}
.rv3-consult-tabs button.is-recommended:not(.is-active){border-color:rgba(245,204,57,.42)}
.rv3-consult-copy{margin-top:11px;padding:12px;border:1px solid #334557;border-radius:11px;background:#0b1722}
.rv3-consult-copy>small,.rv3-consult-copy>b{display:block}
.rv3-consult-copy>small{margin:0!important;color:#f5cc39!important;font-size:8px!important;font-weight:1000}
.rv3-consult-copy>b{margin-top:4px;font-size:14px;line-height:1.45}
.rv3-consult-copy>p{margin:6px 0 0;color:#aebbc6;font-size:11px;line-height:1.6}
.rv3-consult-reason.is-neutral{border-style:dashed;background:rgba(255,255,255,.015)}

@media(max-width:390px){
 .rv3-impact-grid b{font-size:18px!important}
 .rv3-impact-grid .is-10y b{font-size:32px!important}
 .rv3-consult-tabs{gap:5px}
 .rv3-consult-tabs button{font-size:10px;padding-left:3px;padding-right:3px}
 .rv3-mudagiri-small{width:68px;height:68px;flex-basis:68px}
 .rv3-mudagiri-guide{width:76px;height:76px;flex-basis:76px}
}
@media(prefers-reduced-motion:reduce){.rv3-primary,.rv3-reveal{transition:none}}
.rv3 details>summary{min-height:48px;display:flex;align-items:center;touch-action:manipulation}

.rv3-verdict-saving{margin:16px auto 0;padding:14px;border:1px solid rgba(245,204,57,.45);border-radius:12px;background:#0d1721;text-align:center}.rv3-verdict-saving small,.rv3-verdict-saving span{display:block;color:#aeb8c2}.rv3-verdict-saving strong{display:block;margin:4px 0;color:#f5cc39;font-size:24px}.rv3-verdict-saving.is-safe strong{color:#dce4eb;font-size:19px}
.rv3-early-share{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px!important;border-bottom:1px solid #24303c;background:#0b141d}.rv3-early-share>div{min-width:0;text-align:left}.rv3-early-share b,.rv3-early-share small{display:block}.rv3-early-share b{margin-top:4px;font-size:13px}.rv3-early-share small{margin-top:3px;color:#87929d;font-size:10px}.rv3-early-share button{flex:0 0 auto;min-height:48px;padding:0 16px;border:0;border-radius:10px;background:#f5cc39;color:#07111b;font-weight:1000;touch-action:manipulation}

.rv3-type-card{position:relative;margin:0 12px 14px;padding:26px 16px!important;border:1px solid rgba(245,204,57,.48)!important;border-radius:18px;background:linear-gradient(180deg,#101b26 0%,#0a121b 100%);box-shadow:0 14px 34px rgba(0,0,0,.28)}.rv3-type-card:before{content:"TYPE UNLOCKED";position:absolute;top:10px;right:12px;color:rgba(245,204,57,.35);font-size:9px;font-weight:1000;letter-spacing:.12em}.rv3-type-card h2{font-size:clamp(30px,8.3vw,36px)!important;text-wrap:balance}.rv3-type-art{display:block;width:clamp(132px,38vw,156px);height:clamp(132px,38vw,156px);margin:10px auto 4px;object-fit:contain;image-rendering:pixelated}.rv3-type-card .rv3-catch{font-size:16px;line-height:1.45;color:#fff}.rv3-type-stamp{display:flex;justify-content:center;gap:7px;margin-top:12px}.rv3-type-stamp span{padding:5px 8px;border:1px solid #344454;border-radius:999px;color:#9da8b3;font-size:9px;font-weight:900;letter-spacing:.08em}

.rv3-save{margin-top:26px!important;background:linear-gradient(180deg,#101b25,#0b141e)!important}.rv3-save p strong{color:#fff}.rv3-save-preview{display:grid;gap:7px;margin-top:14px;padding:13px;border:1px solid #344454;border-radius:11px;background:#08111a;text-align:left}.rv3-save-preview span{color:#87929d;font-size:10px;font-weight:900;letter-spacing:.08em}.rv3-save-preview b{font-size:12px;line-height:1.4}
`;
// deploy-sync: human-readable diagnosis details

