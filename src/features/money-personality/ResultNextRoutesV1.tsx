import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import './result-next-routes-v1.css';

type Props={jobCode:JobCode;primaryStyle:StyleId;onHousehold:()=>void;onLine:()=>void;onShare:()=>void;onOpenBook:()=>void};

export default function ResultNextRoutesV1({jobCode,primaryStyle,onHousehold,onLine,onShare,onOpenBook}:Props){
  const asset=jobCharacterAsset(jobCode);const typeCode=moneyTypeCode(jobCode,primaryStyle);
  return <section className="mpp-next-routes" style={{'--job-accent':asset.accent} as React.CSSProperties}>
    <div className="mpp-next-routes-kicker">SSR ACQUIRED / {typeCode}</div>
    <h2>{asset.name}を獲得！<br/><span>次、どうする？</span></h2>
    <p className="mpp-next-routes-lead">あなたのTYPEは32タイプのうち「{typeCode}」。結果を見せる、他のCLASSをのぞく、そのまま実際の家計を攻略する——好きなルートを選べます。</p>

    <div className="mpp-next-routes-social">
      <button className="mpp-social-action mpp-social-action--share" onClick={onShare}><small>MY TYPE</small><b>{typeCode}をシェア</b><span>「あなたはどのTYPE？」で友だちと比べる →</span></button>
      <button className="mpp-social-action" onClick={onOpenBook}><small>CLASS BOOK</small><b>他の7CLASSを見る</b><span>未解放CLASSをのぞく →</span></button>
    </div>

    <div className="mpp-next-routes-divider"><span>NEXT QUEST</span></div>
    <button className="mpp-route-card mpp-route-card--quest" onClick={onHousehold}>
      <span className="mpp-route-badge">おすすめ</span><small>CHAPTER 2 / NO SIGN-UP</small><b>このTYPEで家計クエストへ</b><p>次は12カテゴリをスキャン。性格ではなく、実際の支出から改善余地がある場所だけを探します。</p><em>登録なしでそのまま冒険を続ける →</em>
    </button>
    <button className="mpp-route-card mpp-route-card--line" onClick={onLine}>
      <span className="mpp-route-gift">SAVE + 特典</span><small>TAKE YOUR TYPE HOME</small><b>{asset.name}専用の攻略ガイドを受け取る</b><p>獲得したTYPEをLINEに持ち帰って保存。CLASS別の攻略ガイドを受け取り、あとから家計診断にも戻れます。</p><em>公式LINEで保存する →</em>
    </button>
    <div className="mpp-next-routes-bonus"><strong>LINE追加後に選べる</strong><span>家計診断を続ける</span><i/><span>詳細レポートを見る</span></div>
  </section>;
}
