import React from 'react';
import type {Chapter2PeerGapV1} from './chapter2-official-peer-gap-v1';

type VerifiedGap=Extract<Chapter2PeerGapV1,{available:true}>;
type Props={category:string;label:string;gap:VerifiedGap;householdLabel:'単身'|'二人以上'};

function signedPoints(v:number){return (v>0?'+':'')+v.toFixed(1)+'pt';}
function signedYen(v:number){return (v>0?'+':v<0?'−':'±')+'¥'+Math.abs(v).toLocaleString('ja-JP');}
function range<T>(lo:T,hi:T,fmt:(v:T)=>string){return lo===hi?fmt(lo):fmt(lo)+' ～ '+fmt(hi);}

/**
 * Comparable percentages only: user's category spend / user's take-home versus
 * the same official age × household group × gross-income cells' category
 * average / average monthly disposable income.
 * No peer yen amount, reduction target, or candidate upper bound is inferred.
 */
export default function Chapter2PeerComparisonCard({category,label,gap,householdLabel}:Props){
 return <section className="c2v32-peer-gap-card c2v32-peer-gap-card--three-way"
   data-section={'OFFICIAL_PEER_GAP_'+category}
   aria-label={label+'の同年代・同世帯区分・同所得帯との支出割合比較'}>
  <strong className="c2v32-peer-gap-heading">📊 同年代・同世帯区分・同所得帯と比べる</strong>
  <div className="c2v32-peer-3way" data-peer-three-way-category={category}>
   <div className="c2v32-peer-metric">
    <span>あなたの負担率</span>
    <strong>{gap.ownPct.toFixed(1)}%</strong>
    <small>今回の支出 ÷ あなたの月手取り</small>
   </div>
   <div className="c2v32-peer-metric">
    <span>同条件の全国参考率</span>
    <strong>{range(gap.peerPctLow,gap.peerPctHigh,v=>v.toFixed(1)+'%')}</strong>
    <small>勤労者{householdLabel}世帯・2024年</small>
   </div>
   <div className="c2v32-peer-metric c2v32-peer-metric--difference">
    <span>あなたと参考の差</span>
    <strong>{range(gap.gapPointsLow,gap.gapPointsHigh,signedPoints)}</strong>
    <small>プラスは参考率より高い／マイナスは低い</small>
   </div>
  </div>
  <p className="c2v32-peer-gap-translation">
   参考率との差を<strong>あなたの手取りで換算</strong>すると
   <b>{range(gap.gapYenLow,gap.gapYenHigh,signedYen)}／月</b>
  </p>
  <small className="c2v32-peer-gap-disclaimer">
   これは<strong>統計上の比較差</strong>で、削減できる金額・ムダ額・見直し候補額ではありません。
   参考率は同一集計区分の平均支出 ÷ 平均可処分所得で、個々の世帯の負担率の平均ではありません。
   地域・人数の完全一致・費目の内訳は未照合です。
  </small>
 </section>;
}
