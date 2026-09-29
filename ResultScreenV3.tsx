import React,{useEffect,useState} from 'react';

const yen=(n:number|null)=>n===null?'未把握':new Intl.NumberFormat('ja-JP').format(Math.round(n));
const mark:Record<string,string>={battle:'⚔️',protect:'🛡️',safe:'✓',review:'🔍',na:'⚪'};
const modeName:Record<string,string>={gentle:'😇 甘やかしムダギリ',serious:'⚔️ 正論ムダギリ',hell:'💀 地獄ムダギリ'};

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
async function makeTypeShareFile(vm:any){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const x=canvas.getContext('2d');if(!x)return null;
 x.fillStyle='#07111b';x.fillRect(0,0,1080,1350);x.strokeStyle='#f5cc39';x.lineWidth=8;x.strokeRect(44,44,992,1262);
 x.textAlign='center';x.fillStyle='#f5cc39';x.font='900 34px system-ui,sans-serif';x.fillText('ムダギリ診断',540,150);
 x.fillStyle='#87929d';x.font='800 26px system-ui,sans-serif';x.fillText('MY MONEY TYPE',540,225);
 x.fillStyle='#fff';x.font='900 62px system-ui,sans-serif';x.fillText(vm.type.name,540,350,900);
 x.fillStyle='#f5cc39';x.font='900 31px system-ui,sans-serif';x.fillText(vm.type.catchphrase??'',540,420,900);
 const rows=[['時間軸',axisTendency(vm,'fv')],['決め方',axisTendency(vm,'pi')],['把握',axisTendency(vm,'au')]];
 rows.forEach((r,i)=>{const y=565+i*125;x.fillStyle='#0d1721';x.fillRect(150,y-55,780,88);x.textAlign='left';x.fillStyle='#87929d';x.font='800 24px system-ui,sans-serif';x.fillText(r[0],190,y);x.textAlign='right';x.fillStyle='#fff';x.font='900 31px system-ui,sans-serif';x.fillText(r[1],890,y);});
 x.textAlign='center';x.fillStyle='#fff';x.font='900 34px system-ui,sans-serif';x.fillText('あなたは何タイプ？',540,1050);x.fillStyle='#f5cc39';x.font='900 30px system-ui,sans-serif';x.fillText('#ムダギリ診断',540,1110);
 x.fillStyle='#87929d';x.font='700 21px system-ui,sans-serif';x.fillText('収入・支出金額は画像に含まれません',540,1220);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));return blob?new File([blob],`mudagiri-${vm.type.code}.png`,{type:'image/png'}):null;
}

export default function ResultScreenV3({vm,onLine,onEvent}:{vm:any;onLine?:(x:any)=>void;onEvent?:(n:string,p?:any)=>void}){
 const [open,setOpen]=useState<string|null>(null);
 const [revealed,setRevealed]=useState(false);
 useEffect(()=>{
   onEvent?.('result_viewed',{version:vm.version,typeCode:vm.type.code});
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   const id=window.setTimeout(()=>setRevealed(true),reduced?80:500);
   return()=>window.clearTimeout(id);
 },[]);
 async function share(){
  const hook=vm.type.shareHook??vm.type.catchphrase??vm.type.description??'';
  const shareUrl=new URL(window.location.origin+window.location.pathname);shareUrl.searchParams.set('ref','share');shareUrl.searchParams.set('type',vm.type.code);
  const text=`${hook}\n\nムダギリ診断 →「${vm.type.name}」\n${vm.type.catchphrase??''}\n\nあなたは何タイプ？\n${shareUrl.toString()}\n#ムダギリ診断`;
  onEvent?.('share_clicked',{typeCode:vm.type.code});
  try{
   const file=await makeTypeShareFile(vm);
   if(file&&navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'ムダギリ診断',text,files:[file]});onEvent?.('share_completed',{typeCode:vm.type.code,format:'image'});return}
   if(navigator.share){await navigator.share({title:'ムダギリ診断',text});onEvent?.('share_completed',{typeCode:vm.type.code,format:'text'});return}
  }catch{}
  try{await navigator.clipboard?.writeText(text);onEvent?.('share_completed',{typeCode:vm.type.code,fallback:'clipboard'})}catch{}
 }
 const comparisonRows=vm.rows.filter((x:any)=>x.status==='review'&&x.comparisonDifference!==null&&x.comparisonDifference>0);
 const comparisonImpact=comparisonRows.reduce((sum:number,x:any)=>sum+x.comparisonDifference,0);
 return <>
 <style>{CSS}</style>
 <main className="rv3"><div className="rv3-inner">
  <section className="rv3-clear"><div className="rv3-kicker">QUEST CLEAR!</div><h1>{vm.counts.battle>0?'削減クエスト発見！':vm.counts.review>0?'確認クエスト発見！':'家計防衛成功！'}</h1><p>{vm.counts.battle>0?`削減可能額まで確認できた項目が ${vm.counts.battle} 件あります。`:vm.counts.review>0?`まだ判断に確認が必要な項目が ${vm.counts.review} 件あります。`:'今回、優先して見直す項目は見つかりませんでした。'}</p><div className="rv3-count"><span>⚔️ 削減確定 <b>{vm.counts.battle}</b></span><span>🛡️ 守る <b>{vm.counts.protect}</b></span><span>🔍 要確認 <b>{vm.counts.review}</b></span></div></section>

  <div className={`rv3-reveal ${revealed?'is-visible':''}`} aria-hidden={!revealed}>
  <section className="rv3-title">
   <div className="rv3-kicker">MONEY TYPE UNLOCKED</div>
   <div className="rv3-muted">あなたのお金タイプは――</div><h2>{vm.type.name}</h2>
   {vm.type.catchphrase&&<h3 className="rv3-catch">{vm.type.catchphrase}</h3>}
   {vm.type.description&&<p>{vm.type.description}</p>}
   {vm.type.axisStrength&&<div className="rv3-axes" aria-label="お金タイプ3軸">
    <TypeAxis label="時間軸" value={vm.type.axisStrength.fv} positive={(vm.type.axes?.fv??0)>=0} negativeText="今寄り" positiveText="未来寄り" middle={vm.type.nearMiddle?.fv}/>
    <TypeAxis label="決め方" value={vm.type.axisStrength.pi} positive={(vm.type.axes?.pi??0)>=0} negativeText="直感寄り" positiveText="計画寄り" middle={vm.type.nearMiddle?.pi}/>
    <TypeAxis label="把握" value={vm.type.axisStrength.au} positive={(vm.type.axes?.au??0)>=0} negativeText="必要時に確認" positiveText="普段から把握" middle={vm.type.nearMiddle?.au}/>
   </div>}
   <div className="rv3-type-notes">{vm.type.strengthLabel&&<div><small>強み</small><b>{vm.type.strengthLabel}</b></div>}{vm.type.blindSpot&&<div><small>死角</small><b>{vm.type.blindSpot}</b></div>}</div>
   <div className="rv3-mode">{modeName[vm.toneMode]??vm.toneMode}で診断</div>
   <small>8問の回答から、お金との付き合い方の傾向を判定</small>
   <button className="rv3-primary" onClick={share}>この称号をシェアする</button>
   <small>収入・支出金額はシェア内容に含まれません</small>
  </section>

  <section className="rv3-reward">
   {vm.improvement.monthly>0?<>
    <div className="rv3-kicker">今回確定できた改善額</div>
    <div className="rv3-money">¥{yen(vm.improvement.monthly)}</div><small>/ 月</small>
    <div className="rv3-grid"><div>年間<br/><b>¥{yen(vm.improvement.annual)}</b></div><div>5年間<br/><b>¥{yen(vm.improvement.fiveYear)}</b></div></div>
    {comparisonImpact>0&&<div className="rv3-reference"><b>🔍 別途、要確認の比較差 ¥{yen(comparisonImpact)}/月</b><p>これは確定改善額には含めていません。比較目安との差であり、ムダ額・削減可能額ではありません。</p></div>}
   </>:<>
    {comparisonImpact>0?<><div className="rv3-kicker">比較目安との差（参考）</div>
    <div className="rv3-money">¥{yen(comparisonImpact)}</div><small>/ 月・{comparisonRows.length}項目の合計</small>
    <h3>比較目安より高い部分を、確認ポイントとして表示しています。</h3>
    <p>この金額はムダ額・削減可能額ではありません。具体的に不要・削減可能と確認できた金額だけを「確定改善額」にします。</p></>:<>
    <div className="rv3-kicker">改善額はまだ未確定</div>
    <h3>見直し候補はある。でも、推測で金額は出さない。</h3>
    <p>{vm.counts.battle+vm.counts.review>0?`確認が必要な項目が ${vm.counts.battle+vm.counts.review} 件あります。`:'今回、優先して見直す項目は見つかりませんでした。'}</p></>}
   </>}
   <p className="rv3-note">具体的に不要・削減可能と確認できた実額だけを改善額に含めます。比較平均との差や「要鑑定」の金額は含みません。実際の削減には契約変更・解約などの実行が必要です。</p>
  </section>

  {!!vm.battleTargets.length&&<section className="rv3-section"><h3>⚔️ 削減可能と確認できた項目</h3>{vm.battleTargets.map((x:any)=><article className="rv3-card" key={x.category}>
   <div className="rv3-row"><b>{x.enemyName}</b><b>{x.confirmedSaving!==null&&x.confirmedSaving>0?`確定 ¥${yen(x.confirmedSaving)}/月`:'改善額 未確定'}</b></div>
   <div className="rv3-muted">{x.label} ¥{yen(x.amount)}/月</div>
   <div className="rv3-muted">{x.comparator.label}{x.comparable!==null?` ¥${yen(x.comparable)}`:''}</div>
   {x.comparisonDifference!==null&&x.comparisonDifference>0&&<div className="rv3-diff">比較目安より ¥{yen(x.comparisonDifference)} 高め <small>※この差額＝ムダ額ではありません</small></div>}
   {x.appraisalSummary&&<div className="rv3-answer">あなたの回答：<b>{x.appraisalSummary}</b></div>}<p>{x.reason}</p>
  </article>)}</section>}

  <section className="rv3-message"><h3>大切なものは守る。見直す支出は理由まで確認する。</h3>
   <p>高いからといって、全部をムダとは判定していません。</p>
   {vm.rows.filter((x:any)=>x.status==='protect').map((x:any)=><div className="rv3-explain" key={`p-${x.category}`}>🛡️ <b>{x.label}</b><span>{x.reason}</span></div>)}
   {vm.rows.filter((x:any)=>x.status==='review').map((x:any)=><div className="rv3-explain" key={`r-${x.category}`}>🔍 <b>{x.label}</b><span>{x.reason}</span></div>)}
   <p>見直しはゴールじゃない。実際に減らせたお金を、大切なものに使おう。</p>
  </section>

  <section className="rv3-next"><div className="rv3-kicker">NEXT QUEST</div><h3>{vm.firstQuest?'まず1つだけ、ここを確認。':'今の家計を守るために。'}</h3>
   {vm.firstQuest?<><p>{vm.firstQuest.status==='battle'?'優先して見直す項目':'まだ判断に情報が必要な項目'}</p><div className="rv3-quest">{vm.firstQuest.status==='battle'?'⚔️':'🔍'} {vm.firstQuest.label}</div><p>まずやること：<b>{vm.firstQuest.nextCheck}</b></p>{vm.firstQuest.appraisalSummary&&<p className="rv3-next-answer">あなたの回答「{vm.firstQuest.appraisalSummary}」をもとに選びました。</p>}</>:<p>優先して見直す項目は見つかりませんでした。今の状態を維持するためのチェックリストを用意します。</p>}
   <p className="rv3-note">LINEでは診断結果を保存し、未確定項目があれば確認手順を受け取れます。必要なら、その項目を無料相談で一緒に確定できます。</p>
   <button className="rv3-primary" onClick={()=>{onEvent?.('line_clicked',{firstQuest:vm.firstQuest?.category});onLine?.({diagnosisId:vm.diagnosisId,firstQuest:vm.firstQuest?.category})}}>▶ 診断結果と確認手順をLINEで受け取る</button>
   <small>✓ 診断結果を保存　✓ 未確定項目の確認手順　✓ 無料<br/>相談は任意です。公式LINEの友だち追加が必要です</small>
  </section>

  <section className="rv3-section"><h3>📖 家計モンスター図鑑</h3><p className="rv3-muted">12項目すべての鑑定結果</p>
   <div className="rv3-book">{vm.rows.map((x:any)=><div className="rv3-book-row" key={x.category}>
    <button onClick={()=>setOpen(open===x.category?null:x.category)}><span>{mark[x.status]} <b>{x.label}</b></span><span className="rv3-muted">{x.known?`¥${yen(x.amount)}`:x.status==='na'?'対象外':'金額未把握'}　⌄</span></button>
    {open===x.category&&<div className="rv3-detail">
      <div><b>あなた：</b>{x.known?`¥${yen(x.amount)}/月`:'金額未把握'}</div>
      <div><b>比較：</b>{x.comparator.label}{x.comparable!==null?` ¥${yen(x.comparable)}/月`:''}</div>
      {x.comparisonDifference!==null&&x.comparisonDifference>0&&<div><b>比較差：</b>+¥{yen(x.comparisonDifference)} <small>※ムダ額ではありません</small></div>}
      <div><b>診断状況：</b>{x.status==='battle'?'改善額まで確認済み':x.status==='review'?'追加確認が必要':x.status==='protect'?'価値を確認済み':x.status==='safe'?'現時点で優先確認なし':x.status==='na'?'対象外':'—'}</div>
      <div><b>最終判定：</b>{x.status==='battle'?'⚔️ 削減確定':x.status==='protect'?'🛡️ 守る支出':x.status==='review'?'🔍 要確認':x.status==='safe'?'✓ 問題なし':'対象外'}</div>
      <div><b>確定改善額：</b>{x.confirmedSaving!==null&&x.confirmedSaving>0?`¥${yen(x.confirmedSaving)}/月`:'未確定'}</div>
      {x.appraisalSummary&&<div><b>あなたの回答：</b>{x.appraisalSummary}</div>}<div><b>判定理由：</b>{x.reason}</div>
      <div><b>次に確認：</b>{x.nextCheck}</div>
    </div>}
   </div>)}</div>
  </section>
  </div>
 </div></main></>
}
const CSS=`
.rv3{min-height:100dvh;background:#070d14;color:#fff;overflow-x:hidden;font-family:ui-sans-serif,system-ui,-apple-system,"Noto Sans JP",sans-serif}.rv3 *{box-sizing:border-box}.rv3-inner{width:min(100%,430px);margin:0 auto;padding-bottom:max(72px,env(safe-area-inset-bottom))}
.rv3 section{padding:28px 20px}.rv3-clear{min-height:220px;display:grid;align-content:center;text-align:center}.rv3-clear h1{margin:18px 0 0;font-size:28px;line-height:1.25}.rv3-clear p{margin:10px 0 0;color:#aeb8c2;font-size:13px;line-height:1.6}.rv3-kicker{color:#f5cc39;font-size:12px;font-weight:1000;letter-spacing:.15em}.rv3-count{display:flex;justify-content:center;gap:8px;margin-top:18px;font-size:11px}.rv3-count span{padding:7px 9px;border:1px solid #293644;border-radius:999px;background:#0d1721}.rv3-count b{font-size:13px}
.rv3-reveal{opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .35s ease,transform .35s ease}.rv3-reveal.is-visible{opacity:1;transform:none;pointer-events:auto}
.rv3-title{border-block:1px solid #24303c;text-align:center}.rv3-title h2{margin:9px 0 4px;color:#f5cc39;font-size:30px;line-height:1.15}.rv3-title p,.rv3-card p{font-size:13px;line-height:1.65;color:#c7d0d9}.rv3-catch{margin:8px 0 0;font-size:15px}.rv3-axes{display:grid;gap:10px;margin:20px 0 12px;padding:14px;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-axis>div:first-child{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:#87929d}.rv3-axis b{color:#dce4eb;font-size:12px;text-align:right}.rv3-axis-track{position:relative;height:6px;margin-top:6px;border-radius:999px;background:#24303c}.rv3-axis-track i{position:absolute;top:50%;width:12px;height:12px;border:2px solid #07111b;border-radius:50%;background:#f5cc39;transform:translate(-50%,-50%)}.rv3-type-notes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;text-align:left}.rv3-type-notes>div{padding:10px;border:1px solid #293644;border-radius:9px;background:#0d1721}.rv3-type-notes small{margin:0}.rv3-type-notes b{display:block;margin-top:3px;font-size:11px;line-height:1.45}.rv3 small{display:block;margin-top:8px;color:#87929d;font-size:11px;line-height:1.6}.rv3-mode{margin-top:8px;color:#9da8b3;font-size:12px}
.rv3-primary{width:100%;min-height:56px;margin-top:20px;border:1px solid #fff;border-radius:12px;background:#f5cc39;color:#07111b;font-weight:1000;font-size:15px;box-shadow:0 7px 0 #9d7e0e}.rv3-primary:active{transform:translateY(3px);box-shadow:0 4px 0 #9d7e0e}
.rv3-reward{text-align:center}.rv3-money{margin-top:10px;font-size:46px;font-weight:1000;line-height:1}.rv3-grid{display:grid;grid-template-columns:1fr 1fr;margin-top:22px;padding:14px 0;border-block:1px solid #24303c}.rv3-grid>div+div{border-left:1px solid #24303c}.rv3-note{color:#87929d;font-size:11px;line-height:1.7}
.rv3-section{border-top:1px solid #17212b}.rv3-section h3,.rv3-message h3,.rv3-next h3{margin:0;font-size:20px}.rv3-card{margin-top:14px;padding:15px;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-row{display:flex;justify-content:space-between;gap:12px}.rv3-diff{margin-top:8px;padding:8px 10px;border:1px solid #344454;border-radius:8px;background:#101c27;font-size:12px;font-weight:900}.rv3-diff small{margin-top:2px}.rv3-answer{margin-top:9px;padding:9px 10px;border-left:3px solid #f5cc39;background:#111e2b;color:#dce4eb;font-size:12px;line-height:1.55}.rv3-muted{color:#87929d;font-size:12px;line-height:1.6}
.rv3-book{margin-top:14px;border-top:1px solid #293644}.rv3-book-row{border-bottom:1px solid #293644}.rv3-book-row>button{display:flex;width:100%;min-height:58px;align-items:center;justify-content:space-between;gap:12px;padding:0;border:0;background:transparent;color:#fff;text-align:left}.rv3-detail{padding:0 0 15px;color:#aeb8c2;font-size:12px;line-height:1.7}
.rv3-message{margin:8px 20px 28px;padding:18px!important;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-explain{margin-top:10px;padding:10px;border-radius:9px;background:#111e2b;font-size:12px}.rv3-explain b{margin-left:4px}.rv3-explain span{display:block;margin-top:4px;color:#9eabb7;line-height:1.5}.rv3-message p,.rv3-next p{color:#aeb8c2;font-size:13px;line-height:1.7}
.rv3-next{margin:0 20px;padding:20px!important;border:2px solid #f5cc39;border-radius:14px;background:#0b141e}.rv3-quest{margin-top:10px;padding:15px;background:#111e2b;font-weight:1000}.rv3-next-answer{padding:9px 10px;border-left:3px solid #f5cc39;background:#111e2b;font-size:12px!important}
@media(max-height:700px){.rv3 section{padding-top:22px;padding-bottom:22px}.rv3-clear{min-height:190px}.rv3-clear h1{font-size:24px}.rv3-title h2{font-size:27px}.rv3-money{font-size:40px}}
@media(prefers-reduced-motion:reduce){.rv3-primary,.rv3-reveal{transition:none}}
`;
// deploy-sync: human-readable diagnosis details
