import React from 'react';
import {JOBS,type JobCode,type StyleId} from './classifierV1';
import {moneyTypeCode} from './money-type-code-v1';
import {JOB_AXES,corePatternForType,dailyScenesForType,type JobAxes} from './resultDailySceneNarrativeV6';
import './result-competitive-v6.css';
import './result-competitive-v7.css';
import './result-competitive-v8.css';

type Props={
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
};

type WeaponArc={weapon:string;works:string;overdrive:string;control:string};

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

const WEAPON_ARC:Record<JobCode,WeaponArc>={
  FDM:{weapon:'先回り設計',works:'先の予定と今の選択をつなげて、余白を残したまま決められる。',overdrive:'条件を増やしすぎると、結局いちばん守りたいものがぼやける。',control:'最初に「絶対に守る条件」を1つだけ決める。'},
  FDP:{weapon:'節目の作戦会議',works:'必要な時だけまとめて見て、先の作戦を一気に更新できる。',overdrive:'見直す節目がないと、考える力を使うきっかけごと消えやすい。',control:'「次に見る日」を1つだけ決める。'},
  FNM:{weapon:'予兆キャッチ',works:'数字ではOKでも残る違和感を、判断材料として拾える。',overdrive:'数字と感覚が割れた時、どちらを優先するか決まらず止まりやすい。',control:'越えない数字の線を1つ置いて、その中で感覚を使う。'},
  FNP:{weapon:'航路変更力',works:'目的地を保ったまま、状況に合わせて進み方を変えられる。',overdrive:'守りたい未来が増えるほど、今どこへ向かうかがぼやける。',control:'今いちばん守りたい目的を1つだけ置く。'},
  IDM:{weapon:'納得配分',works:'全部を同じ基準で見ず、今必要なところへメリハリを付けられる。',overdrive:'比較条件が増えるほど、結局何を守りたいかが見えにくくなる。',control:'「守る支出」と「見直す支出」を先に分ける。'},
  IDP:{weapon:'ターゲット選定',works:'候補が多くても、今いちばん効く1つに照準を合わせられる。',overdrive:'優先候補が並ぶと照準が散って、次に動く1つが決まりにくい。',control:'比較は3つまで。実際に動くのは1つだけ。'},
  INM:{weapon:'感覚と現在地の両立',works:'今の余力を見つつ、自分に合う感覚まで残して決められる。',overdrive:'迷った時に情報を足しすぎると、判断軸そのものが散りやすい。',control:'追加で見るものは1つだけ。最後はしっくり感で決める。'},
  INP:{weapon:'柔軟な構え',works:'必要な時だけ見直し、今の状況に合う一手へすぐ変えられる。',overdrive:'節目ごとに基準まで変えると、前回との違いが見えにくくなる。',control:'毎回見る基準を1つだけ固定する。'},
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
  const arc=WEAPON_ARC[jobCode];

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

    <section className="mpp-v6-section mpp-v8-weapon">
      <div className="mpp-v6-kicker">武器と暴走 / WEAPON → OVERDRIVE</div>
      <h2>{arc.weapon}</h2>
      <div className="mpp-v8-weapon-flow">
        <article className="mpp-v8-works"><small>この武器がうまく働くと</small><p>{arc.works}</p></article>
        <div className="mpp-v8-flow-arrow">↓ でも、使いすぎると</div>
        <article className="mpp-v8-overdrive"><small>暴走すると</small><p>{arc.overdrive}</p></article>
        <div className="mpp-v8-control"><small>扱い方はこれだけ</small><b>{arc.control}</b></div>
      </div>
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
