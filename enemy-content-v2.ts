import type { Category } from './mudagiri-diagnosis-v2';

export type EnemyState = 'defeat'|'spared'|'needs_review';
export interface EnemyContent {
  category: Category; name:string; icon:string; image:string; catchcopy:string;
  encounter:string; defeat:string; spared:string; needsReview:string;
  action:string; lineDetail:string;
}

export const ENEMY_CONTENT:Record<Category,EnemyContent> = {
 mobile:{category:'mobile',name:'通信ザウルス',icon:'📡',image:'./assets/enemies/mobile.webp',catchcopy:'情弱を狙う回線の恐竜',encounter:'通信ザウルスが あらわれた！「そのプラン、本当に全部使ってる？」',defeat:'高い回線代の中に、満足度を落とさず斬れる余地を発見。',spared:'通信費は十分に抑えられている。今回は見逃し！',needsReview:'契約内容を確認してから判定する。',action:'データ使用量・通話・端末代を分け、同条件の料金プランと比較する。',lineDetail:'現在のプラン、月間データ量、通話オプション、端末分割を分けて確認。サービス品質を落とさず下げられる部分だけを探す。'},
 energy:{category:'energy',name:'電気ウナギ魔人',icon:'⚡',image:'./assets/enemies/energy.webp',catchcopy:'ジワジワ削る感電型',encounter:'電気ウナギ魔人が あらわれた！ 毎月少しずつ家計HPを吸っている。',defeat:'地域・世帯条件を考えても高めの部分だけを討伐候補にした。',spared:'地域差を考えると異常なし。今回は斬らない。',needsReview:'住居条件を確認してから判定する。',action:'契約プラン、使用量、セット割、季節要因を確認する。',lineDetail:'単純な全国平均ではなく地域差を考慮。使用量そのものと料金プランを分けて改善余地を確認する。'},
 sub:{category:'sub',name:'サブスクサキュバス',icon:'🌀',image:'./assets/enemies/sub.webp',catchcopy:'使ってないのに毎月吸い取る',encounter:'サブスクサキュバスが あらわれた！「見てない？使ってない？でも毎月いただきます♡」',defeat:'使っていないと申告した金額だけ討伐対象。',spared:'使っているサブスクは娯楽。今回は斬らない。',needsReview:'利用状況を確認してから判定する。',action:'直近30日で使っていない定額サービスから停止候補を作る。',lineDetail:'金額の大小ではなく利用実態で判定。未使用分は100%候補、よく使うサービスは守る。'},
 car:{category:'car',name:'ムダカー',icon:'🚗',image:'./assets/enemies/car.webp',catchcopy:'所有欲に憑く固定費モンスター',encounter:'ムダカーが あらわれた！ 走っていない時もコストは走り続ける。',defeat:'同じカーライフを保ちながら見直せる維持費を発見。',spared:'使い方とコストのバランスは悪くない。',needsReview:'利用頻度や地域事情を確認してから判定する。',action:'保険・燃料・駐車場・整備費を分けて確認する。',lineDetail:'車そのものを手放せとは判定しない。維持費の中で条件を変えずに改善できる部分を探す。'},
 food:{category:'food',name:'クイダオーレ',icon:'🍖',image:'./assets/enemies/food.webp',catchcopy:'満足なら斬らない。惰性だけ狙う',encounter:'クイダオーレが あらわれた！ 食費は高め。でも問題は「高いか」ではない。',defeat:'満足度の低い惰性支出だけを討伐対象にした。',spared:'ちゃんと人生を楽しくしている食費だ。今回は斬らない！',needsReview:'生活スタイルを確認してから判定する。',action:'満足度の低い外食・デリバリー・コンビニだけを探す。',lineDetail:'食費の平均超過をそのままムダにはしない。満足度と家計余力を見て、後悔の少ない部分だけ改善する。'},
 daily:{category:'daily',name:'チリツモコビト',icon:'🧻',image:'./assets/enemies/daily.webp',catchcopy:'小さな出費を群れで積み上げる',encounter:'チリツモコビトが あらわれた！ 1回は小さい。でも群れると強い。',defeat:'平均から大きく外れた日用品の一部を見直し候補にした。',spared:'細かな出費は許容範囲。追いかけすぎない。',needsReview:'購入内訳を確認してから判定する。',action:'ドラッグストア・ECの重複買いと在庫を確認する。',lineDetail:'小額項目なので過度に節約させない。重複・買い置き過多など再現性のあるムダだけを狙う。'},
 fun:{category:'fun',name:'アソビスギー',icon:'🎉',image:'./assets/enemies/fun.webp',catchcopy:'楽しい支出は守る。惰性だけ討伐',encounter:'アソビスギーが あらわれた！ 遊び代は高め。さて、満足してる？',defeat:'惰性になっている娯楽費だけを討伐候補にした。',spared:'楽しかったなら、それはムダじゃない。今回は見逃し！',needsReview:'満足度を確認してから判定する。',action:'「また払いたい」と思えない娯楽だけを洗い出す。',lineDetail:'旅行・趣味・交際費を一律に削らない。本人の満足度が高い体験支出は守る。'},
 beautyFashion:{category:'beautyFashion',name:'ミエハリーヌ',icon:'💎',image:'./assets/enemies/beautyFashion.webp',catchcopy:'満足度の低い見栄課金に潜む',encounter:'ミエハリーヌが あらわれた！ その買い物、自分のため？誰かの目のため？',defeat:'満足度の低い美容・服飾費だけを討伐対象にした。',spared:'自信や満足につながっているなら、今回は斬らない。',needsReview:'価値観を確認してから判定する。',action:'買った後の満足が低かった支出を振り返る。',lineDetail:'美容や服はQOL支出でもある。価格だけではなく、使用頻度と本人の満足度で判定する。'},
 rent:{category:'rent',name:'ヤチンダー',icon:'🏠',image:'./assets/enemies/rent.webp',catchcopy:'毎月最大級。でも簡単には斬れない',encounter:'ヤチンダーが あらわれた！ 家計の大ボス級だが、立地も暮らしも背負っている。',defeat:'',spared:'住環境の価値を無視して家賃だけは斬らない。',needsReview:'手取り負担は高め。ただし立地・広さ・通勤・家族条件を見ずにムダ判定しない。',action:'負担率が高い場合だけ、更新・引越し時に条件を再確認する。',lineDetail:'家賃は自動削減額を出さない。生活満足と固定費負担を分けて考える。'},
 insurance:{category:'insurance',name:'ホケンミエナイダー',icon:'🛡️',image:'./assets/enemies/insurance.webp',catchcopy:'金額だけでは正体が見えない',encounter:'ホケンミエナイダーが あらわれた！ 高い？安い？保障を見ないとまだ分からない。',defeat:'',spared:'',needsReview:'保障内容・家族構成・資産状況を見ずに斬るのは危険。要鑑定。',action:'保障目的、保障額、期間、重複、貯蓄性を確認する。',lineDetail:'保険料の大小だけで削減可能額を出さない。必要保障と重複を確認して初めて見直し判断をする。'},
 childEducation:{category:'childEducation',name:'マナビンボー',icon:'🎓',image:'./assets/enemies/childEducation.webp',catchcopy:'教育費は高いだけではムダじゃない',encounter:'マナビンボーが あらわれた！ 未来への投資か、惰性か。金額だけでは決められない。',defeat:'',spared:'',needsReview:'子どもの年齢・進路・学校区分・目的を確認するまで要鑑定。',action:'学校費・塾・習い事を目的別に分けて確認する。',lineDetail:'公的統計との比較は参考表示に限定。平均超過をそのままムダ認定しない。'},
 selfDevelopment:{category:'selfDevelopment',name:'ジコトウシン',icon:'📚',image:'./assets/enemies/selfDevelopment.webp',catchcopy:'自己投資の皮をかぶった惰性を探す',encounter:'ジコトウシンが あらわれた！ 成長への投資か、買って満足か。',defeat:'',spared:'',needsReview:'目的・利用状況・成果を確認しないと価値を判定できない。',action:'利用頻度、学習時間、得たい成果、継続意思を確認する。',lineDetail:'資格・スクール・教材を一律に削らない。未利用や目的喪失が確認できた部分だけ見直す。'}
};

export const getEnemyContent=(category:Category)=>ENEMY_CONTENT[category];
