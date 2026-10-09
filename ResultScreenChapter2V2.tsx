import React,{useState} from 'react';
import {ENEMY_ASSETS} from './enemy-assets-v1';
import {CHAPTER1_STYLE_NAMES,chapter2V2ShareText,chapter2V2ReferralUrl,chapter2V2SignedComparisonYen,type Chapter1HandoffV1} from './chapter2-v2-contract';

type Props={
 vm:any;
 chapter1?:Chapter1HandoffV1|null;
 onLine?:(x:any)=>void;
 onEvent?:(name:string,data?:Record<string,unknown>)=>void;
 onRestart?:()=>void;
 onBeforeExternal?:()=>void;
};

const ART={
 hero:'./assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png',
 guide:'./assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png',
 quest:'./assets/battle1/MUDAGIRI_BATTLE_SWING.png'
};
const GOALS=[
 ['home','住まい'],['family','家族・教育'],['travel','旅行・趣味'],['invest','資産形成'],
 ['challenge','独立・挑戦'],['safety','もしもの備え'],['retirement','老後'],['undecided','まだ決めていない']
] as const;
const STATUS:Record<string,{name:string;mark:string;description:string}>={
 cut:{name:'斬る',mark:'⚔️',description:'回答から停止・削減を確認できた項目'},
 optimize:{name:'整える',mark:'✨',description:'使う価値を残して内訳を確認する項目'},
 protect:{name:'守る',mark:'🛡️',description:'大切な支出として維持する項目'},
 inspect:{name:'見極める',mark:'🔎',description:'詳細が分かるまで削減額を決めつけない項目'},
 ok:{name:'そのままでOK',mark:'○',description:'今は特に優先する変更がない項目'},
 na:{name:'対象外',mark:'—',description:'この条件では比較対象にならない項目'},
 review:{name:'確認する',mark:'🔎',description:'詳細確認が必要な項目'}
};
const yen=(n:number)=>new Intl.NumberFormat('ja-JP').format(Math.max(0,Math.round(n||0)));
const money=(n:number)=>'¥'+yen(n);
const nonnegative=(n:unknown)=>Math.max(0,Number.isFinite(Number(n))?Number(n):0);
const handoffCode=(id:string)=>'MG-'+(String(id||'').replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(-12)||'UNKNOWN');

function loadImage(url:string):Promise<HTMLImageElement|null>{
 return new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=url;
 });
}

/** Social card contains only quest completion and no amounts, locations, incomes or type claim. */
async function createQuestShareCard():Promise<File|null>{
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.fillStyle='#0e2434';ctx.fillRect(0,0,1080,1350);
 ctx.fillStyle='#f3cd65';ctx.fillRect(42,42,996,7);ctx.fillRect(42,1301,996,7);
 ctx.textAlign='center';
 ctx.fillStyle='#ffe9aa';ctx.font='bold 40px sans-serif';ctx.fillText('ムダギリ診断',540,134);
 ctx.fillStyle='#ffffff';ctx.font='bold 75px sans-serif';ctx.fillText('家計クエスト',540,250);
 ctx.fillText('完全クリア！',540,340);
 const img=await loadImage(ART.hero);
 if(img&&img.naturalWidth&&img.naturalHeight){
  const sc=Math.min(540/img.naturalWidth,530/img.naturalHeight);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,540-img.naturalWidth*sc/2,440,img.naturalWidth*sc,img.naturalHeight*sc);
 }
 ctx.fillStyle='#ffe9aa';ctx.font='bold 52px sans-serif';ctx.fillText('12カテゴリ鑑定完了',540,1050);
 ctx.fillStyle='#d7e3eb';ctx.font='bold 28px sans-serif';ctx.fillText('好きなものは守って、ムダだけ斬る。',540,1130);
 ctx.fillStyle='#9eb4c1';ctx.font='24px sans-serif';ctx.fillText('金額・収入・地域・個別結果は含まれません',540,1240);
 const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/png'));
 return blob?new File([blob],'mudagiri-household-quest.png',{type:'image/png'}):null;
}

export default function ResultScreenChapter2V2({vm,chapter1,onLine,onEvent,onRestart,onBeforeExternal}:Props){
 const [opened,setOpened]=useState<string|null>(null);
 const [showAll,setShowAll]=useState(false);
 const [goal,setGoal]=useState<string|null>(null);
 const [showLine,setShowLine]=useState(false);
 const [shareStatus,setShareStatus]=useState('');
 const [shareBusy,setShareBusy]=useState(false);
 const rows=Array.isArray(vm.rows)?vm.rows:[];
 const counts=vm.v5Counts||{};
 const confirmed=nonnegative(vm.potential?.confirmedA);
 const reviewUpper=nonnegative(vm.potential?.cUpper);
 const next=vm.firstQuest??null;
 const filtered=rows.filter((x:any)=>x&&x.category&&x.v5Status!=='na');
 const highlighted=filtered.filter((x:any)=>['cut','optimize','inspect'].includes(x.v5Status));
 const shown=showAll?filtered:highlighted.slice(0,3);
 const selectedGoal=GOALS.find(g=>g[0]===goal)?.[1]??null;

 function consultation(){
  onEvent?.('chapter2_v2_consultation_cta_clicked',{placement:'result',goal:goal??null});
  setShowLine(true);
 }
 function confirmConsultation(){
  const code=handoffCode(vm.diagnosisId);
  onEvent?.('line_clicked',{placement:'consult_route',chapter:'household',typeCode:null});
  onBeforeExternal?.();
  onLine?.({diagnosisId:vm.diagnosisId,firstQuest:next?.category??null,placement:'consult_route',
    handoffCode:code,goal:goal??null,consultPrimary:'lifeplan',consultSelectedTopic:'lifeplan',
    insuranceReview:!!vm.consultRoute?.insuranceReview});
  if(!onLine)window.location.href='https://lin.ee/ZeLu7i6';
 }
 function shareUrl(platform:string){
  return chapter2V2ReferralUrl(window.location.href,platform);
 }
 async function shareImage(){
  if(shareBusy)return;setShareBusy(true);setShareStatus('');
  onEvent?.('chapter2_v2_share_clicked',{format:'image'});
  try{
   const file=await createQuestShareCard();
   if(!file){setShareStatus('画像カードを作れませんでした。');return;}
   if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
    try{
     onBeforeExternal?.();
     await navigator.share({title:'ムダギリ診断｜家計クエスト',text:chapter2V2ShareText(shareUrl('native')),files:[file]});
     setShareStatus('共有画面に画像を渡しました。');
     onEvent?.('chapter2_v2_share_completed',{format:'image'});
     return;
    }catch(e){if((e as Error)?.name==='AbortError'){setShareStatus('共有をキャンセルしました。');return;}}
   }
   const blobUrl=URL.createObjectURL(file);
   const anchor=document.createElement('a');anchor.href=blobUrl;anchor.download=file.name;
   document.body.appendChild(anchor);anchor.click();anchor.remove();
   window.setTimeout(()=>URL.revokeObjectURL(blobUrl),1000);
   setShareStatus('画像の保存を開始したよ。InstagramやThreadsには保存した画像を添付してね。');
   onEvent?.('chapter2_v2_share_completed',{format:'download'});
  }catch{setShareStatus('画像を保存できませんでした。');}
  finally{setShareBusy(false);}
 }
 function shareText(platform:'x'|'line'){
  onEvent?.('chapter2_v2_share_clicked',{format:'text',platform});
  const text=chapter2V2ShareText(shareUrl(platform));
  onBeforeExternal?.();
  if(platform==='x')window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
  else window.location.href='https://line.me/R/share?text='+encodeURIComponent(text);
 }
 function categoryDetail(x:any){
  const isOpen=opened===x.category;
  const enemy=(ENEMY_ASSETS as Record<string,any>)[x.category];
  const status=STATUS[x.v5Status]??STATUS.review;
  return <div className="c2v2-entry" key={x.category}>
   <button className="c2v2-enemy" type="button" aria-expanded={isOpen} onClick={()=>{
    setOpened(isOpen?null:x.category);onEvent?.('chapter2_v2_category_detail_clicked',{category:x.category});
   }}>
    {enemy?.normal?<img src={enemy.normal} alt="" loading="lazy"/>:<span className="c2v2-enemy-icon">⚔️</span>}
    <span className="c2v2-enemy-text"><b>{x.label||x.category}</b><small>{status.mark} {status.name}{x.positionLabel?' ／ '+x.positionLabel:''}</small><span>{isOpen?'詳細を閉じる ↑':'鑑定理由を見る ↓'}</span></span>
   </button>
   {isOpen&&<div className="c2v2-detail">
    <p>{x.reason||'回答内容をもとに確認しています。'}</p>
    {x.known&&Number.isFinite(Number(x.amount))&&<p>あなたの支出：<b>{money(Number(x.amount))}/月</b></p>}
    {x.comparable!==null&&x.comparable!==undefined&&Number.isFinite(Number(x.comparable))&&<p>比較の目安：{money(Number(x.comparable))}/月</p>}
    {x.comparisonDifference!==null&&x.comparisonDifference!==undefined&&<p>比較差：{chapter2V2SignedComparisonYen(Number(x.comparisonDifference))}/月 <small>※この差はムダ額・改善額ではありません</small></p>}
    {x.aAmount>0&&<p>回答から確認できた改善額：<b>{money(Number(x.aAmount))}/月</b></p>}
    {x.cUpper>0&&<p>追加の確認余地：最大 {money(Number(x.cUpper))}/月 <small>※削減できると確定した金額ではありません</small></p>}
    <p className="c2v2-next-check"><b>次の確認：</b>{x.nextAction||x.nextCheck||'支出の内容を確認'}</p>
   </div>}
  </div>;
 }

 return <main className="c2v2-root"><style>{CSS}</style><div className="c2v2-page">
  <section className="c2v2-hero" data-section="CHAPTER2_QUEST_COMPLETE">
   <span className="c2v2-eyebrow">第2章 ／ QUEST COMPLETE</span>
   <img src={ART.hero} alt="ムダギリくん" className="c2v2-hero-art"/>
   <h1>家計クエスト<br/><em>完全クリア！</em></h1>
   <p>ムダギリくん「よくやった！<br/>さあ、戦果を見ていこう。」</p>
   <span className="c2v2-scroll-cue">今回の戦果を見る ↓</span>
  </section>
  {chapter1&&<aside className="c2v2-handoff" aria-label="第1章からの引継ぎ">
    <span>第1章から引き継いだ職業</span>
    <b>{chapter1.jobName}</b>
    <small>{CHAPTER1_STYLE_NAMES[chapter1.primaryStyle]}を大切にする冒険者</small>
   </aside>}

  <section className="c2v2-card" data-section="HOUSEHOLD_BATTLE_RESULTS">
   <span className="c2v2-kicker">BATTLE REPORT ／ 戦果報告</span><h2>今回の戦果</h2>
   <p className="c2v2-talk">ムダギリくん「高いから斬るわけじゃない。大事なものは、ちゃんと守ろう。」</p>
   <div className="c2v2-counts">
    {(['cut','optimize','protect','inspect'] as const).map(key=><div key={key}>
     <span>{STATUS[key].mark} {STATUS[key].name}</span><strong>{nonnegative(counts[key])}<small>件</small></strong>
    </div>)}
   </div>
   <div className="c2v2-totals">
    <div><span>回答から確認できた改善額</span><strong>{money(confirmed)}<small> / 月</small></strong></div>
    <div className="c2v2-unconfirmed"><span>追加で調べる見直し余地 <i>未確定</i></span><strong>{reviewUpper>0?'最大 '+money(reviewUpper):'今は未確認'}<small>{reviewUpper>0?' / 月':''}</small></strong><small>ここから減らせると決まった金額ではありません。</small></div>
   </div>
   <p className="c2v2-note">平均・基準との差＝ムダ額ではありません。確定改善額と、未確定の見直し余地は足しません。</p>
   {confirmed>0&&<details className="c2v2-accumulation"><summary>確認できた改善額を積み重ねると？ ↓</summary>
    <p>1年：{money(confirmed*12)}　／　5年：{money(confirmed*60)}　／　10年：{money(confirmed*120)}</p>
    <small>単純累計であり、将来も同額を改善できる保証や運用益は含みません。</small>
   </details>}
  </section>

  <section className="c2v2-card c2v2-decision" data-section="CONSULTATION_CTA_TOP">
   <span className="c2v2-kicker">NEXT ACTION ／ 次に進むなら</span>
   <h2>この家計で、<br/>やりたい未来に届く？</h2>
   <p>今回の鑑定では分からない、貯蓄・保障・資産形成まで。これからの計画を、一緒に整理しよう。</p>
   <button className="c2v2-primary" onClick={consultation}>無料のライフプラン相談を確認する →</button>
   <small>まずはLINEで案内を確認。追加だけで面談予約にはなりません。</small>
  </section>

  <section className="c2v2-card" data-section="NEXT_QUEST">
   <span className="c2v2-kicker">NEXT QUEST ／ 次の一手</span>
   <h2>まずは、これだけ。</h2>
   {next?<div className="c2v2-quest">
    <img src={(ENEMY_ASSETS as Record<string,any>)[next.category]?.normal||ART.quest} alt="" loading="lazy"/>
    <div><b>{next.label}</b><p>{next.nextAction||'この支出の内訳を確認しよう。'}</p>
    {next.aAmount>0&&<strong>確認済み：月 {money(Number(next.aAmount))}</strong>}</div>
   </div>:<div className="c2v2-quest"><img src={ART.guide} alt="" loading="lazy"/><p>無理にムダを探さなくてもOK。今の状態を守るところから始めよう。</p></div>}
   <p className="c2v2-talk">ムダギリくん「全部まとめて変えなくていい。まず1つで十分だ。」</p>
  </section>

  <section className="c2v2-card" data-section="CATEGORY_ENCYCLOPEDIA">
   <span className="c2v2-kicker">ENEMY ATLAS ／ 敵図鑑</span><h2>気になる敵を、もっと詳しく。</h2>
   <p>項目をタップすると、比較条件と判定理由が見られるよ。</p>
   {shown.length?shown.map(categoryDetail):<p className="c2v2-note">優先して見直す敵は見つからなかったよ。必要な支出は守っていい。</p>}
   {filtered.length>shown.length&&<button className="c2v2-subtle" onClick={()=>setShowAll(true)}>残りの鑑定結果も見る（{filtered.length-shown.length}件） ↓</button>}
   {showAll&&filtered.length>3&&<button className="c2v2-subtle" onClick={()=>{setShowAll(false);setOpened(null);}}>上位だけに戻す ↑</button>}
   <p className="c2v2-note">比較ができない項目に架空の平均は作っていません。</p>
  </section>

  <section className="c2v2-card" data-section="GOAL_QUEST">
   <span className="c2v2-kicker">YOUR DESTINATION ／ 目指す未来</span>
   <h2>整えたお金、どんな未来に使いたい？</h2>
   <div className="c2v2-goals">{GOALS.map(([code,label])=><button type="button" key={code} className={goal===code?'is-selected':''} aria-pressed={goal===code} onClick={()=>{setGoal(code);onEvent?.('goal_selected',{goal:code,chapter:'household'});}}>{label}</button>)}</div>
   {selectedGoal&&<p className="c2v2-talk">次の目的地は「{selectedGoal}」。そのためのお金の配分を考えよう。</p>}
   <button className="c2v2-primary" onClick={consultation}>{selectedGoal?'「'+selectedGoal+'」の相談案内を見る →':'ライフプラン相談の案内を見る →'}</button>
  </section>

  <section className="c2v2-card c2v2-sharing" data-section="HOUSEHOLD_SHARE">
   <span className="c2v2-kicker">SHARE YOUR QUEST ／ 共有する</span><h2>この冒険、友達にも教える？</h2>
   <p>ここで共有するのは「12カテゴリ鑑定完了」のカードだけ。金額や性格称号は載せないよ。</p>
   <button className="c2v2-share-primary" onClick={()=>void shareImage()} disabled={shareBusy}>{shareBusy?'画像を準備しています…':'画像カードをシェア／保存する'}</button>
   <div className="c2v2-text-shares">
    <button onClick={()=>shareText('x')} type="button">Xで文章を共有</button>
    <button onClick={()=>shareText('line')} type="button">LINEで文章を共有</button>
   </div>
   <small>Instagram・Threadsには、共有画面から画像を渡すか、保存した画像を添付してね。</small>
   {shareStatus&&<p className="c2v2-share-status" role="status">{shareStatus}</p>}
  </section>

  {onRestart&&<button className="c2v2-restart" onClick={onRestart}>家計クエストを最初からやり直す</button>}
 </div>
 {showLine&&<div className="c2v2-overlay" role="presentation" onClick={()=>setShowLine(false)}>
  <section className="c2v2-modal" role="dialog" aria-modal="true" aria-labelledby="c2v2-modal-title" onClick={e=>e.stopPropagation()}>
   <span className="c2v2-kicker">NEXT QUEST / LIFE PLAN</span>
   <h2 id="c2v2-modal-title">ライフプラン相談の案内へ</h2>
   <p>LINEで案内を確認できます。追加しただけでは面談予約にはなりません。</p>
   <p className="c2v2-code">引き継ぎコード：{handoffCode(vm.diagnosisId)}</p>
   <button className="c2v2-primary" onClick={confirmConsultation}>公式LINEで案内を確認する →</button>
   <button className="c2v2-subtle" onClick={()=>setShowLine(false)}>今は結果を見る</button>
  </section>
 </div>}
 </main>;
}

const CSS=[
 '.c2v2-root{min-height:100dvh;background:#0b1b29;color:#f4f8fb;font-family:system-ui,-apple-system,sans-serif;padding:0 0 46px;}',
 '.c2v2-root *{box-sizing:border-box}.c2v2-page{max-width:470px;margin:auto}',
 ".c2v2-hero{position:relative;min-height:322px;padding:26px 22px 66px;background:linear-gradient(155deg,#29445a,#10283b 65%,#081723);text-align:left;overflow:hidden}",
 ".c2v2-eyebrow,.c2v2-kicker{display:block;letter-spacing:.06em;font-size:14px;font-weight:850;color:#f5d178}",
 ".c2v2-hero h1{position:relative;z-index:2;font-size:clamp(32px,8vw,39px);line-height:1.2;margin:19px 0 12px;max-width:68%;letter-spacing:-.03em}",
 ".c2v2-hero em{color:#ffe18a;font-style:normal}.c2v2-hero>p{position:relative;z-index:2;font-size:16px;line-height:1.65;margin:0;max-width:58%}",
 ".c2v2-hero-art{position:absolute;bottom:30px;right:7px;width:145px;height:176px;object-fit:contain;image-rendering:pixelated;z-index:1}",
 ".c2v2-scroll-cue{position:absolute;bottom:18px;left:22px;font-size:14px;font-weight:850;color:#f5d178;z-index:2}",
 ".c2v2-handoff{position:relative;z-index:1;margin:12px 12px 0;padding:12px 16px;background:#112637;border:1px solid #557b86;border-radius:13px}",
 ".c2v2-handoff span,.c2v2-handoff small{display:block;font-size:14px;color:#c6d4df}.c2v2-handoff b{display:block;font-size:18px;margin:4px 0}",
 '.c2v2-card{margin:14px 12px;padding:22px 18px;background:#173046;border:1px solid #3b5870;border-radius:18px}',
 '.c2v2-card h2{font-size:25px;line-height:1.3;margin:7px 0 12px;letter-spacing:-.02em}',
 '.c2v2-card p{font-size:15px;line-height:1.75;margin:10px 0;color:#d5e1ea}',
 ".c2v2-card small{font-size:14px;line-height:1.55;color:#bbcbd6}",
 '.c2v2-decision{border-color:#d0a958;background:linear-gradient(145deg,#2e413c,#23333f)}',
 '.c2v2-primary,.c2v2-share-primary{display:block;width:100%;min-height:56px;margin-top:16px;padding:12px;border:0;border-radius:13px;background:#f2d47e;color:#18232d;font-weight:900;font-size:16px;cursor:pointer;touch-action:manipulation}',
 '.c2v2-primary:focus-visible,.c2v2-root button:focus-visible{outline:3px solid #8de0ff;outline-offset:2px}',
 '.c2v2-decision>small{display:block;margin-top:11px}',
 '.c2v2-talk{padding:12px;background:#11293b;border-left:3px solid #e5c56c;border-radius:6px}',
 '.c2v2-counts{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}',
 ".c2v2-counts>div{padding:12px 14px;background:#0e2535;border:1px solid #355264;border-radius:12px}",
 ".c2v2-counts span{font-size:15px;display:block}.c2v2-counts strong{display:block;font-size:30px;margin-top:5px}.c2v2-counts strong small{font-size:14px;margin-left:4px}",
 ".c2v2-totals{margin-top:13px;display:grid;gap:8px}.c2v2-totals>div{background:#eaf1ee;color:#162b37;border-radius:12px;padding:16px}.c2v2-totals>div.c2v2-unconfirmed{background:#102b40;color:#f4f8fb;border:1px solid #536c7b}.c2v2-unconfirmed span i{font-style:normal;display:inline-block;margin-left:5px;border:1px solid #b9cede;border-radius:6px;padding:2px 6px;font-size:12px;color:#d8e7f1}.c2v2-totals>div.c2v2-unconfirmed>small{display:block;margin-top:6px;color:#d0dce4;font-size:14px}",
 ".c2v2-totals span{display:block;font-size:15px;font-weight:850}.c2v2-totals strong{display:block;font-size:clamp(23px,7vw,32px);margin-top:5px}",
 ".c2v2-totals strong small{color:#345260;font-size:14px}.c2v2-totals .c2v2-unconfirmed strong small{color:#d0dce4}.c2v2-root .c2v2-note{font-size:14px;color:#bfd0db}",
 '.c2v2-accumulation{margin-top:12px;background:#10283a;border:1px solid #35586a;border-radius:10px;padding:10px 14px}',
 ".c2v2-accumulation summary{cursor:pointer;min-height:48px;display:flex;align-items:center;font-size:15px;font-weight:800}",
 '.c2v2-quest{display:flex;gap:12px;align-items:center;background:#10293b;border-radius:12px;padding:14px}',
 '.c2v2-quest img{width:90px;height:90px;object-fit:contain;image-rendering:pixelated;flex:0 0 auto}',
 '.c2v2-quest div{min-width:0}.c2v2-quest b{font-size:17px}.c2v2-quest p{font-size:15px;margin:5px 0}.c2v2-quest strong{font-size:14px;color:#ffe3a2}',
 '.c2v2-entry{margin-top:9px;border:1px solid #3e6073;border-radius:12px;overflow:hidden}',
 '.c2v2-enemy{width:100%;background:#0e2535;border:0;color:inherit;display:flex;gap:12px;align-items:center;text-align:left;padding:12px;min-height:76px;cursor:pointer}',
 '.c2v2-enemy>img,.c2v2-enemy-icon{width:72px;height:72px;object-fit:contain;flex:0 0 auto}',
 ".c2v2-enemy-text{display:grid;gap:3px;min-width:0}.c2v2-enemy-text b{font-size:16px}.c2v2-enemy-text small{font-size:14px}",
 '.c2v2-enemy-text>span{font-size:14px;font-weight:850;color:#f4d888}',
 ".c2v2-detail{padding:14px;background:#112d3e;border-top:1px solid #3e6073}.c2v2-detail p{font-size:15px;margin:0 0 10px}",
 ".c2v2-detail small{display:block;font-size:13px}.c2v2-next-check{padding-top:8px;border-top:1px solid #355264}",
 '.c2v2-subtle{background:transparent;color:#dfedf6;width:100%;margin-top:13px;border:1px solid #527288;border-radius:12px;min-height:50px;font-size:15px;font-weight:800;cursor:pointer}',
 '.c2v2-goals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}',
 '.c2v2-goals button{min-height:58px;text-align:left;border:1px solid #577386;border-radius:11px;background:#102639;color:#f4f8fb;padding:11px;font-size:15px;font-weight:850;cursor:pointer}',
 '.c2v2-goals button.is-selected{border:2px solid #f5d178;background:#3b3e39}',
 '.c2v2-sharing{border-color:#55717c}.c2v2-share-primary{background:#d8e8ef;color:#12293a}',
 '.c2v2-share-primary:disabled{opacity:.55}.c2v2-text-shares{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}',
 ".c2v2-text-shares button{min-height:48px;border:1px solid #58798a;background:#12293d;border-radius:11px;color:#eef6fc;font-size:15px;font-weight:850}",
 '.c2v2-root .c2v2-share-status{color:#ffe19a;font-weight:800}',
 '.c2v2-restart{display:block;margin:28px auto 0;padding:12px 16px;background:transparent;border:0;color:#c2d4e0;font-size:14px;text-decoration:underline;cursor:pointer;min-height:48px}',
 '.c2v2-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:50;display:grid;place-items:center;padding:16px}',
 '.c2v2-modal{width:min(100%,440px);background:#153047;border:1px solid #8fa8b8;border-radius:17px;padding:24px;color:#fff}',
 '.c2v2-modal h2{font-size:26px;line-height:1.3;margin:10px 0}.c2v2-modal p{font-size:15px;line-height:1.7}',
 ".c2v2-code{background:#10273a;padding:10px;border-radius:9px;font-size:14px!important;word-break:break-word}",
 "@media(max-width:350px){.c2v2-hero-art{opacity:.45;right:-3px}.c2v2-hero h1,.c2v2-hero>p{max-width:90%}.c2v2-hero{min-height:342px}}",
 '@media(prefers-reduced-motion:reduce){.c2v2-root *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}'
].join('');
