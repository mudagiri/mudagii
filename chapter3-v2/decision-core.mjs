// Draft 0.9: isolated evidence-safe Chapter 3 decision POC; NOT imported by Chapters 1/2 or production.

// Input is a synthetic V5-shaped handoff pending exact runtime integration. No investment suitability inference.

export const CATS=["mobile","energy","sub","car","food","daily","fun","beautyFashion","rent","insurance","childEducation","selfDevelopment"];

export const JOBS=["FDM","FDP","FNM","FNP","IDM","IDP","INM","INP"];

export const STYLES=["DRIVE","ENJOY","SECURE","OPTIMIZE"];

export const STATUSES=["cut","optimize","protect","inspect","ok","na"];

export const GOALS=["home","family","travel","invest","challenge","safety","retirement","undecided","income","time","monthlyRoom","futurePeace"];

export const HORIZONS=["near","middle","far","unknown"];

export const CHAPTER3_HANDOFF_VERSION="MUDAGIRI_C3_V2_TEST_V1";

export function validateHandoff(x,id){
 const fail=e=>({ok:false,error:e});
 if(!x||x.version!==CHAPTER3_HANDOFF_VERSION||!id||x.anonymousUserId!==id)return fail("INVALID_ID_OR_VERSION");
 const c1=x.chapter1??null,c2=x.chapter2??null;
 if(c1 && (c1.anonymousUserId!==id||!JOBS.includes(c1.jobCode)||!STYLES.includes(c1.primaryStyle)||!c1.sessionId||!Number.isFinite(Date.parse(c1.completedAt))))return fail("INVALID_C1");
 if(c2){
   if(c2.anonymousUserId!==id||!c2.diagnosisId||c2.vmVersion!=="MUDAGIRI_RESULT_VM_V5_2"||!Array.isArray(c2.rows)||c2.rows.length!==12||
   (c2.goal!==null&&c2.goal!==undefined&&!GOALS.slice(0,8).includes(c2.goal)))return fail("INVALID_C2");
   const set=new Set();let sumA=0,sumC=0;
   for(const r of c2.rows){
     if(!r||!CATS.includes(r.category)||set.has(r.category)||!STATUSES.includes(r.v5Status)||typeof r.known!=="boolean"||
       !Number.isSafeInteger(r.aAmount)||r.aAmount<0||!Number.isFinite(r.cUpper)||r.cUpper<0||
       (r.v5Status==="na"&&(r.aAmount||r.cUpper))||
       (r.aAmount>0&&(r.category!=="sub"||r.v5Status!=="cut")))return fail("INVALID_ROW");
     set.add(r.category);sumA+=r.aAmount;sumC+=r.cUpper;
   }
   if(set.size!==CATS.length||!c2.potential||!Number.isSafeInteger(c2.potential.confirmedA)||!Number.isFinite(c2.potential.cUpper)||c2.potential.confirmedA!==sumA||Math.abs(c2.potential.cUpper-sumC)>0.00001)return fail("A_C_MISMATCH");
 }
 return {ok:true,value:{chapter1:c1,chapter2:c2,anonymousUserId:id}};
}

export function planNextAction(parsed,input){
 if(!parsed?.ok||!input||!HORIZONS.includes(input.horizon))return {ok:false,error:"INVALID_INPUT"};
 const {chapter1:c1,chapter2:c2}=parsed.value;
 let goal=(c2?.goal && c2.goal!=="undecided")?c2.goal:null,source=goal?"chapter2":"unknown";
 if((input.goalOverrideConfirmed===true||!goal)&&GOALS.includes(input.goal)){goal=input.goal;source="chapter3_explicit";}
 if(!goal)goal="undecided";
 const get=k=>c2?.rows.find(r=>r.category===k)??null;
 const tags=[];if(source==="chapter2")tags.push("chapter2_goal");
 if(source==="chapter3_explicit")tags.push("chapter3_goal");
 if(c1)tags.push("verified_c1_job_style");
 if(input.horizon!=="unknown")tags.push("self_report_horizon");
 const cUpper=Number(c2?.potential.cUpper??0);
 let actionId="compare_goals",firstStep="今気になる未来を2つ書き、どちらを先に考えたいか比べる",question=null,consultTopic="今後の優先事項";
 const detail=input.detail??"unknown",near=input.horizon==="near";
 if(goal==="home"){
  consultTopic="住まいと家計";
  if(get("rent")?.v5Status==="protect"){actionId="preserve_housing";firstStep="今の住まいで守りたいことを一つ書き、いつまで続けたいか考える";tags.push("c2_rent_protect");}
  else if(["inspect","optimize"].includes(get("rent")?.v5Status)&&near){actionId="housing_contract";firstStep="今の住居の契約条件と、希望する変更時期を並べる";tags.push("c2_rent_review");}
  else if(input.horizon==="far"){actionId="housing_long_term";firstStep="10年以上先も守りたい住まいの条件を一つ書く";}
  else{actionId="housing_priorities";firstStep="今の住まいで変えたいことと守りたいことを一つずつ書く";}
 }else if(goal==="challenge"){
   consultTopic="新しい挑戦の条件";
   if(cUpper>0&&c2?.potential.confirmedA===0){actionId="challenge_candidate_uncertain";firstStep="挑戦に必要な費用を3項目書き、未確定の見直し候補は元手に含めず整理する";tags.push("c2_c_not_cash");}
   else{actionId="challenge_conditions";firstStep="挑戦に必要な費用と時間を一つずつ書く";}
   if(detail==="unknown")question="始めたいことは事業・学習・趣味のどれに近い？";
 }else if(goal==="family"){
   consultTopic="家族・教育の準備";
   if(get("childEducation")?.v5Status==="protect"){actionId="education_now_future";firstStep="今の教育・家族支出と、これからの予定に必要な費用を分けて書く";tags.push("c2_education_protect");}
   else{actionId="family_intent";firstStep="家族に関して何を準備したいか一つ決める";}
 }else if(goal==="retirement"){
   consultTopic="老後に守る暮らし";
   if(get("fun")?.v5Status==="protect"){actionId="retirement_protect_fun";firstStep="老後も続けたい楽しみと、始めたい時期を一つ書く";tags.push("c2_fun_protect");if(c1?.primaryStyle==="ENJOY")tags.push("c1_enjoy_voice_only");}
   else{actionId="retirement_basics";firstStep="仕事を続けたい時期と、老後に守りたい暮らしを一つずつ書く";}
 }else if(goal==="income"){
   consultTopic="収入と働き方の選択肢";tags.push("income_wish_explicit");
   if(detail==="outsideDemand"){actionId="outside_request";firstStep="最近社外で頼まれたことを一つ、内容と必要時間でメモする";}
   else if(detail==="atWork"){actionId="salary_conditions";firstStep="今の仕事で給与が変わる条件を一つ確認する";}
   else if(detail==="learningTime"){actionId="skill_demand";firstStep="学びたい技能を使う仕事の例を一つ調べる";}
   else{actionId="income_first_check";firstStep="今の仕事で報酬が変わる条件を一つ調べる";question="今の手がかりは昇給・社外の依頼・学習時間・未定のどれ？";}
 }else if(goal==="invest"){
   consultTopic="資産形成と近い支払いの優先順位";
   if(near&&detail==="plannedExpense"){actionId="upcoming_expense";firstStep="1〜3年内の大きな支払いについて時期と必要額を一つ確認する";}
   else if(near&&detail==="noPlannedExpense"){actionId="cash_buffer";firstStep="急な支払いに備えて手元に残すお金の条件を一つ確認する";}
   else if(near){actionId="near_spending";firstStep="1〜3年以内に使う予定のお金があるか一つ確認する";question="近いうちに大きな支払いの予定はある？（ある／ない／未定）";}
   else{actionId="invest_time_and_liquidity";firstStep="将来の目標と手元に残すお金の条件を別々に書く";}
   if(cUpper>0)tags.push("c2_c_not_cash");
 }else if(goal==="time"){
   consultTopic="働き方と時間のバランス";
   actionId=detail==="work"?"work_time":"find_time_use";
   firstStep=detail==="work"?"仕事で減らせそうな予定を一つ探す":"今週、自分の時間を使った活動を一つ書く";
   if(detail==="unknown")question="時間を使う先は仕事・家事・移動・その他のどれ？";
 }else if(goal==="travel"){
   consultTopic="趣味と旅の資金計画";actionId="travel_budget";firstStep="叶えたい旅行・趣味の予定と必要費用を一つ書く";
   if(get("fun")?.v5Status==="protect")tags.push("c2_fun_protect");
 }else if(goal==="safety"){
   consultTopic="保障の目的と家計";actionId="insurance_purpose";firstStep="今の保障が何に備えるものか契約内容を一つ確認する";
   if(["inspect","optimize"].includes(get("insurance")?.v5Status))tags.push("c2_insurance_review");
 }else if(goal==="monthlyRoom"||goal==="futurePeace"){
   consultTopic="家計とこれからの安心";actionId="specific_priority";firstStep="安心したい生活場面を一つ書く";
 }
 if(cUpper>0&&!tags.includes("c2_c_not_cash"))tags.push("c2_candidate_unrealized");
 return {ok:true,goal,goalSource:source,actionId,firstStep,question,consultTopic,
   evidenceStrength:tags.some(x=>/^c2_(rent|education|fun|insurance|c_not_cash)/.test(x))?"connected_evidence":"limited",
   reasonTags:tags,noFinancialSuitabilityClaim:true,
   shareSafe:{jobCode:c1?.jobCode??null,publicJourney:"future_quest",goalTheme:null,requiresExplicitConsent:true}};
}

