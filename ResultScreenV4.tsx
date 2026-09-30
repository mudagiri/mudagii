import React,{useEffect,useState} from 'react';

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
function typeArt(code:string){return TYPE_ART_V31[code]??'';}
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
async function makeTypeShareFile(vm:any){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const x=canvas.getContext('2d');if(!x)return null;
 x.fillStyle='#07111b';x.fillRect(0,0,1080,1350);x.strokeStyle='#f5cc39';x.lineWidth=8;x.strokeRect(44,44,992,1262);
 x.textAlign='center';x.fillStyle='#f5cc39';x.font='900 34px system-ui,sans-serif';x.fillText('ムダギリ診断',540,150);
 x.fillStyle='#87929d';x.font='800 26px system-ui,sans-serif';x.fillText('MY MONEY TYPE',540,225);
 const art=await loadCanvasImage(typeArt(vm.type.code));if(art){const maxW=330,maxH=300,scale=Math.min(maxW/art.naturalWidth,maxH/art.naturalHeight);const w=art.naturalWidth*scale,h=art.naturalHeight*scale;x.imageSmoothingEnabled=false;x.drawImage(art,(1080-w)/2,255-h/2,w,h)}
 x.fillStyle='#fff';x.font='900 62px system-ui,sans-serif';const nameLines=drawCenteredWrapped(x,vm.type.name,540,455,900,72,2);
 x.fillStyle='#f5cc39';x.font='900 31px system-ui,sans-serif';drawCenteredWrapped(x,vm.type.catchphrase??'',540,nameLines>1?600:545,860,42,2);
 const rows=[['時間軸',axisTendency(vm,'fv')],['決め方',axisTendency(vm,'pi')],['把握',axisTendency(vm,'au')]];
 rows.forEach((r,i)=>{const y=680+i*105;x.fillStyle='#0d1721';x.fillRect(150,y-55,780,88);x.textAlign='left';x.fillStyle='#87929d';x.font='800 24px system-ui,sans-serif';x.fillText(r[0],190,y);x.textAlign='right';x.fillStyle='#fff';x.font='900 31px system-ui,sans-serif';x.fillText(r[1],890,y);});
 x.textAlign='center';x.fillStyle='#87929d';x.font='800 23px system-ui,sans-serif';x.fillText('強み',300,1025);x.fillStyle='#fff';x.font='900 25px system-ui,sans-serif';drawCenteredWrapped(x,vm.type.strengthLabel??'',300,1065,360,32,2);x.fillStyle='#87929d';x.font='800 23px system-ui,sans-serif';x.fillText('死角',780,1025);x.fillStyle='#fff';x.font='900 25px system-ui,sans-serif';drawCenteredWrapped(x,vm.type.blindSpot??'',780,1065,360,32,2);x.fillStyle='#fff';x.font='900 30px system-ui,sans-serif';x.fillText('あなたは何タイプ？',540,1175);x.fillStyle='#f5cc39';x.font='900 28px system-ui,sans-serif';x.fillText('#ムダギリ診断',540,1223);
 x.fillStyle='#87929d';x.font='700 20px system-ui,sans-serif';x.fillText('収入・支出金額は画像に含まれません',540,1270);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));return blob?new File([blob],`mudagiri-${vm.type.code}.png`,{type:'image/png'}):null;
}

export default function ResultScreenV4({vm,onLine,onEvent,onRestart,onBeforeExternal}:{vm:any;onLine?:(x:any)=>void;onEvent?:(n:string,p?:any)=>void;onRestart?:()=>void;onBeforeExternal?:()=>void}){
 const [open,setOpen]=useState<string|null>(null);
 const tone=resultTone(vm.toneMode);
 const [revealed,setRevealed]=useState(false);
 useEffect(()=>{
   onEvent?.('result_viewed',{version:vm.version,typeCode:vm.type.code});
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   const id=window.setTimeout(()=>setRevealed(true),reduced?0:180);
   return()=>window.clearTimeout(id);
 },[]);
 async function share(){
  onBeforeExternal?.();
  const hook=vm.type.shareHook??vm.type.catchphrase??vm.type.description??'';
  const shareUrl=new URL(window.location.origin+window.location.pathname);shareUrl.searchParams.set('ref','share');shareUrl.searchParams.set('type',vm.type.code);
  const text=`${hook}\n\nムダギリ診断 →「${vm.type.name}」\n${vm.type.catchphrase??''}\n\nあなたは何タイプ？\n${shareUrl.toString()}\n#ムダギリ診断`;
  onEvent?.('share_clicked',{typeCode:vm.type.code});
  try{
   const file=await makeTypeShareFile(vm);
   if(file&&navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'ムダギリ診断',text,files:[file]});onEvent?.('share_completed',{typeCode:vm.type.code,format:'image'});return}
   if(navigator.share){await navigator.share({title:'ムダギリ診断',text});onEvent?.('share_completed',{typeCode:vm.type.code,format:'text'});return}
  }catch(err){
   if(err instanceof DOMException&&err.name==='AbortError')return;
  }
  try{await navigator.clipboard?.writeText(text);onEvent?.('share_completed',{typeCode:vm.type.code,fallback:'clipboard'})}catch{}
 }
 return <>
 <style>{CSS}</style>
 <main className="rv3"><div className="rv3-inner">
  <section className="rv3-clear"><div className="rv3-kicker">QUEST CLEAR!</div><h1>家計クエスト完了</h1><p>12項目の回答を、金額だけでなく必要性・満足度・確認情報まで含めて鑑定しました。</p></section>

  <div className={`rv3-reveal ${revealed?'is-visible':''}`} aria-hidden={!revealed}>
  <section className="rv3-benchmark"><div className="rv3-kicker">HOUSEHOLD BENCHMARK</div><h3>{tone.gap}</h3>{vm.benchmarkSummary?.available&&<div className="rv3-benchmark-hero"><small>{vm.benchmarkSummary.categoryCount}項目を比較</small><strong>{vm.benchmarkSummary.deltaMonthly>0?`+¥${yen(vm.benchmarkSummary.deltaMonthly)}`:vm.benchmarkSummary.deltaMonthly<0?`-¥${yen(Math.abs(vm.benchmarkSummary.deltaMonthly))}`:'±¥0'}<em>/月</em></strong><span>年間換算 {vm.benchmarkSummary.deltaAnnual>0?'+':''}¥{yen(vm.benchmarkSummary.deltaAnnual)}</span><small>※家計全体の平均差ではなく、数値比較できる項目だけの合計です。</small></div>}<p className="rv3-muted">入力した条件のうち、各カテゴリで実際に採用できる基準だけを使っています。</p><details className="rv3-benchmark-details"><summary>比較した項目と基準を見る <span>⌄</span></summary><div className="rv3-benchmark-list">{vm.rows.filter((x:any)=>x.known&&x.comparable!==null).map((x:any)=><div className="rv3-benchmark-row" key={`b-${x.category}`}><div><b>{x.label}</b><small>{x.comparisonContext?.criteria?.join(' × ')||x.comparator.label}</small></div><div className="rv3-benchmark-values"><span>あなた ¥{yen(x.amount)}</span><span>基準 ¥{yen(x.comparable)}</span><strong>{x.comparisonDifference===null?'':x.comparisonDifference>0?`+¥${yen(x.comparisonDifference)}`:x.comparisonDifference<0?`-¥${yen(Math.abs(x.comparisonDifference))}`:'±¥0'}</strong></div></div>)}</div></details><p className="rv3-benchmark-warning"><b>{tone.warning}</b><br/>属性・条件に応じた比較基準との差です。必要性・満足度・追加回答まで確認して、実際の改善余地は別に判定しています。</p><div className={`rv3-confirmed-gap ${vm.improvement.monthly>0?'':'is-zero'}`}><small>{tone.confirmed}</small>{vm.improvement.monthly>0?<><strong>月 ¥{yen(vm.improvement.monthly)}</strong><span>年間 ¥{yen(vm.improvement.annual)}</span></>:<><strong>月 ¥0</strong><span>比較差だけを理由に、無理にムダ認定していません</span></>}</div></section>

  <section className="rv3-title rv3-type-card">
   <div className="rv3-kicker">MONEY TYPE UNLOCKED</div><div className="rv3-muted">あなたのお金タイプは――</div>
   {typeArt(vm.type.code)&&<img className="rv3-type-art" src={typeArt(vm.type.code)} alt="" aria-hidden="true" decoding="async"/>}
   <h2>{vm.type.name}</h2>{vm.type.catchphrase&&<h3 className="rv3-catch">{vm.type.catchphrase}</h3>}{vm.type.description&&<p>{vm.type.description}</p>}
   {vm.type.axisStrength&&<div className="rv3-axes" aria-label="お金タイプ3軸">
    <TypeAxis label="時間軸" value={vm.type.axisStrength.fv} positive={(vm.type.axes?.fv??0)>=0} negativeText="今寄り" positiveText="未来寄り" middle={vm.type.nearMiddle?.fv}/>
    <TypeAxis label="決め方" value={vm.type.axisStrength.pi} positive={(vm.type.axes?.pi??0)>=0} negativeText="直感寄り" positiveText="計画寄り" middle={vm.type.nearMiddle?.pi}/>
    <TypeAxis label="把握" value={vm.type.axisStrength.au} positive={(vm.type.axes?.au??0)>=0} negativeText="必要時に確認" positiveText="普段から把握" middle={vm.type.nearMiddle?.au}/>
   </div>}
   <div className="rv3-type-notes">{vm.type.strengthLabel&&<div><small>強み</small><b>{vm.type.strengthLabel}</b></div>}{vm.type.blindSpot&&<div><small>死角</small><b>{vm.type.blindSpot}</b></div>}</div>
   <div className="rv3-type-stamp"><span>TYPE {vm.type.code}</span><span>{modeName[vm.toneMode]??vm.toneMode} MODE</span></div><small>8問・3軸から判定したお金の使い方の傾向です</small>
  </section>

  <details className="rv3-verdict rv3-verdict-details"><summary><div><div className="rv3-kicker">YOUR HOUSEHOLD VERDICT</div><h3>{tone.verdict}</h3></div><span>内訳を見る⌄</span></summary>
   <div className="rv3-verdict-grid"><div><b>{vm.battleTargets.length}</b><span>⚔️ 削減確定</span></div><div><b>{vm.encounterTargets.length}</b><span>🎯 優先チェック</span></div><div><b>{vm.counts.protect}</b><span>🛡️ 守る支出</span></div></div>
   <p className="rv3-note">高い支出＝ムダとは判定していません。必要性や満足度が確認できた支出は「守る支出」として扱います。</p>
  </details>



  <section className="rv3-next"><div className="rv3-kicker">NEXT QUEST</div><h3>{vm.firstQuest?tone.next:'今の家計を維持するために。'}</h3>{vm.firstQuest?<><div className="rv3-quest">{vm.firstQuest.status==='battle'?'⚔️':vm.firstQuest.encounterStrength==='strong'?'🎯':'🔍'} {vm.firstQuest.label}</div><p><b>{vm.firstQuest.nextCheck}</b></p>{vm.firstQuest.appraisalSummary&&<p className="rv3-next-answer">「{vm.firstQuest.appraisalSummary}」という回答をもとに選びました。</p>}<small>ほかの項目は下の12カテゴリ鑑定図鑑で確認できます。</small></>:<p>現在の回答では、強く優先する見直し項目はありません。定期的に明細を確認して今の状態を維持しましょう。</p>}</section>

  <section className="rv3-early-share"><div><div className="rv3-kicker">TYPE CARD</div><b>「{vm.type.name}」を金額なしでシェア</b><small>収入・支出・都道府県は含みません</small></div><button onClick={share}>称号をシェア</button></section>

  <details className="rv3-section rv3-book-shell"><summary><div><h3>📖 12カテゴリ鑑定図鑑</h3><p className="rv3-muted">全項目の判定根拠を確認できます</p></div><span>開く⌄</span></summary><div className="rv3-book">{vm.rows.map((x:any)=><div className="rv3-book-row" key={x.category}><button onClick={()=>setOpen(open===x.category?null:x.category)}><span>{mark[x.status]} <b>{x.label}</b></span><span className="rv3-muted">{x.status==='battle'?'削減確定':x.status==='protect'?'守る':x.status==='review'?'要確認':x.status==='safe'?'優先なし':'対象外'}　⌄</span></button>{open===x.category&&<div className="rv3-detail"><div><b>あなた：</b>{x.known?`¥${yen(x.amount)}/月`:'金額未把握'}</div><div><b>比較・根拠：</b>{x.comparator.label}{x.comparable!==null?` ¥${yen(x.comparable)}/月`:''}</div>{x.comparisonContext?.criteria?.length>0&&<div><b>比較条件：</b>{x.comparisonContext.criteria.join(' × ')}</div>}{x.comparisonContext?.incomeApplied&&<div><b>所得帯：</b>{x.comparisonContext.incomeBandLabel}（基準値に反映）</div>}{x.comparisonDifference!==null&&x.comparisonDifference>0&&<div><b>比較差：</b>+¥{yen(x.comparisonDifference)} <small>※ムダ額・削減可能額ではありません</small></div>}{x.appraisalSummary&&<div><b>あなたの回答：</b>{x.appraisalSummary}</div>}<div><b>判定理由：</b>{x.reason}</div><div><b>次に確認：</b>{x.nextCheck}</div></div>}</div>)}</div></details>

  <section className="rv3-next rv3-save"><div className="rv3-kicker">SAVE YOUR QUEST</div><h3>{tone.save}</h3><p>このページを閉じても困らないように、LINEへ<strong>今回の診断結果と「次にやる1つ」</strong>を残せます。</p><div className="rv3-save-preview"><span>LINEで受け取れるもの</span><b>🏷️ {vm.type.name}の診断結果</b><b>🎯 {vm.firstQuest ? "まず確認する「"+vm.firstQuest.label+"」" : "今の家計を維持するチェックポイント"}</b><b>🗺️ 12カテゴリの判定をあとで見返す導線</b><small>必要なら、その後に家計の見直し相談へ進めます。まずは結果保存だけでOKです。</small></div><button className="rv3-primary" onClick={()=>{onBeforeExternal?.();onEvent?.("line_clicked",{firstQuest:vm.firstQuest?.category});onLine?.({diagnosisId:vm.diagnosisId,firstQuest:vm.firstQuest?.category})}}>無料で診断結果をLINEに残す ▶</button><small>✓ 無料　✓ あとで見返せる　✓ 登録しただけで相談予約にはなりません</small><button className="rv3-restart" onClick={onRestart}>診断をやり直す</button></section>
  </div></div></main></>
}
const CSS=`
.rv3{min-height:100svh;min-height:100dvh;background:#070d14;color:#fff;overflow-x:hidden;font-family:ui-sans-serif,system-ui,-apple-system,"Noto Sans JP",sans-serif}.rv3 *{box-sizing:border-box}.rv3 button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}.rv3 button:active{transform:translateY(1px) scale(.995)}.rv3-inner{width:min(100%,430px);margin:0 auto;padding-bottom:max(72px,env(safe-area-inset-bottom))}
.rv3 section{padding:28px 20px}.rv3-clear{min-height:220px;display:grid;align-content:center;text-align:center}.rv3-clear h1{margin:18px 0 0;font-size:28px;line-height:1.25}.rv3-clear p{margin:10px 0 0;color:#aeb8c2;font-size:13px;line-height:1.6}.rv3-kicker{color:#f5cc39;font-size:12px;font-weight:1000;letter-spacing:.15em}.rv3-count{display:flex;justify-content:center;gap:8px;margin-top:18px;font-size:11px}.rv3-count span{padding:7px 9px;border:1px solid #293644;border-radius:999px;background:#0d1721}.rv3-count b{font-size:13px}
.rv3-reveal{opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .35s ease,transform .35s ease}.rv3-reveal.is-visible{opacity:1;transform:none;pointer-events:auto}
.rv3-title{border-block:1px solid #24303c;text-align:center}.rv3-title h2{margin:9px 0 4px;color:#f5cc39;font-size:30px;line-height:1.15}.rv3-title p,.rv3-card p{font-size:13px;line-height:1.65;color:#c7d0d9}.rv3-catch{margin:8px 0 0;font-size:15px}.rv3-axes{display:grid;gap:10px;margin:20px 0 12px;padding:14px;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-axis>div:first-child{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:#87929d}.rv3-axis b{color:#dce4eb;font-size:12px;text-align:right}.rv3-axis-track{position:relative;height:6px;margin-top:6px;border-radius:999px;background:#24303c}.rv3-axis-track i{position:absolute;top:50%;width:12px;height:12px;border:2px solid #07111b;border-radius:50%;background:#f5cc39;transform:translate(-50%,-50%)}.rv3-type-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;text-align:left}.rv3-type-notes>div{padding:10px;border:1px solid #293644;border-radius:9px;background:#0d1721}.rv3-type-notes small{margin:0}.rv3-type-notes b{display:block;margin-top:3px;font-size:11px;line-height:1.45}.rv3 small{display:block;margin-top:8px;color:#87929d;font-size:11px;line-height:1.6}.rv3-mode{margin-top:8px;color:#9da8b3;font-size:12px}
.rv3-primary{width:100%;min-height:56px;margin-top:20px;border:1px solid #fff;border-radius:12px;background:#f5cc39;color:#07111b;font-weight:1000;font-size:15px;box-shadow:0 7px 0 #9d7e0e}.rv3-primary:active{transform:translateY(3px);box-shadow:0 4px 0 #9d7e0e}.rv3-restart{display:block;margin:22px auto 0;padding:8px 12px;border:0;background:transparent;color:#87929d;text-decoration:underline;font-size:12px}
.rv3-benchmark{border-top:1px solid #17212b}.rv3-benchmark h3{margin:8px 0 0;font-size:22px}.rv3-benchmark-hero{margin:16px 0;padding:18px 14px;border:1px solid rgba(245,204,57,.5);border-radius:14px;text-align:center;background:#101c27}.rv3-benchmark-hero strong{display:block;margin:5px 0;color:#f5cc39;font-size:34px;line-height:1}.rv3-benchmark-hero strong em{font-size:12px;font-style:normal}.rv3-benchmark-hero span,.rv3-benchmark-hero small{display:block}.rv3-benchmark-hero span{font-size:13px}.rv3-benchmark-hero small{margin-top:6px;color:#9da8b3;font-size:10px;line-height:1.5}.rv3-benchmark-details{margin:12px 0}.rv3-benchmark-details>summary{cursor:pointer;list-style:none;padding:12px 14px;border:1px solid #2a3946;border-radius:12px;background:#0d1721;font-weight:800;font-size:13px}.rv3-benchmark-details>summary::-webkit-details-marker{display:none}.rv3-benchmark-details>summary span{float:right;color:#f5cc39}.rv3-benchmark-details[open]>summary{border-radius:12px 12px 0 0}.rv3-benchmark-list{margin-top:10px;border-top:1px solid #293644}.rv3-benchmark-row{display:grid;grid-template-columns:1fr auto;gap:12px;padding:13px 0;border-bottom:1px solid #293644}.rv3-benchmark-row b{font-size:13px}.rv3-benchmark-row small{margin-top:3px}.rv3-benchmark-values{display:grid;text-align:right;font-size:10px;color:#9da8b3}.rv3-benchmark-values strong{margin-top:3px;color:#f5cc39;font-size:16px}.rv3-benchmark-warning{margin-top:16px;padding:12px;border:1px solid #344454;border-radius:10px;background:#101c27;color:#aeb8c2;font-size:11px;line-height:1.7}.rv3-benchmark-warning b{color:#fff}.rv3-confirmed-gap{margin-top:14px;padding:14px;border:1px solid rgba(245,204,57,.45);border-radius:12px;text-align:center}.rv3-confirmed-gap strong,.rv3-confirmed-gap span{display:block}.rv3-confirmed-gap strong{margin-top:4px;color:#f5cc39;font-size:26px}.rv3-confirmed-gap span{margin-top:3px;font-size:12px}.rv3-verdict{border-top:1px solid #17212b;text-align:center}.rv3-verdict h3{margin:8px 0 0;font-size:22px}.rv3-verdict-details>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px}.rv3-verdict-details>summary::-webkit-details-marker{display:none}.rv3-verdict-details>summary>span{font-size:11px;color:#f5cc39;white-space:nowrap}.rv3-verdict-details>summary h3{margin-bottom:0}.rv3-verdict-details[open]>summary{margin-bottom:14px}.rv3-verdict-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:18px}.rv3-verdict-grid>div{padding:14px 4px;border:1px solid #293644;border-radius:10px;background:#0d1721}.rv3-verdict-grid b{display:block;font-size:26px;color:#f5cc39}.rv3-verdict-grid span{display:block;margin-top:4px;font-size:10px;color:#c7d0d9}.rv3-reward{text-align:center}.rv3-money{margin-top:10px;font-size:46px;font-weight:1000;line-height:1}.rv3-grid{display:grid;grid-template-columns:1fr 1fr;margin-top:22px;padding:14px 0;border-block:1px solid #24303c}.rv3-grid>div+div{border-left:1px solid #24303c}.rv3-note{color:#87929d;font-size:11px;line-height:1.7}
.rv3-section{border-top:1px solid #17212b}.rv3-section h3,.rv3-message h3,.rv3-next h3{margin:0;font-size:20px}.rv3-card{margin-top:14px;padding:15px;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-row{display:flex;justify-content:space-between;gap:12px}.rv3-diff{margin-top:8px;padding:8px 10px;border:1px solid #344454;border-radius:8px;background:#101c27;font-size:12px;font-weight:900}.rv3-diff small{margin-top:2px}.rv3-answer{margin-top:9px;padding:9px 10px;border-left:3px solid #f5cc39;background:#111e2b;color:#dce4eb;font-size:12px;line-height:1.55}.rv3-muted{color:#87929d;font-size:12px;line-height:1.6}
.rv3-book-shell>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px}.rv3-book-shell>summary::-webkit-details-marker{display:none}.rv3-book-shell>summary h3{margin:0}.rv3-book-shell>summary p{margin:4px 0 0}.rv3-book-shell>summary>span{font-size:11px;color:#f5cc39;white-space:nowrap}.rv3-book-shell[open]>summary{margin-bottom:14px}.rv3-book{margin-top:14px;border-top:1px solid #293644}.rv3-book-row{border-bottom:1px solid #293644}.rv3-book-row>button{display:flex;width:100%;min-height:58px;align-items:center;justify-content:space-between;gap:12px;padding:0;border:0;background:transparent;color:#fff;text-align:left}.rv3-detail{padding:0 0 15px;color:#aeb8c2;font-size:12px;line-height:1.7}
.rv3-message{margin:8px 20px 28px;padding:18px!important;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-explain{margin-top:10px;padding:10px;border-radius:9px;background:#111e2b;font-size:12px}.rv3-explain b{margin-left:4px}.rv3-explain span{display:block;margin-top:4px;color:#9eabb7;line-height:1.5}.rv3-message p,.rv3-next p{color:#aeb8c2;font-size:13px;line-height:1.7}
.rv3-next{margin:0 20px;padding:20px!important;border:2px solid #f5cc39;border-radius:14px;background:#0b141e}.rv3-quest{margin-top:10px;padding:15px;background:#111e2b;font-weight:1000}.rv3-next-answer{padding:9px 10px;border-left:3px solid #f5cc39;background:#111e2b;font-size:12px!important}
@media(max-height:700px){.rv3 section{padding-top:22px;padding-bottom:22px}.rv3-clear{min-height:190px}.rv3-clear h1{font-size:24px}.rv3-title h2{font-size:27px}.rv3-money{font-size:40px}.rv3-type-art{width:112px;height:112px;margin-top:8px}}
@media(prefers-reduced-motion:reduce){.rv3-primary,.rv3-reveal{transition:none}}

.rv3-verdict-saving{margin:16px auto 0;padding:14px;border:1px solid rgba(245,204,57,.45);border-radius:12px;background:#0d1721;text-align:center}.rv3-verdict-saving small,.rv3-verdict-saving span{display:block;color:#aeb8c2}.rv3-verdict-saving strong{display:block;margin:4px 0;color:#f5cc39;font-size:24px}.rv3-verdict-saving.is-safe strong{color:#dce4eb;font-size:19px}
.rv3-early-share{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px!important;border-bottom:1px solid #24303c;background:#0b141d}.rv3-early-share>div{min-width:0;text-align:left}.rv3-early-share b,.rv3-early-share small{display:block}.rv3-early-share b{margin-top:4px;font-size:13px}.rv3-early-share small{margin-top:3px;color:#87929d;font-size:10px}.rv3-early-share button{flex:0 0 auto;min-height:46px;padding:0 14px;border:0;border-radius:10px;background:#f5cc39;color:#07111b;font-weight:1000}

.rv3-type-card{position:relative;margin:0 12px 14px;padding:26px 16px!important;border:1px solid rgba(245,204,57,.48)!important;border-radius:18px;background:linear-gradient(180deg,#101b26 0%,#0a121b 100%);box-shadow:0 14px 34px rgba(0,0,0,.28)}.rv3-type-card:before{content:"TYPE UNLOCKED";position:absolute;top:10px;right:12px;color:rgba(245,204,57,.35);font-size:9px;font-weight:1000;letter-spacing:.12em}.rv3-type-card h2{font-size:clamp(30px,8.3vw,36px)!important;text-wrap:balance}.rv3-type-art{display:block;width:clamp(132px,38vw,156px);height:clamp(132px,38vw,156px);margin:10px auto 4px;object-fit:contain;image-rendering:pixelated}.rv3-type-card .rv3-catch{font-size:16px;line-height:1.45;color:#fff}.rv3-type-stamp{display:flex;justify-content:center;gap:7px;margin-top:12px}.rv3-type-stamp span{padding:5px 8px;border:1px solid #344454;border-radius:999px;color:#9da8b3;font-size:9px;font-weight:900;letter-spacing:.08em}

.rv3-save{margin-top:26px!important;background:linear-gradient(180deg,#101b25,#0b141e)!important}.rv3-save p strong{color:#fff}.rv3-save-preview{display:grid;gap:7px;margin-top:14px;padding:13px;border:1px solid #344454;border-radius:11px;background:#08111a;text-align:left}.rv3-save-preview span{color:#87929d;font-size:10px;font-weight:900;letter-spacing:.08em}.rv3-save-preview b{font-size:12px;line-height:1.4}
`;
// deploy-sync: human-readable diagnosis details
