import React,{useMemo,useState} from 'react';
import type {Chapter1HandoffV1} from './chapter2-v2-contract';
import {assessChapter12AnswerCheck,type AnswerCheckResult} from './scripts/chapter12-answercheck-experiment-v1.mjs';

type Props={
 chapter1?:Chapter1HandoffV1|null;
 anonymousUserId?:string|null;
 diagnosisId?:string|null;
 rows?:unknown;
 /** The prototype is opt-in only. It cannot influence the C2 result engine. */
 enabled?:boolean;
 demo?:boolean;
};
const POSE='./assets/mudagiri/poses/v1/MUDAGIRI_POSE_20_CHECK.webp';
const STYLE_EVIDENCE:Record<string,string>={
 DRIVE:'前に進むことを大切にする',
 ENJOY:'楽しさを大切にする',
 SECURE:'安心を大切にする',
 OPTIMIZE:'納得して使いたい'
};
function chapter2SelfReportEvidence(card:AnswerCheckResult['cards'][number]):string{
 if(card.category==='fun'||card.category==='selfDevelopment')return card.evidence.chapter2;
 if(card.category==='sub')return '使っていない契約があり、解約可能と回答';
 return card.evidence.chapter2;
}
/**
 * Visual-only follow-on to the Chapter 1 JOB record. No GAS, no storage,
 * no telemetry, no share payload changes, no classification changes.
 */
export default function Chapter12AnswerCheckCard({
 chapter1,anonymousUserId,diagnosisId,rows,enabled=false,demo=false
}:Props){
 const [showEvidence,setShowEvidence]=useState(false);
 const result=useMemo(()=>{
  if(!enabled||!chapter1||!anonymousUserId||!diagnosisId||!Array.isArray(rows))return null;
  return assessChapter12AnswerCheck({
   chapter1,
   chapter2:{anonymousUserId,diagnosisId,rows},
  });
 },[enabled,chapter1,anonymousUserId,diagnosisId,rows]);
 if(!result||result.status==='unavailable')return null;
 const found=result.status==='context_found'&&result.cards.length>0;
 const focus=found?result.cards[0]:null;
 const secondary=found?result.cards.slice(1):[];
 const contrast=found?result.protectedVsReview:null;
 const isInvestment=contrast?.protect.category==='selfDevelopment';
 const isOptimize=contrast?.primaryStyle==='OPTIMIZE';
 if(!found)return <section className="c12ac c12ac--unknown" data-section="CHAPTER12_ANSWER_CHECK" data-answercheck-status="no_supported_link" aria-label="答え合わせについて">
  <div className="c12ac-head"><span>✦ CHAPTER 1 × CHAPTER 2</span><small>答え合わせ</small></div>
  <strong className="c12ac-unknown-title">今回は「一致・不一致」を決めつけない。</strong>
  <p className="c12ac-unknown-note">家計の金額だけでは、性格の当たり外れは分からない。第1章の結果が間違いという意味でもないぞ。</p>
 </section>;
 const yen=(n:number)=>new Intl.NumberFormat('ja-JP').format(n);
 return <section className={'c12ac c12ac--'+(contrast?'contrast':found?'found':'unknown')} data-section="CHAPTER12_ANSWER_CHECK" aria-label="お金の性格、答え合わせ" data-answercheck-status={result.status}>
  <div className="c12ac-head"><span>✦ CHAPTER 1 × CHAPTER 2</span><small>{demo?"架空デモ ／ ":""}価値観と家計</small></div>
  <h2>{contrast?(isInvestment?<>自己投資は守る。<em>見直すのは別。</em></>:isOptimize?<>納得して使う。<em>見直すのは別。</em></>:<>楽しみは守る。<em>見直すのは別。</em></>):<>お金の性格、<em>答え合わせ。</em></>}</h2>
  {contrast?<div className="c12ac-dual-talk">
   <img src={POSE} alt="家計を見比べるムダギリくん" loading="lazy"/>
   <p><b>ムダギリくん：</b>{isInvestment?'第1章は「前進」重視。目的のある自己投資は守って、使っていない契約は別に見よう！':isOptimize?'第1章は「納得」重視。楽しみは守って、使っていない契約は分けて確かめよう！':'第1章は「楽しさ」重視。好きなことは守って、使っていない契約は見直そう！'}</p>
  </div>:<div className="c12ac-dialogue">
   <img src={POSE} alt="家計の回答を確かめるムダギリくん" loading="lazy"/>
   <div><b>ムダギリくん</b>
    <p>{found?'よし、答え合わせだ！君が大切にしたいものと、家計の数字を見比べてみよう。':'答え合わせをしてみたけど、今回は確かな共通点を決められなかった。だからって、性格診断が間違いとは限らないぞ。'}</p>
   </div>
  </div>}
  {contrast&&<div className="c12ac-dual" data-answercheck-contrast="true">
    <div className="c12ac-dual-box c12ac-dual-box--protect">
     <small>🛡 守りたい支出</small><b>{contrast.protect.label}</b>
     <strong>¥{yen(contrast.protect.monthlyYen)}<i>/月</i></strong>
     <span>回答「{contrast.protect.choiceLabel}」／判定「守る」</span>
    </div>
    <div className="c12ac-dual-box c12ac-dual-box--review">
     <small>🔎 確認済みの見直し機会</small><b>{contrast.review.label}</b>
     <strong>¥{yen(contrast.review.monthlyYen)}<i>/月</i></strong>
     <span>未使用・解約可能を本人が確認</span>
    </div>
    <p className="c12ac-dual-caveat">※右はまだ解約していない金額。節約済み・貯蓄済みではありません。</p>
   </div>}
  {focus&&!contrast&&<div className="c12ac-insight" data-insight-kind={focus.kind}>
   <span>{focus.kind==='resonance'?'🛡 価値観と回答が重なった':'🔎 確認ポイントが見つかった'}</span>
   <h3>{focus.title}</h3>
   <p className="c12ac-brief" data-answercheck-evidence-inline="true">
    <b>第1章の結果：</b>{STYLE_EVIDENCE[chapter1!.primaryStyle]}<br/>
    <b>第2章の回答：</b>{chapter2SelfReportEvidence(focus)}
   </p>
   {focus.monthlySnapshot&&<div className="c12ac-money" data-answercheck-monthly="true">
    <small>{focus.monthlySnapshot.label}</small>
    <div><span>ひと月 <strong>¥{yen(focus.monthlySnapshot.monthlyYen)}</strong></span><span>12か月分 <strong>¥{yen(focus.monthlySnapshot.annualYen)}</strong></span></div>
    <p>{focus.monthlySnapshot.caveat}</p>
   </div>}
  </div>}
  {!found&&<p className="c12ac-no-link">{result.explanation}</p>}
  {!contrast&&!!secondary.length&&<details className="c12ac-more"><summary>もう一つの発見を見る</summary>
   {secondary.map((card,i)=><div className="c12ac-insight" key={card.category+'-'+i}>
    <span>{card.kind==='resonance'?'🛡 価値観の重なり':'🔎 確認ポイント'}</span>
    <h3>{card.title}</h3><p>{card.body}</p>
   </div>)}
  </details>}
  {found&&<div className="c12ac-next"><small>次の一手　›</small><p>{(result as AnswerCheckResult).nextStep}</p></div>}
  <button className="c12ac-evidence-toggle" type="button" aria-expanded={showEvidence} onClick={()=>setShowEvidence(x=>!x)}>
   {showEvidence?'判定の根拠を閉じる ↑':'なぜそう言える？ 根拠を見る ↓'}
  </button>
  {showEvidence&&<div className="c12ac-evidence" data-answercheck-evidence="true">
   {focus&&<><p><b>第1章：</b>{focus.evidence.chapter1}</p><p><b>第2章：</b>{focus.evidence.chapter2}</p><p>{focus.body}</p></>}
   {contrast&&<><p><b>守る側：</b>{contrast.protect.source}</p><p><b>見直す側：</b>{contrast.review.source}</p><p>{contrast.caveat}</p></>}
   <p><strong>どちらも本人の回答に基づくヒントです。</strong> 性格の的中率や実際の行動を証明する結果ではありません。家計の金額だけから「直感型＝浪費」などとは判断しません。</p>
   <p>3つの性格軸（時間・判断・把握）の当たり外れは、この家計診断だけでは測れません。</p>
  </div>}
  <p className="c12ac-disclaimer">※{contrast?'両方とも本人申告。左は支出、右は改善機会であり、合算や差額算出はしません。':'数字は第2章で入力された支出の参考表示。'}性格の的中率や節約実績ではなく、SNS画像には含めません。</p>
 </section>;
}
