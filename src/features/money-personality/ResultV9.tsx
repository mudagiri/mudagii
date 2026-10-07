import React from 'react';
import type {V9TypeResult} from './resultV9Content';
import type {ResultV10Insight} from './resultV10Insight';
import './result-v9.css';
import './result-v11-polish.css';
import './result-v12-jp.css';
import './result-v13-world.css';
import './result-v14-household-grade.css';

type Props={
  content:V9TypeResult;
  onShare:()=>void;
  insight:ResultV10Insight;
};

function SceneCard({scene,compact=false}:{scene:V9TypeResult['scenes'][number];compact?:boolean}){
  return <article className={`mpp-v9-scene${compact?' mpp-v9-scene--compact':''}`}>
    <small>{scene.label}</small>
    {!compact&&<b>{scene.hit}</b>}
    <blockquote>「{scene.voice}」</blockquote>
  </article>;
}

export default function ResultV9({content,onShare,insight}:Props){
  const primary=content.scenes.slice(0,3);
  const more=content.scenes.slice(3);
  return <div className="mpp-result-v9">
    <section className="mpp-v9-real">
      <div className="mpp-v9-kicker">あるある</div>
      <h2>こんなこと、ない？</h2>
      <div className="mpp-v9-scenes">{primary.map(scene=><SceneCard key={scene.label} scene={scene}/>)}</div>
      <details className="mpp-v9-more">
        <summary>ほかの場面も見る <span>＋3</span></summary>
        <div className="mpp-v9-more-list">{more.map(scene=><SceneCard key={scene.label} scene={scene} compact/>)}</div>
      </details>
    </section>

    <section className="mpp-v9-truth">
      <small>つまり、あなたは</small>
      <b>{insight.truth}</b>
    </section>

    <section className="mpp-v9-gap">
      <div className="mpp-v9-kicker">周りからはこう見える</div>
      <div className="mpp-v9-gap-grid">
        <article><small>周りからは</small><b>{insight.gap.looks}</b></article>
        <i>≠</i>
        <article><small>自分の中では</small><b>{insight.gap.really}</b></article>
      </div>
    </section>

    <section className="mpp-v9-weapon">
      <div className="mpp-v9-kicker">このタイプの強み</div>
      <h2>{insight.weapon.name}</h2>
      <div className="mpp-v9-weapon-line">
        <article><small>強みとして出ると</small><p>{insight.weapon.works}</p></article>
        <span>→</span>
        <article><small>行きすぎると</small><p>{insight.weapon.overdrive}</p></article>
      </div>
      <div className="mpp-v9-control"><small>整え方</small><b>{insight.weapon.control}</b></div>
    </section>

    <section className="mpp-v9-compare">
      <div className="mpp-v9-kicker">友だちと比べると</div>
      <h2>{insight.compare.scene}</h2>
      <div className="mpp-v9-compare-grid">
        <article><small>あなた</small><b>{insight.compare.you}</b></article>
        <article><small>近いタイプなら</small><b>{insight.compare.other}</b></article>
      </div>
      <div className="mpp-v9-compare-share">
        <small>友だちは何タイプ？</small>
        <b>同じ場面で比べると、違いがもっと分かりやすい。</b>
        <button className="mpp-secondary" onClick={onShare}>タイプカードをシェアする</button>
      </div>
    </section>

  </div>;
}
