export const PILOT_VERSION = "V4.4_PILOT_CANDIDATE" as const;

export type CoreScaleType = "A" | "B";

export const CORE_SCALE_LABELS = {
  A:["ほぼ選ばない","あまり選ばない","半々くらい","やや選びやすい","かなり選びやすい"],
  B:["まったく当てはまらない","あまり当てはまらない","どちらともいえない","だいたい当てはまる","かなり当てはまる"]
} as const;

export const PILOT_ITEMS = [
  {"item_id":"F01","family":"CORE","construct":"FUTURE","scale_type":"A","scenario":"自由に使えるお金が手元に5万円あります。今すぐ必要な買い物はありませんが、1年後にはまとまった出費があるかもしれません。","prompt":"この5万円の多くを、1年後にも使える状態で残しておく方を選びやすいですか？","contract":"1年後不確実支出への資金保全。","behavior_options":""},
  {"item_id":"F02","family":"CORE","construct":"FUTURE","scale_type":"A","scenario":"毎月の生活費に少し余裕があります。一方、半年後には楽しみにしている予定があります。","prompt":"日常の小さな出費を少し抑えて、半年後に使えるお金を増やしておく方を選びやすいですか？","contract":"中期目標に向けた日常の微調整。","behavior_options":""},
  {"item_id":"F03","family":"CORE","construct":"FUTURE","scale_type":"A","scenario":"2か月後に5万円の支払い予定があります。今、普段なかなか手に入らない3万円の欲しいものを見つけました。今月中のやりくりで何とか補える可能性もあります。","prompt":"無理をせず、欲しいものを諦めて2か月後の支払いに備える方を選びやすいですか？","contract":"限定入手機会と手堅い温存の拮抗。","behavior_options":""},
  {"item_id":"F04","family":"CORE","construct":"FUTURE","scale_type":"A","scenario":"毎月のやりくりの中で、今月は予定外に5万円の余剰が出ました。前から気になっていたものもありますが、3か月後にも楽しみにしている予定があります。","prompt":"まず3か月後の予定に使う分を先に確保し、残った分を今使う方を選びやすいですか？","contract":"余剰金の先行配分・未来枠の確保。","behavior_options":""},
  {"item_id":"F05","family":"CORE","construct":"FUTURE","scale_type":"A","scenario":"今少し出費を控えれば、半年後には「旅行・買い物・貯蓄」など複数の選択肢を残せます。今使ってしまうと、その選択肢は狭まります。","prompt":"今の満足を少し減らしてでも、半年後の選択肢を残しておく方を選びやすいですか？","contract":"将来の選択肢を保持する選好。","behavior_options":""},

  {"item_id":"I01","family":"CORE","construct":"IMMEDIATE","scale_type":"A","scenario":"自由に使える3万円があります。今の生活をすぐに快適にできる使い道があり、半年後まで手をつけずに残すこともできます。","prompt":"半年後まで残すより、今の生活を良くするために今使う方を選びやすいですか？","contract":"生活向上への即時効用。","behavior_options":""},
  {"item_id":"I02","family":"CORE","construct":"IMMEDIATE","scale_type":"A","scenario":"今月しか参加できないイベントがあります。同じくらい興味のある買い物なら、数か月後でもできます。","prompt":"後からでもできる買い物より、今しかできない機会を優先して選ぶ方ですか？","contract":"期限のある機会への現在優先度。","behavior_options":""},
  {"item_id":"I03","family":"CORE","construct":"IMMEDIATE","scale_type":"A","scenario":"自由に使える2万円があります。「今楽しむこと」と「半年後の自分のために残すこと」のどちらも同じくらい大切だと感じっています。","prompt":"このように迷った場合、最終的に「今楽しむ方」を選びやすいですか？","contract":"拮抗時の現在バイアス。","behavior_options":""},
  {"item_id":"I04","family":"CORE","construct":"IMMEDIATE","scale_type":"A","scenario":"日常の支出が予定より浮いて、手元に5万円の余裕ができました。","prompt":"「先のためにどう残すか」より、まず「今なら何に使えるか」を先に考える方ですか？","contract":"余剰発生時の初動認知。","behavior_options":""},
  {"item_id":"I05","family":"CORE","construct":"IMMEDIATE","scale_type":"A","scenario":"欲しい商品があります。今日買えば3万円ですぐ手に入りますが、1か月待てば2万5千円程度に下がる可能性があります。","prompt":"5千円安くなるのを待つより、今日手に入れてすぐ使いたい方を選びやすいですか？","contract":"待ち時間コストと即時入手価値。","behavior_options":""},

  {"item_id":"N01","family":"CORE","construct":"INTUITION","scale_type":"A","scenario":"買い物をするとき、候補をいくつか見る前に、最初に見た瞬間に「これがいい」と強く感じたものがありました。","prompt":"その後ほかの商品を一通り見比べても、結局は最初に惹かれたものを選びやすいですか？","contract":"探索初期の第一印象への信頼。","behavior_options":""},
  {"item_id":"N02","family":"CORE","construct":"INTUITION","scale_type":"A","scenario":"知人から「機能も価格も絶対にこっちが良い」と理由付きで強く勧められました。しかし、自分が見るともう一方の方がしっくりきます。","prompt":"相手の合理的な説明より、自分が感じる「しっくり感」を優先して選びやすいですか？","contract":"他者の論理と自己の内的感覚の対立。","behavior_options":""},
  {"item_id":"N03","family":"CORE","construct":"INTUITION","scale_type":"A","scenario":"予算内で2つの商品を比較しています。Aはスペックや条件が少し優れています。Bは条件ではやや劣りますが、なぜか自分にはBの方が合っている気がします。","prompt":"スペックで勝るAより、感覚的に合うBを選びやすいですか？","contract":"スペック劣後時の直感優先度。","behavior_options":""},
  {"item_id":"N04","family":"CORE","construct":"INTUITION","scale_type":"A","scenario":"条件面では特に気になる点のない契約があります。しかし、話を聞いているうちに、言葉にはできない違和感や引っかかりを感じました。","prompt":"条件に問題が見当たらなくても、その違和感を理由に契約を見送ることがありますか？","contract":"否定的内的アラートによる拒否権。","behavior_options":""},
  {"item_id":"N05","family":"CORE","construct":"INTUITION","scale_type":"A","scenario":"候補を十分に比較・検討した結果、数字やスペックにはほとんど差がありませんでした。これ以上調べても新しい情報は出そうにありません。","prompt":"最後は理屈ではなく、自分の感覚やフィーリングで決めやすいですか？","contract":"探索飽和後の最終決済手段としての直感。","behavior_options":""},

  {"item_id":"D01","family":"CORE","construct":"DELIBERATION","scale_type":"A","scenario":"買おうと考えている商品に3つの候補があります。今日中に決める必要はありません。","prompt":"その場で決めず、3つの特徴や価格を比較・整理してから決める方を選びやすいですか？","contract":"決定猶予時の構造的比較。","behavior_options":""},
  {"item_id":"D02","family":"CORE","construct":"DELIBERATION","scale_type":"A","scenario":"魅力的なサービスがあり、大半の内容には納得しています。ただ、細かい利用規約や例外条件までは読み切れていません。","prompt":"規約をすべて確認できるまで申し込まず、一度持ち帰る方を選びやすいですか？","contract":"大枠納得で進むか細部まで精査するかの拮抗。","behavior_options":""},
  {"item_id":"D03","family":"CORE","construct":"DELIBERATION","scale_type":"A","scenario":"30万円ほどの大きな買い物を検討しています。欲しい気持ちはすでに十分に高まっています。","prompt":"買う前に、メリットと気になる点（デメリット）を一度頭やメモで整理してから決める方ですか？","contract":"高揚時の客観的整理プロセス。","behavior_options":""},
  {"item_id":"D04","family":"CORE","construct":"DELIBERATION","scale_type":"A","scenario":"非常に魅力的に見えるサービスを見つけました。ただ、競合する他のサービスについてはまだ何も調べていません。","prompt":"魅力的でもすぐ申し込まず、他の選択肢を一通り調べてから決める方ですか？","contract":"代替案探索の網羅性。","behavior_options":""},
  {"item_id":"D05","family":"CORE","construct":"DELIBERATION","scale_type":"A","scenario":"価格・品質・使いやすさがそれぞれ異なる3つの商品で迷っています。","prompt":"感覚で選ぶ前に、「自分にとって価格と品質のどちらが最優先か」などの基準を整理してから決める方ですか？","contract":"判断基準の事前重み付け。","behavior_options":""},

  {"item_id":"M01","family":"CORE","construct":"MONITORING","scale_type":"B","scenario":"今日、「今月あと自由に使えるお金はいくら残っている？」と不意に聞かれたとします。","prompt":"銀行やカードの明細を見なくても、大体の金額をその場で答えられますか？","contract":"残余可処分所得のリアルタイム認知。","behavior_options":""},
  {"item_id":"M02","family":"CORE","construct":"MONITORING","scale_type":"B","scenario":"家賃・光熱費・通信費・サブスクなど、毎月ほぼ決まって出ていく固定費があります。","prompt":"その合計金額が毎月いくらくらいか、ざっくり頭に入っていますか？","contract":"固定費ベースラインの把握度。","behavior_options":""},
  {"item_id":"M03","family":"CORE","construct":"MONITORING","scale_type":"B","scenario":"月の半ば、カードや電子マネーで細かな支払いを複数回重ねている状態を想像してください。","prompt":"いま使うペースが、想定より速いか遅いか、大体感覚でつかめていますか？","contract":"支出速度の知覚。","behavior_options":""},
  {"item_id":"M04","family":"CORE","construct":"MONITORING","scale_type":"B","scenario":"普段の月よりも外食や買い物が増えている月を想像してください。","prompt":"月末の請求書や明細を見る前に、「今月は使いすぎているな」と月中に気づくことが多いですか？","contract":"支出超過の早期検知。","behavior_options":""},
  {"item_id":"M05","family":"CORE","construct":"MONITORING","scale_type":"B","scenario":"「この直近1週間で、何にいくらくらい使った？」と聞かれたとします。","prompt":"家計簿や履歴を開かなくても、大きめの支出なら大体思い出せますか？","contract":"短期の支出保持。","behavior_options":""},

  {"item_id":"P01","family":"CORE","construct":"PERIODIC","scale_type":"B","scenario":"給料日やカードの引き落とし日といった決まった日とは別に、自分で「週に1回」「隔週」などお金を確認するタイミングを決めていますか？","prompt":"自分なりの周期やルールを決めて確認する方ですか？","contract":"自発的な定期レビュー。","behavior_options":""},
  {"item_id":"P02","family":"CORE","construct":"PERIODIC","scale_type":"B","scenario":"給料日、クレジットカードの支払日、あるいは毎月末など、お金の出入りに区切りがつく日があります。","prompt":"そうした区切りのタイミングに合わせて、口座残高や支出を確認することが多いですか？","contract":"外部トリガーによる定点観測。","behavior_options":""},
  {"item_id":"P03","family":"CORE","construct":"PERIODIC","scale_type":"B","scenario":"旅行や大きな家電の購入など、普段よりまとまったお金を使う予定があります。","prompt":"その予定の前後など、イベントの節目に合わせて残高や明細を確認することが多いですか？","contract":"イベント駆動の確認行動。","behavior_options":""},
  {"item_id":"P04","family":"CORE","construct":"PERIODIC","scale_type":"B","scenario":"家計簿アプリやカードの利用通知を普段どのように確認していますか？","prompt":"通知が来るたびにその都度見るより、週末や月末などにまとめて目を通すことが多いですか？","contract":"都度処理とバッチ処理の違い。","behavior_options":""},
  {"item_id":"P05","family":"CORE","construct":"PERIODIC","scale_type":"B","scenario":"月の中盤の普段の生活を想像してください。","prompt":"月の途中では残高を細かく気にせず、月末や月初などの区切りで1か月分をまとめて振り返る方ですか？","contract":"月次レビュー思考。","behavior_options":""},

  {"item_id":"R01","family":"CORE","construct":"DRIVE","scale_type":"A","scenario":"自由に使える5万円があります。ずっと欲しかった趣味のものを買うことも、仕事やスキルアップのための教材や講座に使うこともできます。どちらも魅力的です。","prompt":"スキルアップや学びに使う方を選びやすいですか？","contract":"純粋消費と人的資本投資の競合。","behavior_options":""},
  {"item_id":"R02","family":"CORE","construct":"DRIVE","scale_type":"A","scenario":"自分の目標や作業を大幅に早められそうな有料ツールやサービスがあります。使わなくても、時間をかければ自分でやり切ることはできます。","prompt":"時間を短縮できるなら、進んでお金を払って使う方を選びやすいですか？","contract":"時間のレバレッジ。","behavior_options":""},
  {"item_id":"R03","family":"CORE","construct":"DRIVE","scale_type":"A","scenario":"手元の資金に10万円のゆとりができました。生活費や備えには困っていません。純粋な休日の楽しみに使うことも、新しい活動や挑戦の準備に使うこともできます。","prompt":"新しい活動や挑戦の準備に使う方を選びやすいですか？","contract":"余剰資金の挑戦的アロケーション。","behavior_options":""},
  {"item_id":"R04","family":"CORE","construct":"DRIVE","scale_type":"A","scenario":"5万円の自己投資があります。必ず成果につながる保証はありませんが、うまくいけば自分のスキルや活動の幅が広がる可能性があります。","prompt":"結果が保証されていなくても、挑戦として試してみる方を選びやすいですか？","contract":"不確実な成長機会へのリスクテイク。","behavior_options":""},
  {"item_id":"R05","family":"CORE","construct":"DRIVE","scale_type":"A","scenario":"休日に5万円を使うとします。気兼ねなく心からリフレッシュできる旅行と、新しい人脈や将来の仕事の機会につながりそうなイベントがあります。","prompt":"将来の機会につながりそうなイベントの方を選びやすいですか？","contract":"機会獲得への投資性。","behavior_options":""},

  {"item_id":"E01","family":"CORE","construct":"ENJOY","scale_type":"A","scenario":"自由に使える5万円があります。長く手元に残る欲しいモノを買うことも、以前から行きたかった旅行などの体験に使うこともできます。どちらも同じくらい魅力的です。","prompt":"モノよりも、体験の方にお金を使いやすいですか？","contract":"物質的消費と経験的消費。","behavior_options":""},
  {"item_id":"E02","family":"CORE","construct":"ENJOY","scale_type":"A","scenario":"休日のお金として2万円があります。自分の部屋で使える欲しかったモノを買うことも、友人や大切な人との食事や遊びに使うこともできます。","prompt":"人と楽しく過ごす時間の方にお金を使いやすいですか？","contract":"共有体験への支出。","behavior_options":""},
  {"item_id":"E03","family":"CORE","construct":"ENJOY","scale_type":"A","scenario":"同じ価格で、基本機能もほぼ同じ商品が2つあります。一方は無難なデザインですが、もう一方は見た目や質感がとても魅力的で、使うたびに気分が上がりそうです。","prompt":"毎日の気分が上がりそうな方を選びやすいですか？","contract":"情動的・美的価値。","behavior_options":""},
  {"item_id":"E04","family":"CORE","construct":"ENJOY","scale_type":"A","scenario":"休日に一人で出かけ、数千円〜1万円ほど使いました。形に残るモノは何も買いませんでしたが、とても充実した楽しい時間を過ごせました。","prompt":"形に残るモノが何も残らなくても、「十分に良いお金の使い方だった」と心から思えますか？","contract":"形に残らない消費の事後肯定。","behavior_options":""},
  {"item_id":"E05","family":"CORE","construct":"ENJOY","scale_type":"A","scenario":"5万円を使うにあたり、数年間使える実用的な家具や家電を新調することも、一生記憶に残りそうな特別なイベントや旅行に使うこともできます。","prompt":"記憶に残る特別な体験の方を選びやすいですか？","contract":"長期記憶価値。","behavior_options":""},

  {"item_id":"S01","family":"CORE","construct":"SECURE","scale_type":"A","scenario":"生活費とは別に、手元に30万円の余裕があります。しばらく大きな支出の予定はありません。","prompt":"何かに使ったり運用に回したりするより、いざという時のためにすぐ引き出せる状態で普通預金などに置いておく方を選びやすいですか？","contract":"流動性選好・緊急資金。","behavior_options":""},
  {"item_id":"S02","family":"CORE","construct":"SECURE","scale_type":"A","scenario":"10万円を使う2つの選択肢があります。Aはうまくいけば20万円分の大きなリターンがありますが、外れると0になります。Bは確実に11万円分の小さなメリットが得られます。","prompt":"失敗の可能性があるAより、確実なBを選びやすいですか？","contract":"確実性選好。","behavior_options":""},
  {"item_id":"S03","family":"CORE","construct":"SECURE","scale_type":"A","scenario":"毎月利用するサービスで、月ごとの利用量によって「8千円〜1万2千円」に変動するプランと、何があっても「毎月1万円固定」のプランがあります。年間トータルの予想金額は同じです。","prompt":"変動するプランより、毎月一定額で読めるプランを選びやすいですか？","contract":"予測可能性の選好。","behavior_options":""},
  {"item_id":"S04","family":"CORE","construct":"SECURE","scale_type":"A","scenario":"手元の資金を一時的に預ける選択肢があります。Aはいつでも引き出せますが条件は普通です。Bは条件が少し良くなりますが、契約すると1年間は途中解約や引き出しができません。","prompt":"条件が良くても、一定期間お金を動かせなくなる選択肢は避けたいですか？","contract":"資金拘束への嫌悪感。","behavior_options":""},
  {"item_id":"S05","family":"CORE","construct":"SECURE","scale_type":"A","scenario":"内容が非常に魅力的な定期サービスがあります。1年契約にすると月額が大幅に安くなりますが、途中で解約しても返金はありません。","prompt":"割高でも、いつでもやめられる通常プランの方を選びやすいですか？","contract":"割引と自由度の拮抗。","behavior_options":""},

  {"item_id":"O01","family":"CORE","construct":"OPTIMIZE","scale_type":"A","scenario":"2万円の商品と3万円の商品があります。3万円の方が耐久性は高いですが、自分の使う頻度を考えると2万円のものでも壊れる前に買い換える可能性があります。","prompt":"それでも、より長持ちする3万円の方を選びやすいですか？","contract":"過剰耐久への投資と適正寿命の拮抗。","behavior_options":""},
  {"item_id":"O02","family":"CORE","construct":"OPTIMIZE","scale_type":"A","scenario":"日用品や食品で、大容量パックは1個あたりの単価がかなり割安です。ただし、最後まで全部使い切れるかは分かりません。","prompt":"単価が安くても、使い切れずに余らせるリスクがあるなら、少し割高でも使い切れる通常サイズを選びやすいですか？","contract":"廃棄・ロス回避。","behavior_options":""},
  {"item_id":"O03","family":"CORE","construct":"OPTIMIZE","scale_type":"A","scenario":"月額500円のサービスがあります。最近あまり使っていませんが、たまに必要になる瞬間があり、解約すると再設定の手間がかかります。","prompt":"金額が小さくても、使っていない期間があるなら一旦解約する方を選びやすいですか？","contract":"少額の無駄と再契約の手間の拮抗。","behavior_options":""},
  {"item_id":"O04","family":"CORE","construct":"OPTIMIZE","scale_type":"A","scenario":"5,000円の商品は今の必要最低限の機能を満たしています。8,000円の商品は使い勝手が良く長く使えそうですが、今の用途には少しオーバースペックです。","prompt":"3,000円多く払ってでも、余裕を持った8,000円の方を選びやすいですか？","contract":"必要十分と上乗せ価値の拮抗。","behavior_options":""},
  {"item_id":"O05","family":"CORE","construct":"OPTIMIZE","scale_type":"A","scenario":"ソフトウェアやサービスで、すべての機能が入った月4,000円のプランと、自分に必要な機能だけに絞られた月3,000円のプランがあります。","prompt":"差額が1,000円なら、機能が少なくても自分に必要なものだけの3,000円プランを選びやすいですか？","contract":"不要機能を省く最適化。","behavior_options":""},

  {"item_id":"SW01","family":"SWITCH","construct":"SWITCH_TIME","scale_type":"","scenario":"","prompt":"","contract":"日常の余剰。今の快適さ vs 3か月後の楽しみ。","text":"普段の家計のやりくりの中で、今月は予定外に3万円が浮きました。\nA：いま使っている日用品や家電を買い替えて、毎日の生活を少し快適にする\nB：3か月後に予定している楽しみのために、手をつけず残しておく","behavior_options":""},
  {"item_id":"SW02","family":"SWITCH","construct":"SWITCH_TIME","scale_type":"","scenario":"","prompt":"","contract":"旅先の余剰。今ここ vs 次の楽しみ。","text":"旅行中、あらかじめ設定していた旅費の予算が2万円余りました。\nA：今回の旅行の食事や宿を少し豪華にして、今ここで使い切る\nB：3か月後にも別の楽しみがあるので、そのために残しておく","behavior_options":""},
  {"item_id":"SW03","family":"SWITCH","construct":"SWITCH_TIME","scale_type":"","scenario":"","prompt":"","contract":"臨時収入。欲しいモノ vs 近未来支払い。","text":"臨時収入として5万円が入りました。\nA：以前からずっと欲しかった3万円のモノを、この機会に買う\nB：3か月後に5万円前後の出費が予定されているので、その支払いに備えて残す","behavior_options":""},
  {"item_id":"SW04","family":"SWITCH","construct":"SWITCH_TIME","scale_type":"","scenario":"","prompt":"","contract":"自己投資の回収期間。","text":"同じ5万円を使って、自分のための学習やツールに投資します。\nA：すぐに実践でき、3か月以内に効果や成果を実感しやすい方\nB：実感できるまで時間はかかるが、1〜2年以上先まで長く役立ち続ける方","behavior_options":""},
  {"item_id":"SW05","family":"SWITCH","construct":"SWITCH_DECISION","scale_type":"","scenario":"","prompt":"","contract":"少額・日常での決定様式。SW06と選択肢完全一致。","text":"普段の生活で使う数千円〜1万円程度の日用品を2つまで絞り込みました。どちらも予算内です。\nA：自分にしっくりくる方を選ぶ\nB：条件を比較して納得できる方を選ぶ","behavior_options":""},
  {"item_id":"SW06","family":"SWITCH","construct":"SWITCH_DECISION","scale_type":"","scenario":"","prompt":"","contract":"高額・重要での決定様式。SW05と選択肢完全一致。","text":"数十万円かかる大きな買い物や長期契約を2つまで絞り込みました。どちらも予算内です。\nA：自分にしっくりくる方を選ぶ\nB：条件を比較して納得できる方を選ぶ","behavior_options":""},

  {"item_id":"B01","family":"BEHAVIOR","construct":"BEHAVIOR","scale_type":"","scenario":"","prompt":"","contract":"同日複数回確認のノイズを避けるため回数ではなく日数。","text":"過去30日間で、銀行口座の残高やクレジットカードの利用明細を、自分から意識して確認した日は合計で何日くらいありましたか？","behavior_options":"0日 / 1日 / 2〜3日 / 4〜7日 / 8〜15日 / 16日以上"},
  {"item_id":"B02","family":"BEHAVIOR","construct":"BEHAVIOR","scale_type":"","scenario":"","prompt":"","contract":"自動積立を含む仕組み化の実態。","text":"過去6か月のうち、収入が入ったあと「使う前に」貯蓄・積立・投資へお金が回った月はいくつありましたか？（※給与天引きや口座からの自動積立も含みます）","behavior_options":"0か月 / 1か月 / 2〜3か月 / 4〜5か月 / 6か月すべて"},
  {"item_id":"B03","family":"BEHAVIOR","construct":"BEHAVIOR","scale_type":"","scenario":"","prompt":"","contract":"計画外3,000円以上。閾値はCognitive Pilotで確認。","text":"過去30日間で、出かける前やサイトを見る前には「買う予定がなかった3,000円以上の買い物」を、その場の判断で購入した回数はどれくらいですか？","behavior_options":"0回 / 1回 / 2〜3回 / 4〜5回 / 6回以上"},
  {"item_id":"B04","family":"BEHAVIOR","construct":"BEHAVIOR","scale_type":"","scenario":"","prompt":"","contract":"検討ではなく完了した見直し件数。","text":"過去12か月間で、スマートフォン等の通信費、サブスク、保険、電気代などの固定費について、実際に「解約・プラン変更・他社への乗り換え」まで完了させた件数はいくつありますか？","behavior_options":"0件 / 1件 / 2件 / 3件 / 4件以上"}
] as const;

export const OMISSION_ALLOCATION = {
  A:{FUTURE:"F01",IMMEDIATE:"I03",INTUITION:"N02",DELIBERATION:"D05",MONITORING:"M03",PERIODIC:"P05",DRIVE:"R04",ENJOY:"E03",SECURE:"S03",OPTIMIZE:"O03"},
  B:{FUTURE:"F04",IMMEDIATE:"I04",INTUITION:"N01",DELIBERATION:"D02",MONITORING:"M01",PERIODIC:"P01",DRIVE:"R03",ENJOY:"E04",SECURE:"S05",OPTIMIZE:"O04"},
  C:{FUTURE:"F03",IMMEDIATE:"I02",INTUITION:"N03",DELIBERATION:"D03",MONITORING:"M02",PERIODIC:"P02",DRIVE:"R05",ENJOY:"E02",SECURE:"S02",OPTIMIZE:"O02"},
  D:{FUTURE:"F05",IMMEDIATE:"I01",INTUITION:"N05",DELIBERATION:"D04",MONITORING:"M04",PERIODIC:"P04",DRIVE:"R01",ENJOY:"E01",SECURE:"S01",OPTIMIZE:"O01"},
  E:{FUTURE:"F02",IMMEDIATE:"I05",INTUITION:"N04",DELIBERATION:"D01",MONITORING:"M05",PERIODIC:"P03",DRIVE:"R02",ENJOY:"E05",SECURE:"S04",OPTIMIZE:"O05"}
} as const;

export const FIXED_SWITCHES = ["SW01","SW02","SW03","SW04","SW05","SW06"] as const;
export const FIXED_BEHAVIORS = ["B01","B02","B03","B04"] as const;
