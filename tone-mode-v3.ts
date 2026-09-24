export type ToneMode = 'gentle'|'serious'|'hell';

export const TONE_MODES = {
  gentle:{icon:'🌱',name:'やさしめ斬り',tagline:'現実は見る。でも傷は浅め。',choice:'現実は知りたい。でも優しくして。'},
  serious:{icon:'⚔️',name:'本気斬り',tagline:'言い訳ごと、ちゃんと斬る。',choice:'遠慮なく言って。',recommended:true},
  hell:{icon:'🔥',name:'地獄斬り',tagline:'ムダへの容赦なし。メンタル防具推奨。',choice:'ボコボコにしてください。'},
} as const;

export const MODE_COPY:Record<ToneMode,{start:string;defeat:string;spared:string;review:string;lineTitle:string;lineBody:string;lineCta:string}> = {
 gentle:{
  start:'了解。無理に削らず、見直せるところだけ一緒に探そう。',
  defeat:'ここは見直し候補。満足度を落とさず軽くできそうです。',
  spared:'これはちゃんと価値を感じている支出。今回は守ります。',
  review:'金額だけでは判断できません。中身を確認してから決めよう。',
  lineTitle:'判断が難しいところだけ、もう一段深く確認',
  lineBody:'自分でできる改善はそのまま実行。契約内容や目的まで見ないと判断できない項目だけ、無料レポートで整理します。',
  lineCta:'LINEで次の一手を確認する',
 },
 serious:{
  start:'了解。遠慮はしない。ただし、好きで使ってる金まで斬る気はない。',
  defeat:'これは満足のための支出じゃない。惰性なら、ちゃんと斬ろう。',
  spared:'高い。でもちゃんと価値がある。高いだけで斬るほど雑じゃない。',
  review:'ここは平均だけじゃ斬れない。中身を見て白黒つける。',
  lineTitle:'自分で斬れるところは出した。残りを仕分ける。',
  lineBody:'ここから先は平均値だけでは判断できない項目があります。自分で直せるものと、契約・目的まで確認すべきものを分けます。',
  lineCta:'残った敵の正体を確認する',
 },
 hell:{
  start:'了解。後悔しても知らん。ただし幸せな支出は無罪だ。ムダだけ処刑する。',
  defeat:'使ってない・後悔してる・惰性。それで払い続ける理由ある？ 処刑対象。',
  spared:'……高ぇ。だが幸せなら斬れねぇ。無罪。好きに使え。',
  review:'勢いで斬るな。中身も見ずに切るのは地獄じゃなく雑魚診断だ。要鑑定。',
  lineTitle:'☠️ まだ終わってません。',
  lineBody:'小さいムダを斬って満足するな。金額だけでは判断できない敵が残っています。契約内容・目的まで見て、斬るか残すか決めます。',
  lineCta:'逃げずに残りも確認する',
 }
};
