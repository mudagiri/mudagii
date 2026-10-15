import type {JobCode,StyleId} from './classifierV1';

export type JobAxes={time:'F'|'I';decision:'D'|'N';rhythm:'M'|'P'};
export type DailyScene={label:string;title:string;body:string;voice:string;category:string};

type SceneSeed={
  id:string;
  emoji:string;
  category:string;
  label:string;
  object:string;
  compare:string;
  feel:string;
  future:string;
  immediate:string;
  periodic:string;
  styles:StyleId[];
};

const STYLE_HOOK:Record<StyleId,string>={
  DRIVE:'これで今より前に進めるか',
  ENJOY:'使ったあとちゃんと満足できるか',
  SECURE:'あとで困る要素が残らないか',
  OPTIMIZE:'今の用途に対して余計がないか',
};

const STYLE_VOICE:Record<StyleId,(label:string)=>string>={
  DRIVE:label=>`「${label}なら、ちゃんと次に進める方を選びたい。」`,
  ENJOY:label=>`「${label}なら、払ったあと“これでよかった”って思える方がいい。」`,
  SECURE:label=>`「${label}なら、あとで不安になる要素は先に潰したい。」`,
  OPTIMIZE:label=>`「${label}なら、使わないものにまで払うのは違うな。」`,
};

export const JOB_AXES:Record<JobCode,JobAxes>={
  FDM:{time:'F',decision:'D',rhythm:'M'},
  FDP:{time:'F',decision:'D',rhythm:'P'},
  FNM:{time:'F',decision:'N',rhythm:'M'},
  FNP:{time:'F',decision:'N',rhythm:'P'},
  IDM:{time:'I',decision:'D',rhythm:'M'},
  IDP:{time:'I',decision:'D',rhythm:'P'},
  INM:{time:'I',decision:'N',rhythm:'M'},
  INP:{time:'I',decision:'N',rhythm:'P'},
};

/**
 * Common real-life money moments. These are situations, not inferred histories.
 * Copy is generated only from measured TIME / DECISION / AWARENESS + STYLE traits.
 */
const SCENES:SceneSeed[]=[
  {id:'smartphone',emoji:'📱',category:'device',label:'スマホを買い替える時',object:'新しいスマホ',compare:'容量・電池・カメラ・価格',feel:'実機を触った時のサイズ感や使いやすさ',future:'2〜3年使う前提や次の出費',immediate:'今困っている動作や欲しい機能',periodic:'機種変・故障・更新のタイミング',styles:['DRIVE','SECURE']},
  {id:'laptop',emoji:'💻',category:'device',label:'PC・タブレットを買う時',object:'PCやタブレット',compare:'性能・重さ・価格・用途',feel:'触った時の快適さや「これなら使えそう」感',future:'何年使うか、今後やりたいことまで足りるか',immediate:'今やりたい作業が快適になるか',periodic:'買い替え・故障・仕事変更の節目',styles:['DRIVE','OPTIMIZE']},
  {id:'earbuds',emoji:'🎧',category:'device',label:'イヤホンを買う時',object:'イヤホン',compare:'音質・電池・装着感・価格',feel:'耳につけた瞬間のフィット感や音の好み',future:'長時間使っても不満が残らないか',immediate:'今の不便がすぐ消えるか',periodic:'紛失・故障・新機種のタイミング',styles:['ENJOY','OPTIMIZE']},
  {id:'tv-monitor',emoji:'🖥️',category:'device',label:'テレビ・モニターを選ぶ時',object:'テレビやモニター',compare:'サイズ・画質・機能・価格',feel:'実際に見た時の迫力や見やすさ',future:'部屋や用途が変わっても使えるか',immediate:'今の見づらさや不満が解消するか',periodic:'引っ越し・故障・買い替えの節目',styles:['ENJOY','SECURE']},
  {id:'fridge',emoji:'🧊',category:'home',label:'冷蔵庫を買う時',object:'冷蔵庫',compare:'容量・省エネ・サイズ・価格',feel:'扉や棚の使いやすさ',future:'数年使っても容量不足にならないか',immediate:'今の収納不足が解消するか',periodic:'故障・引っ越し・家族構成変化の節目',styles:['SECURE','OPTIMIZE']},
  {id:'washer',emoji:'🧺',category:'home',label:'洗濯機を買う時',object:'洗濯機',compare:'容量・乾燥・時短・価格',feel:'毎日使うイメージが自然に湧くか',future:'数年使う間の手間や故障リスク',immediate:'今の家事負担をどれだけ減らせるか',periodic:'故障・引っ越し・買い替えの節目',styles:['DRIVE','SECURE']},
  {id:'vacuum',emoji:'🧹',category:'home',label:'掃除機を買う時',object:'掃除機',compare:'吸引力・重さ・手入れ・価格',feel:'持った時の軽さや使いやすさ',future:'手入れまで含めて使い続けられるか',immediate:'今の掃除ストレスが減るか',periodic:'故障・セール・買い替えの節目',styles:['DRIVE','OPTIMIZE']},
  {id:'dryer',emoji:'💨',category:'home',label:'ドライヤーを買う時',object:'ドライヤー',compare:'風量・重さ・機能・価格',feel:'使った時の速さや仕上がりの好み',future:'毎日使っても負担が少ないか',immediate:'今の面倒さが減るか',periodic:'故障・買い替えのタイミング',styles:['ENJOY','DRIVE']},
  {id:'sofa',emoji:'🛋️',category:'living',label:'ソファ・家具を買う時',object:'家具',compare:'サイズ・素材・価格・置きやすさ',feel:'座った時のしっくり感や部屋との相性',future:'引っ越しや模様替え後も使えるか',immediate:'今の部屋が快適になるか',periodic:'引っ越し・模様替えの節目',styles:['ENJOY','SECURE']},
  {id:'mattress',emoji:'🛏️',category:'living',label:'ベッド・寝具を選ぶ時',object:'寝具',compare:'硬さ・素材・保証・価格',feel:'横になった瞬間の身体のしっくり感',future:'長く使って睡眠に不満が残らないか',immediate:'今の寝づらさが改善するか',periodic:'買い替え・引っ越しの節目',styles:['SECURE','ENJOY']},
  {id:'clothes',emoji:'👕',category:'fashion',label:'洋服を買う時',object:'服',compare:'値段・素材・着回し・手持ちとの相性',feel:'鏡を見た瞬間の「自分っぽい」感',future:'来月以降も着る場面がありそうか',immediate:'今着たいか、今の自分に合うか',periodic:'季節の変わり目・セールの節目',styles:['ENJOY','OPTIMIZE']},
  {id:'shoes',emoji:'👟',category:'fashion',label:'靴を買う時',object:'靴',compare:'履き心地・価格・用途・耐久性',feel:'履いた瞬間のフィット感や見た目',future:'長く履けるか、出番が続くか',immediate:'今の服装や予定にすぐ使えるか',periodic:'季節・旅行・買い替えの節目',styles:['ENJOY','SECURE']},
  {id:'bag-wallet',emoji:'👜',category:'fashion',label:'バッグ・財布を買う時',object:'バッグや財布',compare:'収納・素材・価格・使い勝手',feel:'持った時の見た目や自分との相性',future:'長く使っても飽きにくいか',immediate:'今の使いづらさが消えるか',periodic:'買い替え・誕生日・節目',styles:['ENJOY','OPTIMIZE']},
  {id:'cosmetics',emoji:'🧴',category:'beauty',label:'コスメ・スキンケアを買う時',object:'コスメやスキンケア',compare:'成分・容量・価格・口コミ',feel:'使った時の香りや質感、肌との相性',future:'使い切れるか、続けやすいか',immediate:'今ほしい効果や気分に合うか',periodic:'使い切り・季節変更・肌状態の節目',styles:['ENJOY','OPTIMIZE']},
  {id:'online-cart',emoji:'🛒',category:'shopping',label:'ネット通販のカートで迷う時',object:'カートに入れた商品',compare:'価格・レビュー・送料・代替品',feel:'「これが欲しい」が最後まで残るか',future:'届いたあと本当に使う場面があるか',immediate:'今必要か、今あると便利か',periodic:'セール終了・ポイント期限の節目',styles:['OPTIMIZE','ENJOY']},
  {id:'convenience-extra',emoji:'🏪',category:'food',label:'コンビニで予定外に追加する時',object:'予定外の一品',compare:'値段・量・今あるものとの重なり',feel:'見た瞬間の「ちょっと欲しい」感',future:'この後の食事や予定に響かないか',immediate:'今食べたい・今必要か',periodic:'帰宅前・昼休みなど区切りのタイミング',styles:['ENJOY','OPTIMIZE']},
  {id:'supermarket-bulk',emoji:'🛍️',category:'food',label:'スーパーでまとめ買いする時',object:'まとめ買い',compare:'単価・量・保存期間・使い切り',feel:'本当に使うイメージが湧くか',future:'数日〜数週間で使い切れるか',immediate:'今必要な分が十分か',periodic:'週末・給料日・買い出しの節目',styles:['OPTIMIZE','SECURE']},
  {id:'lunch',emoji:'🍱',category:'food',label:'ランチを選ぶ時',object:'今日のランチ',compare:'値段・量・距離・待ち時間',feel:'今いちばん食べたいものが何か',future:'午後の予定や次の食事に響かないか',immediate:'今の空腹や気分を満たせるか',periodic:'昼休みという区切り',styles:['ENJOY','OPTIMIZE']},
  {id:'delivery',emoji:'🍔',category:'food',label:'デリバリーを頼むか迷う時',object:'デリバリー',compare:'送料・待ち時間・自炊との差',feel:'今それを食べたい気持ちがどれくらい強いか',future:'この後の食費や予定に響かないか',immediate:'今の手間を減らせるか',periodic:'疲れた日・帰宅後の区切り',styles:['ENJOY','DRIVE']},
  {id:'restaurant-upgrade',emoji:'🍽️',category:'food',label:'少し高い店にするか迷う時',object:'外食の店',compare:'価格・レビュー・内容・場所',feel:'写真や雰囲気を見た時の期待感',future:'今月の他の予定と両立できるか',immediate:'今日の満足度を上げられるか',periodic:'記念日・会食・週末の節目',styles:['ENJOY','SECURE']},
  {id:'second-bar',emoji:'🍻',category:'social',label:'飲み会の2軒目に行くか迷う時',object:'2軒目',compare:'金額・時間・明日の予定',feel:'まだ一緒にいたいか、その場が楽しいか',future:'翌日の予定や今月の出費に響かないか',immediate:'今この時間を続けたいか',periodic:'1軒目終了という区切り',styles:['ENJOY','SECURE']},
  {id:'hotel',emoji:'🏨',category:'travel',label:'旅行のホテルを選ぶ時',object:'ホテル',compare:'価格・立地・部屋・レビュー',feel:'写真を見た時の「ここ泊まりたい」感',future:'旅全体の予算や移動に合うか',immediate:'今回の旅で欲しい快適さがあるか',periodic:'予約するタイミング',styles:['ENJOY','SECURE']},
  {id:'transport-trip',emoji:'🚄',category:'travel',label:'飛行機・新幹線を選ぶ時',object:'移動手段',compare:'価格・時間・乗り換え・快適さ',feel:'その移動で無理しなくて済む感覚',future:'旅全体の日程や翌日に響かないか',immediate:'今の予定に一番合う便か',periodic:'予約・出発日の節目',styles:['DRIVE','OPTIMIZE']},
  {id:'travel-activity',emoji:'🎫',category:'travel',label:'旅行先で追加体験を入れる時',object:'現地アクティビティ',compare:'価格・所要時間・他の予定との重なり',feel:'「せっかく来たならやりたい」感',future:'残りの日程や予算に無理がないか',immediate:'今しかできない体験か',periodic:'現地到着・予定変更の節目',styles:['ENJOY','DRIVE']},
  {id:'live-ticket',emoji:'🎤',category:'leisure',label:'ライブ・イベントのチケットを取る時',object:'チケット',compare:'席・価格・日程・アクセス',feel:'行った時のワクワクが想像できるか',future:'その日の予定や他の出費に無理がないか',immediate:'今この機会を逃したくないか',periodic:'発売日・抽選締切の節目',styles:['ENJOY','DRIVE']},
  {id:'video-sub',emoji:'📺',category:'subscription',label:'動画・音楽サブスクを残すか迷う時',object:'サブスク',compare:'月額・利用頻度・他サービスとの重複',feel:'実際に使うと満足できているか',future:'数か月後も使っていそうか',immediate:'今見たい・聴きたいものがあるか',periodic:'更新日・値上げ通知の節目',styles:['OPTIMIZE','ENJOY']},
  {id:'app-paid',emoji:'📲',category:'subscription',label:'アプリを有料版にする時',object:'有料プラン',compare:'無料版との差・月額・機能',feel:'使った時の快適さが明確に変わるか',future:'継続して使う用途があるか',immediate:'今の不便がすぐ消えるか',periodic:'無料期間終了・機能制限の節目',styles:['DRIVE','OPTIMIZE']},
  {id:'gym',emoji:'🏋️',category:'subscription',label:'ジム・習い事を続けるか迷う時',object:'月額契約',compare:'月額・利用頻度・通いやすさ',feel:'行った後に満足感があるか',future:'今後も続ける生活リズムが作れそうか',immediate:'今の目標に役立っているか',periodic:'更新月・月末の節目',styles:['DRIVE','OPTIMIZE']},
  {id:'phone-plan',emoji:'📶',category:'fixed-cost',label:'携帯プランを見直す時',object:'料金プラン',compare:'月額・データ量・通話・特典',feel:'使い方に窮屈さがないか',future:'今後の利用量にも足りるか',immediate:'今の無駄や不足が解消するか',periodic:'更新・値上げ・機種変の節目',styles:['OPTIMIZE','SECURE']},
  {id:'insurance',emoji:'🛡️',category:'fixed-cost',label:'保険の更新で迷う時',object:'保険契約',compare:'保険料・保障内容・重複',feel:'内容を見た時に安心できるか',future:'今後の不安に対して必要十分か',immediate:'今の生活で必要な保障か',periodic:'更新・ライフイベントの節目',styles:['SECURE','OPTIMIZE']},
  {id:'cloud',emoji:'☁️',category:'subscription',label:'クラウド容量を増やす時',object:'追加容量',compare:'容量・月額・整理で済むか',feel:'写真やデータを消さずに済む安心感',future:'この先も容量不足が続きそうか',immediate:'今すぐ空き容量が必要か',periodic:'容量警告・更新の節目',styles:['SECURE','OPTIMIZE']},
  {id:'salon',emoji:'💇',category:'beauty',label:'美容院・サロンを選ぶ時',object:'美容サービス',compare:'価格・口コミ・立地・メニュー',feel:'仕上がりを想像した時に気分が上がるか',future:'次回まで扱いやすく保てそうか',immediate:'今の見た目や気分を変えたいか',periodic:'予約・イベント前の節目',styles:['ENJOY','SECURE']},
  {id:'course',emoji:'📚',category:'self-invest',label:'資格・講座に申し込む時',object:'講座や教材',compare:'価格・内容・期間・実績',feel:'自分が続けているイメージが湧くか',future:'今後の選択肢や能力につながるか',immediate:'今の課題を解決できるか',periodic:'募集締切・年度替わりの節目',styles:['DRIVE','OPTIMIZE']},
  {id:'work-tool',emoji:'🧰',category:'self-invest',label:'仕事道具・有料ツールを導入する時',object:'仕事道具やツール',compare:'価格・機能・時短効果',feel:'触った時に「これなら使い続けられる」感があるか',future:'長く仕事で役立つか',immediate:'今のボトルネックを消せるか',periodic:'案件開始・更新・繁忙期の節目',styles:['DRIVE','OPTIMIZE']},
  {id:'birthday-gift',emoji:'🎁',category:'social',label:'誕生日プレゼントを選ぶ時',object:'プレゼント',compare:'価格・相手の好み・実用性',feel:'渡した時に喜ぶ顔が想像できるか',future:'長く使ってもらえそうか',immediate:'今回の相手に一番合うか',periodic:'誕生日という節目',styles:['ENJOY','SECURE']},
  {id:'celebration',emoji:'💐',category:'social',label:'結婚・出産祝いを決める時',object:'お祝い',compare:'金額・関係性・相場・品物',feel:'自分として納得して渡せるか',future:'今後の付き合いも含めて自然か',immediate:'今回のお祝いとしてしっくり来るか',periodic:'祝い事という節目',styles:['SECURE','ENJOY']},
  {id:'friend-invite',emoji:'🗓️',category:'social',label:'友達から急に誘われた時',object:'急な予定',compare:'金額・時間・翌日の予定',feel:'今その人たちと会いたいか',future:'後の予定や出費に無理が出ないか',immediate:'今しかない誘いか',periodic:'誘いが来た瞬間の節目',styles:['ENJOY','DRIVE']},
  {id:'date-restaurant',emoji:'🍷',category:'social',label:'デート・会食の店を決める時',object:'店選び',compare:'価格・場所・口コミ・雰囲気',feel:'相手と過ごす場面が想像できるか',future:'前後の予定や予算に合うか',immediate:'今回の時間を良くできるか',periodic:'予約の節目',styles:['ENJOY','SECURE']},
  {id:'family-purchase',emoji:'👥',category:'family',label:'家族・パートナーと大きな買い物を決める時',object:'共有の買い物',compare:'価格・用途・双方の希望',feel:'お互いが納得して使えるイメージがあるか',future:'今後の生活にも合うか',immediate:'今の不便を解消できるか',periodic:'引っ越し・故障・生活変更の節目',styles:['SECURE','OPTIMIZE']},
  {id:'taxi',emoji:'🚕',category:'mobility',label:'電車かタクシーか迷う時',object:'移動手段',compare:'料金・時間・乗り換え・疲労',feel:'今の自分が楽に動けるか',future:'この後の予定や体力に響かないか',immediate:'今何分・何手間を減らせるか',periodic:'終電前・悪天候・遅刻しそうな節目',styles:['DRIVE','ENJOY']},
  {id:'upgrade-seat',emoji:'💺',category:'mobility',label:'指定席・グリーン車にするか迷う時',object:'座席アップグレード',compare:'追加料金・移動時間・混雑',feel:'移動中に快適に過ごせそうか',future:'到着後の予定に体力を残せるか',immediate:'今の移動を楽にできるか',periodic:'予約・乗車前の節目',styles:['ENJOY','DRIVE']},
  {id:'car-share',emoji:'🚗',category:'mobility',label:'レンタカー・カーシェアを使う時',object:'車利用',compare:'料金・時間・距離・駐車場',feel:'自由に動ける快適さがあるか',future:'返却や帰りの予定まで無理がないか',immediate:'今の移動を大きく楽にできるか',periodic:'旅行・休日・大きな買い物の節目',styles:['DRIVE','OPTIMIZE']},
  {id:'repair-replace',emoji:'🔧',category:'unexpected',label:'壊れた物を修理か買い替えか迷う時',object:'修理か買い替え',compare:'修理費・新品価格・寿命',feel:'直した後も気持ちよく使えるか',future:'あと何年使えるか',immediate:'今すぐ使える状態に戻せるか',periodic:'故障という節目',styles:['SECURE','OPTIMIZE']},
  {id:'moving',emoji:'📦',category:'living',label:'引っ越し先を決める時',object:'新居',compare:'家賃・広さ・駅距離・初期費用',feel:'内見した時の住みやすそう感',future:'今後の仕事や生活にも合うか',immediate:'今の不満をどれだけ解消できるか',periodic:'更新・転職・生活変更の節目',styles:['SECURE','DRIVE']},
  {id:'internet-power',emoji:'⚡',category:'fixed-cost',label:'Wi-Fi・電気プランを見直す時',object:'固定費プラン',compare:'月額・契約条件・特典・解約金',feel:'使っていてストレスがなさそうか',future:'長く使っても割高にならないか',immediate:'今の不満や料金を改善できるか',periodic:'更新・値上げ・引っ越しの節目',styles:['OPTIMIZE','SECURE']},
  {id:'card-fee',emoji:'💳',category:'fixed-cost',label:'クレカの年会費を払うか迷う時',object:'年会費',compare:'年会費・特典・利用頻度',feel:'持っている満足感や使い勝手があるか',future:'来年も特典を使いそうか',immediate:'今の生活で元が取れているか',periodic:'年会費請求・更新の節目',styles:['OPTIMIZE','ENJOY']},
  {id:'bonus',emoji:'💰',category:'saving',label:'ボーナス・臨時収入が入った時',object:'臨時収入',compare:'使う・残す・目的別に分ける',feel:'何に使うと一番納得できそうか',future:'この先の予定に残しておく意味',immediate:'今やりたいことへ使う意味',periodic:'入金という節目',styles:['DRIVE','SECURE']},
  {id:'refund-points',emoji:'🎟️',category:'saving',label:'返金・ポイントが戻ってきた時',object:'戻ってきたお金やポイント',compare:'今使う・貯める・別用途へ回す',feel:'使い道に納得感があるか',future:'後で使う予定があるか',immediate:'今ほしいものに使えるか',periodic:'付与・期限という節目',styles:['ENJOY','OPTIMIZE']},
  {id:'month-leftover',emoji:'📆',category:'saving',label:'月末にお金が余った時',object:'余ったお金',compare:'貯金・投資・翌月へ繰越・使う',feel:'どの使い道が自分にしっくりくるか',future:'この先の予定に回す意味',immediate:'今の満足や必要性に使う意味',periodic:'月末という節目',styles:['SECURE','DRIVE']},
  {id:'emergency-repair',emoji:'🚨',category:'unexpected',label:'急な修理代が必要になった時',object:'予定外の出費',compare:'修理方法・代替案・金額',feel:'この対応なら後悔しなさそうか',future:'今後の生活への影響をどこまで抑えられるか',immediate:'今すぐ困りごとを止められるか',periodic:'故障・トラブルという節目',styles:['SECURE','OPTIMIZE']},
  {id:'sudden-trip',emoji:'🛫',category:'unexpected',label:'急な旅行・イベントに誘われた時',object:'急な誘い',compare:'費用・予定・移動・翌日',feel:'今行きたい気持ちがどれくらいあるか',future:'前後の予定や出費に無理がないか',immediate:'今しかない機会か',periodic:'誘いが来た瞬間の節目',styles:['ENJOY','DRIVE']},
  {id:'trial-end',emoji:'⏳',category:'subscription',label:'無料体験が終わる時',object:'有料継続',compare:'月額・利用頻度・代替サービス',feel:'使っていて満足したか',future:'来月以降も使う場面があるか',immediate:'今すぐ必要な機能があるか',periodic:'無料期間終了の節目',styles:['OPTIMIZE','ENJOY']},
  {id:'price-rise',emoji:'📈',category:'fixed-cost',label:'値上げ通知が来た時',object:'値上がりしたサービス',compare:'新料金・代替案・解約コスト',feel:'値上げ後も使いたいと思えるか',future:'この先払い続ける価値があるか',immediate:'今の生活で必要か',periodic:'値上げ・更新の節目',styles:['OPTIMIZE','SECURE']},
  {id:'reviews',emoji:'⭐',category:'shopping',label:'口コミを見続けて決めきれない時',object:'候補商品',compare:'評価・レビュー数・欠点・価格',feel:'読んでも最後に残るしっくり感',future:'買った後に後悔しないか',immediate:'今の用途を満たせるか',periodic:'セール終了・在庫残りなどの節目',styles:['SECURE','OPTIMIZE']},
  {id:'new-used',emoji:'♻️',category:'shopping',label:'新品か中古・型落ちか迷う時',object:'新品と中古・型落ち',compare:'価格差・状態・保証・性能差',feel:'持った時に納得できるか',future:'何年使うかを考えた時にどちらが自然か',immediate:'今必要な性能を満たすか',periodic:'買い替え・セールの節目',styles:['OPTIMIZE','SECURE']},
  {id:'installment',emoji:'🧾',category:'payment',label:'一括か分割か迷う時',object:'支払い方法',compare:'総額・月額・手数料・余力',feel:'支払った後に気持ちが重くならないか',future:'今後の固定負担にどう響くか',immediate:'今の手元資金をどれだけ残したいか',periodic:'購入・契約の節目',styles:['SECURE','OPTIMIZE']},
  {id:'warranty',emoji:'🔒',category:'payment',label:'延長保証を付けるか迷う時',object:'延長保証',compare:'保証料・故障率・修理費',feel:'付けないまま使って不安が残らないか',future:'数年後の故障リスクに備える意味',immediate:'今の安心にいくら払うか',periodic:'購入時という節目',styles:['SECURE','OPTIMIZE']},
  {id:'points-use',emoji:'🪙',category:'payment',label:'ポイントを今使うか貯めるか迷う時',object:'ポイント',compare:'今使う価値・期限・将来の用途',feel:'使った時の得した感があるか',future:'大きな買い物まで残す意味',immediate:'今の支払いを軽くする意味',periodic:'期限・キャンペーンの節目',styles:['OPTIMIZE','ENJOY']},
];

function hash(text:string){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

function styleFit(scene:SceneSeed,style:StyleId){return scene.styles.includes(style)?4:0}

export function selectDailySceneSeeds(jobCode:JobCode,style:StyleId,count=6){
  const axes=JOB_AXES[jobCode];
  const scored=SCENES.map(scene=>{
    let score=styleFit(scene,style);
    if(axes.time==='F'&&['saving','fixed-cost','living','travel'].includes(scene.category))score+=2;
    if(axes.time==='I'&&['food','shopping','social','unexpected'].includes(scene.category))score+=2;
    if(axes.decision==='D'&&['device','payment','fixed-cost','shopping'].includes(scene.category))score+=1;
    if(axes.decision==='N'&&['fashion','beauty','travel','social'].includes(scene.category))score+=1;
    if(axes.rhythm==='P'&&['subscription','fixed-cost','saving','unexpected'].includes(scene.category))score+=1;
    score+=(hash(`${jobCode}-${style}-${scene.id}`)%1000)/1000;
    return {scene,score};
  }).sort((a,b)=>b.score-a.score);
  const picked:SceneSeed[]=[];const categories=new Set<string>();
  for(const x of scored){if(picked.length>=count)break;if(!categories.has(x.scene.category)){picked.push(x.scene);categories.add(x.scene.category)}}
  for(const x of scored){if(picked.length>=count)break;if(!picked.includes(x.scene))picked.push(x.scene)}
  return picked;
}

export function buildDailyScene(seed:SceneSeed,axes:JobAxes,style:StyleId):DailyScene{
  const time=axes.time==='F'
    ?`${seed.future}まで一度頭に入れてから、${seed.object}を考えやすい。`
    :`${seed.immediate}がはっきりすると、${seed.object}の判断が一気に現実的になりやすい。`;
  const decision=axes.decision==='D'
    ?`${seed.compare}を並べて、「なぜこっちか」を説明できる方へ寄りやすい。`
    :`${seed.compare}は見る。でも最後まで${seed.feel}を判断材料から外しにくい。`;
  const rhythm=axes.rhythm==='M'
    ?'普段の余力感を土台に、「今ここまでなら出せる」を作りやすい。'
    :`${seed.periodic}で一度まとめて確認すると、その後の判断が軽くなりやすい。`;
  const styleLine=`最後は「${STYLE_HOOK[style]}」が、その選択にGOを出す大きな理由になりやすい。`;
  return {
    category:seed.category,
    label:`${seed.emoji} ${seed.label}`,
    title:`${seed.label.replace(/時$/,'場面')}、あなたはここを見やすい`,
    body:`${time}${decision}${rhythm}${styleLine}`,
    voice:STYLE_VOICE[style](seed.label.replace(/時$/,'')),
  };
}

export function dailyScenesForType(jobCode:JobCode,style:StyleId,count=6):DailyScene[]{
  const axes=JOB_AXES[jobCode];
  return selectDailySceneSeeds(jobCode,style,count).map(seed=>buildDailyScene(seed,axes,style));
}

export const DAILY_SCENE_LIBRARY_SIZE=SCENES.length;
