import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import type {V9TypeResult} from './resultV9Content';
import type {ResultV10Insight} from './resultV10Insight';
import {moneyTypeIdentity,STYLE_IDENTITY} from './money-type-identity-v1';
import {moneyTypeCode} from './money-type-code-v1';
import {moneyTypeNeighbors} from './money-type-neighbors-v1';
import {jobCharacterAsset,JOB_CHARACTER_ASSETS} from './job-character-assets-v1';
import JobCharacterCard from './JobCharacterCard';
import ResultWorldBeatV1 from './ResultWorldBeatV1';
import './result-v17-editorial.css';

type ShareTarget='x'|'instagram'|'threads'|'line';
type AxisRow={title:string;left:string;right:string;lean:string;pos:number};
type Props={
  content:V9TypeResult;
  insight:ResultV10Insight;
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
  axes:AxisRow[];
  onShare:(target:ShareTarget)=>void;
  onOpenBook:()=>void;
  onHousehold:()=>void;
  onRestart:()=>void;
};

const JOB_ORDER:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLE_HOLO:Record<StyleId,string>={
  DRIVE:'#ff625f',
  ENJOY:'#ff86c8',
  SECURE:'#62d9e8',
  OPTIMIZE:'#7bdc91',
};

function cleanTag(value:string){return '#'+value.replace(/\p{Extended_Pictographic}/gu,'').replace(/[\s　]/g,'').replace(/[・/]/g,'').replace(/^[#]+/,'');}

export default function ResultV17({content,insight,jobCode,primaryStyle,secondaryStyle,axes,onShare,onOpenBook,onHousehold,onRestart}:Props){
  const identity=moneyTypeIdentity(jobCode,primaryStyle);
  const asset=jobCharacterAsset(jobCode);
  const neighbors=moneyTypeNeighbors(jobCode,primaryStyle,secondaryStyle);
  const tags=content.scenes.slice(0,3).map(s=>cleanTag(s.label));
  const more=content.scenes.slice(3);
  const matches=[
    {label:'かなり近い',data:neighbors.close},
    {label:'似てる',data:neighbors.similar},
    {label:'対照的',data:neighbors.contrast},
  ] as const;

  return <main className="mpp17-page" style={{'--mpp17-accent':asset.accent,'--mpp17-style-accent':STYLE_HOLO[primaryStyle],'--mpp17-secondary-accent':STYLE_HOLO[secondaryStyle]} as React.CSSProperties}>
    <div className="mpp17-wrap">

      <ResultWorldBeatV1 beat="complete"/>

      <section className="mpp17-profile" data-job={jobCode} aria-label="あなたのお金タイプ">
        <div className="mpp17-job-bg" aria-hidden="true"/>
        <div className="mpp17-holo-foil" aria-hidden="true"/>
        <img className="mpp17-holo-texture" src="./assets/foils/v2/MUDAGIRI_DIAMOND_HOLO_V2.svg" alt="" aria-hidden="true"/>
        <div className="mpp17-card-edge" aria-hidden="true"/>
        <div className="mpp17-topline"><span>MUDAGIRI / MONEY TYPE</span><b>1 / 32</b></div>
        <div className="mpp17-code">{identity.code}</div>
        <div className="mpp17-portrait"><JobCharacterCard jobCode={jobCode} variant="hero"/></div>
        <div className="mpp17-type-label">あなたのお金タイプ</div>
        <h1>{identity.jobName}</h1>
        <div className="mpp17-value"><span>{STYLE_IDENTITY[primaryStyle].label}</span>を大事にするタイプ</div>
        <p className="mpp17-hero">{content.hero}</p>
        <div className="mpp17-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>
        <div className="mpp17-card-foot"><span>ムダギリ｜お金の性格診断</span><b>{asset.animal}</b></div>
      </section>

      <section className="mpp17-recognition">
        <header><span>01</span><div><small>まずは、あるある</small><h2>これ、やりがちじゃない？</h2></div></header>
        <div className="mpp17-scene-list">
          {content.scenes.slice(0,3).map(scene=><article key={scene.label}>
            <small>{scene.label}</small>
            <blockquote>「{scene.voice}」</blockquote>
            <p>{scene.hit}</p>
          </article>)}
        </div>
        <details className="mpp17-more">
          <summary>ほかのあるあるも見る <span>＋3</span></summary>
          <div>{more.map(scene=><article key={scene.label}><small>{scene.label}</small><b>「{scene.voice}」</b></article>)}</div>
        </details>
      </section>

      <section className="mpp17-core">
        <span className="mpp17-index">02</span>
        <small>つまり、あなたは</small>
        <h2>{insight.truth}</h2>
      </section>

      <section className="mpp17-gap">
        <header><span>03</span><div><small>本人と周りでは、ちょっと違う</small><h2>外から見ると、こう見える。</h2></div></header>
        <div className="mpp17-gap-pair">
          <article><small>周りからは</small><b>{insight.gap.looks}</b></article>
          <i>でも</i>
          <article><small>自分の中では</small><b>{insight.gap.really}</b></article>
        </div>
      </section>

      <section className="mpp17-strength">
        <header><span>04</span><div><small>このタイプの強み</small><h2>{insight.weapon.name}</h2></div></header>
        <p className="mpp17-strength-main">{insight.weapon.works}</p>
        <div className="mpp17-strength-grid">
          <article><small>行きすぎると</small><p>{insight.weapon.overdrive}</p></article>
          <article><small>こうすると整いやすい</small><p>{insight.weapon.control}</p></article>
        </div>
      </section>

      <section className="mpp17-compare">
        <header><span>05</span><div><small>同じ場面でも、タイプで違う</small><h2>{insight.compare.scene}</h2></div></header>
        <div className="mpp17-compare-row">
          <article className="is-you"><small>あなた</small><b>{insight.compare.you}</b></article>
          <article><small>近いタイプ</small><b>{insight.compare.other}</b></article>
        </div>
      </section>

      <ResultWorldBeatV1 beat="compare"/>

      <section className="mpp17-match">
        <header><span>06</span><div><small>お金の感覚で見る</small><h2>近いタイプ、真逆のタイプ。</h2></div></header>
        <p className="mpp17-note">恋愛相性ではなく、診断上の「お金の考え方の近さ」です。</p>
        <div className="mpp17-match-list">
          {matches.map(({label,data})=><article key={label}>
            <JobCharacterCard jobCode={data.jobCode} variant="compact"/>
            <div><small>{label}</small><b>{data.title}</b><span>{moneyTypeCode(data.jobCode,data.style)}</span><p>{data.reason}</p></div>
          </article>)}
        </div>
      </section>

      <section className="mpp17-book-preview">
        <div className="mpp17-book-copy"><small>07 / 32タイプ図鑑</small><h2>友だちは、どのタイプ？</h2><p>8つのJOB × 4つの価値観。キャラから気になるタイプをのぞけます。</p></div>
        <div className="mpp17-mini-jobs" aria-hidden="true">
          {JOB_ORDER.map(code=><div key={code} className={code===jobCode?'is-you':''}><JobCharacterCard jobCode={code} variant="compact"/><span>{JOB_CHARACTER_ASSETS[code].name}</span></div>)}
        </div>
        <button className="mpp17-button mpp17-button--dark" onClick={onOpenBook}>32タイプ図鑑を見る</button>
      </section>

      <section className="mpp17-share" id="mpp17-share">
        <div className="mpp17-share-preview" data-job={jobCode}>
          <div className="mpp17-share-jobbg" aria-hidden="true"/>
          <img className="mpp17-share-holo" src="./assets/foils/v2/MUDAGIRI_DIAMOND_HOLO_V2.svg" alt="" aria-hidden="true"/>
          <div className="mpp17-share-glint" aria-hidden="true"/>
          <div className="mpp17-share-head"><span>MUDAGIRI / MONEY TYPE</span><b>1 / 32</b></div>
          <div className="mpp17-share-code">{identity.code}</div>
          <div className="mpp17-share-art"><JobCharacterCard jobCode={jobCode} variant="hero"/></div>
          <div className="mpp17-share-type">
            <small>あなたのお金タイプ</small>
            <h2>{identity.jobName}</h2>
            <div className="mpp17-share-value"><span>{STYLE_IDENTITY[primaryStyle].label}</span>を大事にするタイプ</div>
            <p>{content.hero}</p>
            <div className="mpp17-share-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>
          </div>
          <footer><span>ムダギリ｜お金の性格診断</span><b>{asset.animal}</b></footer>
        </div>
        <div className="mpp17-share-copy">
          <small>08 / SHARE</small>
          <h2>このカードを、そのままシェア。</h2>
          <p>TYPE・キャラ・一言・ハッシュタグを1枚に。金額や収入は載りません。</p>
        </div>
        <div className="mpp17-share-buttons">
          <button onClick={()=>onShare('x')}>𝕏</button>
          <button onClick={()=>onShare('instagram')}>Instagram</button>
          <button onClick={()=>onShare('threads')}>Threads</button>
          <button onClick={()=>onShare('line')}>LINE</button>
        </div>
      </section>

      <details className="mpp17-details">
        <summary>診断の内訳を見る <span>3つの傾向</span></summary>
        <div className="mpp17-axis-list">
          {axes.map(axis=><article key={axis.title}><header><b>{axis.title}</b><small>{axis.lean}</small></header><div className="mpp17-axis-labels"><span>{axis.left}</span><span>{axis.right}</span></div><div className="mpp17-axis-track"><i style={{left:axis.pos+'%'}}/></div></article>)}
        </div>
      </details>

      <ResultWorldBeatV1 beat="next"/>

      <section className="mpp17-next">
        <small>次にやるなら、これ</small>
        <h2>{content.nextMove}</h2>
        <div className="mpp17-next-quest"><b>次は、実際の家計を見てみよう。</b><p>性格が分かったら、次は実際の支出。削る前提ではなく、変えやすいところだけ探します。</p></div>
        <button className="mpp17-button mpp17-button--accent" onClick={onHousehold}>家計クエストへ進む</button>
        <button className="mpp17-restart" onClick={onRestart}>もう一度診断する</button>
      </section>

    </div>
  </main>;
}
