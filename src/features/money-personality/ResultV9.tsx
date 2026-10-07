import React from 'react';
import type {StyleId} from './classifierV1';
import type {V9TypeResult} from './resultV9Content';
import './result-v9.css';

type Props={
  content:V9TypeResult;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
  onShare:()=>void;
};

const STYLE_JA:Record<StyleId,string>={
  DRIVE:'前進',
  ENJOY:'満足',
  SECURE:'安心',
  OPTIMIZE:'ムダなし',
};

const STYLE_HOOK:Record<StyleId,string>={
  DRIVE:'今より前に進めるか',
  ENJOY:'払ったあとも満足できるか',
  SECURE:'決めたあとも安心できるか',
  OPTIMIZE:'今の用途にムダがないか',
};

function SceneCard({scene}:{scene:V9TypeResult['scenes'][number]}){
  return <article className="mpp-v9-scene">
    <small>{scene.label}</small>
    <b>{scene.hit}</b>
    <blockquote>「{scene.voice}」</blockquote>
  </article>;
}

export default function ResultV9({content,primaryStyle,secondaryStyle,onShare}:Props){
  const primary=content.scenes.slice(0,3);
  const more=content.scenes.slice(3);
  return <div className="mpp-result-v9">
    <section className="mpp-v9-real">
      <div className="mpp-v9-kicker">あるある / REAL LIFE</div>
      <h2>こんな瞬間、ない？</h2>
      <div className="mpp-v9-scenes">{primary.map(scene=><SceneCard key={scene.label} scene={scene}/>)}</div>
      <details className="mpp-v9-more">
        <summary>ほかの場面も見る <span>＋3</span></summary>
        <div className="mpp-v9-more-list">{more.map(scene=><SceneCard key={scene.label} scene={scene}/>)}</div>
      </details>
    </section>

    <section className="mpp-v9-truth">
      <small>つまり、あなたは</small>
      <b>{content.truth}</b>
    </section>

    <section className="mpp-v9-gap">
      <div className="mpp-v9-kicker">見え方のズレ / GAP</div>
      <div className="mpp-v9-gap-grid">
        <article><small>外から見ると</small><b>{content.gap.looks}</b></article>
        <i>≠</i>
        <article><small>でも本人の中では</small><b>{content.gap.really}</b></article>
      </div>
    </section>

    <section className="mpp-v9-weapon">
      <div className="mpp-v9-kicker">武器 → 暴走 → 戻し方</div>
      <h2>{content.weapon.name}</h2>
      <div className="mpp-v9-weapon-line">
        <article><small>うまく働くと</small><p>{content.weapon.works}</p></article>
        <span>→</span>
        <article><small>やりすぎると</small><p>{content.weapon.overdrive}</p></article>
      </div>
      <div className="mpp-v9-control"><small>戻し方はこれだけ</small><b>{content.weapon.control}</b></div>
    </section>

    <section className="mpp-v9-compare">
      <div className="mpp-v9-kicker">友だちと比べる / TYPE COMPARE</div>
      <h2>似てても、決め手はここで分かれる。</h2>
      <p>{content.compare}</p>
    </section>

    <details className="mpp-v9-secondary">
      <summary>同じTYPEの中の「あなたらしさ」も見る</summary>
      <div>
        <small>PRIMARY</small>
        <b>{STYLE_JA[primaryStyle]}：「{STYLE_HOOK[primaryStyle]}」</b>
        <small>SECONDARY</small>
        <b>{STYLE_JA[secondaryStyle]}：「{STYLE_HOOK[secondaryStyle]}」も少し残りやすい</b>
        <p>公開TYPEは変わりません。これは同じTYPEの中で出る細かい違いです。</p>
      </div>
    </details>

    <section className="mpp-v9-share">
      <small>「これ俺じゃんw」があったら</small>
      <b>友だちにもTYPEを見せて比べてみる。</b>
      <button className="mpp-secondary" onClick={onShare}>このTYPEカードをシェア</button>
    </section>
  </div>;
}
