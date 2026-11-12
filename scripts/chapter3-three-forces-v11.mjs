/**
 * Chapter 3 "未来を変えるクエスト" – pure, sandbox-only result rules, v1.1.
 *
 * NO financial suitability, income/credit scoring, loan eligibility,
 * automated partner matching, PII transmission or production side effects.
 * Existing chapter 1 / chapter 2 engines are not imported or modified.
 */
const GOALS=["stability","future","retirement","family","freedom","undecided"];
const HORIZONS=["under3","threeTo10","over10","unknown"];
const STATUS=["active","interested","notNow","unknown"];
const CONCERNS=["living","debt","dontKnow","loss","busy","none","skip"];
const TOPICS=["investBasics","propertyLearning","sideWork","career","skills","insurance","budget","consult","resultOnly"];
const JOBS=["FDM","FDP","FNM","FNP","IDM","IDP","INM","INP"];
const STYLES=["DRIVE","ENJOY","SECURE","OPTIMIZE"];
const TOPIC_LABEL={investBasics:"資産運用の仕組み",propertyLearning:"不動産投資・融資の仕組み",sideWork:"副業",career:"転職・キャリア",skills:"スキルアップ",insurance:"保障の見直し",budget:"家計改善",consult:"総合相談",resultOnly:"結果だけ見る"};
const valid=(v,allowed)=>typeof v==="string"&&allowed.includes(v);
const money=v=>Number.isSafeInteger(v)&&v>=0&&v<=1e12?v:null;
const safeStr=v=>typeof v==="string"&&v.length>0&&v.length<=160?v:null;

export function validateChapter3Answers(input){
 const a=input&&typeof input==="object"?input:{};
 const errors=[];
 if(!valid(a.goal,GOALS))errors.push("goal");
 if(!valid(a.horizon,HORIZONS))errors.push("horizon");
 for(const k of ["capital","time","credit"])if(!valid(a.forces?.[k],STATUS))errors.push("forces."+k);
 if(!valid(a.concern,CONCERNS))errors.push("concern");
 if(!Array.isArray(a.topics)||a.topics.length<1||a.topics.length>2||new Set(a.topics).size!==a.topics.length||a.topics.some(t=>!valid(t,TOPICS))||a.topics.includes("resultOnly")&&a.topics.length!==1)errors.push("topics");
 return {ok:errors.length===0,errors};
}
function trustedCh1(root){
 const c=root?.chapter1;
 const id=safeStr(root?.anonymousUserId);
 return id&&c?.verified===true&&c?.anonymousUserId===id&&valid(c?.job,JOBS)&&valid(c?.style,STYLES)
 ?{job:c.job,style:c.style}:null;
}
function trustedCh2(root){
 const c=root?.chapter2;
 const id=safeStr(root?.anonymousUserId);
 if(!(id&&c?.verified===true&&c?.anonymousUserId===id&&safeStr(c?.sourceVersion)))return null;
 return {confirmedSavingMonthlyJPY:money(c.confirmedSavingMonthlyJPY),reviewCandidateUpperMonthlyJPY:money(c.reviewCandidateUpperMonthlyJPY),sourceVersion:c.sourceVersion,
 note:"確認された改善額は実際の資金確保や契約変更の完了を意味しない。未確定候補は投資原資ではない。"};
}
const STORIES={
 household:{title:"先に、毎月のお金の流れを確かめよう",question:"生活費や返済を続けたうえで、毎月どれくらい余裕がある？",why:"資産形成の方法を選ぶ前に、今の支出と返済を維持できるかが判断材料になる。",action:"毎月の支出・返済・手元資金を整理する"},
 short_active:{title:"使う時期と、運用中のお金を分けて考えよう",question:"3年以内に使いたいお金は、運用中の資金と分けて準備できている？",why:"使う時期が近い資金は、運用中の値下がりや換金のタイミングが影響する。",action:"使う予定のお金と時期を一覧にする"},
 short:{title:"まず、使う時期から逆算しよう",question:"3年以内に必要なお金は、いつ・どんな用途で使う？",why:"時間が限られるほど、金額だけでなく必要時期や元本の変動を確認する意味がある。",action:"必要になる時期と用途を一つ書き出す"},
 no_goal:{title:"目的を急いで決めなくても大丈夫",question:"近いうちに使う予定のお金と、しばらく使わないお金を分けて考えたことはある？",why:"目的が未定でも、使う時期が近いお金を把握すると選択肢を整理しやすい。",action:"近い将来に予定している支出を確認する"},
 earning:{title:"増やす前に、稼ぐ選択肢も比べよう",question:"新しい収入に使える時間や、今の仕事で変えたい条件は何だろう？",why:"副業・転職・学び直しでは、必要な時間や収入の安定性がそれぞれ違う。",action:"使える時間と譲れない条件を整理する"},
 existing:{title:"続けている方法を、目標と照らそう",question:"今の取り組みは、使いたい時期と必要な資金に合っている？",why:"運用をしていることと、目標に沿っていることは別なので、時期と目的の確認が役立つ。",action:"今の取り組みと目標・時期を書き分ける"},
 borrowing:{title:"借りる・借りないを、条件から考えよう",question:"借入を使う場合、返済が続く状況や資産価格が下がる場合まで想像できる？",why:"借入には金利・返済・空室や価格下落などの負担があり、借入できるかだけでは判断できない。",action:"借入を使った方法の費用とリスクを学ぶ"},
 start:{title:"まず、選択肢の違いを知ろう",question:"使いたい時期や今の家計を踏まえて、何を比較すると納得できそう？",why:"元本・運用期間・リスク・生活費の条件によって比較ポイントは変わる。",action:"選択肢ごとの仕組みと注意点を確認する"},
 };
function chooseStory(a){
 if(a.concern==="living"||a.concern==="debt")return "household";
 if(a.horizon==="under3"&&(a.forces.capital==="active"||a.forces.time==="active"))return "short_active";
 if(a.horizon==="under3")return "short";
 if(a.goal==="undecided"||a.horizon==="unknown")return "no_goal";
 if(a.topics.some(t=>["sideWork","career","skills"].includes(t)))return "earning";
 if(a.forces.capital==="active"||a.forces.time==="active")return "existing";
 if(a.topics.includes("propertyLearning"))return "borrowing";
 return "start";
}
const STEPS={DRIVE:"目標から逆算して、次に調べる条件を一つ決めよう。",ENJOY:"今の楽しみも大事にしながら、次の選択肢を見てみよう。",SECURE:"無理のない範囲で、安心できる前提を先に確かめよう。",OPTIMIZE:"費用と条件を並べて、納得できる材料から見ていこう。"};
export function evaluateChapter3(root){
 const checked=validateChapter3Answers(root?.answers);
 if(!checked.ok)return {ok:false,errors:checked.errors};
 const a=root.answers;
 const ch1=trustedCh1(root),ch2=trustedCh2(root);
 const storyKey=chooseStory(a),story=STORIES[storyKey];
 const topics=a.topics.filter(t=>t!=="resultOnly");
 const first=topics[0]??null;
 const safetyPause=storyKey==="household";
 const learningOnly=safetyPause&&first!==null&&["investBasics","propertyLearning"].includes(first);
 const action=topics.length===0?{kind:"save",label:"作戦書を受け取る",topic:null}:
   first==="consult"?{kind:"consult_interest",label:"将来のお金を相談する",topic:first}:
   {kind:"learn",label:topics.length===2?"選んだ2つの選択肢を見る":TOPIC_LABEL[first]+"を知る",topic:first};
 return {ok:true,version:"CH3_THREE_FORCES_V1_1",storyKey,
  threeForces:{capital:a.forces.capital,time:a.forces.time,credit:a.forces.credit},
  goal:a.goal,horizon:a.horizon,concern:a.concern,
  insight:{...story,styleLine:ch1?STEPS[ch1.style]:null,derivedFrom:["goal","horizon","forces","concern","topics"],notSuitabilityAssessment:true},
  chapter1:ch1,
  chapter2:ch2,
  topicIds:topics,
  primaryAction:action,
  safeEducationFirst:learningOnly,
  financialEligibilityAssessed:false,loanCapacityAssessed:false,
  investmentAmountJPY:null,automatedPartnerReferralAllowed:false,
  share:{job:ch1?.job??null,goal:null,financialAmounts:null,earningDetails:null},
  handoff:{needsExplicitUserRequest:true,needsPartnerReview:true,needsConsent:true,sendUserDataNow:false}};
}
