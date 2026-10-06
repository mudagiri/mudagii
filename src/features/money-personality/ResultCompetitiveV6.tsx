import React from 'react';
import {JOBS,type JobCode,type StyleId} from './classifierV1';
import {moneyTypeCode} from './money-type-code-v1';
import {DAILY_SCENE_LIBRARY_SIZE,JOB_AXES,dailyScenesForType,type JobAxes} from './resultDailySceneNarrativeV3';
import './result-competitive-v6.css';

type Props={
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
};

const STYLE_LABEL:Record<StyleId,string>={
  DRIVE:'DRIVE',ENJOY:'ENJOY',SECURE:'SECURE',OPTIMIZE:'OPTIMIZE',
};

const STYLE_HOOK:Record<StyleId,string>={
  DRIVE:'これで前に進めるか',
  ENJOY:'ちゃんと満足できるか',
  SECURE:'あとで困らないか',
  OPTIMIZE:'今の用途に本当に合っているか',
};

const STYLE_SECONDARY:Record<StyleId,string>={
  DRIVE:'「前に進めるか」という視点も、最後の判断に入りやすい。',
  ENJOY:'「自分がちゃんと満足できるか」も、条件だけでは切り捨てにくい。',
  SECURE:'「あとで困らないか」という安心の視点も、判断に残りやすい。',
  OPTIMIZE:'「今の用途に合っているか」「余分がないか」も、判断に入りやすい。',
};

const MISREAD:Record<JobCode,{looks:string;really:string}>={
  FDM:{looks:'慎重で、なかなかお金を使わない人。',really:'使わないのではなく、「この先も動ける余白」を確認してからGOを出したい。'},
  FDP:{looks:'普段は家計をあまり気にしていない人。',really:'ずっと見るより、意味のある節目で一気に作戦を組み直す方が自然。'},
  FNM:{looks:'最後に感覚で決める、少し気分屋な人。',really:'先の影響も見たうえで、数字だけでは拾えない違和感まで判断材料にしている。'},
  FNP:{looks:'途中で方針を変えやすい人。',really:'変えているのは手段。目的地を外さないために、その時のルートを更新している。'},
  IDM:{looks:'使う・使わないの差が大きい人。',really:'全部を同じ基準で扱わず、「今の自分に役割があるか」でメリハリを付けている。'},
  IDP:{looks:'一部だけに集中して、他を後回しにする人。',really:'全部を触るより、「今いちばん効く1つ」を先に決めることで判断を軽くしている。'},
  INM:{looks:'直感でサッと決める人。',really:'何も見ていないわけではない。現在地をつかんだうえで、最後の1票を「自分に合うか」に入れている。'},
  INP:{looks:'自由で、その時の気分で動く人。',really:'常時管理より、動く時と見直す時を分ける方が自分のテンポを保ちやすい。'},
};

const DECISION_FLIP:Record<JobCode,JobCode>={
  FDM:'FNM',FNM:'FDM',FDP:'FNP',FNP:'FDP',IDM:'INM',INM:'IDM',IDP:'INP',INP:'IDP',
};

function whyType(axes:JobAxes){
  return [
    axes.time==='F'?['時間の見方','先の予定や見通しを、今の判断に入れやすい']:['時間の見方','今得られる価値や、目の前の必要性を判断に入れやすい'],
    axes.decision==='D'?['決め方','比較・整理・確認を使って、選ぶ理由を作りやすい']:['決め方','しっくり感・違和感・感覚を、最後の判断に残しやすい'],
    axes.rhythm==='M'?['お金の把握','普段から自分のお金の現在地・余力感をつかみやすい']:['お金の把握','予定や区切りなど、意味のある節目で確認しやすい'],
  ] as const;
}

function comparisonCopy(current:JobAxes,other:JobCode){
  const otherAxes=JOB_AXES[other];
  if(current.decision!==otherAxes.decision){
    return current.decision==='N'
      ?'あなたは最後に「自分に合うか」を残しやすい。こちらは比較・整理して「理由が通るか」をより重く見る。'
      :'あなたは比較・整理して「理由が通るか」を重く見やすい。こちらは最後のしっくり感や違和感をより残す。';
  }
  return '似て見えるけれど、判断に使う軸が1つ違うTYPE。';
}

function SceneCard({scene,index}:{scene:ReturnType<typeof dailyScenesForType>[number];index:number}){
  return <article><small>{String(index+1).padStart(2,'0')} / {scene.label}</small><b>{scene.title}</b><p>{scene.body}</p><blockquote className="mpp-v6-scene-voice">{scene.voice}</blockquote></article>;
}

export default function ResultCompetitiveV6({jobCode,primaryStyle,secondaryStyle}:Props){
  const axes=JOB_AXES[jobCode];
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const secondaryCode=moneyTypeCode(jobCode,secondaryStyle);
  const otherJob=DECISION_FLIP[jobCode];
  const otherCode=moneyTypeCode(otherJob,primaryStyle);
  const scenes=dailyScenesForType(jobCode,primaryStyle,6);
  const primaryScenes=scenes.slice(0,4);
  const extraScenes=scenes.slice(4);
  const why=whyType(axes);
  const misread=MISREAD[jobCode];

  return <div className="mpp-v6-deep">
    <section className="mpp-v6-section mpp-v6-life">
      <div className="mpp-v6-kicker">MONEY IN REAL LIFE</div>
      <h2>日常の「あ、この時」であなたが出る。</h2>
      <p className="mpp-v6-lead">{DAILY_SCENE_LIBRARY_SIZE}個の日常シーンから、このTYPEの特徴が出やすい場面を選んでいます。スマホや旅行だけに固定せず、買い物・外食・固定費・人付き合い・移動・予定外の出費まで横断します。</p>
      <div className="mpp-v6-scenes">{primaryScenes.map((scene,i)=><SceneCard key={scene.label} scene={scene} index={i}/>)}</div>
      {extraScenes.length>0&&<details className="mpp-v6-more-scenes"><summary>ほかの場面でも見る <small>＋{extraScenes.length}</small></summary><div className="mpp-v6-scenes">{extraScenes.map((scene,i)=><SceneCard key={scene.label} scene={scene} index={i+primaryScenes.length}/>)}</div></details>}
    </section>

    <section className="mpp-v6-section mpp-v6-misread">
      <div className="mpp-v6-kicker">MISREAD / 誤解されやすいところ</div>
      <div className="mpp-v6-versus"><article><small>周りからは</small><b>{misread.looks}</b></article><i>≠</i><article><small>でも実際は</small><b>{misread.really}</b></article></div>
    </section>

    <section className="mpp-v6-section mpp-v6-variant">
      <div className="mpp-v6-kicker">YOUR VARIANT</div>
      <h2>同じ {typeCode} でも、あなたはここが少し違う。</h2>
      <p>表のTYPEは <strong>{typeCode}</strong> のまま。ただ、あなたの結果では <strong>{STYLE_LABEL[secondaryStyle]}</strong> の傾向も出ています。{STYLE_SECONDARY[secondaryStyle]}</p>
      <div className="mpp-v6-variant-note"><span>{STYLE_LABEL[primaryStyle]} が主軸</span><i>＋</i><span>{STYLE_LABEL[secondaryStyle]} も残る</span></div>
    </section>

    <section className="mpp-v6-section mpp-v6-compare">
      <div className="mpp-v6-kicker">LOOK-ALIKE TYPES</div>
      <h2>似てるTYPEと、何が違う？</h2>
      <div className="mpp-v6-compare-grid">
        <article><small>同じJOB・STYLE違い</small><b>{secondaryCode}｜{JOBS[jobCode]}</b><p>JOBは同じでも、{typeCode}は「{STYLE_HOOK[primaryStyle]}」が主軸。{secondaryCode}は「{STYLE_HOOK[secondaryStyle]}」が主軸になる。</p></article>
        <article><small>同じSTYLE・決め方違い</small><b>{otherCode}｜{JOBS[otherJob]}</b><p>{comparisonCopy(axes,otherJob)}</p></article>
      </div>
      <p className="mpp-v6-social-hook">友だちのTYPEが分かったら、同じ日常シーンで比べると「自分との違い」がかなり見えやすい。</p>
    </section>

    <section className="mpp-v6-section mpp-v6-why">
      <div className="mpp-v6-kicker">WHY THIS TYPE?</div>
      <h2>なぜ、このJOBになったのか。</h2>
      <div className="mpp-v6-why-grid">{why.map(([label,body])=><article key={label}><small>{label}</small><p>{body}</p></article>)}</div>
      <p className="mpp-v6-trust">キャラ名だけで決めているわけではなく、この3つの判断パターンの組み合わせがJOBの土台です。</p>
    </section>
  </div>;
}
