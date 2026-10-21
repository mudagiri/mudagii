/**
 * Chapter3 V2 user-visible RESULT COPY (draft).
 * Deterministic, evidence-limited: every claim maps to either a validated
 * Chapter2 category/status or the user's explicit choice.
 * This returns presentation copy, never suitability or financial advice.
 */
const DEFAULT={
 title:'未来の作戦は、ここから動き出す。',
 insight:'目的地を決めただけで、必要なお金や時間までは分からない。まず一つ、確かめるところから始めよう。',
 evidence:null,
 missing:'必要な金額、実際に使えるお金や時間は、まだ確認していない。',
};
const COPY={
 housing_priorities:{
  title:'住まいで変えたいことと、守りたいことを分けてみよう。',
  insight:'住まいの未来を選んでも、どんな条件を変えたいかはまだ分からない。いま満足していることと、変えたいことの両方を整理してから次の選択肢を比べよう。',
  evidence:null,missing:'賃貸・持ち家、費用、転居の意向はまだ未確認。'
 },
 challenge_conditions:{
  title:'挑戦を始める前に、必要な時間と費用を分けよう。',
  insight:'新しいことへの挑戦には、最初にお金が必要な場合も、時間や経験が先に必要な場合もある。今は内容と条件を確かめて、無理のない準備から始めよう。',
  evidence:null,missing:'挑戦の内容、費用、使える時間や資金は未確認。'
 },
 family_intent:{
  title:'家族の未来は、何を準備したいかから。',
  insight:'家族・教育を選んでも、進学・住まい・暮らしの支えなど目的は人それぞれ。具体的な支出や出来事を決める前に、準備したいことを一つ絞ってみよう。',
  evidence:null,missing:'家族構成・予定・必要金額は未確認。'
 },
 retirement_basics:{
  title:'老後の安心は、守りたい暮らしの姿から。',
  insight:'老後に必要なお金は、いつまで仕事を続けたいか、どんな生活をしたいかでも変わる。金額を決めつける前に、その姿を一つ描いてみよう。',
  evidence:null,missing:'年金、退職時期、資産・負債は未確認。'
 },
 income_first_check:{
  title:'収入を増やす道は、今の仕事の条件から確かめられる。',
  insight:'まだ稼ぎ方の手がかりが分からないなら、適職を決めつけるより、今の環境で給与がどう変わるのか確かめることが出発点になる。',
  evidence:null,missing:'職務・評価制度・技能・労働時間は未確認。'
 },
 invest_time_and_liquidity:{
  title:'資産を育てる前に、いつ何のために使うのか。',
  insight:'目標を叶えたい時期と、実際に資金を使う時期は同じとは限らない。まず生活のために残すお金と、将来の目的を区別するところから。',
  evidence:null,missing:'預貯金、負債、支出予定と損失への耐性は未確認。'
 },
 find_time_use:{
  title:'時間をつくるなら、どこに使っているかを知ろう。',
  insight:'時間がほしいと思っても、仕事・家事・移動のどれが調整できるかはまだ分からない。今週の使い方を一つだけ見てみよう。',
  evidence:null,missing:'時間の配分・生活や仕事の制約は未確認。'
 },
 travel_budget:{
  title:'楽しみをあきらめず、叶えたい予定を具体的に。',
  insight:'旅行や趣味を楽しむための準備なら、日々の楽しみをすべて削る前に、いつ何をしたいかと必要な費用を整理してみよう。',
  evidence:null,missing:'旅行・趣味の内容、費用、資金余力は未確認。'
 },
 insurance_purpose:{
  title:'保障を削るより先に、何を守る契約なのか。',
  insight:'もしもの備えが目標なら、保険料だけで良し悪しを決めず、今の保障がどんな場面で役立つか確認しよう。',
  evidence:null,missing:'契約内容・家族状況・必要保障額は未確認。'
 },
 specific_priority:{
  title:'将来の安心を考えるなら、何を守りたいかから。',
  insight:'安心の意味は人によって違う。具体的な生活場面を一つ決めると、必要な準備を比べやすくなる。',
  evidence:null,missing:'具体的な目的と家計・資産条件は未確認。'
 },
 compare_goals:{
  title:'未来の地図は、まだ描き始めたところ。',
  insight:'どこへ進むか決めきれなくても、いきなり投資や節約の正解を出す必要はない。気になる未来を二つ並べて、一つずつ考えよう。',
  evidence:null,missing:'本人の優先したい目的・必要な時期・資金条件は未確認。'
 },
 housing_contract:{
  title:'家賃を下げるより先に、今の住まいをいつまで使うか。',
  insight:'第2章で住居費は確認の余地がある項目だった。ただ、平均との差をそのまま節約できるわけではない。近いうちに住まいを考えるなら、先に契約条件と希望の時期を並べてみよう。',
  evidence:'第2章：住居費に詳しく確かめる余地がある',
  missing:'賃貸か持ち家か、契約・住み替えの具体的な条件はまだ未確認。'
 },
 preserve_housing:{
  title:'大切な住まいを守りながら、次の計画を。',
  insight:'第2章には今の住まいで守るべき条件があった。費用を下げる話から始めるより、暮らしの何を守りたいかを明らかにしよう。',
  evidence:'第2章：住居費は守る条件がある',
  missing:'転居の希望・時期・契約条件はまだ未確認。'
 },
 housing_long_term:{
  title:'遠い住まいの目標は、守りたい暮らしから。',
  insight:'10年以上先の希望なら、今すぐ家賃を下げるかどうかより、どんな住まいで暮らしたいかを整理するところから始められる。',
  evidence:null,missing:'将来の住居費、資産、家族・契約条件は未確認。'
 },
 challenge_candidate_uncertain:{
  title:'第2章の「見直せるかも」は、まだ挑戦の元手じゃない。',
  insight:'新しいことを始めたい気持ちは大切。でも第2章の見直し候補は未確定。使えるお金と混ぜずに、まず挑戦に本当に必要な費用を確かめよう。',
  evidence:'第2章：未確定の見直し候補がある（実現したお金ではない）',
  missing:'挑戦の内容、必要資金、現在使える資金はまだ未確認。'
 },
 education_now_future:{
  title:'今払っている教育費と、これから必要なお金は別の話。',
  insight:'第2章では今の教育費を守る理由があった。家族の未来を考えるとき、今の支払いをむやみに減らすより、これからの出来事に必要な費用を切り分けてみよう。',
  evidence:'第2章：教育費は守る理由がある',
  missing:'今後の進学や家族の予定、必要額はまだ未確認。'
 },
 retirement_protect_fun:{
  title:'好きな時間を減らすことだけが、老後への準備じゃない。',
  insight:'第2章で楽しみの支出を守る条件があった一方、今回は老後の安心を目指したいと選んだね。今の満足を尊重しつつ、将来何を続けたいかから考えよう。',
  evidence:'第2章：楽しみに使う支出を守る理由がある',
  missing:'老後の時期、年金・資産、必要額はまだ未確認。'
 },
 outside_request:{
  title:'仕事を増やす前に、「すでに頼まれたこと」を見てみよう。',
  insight:'仕事以外でも頼まれた経験があるなら、可能性を探す手がかりになる。ただし依頼されたことが、無理なく収入に変わるかはまだ分からない。',
  evidence:null,
  missing:'報酬の見込み、今の職務・時間・副業規程は未確認。'
 },
 salary_conditions:{
  title:'副業を探す前に、今の仕事の昇給条件を知ろう。',
  insight:'今の仕事に評価や昇給の道がありそうなら、まずどんな条件で報酬が変わるのか確かめてから、別の選択肢と比べてもいい。',
  evidence:null,missing:'昇給制度の実態と、本人の働き方は未確認。'
 },
 skill_demand:{
  title:'新しい勉強の前に、その学びの使い道を。',
  insight:'学ぶ時間をつくれそうなら、まず興味のある技能が実際にどんな仕事で使われているか確認してみよう。勉強しただけで収入が増えるわけではない。',
  evidence:null,missing:'技能の需要・報酬・習得時間は未確認。'
 },
 upcoming_expense:{
  title:'増やすお金を選ぶ前に、近く使うお金を守ろう。',
  insight:'資産形成が目的でも、1〜3年内に大きな支払いの予定があるなら、その予定に必要なお金と、もっと先のためのお金は分けて考えたい。',
  evidence:null,missing:'支払い金額・現預金・負債と投資への余力は未確認。'
 },
 cash_buffer:{
  title:'近い大きな予定がなくても、全部が投資に使えるわけじゃない。',
  insight:'1〜3年内の大きな支払い予定がないことと、すぐ使ってよいお金があることは別。日常の急な出費に備える条件から確かめよう。',
  evidence:null,missing:'生活費・負債・備えが必要な金額は未確認。'
 },
 near_spending:{
  title:'投資を考える前に、近く使う予定のお金を確認しよう。',
  insight:'目指したい時期が近いことと、実際にお金を使う時期は一致しないこともある。まず使う予定を確かめよう。',
  evidence:null,missing:'資金を使う時期・現預金・生活防衛資金は未確認。'
 },
 work_time:{
  title:'時間を増やすなら、仕事の中の「変えられる予定」から。',
  insight:'仕事が時間を使う大きな部分なら、働く時間をいきなり減らせると決めつけず、まず調整できる仕事や予定があるか確認しよう。',
  evidence:null,missing:'労働時間や勤務条件は未確認。'
 },
 home_time:{
  title:'家のことを全部抱えないために、分けられる作業を探そう。',
  insight:'家事・育児などが時間を使う部分なら、いきなり減らすより、他の人やサービスに任せてもよい作業があるか一つ確認しよう。',
  evidence:null,missing:'実際の家庭状況、負担や分担の意向は未確認。'
 },
 move_time:{
  title:'移動時間を減らせるか、まず一つの経路から。',
  insight:'移動に時間を使っているなら、すべての行動を変える前に、日常の一つの移動の頻度や所要時間を調べてみよう。',
  evidence:null,missing:'交通手段、実際の距離、変更できる予定は未確認。'
 }
};
export function buildResultNarrative(plan,validated,answers){
 if(!plan?.ok||!validated?.ok)return {ok:false,error:'INVALID_RESULT_EVIDENCE'};
 const base=COPY[plan.actionId]??DEFAULT;
 const tags=Array.isArray(plan.reasonTags)?plan.reasonTags:[];
 // Never display Chapter2 evidence that the planner has not explicitly verified.
 const required={
   housing_contract:'c2_rent_review',
   preserve_housing:'c2_rent_protect',
   challenge_candidate_uncertain:'c2_c_not_cash',
   education_now_future:'c2_education_protect',
   retirement_protect_fun:'c2_fun_protect'
 };
 const need=required[plan.actionId];
 if(need&&!tags.includes(need))return {ok:false,error:'MISSING_REQUIRED_CHAPTER2_EVIDENCE'};
 const evidence=base.evidence??null;
 const fallback=plan.evidenceStrength==='limited';
 return {
   ok:true,
   headline:base.title,
   insight:base.insight,
   todayAction:plan.firstStep,
   chapter2Evidence:evidence,
   proofLabel:fallback?'今回の回答から考えた、最初の確認候補':'前章の結果と今回の希望をつないだ作戦',
   selfReportedGoal:plan.goal,
   horizon:answers?.horizon??'unknown',
   uncertainty:base.missing,
   consultTheme:plan.consultTopic,
   limitedEvidence:fallback,
   // This display text must never be used as a suitability score.
   noProductSuitability:true
 };
}
