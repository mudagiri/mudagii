import React from 'react';
import type {Chapter2PeerGapV1} from './chapter2-official-peer-gap-v1';

type VerifiedGap=Extract<Chapter2PeerGapV1,{available:true}>;
type Props={category:string;label:string;gap:VerifiedGap;householdLabel:'単身'|'二人以上';ownMonthlyExpenseYen?:number};

function signedPoints(v:number){return (v>0?'+':'')+v.toFixed(1)+'pt';}
function signedYen(v:number){return (v>0?'+':v<0?'−':'±')+'¥'+Math.abs(v).toLocaleString('ja-JP');}
function range<T>(lo:T,hi:T,fmt:(v:T)=>string){return lo===hi?fmt(lo):fmt(lo)+' ～ '+fmt(hi);}

/**
 * Three-way data remain 100% sourced, but one-screen card shows ONLY the
 * user's actual expense, two comparable rates, and the point gap.
 * The hypothetical yen translation + full methodological notes are opt-in.
 * Official comparison gap is neither CONFIRMED saving nor a savings upper bound.
 */
export default function Chapter2PeerComparisonCard({category,label,gap,householdLabel,ownMonthlyExpenseYen}:Props){
 return <section className="c2v32-peer-gap-card c2v32-peer-gap-card--three-way"
   data-section={'OFFICIAL_PEER_GAP_'+category}
   aria-label={label+'の同年代・同世帯区分・同所得帯との支出割合比較'}>
  <strong className="c2v32-peer-gap-heading">📊 同年代・同所得帯の参考と比較</strong>
  {typeof ownMonthlyExpenseYen==='number'&&Number.isFinite(ownMonthlyExpenseYen)&&ownMonthlyExpenseYen>=0&&
   <p className="c2v32-peer-own-amount">あなたの支出 <b>¥{ownMonthlyExpenseYen.toLocaleString('ja-JP')}／月</b></p>}
  <div className="c2v32-peer-3way" data-peer-three-way-category={category}>
   <div className="c2v32-peer-metric">
    <span>あなたの負担率</span>
    <strong>{gap.ownPct.toFixed(1)}%</strong>
   </div>
   <div className="c2v32-peer-metric">
    <span>全国の参考率</span>
    <strong>{range(gap.peerPctLow,gap.peerPctHigh,v=>v.toFixed(1)+'%')}</strong>
   </div>
   <div className="c2v32-peer-metric c2v32-peer-metric--difference">
    <span>参考との差</span>
    <strong>{range(gap.gapPointsLow,gap.gapPointsHigh,signedPoints)}</strong>
    <small>これは統計上の差で、減らせる金額ではないよ。</small>
   </div>
  </div>
  <details className="c2v32-peer-gap-method" data-section={'OFFICIAL_PEER_GAP_DETAIL_'+category}>
   <summary>差の円換算・比較条件を詳しく見る</summary>
   <p className="c2v32-peer-gap-translation">
    参考率との差を、あなたの月手取りで機械的に換算すると
    <b>{range(gap.gapYenLow,gap.gapYenHigh,signedYen)}／月</b>
   </p>
   <small className="c2v32-peer-gap-disclaimer">
    これは<strong>統計上の比較差</strong>で、削減可能額・ムダ額・見直し候補額ではありません。
    本人の負担率＝今回の支出÷本人の月手取り。全国参考率＝2024年の同一公表区分での平均費目支出÷平均可処分所得。
    全国の勤労者{householdLabel}世帯が対象。個々の世帯の率の平均ではなく、地域・費目内訳や二人以上世帯の人数は未照合です。
   </small>
  </details>
 </section>;
}
