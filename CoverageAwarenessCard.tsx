import React,{useState} from 'react';
import {coverageAwarenessFor} from './scripts/coverage-awareness-v1.mjs';

type Props={rows?:unknown;onConsultCoverage?:()=>void;pilotNoExternalActions?:boolean};

/** Covers the purpose of protection, not an amount of "savings". */
export default function CoverageAwarenessCard({rows,onConsultCoverage,pilotNoExternalActions=false}:Props){
 const [pilotFeedback,setPilotFeedback]=useState(false);
 const insight=coverageAwarenessFor(rows);
 if(!insight?.show)return null;
 const noContractAssumed=insight.reason==='NO_PREMIUM_RECORDED'||insight.reason==='CATEGORY_NOT_APPLICABLE';
 return <section className="c2v32-cover-awareness" data-section="COVERAGE_AWARENESS" data-coverage-reason={insight.reason} aria-label="保障の確認ポイント">
  <div className="c2v32-cover-eyebrow"><span>🛡 保障の棚卸し</span><small>保険料だけが見直しの理由じゃない</small></div>
  <div className="c2v32-cover-content">
   <img src="./assets/mudagiri/poses/v1/MUDAGIRI_POSE_07_QUESTION.webp" alt="" loading="lazy"/>
   <div>
    <h2>{insight.heading}</h2>
    <p>{insight.text}</p>
   </div>
  </div>
  <div className="c2v32-cover-reasons" aria-label="保障を確認する3つの理由">
   <div><strong>医療の変化</strong><span>{noContractAssumed?'公的保障や勤務先の制度は、今の治療にどこまで対応する？':'通院・薬物療法など、今の治療に給付条件が合っている？'}</span></div>
   <div><strong>暮らしの変化</strong><span>家族・仕事・収入が変わっても、必要な備えになっている？</span></div>
   <div><strong>保険料・重複</strong><span>{noContractAssumed?'公的保障も含め、備えと費用を整理できている？':'保険料と保障内容のバランスや重複はない？'}</span></div>
  </div>
  <p className="c2v32-cover-caution">古い保険が無意味とは限らない。今の契約を解約・変更する前に、給付条件や継続する利点も確かめよう。</p>
  <div className="c2v32-cover-next"><span>まずはこれだけ ›</span><strong>{insight.next}</strong></div>
  {onConsultCoverage&&<div className="c2v32-cover-consult">
    <button type="button" className="c2v32-cover-consult-button" onClick={()=>pilotNoExternalActions?setPilotFeedback(true):onConsultCoverage()} data-cta="COVERAGE_LINE_CONSULT">
     <span>公式LINEで保障の相談をする</span><span aria-hidden="true">→</span>
    </button>
    <small>{pilotNoExternalActions?'調査用のためLINEへの移動・予約は行われません。':'相談は任意。LINEの友だち追加だけでは面談予約は確定しません。'}</small>
    {pilotFeedback&&<p className="c2v32-cover-pilot-feedback" role="status">調査用サンプルのため、LINEへの移動や実際の面談予約は行いません。</p>}
  </div>}
  <details className="c2v32-cover-why"><summary>保障の確認方法と注意点</summary>
   <p>保障は、保険料の高い・安いだけでなく、入院・通院・特定の治療に関する給付条件や支払対象外の条件も確認が必要です。医療の進歩で治療が変わっても、古い契約の利点が残ることがあります。</p>
   <p>この診断だけで保障の過不足・給付の可否・削減額は判断できません。相談や契約変更をしなくても大丈夫です。</p>
  </details>
 </section>;
}
