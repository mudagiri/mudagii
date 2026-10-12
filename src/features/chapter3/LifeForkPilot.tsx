import React,{useMemo,useState} from 'react';
import {compareTravel,compareWork,makeMeetingPreview} from '../../../scripts/chapter3-life-fork-v21.mjs';
import {JOB_CHARACTER_ASSETS} from '../money-personality/job-character-assets-v1';

type Goal='travel'|'work';
type Step='intro'|'wish'|'fork'|'reward';
type Wish='childTime'|'loved'|'solo'|'unfixed'|'partTime'|'jobChange'|'open';
type Route='a'|'b'|'c';
type FactOption={id:Wish;label:string;sub:string};
const travelWishes:FactOption[]=[
 {id:'childTime',label:'子どもが今の年齢のうちに',sub:'その時期の旅行を大切にしたい'},
 {id:'loved',label:'大切な人と毎年ずっと',sub:'一緒に過ごす時間を増やしたい'},
 {id:'solo',label:'自分の好きなときに',sub:'好きな場所へ気軽に出かけたい'},
 {id:'unfixed',label:'まだ決めていない',sub:'選択肢だけ見てみたい'}
];
const workWishes:FactOption[]=[
 {id:'partTime',label:'働く日数を減らしたい',sub:'自分の時間を増やせたら'},
 {id:'jobChange',label:'仕事を変える自由がほしい',sub:'安心して次へ進めたら'},
 {id:'open',label:'まだ目的は決めていない',sub:'今は選択肢を残したい'}
];
const poseFile=(step:Step)=>'./assets/mudagiri/poses/v1/'+({
 intro:'MUDAGIRI_POSE_03_GUIDE.webp',
 wish:'MUDAGIRI_POSE_05_LISTEN.webp',
 fork:'MUDAGIRI_POSE_06_THINK.webp',
 reward:'MUDAGIRI_POSE_23_RESULT.webp'
} as Record<Step,string>)[step];
const yen=(n:number|null|undefined)=>typeof n==='number'?new Intl.NumberFormat('ja-JP').format(n)+'円':'未入力';
const parseYen=(s:string)=>/^(0|[1-9]\d*)$/.test(s.trim())&&Number.isSafeInteger(Number(s))?Number(s):null;

export default function LifeForkPilot(){
 const [step,setStep]=useState<Step>('intro');
 const [goal,setGoal]=useState<Goal>('travel');
 const [wish,setWish]=useState<Wish|null>(null);
 const [years,setYears]=useState<number|null>(null);
 const [trips,setTrips]=useState<number|null>(null);
 const [cost,setCost]=useState('');
 const [altCost,setAltCost]=useState('');
 const [early,setEarly]=useState<number|null>(null);
 const [late,setLate]=useState<number|null>(null);
 const [end,setEnd]=useState<number|null>(null);
 const [workNow,setWorkNow]=useState<number|null>(null);
 const [workWant,setWorkWant]=useState<number|null>(null);
 const [incomeGap,setIncomeGap]=useState('');
 const [route,setRoute]=useState<Route|null>(null);
 const [showDetails,setShowDetails]=useState(false);
 const [shareTheme,setShareTheme]=useState(false);
 const [meetingInterest,setMeetingInterest]=useState(false);
 const [sawIt,setSawIt]=useState<'new'|'knew'|'unknown'|null>(null);
 const [sample,setSample]=useState(false);
 const reset=()=>{
  setStep('intro');setGoal('travel');setWish(null);setYears(null);setTrips(null);
  setCost('');setAltCost('');setEarly(null);setLate(null);setEnd(null);
  setWorkNow(null);setWorkWant(null);setIncomeGap('');setRoute(null);
  setShowDetails(false);setShareTheme(false);setMeetingInterest(false);setSawIt(null);setSample(false);
 };
 const travel=useMemo(()=>compareTravel({windowYears:years,tripsPerYear:trips,
  costPerTripYen:parseYen(cost),alternativeCostPerTripYen:parseYen(altCost)}),[years,trips,cost,altCost]);
 const work=useMemo(()=>compareWork({earlyAge:early,lateAge:late,endAge:end,
  currentWorkdays:workNow,desiredWorkdays:workWant,monthlyNetIncomeDifferenceYen:parseYen(incomeGap)}),
 [early,late,end,workNow,workWant,incomeGap]);
 const eligibleForTravelMath=goal==='travel'&&wish!==null&&wish!=='unfixed';
 const eligibleForWorkMath=goal==='work'&&wish==='partTime';
 const numReady=(goal==='travel'?eligibleForTravelMath&&travel.status==='ready':eligibleForWorkMath&&work.status==='ready');
 const pathName=(r:Route)=>{
  if(goal==='travel'){
   if(!eligibleForTravelMath||travel.status!=='ready')return r==='a'?'無理に決めず大切な時期を考える':'旅行の回数を選んでみる';
   if(r==='a')return '年'+travel.scenarioA.timesPerYear+'回のペース';
   if(r==='b')return '年'+travel.scenarioB.timesPerYear+'回のペース';
   return '回数を守って1回の予算を変える';
  }
  if(!eligibleForWorkMath||work.status!=='ready')return r==='a'?'今の仕事を続けながら考える':'働き方を変える条件を整理する';
  return r==='a'?work.scenarioA.startAge+'歳から働く日数を変える':work.scenarioB.startAge+'歳から働く日数を変える';
 };
 const meeting=makeMeetingPreview({
  type:goal,chosenPath:route,travel:eligibleForTravelMath&&travel.status==='ready'?travel:null,
  work:eligibleForWorkMath&&work.status==='ready'?work:null,keepEverydayJoy:goal==='travel'
 });
 const focus=goal==='travel'
  ?wish==='childTime'?'本人が大事にしている「今の時期」に、どんな機会を残したいか'
   :wish==='loved'?'これから先、大切な人と過ごす機会をどうつくるか'
   :wish==='solo'?'自分の自由な時間をどんなペースで楽しむか'
   :'焦って決めず、今の選択肢を残すこと'
  :wish==='partTime'?'働く時間を減らし始める時期で、人生の予定がどう変わるか'
   :wish==='jobChange'?'仕事を変える自由を得るために、何を備えておきたいか'
   :'今は決めずに、将来の選択肢を残すこと';
 const nextAction=goal==='travel'
  ?travel.status==='ready'&&eligibleForTravelMath?'次の旅行について、時期と実際に使う予算を一つ決める':'いつ頃、年何回の体験を増やしたいか考える'
  :work.status==='ready'&&eligibleForWorkMath?'働き方を変えた後の生活費と継続収入を同じ基準で比較する':'どんな働き方を選べると嬉しいか、条件を一つ整理する';
 const talk=step==='intro'?'前の冒険で、守るものと見直し候補が見えたな。今度は「何を増やしたいか」を探しに行こうぜ。'
  :step==='wish'?'お金を増やすのは手段だろ？その先、いつのどんな毎日がほしいんだ？'
  :step==='fork'?'同じ願いでも、どの道を選ぶかで準備が変わる。数字は君が選んだ条件だけで比べてみよう。'
  :'これが君の分岐地図だ。どの道がいいかは、君が決める。まず次の一歩から始めよう。';
 const chooseGoal=(g:Goal)=>{setGoal(g);setWish(null);setRoute(null);setSample(false);setStep('wish');};
 const demoNumbers=()=>{
  if(goal==='travel'){setYears(3);setTrips(2);setCost('200000');setAltCost('150000');}
  else {setEarly(55);setLate(60);setEnd(65);setWorkNow(5);setWorkWant(3);setIncomeGap('150000');}
  setSample(true);
 };
 const firstStep=()=>{if(!wish)return;setStep('fork');};
 const option=(label:string,active:boolean,onClick:()=>void,extra?:string)=>
  <button type="button" className={'f21-option'+(active?' f21-option--on':'')} onClick={onClick} aria-pressed={active}>
   <span><b>{label}</b>{extra&&<small>{extra}</small>}</span><span className="f21-chevron" aria-hidden="true">{active?'✓':'›'}</span>
  </button>;
 return <main className="f21" data-v21="true">
  <div className="f21-world" aria-hidden="true" style={{backgroundImage:
   'linear-gradient(180deg,rgba(3,23,34,.43),rgba(3,23,34,.80) 50%,#061923 98%), url("./assets/mudagiri/backgrounds/money-personality/v1/'+(step==='reward'?'MP_BG_02_JOB_UNLOCK.webp':step==='fork'?'MP_BG_03_NEXT_QUEST.webp':'MP_BG_01_GUILD_HALL.webp')+'")'
  }}/>
  <div className="f21-shell">
   <header className="f21-header"><b>⚜ ムダギリ診断</b><span>第3章 V2.1 ・ 隔離デモ</span></header>
   <div className="f21-handoff">
    <img src={JOB_CHARACTER_ASSETS.INM.file} alt="第1章JOB・直感魔導士の公式画像"/>
    <div><small>第1章｜覚醒した冒険者</small><strong>{JOB_CHARACTER_ASSETS.INM.name}</strong></div>
    <div className="f21-shield"><small>第2章｜守る盾</small><b>普段の外食</b><small>デモの判定</small></div>
   </div>
   <nav className="f21-progress" aria-label="冒険の進行状況">
    {(['intro','wish','fork','reward'] as Step[]).map((s,i)=>
      <span key={s} className={s===step?'f21-progress--now':''}>{i===0?'帰還':i===1?'願い':i===2?'分岐':'攻略書'}</span>)}
   </nav>
   <div className="f21-title">
    <span>{step==='reward'?'QUEST CLEAR':step==='intro'?'NEW QUEST':'FOG OF FUTURE'}</span>
    <h1>{step==='intro'?'人生の分岐地図':step==='wish'?'未来の宝物は何？':step==='fork'?'同じ願い、2つの道': 'あなたの未来攻略書'}</h1>
   </div>
   <div className="f21-talk">
    <img src={poseFile(step)} alt="ムダギリくん"/>
    <div><b>ムダギリくん</b><p>{talk}</p></div>
   </div>

   {step==='intro'&&<section className="f21-panel">
    <span className="f21-kicker">最初の選択 ｜ どの未来を見たい？</span>
    <h2>数字の先にある、あなたの暮らしを選ぼう。</h2>
    <p className="f21-muted">第2章の「旅行・趣味」「資産形成」から、今回は2種類だけを体験できるデモ。実際の診断結果は読み込まない。</p>
    {option('旅行・体験を増やしたい',false,()=>chooseGoal('travel'),'時期や回数で、準備の優先順位がどう変わる？')}
    {option('働く時間を自分で選びたい',false,()=>chooseGoal('work'),'変え始める時期で、人生の予定がどう変わる？')}
    <div className="f21-record"><b>⚔ 第2章から持ってきたもの（架空）</b><p>守る支出：普段の外食／確認済み改善額：月0円／未鑑定の見直し候補：月最大12,000円。</p><small>見直し候補は現金でも投資元本でもない。ここでは資金に加算しません。</small></div>
   </section>}

   {step==='wish'&&<section className="f21-panel">
    <span className="f21-kicker">第一幕｜あなたが本当に増やしたいもの</span>
    <h2>{goal==='travel'?'どんな旅行の時間がいちばん大切？':'働き方を変えた先、何がほしい？'}</h2>
    <div className="f21-options">{(goal==='travel'?travelWishes:workWishes).map(o=>
      <React.Fragment key={o.id}>{option(o.label,wish===o.id,()=>setWish(o.id),o.sub)}</React.Fragment>)}</div>
    {wish!==null&&<div className="f21-selected"><small>選んだ願い</small><strong>{focus}</strong></div>}
    <button className="f21-main" disabled={!wish} onClick={firstStep}>この未来の分岐を見る →</button>
   </section>}

   {step==='fork'&&<section className="f21-panel">
    <span className="f21-kicker">第二幕｜条件を変えると、どの道が見える？</span>
    <h2>{focus}</h2>
    {(eligibleForTravelMath||eligibleForWorkMath)&&<>
     <p className="f21-muted">数字は任意。分からなければ入力せずに進める。入力すると、2つの道の違いを条件付きで確認できる。</p>
     <button className="f21-sample" onClick={demoNumbers}>仮想の条件を入れて比較する（自分のデータではない）</button>
     {sample&&<div className="f21-example">架空の例で比較しています。自分の条件を選ぶと、例示の表示は消えます。</div>}
    </>}
    {goal==='travel'&&eligibleForTravelMath&&<div className="f21-form">
      <span>大切にしたい期間は？（年）</span>
      <div className="f21-pills">{[2,3,5,10].map(n=><button key={n} className={years===n?'selected':''} onClick={()=>{setYears(n);setSample(false);}} aria-pressed={years===n}>{n}年</button>)}</div>
      <span>旅行や体験は、年に何回？</span>
      <div className="f21-pills">{[1,2,3].map(n=><button key={n} className={trips===n?'selected':''} onClick={()=>{setTrips(n);setSample(false);}} aria-pressed={trips===n}>年{n}回</button>)}</div>
      <div className="f21-fields">
       <label>1回の予算（円・任意）<input type="number" min="1" inputMode="numeric" value={cost} onChange={e=>{setCost(e.target.value);setSample(false);}} placeholder="未入力でもOK"/></label>
       <label>比べたい別予算（円・任意）<input type="number" min="1" inputMode="numeric" value={altCost} onChange={e=>{setAltCost(e.target.value);setSample(false);}} placeholder="例：150000"/></label>
      </div>
    </div>}
    {goal==='work'&&eligibleForWorkMath&&<div className="f21-form">
      <span>働き方を変え始める年齢（比較A / B）</span>
      <div className="f21-fields">
       <label>早めに変える年齢<select value={early??''} onChange={e=>{setEarly(e.target.value?Number(e.target.value):null);setSample(false);}}><option value="">選ぶ</option>{[50,55,60].map(n=><option key={n} value={n}>{n}歳</option>)}</select></label>
       <label>少し後で変える年齢<select value={late??''} onChange={e=>{setLate(e.target.value?Number(e.target.value):null);setSample(false);}}><option value="">選ぶ</option>{[55,60,65].map(n=><option key={n} value={n}>{n}歳</option>)}</select></label>
       <label>比べる最終年齢<select value={end??''} onChange={e=>{setEnd(e.target.value?Number(e.target.value):null);setSample(false);}}><option value="">選ぶ</option>{[65,70,75].map(n=><option key={n} value={n}>{n}歳</option>)}</select></label>
       <label>今の勤務日数 / 週<select value={workNow??''} onChange={e=>{setWorkNow(e.target.value?Number(e.target.value):null);setSample(false);}}><option value="">選ぶ</option>{[4,5,6].map(n=><option key={n} value={n}>{n}日</option>)}</select></label>
       <label>希望する勤務日数 / 週<select value={workWant??''} onChange={e=>{setWorkWant(e.target.value?Number(e.target.value):null);setSample(false);}}><option value="">選ぶ</option>{[2,3,4].map(n=><option key={n} value={n}>{n}日</option>)}</select></label>
       <label>減る手取り収入 / 月（円・任意）<input type="number" min="0" inputMode="numeric" value={incomeGap} onChange={e=>{setIncomeGap(e.target.value);setSample(false);}} placeholder="分からなければ空欄"/></label>
      </div>
    </div>}
    {(!eligibleForTravelMath&&!eligibleForWorkMath)&&<div className="f21-unknown">
      <b>今日は数字にしない道も選べる。</b>
      <p>まだ希望が決まらないなら、勝手に家族や働き方を設定しない。まず「何を守り、何を変えたいか」を考えるところから始めよう。</p>
    </div>}
    <div className="f21-forks">
     <span>分岐の道｜どちらが今の希望に近い？</span>
     {option(pathName('a'),route==='a',()=>setRoute('a'),goal==='travel'?'回数と必要予算の条件を整理する':'時期を選んで必要な準備を確かめる')}
     {option(pathName('b'),route==='b',()=>setRoute('b'),goal==='travel'?'もう一つのペースと比べる':'別の開始時期と比べる')}
     {goal==='travel'&&eligibleForTravelMath&&travel.status==='ready'&&travel.scenarioC&&option(pathName('c'),route==='c',()=>setRoute('c'),'頻度は同じ。予算を変えた仮定で比較')}
    </div>
    {numReady&&goal==='travel'&&travel.status==='ready'&&<div className="f21-compare">
       <div><small>道A｜年{travel.scenarioA.timesPerYear}回</small><strong>{travel.scenarioA.count}回</strong><small>{yen(travel.scenarioA.budgetYen)}</small></div>
       <div><small>道B｜年{travel.scenarioB.timesPerYear}回</small><strong>{travel.scenarioB.count}回</strong><small>{yen(travel.scenarioB.budgetYen)}</small></div>
       <p>選んだ{travel.windowYears}年間で、旅行の機会は{travel.differenceInOpportunities}回変わる。実現できる保証はない。</p>
      </div>}
    {numReady&&goal==='work'&&work.status==='ready'&&<div className="f21-compare">
      <div><small>道A｜{work.scenarioA.startAge}歳から</small><strong>{work.scenarioA.scheduledWorkdaysDifference.toLocaleString('ja-JP')}日</strong><small>予定勤務日数の差</small></div>
      <div><small>道B｜{work.scenarioB.startAge}歳から</small><strong>{work.scenarioB.scheduledWorkdaysDifference.toLocaleString('ja-JP')}日</strong><small>予定勤務日数の差</small></div>
      <p>両方の道の差は約{work.deltaScheduledWorkdays.toLocaleString('ja-JP')}予定勤務日相当（52週/年の仮定）。実際の自由時間や就業可能性を保証しない。</p>
     </div>}
    {!numReady&&<div className="f21-unknown">数字が足りない場合は、費用や達成可能性を決めつけない。比較したい道を選ぶだけでも先へ進める。</div>}
    <button className="f21-main" disabled={!route} onClick={()=>setStep('reward')}>選んだ道から攻略書を見る →</button>
   </section>}

   {step==='reward'&&<section className="f21-panel f21-result">
    <span className="f21-kicker">第三幕｜あなたの分岐地図</span>
    <h2>{focus}</h2>
    <p>あなたが選んだ道は――</p>
    <strong className="f21-choice">{route?pathName(route):'まだ決めていない'}</strong>
    {numReady&&goal==='travel'&&travel.status==='ready'&&route&&<div className="f21-value">
     <span>選んだ期間に目指す旅行の機会</span><strong>{(route==='a'?travel.scenarioA:route==='b'?travel.scenarioB:travel.scenarioC)?.count}回</strong>
     <small>{(route==='a'?travel.scenarioA:route==='b'?travel.scenarioB:travel.scenarioC)?.budgetYen===null?'予算は未入力': '入力した1回予算による名目予算：'+yen((route==='a'?travel.scenarioA:route==='b'?travel.scenarioB:travel.scenarioC)?.budgetYen)}</small>
    </div>}
    {numReady&&goal==='work'&&work.status==='ready'&&route&&<div className="f21-value">
     <span>予定勤務日数の差（52週/年の仮定）</span><strong>{(route==='a'?work.scenarioA:work.scenarioB).scheduledWorkdaysDifference.toLocaleString('ja-JP')}日</strong>
     <small>すべて自由時間になるわけではありません。就業や収入は未検証。</small>
    </div>}
    {!numReady&&<div className="f21-unknown">将来の金額・実現可能性は未判定。条件を確認するだけでも作戦を具体化できます。</div>}
    <div className="f21-next"><small>FIRST STEP｜自分でできる一歩</small><strong>{nextAction}</strong></div>
    <details className="f21-details" open={showDetails} onToggle={e=>setShowDetails(e.currentTarget.open)}>
      <summary>第1・2章の戦果と数字の前提を見る</summary>
      <p>第1章のJOB：{JOB_CHARACTER_ASSETS.INM.name}（性格から投資適性を判断しない）。</p>
      <p>第2章デモ：普段の外食は守る。確認済み改善額は月0円、未確定の見直し候補は月最大12,000円。どちらも今回の費用へ自動加算していません。</p>
      <p>{goal==='travel'&&travel.status==='ready'?travel.financeCaveat:goal==='work'&&work.status==='ready'?work.financeCaveat:'数値の前提は未確認です。'}</p>
    </details>
    <div className="f21-award"><span aria-hidden="true">✧</span><strong>未来の羅針盤を獲得</strong><small>どの道を選ぶか、考える手がかりが見つかった</small></div>
    <div className="f21-meeting">
     <small>OPTIONAL QUEST｜ライフプラン相談</small>
     <h3>「自分の場合」の2つの道を比べる</h3>
     <p>{meeting.status==='ready'?meeting.summary:'自分の希望に合わせて、これからの暮らしと家計の条件を整理する。'}</p>
     <p>希望すれば、生活費・資産・収入など必要な条件を確認し、選択肢を比較する。特定商品の購入や予約は必要ありません。</p>
     <label className="f21-check"><input type="checkbox" checked={meetingInterest} onChange={e=>setMeetingInterest(e.target.checked)}/> 面談でこのテーマを相談することに興味がある</label>
     {meetingInterest&&<div className="f21-consent"><b>共有内容のプレビュー（送信はしません）</b><p>{meeting.status==='ready'?meeting.summary:'未来の希望と家計について相談したい。'}</p><small>このデモでは予約・送信・保存は行いません。実運用では、送信先と項目を示し本人の同意が必要。</small></div>}
    </div>
    <div className="f21-share"><span>SHARE PREVIEW｜公開情報を最小限に</span><p>⚜ {JOB_CHARACTER_ASSETS.INM.name}／第3章クリア{shareTheme?'／未来の宝物：'+(goal==='travel'?'体験':'時間'):''}</p><label className="f21-check"><input type="checkbox" checked={shareTheme} onChange={e=>setShareTheme(e.target.checked)}/> 抽象的な未来のテーマをカードに表示する（任意）</label><small>家計金額・年齢・家族事情・相談内容は公開しない。実SNS送信は未実装。</small></div>
    <fieldset className="f21-feedback"><legend>この結果はどうだった？（デモ内だけ）</legend>
      {([['new','新しく考えたことがある'],['knew','すでに知っていた'],['unknown','まだ分からない']] as const).map(([id,label])=><label key={id}><input type="radio" name="c3v21-feedback" checked={sawIt===id} onChange={()=>setSawIt(id)}/>{label}</label>)}
    </fieldset>
    <button className="f21-main" onClick={reset}>別の未来でもう一度試す ↻</button>
   </section>}
   {step!=='intro'&&step!=='reward'&&<button className="f21-back" onClick={()=>setStep(step==='wish'?'intro':'wish')}>← ひとつ前に戻る</button>}
   <footer>CHAPTER 3 V2.1 TEST LAB｜実データの取得・予約・SNS投稿なし</footer>
  </div>
 </main>;
}
