import {evaluateChapter3} from "./engine.mjs";

const JOBS={
 FDM:{name:"先回り司令官",img:"JOB_01_FDM_elephant.webp"},
 FDP:{name:"節目軍師",img:"JOB_02_FDP_squirrel.webp"},
 FNM:{name:"兆しの占星術師",img:"JOB_03_FNM_blue_bird.webp"},
 FNP:{name:"ひらめき航海士",img:"JOB_04_FNP_turtle.webp"},
 IDM:{name:"メリハリ賢者",img:"JOB_05_IDM_octopus.webp"},
 IDP:{name:"戦術ハンター",img:"JOB_06_IDP_spider.webp"},
 INM:{name:"直感魔導士",img:"JOB_07_INM_cuttlefish.webp"},
 INP:{name:"風読み剣士",img:"JOB_08_INP_peregrine.webp"},
};
const FORCE_LABEL={active:"活用中",interested:"興味あり",notNow:"今は選んでいない",unknown:"未確認"};
const STYLES={DRIVE:"前進",ENJOY:"楽しさ",SECURE:"安心",OPTIMIZE:"納得"};
const TOPIC_LABELS={investBasics:"資産運用の基本",propertyLearning:"不動産と借入の仕組み",sideWork:"副業",career:"転職・キャリア",skills:"スキルアップ",insurance:"保障の見直し",budget:"家計の見直し",consult:"ライフプラン相談"};
const base={goal:"future",horizon:"over10",forces:{capital:"interested",time:"active",credit:"unknown"},concern:"none",topics:["investBasics"]};
const defaults={
 chapter1:{verified:true,anonymousUserId:"chapter3-pilot",job:"FDM",style:"DRIVE"},
 chapter2:{verified:true,anonymousUserId:"chapter3-pilot",sourceVersion:"DEMO_ONLY",confirmedSavingMonthlyJPY:1800,reviewCandidateUpperMonthlyJPY:12300}
};
const cases=[
 {id:"household",name:"① 生活費・返済が心配",answers:{goal:"stability",concern:"debt",topics:["propertyLearning","consult"],forces:{capital:"notNow",time:"notNow",credit:"interested"}},chapter1:{job:"IDM",style:"SECURE"},chapter2:{confirmedSavingMonthlyJPY:0,reviewCandidateUpperMonthlyJPY:15000}},
 {id:"short_active",name:"② 3年以内 × 積立中",answers:{horizon:"under3",topics:["investBasics"],forces:{capital:"notNow",time:"active",credit:"unknown"}},chapter1:{job:"FDP",style:"OPTIMIZE"}},
 {id:"short",name:"③ 3年以内 × 未運用",answers:{horizon:"under3",forces:{capital:"notNow",time:"notNow",credit:"unknown"},topics:["resultOnly"]},chapter1:{job:"FNM",style:"ENJOY"},chapter2:{confirmedSavingMonthlyJPY:0,reviewCandidateUpperMonthlyJPY:0}},
 {id:"no_goal",name:"④ 目標・時期が未定",answers:{goal:"undecided",horizon:"unknown",topics:["resultOnly"]},chapter1:{job:"FNP",style:"ENJOY"},chapter2:null},
 {id:"earning",name:"⑤ 副業・転職に関心",answers:{goal:"freedom",horizon:"threeTo10",topics:["sideWork","career"],forces:{capital:"notNow",time:"notNow",credit:"unknown"}},chapter1:{job:"IDP",style:"DRIVE"}},
 {id:"existing",name:"⑥ 長期積立に取組中",answers:{goal:"retirement",horizon:"over10",topics:["investBasics","consult"]},chapter1:{job:"INM",style:"OPTIMIZE"}},
 {id:"borrowing",name:"⑦ 融資型投資に関心",answers:{goal:"future",horizon:"threeTo10",topics:["propertyLearning"],forces:{capital:"notNow",time:"notNow",credit:"interested"}},chapter1:{job:"INP",style:"SECURE"}},
 {id:"start",name:"⑧ 初めて知る人",answers:{goal:"family",horizon:"threeTo10",topics:["insurance"],forces:{capital:"unknown",time:"unknown",credit:"unknown"}},chapter1:null,chapter2:null}
];
function makeInput(x){
 const a={...base,...x.answers,forces:{...base.forces,...(x.answers.forces||{})}};
 return {anonymousUserId:"chapter3-pilot",answers:a,chapter1:x.chapter1?{...defaults.chapter1,...x.chapter1}:null,chapter2:x.chapter2===null?null:{...defaults.chapter2,...(x.chapter2||{})}};
}
const baseAssets="../../assets/";
const jobBase=baseAssets+"jobs/v1/";
const poseBase=baseAssets+"mudagiri/poses/v1/";
const pose=poseBase+"MUDAGIRI_POSE_23_RESULT.webp";
const nextBg=baseAssets+"mudagiri/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp";
const gold=n=>"¥"+new Intl.NumberFormat("ja-JP").format(n);
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function statusCard(icon,title,val,detail){
 return `<div class="force-card"><div class="force-icon" aria-hidden="true">${icon}</div><div class="force-name">${safe(title)}</div><div class="force-status">${safe(FORCE_LABEL[val])}</div><p>${safe(detail)}</p></div>`;
}
let current=5;
let result;
function render(){
 const x=cases[current];result=evaluateChapter3(makeInput(x));
 const root=document.getElementById("chapter3-result-root");
 if(!result.ok){root.textContent="テスト入力が不正です："+result.errors.join(", ");return;}
 const job=result.chapter1?JOBS[result.chapter1.job]:null;
 const ch2=result.chapter2;
 const noInterest=result.topicIds.length===0;
 const action=result.primaryAction;
 document.title="未来の作戦書｜"+result.insight.title+"｜第3章";
 root.innerHTML=`
 <div class="preview-bar">
   <span class="preview-pill">ISOLATED DEMO</span>
   <span>第3章 V1.1｜架空データ・送信なし・本番未反映</span>
 </div>
 <div class="demo-picker"><label for="scenario"><span class="label-top">CASE SELECTOR</span> 8結果パターンを切替</label>
 <select id="scenario" aria-label="テストケースを変更">${cases.map((o,i)=>`<option value="${i}" ${i===current?"selected":""}>${safe(o.name)}</option>`).join("")}</select></div>
 <div class="chapter-track" aria-label="冒険の進行"><span>第一章<br><strong>冒険者</strong></span><b>›</b><span>第二章<br><strong>家計の戦果</strong></span><b>›</b><span class="active">第三章<br><strong>未来の作戦</strong></span></div>
 <section class="quest-hero" style="--hero-bg:url('${nextBg}')">
    <div class="sky-glow" aria-hidden="true"></div>
    <p class="eyebrow">CHAPTER 03 · FUTURE QUEST</p>
    <h1>未来の作戦書を獲得！</h1>
    <p class="hero-sub"><span>今回の発見</span><strong>${safe(result.insight.title)}</strong></p>
    <div class="crest" aria-hidden="true">✧ <span>III</span> ✧</div>
    <div class="hero-avatars">
       <div class="job-portrait">${job?`<img src="${jobBase+job.img}" alt="第1章で獲得した${safe(job.name)}" loading="eager" /><p>${safe(job.name)} <small>· ${safe(STYLES[result.chapter1.style])}</small></p>`:`<div class="no-job">冒険者は<br>未連携</div>`}</div>
       <div class="guide-character"><img src="${pose}" alt="ムダギリくんが結果を案内" loading="eager" /></div>
    </div>
    <div class="mudagiri-bubble"><span class="bubble-title">ムダギリくん</span><p>家計の戦い、おつかれさま！ 今度は未来の作戦を考えてみよう。</p></div>
 </section>
 <div class="content-stack">
   <section class="parchment insight" aria-labelledby="insight-h">
     <p class="section-kicker">01 · 今回見つかった大事な問い</p>
     <div class="insight-icon" aria-hidden="true">✦</div>
     <h2 id="insight-h">${safe(result.insight.title)}</h2>
     <p class="key-question">${safe(result.insight.question)}</p>
     <div class="reason-label">なぜ今、これを考える？</div>
     <p class="reason-text">${safe(result.insight.why)}</p>
     <div class="today-step"><strong>今日の一歩</strong><p>${safe(result.insight.action)}</p></div>
     ${result.insight.styleLine?`<p class="style-line">${safe(result.insight.styleLine)}</p>`:""}
   </section>
   <section class="glass" aria-labelledby="ch2-h">
      <p class="section-kicker">02 · 前のクエストから</p><h2 id="ch2-h">家計の戦果を引き継ぐ</h2>
      ${ch2?`<div class="two-figures"><div><span>回答から確認された改善額</span><strong>${ch2.confirmedSavingMonthlyJPY===null?"未連携":gold(ch2.confirmedSavingMonthlyJPY)}<small>${ch2.confirmedSavingMonthlyJPY===null?"":"/月"}</small></strong></div><div><span>追加で確認したい見直し候補</span><strong>${ch2.reviewCandidateUpperMonthlyJPY===null?"未連携":gold(ch2.reviewCandidateUpperMonthlyJPY)}<small>${ch2.reviewCandidateUpperMonthlyJPY===null?"":"/月"}</small></strong></div></div><p class="muted">二つの額は合算しません。確認された改善額も、変更や現金確保が完了した金額とは限りません。見直し候補は未確定です。</p>`:`<p class="empty-state">第2章の結果はまだ引き継いでいません。家計の金額は表示しません。</p>`}
   </section>
   <section class="glass" aria-labelledby="forces-h">
      <p class="section-kicker">03 · 今使っている3つの力</p><h2 id="forces-h">3つの力の現在地</h2>
      <div class="forces">${statusCard("◈","お金の力",result.threeForces.capital,"今ある元本を活かす")}${statusCard("⌛","時間の力",result.threeForces.time,"積立や長期の継続")}${statusCard("◇","信用力の活用",result.threeForces.credit,"借入を使う方法")}</div>
      <p class="muted">これは活用状況・関心の表示です。成績表でも融資可能性の判定でもありません。全部使う必要はありません。</p>
      <details class="explainer"><summary>3つの力と「稼ぐ力」の違いを知る <span>＋</span></summary>
         <div class="exp-body"><p><b>お金：</b>今ある元本を使う。生活費や緊急資金の確保も大事。</p><p><b>時間：</b>長期や積立を活用する。ただし長期でも元本割れはあり得る。</p><p><b>借入：</b>レバレッジによって損失・返済負担も拡大し得る。</p><p><b>稼ぐ力：</b>仕事・副業・転職・スキルアップを通じた収入面の選択肢。</p></div></details>
   </section>
   <section class="next-quest" aria-labelledby="next-h">
     <p class="section-kicker">04 · 次のクエスト</p><h2 id="next-h">ここからは、自分で選べる</h2>
     <p>${noInterest?"この作戦書を受け取って、ここで冒険を終えてもOK。":"今気になっている選択肢から、必要な情報を確認しよう。"}</p>
     <button type="button" id="primary" class="primary">${safe(action.label)} <span aria-hidden="true">→</span></button>
     ${action.kind!=="consult_interest"?`<button type="button" id="consult" class="secondary">ライフプラン相談で整理する</button>`:""}
     <p class="muted">この画面は隔離デモです。クリックしても外部サイト・予約・LINE・提携先には送信しません。</p>
     <div id="action-panel" class="action-panel" hidden aria-live="polite"></div>
   </section>
   <section class="parchment closing" aria-label="共有と検証">
     <p class="section-kicker">05 · 冒険の記録</p>
     <h2>冒険者カードを持ち帰ろう</h2>
     <p>共有する内容に家計額・借入・関心領域は含めない。</p>
     <button type="button" id="sharePreview" class="outline-dark">共有カードの内容を見る</button>
     <div id="share-panel" hidden class="share-panel" aria-live="polite"></div>
   </section>
   <footer><span>MUDA GIRI · CHAPTER III</span><p>無料学習用のプロトタイプ。金融商品の推奨・融資審査・正式な相談予約は実施しません。</p></footer>
 </div>`;
 document.getElementById("scenario").addEventListener("change",e=>{current=Number(e.target.value);render();window.scrollTo({top:0,behavior:"instant"});});
 document.getElementById("primary").addEventListener("click",()=>showAction(action));
 document.getElementById("consult")?.addEventListener("click",()=>showAction({kind:"consult_interest",label:"ライフプラン相談"}));
 document.getElementById("sharePreview").addEventListener("click",()=>{
   const el=document.getElementById("share-panel");
   el.hidden=!el.hidden;
   el.innerHTML=`<strong>ムダギリ診断｜未来クエストをクリア！</strong><p>${safe(job?"冒険者："+job.name:"自分の未来を考えよう")}</p><small>金額・目標・借入情報は共有しません。これはシェア文面の確認用で、投稿は行いません。</small>`;
 });
}
function showAction(action){
 const el=document.getElementById("action-panel");
 el.hidden=false;
 if(action.kind==="save"){
   el.innerHTML=`<strong>作戦書はここで完成！</strong><p>デモのため保存・外部送信はしていません。必要なときにもう一度確認できます。</p>`;
 }else if(action.kind==="consult_interest"){
   el.innerHTML=`<strong>ライフプラン相談で整理できること</strong><p>目標・時期・家計・収入・保障・リスクを確認し、次に比較したい条件を一緒に整理する入口です。</p><p class="muted">本番では予約フォームの説明・任意同意・予約確定の照合が必要です。このデモからは予約できません。</p>`;
 }else{
   const names=result.topicIds.map(x=>TOPIC_LABELS[x]||x).join("／");
   el.innerHTML=`<strong>学習候補：${safe(names)}</strong><p>仕組み、費用、リスク、どんな条件を確認すべきかを先に学ぶ導線です。</p>${result.safeEducationFirst?'<p class="safety">生活費・返済負担について回答があるため、借入や投資を勧めず一般的な学習から始めます。</p>':""}<p class="muted">まだ提携案件は掲載していません。本人が希望していない送客は行いません。</p>`;
 }
 el.scrollIntoView({behavior:"smooth",block:"nearest"});
}
render();
