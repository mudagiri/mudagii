import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import type {V9TypeResult} from './resultV9Content';
import type {ResultV10Insight} from './resultV10Insight';
import {moneyTypeNeighbors} from './money-type-neighbors-v1';
import {moneyTypeCode} from './money-type-code-v1';
import JobCharacterCard from './JobCharacterCard';
import './result-v9.css';
import './result-v16-clean.css';

type ShareTarget='x'|'instagram'|'threads'|'line';
type Props={
  content:V9TypeResult;
  insight:ResultV10Insight;
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
  onShare:(target:ShareTarget)=>void;
  onOpenBook:()=>void;
};

function SceneCard({scene,compact=false}:{scene:V9TypeResult['scenes'][number];compact?:boolean}){
  return <article className={`mpp-v9-scene${compact?' mpp-v9-scene--compact':''}`}>
    <small>{scene.label}</small>
    {!compact&&<b>{scene.hit}</b>}
    <blockquote>「{scene.voice}」</blockquote>
  </article>;
}

export default function ResultV9({content,insight,jobCode,primaryStyle,secondaryStyle,onShare,onOpenBook}:Props){
  const primary=content.scenes.slice(0,3);
  const more=content.scenes.slice(3);
  const neighbors=moneyTypeNeighbors(jobCode,primaryStyle,secondaryStyle);
  const neighborRows=[
    {key:'close',label:'かなり近い',value:neighbors.close},
    {key:'similar',label:'似てる',value:neighbors.similar},
    {key:'contrast',label:'対照的',value:neighbors.contrast},
  ] as const;
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
    </section>

    <section className="mpp-v15-match">
      <div className="mpp-v9-kicker">お金の価値観で見る相性</div>
      <h2>近いタイプ、意外と違うタイプ。</h2>
      <p className="mpp-v15-match-lead">恋愛や人間関係の相性ではなく、診断上の「お金の考え方の近さ」です。</p>
      <div className="mpp-v15-match-list">
        {neighborRows.map(({key,label,value})=><article key={key} className={`is-${key}`}>
          <JobCharacterCard jobCode={value.jobCode} variant="compact"/>
          <div><small>{label}</small><b>{value.title}</b><span>{moneyTypeCode(value.jobCode,value.style)}</span><p>{value.reason}</p></div>
        </article>)}
      </div>
      <button className="mpp-secondary mpp-v15-book-button" onClick={onOpenBook}>32タイプ図鑑を見る</button>
    </section>

    <section className="mpp-v15-share">
      <div className="mpp-v9-kicker">結果をシェア</div>
      <h2>「自分、こういうタイプらしい。」</h2>
      <p>金額や収入は出さず、タイプ名と診断の一言だけをカードにします。</p>
      <div className="mpp-v15-share-buttons">
        <button onClick={()=>onShare('x')}>𝕏</button>
        <button onClick={()=>onShare('instagram')}>Instagram</button>
        <button onClick={()=>onShare('threads')}>Threads</button>
        <button onClick={()=>onShare('line')}>LINE</button>
      </div>
    </section>
  </div>;
}
