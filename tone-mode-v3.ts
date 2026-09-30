export type ToneMode = 'gentle'|'serious'|'hell';

export const TONE_MODES = {
  gentle:{icon:'😇',name:'甘やかしムダギリ',tagline:'やさしく言って。傷つきたくない。',choice:'やさしく言って。傷つきたくない。'},
  serious:{icon:'⚔️',name:'正論ムダギリ',tagline:'数字でハッキリ言ってほしい。',choice:'数字でハッキリ言ってほしい。',recommended:true},
  hell:{icon:'💀',name:'地獄ムダギリ',tagline:'遠慮はいらない。全部言って。',choice:'遠慮はいらない。全部言って。'},
} as const;

export type ToneCopy = {
 start:string; scanCompleteTitle:string; scanCompleteBody:string;
 appraisalCompleteTitle:string; appraisalCompleteBody:string;
 battleIntroTitle:string; battleIntroBody:string;
 battleReady:string; battleAction:string; battleClear:string; battleBody:string;
 resultLead:string; defeat:string; spared:string; review:string;
 lineTitle:string; lineBody:string; lineCta:string;
};

export const MODE_COPY:Record<ToneMode,ToneCopy> = {
 gentle:{
  start:'大丈夫。一緒にムダだけ探そう！',
  scanCompleteTitle:'ここから、必要な支出をちゃんと守ろう。',
  scanCompleteBody:'平均より高くても、それだけでムダにはしないよ。使う理由まで見て、本当に見直せるところだけ探そう。',
  appraisalCompleteTitle:'仕分けできたよ。',
  appraisalCompleteBody:'大切な支出は守ったまま、少し見直せそうなところだけ残したよ。次はお金の使い方のクセを見てみよう。',
  battleIntroTitle:'見直しやすいところから確認しよう！',
  battleIntroBody:'全部を削らなくて大丈夫。今のあなたが確認しやすい順に見ていこう。',
  battleReady:'大丈夫。見直せそうなところだけ確認しよう。',
  battleAction:'ひとつずつ、やさしく仕分け中！',
  battleClear:'優先チェック完了！',
  battleBody:'必要な支出はそのまま。確認できた改善余地だけRESULTで見せるね。',
  resultLead:'おつかれさま！ 守る支出も含めて、あなたの家計を整理できたよ。',
  defeat:'ここは少し見直せそう。一緒に確認してみよう！',
  spared:'これは大切にしている支出。無理に削らなくて大丈夫。',
  review:'まだムダとは決められないよ。中身を確認してから考えよう。',
  lineTitle:'次に確認することを1つだけ見よう',
  lineBody:'診断結果から、最初に確認したいポイントを1つ選びました。',
  lineCta:'LINEでNEXT QUESTを受け取る',
 },
 serious:{
  start:'良いものは守る。ムダだけ斬るぞ。',
  scanCompleteTitle:'……まだ斬るな。',
  scanCompleteBody:'敵がいる＝ムダではない。比較差と必要性を分けて、本当に見直せる支出だけ判定する。',
  appraisalCompleteTitle:'鑑定完了。',
  appraisalCompleteBody:'高いだけの支出は斬らない。守る支出と見直す候補を分けた。次はお金のクセを解析する。',
  battleIntroTitle:'見直しクエストを特定！',
  battleIntroBody:'金額だけでは斬らない。回答と根拠がそろった優先項目から確認する。',
  battleReady:'見直すべき相手は見えた。',
  battleAction:'優先順位をロックするぞ！',
  battleClear:'優先チェック完了！',
  battleBody:'判定理由と、確定できた改善額だけをRESULTで開示する。',
  resultLead:'判定完了。比較差と、本当に確認できた改善余地は分けて見るぞ。',
  defeat:'改善余地あり。ここは数字で見直せる。',
  spared:'高くても価値があるなら守る。ムダとは別物だ。',
  review:'金額だけでは断定できない。中身を確認して判断する。',
  lineTitle:'診断は終わり。次は1つだけ動く。',
  lineBody:'最初に確認すべきポイントを、診断結果から1つに絞りました。',
  lineCta:'LINEでNEXT QUESTを受け取る',
 },
 hell:{
  start:'選んだな？ 後悔しても知らんぞ。',
  scanCompleteTitle:'待て。まだ処刑するな。',
  scanCompleteBody:'平均超えを全部ムダ扱いするのは雑魚診断だ。必要な金は生かす。惰性で消えてる金だけ炙り出すぞ。',
  appraisalCompleteTitle:'仕分け終了。逃げ道は消えた。',
  appraisalCompleteBody:'必要な支出は無罪放免。言い訳できない見直し候補だけ残した。次はお前の金遣いのクセを暴く。',
  battleIntroTitle:'処刑候補をロックした。',
  battleIntroBody:'安心しろ。高いだけでは斬らん。根拠がある奴だけ前に出した。',
  battleReady:'逃げ道は塞いだ。確認するぞ。',
  battleAction:'本物のムダだけ炙り出す！',
  battleClear:'優先チェック終了。観念しろ。',
  battleBody:'平均との差で盛る気はない。確定できた改善額だけRESULTで突きつける。',
  resultLead:'判決の時間だ。平均との差と、本物の改善余地を混同するなよ。',
  defeat:'ここは斬れる。惰性でエサ代を払い続けるな。',
  spared:'高くても大事なら無罪だ。幸せな支出まで斬るほど雑じゃない。',
  review:'中身も見ずに処刑するのは雑魚診断だ。まず正体を確認する。',
  lineTitle:'☠️ 見つけただけで満足するな。',
  lineBody:'最初に潰すポイントを1つ選んだ。次は実際に確認するぞ。',
  lineCta:'LINEでNEXT QUESTを受け取る',
 }
};
