import React,{useMemo,useState} from 'react';
import {evaluateChapter3} from '../../../scripts/chapter3-insight-engine-v1.mjs';
import {JOB_CHARACTER_ASSETS} from '../money-personality/job-character-assets-v1';

type Goal='home'|'family'|'travel'|'invest'|'challenge'|'safety'|'retirement'|'undecided';
type Stage='intro'|'goal'|'future'|'preserve'|'when'|'readiness'|'reward';
type Job=keyof typeof JOB_CHARACTER_ASSETS;

const GOALS:ReadonlyArray<{id:Goal;label:string;icon:string}>= [
 {id:'home',label:'住まい',icon:'⌂'},{id:'family',label:'家族・教育',icon:'✿'},
 {id:'travel',label:'旅行・趣味',icon:'✈'},{id:'invest',label:'資産形成',icon:'✧'},
 {id:'challenge',label:'独立・挑戦',icon:'⚑'},{id:'safety',label:'もしもの備え',icon:'◇'},
 {id:'retirement',label:'老後',icon:'☼'},{id:'undecided',label:'まだ決めていない',icon:'？'},
];
const FUTURES:Record<Goal,{question:string;answers:string[]}>={
 home:{question:'その家で、どんな毎日を送りたい？',answers:['家族とゆったり暮らしたい','好きな場所で自由に暮らしたい','住居費の不安を減らしたい']},
 family:{question:'家族のどんな未来を守りたい？',answers:['子どもの選択肢を増やしたい','家族で過ごす時間を増やしたい','大切な人の生活を支えたい']},
 travel:{question:'どんな時間が過ごせたら最高？',answers:['毎年、家族で旅行に行きたい','好きな趣味をずっと楽しみたい','思い立ったときに旅に出たい']},
 invest:{question:'お金が増えたら、何を叶えたい？',answers:['仕事を減らして自由な時間を増やしたい','家族との暮らしに余裕を持ちたい','将来の選択肢を増やしたい']},
 challenge:{question:'挑戦の先に、どんな自分がいる？',answers:['自分のお店を持ちたい','新しい仕事に挑戦したい','会社に頼らず働けるようになりたい']},
 safety:{question:'どんなときにも、何を守りたい？',answers:['家族の暮らしを守りたい','急な出費にも落ち着いていたい','働けない時期に備えたい']},
 retirement:{question:'仕事を減らした先、どんな毎日がいい？',answers:['家族と旅行を楽しみたい','趣味に使える時間を増やしたい','生活費の心配を減らしたい']},
 undecided:{question:'これからも残しておきたい自由は？',answers:['やりたいことを選べる余裕','急な変化にも対応できる安心','まだ決めなくていい自由']},
};
const PRESERVE=['家族や大切な人との時間','普段の外食や休日の楽しみ','安心して暮らせる貯蓄','今の生活水準','まだ分からない'];
const WHEN=['1年以内','3年くらい','5年くらい','10年以上先','まだ決めていない'];
const READY=[
 {id:'starting',label:'これから考えるところ',note:'時期や金額はまだ分からない'},
 {id:'cost',label:'必要な金額は少し考えた',note:'今の準備との照合はこれから'},
 {id:'preparing',label:'積立や貯蓄をしている',note:'その計画で足りるかは未確認'},
 {id:'reviewed',label:'一通り計画を確認した',note:'追加で不安を作る必要はない'},
] as const;
type Readiness=typeof READY[number]['id'];
const POSES={
 intro:'MUDAGIRI_POSE_03_GUIDE.webp',goal:'MUDAGIRI_POSE_07_QUESTION.webp',
 future:'MUDAGIRI_POSE_05_LISTEN.webp',preserve:'MUDAGIRI_POSE_04_EXPLAIN.webp',
 when:'MUDAGIRI_POSE_06_THINK.webp',readiness:'MUDAGIRI_POSE_20_CHECK.webp',
 reward:'MUDAGIRI_POSE_23_RESULT.webp',
};
const pose=(id:Stage)=>'./assets/mudagiri/poses/v1/'+POSES[id];
const format=(value:number|null|undefined)=>typeof value==='number'?new Intl.NumberFormat('ja-JP').format(value)+'円':'未取得';
const title=(goal:Goal|null)=>GOALS.find(g=>g.id===goal)?.label??'まだ選んでいない';

export default function Chapter3RpgPilot(){
 const [stage,setStage]=useState<Stage>('intro');
 const [jobCode,setJobCode]=useState<Job>('INM');
 const [inherit,setInherit]=useState(true);
 const [inheritedGoal,setInheritedGoal]=useState<Goal>('travel');
 const [goal,setGoal]=useState<Goal|null>('travel');
 const [future,setFuture]=useState('');
 const [preserve,setPreserve]=useState('');
 const [when,setWhen]=useState('');
 const [readiness,setReadiness]=useState<Readiness|null>(null);
 const [free,setFree]=useState(false);
 const [custom,setCustom]=useState('');
 const [calcOpen,setCalcOpen]=useState(false);
 const [target,setTarget]=useState('');
 const [earmarked,setEarmarked]=useState('');
 const [months,setMonths]=useState('');
 const [shareGoal,setShareGoal]=useState(false);

 const selectDemoGoal=(g:Goal)=>{setInheritedGoal(g);setGoal(g);setFuture('');};
 const reset=()=>{setStage('intro');setFuture('');setPreserve('');setWhen('');setReadiness(null);setCalcOpen(false);setShareGoal(false);setFree(false);setCustom('');setTarget('');setEarmarked('');setMonths('');setGoal(inherit?inheritedGoal:null);};
 const start=()=>{setGoal(inherit?inheritedGoal:null);setStage(inherit?'future':'goal');};
 const chooseGoal=(g:Goal)=>{setGoal(g);setFuture('');setStage('future');};
 const previous=()=>{
  const order:Stage[]=['intro',...(inherit?[]:['goal' as Stage]),'future','preserve','when','readiness','reward'];
  const i=order.indexOf(stage);setStage(order[Math.max(0,i-1)]);
 };
 const goFuture=(s:string)=>{setFuture(s==='まだ具体的には決まっていない'?'':s);setFree(false);setStage('preserve');};
 const goReadiness=(r:Readiness)=>{setReadiness(r);setStage('reward');};
 const job=JOB_CHARACTER_ASSETS[jobCode];
 const result=useMemo(()=>{
  const costKnown=readiness==='cost'||readiness==='reviewed';
  const prepKnown=readiness==='preparing'||readiness==='reviewed';
  return evaluateChapter3({
   anonymousUserId:'CH3_PILOT_FIXTURE_ONLY',
   chapter1:{anonymousUserId:'CH3_PILOT_FIXTURE_ONLY',sessionId:'demo-ch1',jobCode,primaryStyle:'ENJOY'},
   chapter2:{anonymousUserId:'CH3_PILOT_FIXTURE_ONLY',diagnosisId:'demo-ch2',selectedGoal:inherit?inheritedGoal:null,confirmedA:0,cUpper:12000,protectedCategories:['food']},
   chapter3:{goal,desiredFuture:future,preserve,when,planReviewed:readiness==='reviewed'?'yes':'no',costKnown,preparationKnown:prepKnown,shareGoal,
    ...(calcOpen?{optionalMath:{requested:true,targetYen:Number(target),earmarkedYen:Number(earmarked),monthsUntil:Number(months)}}:{})}
  });
 },[jobCode,inherit,inheritedGoal,goal,future,preserve,when,readiness,shareGoal,calcOpen,target,earmarked,months]);
 const steps:Stage[]=['future','preserve','when','readiness'];
 const currentIdx=steps.indexOf(stage),isReward=stage==='reward';
 const talk=stage==='intro'?'家計の鑑定、おつかれ！今度は、その戦果を何のために使うか考えてみようぜ。'
  :stage==='goal'?'どんな未来を目指したい？まだ決めてなくても大丈夫だぞ。'
  :stage==='future'?'どんな未来が叶ったらうれしい？君の言葉で教えてくれ。'
  :stage==='preserve'?'そこへ向かう途中で、大事にしておきたいものは何だ？'
  :stage==='when'?'その未来、いつ頃になったら叶えたい？決まってなくてもOKだ。'
  :stage==='readiness'?'今、どこまで準備できてる？分からないことがあっても問題ないぞ。'
  :'未来の羅針盤を獲得！今までの冒険の記録が一つにつながったな。';
 return <main className={'c3p c3p--'+stage}>
  <div className="c3p-world" aria-hidden="true"/>
  <div className="c3p-shell">
   <header className="c3p-top">
    <span className="c3p-brand">⚜ ムダギリ診断</span>
    <span className="c3p-pilot-label">第3章｜デモデータ・保存/送信なし</span>
   </header>
   <div className="c3p-hud">
    <div className="c3p-job"><img src={job.file} alt="" /><span><small>第1章で獲得したJOB</small><b>{job.name}</b></span></div>
    <div className="c3p-progress"><span>第1章 ✓</span><span>第2章 ✓</span><strong>第3章 {isReward?'✓':currentIdx>=0?(currentIdx+1)+'/4':'開始'}</strong></div>
   </div>
   <div className="c3p-scene">
    <div className="c3p-emblem" aria-hidden="true">✧</div>
    <small>{isReward?'QUEST COMPLETE':stage==='intro'?'NEXT QUEST':'FUTURE MAP ・ 新しい冒険'}</small>
    <h1>{stage==='intro'?'未来攻略クエスト':isReward?'未来の羅針盤、解放！':'未来の地図をひらこう'}</h1>
    <div className="c3p-dialogue" aria-live="polite">
     <img src={pose(stage)} alt="ムダギリくん" />
     <div><b>ムダギリくん</b><p>{talk}</p></div>
    </div>
   </div>
   {stage==='intro'&&<section className="c3p-panel">
    <span className="c3p-kicker">ADVENTURE RECORD / 引き継いだ戦果</span>
    <div className="c3p-reward-grid">
     <div><small>第2章 確認済み改善額</small><b>0円 / 月</b></div>
     <div><small>未鑑定の宝箱・月最大</small><b>12,000円</b><em>未確定の参考上限</em></div>
    </div>
    <p className="c3p-hint">この数字は架空のデモ用。確認済みでも実際に貯まったお金とは限らず、未鑑定額を足して使えるお金とは扱わない。</p>
    <div className="c3p-divider"/>
    <label className="c3p-field-label" htmlFor="c3p-job-select">試したい第1章JOB（デモ）</label>
    <select id="c3p-job-select" className="c3p-select" value={jobCode} onChange={e=>setJobCode(e.target.value as Job)}>
     {Object.entries(JOB_CHARACTER_ASSETS).map(([code,j])=><option key={code} value={code}>{j.name}</option>)}
    </select>
    <label className="c3p-check"><input type="checkbox" checked={inherit} onChange={e=>{setInherit(e.target.checked);setGoal(e.target.checked?inheritedGoal:null);}}/> 第2章の未来選択を引き継ぐ（デモ）</label>
    {inherit&&<div className="c3p-select-line"><span>目指す未来</span><select aria-label="第2章で選んだ未来のデモ値" value={inheritedGoal} onChange={e=>selectDemoGoal(e.target.value as Goal)}>{GOALS.map(g=><option value={g.id} key={g.id}>{g.label}</option>)}</select></div>}
    <button className="c3p-primary" onClick={start}>未来の地図へ進む <span aria-hidden="true">→</span></button>
   </section>}
   {stage==='goal'&&<section className="c3p-panel">
    <span className="c3p-kicker">DESTINATION / 目的地</span>
    <h2>まず、どこへ向かいたい？</h2>
    <div className="c3p-options c3p-options--grid">{GOALS.map(g=><button key={g.id} onClick={()=>chooseGoal(g.id)}><span className="c3p-option-icon">{g.icon}</span><b>{g.label}</b><span className="c3p-arrow">›</span></button>)}</div>
   </section>}
   {stage==='future'&&<section className="c3p-panel">
    <span className="c3p-kicker">DESTINATION / {title(goal)}</span>
    <h2>{goal?FUTURES[goal].question:'どんな未来を目指す？'}</h2>
    <p className="c3p-small">正解はないぞ。近いものを一つ選んでね。</p>
    <div className="c3p-options">{goal&&FUTURES[goal].answers.map(s=><button key={s} onClick={()=>goFuture(s)}>{s}<span className="c3p-arrow">›</span></button>)}
     <button onClick={()=>setFree(x=>!x)} aria-expanded={free}>自分の言葉で書きたい <span className="c3p-arrow">{free?'−':'＋'}</span></button>
     {free&&<div className="c3p-custom"><label htmlFor="c3p-custom-input">叶えたい未来</label><textarea id="c3p-custom-input" maxLength={120} value={custom} onChange={e=>setCustom(e.target.value)} placeholder="例：55歳から週3日だけ働きたい"/><button disabled={!custom.trim()} onClick={()=>goFuture(custom.trim())}>この未来で進む →</button></div>}
     <button className="c3p-soft-option" onClick={()=>goFuture('まだ具体的には決まっていない')}>まだ具体的には決まっていない</button>
    </div>
   </section>}
   {stage==='preserve'&&<section className="c3p-panel">
    <span className="c3p-kicker">IMPORTANT / 守りたいもの</span><h2>何を大切にしたまま、進みたい？</h2>
    <div className="c3p-options">{PRESERVE.map(s=><button key={s} onClick={()=>{setPreserve(s);setStage('when');}}>{s}<span className="c3p-arrow">›</span></button>)}</div>
    <p className="c3p-hint">第2章で「守る」と判定した支出を、勝手に削減対象にはしない。</p>
   </section>}
   {stage==='when'&&<section className="c3p-panel">
    <span className="c3p-kicker">TIME / 実現する時期</span><h2>その未来は、いつ頃？</h2>
    <div className="c3p-options">{WHEN.map(s=><button key={s} onClick={()=>{setWhen(s==='まだ決めていない'?'':s);setStage('readiness');}}>{s}<span className="c3p-arrow">›</span></button>)}</div>
   </section>}
   {stage==='readiness'&&<section className="c3p-panel">
    <span className="c3p-kicker">EQUIPMENT / 今の準備</span><h2>今、どこまで考えている？</h2>
    <div className="c3p-options">{READY.map(s=><button key={s.id} onClick={()=>goReadiness(s.id)}><span><b>{s.label}</b><small>{s.note}</small></span><span className="c3p-arrow">›</span></button>)}</div>
    <p className="c3p-hint">ここで「計画済み」と答えても、十分性を判定するものではありません。</p>
   </section>}
   {isReward&&<section className="c3p-panel c3p-panel--result">
    <div className="c3p-artifact"><span aria-hidden="true">✦</span><b>未来の羅針盤</b><small>伝説のアイテム獲得</small></div>
    <span className="c3p-kicker">未来攻略書 / {title(goal)}</span>
    <h2>{result.insight.headline}</h2>
    <p className="c3p-summary">{result.insight.explanation}</p>
    <div className="c3p-evidence"><strong>その理由は、この冒険記録にある</strong>
     {result.insight.evidence.slice(0,4).map((e,i)=><p key={i}><span>{i+1}</span>{e.text}</p>)}
    </div>
    <div className="c3p-next"><small>次の攻略アクション</small><strong>{result.insight.action}</strong></div>
    <div className="c3p-reward-grid">
     <div><small>第2章 確認済み</small><b>{format(result.financial?.confirmedA)}</b></div>
     <div><small>未確定の見直し候補・月最大</small><b>{format(result.financial?.cUpper)}</b><em>使える資金ではない</em></div>
    </div>
    <p className="c3p-hint">金額はデモ値。確認済み改善額と未確定候補を合算しない。実際の計画の十分性はここでは判定できない。</p>
    <button className="c3p-secondary" onClick={()=>setCalcOpen(x=>!x)} aria-expanded={calcOpen}>{calcOpen?'追加試算を閉じる −':'条件を入れて簡単に計算する ＋'}</button>
    {calcOpen&&<div className="c3p-calc">
      <p>この目的のための資金だけで計算します。運用益や物価変動を含まない単純試算です。</p>
      <label>目標金額（円）<input type="number" min="1" max="1000000000000" step="1" inputMode="numeric" value={target} onChange={e=>setTarget(e.target.value)} placeholder="例：400000"/></label>
      <label>この目的に使える現在の資金（円）<input type="number" min="0" max="1000000000000" step="1" inputMode="numeric" value={earmarked} onChange={e=>setEarmarked(e.target.value)} placeholder="例：40000"/></label>
      <label>目標までの月数<input type="number" min="1" max="1200" step="1" inputMode="numeric" value={months} onChange={e=>setMonths(e.target.value)} placeholder="例：12"/></label>
      {target&&earmarked&&months&&result.math?.status==='arithmetic_only'?<div className="c3p-math-result"><small>毎月同じ額を準備するなら</small><b>{format(result.math.monthlyYen)} / 月</b><p>{result.math.assumption}</p></div>:<p className="c3p-hint">3つの数字を入力すると、条件付きの単純計算を表示します。</p>}
    </div>}
    <label className="c3p-check"><input type="checkbox" checked={shareGoal} onChange={e=>setShareGoal(e.target.checked)}/> 共有カードに「未来の目的地アイコン」を入れてよい（デモ設定）</label>
    <div className="c3p-private-card"><span>SHARE PREVIEW / 公開してもよい情報だけ</span><p>⚜ {job.name} ・ 第3章クリア{result.shareSafe.goalIconCode?' ・ '+title(goal):''}</p><small>氏名・家計金額・家族の事情・相談内容は載せない</small></div>
    <div className="c3p-consult"><span>OPTIONAL QUEST</span><h3>未来の攻略作戦会議</h3><p>{result.optionalConsultation.copy}</p><small>デモのため実際の相談予約には接続していません。攻略書は予約なしで受け取れます。</small></div>
    <button className="c3p-primary" onClick={reset}>もう一度試す ↻</button>
   </section>}
   {stage!=='intro'&&stage!=='reward'&&<button className="c3p-back" onClick={previous}>← ひとつ前へ戻る</button>}
   <footer className="c3p-footer">CHAPTER 3 PILOT ・ 存在しない資産額や将来利益は表示しません</footer>
  </div>
 </main>;
}
