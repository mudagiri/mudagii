import React,{useMemo,useState} from 'react';
import './chapter3-v2-pilot.css';
import {JOB_CHARACTER_ASSETS} from './src/features/money-personality/job-character-assets-v1';
// @ts-ignore Isolated plain-JS V2 POC, with shape validated by the handoff adapter.
import {planNextAction,validateHandoff} from './chapter3-v2/decision-core.mjs';

type Props={
  handoff:any;
  onBack:()=>void;
  onConsult:()=>void;
  onEvent?:(event:string,payload?:Record<string,unknown>)=>void;
};
type Screen='destination'|'horizon'|'detail'|'result';
type Horizon='near'|'middle'|'far'|'unknown';

const GOALS=[
 {id:'home',name:'住まい',symbol:'🏠'},
 {id:'family',name:'家族・教育',symbol:'🌱'},
 {id:'travel',name:'旅行・趣味',symbol:'✈️'},
 {id:'invest',name:'資産形成',symbol:'🌳'},
 {id:'challenge',name:'独立・挑戦',symbol:'⚔️'},
 {id:'safety',name:'もしもの備え',symbol:'🛡️'},
 {id:'retirement',name:'老後',symbol:'🌅'},
 {id:'income',name:'収入を増やしたい',symbol:'🔑'},
 {id:'time',name:'自由な時間を増やしたい',symbol:'⏳'},
 {id:'undecided',name:'まだ決めていない',symbol:'🗺️'},
] as const;
const HORIZONS=[
 {id:'near',title:'1〜3年以内',caption:'近い未来'},
 {id:'middle',title:'4〜10年くらい',caption:'少し先'},
 {id:'far',title:'10年以上先',caption:'遠い未来'},
 {id:'unknown',title:'まだ決めていない',caption:'未定でも進める'},
] as const;
const DETAIL:Record<string,{heading:string;answers:{id:string;title:string}[]}>={
 income:{heading:'収入を増やすなら、今の手がかりは？',answers:[
  {id:'atWork',title:'今の仕事に昇給の道がありそう'},
  {id:'outsideDemand',title:'仕事以外でも頼まれた経験がある'},
  {id:'learningTime',title:'学ぶ時間ならつくれそう'},
  {id:'unknown',title:'まだ分からない'},
 ]},
 invest:{heading:'1〜3年以内に大きな支払いの予定はある？',answers:[
  {id:'plannedExpense',title:'ある'},
  {id:'noPlannedExpense',title:'今のところない'},
  {id:'unknown',title:'まだ分からない'},
 ]},
 time:{heading:'いま一番、時間を使っているのは？',answers:[
  {id:'work',title:'仕事'},
  {id:'home',title:'家事・育児・家のこと'},
  {id:'move',title:'移動'},
  {id:'unknown',title:'まだ整理できていない'},
 ]},
};
const STYLE:Record<string,string>={DRIVE:'前進',ENJOY:'楽しさ',SECURE:'安心',OPTIMIZE:'納得'};
const GOAL_NAME=(id:string)=>GOALS.find(x=>x.id===id)?.name??'これからの未来';
const MUDAGIRI='./assets/mudagiri/poses/v1/MUDAGIRI_POSE_03_GUIDE.webp';

export default function Chapter3V2Pilot({handoff,onBack,onConsult,onEvent}:Props){
 const inherited=handoff?.chapter2?.goal&&handoff.chapter2.goal!=='undecided'?String(handoff.chapter2.goal):null;
 const [screen,setScreen]=useState<Screen>('destination');
 const [goal,setGoal]=useState<string>(inherited??'undecided');
 const [selectNewGoal,setSelectNewGoal]=useState(false);
 const [horizon,setHorizon]=useState<Horizon>('unknown');
 const [detail,setDetail]=useState<string>('unknown');
 const validation=useMemo(()=>validateHandoff(handoff,handoff?.anonymousUserId),[handoff]);
 const c1=validation.ok?validation.value.chapter1:null;
 const c2=validation.ok?validation.value.chapter2:null;
 const job=c1?.jobCode&&Object.prototype.hasOwnProperty.call(JOB_CHARACTER_ASSETS,c1.jobCode)?
   JOB_CHARACTER_ASSETS[c1.jobCode as keyof typeof JOB_CHARACTER_ASSETS]:null;
 const style=STYLE[c1?.primaryStyle??'']??null;
 const effectiveGoal=(inherited&&!selectNewGoal)?inherited:goal;
 const plan=useMemo(()=>validation.ok?planNextAction(validation,{
  goal:effectiveGoal,goalOverrideConfirmed:selectNewGoal||!inherited,
  horizon,detail
 }):null,[validation,effectiveGoal,selectNewGoal,inherited,horizon,detail]);
 const detailKey=effectiveGoal==='income'?'income':
  effectiveGoal==='invest'&&horizon==='near'?'invest':
  effectiveGoal==='time'?'time':null;
 const shouldAskDetail=detailKey!==null && detail==='unknown';
 const screenNumber=screen==='destination'?1:screen==='horizon'?2:screen==='detail'?3:4;
 const announce=(event:string,payload:Record<string,unknown>={})=>onEvent?.('chapter3_v2_'+event,{
   ...payload,version:'PILOT_V2',noFinancialData:true
 });
 const proceedGoal=()=>{
  announce('goal_confirmed',{selected:effectiveGoal,source:inherited&&!selectNewGoal?'chapter2':'chapter3'});
  setScreen('horizon');
 };
 const proceedHorizon=(answer:Horizon)=>{
  setHorizon(answer);setDetail('unknown');
  announce('horizon_selected',{horizon:answer});
  setScreen((effectiveGoal==='income'||effectiveGoal==='time'||(effectiveGoal==='invest'&&answer==='near'))?'detail':'result');
 };
 const proceedDetail=(answer:string)=>{
  setDetail(answer);announce('detail_selected',{choice:answer,goal:effectiveGoal});
  setScreen('result');
 };
 const backScene=()=>{
  if(screen==='result')setScreen(detailKey?'detail':'horizon');
  else if(screen==='detail')setScreen('horizon');
  else if(screen==='horizon')setScreen('destination');
  else onBack();
 };
 const reasonGoal=inherited&&!selectNewGoal?'第2章で選んだ目的地':'今回自分で選んだ目的地';
 const evidenceSummary=c2?.rows?.filter((x:any)=>x.v5Status==='protect').length??0;
 if(!validation.ok)return <main className="c3v2"><div className="c3v2-shell">
  <h1>冒険データを確認できませんでした</h1><p>ほかの診断結果を混ぜないため、いったん第2章へ戻って確認してね。</p>
  <button className="c3v2-btn c3v2-btn--gold" onClick={onBack}>第2章に戻る</button>
 </div></main>;

 return <main className="c3v2" data-chapter3-v2-pilot="true">
  <div className="c3v2-stars" aria-hidden="true"/>
  <div className="c3v2-shell">
   <header className="c3v2-top">
    <div><span className="c3v2-kicker">CHAPTER III · ISOLATED PILOT</span><h1>未来の航路</h1></div>
    <button type="button" className="c3v2-quiet" onClick={backScene} aria-label="ひとつ前へ戻る">← 戻る</button>
   </header>
   <div className="c3v2-progress" aria-label={'進行 '+screenNumber+'/4'}>
    {[1,2,3,4].map(i=><span key={i} className={i<=screenNumber?'on':''}/>)}
   </div>
   <aside className="c3v2-party" aria-label="前章の引継ぎ">
    {job?<img className="c3v2-job" src={job.file} alt={job.name}/>:<div className="c3v2-nojob">?</div>}
    <div><span className="c3v2-kicker">YOUR ADVENTURER</span>
     <strong>{job?.name??'冒険者の情報は未連携'}</strong>
     {style&&<small>STYLE：{style}</small>}
     <small>第2章：12カテゴリの家計クエストを引継ぎ</small>
    </div>
   </aside>
   <div className="c3v2-guide"><img src={MUDAGIRI} alt="ムダギリくん"/>
    <p>{screen==='destination'?'ここからは未来の冒険だ！　前のクエストで選んだ行き先を使ってもいいし、選び直してもいいよ。':
    screen==='horizon'?'目的地が見えたね。いつごろ着きたいかで、準備の順番も変わってくるぞ。':
    screen==='detail'?'あと一つだけ、現実の手がかりを見せてね。分からなくても大丈夫。':
    '未来への作戦書ができたよ。今からできることを、まず一つに絞ってみた。'}</p>
   </div>
   {screen==='destination'&&<section className="c3v2-panel">
    <div className="c3v2-world" aria-hidden="true"><span>⚑</span><span>✦</span><span>⌂</span></div>
    <span className="c3v2-kicker">QUEST 1 — 願いの旗</span>
    <h2>今、どんな未来を目指したい？</h2>
    {inherited&&!selectNewGoal&&<div className="c3v2-inherited">
      <small>第2章で選んだ目的地</small><strong>{GOAL_NAME(inherited)}</strong>
      <p>同じ質問には答え直さなくていい。今は別の未来を目指したいなら、変更もできるよ。</p>
      <button type="button" className="c3v2-btn c3v2-btn--gold" onClick={proceedGoal}>この旗で進む →</button>
      <button type="button" className="c3v2-link" onClick={()=>{setSelectNewGoal(true);setGoal(inherited)}}>目的地を変える</button>
     </div>}
    {(!inherited||selectNewGoal)&&<>
     <div className="c3v2-choice-grid">
      {GOALS.map(x=><button key={x.id} type="button" className={'c3v2-choice'+(goal===x.id?' selected':'')}
        aria-pressed={goal===x.id} onClick={()=>setGoal(x.id)}><span aria-hidden="true">{x.symbol}</span>{x.name}</button>)}
     </div>
     <button type="button" className="c3v2-btn c3v2-btn--gold" onClick={proceedGoal}>この旗を立てる →</button>
    </>}
   </section>}
   {screen==='horizon'&&<section className="c3v2-panel">
    <div className="c3v2-world c3v2-world--tower" aria-hidden="true">◈ <span>♜</span> ◈</div>
    <span className="c3v2-kicker">QUEST 2 — 時の塔</span>
    <h2>その未来には、いつごろ近づきたい？</h2>
    <p className="c3v2-muted">「{GOAL_NAME(effectiveGoal)}」の旅。これは希望の時期で、投資期間や使える資金の判定ではないよ。</p>
    <div className="c3v2-choices">{HORIZONS.map(x=><button key={x.id} type="button" className="c3v2-choice c3v2-choice--wide"
     onClick={()=>proceedHorizon(x.id)}><strong>{x.title}</strong><small>{x.caption}</small><span aria-hidden="true">›</span></button>)}</div>
   </section>}
   {screen==='detail'&&<section className="c3v2-panel">
    <div className="c3v2-world c3v2-world--gate" aria-hidden="true">✧　◈　✧</div>
    <span className="c3v2-kicker">QUEST 3 — 霧の関門</span>
    <h2>{DETAIL[detailKey??'']?.heading??'次の一手を確かめよう'}</h2>
    <p className="c3v2-muted">ここでは実際に使える資金や稼げる額を決めつけないよ。</p>
    <div className="c3v2-choices">{(DETAIL[detailKey??'']?.answers??[]).map(x=><button key={x.id} type="button"
      className="c3v2-choice c3v2-choice--wide" onClick={()=>proceedDetail(x.id)}>{x.title}<span aria-hidden="true">›</span></button>)}</div>
   </section>}
   {screen==='result'&&<section className="c3v2-panel c3v2-result">
    <div className="c3v2-world c3v2-world--result" aria-hidden="true">✦　⚑　✦</div>
    <span className="c3v2-kicker">QUEST CLEAR — 未来の作戦書</span>
    <h2>{GOAL_NAME(effectiveGoal)}への、最初の一手</h2>
    <div className="c3v2-result-hero"><small>まずやってみること</small><strong>{plan?.firstStep??'目指したいことを一つ書き出す'}</strong></div>
    <div className="c3v2-reasons"><strong>この作戦の理由</strong>
      <p>① {reasonGoal}：「{GOAL_NAME(effectiveGoal)}」</p>
      <p>② 目指す時期：{HORIZONS.find(x=>x.id===horizon)?.title??'まだ未定'}</p>
      {plan?.reasonTags?.includes('c2_rent_review')&&<p>③ 第2章：住居費に確認の余地があった（差額をそのまま削減額とはしない）</p>}
      {plan?.reasonTags?.includes('c2_rent_protect')&&<p>③ 第2章：今の住まいで守るものがある</p>}
      {plan?.reasonTags?.includes('c2_education_protect')&&<p>③ 第2章：現在の教育費を守る理由がある</p>}
      {plan?.reasonTags?.includes('c2_fun_protect')&&<p>③ 第2章：楽しみに使う支出を守る理由がある</p>}
      {plan?.reasonTags?.includes('c2_c_not_cash')&&<p>③ 第2章：未確定の見直し候補を使える現金と考えない</p>}
      {!plan?.reasonTags?.some((x:string)=>x.startsWith('c2_'))&&
        <p className="c3v2-muted">第2章の結果だけで、この未来に必要な金額や資金余力は判断できないよ。</p>}
    </div>
    <div className="c3v2-result-note"><strong>相談すると整理できること</strong><p>{plan?.consultTopic??'これからの優先事項'}。実際の条件や状況を確認しながら作戦を具体化するよ。</p></div>
    <button className="c3v2-btn c3v2-btn--gold" type="button" onClick={()=>{
      announce('consult_preview',{topic:plan?.consultTopic??'future'});
      onConsult();
    }}>第2章の相談窓口を確認する →</button>
    <button className="c3v2-link" type="button" onClick={onBack}>第2章の戦果へ戻る</button>
    <small className="c3v2-muted">これは診断試作。具体的な金融商品や収入増加の可否を判定するものではありません。</small>
   </section>}
   <footer className="c3v2-footer">
    <span>ギルドで得たJOB → 家計クエスト → 未来の航路</span>
    {evidenceSummary>0&&<small>第2章には守ると決めた支出が{evidenceSummary}カテゴリあるよ。</small>}
    <small>V2独立プレビュー／金融商品適合性は判定しません</small>
   </footer>
  </div>
 </main>;
}
