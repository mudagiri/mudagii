import React from 'react';
import {JOBS,type JobCode,type StyleId} from './classifierV1';
import {moneyTypeCode} from './money-type-code-v1';
import {JOB_AXES,corePatternForType,dailyScenesForType,type JobAxes} from './resultDailySceneNarrativeV5';
import './result-competitive-v6.css';
import './result-competitive-v7.css';

type Props={
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
};

const STYLE_LABEL:Record<StyleId,string>={
  DRIVE:'DRIVE',ENJOY:'ENJOY',SECURE:'SECURE',OPTIMIZE:'OPTIMIZE',
};

const STYLE_HOOK:Record<StyleId,string>={
  DRIVE:'今より前に進めるか',
  ENJOY:'払ったあとも満足できるか',
  SECURE:'決めたあとに困らないか',
  OPTIMIZE:'今の用途にムダがないか',
};

const STYLE_SECONDARY:Record<StyleId,string>={
  DRIVE:'前に進めるかも、最後まで気になりやすい。',
  ENJOY:'払ったあとに満足できるかも、最後まで気になりやすい。',
  SECURE:'決めたあとに困らないかも、最後まで気になりやすい。',
  OPTIMIZE:'使わないものにまで払っていないかも、最後まで気になりやすい。',
};

const MISREAD:Record<JobCode,{looks:string;really:string}>={
  FDM:{looks:'慎重で、なかなかお金を使わない人。',really:'使わないのではなく、先の予定まで見て「払っても大丈夫」を作ってから決めたい。'},
  FDP:{looks:'普段は家計をあまり気にしていない人。',really:'毎日見るより、更新や予定の節目でまとめて確認する方が自然。'},
  FNM:{looks:'最後は感覚で決める、気分屋な人。',really:'先のことも確認したうえで、数字だけでは拾えない違和感も残している。'},
  FNP:{looks:'途中で方針を変えやすい人。',really:'目的を変えたいのではなく、状況が変わった時に行き方を組み直している。'},
  IDM:{looks:'使う時と使わない時の差が大きい人。',really:'全部を同じ基準で見るより、今の自分に必要かどうかでメリハリを付けている。'},
  IDP:{looks:'一部だけ見て、ほかを後回しにする人。',really:'全部を一度に考えるより、今いちばん効く判断から片づける方がラク。'},
  INM:{looks:'直感でサッと決める人。',really:'条件を見ていないわけではない。最後だけ、自分に合う感覚を残している。'},
  INP:{looks:'その時の気分で自由に動く人。',really:'ずっと管理するより、動く時と見直す時を分けた方が自分のテンポに合う。'},
};

const DECISION_FLIP:Record<JobCode,JobCode>={
  FDM:'FNM',FNM:'FDM',FDP:'FNP',FNP:'FDP',IDM:'INM',INM:'IDM',IDP:'INP',INP:'IDP',
};

function comparisonCopy(current:JobAxes,currentCode:string,otherCode:string){
  if(current.decision==='N'){
    return `${currentCode}は、条件を見たあとも「自分に合うか」を残しやすい。${otherCode}は、比較して「選ぶ理由が通るか」をより重く見る。`;
  }
  return `${currentCode}は、比較して「選ぶ理由が通るか」を重く見やすい。${otherCode}は、条件を見たあとも最後のしっくり感を残しやすい。`;
}

function SceneCard({scene}:{scene:ReturnType<typeof dailyScenesForType>[number]}){
  return <article>
    <small>{scene.label}</small>
    <b>{scene.title}</b>
    <small className="mpp-v6-thought-label">その瞬間、頭の中では</small>
    <blockquote className="mpp-v6-scene-voice">{scene.voice}</blockquote>
  </article>;
}

export default function ResultCompetitiveV6({jobCode,primaryStyle,secondaryStyle}:Props){
  const axes=JOB_AXES[jobCode];
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const secondaryCode=moneyTypeCode(jobCode,secondaryStyle);
  const otherJob=DECISION_FLIP[jobCode];
  const otherCode=moneyTypeCode(otherJob,primaryStyle);
  const core=corePatternForType(jobCode,primaryStyle);
  const scenes=dailyScenesForType(jobCode,primaryStyle,6);
  const primaryScenes=scenes.slice(0,3);
  const extraScenes=scenes.slice(3);
  const misread=MISREAD[jobCode];

  return <div className="mpp-v6-deep mpp-v7-deep">
    <section className="mpp-v6-section mpp-v6-life mpp-v7-life">
      <div className="mpp-v6-kicker">REAL LIFE / これ、やりがち？</div>
      <h2>こんな時、こうならない？</h2>
      <div className="mpp-v6-scenes mpp-v7-scenes">{primaryScenes.map(scene=><SceneCard key={scene.label} scene={scene}/>)}</div>
      {extraScenes.length>0&&<details className="mpp-v6-more-scenes"><summary>まだある <small>＋{extraScenes.length}</small></summary><div className="mpp-v6-scenes">{extraScenes.map(scene=><SceneCard key={scene.label} scene={scene}/>)}</div></details>}
      <div className="mpp-v6-type-core mpp-v7-type-core">
        <small>WHY / なんでこうなる？</small>
        <b>{core.headline}</b>
        <p>{core.why}</p>
      </div>
    </section>

    <section className="mpp-v6-section mpp-v6-misread mpp-v7-misread">
      <div className="mpp-v6-kicker">GAP / 周りからはこう見える</div>
      <h2>でも、本人の中ではちょっと違う。</h2>
      <div className="mpp-v6-versus"><article><small>周りからは</small><b>{misread.looks}</b></article><i>≠</i><article><small>本人の中では</small><b>{misread.really}</b></article></div>
    </section>

    <section className="mpp-v6-section mpp-v6-variant mpp-v7-variant">
      <div className="mpp-v6-kicker">YOUR SHADE / 同じTYPEでも少し違う</div>
      <h2>{typeCode} の中でも、{STYLE_LABEL[secondaryStyle]} の傾向が少し残る。</h2>
      <p>いちばん強いのは「{STYLE_HOOK[primaryStyle]}」。ただ、あなたは「{STYLE_HOOK[secondaryStyle]}」も無視しにくい。{STYLE_SECONDARY[secondaryStyle]}</p>
      <div className="mpp-v6-variant-note"><span>{STYLE_LABEL[primaryStyle]} が主役</span><i>＋</i><span>{STYLE_LABEL[secondaryStyle]} も少し</span></div>
    </section>

    <section className="mpp-v6-section mpp-v6-compare mpp-v7-compare">
      <div className="mpp-v6-kicker">TYPE COMPARE / 友だちと比べるならここ</div>
      <h2>似ていても、決め手が違う。</h2>
      <div className="mpp-v6-compare-grid">
        <article><small>同じJOB・価値観違い</small><b>{secondaryCode}｜{JOBS[jobCode]}</b><p>{typeCode}は「{STYLE_HOOK[primaryStyle]}」がいちばん強い。{secondaryCode}は「{STYLE_HOOK[secondaryStyle]}」がいちばん強い。</p></article>
        <article><small>同じ価値観・決め方違い</small><b>{otherCode}｜{JOBS[otherJob]}</b><p>{comparisonCopy(axes,typeCode,otherCode)}</p></article>
      </div>
      <p className="mpp-v6-social-hook">同じ買い物や旅行の場面で比べると、「自分ならこうする」が一発で分かれる。</p>
    </section>
  </div>;
}
