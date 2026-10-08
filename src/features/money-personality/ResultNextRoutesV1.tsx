import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import {moneyTypeIdentity} from './money-type-identity-v1';
import './result-next-routes-v1.css';

type Props={jobCode:JobCode;primaryStyle:StyleId;onHousehold:()=>void;onLine:()=>void;onShare:()=>void;onOpenBook:()=>void};

export default function ResultNextRoutesV1({jobCode,primaryStyle,onHousehold,onLine,onShare,onOpenBook}:Props){
  const asset=jobCharacterAsset(jobCode);
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const identity=moneyTypeIdentity(jobCode,primaryStyle);
  return <section className="mpp-next-routes" style={{'--job-accent':asset.accent} as React.CSSProperties}>
    <div className="mpp-next-routes-kicker">YOUR MONEY TYPE / {typeCode}</div>
    <h2>{identity.compact}だった！<br/><span>次、どうする？</span></h2>
    <p className="mpp-next-routes-lead"><b>{identity.full}</b> まで出た。ここで終わってもいいし、友だちと比べてもいい。もう少し進めるなら、次は実際の家計を見にいこう。</p>

    <div className="mpp-next-routes-social">
      <button className="mpp-social-action mpp-social-action--share" onClick={onShare}><small>MY TYPE</small><b>{typeCode}をシェア</b><span>友だちとタイプを比べる →</span></button>
      <button className="mpp-social-action" onClick={onOpenBook}><small>TYPE BOOK</small><b>32TYPE図鑑を見る</b><span>似てるやつ、真逆なやつを見てみる →</span></button>
    </div>

    <div className="mpp-next-routes-divider"><span>NEXT QUEST</span></div>
    <button className="mpp-route-card mpp-route-card--quest" onClick={onHousehold}>
      <span className="mpp-route-badge">おすすめ</span><small>CHAPTER 2 / NO SIGN-UP</small><b>このまま家計クエストへ</b><p>次は12カテゴリを見ながら、「ここなら変えられそう」を実際の支出から探します。</p><em>登録なしでそのまま続ける →</em>
    </button>
    <button className="mpp-route-card mpp-route-card--line" onClick={onLine}>
      <span className="mpp-route-gift">LINE特典</span><small>CLASS BONUS</small><b>{asset.name}専用の攻略ガイドを受け取る</b><p>あなたのJOBに合わせた攻略ガイドをLINEで受け取れます。いらなければ、そのまま家計クエストへ進んでOK。</p><em>公式LINEで攻略ガイドを受け取る →</em>
    </button>
    <div className="mpp-next-routes-bonus"><strong>LINE特典</strong><span>CLASS別攻略ガイド</span><i/><span>詳細レポートへつながる導線</span></div>
  </section>;
}
