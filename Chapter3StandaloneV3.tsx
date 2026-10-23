import React,{useMemo,useState} from 'react';
import './chapter3-standalone-v3.css';
// @ts-ignore isolated pure JS result engine
import {WISHES,WALLS,SHIELDS,TOOLS,createAdventureResult} from './chapter3-v2/standalone-adventure.mjs';

type Choice={id:string;title:string;icon?:string;caption?:string};
type Answers={wish:string;wall:string;shield:string;tool:string};
type StepKey=keyof Answers;
const STEPS:{key:StepKey;eyebrow:string;title:string;intro:string;options:Choice[];scene:string;sceneName:string}[]=[
 {key:'wish',eyebrow:'QUEST 01 / 願いの旗',title:'未来の自分に、どんな景色を見せたい？',
  intro:'「正解」ではなく、今いちばん叶えたいことを一つ。',
  options:WISHES,scene:'flag',sceneName:'未来へ進む旗'},
 {key:'wall',eyebrow:'QUEST 02 / 行く手を阻む敵',title:'その未来へ進むとき、何がいちばん引っかかる？',
  intro:'ここで敵を間違えると、どんな武器も空振りになる。',
  options:WALLS,scene:'wall',sceneName:'霧の敵'},
 {key:'shield',eyebrow:'QUEST 03 / 守りの盾',title:'前に進めても、これは失いたくない。',
  intro:'守りたいものが分かると、選ぶべき戦い方が変わる。',
  options:SHIELDS,scene:'shield',sceneName:'守るべきもの'},
 {key:'tool',eyebrow:'QUEST 04 / 最初の武器',title:'今週、実際に使えそうなのはどれ？',
  intro:'お金が増えることや資格を得ることを約束する選択肢ではない。',
  options:TOOLS,scene:'tool',sceneName:'最初の武器'}
];
const mascot='/assets/mudagiri/poses/v1/MUDAGIRI_POSE_03_GUIDE.webp';
const IMAGE_FALLBACK=''; // retain text if a future asset fails to load
const initial:Answers={wish:'',wall:'',shield:'',tool:''};
const optionLabel=(options:Choice[],value:string)=>options.find(x=>x.id===value)?.title??'未選択';

export default function Chapter3StandaloneV3(){
 const [step,setStep]=useState(-1);
 const [answers,setAnswers]=useState<Answers>(initial);
 const [showConsult,setShowConsult]=useState(false);
 const [sampleMode,setSampleMode]=useState(false);
 const [showDetail,setShowDetail]=useState(false);
 const [chosenRoute,setChosenRoute]=useState<null|'self'>(null);
 const [imageVisible,setImageVisible]=useState(true);
 const report=useMemo(()=>createAdventureResult(answers),[answers]);
 const finished=step>=STEPS.length;
 const moveBack=()=>{
  setShowConsult(false);
  if(finished){setStep(STEPS.length-1);return;}
  setStep(x=>Math.max(-1,x-1));
 };
 const choose=(key:StepKey,id:string)=>{
  setAnswers(prev=>({...prev,[key]:id}));
  setChosenRoute(null);
  setStep(i=>i+1);
 };
 const restart=()=>{setChosenRoute(null);setAnswers(initial);setStep(-1);setSampleMode(false);setShowConsult(false);setShowDetail(false);window.scrollTo({top:0,behavior:'auto'});};
 return <main className="c3s-root" data-chapter3-standalone="true">
  <div className="c3s-background" aria-hidden="true"/>
  <div className="c3s-wrap">
   <header className="c3s-nav">
    <div><span>MUDA-GIRI / CHAPTER Ⅲ</span><h1>未来攻略クエスト</h1></div>
    {step>=0&&<button type="button" onClick={moveBack} className="c3s-ghost">← 戻る</button>}
   </header>
   <div className="c3s-notice">第3章・単独体験版。第1章JOBと第2章の実データはまだ連携していません。</div>
   {step===-1&&<section className="c3s-start c3s-panel">
      <span className="c3s-overline">NEW QUEST UNLOCKED</span>
      <div className="c3s-scene" aria-hidden="true"><span className="c3s-scene-glyph">⚑</span><span className="c3s-star">✦</span></div>
      <h2>未来が変わるのは、<br/>「何を増やすか」だけじゃない。</h2>
      <p>進むのを止めている壁と、絶対に守りたいもの。<br/>この2つで、取るべき作戦は変わる。</p>
      <div className="c3s-guide">{imageVisible&&<img src={mascot} alt="ムダギリくん" onError={()=>setImageVisible(false)}/>}<p>今回はボクと「未来の戦い方」を選ぼう。4つの分かれ道の先に、自分だけの作戦書があるよ。</p></div>
      <div className="c3s-intro-points"><span>⚔ 4つの場面を選ぶ</span><span>✦ 未来の作戦書を獲得</span></div>
      <button className="c3s-mainbtn" onClick={()=>{setSampleMode(false);setStep(0)}}>冒険に出る <span>→</span></button>
      <button className="c3s-outline" onClick={()=>{setAnswers({wish:'challenge',wall:'time',shield:'joy',tool:'time'});setSampleMode(true);setStep(STEPS.length);}}>リザルト画面のサンプルを先に見る</button>
      <small>これは自己整理用の冒険体験。資金余力・収入・投資適合性は診断しません。</small>
    </section>}
   {step>=0&&!finished&&<section className="c3s-panel" data-testid="chapter3-question">
      <div className="c3s-meter" aria-label={'質問 '+(step+1)+' / 4'}>{STEPS.map((x,i)=><span key={x.key} className={i<=step?'active':''}/>)}</div>
      <div className={'c3s-scene c3s-scene--'+STEPS[step].scene} aria-hidden="true">
        <span className="c3s-scene-glyph">{['⚑','◈','🛡','✦'][step]}</span>
      </div>
      <div className="c3s-overline">{STEPS[step].eyebrow}</div>
      <h2>{STEPS[step].title}</h2>
      <p className="c3s-muted">{STEPS[step].intro}</p>
      <div className="c3s-options">
        {STEPS[step].options.map((x,i)=><button key={x.id} type="button" className="c3s-option" onClick={()=>{
          choose(STEPS[step].key,x.id);
          window.scrollTo({top:0,behavior:'auto'});
        }}><span className="c3s-option-index">{String(i+1).padStart(2,'0')}</span><span className="c3s-option-copy"><strong>{x.icon?<>{x.icon} </>:null}{x.title}</strong>{x.caption&&<small>{x.caption}</small>}</span><span className="c3s-arrow">›</span></button>)}
      </div>
    </section>}
   {finished&&report.ok&&<section className="c3s-panel c3s-result" data-testid="chapter3-result">
      {sampleMode&&<p className="c3s-notice">これは架空の回答例による結果サンプルです。あなた自身の診断結果ではありません。</p>}
      <div className="c3s-overline">QUEST CLEAR · 未来攻略の作戦書</div>
      <div className="c3s-scene c3s-scene--result" aria-hidden="true"><span className="c3s-scene-glyph">✧ ⚑ ✧</span></div>
      <h2 className="c3s-result-name">{report.adventurerTitle}</h2>
      <p className="c3s-route-name">{report.routeTitle}</p>
      <p className="c3s-headline" data-testid="chapter3-result-headline">{report.headline}</p>
      <div className="c3s-result-block"><span className="c3s-overline">なぜ、このルートなのか</span><p>{report.discovery}</p></div>
      <div className="c3s-reward"><small>✦ 今、選べる最初の一手</small><strong data-testid="chapter3-first-action">{report.todayAction}</strong></div>
      <div className="c3s-shield"><span>🛡 守りたいもの</span><strong>{report.shield}</strong></div>
      <button className="c3s-disclosure" onClick={()=>setShowDetail(x=>!x)} aria-expanded={showDetail}>4つの準備資源を確認する {showDetail?'−':'＋'}</button>
      {showDetail&&<div className="c3s-capital">
        {report.dimensions.map((x:any)=><div key={x.key}><strong>{x.name}</strong><span>{x.status}</span></div>)}
      </div>}
      <div className="c3s-decision" data-testid="chapter3-decide-now">
        <span className="c3s-overline">NOW / ここで道を選ぶ</span>
        <h3>この場で、次の進み方を決めよう。</h3>
        <p>いつか動くための計画ではなく、今の自分で選ぶ一手。自分で始めるか、相談して具体化するかは自由だよ。</p>
        <button className="c3s-mainbtn" type="button" onClick={()=>setShowConsult(true)}>この作戦を相談する →</button>
        <button className="c3s-outline" type="button" onClick={()=>setChosenRoute('self')}>この一手で自分で進む →</button>
        {chosenRoute==='self'&&<div className="c3s-decision-confirmed" role="status">
          <strong>⚑ 自分で進む道を選んだ</strong>
          <p>最初にやること：{report.decision.selfAction}</p>
          <small>取り組んだこと自体はまだ記録されていません。いつ実行するかを押し付けず、この一手から始めよう。</small>
        </div>}
        <small className="c3s-preview-caution">※単独試作では相談の予約は行いません。相談ボタンはテーマ確認のみ。</small>
      </div>
      <p className="c3s-caveat">{report.caveat} {report.evidence}</p>
      <button className="c3s-outline" onClick={restart}>もう一度、未来を選び直す</button>
      <small>結果は今回選んだ4つの回答に基づく整理。資産や能力の測定結果ではありません。</small>
    </section>}
   {finished&&!report.ok&&<section className="c3s-panel"><h2>作戦をまとめられなかった</h2><p>回答を最初から選び直そう。</p><button onClick={restart}>やり直す</button></section>}
   {showConsult&&report.ok&&<div className="c3s-modal-backdrop" role="presentation" onClick={()=>setShowConsult(false)}>
     <section role="dialog" aria-modal="true" aria-labelledby="c3s-consult-title" className="c3s-modal" onClick={e=>e.stopPropagation()}>
      <span className="c3s-overline">NEXT QUEST / 戦略の相談</span>
      <h2 id="c3s-consult-title">この作戦を相談する</h2>
      <p>確認したいテーマは、<strong>{report.consultation}</strong>。</p>
      <p>第3章単独試作では実際のLINE登録や予約は行いません。相談内容と予約導線は別途検証・接続します。</p>
      <button className="c3s-mainbtn" onClick={()=>setShowConsult(false)}>作戦書に戻る</button>
     </section>
   </div>}
   <footer className="c3s-footer">⚑ CHAPTER Ⅲ / SOLO TEST　　前章データの連携・実予約なし</footer>
  </div>
 </main>;
}
