// V2.1 pure, isolated, conditional life-fork calculations.
// All input values must be explicitly selected/entered in the pilot UI.
// No GAS, network, finance recommendation, JOB-based inference, or derived affordability.
const safeInt=(v,min,max)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;
const money=(v)=>new Intl.NumberFormat('ja-JP').format(v)+'円';
const reject=()=>({status:'unknown',message:'条件がそろっていないため、回数・金額を断定できません。'});
export function compareTravel(v){
 const {windowYears,tripsPerYear,costPerTripYen=null,alternativeCostPerTripYen=null}=v||{};
 if(!safeInt(windowYears,1,40)||!safeInt(tripsPerYear,1,12))return reject();
 if(costPerTripYen!==null&&!safeInt(costPerTripYen,1,1e10))return reject();
 if(alternativeCostPerTripYen!==null&&!safeInt(alternativeCostPerTripYen,1,1e10))return reject();
 const fewerPerYear=tripsPerYear===1?2:tripsPerYear-1;
 const aCount=windowYears*fewerPerYear,bCount=windowYears*tripsPerYear;
 const costA=costPerTripYen===null?null:aCount*costPerTripYen;
 const costB=costPerTripYen===null?null:bCount*costPerTripYen;
 const costC=alternativeCostPerTripYen===null?null:bCount*alternativeCostPerTripYen;
 return {
  status:'ready',type:'travel',
  windowYears, tripsPerYear,
  scenarioA:{timesPerYear:fewerPerYear,count:aCount,budgetYen:costA},
  scenarioB:{timesPerYear:tripsPerYear,count:bCount,budgetYen:costB},
  scenarioC:alternativeCostPerTripYen===null?null:{timesPerYear:tripsPerYear,count:bCount,budgetYen:costC},
  differenceInOpportunities:bCount-aCount,
  statement:'本人が選んだ期間と年間回数だけに基づく、将来の旅行機会の比較です。実現可能性を保証しません。',
  financeCaveat:'費用は入力した1回当たりの予算を掛けた名目額で、旅行の値上がり・生活費・実際の積立余力を含みません。',
  neverAssumeFamily:true
 };
}
export function compareWork(v){
 const {earlyAge,lateAge,endAge,currentWorkdays,desiredWorkdays,monthlyNetIncomeDifferenceYen=null}=v||{};
 if(!safeInt(earlyAge,18,90)||!safeInt(lateAge,18,90)||!safeInt(endAge,19,105)||
  earlyAge>=lateAge||lateAge>=endAge||
  !safeInt(currentWorkdays,1,7)||!safeInt(desiredWorkdays,0,6)||desiredWorkdays>=currentWorkdays)return reject();
 if(monthlyNetIncomeDifferenceYen!==null&&!safeInt(monthlyNetIncomeDifferenceYen,0,1e9))return reject();
 const removedDaysPerWeek=currentWorkdays-desiredWorkdays;
 const earlyYears=endAge-earlyAge,lateYears=endAge-lateAge;
 const earlyDays=52*earlyYears*removedDaysPerWeek,lateDays=52*lateYears*removedDaysPerWeek;
 return {
  status:'ready',type:'work',
  scenarioA:{startAge:earlyAge,periodYears:earlyYears,scheduledWorkdaysDifference:earlyDays,netIncomeDifferenceYen:monthlyNetIncomeDifferenceYen===null?null:12*earlyYears*monthlyNetIncomeDifferenceYen},
  scenarioB:{startAge:lateAge,periodYears:lateYears,scheduledWorkdaysDifference:lateDays,netIncomeDifferenceYen:monthlyNetIncomeDifferenceYen===null?null:12*lateYears*monthlyNetIncomeDifferenceYen},
  deltaScheduledWorkdays:earlyDays-lateDays,
  removedDaysPerWeek, endAge,
  statement:'同じ勤務条件で52週／年と仮定した予定勤務日数の差です。自由な休日や給与の変化を保証する数字ではありません。',
  financeCaveat:'収入差を入力した場合の金額は単純累計で、生活費・年金・資産・税・運用損益など未考慮。資金不足ではありません。',
  isAffordabilityAssessment:false
 };
}
export function makeMeetingPreview({type,chosenPath,travel=null,work=null,keepEverydayJoy=false}={}){
 if(type==='travel'&&travel?.status==='ready'&&['a','b','c'].includes(chosenPath)){
  const selected=chosenPath==='a'?travel.scenarioA:chosenPath==='b'?travel.scenarioB:travel.scenarioC;
  if(!selected)return {status:'unavailable'};
  const subject='これから'+travel.windowYears+'年間の旅行の進め方';
  const summary=(keepEverydayJoy?'普段の楽しみを守りながら、':'')+travel.windowYears+'年間で年'+selected.timesPerYear+'回の旅行を検討。家計と準備資金を確認し、別の進め方と比べたい。';
  return {status:'ready',subject,summary,consentRequired:true,booked:false,shared:false};
 }
 if(type==='work'&&work?.status==='ready'&&['a','b'].includes(chosenPath)){
  const selected=chosenPath==='a'?work.scenarioA:work.scenarioB;
  const summary=selected.startAge+'歳から働く日数を減らす場合と、別の開始時期の家計・収入・年金・資産を比較したい。';
  return {status:'ready',subject:'働き方を変える時期と生活設計',summary,consentRequired:true,booked:false,shared:false};
 }
 return {status:'unavailable'};
}
