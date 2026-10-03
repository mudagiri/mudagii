export const PILOT_VERSION = "V4.5_2_PILOT_CANDIDATE_FROZEN" as const;

export const BIPOLAR_SCALE_LABELS = [
  "左にかなり近い",
  "やや左に近い",
  "どちらともいえない",
  "やや右に近い",
  "右にかなり近い",
] as const;

export const LIKERT_SCALE_LABELS = [
  "まったく当てはまらない",
  "あまり当てはまらない",
  "どちらともいえない",
  "だいたい当てはまる",
  "かなり当てはまる",
] as const;

export const PILOT_ITEMS = [
  {item_id:"F01",family:"BIPOLAR",factor:"FUTURE",scenario:"今すぐ使う予定のないお金があります。",option_a:"普段のお金と一緒にして、必要になったときに使う",option_b:"使わない分として、先に分けておく",trait_pole:"B"},
  {item_id:"F02",family:"BIPOLAR",factor:"FUTURE",scenario:"数か月後に、お金を使う予定があります。",option_a:"予定が近づいてから、出費を調整して用意する",option_b:"今から少しずつ、その予定の分を取り分けておく",trait_pole:"B"},
  {item_id:"F03",family:"BIPOLAR",factor:"FUTURE",scenario:"数か月後に、まとまったお金が必要になるかもしれません。まだ確定はしていません。",option_a:"必要だと決まってから用意する",option_b:"必要になる可能性を考えて、今から一部を残しておく",trait_pole:"B"},
  {item_id:"F04",family:"BIPOLAR",factor:"FUTURE",scenario:"予定していたよりお金を使わずに済み、少し残りました。",option_a:"次の生活費にそのまま回す",option_b:"一部を先のためのお金に回す",trait_pole:"B"},
  {item_id:"F05",family:"BIPOLAR",factor:"FUTURE",scenario:"欲しいものがあり、今月の支払いだけなら無理なく買えます。",option_a:"今月無理なく払えるなら、それを基準に考える",option_b:"この先の予定まで含めて余裕が残るかも考える",trait_pole:"B"},

  {item_id:"I01",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"今しか参加できない魅力的な予定があります。一方、もともと楽しみにしていた自分の時間もあります。",option_a:"もともとの自分の時間を優先する",option_b:"今しかない予定の方を選ぶ",trait_pole:"B"},
  {item_id:"I02",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"今のやり方でも困ってはいませんが、すぐ快適になる方法を見つけました。",option_a:"今のやり方で十分なので、そのまま続ける",option_b:"今から快適になるなら、新しい方法を取り入れる",trait_pole:"B"},
  {item_id:"I03",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"欲しいものがあります。今買っても、しばらく後に買っても条件はほぼ変わりません。",option_a:"急がず、必要になったタイミングで買う",option_b:"使い始められるなら、今のタイミングで買う",trait_pole:"B"},
  {item_id:"I04",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"予定がなくなり、半日自由な時間ができました。",option_a:"予定を入れず、そのままゆっくり過ごす",option_b:"せっかく空いたなら、やりたかったことに使う",trait_pole:"B"},
  {item_id:"I05",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"今月、自由に使えるお金が少し増えました。",option_a:"特に使い道を決めず、余裕として持っておく",option_b:"今できることや楽しめることを考える",trait_pole:"B"},

  {item_id:"N01",family:"BIPOLAR",factor:"INTUITION",scenario:"いくつか候補を見ました。条件はどれも十分ですが、最初から「これが良さそう」と感じているものがあります。",option_a:"最後は具体的な特徴を比べて決める",option_b:"最初から感じている「これが良さそう」を決め手にする",trait_pole:"B"},
  {item_id:"N02",family:"BIPOLAR",factor:"INTUITION",scenario:"評判が良いものと、自分にはしっくりくるものが別です。",option_a:"多くの人から評価されている方を選ぶ",option_b:"自分にしっくりくる方を選ぶ",trait_pole:"B"},
  {item_id:"N03",family:"BIPOLAR",factor:"INTUITION",scenario:"2つとも条件は十分です。一方だけ、理由は説明しにくいけれど自分に合う感じがします。",option_a:"言葉で説明できる理由を重視する",option_b:"言葉にしにくい「合う感じ」を重視する",trait_pole:"B"},
  {item_id:"N04",family:"BIPOLAR",factor:"INTUITION",scenario:"条件には問題がないのに、なぜか少し引っかかります。",option_a:"条件に問題がなければ、そのまま候補に残す",option_b:"理由が分からなくても、その違和感を重視する",trait_pole:"B"},
  {item_id:"N05",family:"BIPOLAR",factor:"INTUITION",scenario:"十分比較しても、最後の2つにほとんど差がありません。",option_a:"価格やスペックなど、目に見える違いで決める",option_b:"最後は自分の感覚で決める",trait_pole:"B"},

  {item_id:"D01",family:"BIPOLAR",factor:"DELIBERATION",scenario:"候補がいくつかあり、どれも必要な条件は満たしています。",option_a:"十分良いものがあれば、そこで決める",option_b:"候補を一度並べてから決める",trait_pole:"B"},
  {item_id:"D02",family:"BIPOLAR",factor:"DELIBERATION",scenario:"サービスの大まかな内容には納得しています。",option_a:"実際に使う上で問題なさそうなら進める",option_b:"細かい条件も確認してから進める",trait_pole:"B"},
  {item_id:"D03",family:"BIPOLAR",factor:"DELIBERATION",scenario:"かなり欲しいものがあり、自分の中ではほぼ決まっています。",option_a:"十分欲しいと思えているなら、その判断で決める",option_b:"一度、良い点と気になる点を整理してから決める",trait_pole:"B"},
  {item_id:"D04",family:"BIPOLAR",factor:"DELIBERATION",scenario:"最初に見つけたものが、求めていた条件を十分満たしています。",option_a:"条件を満たしているなら、それ以上探さず決める",option_b:"ほかにも候補がないか確認してから決める",trait_pole:"B"},
  {item_id:"D05",family:"BIPOLAR",factor:"DELIBERATION",scenario:"違った良さを持つ候補で迷っています。",option_a:"全体を見て、一番良いと感じるものを選ぶ",option_b:"自分が何を重視するか整理してから選ぶ",trait_pole:"B"},

  {item_id:"R01",family:"BIPOLAR",factor:"DRIVE",scenario:"自由に使えるお金があります。",option_a:"今の生活を便利にすることに使う",option_b:"今後できることを増やす学びに使う",trait_pole:"B"},
  {item_id:"R02",family:"BIPOLAR",factor:"DRIVE",scenario:"自分で時間をかければできますが、早く進められる有料サービスがあります。",option_a:"自分のやり方で時間をかけて進める",option_b:"早く進めるためにお金を使う",trait_pole:"B"},
  {item_id:"R03",family:"BIPOLAR",factor:"DRIVE",scenario:"趣味や活動に使える余裕があります。",option_a:"今すでにやっていることを、もっと充実させる",option_b:"これまでやっていなかったことを始める",trait_pole:"B"},
  {item_id:"R04",family:"BIPOLAR",factor:"DRIVE",scenario:"どちらも自分に役立つ使い道です。",option_a:"今やっていることを、もっとやりやすくする方を選ぶ",option_b:"今までできなかったことが、できるようになる方を選ぶ",trait_pole:"B"},
  {item_id:"R05",family:"BIPOLAR",factor:"DRIVE",scenario:"まとまった自由時間ができました。",option_a:"心身を整えたり、好きなことをして過ごす",option_b:"自分が進めたい目標に時間を使う",trait_pole:"B"},

  {item_id:"E01",family:"BIPOLAR",factor:"ENJOY",scenario:"自由に使える予算があります。",option_a:"長く使える実用品に使う",option_b:"心から楽しめる体験に使う",trait_pole:"B"},
  {item_id:"E02",family:"BIPOLAR",factor:"ENJOY",scenario:"休日に使えるお金があります。",option_a:"日常を便利にするものを買う",option_b:"好きなことを楽しむ時間に使う",trait_pole:"B"},
  {item_id:"E03",family:"BIPOLAR",factor:"ENJOY",scenario:"価格と基本性能が同じ2つの商品があります。",option_a:"飽きずに使いやすそうな方を選ぶ",option_b:"使うたびに気分が上がりそうな方を選ぶ",trait_pole:"B"},
  {item_id:"E04",family:"BIPOLAR",factor:"ENJOY",scenario:"お金を使って、とても楽しい時間を過ごしました。ただ、形に残るものはありません。",option_a:"同じ金額なら、何か形に残る方が満足しやすい",option_b:"楽しい時間だったなら、それだけで満足できる",trait_pole:"B"},
  {item_id:"E05",family:"BIPOLAR",factor:"ENJOY",scenario:"まとまったお金の使い道を考えています。",option_a:"何度も使えるものに使う",option_b:"一度でも強く記憶に残る体験に使う",trait_pole:"B"},

  {item_id:"S01",family:"BIPOLAR",factor:"SECURE",scenario:"お金を預ける2つの方法があります。",option_a:"少し条件が良い代わりに、しばらく動かせない方",option_b:"条件は普通でも、いつでも動かせる方",trait_pole:"B"},
  {item_id:"S02",family:"BIPOLAR",factor:"SECURE",scenario:"平均すると同じくらいのメリットが見込める2つの選択肢があります。",option_a:"結果によって、得られるメリットが大きく変わる方",option_b:"得られるメリットが、ほぼ一定の方",trait_pole:"B"},
  {item_id:"S03",family:"BIPOLAR",factor:"SECURE",scenario:"年間では同じくらいの支払いになる2つのプランがあります。",option_a:"月によって支払額が変わるプラン",option_b:"毎月ほぼ同じ金額のプラン",trait_pole:"B"},
  {item_id:"S04",family:"BIPOLAR",factor:"SECURE",scenario:"同じサービスに2つの契約方法があります。",option_a:"少し安い代わりに、途中でやめられない年間契約",option_b:"少し高い代わりに、いつでもやめられる月払い",trait_pole:"B"},
  {item_id:"S05",family:"BIPOLAR",factor:"SECURE",scenario:"生活に必要な分とは別に、お金の余裕があります。",option_a:"当面使わない分は、目的に合わせて活用する",option_b:"使い道がなくても、手元の余裕として残しておく",trait_pole:"B"},

  {item_id:"O01",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"必要な機能だけのプランと、全部入りのプランがあります。",option_a:"後で足りなくならないよう、全部入りを選ぶ",option_b:"今使う機能だけのプランを選ぶ",trait_pole:"B"},
  {item_id:"O02",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"大容量なら単価は安いですが、全部使うかは分かりません。",option_a:"単価が安い大容量を選ぶ",option_b:"少し割高でも、使い切れる量を選ぶ",trait_pole:"B"},
  {item_id:"O03",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"あまり使っていない月額サービスがあります。たまに使うことはあります。",option_a:"金額が小さいなら、そのまま残しておく",option_b:"使っていない期間が多いなら、一度やめる",trait_pole:"B"},
  {item_id:"O04",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"価格の違う2つの商品があります。",option_a:"買うときに払う金額を基準に選ぶ",option_b:"使う期間や回数あたりの金額まで考えて選ぶ",trait_pole:"B"},
  {item_id:"O05",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"今の用途には通常モデルで十分ですが、上位モデルなら将来の使い方にも対応できます。",option_a:"将来使う可能性も考えて、上位モデルを選ぶ",option_b:"今の用途に合っている通常モデルを選ぶ",trait_pole:"B"},

  {item_id:"M01",family:"LIKERT",factor:"MONITORING",prompt:"今、「今月あとどのくらい自由に使えそう？」と聞かれたら、明細やアプリを見なくても大体分かりますか？"},
  {item_id:"M02",family:"LIKERT",factor:"MONITORING",prompt:"毎月、固定費にだいたいいくら出ていくか、確認しなくても頭に入っていますか？"},
  {item_id:"M03",family:"LIKERT",factor:"MONITORING",prompt:"月の途中で、「今月はいつもよりお金を使うペースが速い・遅い」が感覚で分かりますか？"},
  {item_id:"M04",family:"LIKERT",factor:"MONITORING",prompt:"普段より出費が増えているとき、明細を確認する前に「今月はいつもより使ってるな」と気づくことがありますか？"},
  {item_id:"M05",family:"LIKERT",factor:"MONITORING",prompt:"今、「今月ここまでで、だいたいいくら使った？」と聞かれたら、履歴を見なくても大体答えられますか？"},

  {item_id:"P01",family:"LIKERT",factor:"PERIODIC",prompt:"「週1回」「隔週」など、自分で決めたタイミングでお金を確認する習慣がありますか？"},
  {item_id:"P02",family:"LIKERT",factor:"PERIODIC",prompt:"給料日やカードの支払日など、お金が動く区切りに合わせて残高や支出を確認しますか？"},
  {item_id:"P03",family:"LIKERT",factor:"PERIODIC",prompt:"旅行や大きな買い物など、お金を使う予定の前に残高や支出を確認しますか？"},
  {item_id:"P04",family:"LIKERT",factor:"PERIODIC",prompt:"週末などの区切りで、その週に使ったお金をまとめて確認することがありますか？"},
  {item_id:"P05",family:"LIKERT",factor:"PERIODIC",prompt:"月末や月初に、1か月でどのくらい使ったかをまとめて振り返りますか？"},

  {item_id:"B01",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去30日で、銀行口座やカードの利用状況を自分から確認した日は何日くらいありましたか？",behavior_options:["0日","1日","2〜3日","4〜7日","8〜15日","16日以上"]},
  {item_id:"B02",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去6か月のうち、収入が入ったあと、使う前に貯蓄・積立・投資へお金を回した月はいくつありましたか？（※自動積立・天引きも含む）",behavior_options:["0か月","1か月","2〜3か月","4〜5か月","6か月すべて"]},
  {item_id:"B03",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去30日で、買う予定ではなかったものを、その場で「欲しい」と思って買ったことは何回くらいありましたか？（※普段の食事や日用品など、日常的な買い物は除きます）",behavior_options:["0回","1回","2〜3回","4〜5回","6回以上"]},
  {item_id:"B04",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去12か月で、通信費・サブスク・保険などの固定費について「今のままでいいか」を自分から見直したことは何回くらいありましたか？",behavior_options:["0回","1回","2回","3回","4回以上"],behavior_followup:{prompt:"そのうち、実際に解約・プラン変更・乗り換えまでしたものはいくつありましたか？",options:["0件","1件","2件","3件","4件以上"]}},
] as const;

export const BIPOLAR_FACTORS = ["FUTURE","IMMEDIATE","INTUITION","DELIBERATION","DRIVE","ENJOY","SECURE","OPTIMIZE"] as const;
export const LIKERT_FACTORS = ["MONITORING","PERIODIC"] as const;
