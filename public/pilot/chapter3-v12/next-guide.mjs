/**
 * Chapter 3 optional education-only next quest guides.
 * All entries are generic CHECK QUESTIONS, never automated product/loan/referral advice.
 * No personal financial facts are inferred from selected topics.
 */
export const GUIDES=Object.freeze({
 investBasics:{
  title:"資産運用の基本",benefit:"使う時期に合わせて、現金で守るお金と運用を検討するお金を分けやすくなる",
  check:["いつ使う予定のお金？","値下がりしたとき、いつまで待てる？","手数料と税金はどのくらい？"],
  first:"近く使う予定のお金と、それ以外を分けてみる",
  caveat:"運用には損失があり、短期に使う資金には不向きな場合があります。"
 },
 propertyLearning:{
  title:"不動産投資・借入の仕組み",benefit:"表面上の利益ではなく、返済・空室・維持費を含めて負担を比べられる",
  check:["金利が上がっても返済は続けられる？","空室や修繕費が増えた場合は？","売却したいとき、費用や価格変動は？"],
  first:"月々の収入と返済以外の費用を一緒に書き出す",
  caveat:"借入できる額や購入の適否は、この5問では判定しません。"
 },
 sideWork:{
  title:"副業・収入を増やす",benefit:"本業や生活に無理をかけず、続けられそうな選択肢を比較しやすくなる",
  check:["毎週どれくらい時間が使える？","初期費用や収入の不確実性は？","勤務先の就業規則・税金はどうなる？"],
  first:"使えそうな時間と、やりたくないことを1つずつ書く",
  caveat:"副業収入が得られることを保証するものではありません。"
 },
 career:{
  title:"転職・キャリア",benefit:"収入だけでなく、働く時間・安定・成長のどれを重視するかが見えてくる",
  check:["今の仕事で変えたい条件は？","年収以外の勤務時間や福利厚生は？","転職までにどんな準備が必要？"],
  first:"譲れない条件を3つだけ書き出す",
  caveat:"年収アップや採用を保証するものではありません。"
 },
 skills:{
  title:"スキル・学び直し",benefit:"時間とお金をかける前に、学びが実際の仕事につながるか確認できる",
  check:["どんな場面で使うスキル？","必要な時間・費用は？","学んだ後に試せる場所はある？"],
  first:"そのスキルを使える具体的な仕事を1つ探す",
  caveat:"資格や講座によって収入が上がることを保証しません。"
 },
 insurance:{
  title:"保険・保障の見直し",benefit:"公的保障と民間保障の役割を整理して、備える範囲を考えやすくなる",
  check:["公的保険でどこまでカバーされる？","治療内容や生活状況は契約時と変わった？","保険料に対して何が保障される？"],
  first:"加入中の保障内容・免責・更新条件を確認する",
  caveat:"保障を減らす・解約する判断は、必要な保障が確認できるまで急がないでください。"
 },
 budget:{
  title:"家計を整える",benefit:"好きな支出を一律に削らず、暮らしへの影響が少ない見直し先を探せる",
  check:["毎月の固定費で使っていないものは？","満足している支出はどれ？","見直したら生活の質が落ちない？"],
  first:"1つだけ、満足度の低い支出がないか確認する",
  caveat:"平均からの差額をそのまま削減額とは扱いません。"
 },
 consult:{
  title:"ライフプランの全体整理",benefit:"目標・期限・家計の現状・不足する情報を、一度に見渡せるようになる",
  check:["目標達成にはいつ、いくら必要？","現在の貯蓄・負債・保障はどのくらい？","どんな方法なら無理なく続けられる？"],
  first:"必要時期と現在地の数字を確かめる",
  caveat:"このプレビューから予約・LINE追加・個人情報送信はできません。"
 }
});
export function getTopicGuide(id){return Object.hasOwn(GUIDES,id)?GUIDES[id]:null;}
export function getChosenGuides(topicIds){
 if(!Array.isArray(topicIds))return [];
 return [...new Set(topicIds)].slice(0,2).map(id=>getTopicGuide(id)).filter(Boolean);
}
