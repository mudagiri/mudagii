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
import MoneyPersonalityMudagiri from './MoneyPersonalityMudagiri';
import {PERSONALITY_SCENE_VISUALS} from './mudagiri-personality-visual-v1';
import './result-v17-editorial.css';

type ShareTarget='native'|'x'|'line';
type AxisRow={title:string;left:string;right:string;lean:string;pos:number};
type Props={
  content:V9TypeResult;
  insight:ResultV10Insight;
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
  axes:AxisRow[];
  onShare:(target:ShareTarget)=>void;
  shareStatus:string;
  onExplore:(kind:'scenes'|'style')=>void;
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
function MudagiriBeat({line,visual=PERSONALITY_SCENE_VISUALS.resultDialogue}:{line:string;visual?:typeof PERSONALITY_SCENE_VISUALS[keyof typeof PERSONALITY_SCENE_VISUALS]}){
  return <div className="mpp17-mudagiri-beat"><MoneyPersonalityMudagiri visual={visual} alt="ムダギリくん"/><div className="mpp17-mudagiri-talk"><small>ムダギリくん</small><p>{line}</p></div></div>;
}

export default function ResultV17({content,insight,jobCode,primaryStyle,secondaryStyle,axes,onShare,shareStatus,onExplore,onOpenBook,onHousehold,onRestart}:Props){
  const identity=moneyTypeIdentity(jobCode,primaryStyle);
  const asset=jobCharacterAsset(jobCode);
  const neighbors=moneyTypeNeighbors(jobCode,primaryStyle,secondaryStyle);
  const tags=content.scenes.slice(0,3).map(s=>cleanTag(s.label));
  const more=content.scenes.slice(2);
  const matches=[
    {label:'かなり近い',data:neighbors.close},
    {label:'似てる',data:neighbors.similar},
    {label:'対照的',data:neighbors.contrast},
  ] as const;

  return <main className="mpp17-page" style={{'--mpp17-accent':asset.accent,'--mpp17-style-accent':STYLE_HOLO[primaryStyle],'--mpp17-secondary-accent':STYLE_HOLO[secondaryStyle]} as React.CSSProperties}>
    <div className="mpp17-wrap">

      <section className="mpp17-profile" data-job={jobCode} aria-label="あなたのお金タイプ">
        <div className="mpp17-job-bg" aria-hidden="true"/>
        <div className="mpp17-holo-foil" aria-hidden="true"/>
        <img className="mpp17-holo-texture" src="./assets/foils/v4/MUDAGIRI_EDGE_DIAMOND_HOLO_V4.svg" alt="" aria-hidden="true"/>
        <div className="mpp17-card-edge" aria-hidden="true"/>
        <div className="mpp17-topline"><span>MUDAGIRI / MONEY TYPE</span><b>1 / 32</b></div>
        <div className="mpp17-code">{identity.code}</div>
        <div className="mpp17-portrait"><JobCharacterCard jobCode={jobCode} variant="hero"/></div>
        <div className="mpp17-type-label">あなたのお金タイプ</div>
        <h1>{identity.jobName}</h1>
        <div className="mpp17-value"><span>{STYLE_IDENTITY[primaryStyle].label}</span><b>{STYLE_IDENTITY[primaryStyle].short}</b></div>
        <p className="mpp17-hero">{content.hero}</p>
        <div className="mpp17-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>
        <div className="mpp17-card-foot"><span>ムダギリ｜お金の性格診断</span><b>{asset.animal}</b></div>
      </section>


      <MudagiriBeat line="ちょっと待って。これ、やってない？w"/>
      <section className="mpp17-recognition">
        <header><span>01</span><div><small>まずは、あるある</small><h2>これ、やりがちじゃない？</h2></div></header>
        <div className="mpp17-scene-list">
          {content.scenes.slice(0,2).map(scene=><article key={scene.label}>
            <small>{scene.label}</small>
            <blockquote>「{scene.voice}」</blockquote>
            <p>{scene.hit}</p>
          </article>)}
        </div>
        <details className="mpp17-more" onToggle={event=>{if(event.currentTarget.open)onExplore('scenes')}}>
          <summary>ほかのあるあるも見る <span>＋4</span></summary>
          <div>{more.map(scene=><article key={scene.label}><small>{scene.label}</small><b>「{scene.voice}」</b></article>)}</div>
        </details>
      </section>

      <section className="mpp17-share" id="mpp17-share">
        <div className="mpp17-share-preview" data-job={jobCode}>
          <div className="mpp17-share-jobbg" aria-hidden="true"/>
          <img className="mpp17-share-holo" src="./assets/foils/v4/MUDAGIRI_EDGE_DIAMOND_HOLO_V4.svg" alt="" aria-hidden="true"/>
          <div className="mpp17-share-glint" aria-hidden="true"/>
          <div className="mpp17-share-head"><span>MUDAGIRI / MONEY TYPE</span><b>1 / 32</b></div>
          <div className="mpp17-share-code">{identity.code}</div>
          <div className="mpp17-share-art"><JobCharacterCard jobCode={jobCode} variant="hero"/></div>
          <div className="mpp17-share-type">
            <small>あなたのお金タイプ</small>
            <h2>{identity.jobName}</h2>
            <div className="mpp17-share-value"><span>{STYLE_IDENTITY[primaryStyle].label}</span><b>{STYLE_IDENTITY[primaryStyle].short}</b></div>
            <p>{content.hero}</p>
            <div className="mpp17-share-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>
          </div>
          <footer><span>ムダギリ｜お金の性格診断</span><b>{asset.animal}</b></footer>
        </div>
        <div className="mpp17-share-copy">
          <small>SHARE / シェアカード</small>
          <h2>これ、友だちに見せたくない？</h2>
          <p>タイプとキャラだけが入った画像をシェアできるよ。収入や金額は出ません。</p>
        </div>
        <div className="mpp17-share-buttons">
          <button className="mpp17-share-button--primary" onClick={()=>onShare('native')}>画像カードをシェアする</button>
          <button onClick={()=>onShare('x')}>𝕏 に文章で投稿</button>
          <button onClick={()=>onShare('line')}>LINEでリンクを送る</button>
        </div>
        <p className="mpp17-share-fallback-note">画像を送れない端末では、カードを保存できるよ。</p>
        {shareStatus&&<p className="mpp17-share-status" role="status" aria-live="polite">{shareStatus}</p>}
      </section>

      <details className="mpp17-style-detail" onToggle={event=>{if(event.currentTarget.open)onExplore('style')}}>
        <summary>{STYLE_IDENTITY[primaryStyle].label}ってどういう意味？ <span aria-hidden="true">＋</span></summary>
        <div className="mpp17-style-detail-body">
          <b>{STYLE_IDENTITY[primaryStyle].short}</b>
          <p>{STYLE_IDENTITY[primaryStyle].description}</p>
          <blockquote>「{STYLE_IDENTITY[primaryStyle].example}」</blockquote>
        </div>
      </details>

      <MudagiriBeat line="やっぱりな。たぶんここがお前のクセ。"/>
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

      <MudagiriBeat line="これ、弱点っぽく見えるけど武器でもある。"/>
      <section className="mpp17-strength">
        <header><span>04</span><div><small>このタイプの強み</small><h2>{insight.weapon.name}</h2></div></header>
        <p className="mpp17-strength-main">{insight.weapon.works}</p>
        <div className="mpp17-strength-grid">
          <article><small>行きすぎると</small><p>{insight.weapon.overdrive}</p></article>
          <article><small>こうすると整いやすい</small><p>{insight.weapon.control}</p></article>
        </div>
      </section>

      <section className="mpp17-compare">
        <header><span>05</span><div><small>同じ場面でも、考えることが違う</small><h2>{insight.compare.scene}</h2></div></header>
        <div className="mpp17-compare-row">
          <article className="is-you"><small>あなた</small><b>{insight.compare.you}</b></article>
          <article><small>近いタイプ</small><b>{insight.compare.other}</b></article>
        </div>
      </section>

      <ResultWorldBeatV1 beat="compare"/>

      <section className="mpp17-match">
        <header><span>06</span><div><small>友だちと比べるなら</small><h2>似てる人と、真逆な人。</h2></div></header>
        <p className="mpp17-note">恋愛の相性じゃなくて、お金の考え方が近いかどうかです。</p>
        <div className="mpp17-match-list">
          {matches.map(({label,data})=><article key={label}>
            <JobCharacterCard jobCode={data.jobCode} variant="compact"/>
            <div><small>{label}</small><b>{data.title}</b><span>{moneyTypeCode(data.jobCode,data.style)}</span><p>{data.reason}</p></div>
          </article>)}
        </div>
      </section>

      <MudagiriBeat line="友だちのも見てみ。たぶん全然違うぞ。" visual={PERSONALITY_SCENE_VISUALS.share}/>
      <section className="mpp17-book-preview">
        <div className="mpp17-book-copy"><small>TYPE BOOK / 32タイプ図鑑</small><h2>友だちは、どのタイプ？</h2><p>3つのお金のクセで8つのJOBに分かれて、最後に4つのSTYLEがつきます。気になるタイプをのぞいてみよう。</p></div>
        <div className="mpp17-mini-jobs" aria-hidden="true">
          {JOB_ORDER.map(code=><div key={code} className={code===jobCode?'is-you':''}><JobCharacterCard jobCode={code} variant="compact"/><span>{JOB_CHARACTER_ASSETS[code].name}</span></div>)}
        </div>
        <button className="mpp17-button mpp17-button--dark" onClick={onOpenBook}>32タイプ図鑑を見る</button>
      </section>



      <details className="mpp17-details">
        <summary>なんでこのタイプになった？ <span>3つのクセを見る</span></summary>
        <div className="mpp17-axis-list">
          {axes.map(axis=><article key={axis.title}><header><b>{axis.title}</b><small>{axis.lean}</small></header><div className="mpp17-axis-labels"><span>{axis.left}</span><span>{axis.right}</span></div><div className="mpp17-axis-track"><i style={{left:axis.pos+'%'}}/></div></article>)}
        </div>
      </details>

      <ResultWorldBeatV1 beat="next"/>

      <MudagiriBeat line="性格は分かった。次は財布の中身見に行くぞ。" visual={PERSONALITY_SCENE_VISUALS.householdCta}/>
      <section className="mpp17-next">
        <small>次にやるなら、これ</small>
        <h2>{content.nextMove}</h2>
        <div className="mpp17-next-quest"><b>次は、実際の家計を見てみよう。</b><p>12カテゴリの支出から、見直せそうなところを一緒に探そう。全部を削る必要はないよ。</p></div>
        <button className="mpp17-button mpp17-button--accent" onClick={onHousehold}>家計クエストへ進む</button>
        <button className="mpp17-restart" onClick={onRestart}>もう一度診断する</button>
      </section>

    </div>
  </main>;
}
