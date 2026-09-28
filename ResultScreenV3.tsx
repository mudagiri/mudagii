import React,{useEffect,useState} from 'react';

const yen=(n:number|null)=>n===null?'未把握':new Intl.NumberFormat('ja-JP').format(Math.round(n));
const mark:Record<string,string>={battle:'⚔️',protect:'🛡️',safe:'✓',review:'🔍',na:'⚪'};
const modeName:Record<string,string>={gentle:'😇 甘やかしムダギリ',serious:'⚔️ 正論ムダギリ',hell:'💀 地獄ムダギリ'};

export default function ResultScreenV3({vm,onLine,onEvent}:{vm:any;onLine?:(x:any)=>void;onEvent?:(n:string,p?:any)=>void}){
 const [open,setOpen]=useState<string|null>(null);
 const [revealed,setRevealed]=useState(false);
 useEffect(()=>{
   onEvent?.('result_viewed',{version:vm.version,typeCode:vm.type.code});
   const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   const id=window.setTimeout(()=>setRevealed(true),reduced?120:1200);
   return()=>window.clearTimeout(id);
 },[]);
 async function share(){
  const text=`ムダギリ診断\n私の家計タイプは――\n${vm.type.name}（${vm.type.code}）\nあなたはどのタイプ？`;
  onEvent?.('share_clicked',{typeCode:vm.type.code});
  try{if(navigator.share){await navigator.share({title:'ムダギリ診断',text});onEvent?.('share_completed');return}}catch{}
  try{await navigator.clipboard?.writeText(text);onEvent?.('share_completed',{fallback:'clipboard'})}catch{}
 }
 return <>
 <style>{CSS}</style>
 <main className="rv3"><div className="rv3-inner">
  <section className="rv3-clear"><div className="rv3-kicker">QUEST CLEAR!</div><h1>{vm.counts.battle===0?'家計防衛成功！':'家計に潜むムダを討伐した！'}</h1><div className="rv3-count">⚔️ {vm.counts.battle}　🛡️ {vm.counts.protect}　🔍 {vm.counts.review}</div></section>

  <div className={`rv3-reveal ${revealed?'is-visible':''}`} aria-hidden={!revealed}>
  <section className="rv3-title">
   <div className="rv3-muted">あなたの家計タイプは――</div><h2>{vm.type.name}</h2><b>{vm.type.code}</b>
   <div className="rv3-mode">{modeName[vm.toneMode]??vm.toneMode}で診断</div>
   {vm.type.description&&<p>{vm.type.description}</p>}
   <small>8問の回答から、お金との付き合い方をタイプ判定</small>
   <button className="rv3-primary" onClick={share}>結果をシェアする</button>
   <small>収入・支出金額はシェア内容に含まれません</small>
  </section>

  <section className="rv3-reward">
   <div className="rv3-kicker">今回見つかった改善余地</div>
   <div className="rv3-money">¥{yen(vm.improvement.monthly)}</div><small>/ 月</small>
   <div className="rv3-grid"><div>年間<br/><b>¥{yen(vm.improvement.annual)}</b></div><div>5年間<br/><b>¥{yen(vm.improvement.fiveYear)}</b></div></div>
   <p className="rv3-note">現在の生活を大きく変えずに、見直せる可能性がある金額です。診断上の推定値で、実際の削減額を保証するものではありません。「要鑑定」は含みません。</p>
  </section>

  {!!vm.battleTargets.length&&<section className="rv3-section"><h3>⚔️ なぜ斬られた？</h3>{vm.battleTargets.map((x:any)=><article className="rv3-card" key={x.category}>
   <div className="rv3-row"><b>{x.enemyName}</b><b>¥{yen(x.reducible)}/月</b></div>
   <div className="rv3-muted">{x.label} ¥{yen(x.amount)}/月</div>
   <div className="rv3-muted">{x.comparator.label}{x.comparable!==null?` ¥${yen(x.comparable)}`:''}</div>
   <p>{x.reason}</p>
  </article>)}</section>}

  <section className="rv3-section"><h3>📖 家計モンスター図鑑</h3><p className="rv3-muted">12項目すべての鑑定結果</p>
   <div className="rv3-book">{vm.rows.map((x:any)=><div className="rv3-book-row" key={x.category}>
    <button onClick={()=>setOpen(open===x.category?null:x.category)}><span>{mark[x.status]} <b>{x.label}</b></span><span className="rv3-muted">{x.known?`¥${yen(x.amount)}`:x.status==='na'?'対象外':'金額未把握'}　⌄</span></button>
    {open===x.category&&<div className="rv3-detail"><div>比較情報：{x.comparator.label}{x.comparable!==null?` ¥${yen(x.comparable)}`:''}</div><div>判定理由：{x.reason}</div><div>次に確認すること：{x.nextCheck}</div></div>}
   </div>)}</div>
  </section>

  <section className="rv3-message"><h3>大切なものを守るために、ムダだけ斬る。</h3>
   <p>高いからといって、全部をムダとは判定していません。</p>
   {vm.rows.filter((x:any)=>x.status==='protect').map((x:any)=><div className="rv3-explain" key={`p-${x.category}`}>🛡️ <b>{x.label}</b><span>{x.reason}</span></div>)}
   {vm.rows.filter((x:any)=>x.status==='review').map((x:any)=><div className="rv3-explain" key={`r-${x.category}`}>🔍 <b>{x.label}</b><span>{x.reason}</span></div>)}
   <p>ムダを斬るのは、ゴールじゃない。浮いたお金を、大切なものに使おう。</p>
  </section>

  <section className="rv3-next"><div className="rv3-kicker">NEXT QUEST</div><h3>ムダは見つけただけじゃ減らない。</h3>
   {vm.firstQuest?<><p>あなたの最初のクエスト</p><div className="rv3-quest">{vm.firstQuest.status==='battle'?'⚔️':'🔍'} {vm.firstQuest.enemyName}を調査せよ</div><p>最初に確認するのは―― <b>？？？</b></p></>:<p>大きなムダは見つかりませんでした。家計を維持するための確認クエストを用意します。</p>}
   <p className="rv3-note">LINEで診断データを引き継ぐと、あなた専用のNEXT QUESTが始まります。</p>
   <button className="rv3-primary" onClick={()=>{onEvent?.('line_clicked',{firstQuest:vm.firstQuest?.category});onLine?.({diagnosisId:vm.diagnosisId,firstQuest:vm.firstQuest?.category})}}>▶ LINEでNEXT QUESTを受け取る</button>
   <small>✓ 診断結果も保存　✓ 最初にやることを1つ案内　✓ 無料<br/>公式LINEの友だち追加が必要です</small>
  </section>
  </div>
 </div></main></>
}
const CSS=`
.rv3{min-height:100dvh;background:#070d14;color:#fff;overflow-x:hidden;font-family:ui-sans-serif,system-ui,-apple-system,"Noto Sans JP",sans-serif}.rv3 *{box-sizing:border-box}.rv3-inner{width:min(100%,430px);margin:0 auto;padding-bottom:max(72px,env(safe-area-inset-bottom))}
.rv3 section{padding:28px 20px}.rv3-clear{min-height:220px;display:grid;align-content:center;text-align:center}.rv3-clear h1{margin:18px 0 0;font-size:28px;line-height:1.25}.rv3-kicker{color:#f5cc39;font-size:12px;font-weight:1000;letter-spacing:.15em}.rv3-count{margin-top:20px;font-size:14px}
.rv3-reveal{opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .35s ease,transform .35s ease}.rv3-reveal.is-visible{opacity:1;transform:none;pointer-events:auto}
.rv3-title{border-block:1px solid #24303c;text-align:center}.rv3-title h2{margin:9px 0 4px;color:#f5cc39;font-size:30px;line-height:1.15}.rv3-title p,.rv3-card p{font-size:13px;line-height:1.65;color:#c7d0d9}.rv3 small{display:block;margin-top:8px;color:#87929d;font-size:11px;line-height:1.6}.rv3-mode{margin-top:8px;color:#9da8b3;font-size:12px}
.rv3-primary{width:100%;min-height:56px;margin-top:20px;border:1px solid #fff;border-radius:12px;background:#f5cc39;color:#07111b;font-weight:1000;font-size:15px;box-shadow:0 7px 0 #9d7e0e}.rv3-primary:active{transform:translateY(3px);box-shadow:0 4px 0 #9d7e0e}
.rv3-reward{text-align:center}.rv3-money{margin-top:10px;font-size:46px;font-weight:1000;line-height:1}.rv3-grid{display:grid;grid-template-columns:1fr 1fr;margin-top:22px;padding:14px 0;border-block:1px solid #24303c}.rv3-grid>div+div{border-left:1px solid #24303c}.rv3-note{color:#87929d;font-size:11px;line-height:1.7}
.rv3-section{border-top:1px solid #17212b}.rv3-section h3,.rv3-message h3,.rv3-next h3{margin:0;font-size:20px}.rv3-card{margin-top:14px;padding:15px;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-row{display:flex;justify-content:space-between;gap:12px}.rv3-muted{color:#87929d;font-size:12px;line-height:1.6}
.rv3-book{margin-top:14px;border-top:1px solid #293644}.rv3-book-row{border-bottom:1px solid #293644}.rv3-book-row>button{display:flex;width:100%;min-height:58px;align-items:center;justify-content:space-between;gap:12px;padding:0;border:0;background:transparent;color:#fff;text-align:left}.rv3-detail{padding:0 0 15px;color:#aeb8c2;font-size:12px;line-height:1.7}
.rv3-message{margin:8px 20px 28px;padding:18px!important;border:1px solid #293644;border-radius:12px;background:#0d1721}.rv3-explain{margin-top:10px;padding:10px;border-radius:9px;background:#111e2b;font-size:12px}.rv3-explain b{margin-left:4px}.rv3-explain span{display:block;margin-top:4px;color:#9eabb7;line-height:1.5}.rv3-message p,.rv3-next p{color:#aeb8c2;font-size:13px;line-height:1.7}
.rv3-next{margin:0 20px;padding:20px!important;border:2px solid #f5cc39;border-radius:14px;background:#0b141e}.rv3-quest{margin-top:10px;padding:15px;background:#111e2b;font-weight:1000}
@media(max-height:700px){.rv3 section{padding-top:22px;padding-bottom:22px}.rv3-clear{min-height:190px}.rv3-clear h1{font-size:24px}.rv3-title h2{font-size:27px}.rv3-money{font-size:40px}}
@media(prefers-reduced-motion:reduce){.rv3-primary,.rv3-reveal{transition:none}}
`;
