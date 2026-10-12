import React from 'react';
import {coverageAwarenessFor} from './scripts/coverage-awareness-v1.mjs';

/** One compact, optional editorial prompt after rewards. Not a savings score. */
export default function CoverageAwarenessCard({rows}:{rows?:unknown}){
 const insight=coverageAwarenessFor(rows);
 if(!insight?.show)return null;
 return <section className="c2v32-cover-awareness" data-section="COVERAGE_AWARENESS" data-coverage-reason={insight.reason} aria-label="保障の確認ポイント">
  <div className="c2v32-cover-eyebrow"><span>🛡 保障の棚卸し</span><small>金額ではなく、内容を確認</small></div>
  <div className="c2v32-cover-content">
   <img src="./assets/mudagiri/poses/v1/MUDAGIRI_POSE_07_QUESTION.webp" alt="" loading="lazy"/>
   <div>
    <h2>{insight.heading}</h2>
    <p>{insight.text}</p>
   </div>
  </div>
  <div className="c2v32-cover-next"><span>まずはこれだけ ›</span><strong>{insight.next}</strong></div>
  <details className="c2v32-cover-why"><summary>保障を確認する理由</summary>
   <p>見直しとは、保険料を下げたり新たに契約したりすることだけではありません。公的保障や勤務先の制度、今の契約で何に備えられるかを把握し、不足や重複の可能性を確かめることです。</p>
   <p>この診断だけでは保障の過不足も削減額も算定できません。相談するかどうかは自分で選べます。</p>
  </details>
 </section>;
}
