import type {JobCode,StyleId} from './classifierV1';
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
  'FDM-D':{headline:'先を見て、理由が通り、今後の行動がラクになるなら決める。',why:'価格や条件を比較したあと、数か月先まで使う場面を想像する。先でも役立ち、自分の行動を前へ進めると納得できると決断が速くなりやすい。',heroLabels:['仕事道具・有料ツールを導入する時','スマホを買い替える時']},
  'FDM-E':{headline:'今の楽しさより、使い続けても満足が続くかを見る。',why:'その場の気分だけでは決めず、何度も使った後の満足まで想像しやすい。長く楽しめるイメージが持てる支出にはGOを出しやすい。',heroLabels:['旅行のホテルを選ぶ時','ベッド・寝具を選ぶ時']},
  'FDM-S':{headline:'先の不安を確認して、支払った後まで安心できる形を選ぶ。',why:'価格や条件だけでなく、支払い後の余力や数か月先の予定も一緒に見やすい。先の生活に無理が出ないと分かると迷いが減りやすい。',heroLabels:['保険の更新で迷う時','冷蔵庫を買う時']},
  'FDM-O':{headline:'長く使う場面まで考えて、必要な機能だけにお金を払う。',why:'安さだけでなく、数年使う間に必要な役割が残るかを比較しやすい。使わない機能や重複した固定費が見えると優先度を下げやすい。',heroLabels:['携帯プランを見直す時','新品か中古・型落ちか迷う時']},

  'FDP-D':{headline:'申込・更新・予約のタイミングで、一気に作戦を決めて進む。',why:'常に考え続けるより、締切や更新など決める理由ができた時に比較をまとめやすい。先の使い道と前進効果が見えると行動が速くなりやすい。',heroLabels:['資格・講座に申し込む時','旅行先で追加体験を入れる時']},
  'FDP-E':{headline:'予定の節目で、この先も楽しめる支出かを決め直す。',why:'予約や締切が来た時に一度立ち止まり、その体験の満足が当日だけで終わらないかを見やすい。後から振り返って満足できるイメージが効きやすい。',heroLabels:['ライブ・イベントのチケットを取る時','急な旅行・イベントに誘われた時']},
  'FDP-S':{headline:'更新や故障の節目で、安全ラインを確認してから動く。',why:'普段ずっと管理するより、更新・故障・大きな予定など確認する理由がある時に金額と先の影響をまとめて見る。大丈夫な線が見えると決めやすい。',heroLabels:['無料体験が終わる時','壊れた物を修理か買い替えか迷う時']},
  'FDP-O':{headline:'見直しの節目で、今後も払い続ける意味があるかを整理する。',why:'値上げや更新のタイミングで、料金・利用頻度・代替案を一気に並べやすい。今後の生活で役割が薄い契約は、その時点で優先度を下げやすい。',heroLabels:['値上げ通知が来た時','動画・音楽サブスクを残すか迷う時']},

  'FNM-D':{headline:'先の予定を確認したあと、使っている自分が前向きに浮かぶかで決める。',why:'未来の見通しを持ちながらも、数字だけでは決め切らない。使った後の自分が動きやすくなる感覚まで持てると、比較を終えて行動へ移りやすい。',heroLabels:['スマホを買い替える時','引っ越し先を決める時']},
  'FNM-E':{headline:'先まで想像して、使った後も楽しみが続く候補を残す。',why:'予定や予算を確認したうえで、実際に使う・泊まる・着る場面を想像しやすい。先の自分まで気分が上がるイメージがあると価値を感じやすい。',heroLabels:['旅行のホテルを選ぶ時','洋服を買う時']},
  'FNM-S':{headline:'先の心配も確認し、使い始めた後まで不安が少ない候補を選ぶ。',why:'条件だけでなく、実際に使っている自分を想像した時の違和感も判断材料に残しやすい。価格が安くても不安が続きそうなら決めにくい。',heroLabels:['ベッド・寝具を選ぶ時','保険の更新で迷う時']},
  'FNM-O':{headline:'先まで使う姿を想像して、自分の生活にちょうどいい仕様を選ぶ。',why:'比較はするが、最終的には自分の暮らしに無理なく馴染むかを重く見やすい。高機能かどうかより、長く使う姿が自然に浮かぶ仕様が残りやすい。',heroLabels:['バッグ・財布を買う時','新品か中古・型落ちか迷う時']},

  'FNP-D':{headline:'予定が変わった時は、次の行動につながる選択へ組み直す。',why:'変化が起きた時に金額と予定を一度確認し、今の機会を先の目的につなげて考えやすい。最初の計画より、その時点で前進できる方法を取りやすい。',heroLabels:['急な旅行・イベントに誘われた時','旅行先で追加体験を入れる時']},
  'FNP-E':{headline:'予定の節目で組み直し、体験の満足が大きい選択に寄せる。',why:'今の楽しさだけで突っ走らず、その後の予定や予算も一度見る。無理がないと分かると、記憶に残る体験へ気持ちが傾きやすい。',heroLabels:['友達から急に誘われた時','ライブ・イベントのチケットを取る時']},
  'FNP-S':{headline:'予定変更には対応する。ただし先の生活に無理が出ないかを確認する。',why:'予定が変わった時に、金額・段取り・翌日以降への影響をまとめて見やすい。先の不安が小さくなると、変更そのものには柔軟に乗りやすい。',heroLabels:['旅行のホテルを選ぶ時','壊れた物を修理か買い替えか迷う時']},
  'FNP-O':{headline:'状況が変わったら、今後の予定まで含めてムダが少ない形へ更新する。',why:'一度決めた方法を守ることより、今後の使い方に合うかを見直しやすい。更新や変更の節目が来ると、不要になった条件を外して整理しやすい。',heroLabels:['ネット通販のカートで迷う時','無料体験が終わる時']},

  'IDM-D':{headline:'今必要なら、条件を並べて今すぐ役立つ選択へ決める。',why:'目の前の課題がはっきりすると比較の目的も明確になる。普段つかんでいる余力感と照らし、今すぐ役立つ理由が通れば行動へ移りやすい。',heroLabels:['仕事道具・有料ツールを導入する時','PC・タブレットを買う時']},
  'IDM-E':{headline:'今の満足を大事にしながら、価格や条件も確認して決める。',why:'気分だけで決めるより、価格・量・使う回数などを一度整理しやすい。その上で今の自分が納得して楽しめる選択を残しやすい。',heroLabels:['少し高い店にするか迷う時','美容院・サロンを選ぶ時']},
  'IDM-S':{headline:'今必要でも、支払った後の生活に無理がないと分かってから決める。',why:'目の前の必要性と普段の余力感を一緒に見やすい。今すぐ解決したい場面でも、支払い後に困る条件が残っていると一度止まりやすい。',heroLabels:['スマホを買い替える時','一括か分割か迷う時']},
  'IDM-O':{headline:'今の用途に必要な役割だけを残し、余計な機能には払わない。',why:'目の前の必要性を起点に比較し、今使う役割を満たすかを重く見やすい。使わない機能・容量・重複サービスが見えると候補から外しやすい。',heroLabels:['ネット通販のカートで迷う時','携帯プランを見直す時']},

  'IDP-D':{headline:'必要になった節目で条件を整理し、今の問題を解決できる選択を取る。',why:'必要性が立ったタイミングで比較すると強い。普段から考え続けるより、今決める理由ができた時に短時間で現実的な答えへ寄せやすい。',heroLabels:['電車かタクシーか迷う時','デリバリーを頼むか迷う時']},
  'IDP-E':{headline:'誘い・予約・区切りの瞬間に、今楽しむ価値と金額を一緒に見る。',why:'日常では細かく考え続けなくても、誘いや予約など判断の節目で気持ちと金額をまとめて見やすい。今の満足が大きいと決断も速くなりやすい。',heroLabels:['友達から急に誘われた時','飲み会の2軒目に行くか迷う時']},
  'IDP-S':{headline:'故障や更新の節目で、今の困りごとを直せる安全ラインを作る。',why:'故障や更新など確認する理由ができると、必要性・金額・支払い後の余裕を一緒に見やすい。無理のない線が見えると判断が軽くなりやすい。',heroLabels:['急な修理代が必要になった時','無料体験が終わる時']},
  'IDP-O':{headline:'買う・更新する節目だけ集中して、今使わない条件を外す。',why:'常に細かく最適化するより、購入や更新のタイミングで今の用途を確認しやすい。使わない機能や重複が見えたら、その場で候補から外しやすい。',heroLabels:['口コミを見続けて決めきれない時','新品か中古・型落ちか迷う時']},

  'INM-D':{headline:'条件は見る。最後は今の自分の行動がラクになるかで決める。',why:'価格や条件で候補を絞ったあと、実際に使う自分を想像しやすい。今の課題が軽くなり、動きやすくなる感覚が持てると迷いが急に消えやすい。',heroLabels:['スマホを買い替える時','洋服を買う時']},
  'INM-E':{headline:'条件は見る。最後は今いちばん満足が大きい選択を取る。',why:'比較で候補を減らしたあと、実際に使う・着る・泊まる自分を想像する。数字上の1位より、自分の満足が大きく浮かぶ候補を残しやすい。',heroLabels:['洋服を買う時','旅行のホテルを選ぶ時']},
  'INM-S':{headline:'今の必要性から入り、決めた後まで不安が少ない選択を取る。',why:'普段つかんでいる余力感を土台に、条件と使った時の感覚を一緒に見る。安くても故障・使いにくさ・支払い後の不安が残る候補には決めにくい。',heroLabels:['靴を買う時','ベッド・寝具を選ぶ時']},
  'INM-O':{headline:'今使う姿が具体的に浮かぶ、必要十分な仕様へ着地する。',why:'比較はするが、最終的には今の生活で本当に使うかを重く見やすい。上位スペックより、日常で使う場面が自然に浮かぶ仕様を残しやすい。',heroLabels:['ネット通販のカートで迷う時','口コミを見続けて決めきれない時']},

  'INP-D':{headline:'急な必要性が出たら、今の行動につながる選択を短時間で決める。',why:'急な予定や困りごとが出た瞬間に判断スイッチが入りやすい。条件を一度見たうえで、今すぐ次の行動へ移れる選択に決めやすい。',heroLabels:['電車かタクシーか迷う時','急な旅行・イベントに誘われた時']},
  'INP-E':{headline:'行きたい・楽しみたい気持ちが立った節目で、金額も見て一気に決める。',why:'常に考え続けるより、誘い・予約・その場の区切りで判断が立ち上がりやすい。体験している自分が具体的に浮かぶと決断も速くなりやすい。',heroLabels:['飲み会の2軒目に行くか迷う時','友達から急に誘われた時']},
  'INP-S':{headline:'今必要なら動く。ただし更新や故障の節目で安全ラインを確認する。',why:'目の前の必要性や違和感に反応しつつ、更新・故障など確認する理由ができた時に金額と不安をまとめて見る。無理がないと分かると決めやすい。',heroLabels:['無料体験が終わる時','壊れた物を修理か買い替えか迷う時']},
  'INP-O':{headline:'買う・更新する瞬間に、今の自分が本当に使うものだけを残す。',why:'普段から細かく管理するより、購入や更新のタイミングで今の用途を確認しやすい。使う場面が浮かばない機能や契約は、その場で外しやすい。',heroLabels:['ネット通販のカートで迷う時','値上げ通知が来た時']},
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
    DRIVE:'だから最後は、「その支出で今より動ける」がGOサインになりやすい。',
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
