import React from 'react';
import {JOBS,type JobCode,type StyleId} from './classifierV1';
import {moneyTypeCode} from './money-type-code-v1';
import {JOB_AXES,corePatternForType,dailyScenesForType,type JobAxes} from './resultDailySceneNarrativeV6';
import './result-competitive-v6.css';
import './result-competitive-v7.css';

type Props={
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
};

const STYLE_JA:Record<StyleId,string>={
  DRIVE:'前進',ENJOY:'満足',SECURE:'安心',OPTIMIZE:'ムダなし',
};

const STYLE_HOOK:Record<StyleId,string>={
  DRIVE:'今より前に進めるか',
  ENJOY:'払ったあとも満足できるか',
  SECURE:'決めたあとに困らないか',
  OPTIMIZE:'今の用途にムダがないか',
};

const STYLE_SECONDARY:Record<StyleId,string>={
  DRIVE:'迷った時は、前に進める選択が最後の一押しになりやすい。',
  ENJOY:'条件が近い時は、自分が満足できる選択が残りやすい。',
  SECURE:'条件が近い時は、あとで困りにくい選択が残りやすい。',
  OPTIMIZE:'条件が近い時は、余分が少ない選択が残りやすい。',
};

const MISREAD:Record<JobCode,{looks:string;really:string}>={
  FDM:{looks:'「慎重で、なかなか使わない人」に見えることも。',really:'使わないのではなく、先の予定まで見て「払っても大丈夫」を作ってから決めたい。'},
  FDP:{looks:'「普段は家計をあまり気にしていない人」に見えることも。',really:'毎日見るより、更新や予定の節目でまとめて確認する方が自然。'},
  FNM:{looks:'「最後は感覚で決める人」に見えることも。',really:'先のことも確認したうえで、数字だけでは拾えない違和感も判断に残している。'},
  FNP:{looks:'「途中で方針を変えやすい人」に見えることも。',really:'目的を変えたいのではなく、状況が変わった時に行き方を組み直している。'},
  IDM:{looks:'「使う時と使わない時の差が大きい人」に見えることも。',really:'全部を同じ基準で見るより、今の自分に必要かどうかでメリハリを付けている。'},
  IDP:{looks:'「一部だけ見て、ほかを後回しにする人」に見えることも。',really:'全部を一度に考えるより、今いちばん効く判断から片づける方がラク。'},
  INM:{looks:'「直感でサッと決める人」に見えることも。',really:'条件を見ていないわけではない。最後だけ、自分に合う感覚を判断に残している。'},
  INP:{looks:'「その時の気分で動く人」に見えることも。',really:'ずっと管理するより、動く時と見直す時を分けた方が自分のテンポに合う。'},
};

const DECISION_FLIP:Record<JobCode,JobCode>={
  FDM:'FNM',FNM:'FDM',FDP:'FNP',FNP:'FDP',IDM:'INM',INM:'IDM',IDP:'INP',INP:'IDP',
};

function comparisonCopy(current:JobAxes,currentCode:string,otherCode:string){
  if(current.decision==='N'){
    return `${currentCode}は、条件を見たあとも「自分に合うか」を判断に残しやすい。${otherCode}は、比較して「選ぶ理由が通るか」をより重く見る。`;
  }
  return `${currentCode}は、比較して「選ぶ理由が通るか」を重く見やすい。${otherCode}は、条件を見たあとも最後のしっくり感を判断に残しやすい。`;
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
      <div className="mpp-v6-kicker">あるある / REAL LIFE</div>
      <h2>日常で、こんな判断しない？</h2>
      <div className="mpp-v6-scenes mpp-v7-scenes">{primaryScenes.map(scene=><SceneCard key={scene.label} scene={scene}/>)}</div>
      {extraScenes.length>0&&<details className="mpp-v6-more-scenes"><summary>ほかの場面も見る <small>＋{extraScenes.length}</small></summary><div className="mpp-v6-scenes">{extraScenes.map(scene=><SceneCard key={scene.label} scene={scene}/>)}</div></details>}
      <div className="mpp-v6-type-core mpp-v7-type-core">
        <small>正体 / なんでそうなる？</small>
        <b>{core.headline}</b>
        <p>{core.why}</p>
      </div>
    </section>

    <section className="mpp-v6-section mpp-v6-misread mpp-v7-misread">
      <div className="mpp-v6-kicker">見え方のズレ / GAP</div>
      <h2>外から見える理由と、本人の理由は違う。</h2>
      <div className="mpp-v6-versus"><article><small>外から見ると</small><b>{misread.looks}</b></article><i>≠</i><article><small>本人の中では</small><b>{misread.really}</b></article></div>
    </section>

    <section className="mpp-v6-section mpp-v6-compare mpp-v7-compare">
      <div className="mpp-v6-kicker">友だちと比べる / TYPE COMPARE</div>
      <h2>似てるTYPEでも、決め手はここで分かれる。</h2>
      <div className="mpp-v6-compare-grid">
        <article><small>同じJOBで、価値観が違うと</small><b>{secondaryCode}｜{JOBS[jobCode]}</b><p>{typeCode}は「{STYLE_HOOK[primaryStyle]}」が決め手。もし{secondaryCode}なら「{STYLE_HOOK[secondaryStyle]}」が決め手になりやすい。</p></article>
        <article><small>同じ価値観で、決め方が違うと</small><b>{otherCode}｜{JOBS[otherJob]}</b><p>{comparisonCopy(axes,typeCode,otherCode)}</p></article>
      </div>
      <p className="mpp-v6-social-hook">同じ買い物や旅行でも、「自分ならどう決める？」でTYPEの違いが出やすい。</p>
    </section>

    <details className="mpp-v7-variant-details">
      <summary>同じTYPEの中の「あなたらしさ」も見る</summary>
      <section className="mpp-v6-section mpp-v6-variant mpp-v7-variant">
        <div className="mpp-v6-kicker">あなたの細かい違い</div>
        <h2>{typeCode} の中でも、「{STYLE_JA[secondaryStyle]}」も判断に残りやすい。</h2>
        <p>いちばん強いのは「{STYLE_HOOK[primaryStyle]}」。そこに「{STYLE_HOOK[secondaryStyle]}」も少し入る。{STYLE_SECONDARY[secondaryStyle]}</p>
        <div className="mpp-v6-variant-note"><span>{STYLE_JA[primaryStyle]} が主軸</span><i>＋</i><span>{STYLE_JA[secondaryStyle]} も少し</span></div>
      </section>
    </details>
  </div>;
}
