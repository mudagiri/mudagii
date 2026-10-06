import type {JobCode,StyleId} from './classifierV1';
import {
  DAILY_SCENE_LIBRARY_SIZE,
  JOB_AXES,
  dailyScenesForType as baseDailyScenesForType,
  type DailyScene,
  type JobAxes,
} from './resultDailySceneLibraryV2';

export {DAILY_SCENE_LIBRARY_SIZE,JOB_AXES};
export type {DailyScene,JobAxes};

type Moment={setup:string;commonness:number};

/**
 * V3 is a narrative layer over the measured V2 scene engine.
 * It does not infer that the user has actually done any of these things.
 * It turns a generic decision pattern into a familiar hypothetical moment so
 * the user can recognize the pattern without adding unmeasured traits.
 */
const MOMENTS:Record<string,Moment>={
  'スマホを買い替える時':{setup:'比較ページを何個か開いたあと、店頭や写真で「実際これを毎日使う自分」を想像する場面。',commonness:3.0},
  'PC・タブレットを買う時':{setup:'スペック表を行ったり来たりして、「上位モデルまで本当に要る？」と一度止まる場面。',commonness:2.4},
  'イヤホンを買う時':{setup:'レビューを見たあと、装着感や音を試して「数字よりこっち好きかも」が出る場面。',commonness:2.3},
  'テレビ・モニターを選ぶ時':{setup:'サイズと価格を見比べたあと、実物を見て「家に置いたらどう見える？」を想像する場面。',commonness:1.8},
  '冷蔵庫を買う時':{setup:'値札だけでなく扉を開けて、「これ毎日使うなら棚の位置こっちだな」と生活を想像する場面。',commonness:2.0},
  '洗濯機を買う時':{setup:'乾燥あり・なしの価格差を見て、「毎週この手間が減るなら？」と計算し始める場面。',commonness:2.2},
  '掃除機を買う時':{setup:'吸引力の数字を見たあと、実際に持って「重っ／これなら出すの面倒じゃなさそう」を感じる場面。',commonness:1.9},
  'ドライヤーを買う時':{setup:'売り場で値段差を見て、「毎日数分のことにここまで払う？」と一瞬考える場面。',commonness:1.8},
  'ソファ・家具を買う時':{setup:'ネットでは良く見えたのに、座った瞬間や部屋のサイズを思い出して候補が変わる場面。',commonness:1.7},
  'ベッド・寝具を選ぶ時':{setup:'値段を見ながら横になって、「これを毎晩使うなら安さだけで決めるの違うかも」となる場面。',commonness:1.9},
  '洋服を買う時':{setup:'試着室で鏡を見て、値札をもう一回見て、「買う理由」と「欲しい気持ち」がぶつかる場面。',commonness:3.0},
  '靴を買う時':{setup:'履いて数歩歩いた瞬間に、ネットで見ていた候補の順位が変わる場面。',commonness:2.6},
  'バッグ・財布を買う時':{setup:'見た目は好き。でも中を開けて「これ普段の荷物ちゃんと入る？」と現実に戻る場面。',commonness:2.2},
  'コスメ・スキンケアを買う時':{setup:'口コミを何件か読んだあと、香りや質感を試して「自分にはこっちかも」となる場面。',commonness:2.1},
  'ネット通販のカートで迷う時':{setup:'カートには入っている。でも購入ボタンの前で、レビュー・送料・別商品をもう一回開く場面。',commonness:3.0},
  'コンビニで予定外に追加する時':{setup:'会計に向かう直前、レジ横や新商品を見て「これもいく？」が一瞬入る場面。',commonness:2.8},
  'スーパーでまとめ買いする時':{setup:'「まとめ買いの方がお得」を見て、冷蔵庫や使い切る未来を頭の中で確認する場面。',commonness:2.6},
  'ランチを選ぶ時':{setup:'店やメニューを見ながら、値段・待ち時間・今食べたいものを数分で決める場面。',commonness:2.9},
  'デリバリーを頼むか迷う時':{setup:'商品は決めたのに、送料込みの合計金額を見た瞬間だけ手が止まる場面。',commonness:2.9},
  '少し高い店にするか迷う時':{setup:'候補を見比べて、「今日は普通でいい？それともせっかくだしこっち？」となる場面。',commonness:2.6},
  '飲み会の2軒目に行くか迷う時':{setup:'1軒目を出たところで、明日の予定・もう一杯・帰宅時間が同時に頭に出る場面。',commonness:2.5},
  '旅行のホテルを選ぶ時':{setup:'検索結果を何軒も見たのに、写真を見た瞬間「ここ泊まりたい」が急に強くなる場面。',commonness:3.0},
  '飛行機・新幹線を選ぶ時':{setup:'安い便を見つけたあと、出発時間や乗り換えを見て「この差額なら楽な方？」と迷う場面。',commonness:2.5},
  '旅行先で追加体験を入れる時':{setup:'現地で「今日だけ空いてます」を見て、予定と金額を一瞬で組み直す場面。',commonness:2.1},
  'ライブ・イベントのチケットを取る時':{setup:'販売画面を開いたまま、日程・席・値段を見て「今取らないと終わる」が迫る場面。',commonness:2.3},
  '動画・音楽サブスクを残すか迷う時':{setup:'更新前に「最近これ何回使ったっけ」と履歴や他サービスを思い出す場面。',commonness:2.9},
  'アプリを有料版にする時':{setup:'無料版の制限にまた引っかかって、「毎回これ面倒なら課金した方が早い？」となる場面。',commonness:2.8},
  'ジム・習い事を続けるか迷う時':{setup:'月末や更新前に、今月何回行ったかを思い出して月額と見比べる場面。',commonness:2.7},
  '携帯プランを見直す時':{setup:'請求額を見て、「このデータ量・特典、今の自分ほんとに使ってる？」と見直す場面。',commonness:2.8},
  '保険の更新で迷う時':{setup:'更新案内を見て、保障内容を読みながら「これ残す安心に、毎月いくら払う？」と考える場面。',commonness:1.8},
  'クラウド容量を増やす時':{setup:'「容量がいっぱいです」が出て、写真を消すか月額を払うかで一度止まる場面。',commonness:2.5},
  '美容院・サロンを選ぶ時':{setup:'予約画面で価格と口コミを見たあと、「この仕上がりならこっち行きたい」が勝つ場面。',commonness:2.4},
  '資格・講座に申し込む時':{setup:'申込期限を見ながら、内容より先に「これ本当に最後までやる自分いる？」を想像する場面。',commonness:1.9},
  '仕事道具・有料ツールを導入する時':{setup:'無料版や今のやり方で粘ったあと、「これ毎回やる時間の方が高くない？」となる場面。',commonness:2.0},
  '誕生日プレゼントを選ぶ時':{setup:'候補を何個か見ながら、値段より「これ渡した時あの人どんな顔する？」を想像する場面。',commonness:2.5},
  '結婚・出産祝いを決める時':{setup:'相場を調べたあと、「相場通り」と「自分として納得できる」の間で金額を決める場面。',commonness:1.9},
  '友達から急に誘われた時':{setup:'メッセージを見た瞬間、「行きたい」と「明日どうする」がほぼ同時に出る場面。',commonness:2.7},
  'デート・会食の店を決める時':{setup:'店の候補を送り合いながら、値段・場所・雰囲気を見て「今回はどれが正解？」となる場面。',commonness:2.2},
  '家族・パートナーと大きな買い物を決める時':{setup:'自分だけなら決められるのに、相手の希望が入った瞬間に優先順位を並べ直す場面。',commonness:1.8},
  '電車かタクシーか迷う時':{setup:'地図アプリで到着時間を見て、料金差と「この20分」を天秤にかける場面。',commonness:2.9},
  '指定席・グリーン車にするか迷う時':{setup:'あと数千円で座れる画面を見て、「到着後の疲れまで含めたらどう？」となる場面。',commonness:2.1},
  'レンタカー・カーシェアを使う時':{setup:'電車ルートと車の料金を見比べて、「自由に動ける時間」にいくら払うか考える場面。',commonness:1.9},
  '壊れた物を修理か買い替えか迷う時':{setup:'修理見積もりを見た直後に、新品の価格も検索してしまう場面。',commonness:2.6},
  '引っ越し先を決める時':{setup:'内見では気に入った。でも帰ってから家賃・駅距離・初期費用をもう一度見直す場面。',commonness:2.1},
  'Wi-Fi・電気プランを見直す時':{setup:'値上げや引っ越しをきっかけに、今の請求と別プランを横に並べる場面。',commonness:2.2},
  'クレカの年会費を払うか迷う時':{setup:'年会費の請求を見て、「この1年で特典ほんとに使った？」を思い返す場面。',commonness:2.1},
  'ボーナス・臨時収入が入った時':{setup:'残高が増えたのを見た瞬間、「使う・残す・何かに回す」が一気に候補になる場面。',commonness:2.4},
  '返金・ポイントが戻ってきた時':{setup:'戻ってきたお金やポイントを見て、「元々なかったお金だし使う？」となる場面。',commonness:2.6},
  '月末にお金が余った時':{setup:'月末の残高を見て、「このまま残す？来月に回す？何か買う？」が浮かぶ場面。',commonness:2.2},
  '急な修理代が必要になった時':{setup:'予定していない見積もりを見て、まず「今どう止血するか」と「後で困らないか」を同時に考える場面。',commonness:2.0},
  '急な旅行・イベントに誘われた時':{setup:'誘いを見た瞬間は行きたい。でも金額と日程を見て一回だけ現実に戻る場面。',commonness:2.4},
  '無料体験が終わる時':{setup:'「明日から有料」の通知を見て、便利だった記憶と月額をその場で比べる場面。',commonness:2.9},
  '値上げ通知が来た時':{setup:'メールの新料金を見て、「この値段でもまだ残す？」と初めて契約を意識する場面。',commonness:2.8},
  '口コミを見続けて決めきれない時':{setup:'高評価は十分見たのに、なぜか低評価レビューだけもう一周している場面。',commonness:2.8},
  '新品か中古・型落ちか迷う時':{setup:'最新モデルの価格と型落ちの価格差を見て、「この差に何を買ってる？」と考える場面。',commonness:2.5},
  '一括か分割か迷う時':{setup:'同じ商品なのに、一括総額と月々の金額を見た瞬間、判断の見え方が変わる場面。',commonness:2.4},
  '延長保証を付けるか迷う時':{setup:'会計直前に「保証どうしますか？」と聞かれて、故障した未来を急に想像する場面。',commonness:2.3},
  'ポイントを今使うか貯めるか迷う時':{setup:'会計画面の「ポイント利用」を見て、今の値引きと後で使う楽しみを一瞬比べる場面。',commonness:2.6},
};

const STYLE_QUESTION:Record<StyleId,string>={
  DRIVE:'これで今よりラクになる、できることが増える？',
  ENJOY:'払ったあと「これでよかった」って思える？',
  SECURE:'決めたあとに困る要素、まだ残ってない？',
  OPTIMIZE:'使わないもの・要らないものにまで払ってない？',
};

function plainLabel(label:string){return label.replace(/^\S+\s+/,'')}

function axisVoice(axes:JobAxes,style:StyleId){
  const q=STYLE_QUESTION[style];
  if(axes.decision==='D'&&axes.time==='F')return `「一回ちゃんと比べよ。この先も考えて、${q}」`;
  if(axes.decision==='D'&&axes.time==='I')return `「今必要なのは分かってる。じゃあ条件見て、${q}」`;
  if(axes.decision==='N'&&axes.time==='F')return `「先のことも一応見る。でも最後は、${q}」`;
  return `「今の自分ならこっちかも。で、${q}」`;
}

function enrich(scene:DailyScene,axes:JobAxes,style:StyleId):DailyScene{
  const key=plainLabel(scene.label);
  const moment=MOMENTS[key];
  const setup=moment?.setup??`${key}。選ぶ直前に「何を基準にするか」がはっきり出やすい場面。`;
  const decision=axes.decision==='D'
    ?'ここで候補を並べると、値段だけではなく「なぜこっちを選ぶか」を言葉にできる方が残りやすい。'
    :'ここで条件を見ても、最後の最後に残る「なんかこっち」「なんか違う」を無視しにくい。';
  const rhythm=axes.rhythm==='M'
    ?'さらに、普段つかんでいる余力感と照らして「今いける」が出ると決断が軽くなりやすい。'
    :'そして、更新・予約・故障など“今見る理由がある節目”で一度金額を確認すると、そこから決めやすくなる。';
  const styleLine=`最後のGOは「${STYLE_QUESTION[style]}」に自分なりの答えが出るかどうか。`;
  return {
    ...scene,
    title:setup.replace(/。$/,''),
    body:`${decision}${rhythm}${styleLine}`,
    voice:axisVoice(axes,style),
  };
}

function salience(scene:DailyScene,index:number){
  const key=plainLabel(scene.label);
  return (MOMENTS[key]?.commonness??1)+(24-index)*0.45;
}

/**
 * Pull a wider type-relevant candidate set from V2, then prefer familiar scenes
 * without allowing generic familiarity to override the measured type ranking.
 * Category diversity keeps the six examples from becoming six versions of shopping.
 */
export function dailyScenesForType(jobCode:JobCode,style:StyleId,count=6):DailyScene[]{
  const axes=JOB_AXES[jobCode];
  const candidates=baseDailyScenesForType(jobCode,style,24)
    .map((scene,index)=>({scene,index,score:salience(scene,index)}))
    .sort((a,b)=>b.score-a.score);
  const picked:DailyScene[]=[];
  const categories=new Set<string>();
  for(const item of candidates){
    if(picked.length>=count)break;
    if(categories.has(item.scene.category))continue;
    picked.push(item.scene);
    categories.add(item.scene.category);
  }
  for(const item of candidates){
    if(picked.length>=count)break;
    if(!picked.includes(item.scene))picked.push(item.scene);
  }
  return picked.map(scene=>enrich(scene,axes,style));
}
