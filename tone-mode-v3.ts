export type ToneMode = 'gentle'|'serious'|'hell';

export const TONE_MODES = {
  gentle:{icon:'😇',name:'甘やかしムダギリ',tagline:'やさしく言って。傷つきたくない。',choice:'やさしく言って。傷つきたくない。'},
  serious:{icon:'⚔️',name:'正論ムダギリ',tagline:'数字でハッキリ言ってほしい。',choice:'数字でハッキリ言ってほしい。',recommended:true},
  hell:{icon:'💀',name:'地獄ムダギリ',tagline:'遠慮はいらない。全部言って。',choice:'遠慮はいらない。全部言って。'},
} as const;

export const MODE_COPY:Record<ToneMode,{start:string;defeat:string;spared:string;review:string;lineTitle:string;lineBody:string;lineCta:string}> = {
 gentle:{
  start:'大丈夫。一緒にムダだけ探そう！',
  defeat:'ここは少し見直せそう。一緒に確認してみよう！',
  spared:'これは大切にしている支出。無理に削らなくて大丈夫。',
  review:'まだムダとは決められないよ。中身を確認してから考えよう。',
  lineTitle:'次に確認することを1つだけ見よう',
  lineBody:'診断結果から、最初に確認したいポイントを1つ選びました。',
  lineCta:'LINEでNEXT QUESTを受け取る',
 },
 serious:{
  start:'良いものは守る。ムダだけ斬るぞ。',
  defeat:'改善余地あり。ここは数字で見直せる。',
  spared:'高くても価値があるなら守る。ムダとは別物だ。',
  review:'金額だけでは断定できない。中身を確認して判断する。',
  lineTitle:'診断は終わり。次は1つだけ動く。',
  lineBody:'最初に確認すべきポイントを、診断結果から1つに絞りました。',
  lineCta:'LINEでNEXT QUESTを受け取る',
 },
 hell:{
  start:'選んだな？ 後悔しても知らんぞ。',
  defeat:'ここは斬れる。惰性でエサ代を払い続けるな。',
  spared:'高くても大事なら無罪だ。幸せな支出まで斬るほど雑じゃない。',
  review:'中身も見ずに処刑するのは雑魚診断だ。まず正体を確認する。',
  lineTitle:'☠️ 見つけただけで満足するな。',
  lineBody:'最初に潰すポイントを1つ選んだ。次は実際に確認するぞ。',
  lineCta:'LINEでNEXT QUESTを受け取る',
 }
};
