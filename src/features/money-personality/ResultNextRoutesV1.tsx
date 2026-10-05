import React from 'react';
import type {JobCode} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import './result-next-routes-v1.css';

type Props={jobCode:JobCode;onHousehold:()=>void;onLine:()=>void;onShare:()=>void;onOpenBook:()=>void};

export default function ResultNextRoutesV1({jobCode,onHousehold,onLine,onShare,onOpenBook}:Props){
  const asset=jobCharacterAsset(jobCode);
  return <section className="mpp-next-routes" style={{'--job-accent':asset.accent} as React.CSSProperties}>
    <div className="mpp-next-routes-kicker">QUEST COMPLETE / WHAT'S NEXT?</div>
    <h2>この結果、ここで終わらせる？</h2>
    <p className="mpp-next-routes-lead">性格がわかったら、次は「実際のお金」を見る番。今すぐ家計を診断するか、結果を保存してあとから続けられます。</p>
    <button className="mpp-route-card mpp-route-card--quest" onClick={onHousehold}>
      <span className="mpp-route-badge">おすすめ</span><small>CHAPTER 2</small><b>このまま家計クエストへ</b><p>12カテゴリをスキャンして、改善余地がある場所を探す。</p><em>登録なしでそのまま進む →</em>
    </button>
    <button className="mpp-route-card mpp-route-card--line" onClick={onLine}>
      <span className="mpp-route-gift">LINE限定特典</span><small>SAVE & BONUS</small><b>結果を保存して、攻略ガイドを受け取る</b><p>あなたのCLASS専用「お金の攻略ガイド」をLINEで保存。あとから家計診断にも戻れます。</p><em>公式LINEで受け取る →</em>
    </button>
    <div className="mpp-next-routes-bonus"><strong>LINE追加後に選べる</strong><span>家計診断を続ける</span><i/> <span>詳細レポートを見る</span></div>
    <div className="mpp-next-routes-minor"><button onClick={onShare}>結果をシェア</button><button onClick={onOpenBook}>CLASS図鑑を見る</button></div>
  </section>;
}
