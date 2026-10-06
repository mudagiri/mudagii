import React from 'react';
import {JOBS,type JobCode,type StyleId} from './classifierV1';
import {moneyTypeCode} from './money-type-code-v1';
import './result-competitive-v6.css';

type Props={
  jobCode:JobCode;
  primaryStyle:StyleId;
  secondaryStyle:StyleId;
};

type JobAxes={time:'F'|'I';decision:'D'|'N';rhythm:'M'|'P'};
type EverydayScene={label:string;title:string;body:string;voice:string};

const JOB_AXES:Record<JobCode,JobAxes>={
  FDM:{time:'F',decision:'D',rhythm:'M'},
  FDP:{time:'F',decision:'D',rhythm:'P'},
  FNM:{time:'F',decision:'N',rhythm:'M'},
  FNP:{time:'F',decision:'N',rhythm:'P'},
  IDM:{time:'I',decision:'D',rhythm:'M'},
  IDP:{time:'I',decision:'D',rhythm:'P'},
  INM:{time:'I',decision:'N',rhythm:'M'},
  INP:{time:'I',decision:'N',rhythm:'P'},
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

const PHONE_STYLE:Record<StyleId,{hook:string;voice:string}>={
  DRIVE:{hook:'仕事や毎日の動きが明確に速くなるか',voice:'これに替えたら、今よりできること増える？'},
  ENJOY:{hook:'毎日触るたびに「これにしてよかった」と思えるか',voice:'毎日使うなら、触ってて気分いい方がよくない？'},
  SECURE:{hook:'数年使っても困らなそうか',voice:'買った後に容量とか電池で困るのは嫌だな。'},
  OPTIMIZE:{hook:'自分が使う機能に対して余計がないか',voice:'その機能、本当に俺使う？そこに払う必要ある？'},
};

const APPLIANCE_STYLE:Record<StyleId,{hook:string;voice:string}>={
  DRIVE:{hook:'時短になって、今より動きやすくなるか',voice:'毎日10分でも浮くなら、結構デカくない？'},
  ENJOY:{hook:'使うたびに生活の満足度が上がるか',voice:'毎日使うものなら、ちょっとテンション上がる方がいい。'},
  SECURE:{hook:'故障や買い直しの心配を減らせるか',voice:'安く買ってすぐ壊れるのが一番イヤ。'},
  OPTIMIZE:{hook:'必要な機能だけで役割がきれいに満たせるか',voice:'機能20個あっても、使うの3個じゃない？'},
};

const CLOTHES_STYLE:Record<StyleId,{hook:string;voice:string}>={
  DRIVE:{hook:'着た時に自分の行動や見せ方を後押ししてくれるか',voice:'これ着たら、出る場所ちょっと増えそう。'},
  ENJOY:{hook:'鏡を見た瞬間に気分が上がるか',voice:'こっち着た時の方が、普通にテンション上がる。'},
  SECURE:{hook:'何度も着られて「失敗した」が起きにくいか',voice:'一回だけ着て終わるやつは避けたいな。'},
  OPTIMIZE:{hook:'手持ちと合わせやすく、ちゃんと出番があるか',voice:'これ、家にある服と3パターンくらい組める？'},
};

const TRAVEL_STYLE:Record<StyleId,{hook:string;voice:string}>={
  DRIVE:{hook:'経験として何か残るか、次につながるか',voice:'せっかく行くなら、何か持って帰れる旅にしたい。'},
  ENJOY:{hook:'「行ってよかった」がちゃんと残るか',voice:'安く済ませて微妙になるくらいなら、満足する方がいい。'},
  SECURE:{hook:'現地でお金や段取りを心配せず過ごせるか',voice:'行ってからずっと予算気にするのは嫌だな。'},
  OPTIMIZE:{hook:'移動・宿・時間のムダが少なく、やりたいことに集中できるか',voice:'安くても移動で半日消えるなら、それって得？'},
};

function phoneScene(axes:JobAxes,style:StyleId):EverydayScene{
  const s=PHONE_STYLE[style];
  const start=axes.time==='F'
    ?'機種変を考えると、今の不満だけじゃなく「これを2〜3年使うなら？」まで一度頭に入る。'
    :'今のスマホで困っていることや、「今これが欲しい」がはっきりすると機種変のスイッチが入りやすい。';
  const choose=axes.decision==='D'
    ?'容量・電池・カメラ・価格を並べて、どれなら理由を説明できるかを比べる。'
    :'スペックは見る。でも実機を触った時のサイズ感や「なんかこっち」の感覚が最後まで残る。';
  const money=axes.rhythm==='M'
    ?'だいたい今どこまで出せるかも分かっているので、その範囲で決めやすい。'
    :'機種変のタイミングで、端末代・残債・プランまでまとめて確認すると決めやすい。';
  return {label:'📱 スマホを買い替える時',title:s.hook,body:`${start}${choose}${money}`,voice:`「${s.voice}」`};
}

function applianceScene(axes:JobAxes,style:StyleId):EverydayScene{
  const s=APPLIANCE_STYLE[style];
  const start=axes.time==='F'
    ?'冷蔵庫や洗濯機みたいな家電だと、今日の値段だけじゃなく「何年使うか」「買い直しにならないか」まで気になりやすい。'
    :'壊れた・不便・今すぐ改善したい、みたいに目の前の必要性が見えると一気に検討が現実的になる。';
  const choose=axes.decision==='D'
    ?'サイズ・性能・保証・価格を比較して、「この差額ならこの機能に払う」と理由を作れる方が残りやすい。'
    :'数字は悪くなくても、店頭で見て「でかすぎる」「使いにくそう」があると候補から落ちやすい。';
  const money=axes.rhythm==='M'
    ?'今の余力感があるので、予算内かどうかを見ながら候補を絞りやすい。'
    :'買い替えという節目で一度家計を見て、「ここまでならOK」を作ると動きやすい。';
  return {label:'🏠 家電を買う時',title:s.hook,body:`${start}${choose}${money}`,voice:`「${s.voice}」`};
}

function clothesScene(axes:JobAxes,style:StyleId):EverydayScene{
  const s=CLOTHES_STYLE[style];
  const start=axes.time==='F'
    ?'服を見る時も、その場で欲しいだけじゃなく「来月も着る？」「この先どこで着る？」が少し頭に入りやすい。'
    :'試着して「今の自分にこれいい」が出ると、検討が一気に具体的になりやすい。';
  const choose=axes.decision==='D'
    ?'値段・素材・着回し・手持ちとの相性を見て、買う理由がちゃんと残る方を選びやすい。'
    :'条件を見ても、鏡を見た瞬間の「こっちの方が似合う」が最後の決め手になることがある。';
  const money=axes.rhythm==='M'
    ?'今月どのくらい使っているかの感覚があるので、「今買うか」をその場で判断しやすい。'
    :'セール・季節の変わり目・買い替えなどのタイミングで、まとめて見直す方が選びやすい。';
  return {label:'👕 洋服・靴を買う時',title:s.hook,body:`${start}${choose}${money}`,voice:`「${s.voice}」`};
}

function travelScene(axes:JobAxes,style:StyleId):EverydayScene{
  const s=TRAVEL_STYLE[style];
  const start=axes.time==='F'
    ?'旅行を決める時は、行きたい気持ちと一緒に、その前後の予定や支払いまで少し先を見やすい。'
    :'「今ここ行きたい」「この時期しかない」が強いと、そこを起点に予定を組み始めやすい。';
  const choose=axes.decision==='D'
    ?'ホテル・航空券・場所・レビューを並べて、価格差にちゃんと意味があるかを比べる。'
    :'比較はしても、写真や雰囲気を見て「ここに泊まりたい」が出ると、その候補が急に強くなる。';
  const money=axes.rhythm==='M'
    ?'今の余力が見えているぶん、「このくらいなら楽しめる」の線を作りやすい。'
    :'予約する節目で旅費全体を一度確認すると、その後は旅行そのものに集中しやすい。';
  return {label:'✈️ 旅行を決める時',title:s.hook,body:`${start}${choose}${money}`,voice:`「${s.voice}」`};
}

function everydayScenes(axes:JobAxes,style:StyleId):EverydayScene[]{
  return [phoneScene(axes,style),applianceScene(axes,style),clothesScene(axes,style),travelScene(axes,style)];
}

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

export default function ResultCompetitiveV6({jobCode,primaryStyle,secondaryStyle}:Props){
  const axes=JOB_AXES[jobCode];
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const secondaryCode=moneyTypeCode(jobCode,secondaryStyle);
  const otherJob=DECISION_FLIP[jobCode];
  const otherCode=moneyTypeCode(otherJob,primaryStyle);
  const scenes=everydayScenes(axes,primaryStyle);
  const why=whyType(axes);
  const misread=MISREAD[jobCode];

  return <div className="mpp-v6-deep">
    <section className="mpp-v6-section mpp-v6-life">
      <div className="mpp-v6-kicker">MONEY IN REAL LIFE</div>
      <h2>たとえば、こんな時にあなたが出る。</h2>
      <p className="mpp-v6-lead">抽象論じゃなく、誰でも想像しやすい4つの場面で見ると、このTYPEのクセがかなり分かりやすい。</p>
      <div className="mpp-v6-scenes">{scenes.map((scene,i)=><article key={scene.label}><small>0{i+1} / {scene.label}</small><b>{scene.title}</b><p>{scene.body}</p><blockquote className="mpp-v6-scene-voice">{scene.voice}</blockquote></article>)}</div>
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
      <p className="mpp-v6-social-hook">友だちのTYPEが分かったら、スマホ・服・旅行みたいな同じ場面で比べると違いがかなり見えやすい。</p>
    </section>

    <section className="mpp-v6-section mpp-v6-why">
      <div className="mpp-v6-kicker">WHY THIS TYPE?</div>
      <h2>なぜ、このJOBになったのか。</h2>
      <div className="mpp-v6-why-grid">{why.map(([label,body])=><article key={label}><small>{label}</small><p>{body}</p></article>)}</div>
      <p className="mpp-v6-trust">キャラ名だけで決めているわけではなく、この3つの判断パターンの組み合わせがJOBの土台です。</p>
    </section>
  </div>;
}
