/**
 * Chapter III · standalone V3 exploration core.
 * Does NOT read or modify Chapter I/II or claim financial suitability.
 * Every result is derived solely from user-selected values in THIS chapter.
 * Demo output is not financial advice, an income estimate or actual savings.
 */
export const WISHES=[
 {id:'freedom',title:'お金の不安を減らして、選べる人生に',icon:'🗝️'},
 {id:'invest',title:'資産形成を、無理なく前に進めたい',icon:'🌳'},
 {id:'home',title:'住まいと家族の未来を整えたい',icon:'🏡'},
 {id:'challenge',title:'新しい仕事や挑戦を始めたい',icon:'⚔️'},
 {id:'time',title:'自分や大切な人との時間を増やしたい',icon:'⌛'},
 {id:'unknown',title:'まだ目的地がはっきりしない',icon:'🧭'}
];
export const WALLS=[
 {id:'money',title:'必要なお金・支払いが見えない',caption:'使えるお金と予定の整理がまだ'},
 {id:'time',title:'目の前のことで時間が足りない',caption:'やりたいことを後回しにしがち'},
 {id:'trust',title:'情報が多く、何を信じるか迷う',caption:'比べる基準や相談先が決まらない'},
 {id:'fog',title:'そもそも何から始めるか曖昧',caption:'準備の順番がまだ見えない'}
];
export const SHIELDS=[
 {id:'living',title:'毎日の暮らしの安心',caption:'収支や手元のお金を大きく崩したくない'},
 {id:'family',title:'家族・身近な人との関係',caption:'大切な人の負担を増やしたくない'},
 {id:'joy',title:'今しかない楽しみ',caption:'将来のために今を全部犠牲にしたくない'},
 {id:'choice',title:'後から選べる自由',caption:'最初の選択を間違えても修正できるように'}
];
export const TOOLS=[
 {id:'records',title:'記録・契約・明細を調べられる',caption:'手元の情報を確認する'},
 {id:'time',title:'今週30分だけなら使える',caption:'短い時間から試してみる'},
 {id:'person',title:'一人、相談できる人がいる',caption:'確認したいことを聞ける'},
 {id:'unknown',title:'今は使えそうなものが分からない',caption:'ここから探す'}
];

const ROUTES={
 money:{code:'RESOURCE_MAP',title:'戦術：資金の霧を晴らす',label:'お金の地図を描く冒険者',
  why:'お金が足りるか分からない段階で、節約額や投資額を決めるのは早い。最初は「いつ・何に必要か」を把握する方が選択肢を増やせる。'},
 time:{code:'TIME_OPENING',title:'戦術：時間のすき間を確保する',label:'時間を取り戻す冒険者',
  why:'時間が足りないと、大きな計画ほど止まってしまう。先に続けられる小さな枠を作れば、目標を後回しにするかどうか自分で決められる。'},
 trust:{code:'EVIDENCE_COMPASS',title:'戦術：選ぶ基準を作る',label:'情報の霧を抜ける冒険者',
  why:'情報が多いほど、比べる基準がないまま新しい情報を集めても迷いやすい。まず判断に必要な条件を絞る方が前に進みやすい。'},
 fog:{code:'FIRST_FLAG',title:'戦術：最初の一歩を絞る',label:'未来の旗を探す冒険者',
  why:'やりたいことの輪郭が曖昧なときは、最初から大きな正解を出すより、小さく試して「何が大事か」を確かめる方が判断しやすい。'}
};
const SHIELD_INSIGHT={
 living:'ただし、毎日の暮らしを守りたいという条件がある。大きな支払いの約束や無理な投資を先に決めるのは避け、手元に残すべきお金を確認しよう。',
 family:'ただし、大切な人への影響も外せない。誰かの負担を前提にせず、今の生活との両立条件を先に整理しよう。',
 joy:'ただし、今の楽しみまで全部削る必要はない。続けたい出費や時間を残したうえで、変えられる部分を探そう。',
 choice:'ただし、選び直せる余地を持っておきたい。大きく固定する決断の前に、取り消せる小さな試行から始めよう。'
};
const ACTIONS={
 money:{
   records:'次の3か月の予定支出を3つ書き、必ず払うものと調整できるものを分ける。',
   time:'30分で「近いうちに使う予定のお金」を一つだけ確認し、金額と時期をメモする。',
   person:'相談できる人に「今後3か月の支払い予定を整理したい」と伝え、確認項目を一つ聞く。',
   unknown:'請求書や口座明細を1つ見つけ、次の支払日だけ確認する。'
 },
 time:{
   records:'直近7日分の予定を見て、繰り返し発生する作業を一つ探す。',
   time:'今週の予定表に、未来のための30分を一枠だけ確保する。',
   person:'一人で抱えている作業を一つ挙げ、他の人に相談できるか確かめる。',
   unknown:'今週、一番時間を使ったことを一つだけ記録する。'
 },
 trust:{
   records:'候補を比較する前に「費用・リスク・やめやすさ」の3点を紙に書く。',
   time:'30分使って、信頼できる一次情報を1つ確認し、分からないことを一つ残す。',
   person:'相談できる人に「この選択のデメリットは何か」を一つ聞く。',
   unknown:'気になっている選択肢を一つ書き、判断に欠けている情報を一つ挙げる。'
 },
 fog:{
   records:'過去に自分が「やってよかった」と思った選択を一つ探して理由を書く。',
   time:'30分使って、興味のある未来を一つ試せる小さな行動を決める。',
   person:'一人に「最近、自分が楽しそうに話していたことは何か」を聞く。',
   unknown:'「増やしたいもの・守りたいもの」をそれぞれ一つ書いて並べる。'
 }
};
const GOAL_CONTEXT={
 freedom:'お金の不安を減らしたい',
 invest:'資産形成を進めたい',
 home:'暮らしや住まいを整えたい',
 challenge:'新しい挑戦を始めたい',
 time:'大切な時間を増やしたい',
 unknown:'目指す未来を探している'
};
const CONSULT={
 money:'必要資金・支出予定と、守るべき家計の条件を整理',
 time:'時間の使い方と、変えられる選択肢を整理',
 trust:'選択肢の比較基準・注意点・質問事項を整理',
 fog:'目標と優先順位を一緒に整理'
};
function isAllowed(choices,key,allowed){return typeof choices[key]==='string'&&allowed.some(x=>x.id===choices[key]);}
export function createAdventureResult(choices){
 if(!choices||typeof choices!=='object')return {ok:false,error:'MISSING_CHOICES'};
 if(!isAllowed(choices,'wish',WISHES)||!isAllowed(choices,'wall',WALLS)||
    !isAllowed(choices,'shield',SHIELDS)||!isAllowed(choices,'tool',TOOLS))return {ok:false,error:'INCOMPLETE_CHOICES'};
 const route=ROUTES[choices.wall];
 const preference=GOAL_CONTEXT[choices.wish];
 const protect=SHIELD_INSIGHT[choices.shield];
 const step=ACTIONS[choices.wall][choices.tool];
 // A self-reported chosen tool is NOT independently verified capacity.
 const selectedTool=TOOLS.find(x=>x.id===choices.tool);
 const moneyNote=choices.wish==='invest'?
  'なお「資産形成をしたい」は、投資可能資金や金融商品の適合性が確認できたという意味ではない。':
  'ここでは収入・資産・借入・投資への適合性を判定していない。';
 const dimensions=[
  {key:'money',name:'お金',status:choices.wall==='money'?'使う予定の確認が先':'家計の実数は未確認'},
  {key:'time',name:'時間',status:choices.tool==='time'?'30分使えるという本人の選択':'実際に確保できる時間は未確認'},
  {key:'trust',name:'信用・つながり',status:choices.tool==='person'?'相談相手がいるという本人の選択':'相談先・信用力は未評価'},
  {key:'human',name:'経験・スキル',status:choices.tool==='records'?'確認できる記録があるという本人の選択':'実際の技能・経験は未評価'}
 ];
 return {
  ok:true,routeCode:route.code,routeTitle:route.title,adventurerTitle:route.label,
  headline:preference+'。でも、最初に攻略するのは「'+WALLS.find(x=>x.id===choices.wall).title+'」という壁。',
  discovery:route.why+' '+protect,
  todayAction:step,
  shield:SHIELDS.find(x=>x.id===choices.shield).title,
  toolLabel:selectedTool.title,
  milestones:[
   {when:'7日後',title:'一手を実行',detail:step},
   {when:'30日後',title:'変化を検証',detail:'動かせた条件と、まだ分からない条件を一つずつ書き直す。'},
   {when:'90日後',title:'道を選び直す',detail:'実際の記録に基づき、この作戦を続けるか別の選択肢へ進むか判断する。'}
  ],
  dimensions,
  consultation:CONSULT[choices.wall],
  caveat:moneyNote,
  evidence:'第3章で選んだ回答のみ。第1章JOB・第2章家計戦果は、この単独プレビューでは未接続。',
  safeToShare:{title:route.label,routeCode:route.code,requiresExplicitAction:true}
 };
}
