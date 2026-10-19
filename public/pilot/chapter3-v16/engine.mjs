/**
 * Chapter 3 V1.6 — purpose -> timeframe -> preparation -> obstacle -> non-negotiable.
 * Pure self-reported reflection, NOT financial scoring or suitability assessment.
 * Chapters 1/2 are intentionally never read here.
 */
export const GOALS=Object.freeze({
 stability:{label:"毎月の暮らしに余裕をつくりたい",dream:"好きなことを、日々の支払いだけで諦めない暮らし",check:"一か月の生活費と、ゆとりとして残したい額"},
 future:{label:"将来のお金の心配を減らしたい",dream:"今も楽しみながら、先の予定を落ち着いて選べる暮らし",check:"将来いつ、何のためにお金が必要か"},
 retirement:{label:"仕事を続けるか、自分で選びたい",dream:"働く・休むをお金だけで決めなくてよい暮らし",check:"働き方を変えたい年齢と、その後の生活費"},
 family:{label:"家族の大切な予定を諦めたくない",dream:"大事な時期に、家族の選択肢を残せる暮らし",check:"大切な予定の時期と必要な準備"},
 freedom:{label:"自分の時間や挑戦を増やしたい",dream:"やりたいことに使う時間を、自分で決められる暮らし",check:"増やしたい自由時間と必要な収入条件"},
 undecided:{label:"まだ決めていない",dream:"焦らず、自分にとって大切な選択肢を見つけること",check:"近い予定と、今楽しみにしていること"}
});
export const HORIZONS=Object.freeze({under3:"3年以内",threeTo10:"3〜10年後",over10:"10年以上先",unknown:"時期はまだ未定"});
export const PREPARATIONS=Object.freeze({
 regular:{label:"少しずつ準備を続けている",hint:"すでに続けている準備"},
 uncertain:{label:"始めたけど、このままでいいか迷う",hint:"進め方に迷いがある準備"},
 notYet:{label:"叶えたいけど、まだ動けていない",hint:"これから始める準備"},
 unknown:{label:"何を準備すればいいか分からない",hint:"まだ見えていない準備"}
});
export const OBSTACLES=Object.freeze({
 living:{label:"毎月のお金に余裕がない",check:"まず生活費を守れるか"},
 debt:{label:"ローンや返済が気になる",check:"返済と必要な現金を確保できるか"},
 dontKnow:{label:"何から始めればいいか分からない",check:"最初に整理する条件は何か"},
 loss:{label:"失敗や損失が怖い",check:"失って困るもの・避けたい変動は何か"},
 busy:{label:"時間がなくて後回しになる",check:"無理なく使える時間はどこか"},
 none:{label:"今は特に困っていない",check:"今の暮らしを崩さず何を叶えるか"},
 skip:{label:"今は答えたくない",check:"話せる範囲から何を確認するか"}
});
export const PRIORITIES=Object.freeze({
 joy:{label:"今の楽しみ",clause:"今の楽しみを削りすぎずに"},
 people:{label:"家族や大切な人との時間",clause:"大切な人との時間を守りながら"},
 peace:{label:"心の安心",clause:"安心して暮らせる前提を守りながら"},
 growth:{label:"新しい挑戦の機会",clause:"挑戦できる余地を残しながら"},
 freedom:{label:"自分で決める自由",clause:"選べる自由を失わずに"}
});
export const ROUTES=Object.freeze({
 protect:{title:"暮らしを守る作戦家",crest:"🛡",turn:"先に確かめたいのは「増やせる額」より「暮らしを守れる条件」。",step:"毎月の固定費・返済と、手元に残すお金を並べる",reason:"毎月の負担を気にしているという回答から、無理のない余力の確認を優先。"},
 deadline:{title:"未来から逆算する航海士",crest:"⌛",turn:"叶えたい時期が近いなら、手段を探す前に「いつ、何に必要か」。",step:"3年以内に必要になる支出を、時期と用途で1つ書き出す",reason:"使う時期が近い場合、値動きより現金が必要な日を先に確かめたい。"},
 time:{title:"時間を取り戻す冒険者",crest:"⌁",turn:"目指す未来があっても、考える時間がなければ作戦は進まない。",step:"今週使える15分を1回だけ決め、目標に必要な条件を1つ書く",reason:"時間が足りないという回答を、実行できる小さな一歩につなぐ。"},
 navigate:{title:"未来を探す地図職人",crest:"✧",turn:"今は行き先を決めきらなくていい。まず、手放したくないものが道しるべ。",step:"近いうちに使うお金と、まだ用途が決まっていないお金を分ける",reason:"目的または時期が未定なら、急いで商品を選ばない。"},
 course:{title:"進路を整える戦術家",crest:"◈",turn:"すでに動いているなら、「何をしているか」より「何のために続けるか」。",step:"続けている準備の横に、使う時期と目的を書いてみる",reason:"すでに準備している／迷いがあるという回答から、方向の点検を優先。"},
 brave:{title:"小さな一歩の開拓者",crest:"⚑",turn:"失敗が怖いなら、最初の一歩は「損をしてもいい額」を決めることではない。",step:"失って困る生活費と、失敗したくない理由を1つ書き出す",reason:"損失への不安があるため、判断の前提を明確にすることを優先。"},
 launch:{title:"未来を動かす冒険者",crest:"✦",turn:"必要なのは、正解の手段探しより「まず何を確かめるか」を決めること。",step:"叶えたいことと期限を一行にし、まだ分からない数字を1つ選ぶ",reason:"まだ準備できていない／最初の手順が分からないという回答に対応。"},
 expand:{title:"選択肢を育てる創造者",crest:"↗",turn:"不安を増やして動く必要はない。今守りたいものから、次の可能性を選ぼう。",step:"叶えたい未来に近づく選択肢を2つだけ並べて比べる",reason:"強い障害が報告されていないため、選べる余地を広げることを優先。"}
});
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function validateAnswers(a){
 const errors=[];
 if(!a||typeof a!=="object")return {ok:false,errors:["answers"]};
 for(const [k,map] of [["goal",GOALS],["horizon",HORIZONS],["preparation",PREPARATIONS],["obstacle",OBSTACLES],["priority",PRIORITIES]]){
  if(typeof a[k]!=="string"||!has(map,a[k]))errors.push(k);
 }
 return {ok:errors.length===0,errors};
}
const PROTECTED_BENEFITS=Object.freeze({
 joy:"楽しみに使うお金を一律に削る前に、満足度を下げずに見直せる選択肢を探しやすくなる。",
 people:"家族や大切な人との時間も判断条件にすれば、金額だけで決めずに済む。",
 peace:"日々の安心を守る最低限の現金を確認してから、次の選択を考えやすくなる。",
 growth:"学びや挑戦に使う余白も残しながら、目標への進み方を比べられる。",
 freedom:"途中で方針を変えられる余地を残し、自分で選ぶ感覚を大切にできる。"
});
const OBSTACLE_CUES=Object.freeze({
 living:"毎月の支払いが気になるなら、未来のために今の生活を圧迫しない順番が大切。",
 debt:"返済が気になるなら、増やし方の前に毎月の負担と手元資金を確かめたい。",
 dontKnow:"何から始めるか分からないなら、方法を増やすより確認事項を1つに絞りたい。",
 loss:"失敗が怖いなら、リターンの話より先に守るべき生活費を決めたい。",
 busy:"時間がないなら、完璧な計画より取りかかれる小さな作業を選びたい。",
 none:"大きな困りごとがないなら、今の満足を崩さず選択肢を比べられる。",
 skip:"困りごとは答えないままでいい。話せる目標と条件だけから進められる。"
});
export function classify(a){
 // One primary route is a priority for the next action, not a permanent personality diagnosis.
 if(["living","debt"].includes(a.obstacle))return "protect";
 if(a.goal==="undecided")return "navigate";
 if(a.horizon==="under3")return "deadline";
 if(a.obstacle==="busy")return "time";
 if(a.horizon==="unknown")return "navigate";
 if(a.obstacle==="loss")return "brave";
 if(a.obstacle==="dontKnow"&&(a.preparation==="notYet"||a.preparation==="unknown"))return "launch";
 if(a.obstacle==="none"||a.obstacle==="skip"){
  if(a.preparation==="notYet"||a.preparation==="unknown")return "launch";
  if(a.preparation==="uncertain")return "course";
  return "expand";
 }
 if(a.preparation==="regular"||a.preparation==="uncertain")return "course";
 if(a.obstacle==="dontKnow"||a.preparation==="notYet"||a.preparation==="unknown")return "launch";
 return "expand";
}
function nextAction(a,route){
 const check=GOALS[a.goal].check;
 switch(route){
  case "protect":return a.obstacle==="debt"
   ?"返済額・生活費・手元に残す現金を1か月分だけ並べる"
   :"毎月の固定費と、暮らしのために残したいお金を並べる";
  case "deadline":return "3年以内に実現したいことを1つ選び、必要な時期と使い道を書く";
  case "time":return "今週の15分を1回確保し、「"+check+"」をメモする";
  case "navigate":return a.goal==="undecided"
   ?"「"+PRIORITIES[a.priority].label+"」を守れる未来の候補を2つ書き出す"
   :"「"+GOALS[a.goal].label+"」をいつ叶えたいか、大まかな時期を1つ考える";
  case "course":return "今続けている準備と「"+HORIZONS[a.horizon]+"」の目的が合っているか書き出す";
  case "brave":return "失ったら暮らしに困るお金と、避けたい変化を1つずつ書き出す";
  case "launch":return "「"+check+"」について、分かることと未確認のことを1つずつ書く";
  default:return "「"+GOALS[a.goal].label+"」に近づく選択肢を2つ比べてみる";
 }
}
const GOAL_SHORT=Object.freeze({
 stability:"毎月の暮らしに余裕をつくりたい",
 future:"将来のお金の心配を減らしたい",
 retirement:"働く・休むを自分で選びたい",
 family:"家族の大切な予定を諦めたくない",
 freedom:"自分の時間や挑戦を増やしたい",
 undecided:"まだ、目指す未来は決めていない"
});
function discoveryFor(a,route){
 const goal=GOAL_SHORT[a.goal],priority=PRIORITIES[a.priority].label;
 const lead=a.goal==="undecided"
  ?"未来の目標はまだ決めていない。でも「"+priority+"」は守りたい。"
  :"「"+goal+"」。でも「"+priority+"」も守りたい。";
 const note={
  protect:()=>a.obstacle==="debt"
   ?"返済が気になる今は、増やし方より毎月の支払いと残しておく現金を先に整理したい。"
   :"毎月の余裕が気になる今は、好きな暮らしを切り詰める前に負担の全体像を見てみよう。",
  deadline:()=>"3年以内に叶えるなら、増やし方より『いつ・何に使うか』を先に決めたい。",
  time:()=>"時間がなくて進まないなら、方法を増やすより始める作業を15分に絞りたい。",
  navigate:()=>a.goal==="undecided"
   ?"今は手段を決めなくていい。まず譲れない条件から、行き先を2つ考えてみよう。"
   :"時期がまだ決まっていないなら、手段より『いつ叶えるか』を先に考えたい。",
  course:()=>a.preparation==="uncertain"
   ?"準備は始めているけれど、進め方には迷いがある。今の準備が目標につながるかが分かれ道。"
   :"準備を続けられている。次はその準備が叶えたい未来につながっているかを確かめよう。",
  brave:()=>"失敗が怖いなら、まず避けたい損失と守るべき暮らしを整理したい。",
  launch:()=>a.preparation==="notYet"
   ?"まだ動けていないなら、正解を探すより最初に確かめることを1つに絞ろう。"
   :"何を準備すればいいか迷うなら、手段より先に分からない数字を1つ見つけたい。",
  expand:()=>a.obstacle==="skip"
   ?"気がかりは話さなくていい。続けてきた準備から次の選択肢を2つ考えよう。"
   :"準備を続けていて、今は大きな障害を感じていない。次は選択肢を比べてみよう。"
 }[route]();
 return lead+" "+note;
}
export function buildDiscovery(a){
 const check=validateAnswers(a);
 if(!check.ok)return {ok:false,errors:check.errors};
 const goal=GOALS[a.goal],priority=PRIORITIES[a.priority],obstacle=OBSTACLES[a.obstacle];
 const routeId=classify(a),route=ROUTES[routeId];
 const discovery=discoveryFor(a,routeId);
 const obstacleCue=OBSTACLE_CUES[a.obstacle];
 const benefit=PROTECTED_BENEFITS[a.priority];
 const timeframeCue=a.horizon==="unknown"
  ?"期限はまだ未定。必要額を決め打ちする前に、いつ叶えたいかを整理できる。"
  :a.horizon==="under3"
   ?"3年以内の目標なら、いつ使うお金かを先に確かめたい。"
   :"使う時期までの距離を確かめれば、急いで手段を決めずに済む。";
 const obstacleText=["none","skip"].includes(a.obstacle)
  ?(a.obstacle==="none"?"今は大きな困りごとを感じていない":"気がかりは答えないことを選んだ")
  :"一方で「"+obstacle.label+"」が気になっている";
 const premise="「"+goal.label+"」という未来を選び、時期は「"+HORIZONS[a.horizon]+"」。準備は「"+PREPARATIONS[a.preparation].label+"」。"+obstacleText+"。";
 const synthesis=obstacleCue+" "+benefit;
 return {
  ok:true,version:"CH3_DISCOVERY_V1_6",routeId,routeTitle:route.title,crest:route.crest,
  headline:route.turn,premise,synthesis,discovery,obstacleCue,benefit,timeframeCue,
  goal:goal.label,dream:goal.dream,horizon:HORIZONS[a.horizon],
  preparation:PREPARATIONS[a.preparation].label,obstacle:obstacle.label,
  priority:priority.label,priorityClause:priority.clause,
  action:nextAction(a,routeId),
  why:a.obstacle==="skip"
   ?"気がかりは回答されていません。障害の有無を推測せず、ほかに選んだ回答から確認の順番を提案しています。"
   :routeId==="expand"
    ?"現在の準備状況と、ご本人が大きな困りごとを感じていないという回答から、次の選択肢の比較を提案。"
    :route.reason,
  firstCheck:goal.check,
  nextQuestion:"その未来は「いつ」「いくら必要」で、今の手元資金との差はいくら？",
  shareText:"ムダギリ診断 第3章で「"+route.title+"」の称号を獲得！未来の作戦を考える冒険へ。 #ムダギリ診断",
  chapter1Linked:false,chapter2Linked:false,confirmedSavingMonthlyJPY:null,
  reviewCandidateUpperMonthlyJPY:null,goalAmountJPY:null,currentAssetsJPY:null,gapJPY:null,
  suitabilityAssessed:false,loanEligibleAssessed:false,
  disclaimer:"これは本人の回答から考えた次の確認順序の仮説です。資産額・必要額・金融商品の適合性は5問だけでは判定できません。"
 };
}
