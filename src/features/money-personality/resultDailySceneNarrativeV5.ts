import type {JobCode,StyleId} from './classifierV1';
import {moneyTypeCode} from './money-type-code-v1';
import {
  DAILY_SCENE_LIBRARY_SIZE,
  JOB_AXES,
  dailyScenesForType as v4DailyScenesForType,
  type DailyScene,
  type JobAxes,
} from './resultDailySceneNarrativeV4';

export {DAILY_SCENE_LIBRARY_SIZE,JOB_AXES};
export type {JobAxes};

export type DeepDailyScene=DailyScene&{insight:string};
export type TypeCorePattern={headline:string;why:string;heroLabels:[string,string]};

type StyleCode='D'|'E'|'S'|'O';
type TypeKey=`${JobCode}-${StyleCode}`;

const STYLE_CODE:Record<StyleId,StyleCode>={DRIVE:'D',ENJOY:'E',SECURE:'S',OPTIMIZE:'O'};

const CORE:Record<TypeKey,TypeCorePattern>={
  'FDM-D':{headline:'先を見て、理由が通って、前に進めるならGO。',why:'比較してこの先まで使えると納得できると、決断が軽くなりやすい。慎重さは止まるためではなく、前に進む準備として出やすい。',heroLabels:['仕事道具・有料ツールを導入する時','スマホを買い替える時']},
  'FDM-E':{headline:'今の楽しさだけじゃなく、「あとでも満足できるか」まで見る。',why:'気分だけで決めるというより、先まで使う・楽しむイメージが持てると満足側へGOが出やすい。長く効く楽しさにお金を置きやすい。',heroLabels:['旅行のホテルを選ぶ時','ベッド・寝具を選ぶ時']},
  'FDM-S':{headline:'先の不安を一度つぶしてから、安心して決めたい。',why:'比較と普段の余力感を使って、「この先も困らない」が見えると判断が早くなりやすい。安心を作ること自体が決断材料になる。',heroLabels:['保険の更新で迷う時','冷蔵庫を買う時']},
  'FDM-O':{headline:'先まで使えるかを見て、「余計がない」に着地させる。',why:'安さだけではなく、必要な役割が長く満たせるかを比較しやすい。結果として、機能や固定費の“持ちすぎ”を避ける方向へ寄りやすい。',heroLabels:['携帯プランを見直す時','新品か中古・型落ちか迷う時']},

  'FDP-D':{headline:'節目で一気に作戦を組み、次に進める選択を取る。',why:'常に考え続けるより、申込・更新・予約などの節目で比較をまとめると強い。先の使い道と前進効果が見えるとGOが出やすい。',heroLabels:['資格・講座に申し込む時','旅行先で追加体験を入れる時']},
  'FDP-E':{headline:'普段は流れに乗り、節目で「この先も楽しめる？」を決め直す。',why:'予定や締切が来た時に一度立ち止まり、先まで満足が続くかを見やすい。今だけの勢いより“後からも良かったと思えるか”が効きやすい。',heroLabels:['ライブ・イベントのチケットを取る時','急な旅行・イベントに誘われた時']},
  'FDP-S':{headline:'節目で安全確認して、「これなら大丈夫」を作ってから進む。',why:'更新・故障・大きな予定など、見る理由がある時にまとめて確認しやすい。先の不安が整理できると、その後は迷いを引きずりにくい。',heroLabels:['無料体験が終わる時','壊れた物を修理か買い替えか迷う時']},
  'FDP-O':{headline:'見直す時はまとめて。「この先も払う意味ある？」で切る。',why:'節目が来た時に、料金・役割・代替案を一気に整理しやすい。将来も使う意味が薄いものは、そこで優先度が下がりやすい。',heroLabels:['値上げ通知が来た時','動画・音楽サブスクを残すか迷う時']},

  'FNM-D':{headline:'先は見る。でも最後の一票は「これなら進めそう」。',why:'未来の見通しを持ちながらも、数字だけで決め切らず、自分の感覚が前向きになる方を残しやすい。納得と勢いが重なると速い。',heroLabels:['スマホを買い替える時','引っ越し先を決める時']},
  'FNM-E':{headline:'先まで想像して、最後は「こっちの方が楽しそう」で決める。',why:'予定や予算を無視するわけではない。その上で、先の自分まで含めて気分が上がる方に価値を感じやすい。',heroLabels:['旅行のホテルを選ぶ時','洋服を買う時']},
  'FNM-S':{headline:'先の心配も見る。でも最後は「こっちなら安心できる」が決め手。',why:'条件確認だけでなく、使っている自分を想像した時の違和感まで残しやすい。数字上は十分でも、不安が残る方は選びにくい。',heroLabels:['ベッド・寝具を選ぶ時','保険の更新で迷う時']},
  'FNM-O':{headline:'先まで使う姿を想像して、「自分にはこれで十分」を選ぶ。',why:'比較はするが、最終的には自分の生活に馴染むかを重く見やすい。高機能かどうかより、長く無理なく使える“ちょうどよさ”が効く。',heroLabels:['バッグ・財布を買う時','新品か中古・型落ちか迷う時']},

  'FNP-D':{headline:'予定が動いても、節目で「次に進める方」を選び直せる。',why:'変化が起きた時に一度確認し、先の予定と今の機会をつなげて考えやすい。完璧な計画より、その時点で前に進めるルートを取りやすい。',heroLabels:['急な旅行・イベントに誘われた時','旅行先で追加体験を入れる時']},
  'FNP-E':{headline:'節目で予定を見直して、「せっかくなら楽しめる方」へ寄せる。',why:'今の楽しさだけでなく、その後の予定も一度見る。問題がなければ、体験価値の高い方へ気持ちが一気に傾きやすい。',heroLabels:['友達から急に誘われた時','ライブ・イベントのチケットを取る時']},
  'FNP-S':{headline:'予定変更には乗れる。でも「この先困らない」が見えてから。',why:'節目で金額や段取りを確認して、先の不安が小さくなると動きやすい。柔軟さと安心確認がセットになりやすい。',heroLabels:['旅行のホテルを選ぶ時','壊れた物を修理か買い替えか迷う時']},
  'FNP-O':{headline:'状況が変わったら、節目で「今の最適」に組み替える。',why:'一度決めた方法に固執するより、今後も含めてムダが少ない方へ更新しやすい。見直すタイミングが来ると判断がまとまりやすい。',heroLabels:['ネット通販のカートで迷う時','無料体験が終わる時']},

  'IDM-D':{headline:'今必要なら、条件を並べて一気に「使える方」へ。',why:'目の前の課題がはっきりすると比較の目的も明確になる。普段の余力感を土台に、今すぐ役立つ理由が通る選択へ進みやすい。',heroLabels:['仕事道具・有料ツールを導入する時','PC・タブレットを買う時']},
  'IDM-E':{headline:'今ちゃんと満足できるかを、比較して納得して選ぶ。',why:'その場の気分だけでなく、価格や条件も一度整理しやすい。その上で“今これを選ぶと満足できる”が残る方へ決めやすい。',heroLabels:['少し高い店にするか迷う時','美容院・サロンを選ぶ時']},
  'IDM-S':{headline:'今必要。でも「払った後も大丈夫」が見えてからGO。',why:'現在の必要性と普段の余力感を一緒に見やすい。今すぐ解決したくても、後から困る条件が残ると一度止まりやすい。',heroLabels:['スマホを買い替える時','一括か分割か迷う時']},
  'IDM-O':{headline:'今の用途に必要なものだけ、理由をつけて選ぶ。',why:'目の前の必要性が起点になり、比較では“今使う役割”を重く見やすい。余計な機能や重複が見えると優先度が落ちやすい。',heroLabels:['ネット通販のカートで迷う時','携帯プランを見直す時']},

  'IDP-D':{headline:'今必要になった瞬間、節目で条件を整理して動く。',why:'必要性が立ったタイミングで比較すると強い。常に考えるより、“今決める理由”ができた時に短時間で現実的な選択へ寄せやすい。',heroLabels:['電車かタクシーか迷う時','デリバリーを頼むか迷う時']},
  'IDP-E':{headline:'誘い・予定・区切りで、「今楽しむ価値ある？」を決める。',why:'日常では流していても、誘いや予約などの節目で気持ちと金額をまとめて見やすい。今の満足が大きいとGOが出やすい。',heroLabels:['友達から急に誘われた時','飲み会の2軒目に行くか迷う時']},
  'IDP-S':{headline:'今の困りごとは直したい。節目で安心ラインを作ってから動く。',why:'故障や更新など“今見る理由”ができると、必要性と安全性を一緒に確認しやすい。大丈夫な線が見えると決断が軽くなる。',heroLabels:['急な修理代が必要になった時','無料体験が終わる時']},
  'IDP-O':{headline:'必要になった時だけ開いて、「今いらない」を切る。',why:'常時最適化するより、買う・更新する・比較する節目で集中しやすい。今の用途から外れるものは、その場で候補から落としやすい。',heroLabels:['口コミを見続けて決めきれない時','新品か中古・型落ちか迷う時']},

  'INM-D':{headline:'比較はする。でも最後の一票は「今の自分が前に進めるか」。',why:'候補を絞るために条件は見る。その後、今の自分に効く感覚が立つと迷いが急に消えやすい。速さは“何も見ていない”からではない。',heroLabels:['スマホを買い替える時','洋服を買う時']},
  'INM-E':{headline:'条件は見る。でも最後は「今これが一番気分いい」が勝つ。',why:'比較で候補を減らしたあと、今の自分が一番満足できる方を残しやすい。数字上の1位と、自分の1位がズレることがある。',heroLabels:['洋服を買う時','旅行のホテルを選ぶ時']},
  'INM-S':{headline:'今の必要性から入り、最後は「こっちなら安心」で決める。',why:'普段の余力感を土台にしながら、条件としっくり感の両方を見る。安くても不安が残る選択にはGOが出にくい。',heroLabels:['靴を買う時','ベッド・寝具を選ぶ時']},
  'INM-O':{headline:'今使う姿が見えたら、「自分にはこれで十分」に着地する。',why:'比較はするが、最終的には今の自分に馴染むかを重く見やすい。スペック上位より“使う未来が自然に浮かぶ方”が残りやすい。',heroLabels:['ネット通販のカートで迷う時','口コミを見続けて決めきれない時']},

  'INP-D':{headline:'その瞬間の必要性に反応し、節目で「動ける方」を選ぶ。',why:'急な予定や必要性が出た時に判断スイッチが入りやすい。条件を見つつ、今の自分が前へ進める方へ短時間で寄せやすい。',heroLabels:['電車かタクシーか迷う時','急な旅行・イベントに誘われた時']},
  'INP-E':{headline:'「今行きたい・今楽しみたい」が立つと、節目で一気に決まる。',why:'常に考えているわけではなく、誘い・予約・その場の区切りで判断が立ち上がりやすい。満足のイメージが強いとGOも速い。',heroLabels:['飲み会の2軒目に行くか迷う時','友達から急に誘われた時']},
  'INP-S':{headline:'今必要なら動く。でも節目で「大丈夫」を確認してから。',why:'目の前の必要性や違和感に反応しつつ、更新・故障などの節目で安心ラインを作りやすい。確認できるとその後は引きずりにくい。',heroLabels:['無料体験が終わる時','壊れた物を修理か買い替えか迷う時']},
  'INP-O':{headline:'今の自分に要るかだけを、節目でサッと見直す。',why:'常時細かく管理するより、買う・更新するタイミングで今の用途に合うかを見やすい。しっくり来ない余計は、その場で外しやすい。',heroLabels:['ネット通販のカートで迷う時','値上げ通知が来た時']},
};

function key(job:JobCode,style:StyleId):TypeKey{return `${job}-${STYLE_CODE[style]}` as TypeKey}
function plainLabel(label:string){return label.replace(/^\S+\s+/,'')}

export function corePatternForType(jobCode:JobCode,style:StyleId):TypeCorePattern{
  return CORE[key(jobCode,style)];
}

function sceneInsight(axes:JobAxes,style:StyleId){
  const decision=axes.decision==='D'
    ?'ここで見ているのは「一番安いか」より、なぜそれを選ぶか自分で納得できるか。'
    :'ここで見ているのは「評価1位か」だけじゃなく、最後に違和感が残らないか。';
  const time=axes.time==='F'
    ?'さらに、この先も使える・予定と両立できる見通しが乗ると判断がまとまりやすい。'
    :'まず今の必要性がはっきりすると、判断そのものが一気に現実的になりやすい。';
  const styleLine:Record<StyleId,string>={
    DRIVE:'だから最後は、「これで今より動ける」がGOサインになりやすい。',
    ENJOY:'だから最後は、「払ったあと満足できる」がGOサインになりやすい。',
    SECURE:'だから最後は、「決めたあと困らない」がGOサインになりやすい。',
    OPTIMIZE:'だから最後は、「今の用途に余計がない」がGOサインになりやすい。',
  };
  return `${decision}${time}${styleLine[style]}`;
}

function prioritize(scenes:DailyScene[],pattern:TypeCorePattern,count:number){
  const hero=new Set(pattern.heroLabels);
  const ranked=scenes.map((scene,index)=>({scene,index,boost:hero.has(plainLabel(scene.label))?100:0})).sort((a,b)=>(b.boost-a.boost)||(a.index-b.index));
  const picked:DailyScene[]=[];
  const categories=new Set<string>();
  for(const item of ranked){
    if(picked.length>=count)break;
    if(categories.has(item.scene.category))continue;
    picked.push(item.scene);
    categories.add(item.scene.category);
  }
  for(const item of ranked){
    if(picked.length>=count)break;
    if(!picked.includes(item.scene))picked.push(item.scene);
  }
  return picked;
}

/**
 * V5: 32 public TYPEs get a distinct decision-core narrative.
 * Scene selection still comes from measured TIME / DECISION / AWARENESS + STYLE only.
 * The extra insight explains the decision logic; it does not claim an unmeasured purchase history.
 */
export function dailyScenesForType(jobCode:JobCode,style:StyleId,count=6):DeepDailyScene[]{
  const axes=JOB_AXES[jobCode];
  const pattern=corePatternForType(jobCode,style);
  const candidates=v4DailyScenesForType(jobCode,style,24);
  return prioritize(candidates,pattern,count).map(scene=>({
    ...scene,
    insight:sceneInsight(axes,style),
  }));
}

export const PUBLIC_TYPE_PATTERN_COUNT=Object.keys(CORE).length;
