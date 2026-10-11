// Chapter 3 V1.7: isolated "aha" experiment.
// This is NOT an investment recommendation, assessment of affordability, or user interview result.
const yen=n=>new Intl.NumberFormat('ja-JP').format(n)+'円';
const nInt=(n,max=1e12)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=max?n:null;
const evidence=(key,value)=>({key,value});
export function workFreedomAha(v){
 const current=nInt(v?.currentAge,110),change=nInt(v?.changeAtAge,110),
   until=nInt(v?.bridgeUntilAge,110), gap=nInt(v?.monthlyIncomeGapYen),
   invest=nInt(v?.monthlyInvestmentYen);
 if(current==null||change==null||change<=current)
  return {status:'need_data',ask:'今の年齢と、働く時間を減らしたい年齢は？',missing:'age'};
 if(until==null||until<=change)
  return {status:'need_data',ask:'働き方を変えた後、何歳頃までの収入差を考えたい？',missing:'period'};
 if(gap==null)
  return {status:'need_data',ask:'その期間、今より毎月いくら収入が減る想定？（税引後など比較基準をそろえて）',missing:'gap'};
 const months=(until-change)*12;
 if(months>1200||gap>1e12/months)return {status:'invalid',message:'入力条件を確認してください。'};
 const bridgeYen=gap*months;
 const contributionMonths=(change-current)*12;
 const contributedPrincipal=invest==null||invest>1e12/contributionMonths?null:invest*contributionMonths;
 return {
  status:'conditional_insight',kind:'work_bridge',
  headline:'貯める金額より先に、仕事を減らしてからの「収入の差」を知る。',
  keyFinding:change+'歳から'+until+'歳まで、毎月'+yen(gap)+'の収入差が続く仮定なら、その差の単純累計は'+yen(bridgeYen)+'。これは総老後資金の予測ではありません。',
  nuance:'資産形成の習慣があることと、働き方を変えられるかは別。年金・支出変化・他の収入・資産・税・物価・運用損益はまだ計算していない。',
  investmentContext:contributedPrincipal===null?'積立額はこの計算では使っていません。':'今から'+change+'歳まで月'+yen(invest)+'を積み立てた場合の拠出元本は'+yen(contributedPrincipal)+'（利回り・税・価格変動等を含まない）。拠出元本をそのまま生活費に使えると断定せず、上の収入差と差し引きしません。',
  evidence:[evidence('currentAge',current),evidence('changeAtAge',change),evidence('bridgeUntilAge',until),evidence('monthlyIncomeGapYen',gap)],
  calculated:{months,bridgeYen,contributedPrincipal},oneNextStep:'仕事を減らした後の月々の生活費と継続収入を同じ基準で比較する',
  caveat:'入力した仮定に基づく運用益なしの単純計算。将来の実現可能性や資金不足は判定しない。',
  insightProven:false
 };
}
export function travelAha(v){
 const times=nInt(v?.tripsPerYear,20),per=nInt(v?.costPerTripYen),upper=nInt(v?.chapter2CandidateUpperMonthlyYen);
 if(times==null||times===0)return {status:'need_data',ask:'1年間に何回くらい、その体験をしたい？',missing:'times'};
 if(per==null)return {status:'need_data',ask:'1回あたり、いくらの予算を考えている？',missing:'cost'};
 if(times>1e12/Math.max(per,1))return {status:'invalid',message:'入力条件を確認してください。'};
 const annual=times*per, monthly=Math.ceil(annual/12);
 const scenario=upper===null?null:(upper>1e12/12?null:{
  ifAllCandidatesRealizedYen:upper*12,
  hypotheticalPortionPercent:annual>0?Math.round(Math.min(1,upper*12/annual)*1000)/10:null,
  hypotheticalRemainingYen:Math.max(0,annual-upper*12),
  guaranteed:false
 });
 const hypothetical=scenario?(
  '第2章の見直し候補が月最大'+yen(upper)+'なら、**全額が実際に毎月改善できた場合に限り**年間'+yen(scenario.ifAllCandidatesRealizedYen)+'。年間旅行予算の'+(scenario.hypotheticalPortionPercent??0)+'%相当（上限100%表示）。未確定なので準備済みの資金には含めません。'
 ):'第2章の未確定候補は、使える資金として加算していません。';
 return {
  status:'conditional_insight',kind:'travel_reframe',
  headline:'「ムダを減らす」だけでなく、「叶えたい回数」から逆算する。',
  keyFinding:'年'+times+'回、1回'+yen(per)+'なら年間'+yen(annual)+'。12か月で均等に準備すると月約'+yen(monthly)+'が必要という単純計算。',
  householdBridge:hypothetical,
  evidence:[evidence('tripsPerYear',times),evidence('costPerTripYen',per),...(upper===null?[]:[evidence('chapter2CandidateUpperMonthlyYen',upper)])],
  calculated:{annual,monthly,scenario},oneNextStep:'現在の暮らしで守る支出を確認したうえで、年間の準備予算を具体化する',
  caveat:'未確定の見直し候補を資金化した想定は保証されず、実際の積立余力や将来の物価変動も判定していない。',
  insightProven:false
 };
}
