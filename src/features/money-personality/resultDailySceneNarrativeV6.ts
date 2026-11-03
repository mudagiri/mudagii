import type {JobCode,StyleId} from './classifierV1';
import {
  DAILY_SCENE_LIBRARY_SIZE,
  JOB_AXES,
  PUBLIC_TYPE_PATTERN_COUNT,
  corePatternForType as v5CorePatternForType,
  dailyScenesForType as v5DailyScenesForType,
  type DeepDailyScene,
  type JobAxes,
  type TypeCorePattern,
} from './resultDailySceneNarrativeV5';

export {DAILY_SCENE_LIBRARY_SIZE,JOB_AXES,PUBLIC_TYPE_PATTERN_COUNT};
export type {DeepDailyScene,JobAxes,TypeCorePattern};

type StyleCode='D'|'E'|'S'|'O';
type TypeKey=`${JobCode}-${StyleCode}`;
const STYLE_CODE:Record<StyleId,StyleCode>={DRIVE:'D',ENJOY:'E',SECURE:'S',OPTIMIZE:'O'};

/**
 * Recognition-first microcopy for the three scenes shown before any explanation.
 * Each triple has three different jobs:
 * 1) the moment the judgement starts, 2) the inner tension, 3) the final tie-breaker.
 * This keeps the first three cards from repeating the same diagnosis in new words.
 */
const TYPE_PUNCH:Record<TypeKey,[string,string,string]>={
  'FDM-D':['この先も使う。なら今出す意味はある。','安いだけじゃ足りない。前に進めるかで決めたい。','払った後の余白もある。なら止めなくていい。'],
  'FDM-E':['今だけ楽しい、はちょっと違う。あとでも満足したい。','先の予定は崩れない。なら楽しさを削る必要はない。','終わったあとも「よかった」が残るかで決めたい。'],
  'FDM-S':['払える。でも払った後まで平気かが先。','少し先まで見て不安が残るなら、まだ待ちたい。','安心できる線が見えたら、そこからは早い。'],
  'FDM-O':['今安くても、先で使わないなら要らない。','役割がかぶるなら、両方に払う意味は薄い。','長く使う理由が残るなら、必要な分は出せる。'],

  'FDP-D':['普段は見ない。でも決める日だけは一気に見る。','更新や予約が来たら、その場で次まで決めたい。','動く理由ができた瞬間、整理スイッチが入る。'],
  'FDP-E':['普段は考えすぎない。予定が決まる時だけ見る。','先に無理がないなら、楽しさはちゃんと取りたい。','終わったあと「行ってよかった」が残るかで決めたい。'],
  'FDP-S':['毎日は見ない。でも更新前だけはちゃんと確認したい。','次の節目まで平気だと分かれば落ち着く。','安心を一回作れたら、普段は気にせず過ごしたい。'],
  'FDP-O':['見直す日が来たら、要る・要らないをまとめて切る。','今後使わないなら、前から払っていても残さない。','毎日節約するより、節目で一気に軽くしたい。'],

  'FNM-D':['条件は揃ってる。でも使う自分が前に進む感じが欲しい。','数字が一番でも、しっくり来なければ決め切れない。','先の見通しと腹落ちが揃ったら、一気に動ける。'],
  'FNM-E':['条件は大丈夫。最後は「楽しみ」が浮かぶか。','安いだけで気持ちが動かないなら選びにくい。','先も崩さず、満足も取れるなら迷いが消える。'],
  'FNM-S':['数字は平気。でも違和感が残るなら止まりたい。','安くても、使った後の不安が浮かぶなら選びにくい。','条件も気持ちも「大丈夫」で揃うと決められる。'],
  'FNM-O':['高機能より、生活にちゃんと馴染むか。','条件は良くても、余分に感じると急に冷める。','先でも使う姿が自然に浮かぶなら残したい。'],

  'FNP-D':['予定が変わったら、今いちばん進める形に組み直す。','前に決めた方法より、今の目的に近いかが大事。','ルート変更は平気。ゴールからズレる方が嫌。'],
  'FNP-E':['予定が変わったなら、今しかない楽しさも入れ直す。','先が崩れないなら、体験は我慢しすぎたくない。','計画どおりより、あとで「やってよかった」を残したい。'],
  'FNP-S':['予定変更は平気。でも先が苦しくなるなら止める。','方法は変えても、安心できる線は外したくない。','続けにくくなったら、無理するより組み直したい。'],
  'FNP-O':['前に決めた方法でも、今ムダなら変える。','守りたいのはルールじゃなく、目的。','状況が変わったら、要らなくなった条件を外したい。'],

  'IDM-D':['今必要。ちゃんと効くなら先送りしない。','安いだけで役に立たない方が、むしろもったいない。','今の課題が軽くなる理由が通れば決められる。'],
  'IDM-E':['今ほしい。でも値段にも納得してから楽しみたい。','気分だけで決めるより、払った後も満足したい。','安さより、今の満足にちゃんと効くかを見たい。'],
  'IDM-S':['今必要。でも払った後の余裕は残したい。','欲しい気持ちより先に、今払って平気かを見る。','必要性と安心が揃えば、そこで決められる。'],
  'IDM-O':['今使う機能だけでいい。盛りすぎには払いたくない。','上位モデルより、今の用途に合うか。','必要十分が見えたら、そこで比較を終えたい。'],

  'IDP-D':['今困ってる。必要な条件だけ見て早く解決したい。','普段は考えない。でも必要になった瞬間は早い。','今動く理由があるなら、比較を長引かせたくない。'],
  'IDP-E':['今行きたい。金額も見た。満足できそうなら乗りたい。','普段は考え続けない。誘われた瞬間に判断する。','今楽しめる価値があるなら、その場で決めやすい。'],
  'IDP-S':['今困ってる。まず無理のない解決ラインを決めたい。','普段は見ない。でも故障や更新の時だけは確認する。','今必要で、払った後も平気ならそこで決められる。'],
  'IDP-O':['買う時だけ集中して、使わない条件を外したい。','普段から最適化はしない。必要な時に絞ればいい。','便利そうでも、今使わないなら足さない。'],

  'INM-D':['条件は見た。最後は今の自分がラクになるか。','比較一番より、使う自分が前に進む感じを取りたい。','今いちばん効く感覚が来たら、そこで決められる。'],
  'INM-E':['条件は見た。最後は一番気分が上がる選択。','比較したのに、結局「使ってうれしいか」が残る。','今の自分が満足する姿が浮かぶと迷いが消える。'],
  'INM-S':['条件は見た。でも使った時の不安が残るなら止める。','今必要でも、なんとなく落ち着かないならまだ決めない。','使う姿が自然に浮かんで、不安もない。そこまで揃えば決められる。'],
  'INM-O':['スペックより、今ほんとに使う姿が浮かぶか。','条件が良くても、使わない機能が多いと冷める。','今の生活にちょうど収まるなら、それで十分。'],

  'INP-D':['今必要。条件も見た。次に動けるなら決めたい。','普段は気にしないのに、必要になった瞬間だけ判断が速い。','今の行動が止まってるなら、解決できる選択を取りたい。'],
  'INP-E':['今行きたい。金額も見た。楽しめそうなら乗りたい。','普段は考えない。誘いが来た瞬間に気持ちが決まる。','今しかない楽しさが浮かぶと、決断が急に早くなる。'],
  'INP-S':['今必要。でも決めた後に困らないかだけは見たい。','普段は気にしない。故障や更新の時だけ安心を作る。','今の困りごとが消えて、その後も平気なら決められる。'],
  'INP-O':['今使うかだけ見たい。使わないなら外す。','普段は放っておく。更新の時だけ要不要を決める。','決める瞬間は、余分を残したくない。'],
};

const BRIDGE_MARKERS=[
  ' 条件と、この先使う場面まで確認する。',
  ' 今必要な理由は見えている。条件を確認して決める。',
  ' 先の予定も見る。ただ、最後は自分の生活に馴染むかを残す。',
  ' 条件は見る。ただ、最後に残るしっくり感も判断材料にする。',
];

function key(job:JobCode,style:StyleId):TypeKey{return `${job}-${STYLE_CODE[style]}` as TypeKey}

function firstSceneThought(voice:string){
  let text=voice.replace(/^「|」$/g,'');
  for(const marker of BRIDGE_MARKERS){
    const at=text.indexOf(marker);
    if(at>=0){text=text.slice(0,at);break;}
  }
  return soften(text.trim());
}

function soften(text:string){
  return text
    .replace(/数か月先/g,'少し先')
    .replace(/半年後/g,'しばらく先')
    .replace(/数年使う/g,'長く使う')
    .replace(/数年/g,'長く')
    .replace(/毎日数分使うものに/g,'毎日使うものに')
    .replace(/20分短縮できる。今の自分は、その20分に/g,'少し早く着ける。今の自分は、その時間に')
    .replace(/数千円の差で/g,'少しの差額で')
    .replace(/数千円で座れる/g,'追加料金で座れる');
}

export function corePatternForType(jobCode:JobCode,style:StyleId):TypeCorePattern{
  const base=v5CorePatternForType(jobCode,style);
  return {...base,headline:soften(base.headline),why:soften(base.why)};
}

export function primaryRecognitionPunchesForType(jobCode:JobCode,style:StyleId){
  return TYPE_PUNCH[key(jobCode,style)];
}

export function dailyScenesForType(jobCode:JobCode,style:StyleId,count=6):DeepDailyScene[]{
  const type=key(jobCode,style);
  return v5DailyScenesForType(jobCode,style,count).map((scene,index)=>{
    if(index>=3)return {...scene,title:soften(scene.title),voice:soften(scene.voice)};
    const thought=firstSceneThought(scene.voice);
    const punch=TYPE_PUNCH[type][index];
    return {
      ...scene,
      title:soften(scene.title),
      voice:`「${thought} ${punch}」`,
    };
  });
}

export const PRIMARY_RECOGNITION_HIT_COUNT=Object.values(TYPE_PUNCH).reduce((n,x)=>n+x.length,0);
