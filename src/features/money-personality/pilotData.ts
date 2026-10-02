export const PILOT_VERSION = "V4.5_PILOT_CANDIDATE_FROZEN" as const;

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
  {item_id:"F01",family:"BIPOLAR",factor:"FUTURE",scenario:"手元にすぐ使う予定のないお金があります。今のところ明確な使い道はありません。",option_a:"必要になったとき、その時点で使い道を決める",option_b:"まだ使い道が決まっていなくても、先のための枠を先に作っておく",trait_pole:"B"},
  {item_id:"F02",family:"BIPOLAR",factor:"FUTURE",scenario:"数か月後に楽しみにしている予定があります。まだ少し先のことです。",option_a:"時期が近づいてから、そのときの財布の状況に合わせてやりくりする",option_b:"そのとき十分楽しめるよう、今から少しずつ使える枠を準備しておく",trait_pole:"B"},
  {item_id:"F03",family:"BIPOLAR",factor:"FUTURE",scenario:"数か月後にまとまった支払いがあると分かっています。まだ期日までは余裕があります。",option_a:"支払期日が近づいたタイミングで、全体のやりくりを調整して工面する",option_b:"期日に関わらず、あらかじめその支払いの分を取り分けて手元から切り離しておく",trait_pole:"B"},
  {item_id:"F04",family:"BIPOLAR",factor:"FUTURE",scenario:"普段の生活の中で、想定より少し支出が浮いて手元にゆとりができました。",option_a:"今後の生活費の余裕として、そのまま持っておく",option_b:"先々のための分として、使わない枠をあらかじめ作っておく",trait_pole:"B"},
  {item_id:"F05",family:"BIPOLAR",factor:"FUTURE",scenario:"今あらかじめ手元に残しておけば、半年後や1年後に「やりたいこと」ができたとき、すぐに動ける選択肢を持てます。",option_a:"先のことはその時にならないと分からないので、先回りした確保はあまり意識しない",option_b:"使うあてがまだ具体的でなくても、「後で動ける自由」をあらかじめ確保しておきたい",trait_pole:"B"},

  {item_id:"I01",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"今このタイミングでしか参加できない魅力的なイベントや機会があります。見送っても生活には困りません。",option_a:"今回は見送り、別の機会を待つ",option_b:"今しかない機会なら、今回のタイミングで選ぶ",trait_pole:"B"},
  {item_id:"I02",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"日々の生活や作業の快適さをすぐに底上げしてくれる、良さそうなアイテムや工夫を見つけました。",option_a:"現状でも特に致命的な不便はないので、そのまま今の状態で過ごす",option_b:"今の生活がすぐに快適になるなら、取り入れて生活を良くする",trait_pole:"B"},
  {item_id:"I03",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"欲しいものがあります。「今すぐ手に入れる」ことも、「しばらく様子を見てから手に入れる」こともできます。",option_a:"しばらく様子を見てから決める",option_b:"欲しいと思った今のタイミングで手に入れる",trait_pole:"B"},
  {item_id:"I04",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"休日に、今しか参加できない魅力的な誘いがあります。一方で、予定を入れず自分のペースでゆっくり過ごすのも魅力的です。",option_a:"予定を入れず、自分の時間をゆっくり過ごす",option_b:"今しかない誘いなら、その機会を選ぶ",trait_pole:"B"},
  {item_id:"I05",family:"BIPOLAR",factor:"IMMEDIATE",scenario:"普段より少しお金にゆとりができたとき、ふと頭に浮かぶ最初の感覚として。",option_a:"特に用途を決めず、そのまま余裕として持っておく",option_b:"まず「今使うなら何に使うか」を考える",trait_pole:"B"},

  {item_id:"N01",family:"BIPOLAR",factor:"INTUITION",scenario:"いくつか候補を見る中で、最初に見た瞬間から「これが良さそう」と感じたものがあります。",option_a:"最初の印象に引っ張られず、候補全体を一通り見てから決める",option_b:"最初に感じた「これが良さそう」という印象を大切にして決める",trait_pole:"B"},
  {item_id:"N02",family:"BIPOLAR",factor:"INTUITION",scenario:"口コミや周囲の評価では評判の良い選択肢があります。一方で、自分には別の方がしっくりきます。",option_a:"多くの人が評価している客観的な安心感の方を選ぶ",option_b:"理由はうまく言えなくても、自分がしっくりくる方を選ぶ",trait_pole:"B"},
  {item_id:"N03",family:"BIPOLAR",factor:"INTUITION",scenario:"条件だけを見ると大きな差はありませんが、一方にだけ「なんとなく自分に合う」と感じます。",option_a:"根拠を言葉で説明しにくい感覚なら、決め手にはしない",option_b:"理由をうまく説明できなくても、その感覚を決め手にする",trait_pole:"B"},
  {item_id:"N04",family:"BIPOLAR",factor:"INTUITION",scenario:"条件上は特に問題が見当たらないのに、なぜか少し引っかかる選択肢があります。",option_a:"条件に問題がないなら、感覚的な引っかかりだけでは見送らない",option_b:"はっきりした理由がなくても、その違和感を重視して見送る",trait_pole:"B"},
  {item_id:"N05",family:"BIPOLAR",factor:"INTUITION",scenario:"十分に調べても、最後の2つに明確な差が見つかりません。これ以上調べても新しい情報は出そうにありません。",option_a:"わずかなスペック差や価格など、目に見える数字で割り切って決める",option_b:"最後は数字ではなく、自分の感覚やフィーリングで決める",trait_pole:"B"},

  {item_id:"D01",family:"BIPOLAR",factor:"DELIBERATION",scenario:"魅力的な選択肢が見つかり、今決めても特に問題はなさそうです。今日中に決める必要はありません。",option_a:"十分良さそうなら、その場で決めて次の行動に進む",option_b:"その場では決めず、ほかの候補と並べて確認してから決める",trait_pole:"B"},
  {item_id:"D02",family:"BIPOLAR",factor:"DELIBERATION",scenario:"サービスの大まかな内容には納得しています。ただ、細かい利用条件や特則までは確認しきれていません。",option_a:"大枠で納得できていて実用上問題なさそうなら、そのまま進める",option_b:"細かい条件や気になる点まで確認してから進める",trait_pole:"B"},
  {item_id:"D03",family:"BIPOLAR",factor:"DELIBERATION",scenario:"かなり欲しいものがあり、「もうこれで決まりだ」と気持ちが高まっています。",option_a:"気持ちが十分に高まっている今の勢いを大切にして決める",option_b:"買う前に一度、良い点と気になる点を頭の中で整理してから決める",trait_pole:"B"},
  {item_id:"D04",family:"BIPOLAR",factor:"DELIBERATION",scenario:"最初に見つけた選択肢がかなり良さそうです。他の候補はまだ探していません。",option_a:"すでに十分な水準なら、余計な手間をかけずこれに決める",option_b:"念のため、ほかにどんな選択肢があるか一度確認してから決める",trait_pole:"B"},
  {item_id:"D05",family:"BIPOLAR",factor:"DELIBERATION",scenario:"それぞれ違った魅力や特徴を持つ複数の候補で迷っています。",option_a:"全体の雰囲気を見ながら、その場で一番良さそうなものを選ぶ",option_b:"「自分にとって何が一番大切か」の基準を整理してから選ぶ",trait_pole:"B"},

  {item_id:"R01",family:"BIPOLAR",factor:"DRIVE",scenario:"手元に自由に使えるお金があります。どちらも魅力的な使い道です。",option_a:"いまの暮らしを確実に快適にするものに使う",option_b:"自分のできることを広げる学びに使う",trait_pole:"B"},
  {item_id:"R02",family:"BIPOLAR",factor:"DRIVE",scenario:"自分で時間をかければやり切れますが、進度を大きく早められる有料ツールや外部サービスがあります。",option_a:"費用をかけず、自分の工夫と時間をかけてやり切る",option_b:"時間を大幅に短縮できるなら、費用を払って取り入れる",trait_pole:"B"},
  {item_id:"R03",family:"BIPOLAR",factor:"DRIVE",scenario:"手元にまとまったゆとり資金ができました。生活や備えには特に困っていません。",option_a:"日常の余暇や休日の手堅いリフレッシュに使う",option_b:"新しい活動や、これから挑戦したいことの準備に回す",trait_pole:"B"},
  {item_id:"R04",family:"BIPOLAR",factor:"DRIVE",scenario:"今の自分に役立つ使い道と、新しくできることを増やせそうな使い道があります。",option_a:"今すでに役立つことが分かっている方に使う",option_b:"新しくできることを増やす方に使う",trait_pole:"B"},
  {item_id:"R05",family:"BIPOLAR",factor:"DRIVE",scenario:"休日にお金と時間を使う使い道として、2つの選択肢があります。",option_a:"慣れた過ごし方で心身をしっかりリフレッシュする",option_b:"これまでやったことのない活動や環境を試してみる",trait_pole:"B"},

  {item_id:"E01",family:"BIPOLAR",factor:"ENJOY",scenario:"自由に使える予算があります。どちらも同じくらい魅力的です。",option_a:"日常で長く手元に残って役立つ実用品を買う",option_b:"手元にモノは残らなくても、心から楽しめる体験に使う",trait_pole:"B"},
  {item_id:"E02",family:"BIPOLAR",factor:"ENJOY",scenario:"休日のお金として使える予算があります。",option_a:"長く使える自分用のモノを買う",option_b:"一人でも誰かとでも、心から楽しめる時間に使う",trait_pole:"B"},
  {item_id:"E03",family:"BIPOLAR",factor:"ENJOY",scenario:"同じ価格で、基本性能も同等のアイテムが2つあります。一方は無難で飽きがこない作り、もう一方は使うたびに気分が高まりそうなデザインです。",option_a:"飽きずに長く使い続けられそうな無難な方を選ぶ",option_b:"毎日の気分が上がって嬉しくなる方を選ぶ",trait_pole:"B"},
  {item_id:"E04",family:"BIPOLAR",factor:"ENJOY",scenario:"休日に出かけてお金を使いました。形に残る買い物はしませんでしたが、とても充実した時間を過ごせました。",option_a:"形に残るモノを買ったときの方が、納得感を感じやすい",option_b:"モノが何も残らなくても、それ自体で十分に良いお金の使い方だと感じる",trait_pole:"B"},
  {item_id:"E05",family:"BIPOLAR",factor:"ENJOY",scenario:"まとまったお金を使う機会があります。",option_a:"何年も使える実用的なものを新調する",option_b:"長く記憶に残りそうな特別な体験に使う",trait_pole:"B"},

  {item_id:"S01",family:"BIPOLAR",factor:"SECURE",scenario:"手元の資金を預ける選択肢があります。",option_a:"条件が良くなるなら、一定期間引き出せない縛りがあっても構わない",option_b:"条件が普通でも、必要なときにいつでも引き出せる状態にしておきたい",trait_pole:"B"},
  {item_id:"S02",family:"BIPOLAR",factor:"SECURE",scenario:"お金の使い道で2つの選択肢があります。",option_a:"振れ幅は大きいが、うまくいけば大きなメリットがある方を選ぶ",option_b:"得られるメリットは小さくても、結果が確実に読める方を選ぶ",trait_pole:"B"},
  {item_id:"S03",family:"BIPOLAR",factor:"SECURE",scenario:"利用料のプランを2つから選びます。年間の支払い総額の見込みはほぼ同じです。",option_a:"多少上下しても、安く済む月がある変動プランを選ぶ",option_b:"毎月の支払いが一定で、支出の予測が立ちやすい定額プランを選ぶ",trait_pole:"B"},
  {item_id:"S04",family:"BIPOLAR",factor:"SECURE",scenario:"魅力的な定期サービスがあります。",option_a:"途中で解約できなくても、月額が大幅に安くなる年間契約を選ぶ",option_b:"多少割高でも、いつでもやめられる月々払いの契約を選ぶ",trait_pole:"B"},
  {item_id:"S05",family:"BIPOLAR",factor:"SECURE",scenario:"生活に必要な分とは別に、お金の余裕があります。",option_a:"当面使う予定がないなら、何か有効な使い道に回す",option_b:"特に使い道がなくても、余裕として手元に残しておく",trait_pole:"B"},

  {item_id:"O01",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"必要な機能に絞られた低価格プランと、すべての機能が入った上位プランがあります。",option_a:"後から足りなくなるよりは、余裕を持って全機能プランを選ぶ",option_b:"使わない機能には払わず、自分に必要な機能だけのプランを選ぶ",trait_pole:"B"},
  {item_id:"O02",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"まとめ買いすると1個あたりの単価は割安ですが、最後まで使い切れるかは分かりません。",option_a:"単価が安くお得なら、多少余るリスクがあってもまとめ買いを選ぶ",option_b:"単価が多少割高でも、確実に使い切れる通常サイズを選ぶ",trait_pole:"B"},
  {item_id:"O03",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"月額数百円のサービスがあります。最近あまり使っていませんが、たまに必要になる瞬間があり、解約・再登録には少し手間がかかります。",option_a:"金額が小さくたまに使うなら、そのまま契約を残しておく",option_b:"使っていない期間があるなら、手間がかかっても一度解約する",trait_pole:"B"},
  {item_id:"O04",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"価格が手頃な商品と、高価格な商品で迷っています。",option_a:"今の出費を抑えられる手頃な方を選ぶ",option_b:"少し高くても、使う期間や回数まで考えると割に合いそうな方を選ぶ",trait_pole:"B"},
  {item_id:"O05",family:"BIPOLAR",factor:"OPTIMIZE",scenario:"今の用途には十分な通常モデルと、少し高額ですがスペックにゆとりのある上位モデルがあります。",option_a:"余裕を持たせるため、少し高くてもスペックが上のモデルを選ぶ",option_b:"今の自分の用途に十分なら、無駄な機能のない通常モデルを選ぶ",trait_pole:"B"},

  {item_id:"M01",family:"LIKERT",factor:"MONITORING",prompt:"今、「今月あとどのくらい自由に使えそう？」と不意に聞かれたら、明細やアプリを開かなくても大体の金額が分かりますか？"},
  {item_id:"M02",family:"LIKERT",factor:"MONITORING",prompt:"毎月ほぼ決まって出ていく固定費の合計が月にどのくらいか、ざっくり頭に入っていますか？"},
  {item_id:"M03",family:"LIKERT",factor:"MONITORING",prompt:"月の途中で支払いが重なっているとき、今月の支出ペースが普段より速いか遅いか感覚で分かりますか？"},
  {item_id:"M04",family:"LIKERT",factor:"MONITORING",prompt:"普段より支出が増えている月、月末の請求を見る前に「今月はいつもより使っている」と途中で気づくことが多いですか？"},
  {item_id:"M05",family:"LIKERT",factor:"MONITORING",prompt:"直近1週間の支出について聞かれたら、大きめの支出なら履歴を見なくても大体思い出せますか？"},

  {item_id:"P01",family:"LIKERT",factor:"PERIODIC",prompt:"給料日や支払日とは別に、自分で「週1回」「隔週」など確認するタイミングを決めてお金を確認していますか？"},
  {item_id:"P02",family:"LIKERT",factor:"PERIODIC",prompt:"給料日、カード支払日、月末などの区切りの日に合わせて、残高や支出を確認することが多いですか？"},
  {item_id:"P03",family:"LIKERT",factor:"PERIODIC",prompt:"大きな買い物や旅行などの予定の前後など、イベントの節目に合わせて残高や明細を確認することが多いですか？"},
  {item_id:"P04",family:"LIKERT",factor:"PERIODIC",prompt:"カードや家計簿アプリの通知はその都度見るより、週末や月末などにまとめて確認することが多いですか？"},
  {item_id:"P05",family:"LIKERT",factor:"PERIODIC",prompt:"月の途中では細かく見ず、月末や月初などの区切りで1か月分をまとめて振り返ることが多いですか？"},

  {item_id:"B01",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去30日間で、銀行口座やカード明細を自分から意識して確認した日は合計で何日くらいありましたか？",behavior_options:["0日","1日","2〜3日","4〜7日","8〜15日","16日以上"]},
  {item_id:"B02",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去6か月のうち、収入が入ったあと「使う前に」貯蓄・積立・投資へお金が回った月はいくつありましたか？（※自動積立・天引き含む）",behavior_options:["0か月","1か月","2〜3か月","4〜5か月","6か月すべて"]},
  {item_id:"B03",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去30日間で、事前には買う予定がなかった3,000円以上の買い物を、その場の判断で購入した回数はどれくらいですか？",behavior_options:["0回","1回","2〜3回","4〜5回","6回以上"]},
  {item_id:"B04",family:"BEHAVIOR",factor:"BEHAVIOR",prompt:"過去12か月間で、通信費・サブスク・保険・電気代などの固定費について、実際に「解約・プラン変更・乗り換え」まで完了させた件数はいくつありますか？",behavior_options:["0件","1件","2件","3件","4件以上"]},
] as const;

export const BIPOLAR_FACTORS = ["FUTURE","IMMEDIATE","INTUITION","DELIBERATION","DRIVE","ENJOY","SECURE","OPTIMIZE"] as const;
export const LIKERT_FACTORS = ["MONITORING","PERIODIC"] as const;
