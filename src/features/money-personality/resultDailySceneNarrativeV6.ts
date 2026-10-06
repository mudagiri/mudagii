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
 * These lines stay inside JOB x Primary STYLE. They are not claims that the user
 * has bought a particular item; the surrounding scene is explicitly a familiar
 * hypothetical moment.
 */
const TYPE_PUNCH:Record<TypeKey,[string,string,string]>={
  'FDM-D':['先の予定も大丈夫。前に進むなら今決めていい。','長く使う姿が浮かぶ。なら出す理由はある。','前進につながるなら、ここは止める所じゃない。'],
  'FDM-E':['あとでも満足してそう。なら今楽しんでいい。','その場だけじゃなく、後から思い出しても良さそう。','先の予定を壊さないなら、楽しさは削らなくていい。'],
  'FDM-S':['払った後も余裕が残る。なら大丈夫。','先の予定まで見ても困らなそう。なら決められる。','安心できる線が見えたら、もう迷い続けなくていい。'],
  'FDM-O':['長く使っても役割が残るならアリ。','使わない機能まで払うなら外したい。','先まで見ても必要なら、安さだけで削らなくていい。'],

  'FDP-D':['今が決めるタイミング。必要な条件だけ見て進もう。','節目が来たなら、ここで次の一手まで決めたい。','普段は見なくても、動く時だけ一気に整理すればいい。'],
  'FDP-E':['せっかくの節目。あとで満足できる方にしたい。','今しかないなら、先の予定だけ確認して楽しみたい。','ここで決めるなら、後悔しにくい体験を残したい。'],
  'FDP-S':['今が確認するタイミング。次の節目まで大丈夫ならOK。','普段は見ない。でも更新前だけはちゃんと見たい。','一度安全ラインが見えれば、また気にせず過ごせる。'],
  'FDP-O':['更新の今こそ、本当に要るものだけ残したい。','今後も使う理由が薄いなら、ここで切っていい。','毎日は見ない。見直す日にまとめて軽くしたい。'],

  'FNM-D':['条件は足りてる。使う自分が前に進めそうなら決める。','数字は問題ない。最後に自分が納得できるかだけ見たい。','先でも使えて、気持ちも乗る。なら行ける。'],
  'FNM-E':['条件は大丈夫。使ってる自分が楽しそうなら決めたい。','安いだけより、あとでも好きでいられそうな方がいい。','先の予定も平気。あとは気持ちが上がるか。'],
  'FNM-S':['数字は大丈夫。でも違和感が残るなら一回止めたい。','先まで平気でも、自分が不安ならまだ決めたくない。','条件も感覚もOK。そこまで揃えば安心できる。'],
  'FNM-O':['高機能より、長く自然に使ってる姿が浮かぶ方がいい。','条件は悪くない。でも余分に感じるなら外したい。','先でも使う理由が残るか。最後はそこを見たい。'],

  'FNP-D':['予定が変わった。なら今いちばん進める形に組み直そう。','最初の予定より、今の目的に近い方を取りたい。','ルートは変えていい。ゴールに近づくなら問題ない。'],
  'FNP-E':['予定が変わったなら、今しかない楽しさも入れ直したい。','先に無理がないなら、体験の満足は取りにいきたい。','計画通りより、ちゃんと楽しみながら続けたい。'],
  'FNP-S':['変更しても先が苦しくならないなら乗っていい。','予定は変わっても、安全ラインだけは外したくない。','無理が出るなら方法を変える。続けられる方が大事。'],
  'FNP-O':['状況が変わったなら、今の目的に合わない条件は外そう。','前に決めた形でも、今ムダなら更新していい。','守るのはルールじゃなくて、目的の方。'],

  'IDM-D':['今必要。条件も通る。なら先送りする理由はない。','今いちばん効くなら、安さだけで弱い物を選びたくない。','使った瞬間にラクになるなら、今決めていい。'],
  'IDM-E':['今楽しめる。でも値段にも納得できる。その両方が欲しい。','気分だけじゃなく、払った後も満足できるならアリ。','今の自分がちゃんと喜ぶなら、使う理由になる。'],
  'IDM-S':['今必要でも、払った後に困らない線は見たい。','欲しいより先に、今払って平気かだけ確認したい。','今使えて、その後も苦しくない。なら決められる。'],
  'IDM-O':['今使う機能だけで十分。余分には払いたくない。','必要なのはこれだけ。上位だからで増やしたくない。','今の用途が満たせるなら、盛りすぎなくていい。'],

  'IDP-D':['今困ってる。必要な条件だけ見て、早く解決したい。','普段は考えない。でも必要になった今ならすぐ決められる。','今動く理由があるなら、比較は短く終わらせたい。'],
  'IDP-E':['今行きたい。金額も見た。なら楽しむ方に決めたい。','誘われた今が判断タイミング。満足できそうなら乗りたい。','ずっと考えたくない。今楽しめるかで決めたい。'],
  'IDP-S':['今困ってる。まず無理のない解決ラインを作りたい。','更新の今だけ、払った後まで大丈夫か見たい。','今必要で、その後も困らない。なら決められる。'],
  'IDP-O':['買う今だけ集中して、使わない条件を外したい。','必要になった時にだけ、今の用途で絞ればいい。','今使わないなら、便利そうでも足さなくていい。'],

  'INM-D':['条件は見た。今の自分がラクになるなら決めたい。','比較は終わり。使ってる自分が前に進めそうかだけ見たい。','今いちばん効く感覚があるなら、そこでGOを出せる。'],
  'INM-E':['条件は見た。最後は自分が一番うれしい方にしたい。','比較したのに、結局「使って気分が上がるか」が残る。','今の自分が満足する姿が浮かぶなら決めやすい。'],
  'INM-S':['条件は見た。でも使った時の不安が残るなら止めたい。','今必要でも、感覚的に落ち着かないならまだ待ちたい。','使う自分が自然に浮かんで、不安もない。なら決められる。'],
  'INM-O':['スペックより、今ほんとに使う姿が浮かぶか見たい。','条件は良くても、使わない機能が多いと急に冷める。','今の生活にぴったり収まるなら、それで十分。'],

  'INP-D':['今必要。条件も見た。次に動けるならすぐ決めたい。','急に必要になった時ほど、判断は意外と早い。','今の行動が止まってるなら、解決できる方へ進みたい。'],
  'INP-E':['今行きたい。金額も見た。楽しめそうなら乗りたい。','誘いが来た瞬間がいちばん判断しやすい。','今しかない楽しさが浮かぶなら、決断は早くなる。'],
  'INP-S':['今必要。でも決めた後に困らないかだけは見たい。','普段は見ない。故障や更新の今だけ安心を作りたい。','今の困りごとが消えて、その後も平気なら決められる。'],
  'INP-O':['今使うかだけ見たい。使わないなら外していい。','更新の瞬間だけ、今の用途に必要かを確認したい。','普段は放っておく。でも決める時は余分を残したくない。'],
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
