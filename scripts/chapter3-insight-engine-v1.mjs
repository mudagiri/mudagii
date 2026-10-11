// V1.5 sandbox-only pure decision engine. NOT connected to production, DB or booking.

// These are experience hypotheses, not financial recommendations.

const GOALS={
  "home": {
    "label": "住まい",
    "thing": "住み始めた後の住居費",
    "first": "住みたい暮らしと時期を具体化する"
  },
  "family": {
    "label": "家族・教育",
    "thing": "費用が必要になる時期と金額",
    "first": "大切なライフイベントの時期を並べる"
  },
  "travel": {
    "label": "旅行・趣味",
    "thing": "1回の費用と年間の回数",
    "first": "実現したい体験の回数を考える"
  },
  "invest": {
    "label": "資産形成",
    "thing": "増やした資金を使う目的と時期",
    "first": "増やしたお金で叶えたいことを考える"
  },
  "challenge": {
    "label": "独立・挑戦",
    "thing": "挑戦の準備費用と期間中の生活費",
    "first": "挑戦の時期と守りたい暮らしを考える"
  },
  "safety": {
    "label": "もしもの備え",
    "thing": "備えたい出来事と現在の備え",
    "first": "一番気になる出来事を選ぶ"
  },
  "retirement": {
    "label": "老後",
    "thing": "希望する生活費と継続収入",
    "first": "どの年齢からどんな暮らしをしたいか決める"
  },
  "undecided": {
    "label": "まだ決めていない",
    "thing": "近い将来使う可能性のある資金",
    "first": "近い将来の用途があるかだけ確認する"
  }
};

const JOBS={
  "FDM": "先回り司令官",
  "FDP": "節目軍師",
  "FNM": "兆しの占星術師",
  "FNP": "ひらめき航海士",
  "IDM": "メリハリ賢者",
  "IDP": "戦術ハンター",
  "INM": "直感魔導士",
  "INP": "風読み剣士"
};

const STYLES=["DRIVE","ENJOY","SECURE","OPTIMIZE"];

function shortText(v,max=120){return typeof v==="string"?v.trim().slice(0,max):""};

function isGoal(v){return typeof v==="string"&&Object.prototype.hasOwnProperty.call(GOALS,v)};

function safeYen(v){return typeof v==="number"&&Number.isSafeInteger(v)&&v>=0&&v<=1e12?v:null};

function calculateOptional(o){
 if(!o||o.requested!==true)return null;
 const target=safeYen(o.targetYen),reserved=safeYen(o.earmarkedYen),months=o.monthsUntil;
 if(target===null||target<=0||reserved===null||!Number.isSafeInteger(months)||months<1||months>1200)return {status:"need_conditions",message:"目標額・この目的に充てられる現在の資金・目標までの月数が必要です。"};
 const gap=Math.max(0,target-reserved);
 return {status:"arithmetic_only",targetYen:target,earmarkedYen:reserved,monthsUntil:months,additionalTargetYen:gap,monthlyYen:Math.ceil(gap/months),assumption:"目標まで毎月同額を準備する単純計算。運用益・税・物価変動・入出金や実現可能性は含まない。",isAffordabilityAssessment:false};
};

export function evaluateChapter3(raw){
 const input=raw&&typeof raw==="object"?raw:{};
 const id=shortText(input.anonymousUserId,160),c1=input.chapter1,c2=input.chapter2,c3=input.chapter3&&typeof input.chapter3==="object"?input.chapter3:{};
 const validC1=Boolean(id&&c1&&c1.anonymousUserId===id&&Object.prototype.hasOwnProperty.call(JOBS,c1.jobCode)&&STYLES.includes(c1.primaryStyle)&&shortText(c1.sessionId));
 const validC2=Boolean(id&&c2&&c2.anonymousUserId===id&&shortText(c2.diagnosisId));
 const verifiedC2=validC2?c2:null;
 const c2Goal=isGoal(verifiedC2?.selectedGoal)?verifiedC2.selectedGoal:null;
 const c3Goal=isGoal(c3.goal)?c3.goal:null;
 const goal=c3Goal||c2Goal;
 const adventurer=validC1?{jobCode:c1.jobCode,jobName:JOBS[c1.jobCode],primaryStyle:c1.primaryStyle}:null;
 const financial=verifiedC2?{confirmedA:safeYen(verifiedC2.confirmedA),cUpper:safeYen(verifiedC2.cUpper),confirmedLabel:"確認済み改善額（実行・資金確保済みとは限らない）",candidateLabel:"未確定の見直し候補の参考上限（確保した資金ではない）",neverAdd:true}:null;
 const userDetails=shortText(c3.desiredFuture),preserve=shortText(c3.preserve),when=shortText(c3.when),explicitQuestion=shortText(c3.explicitQuestion);
 const reportedPrepared=c3.planReviewed==="yes";
 const protectedCount=verifiedC2&&Array.isArray(verifiedC2.protectedCategories)?verifiedC2.protectedCategories.filter(x=>typeof x==="string"&&x.length<=60).length:0;
 const evidence=[];
 if(c2Goal&&c2Goal===goal)evidence.push({source:"chapter2_goal",text:GOALS[c2Goal].label});
 if(userDetails)evidence.push({source:"chapter3_wish",text:userDetails});
 if(preserve)evidence.push({source:"chapter3_preserve",text:preserve});
 if(when)evidence.push({source:"chapter3_when",text:when});
 if(protectedCount>0)evidence.push({source:"chapter2_protected",text:"守る判定の支出がある（"+protectedCount+"カテゴリ）"});
 let kind,headline,explanation,action;
 if(!goal){
  kind="NEED_GOAL";headline="未来の目的地を選んでみよう";explanation="前の章で選んだ未来が見つからない場合も、ここから続けられる。";action="目指す未来を選ぶ（まだ決めていない、も可）";
 }else if(explicitQuestion){
  kind="SELF_DEFINED_QUESTION";headline="自分で確かめたいことが見つかった";explanation="あなたの疑問を出発点に、条件を一つずつ確認する。現状の情報だけで結論や金額を作らない。";action="「"+GOALS[goal].thing+"」について、分かる条件から整理する";
  evidence.push({source:"chapter3_question",text:explicitQuestion});
 }else if(goal==="undecided"){
  kind="GOAL_OPEN";headline="目的地を急いで決めなくてもいい";explanation="将来の選択肢を残すこと自体が、今の希望かもしれない。用途が近いお金を分けるところから考えよう。";action=GOALS[goal].first;
 }else if(reportedPrepared){
  kind="PREPARED_SELF_REPORT";headline="すでに未来の計画を考えている";explanation="計画を確認しているのは強み。ここで妥当性や資金の十分性までは認定しない。";action="必要なら計画を見直す時期を決める";
  evidence.push({source:"chapter3_self_report",text:"計画を確認済みと本人が回答"});
 }else if(!userDetails){
  kind="DETAIL_MISSING";headline="目指す未来をもう少し具体的に";explanation="「"+GOALS[goal].label+"」という目的地の先に、どんな毎日を望むかが分かると作戦が考えやすくなる。";action=GOALS[goal].first;
 }else if(!when){
  kind="TIME_MISSING";headline="その未来は、いつ頃叶えたい？";explanation="同じ夢でも、実現したい時期によって準備の考え方は変わる。";action="実現したい時期を一つ選ぶ";
 }else if(preserve&&protectedCount>0){
  kind="VALUE_BRIDGE";headline="未来のために、今の大切なものを全部削る必要はない";explanation="第2章で守ると判定した支出と、第3章で守りたいと答えたものの両方を前提に、実現条件を確認できる。ただし両立可能かはまだ判定できない。";action="守りたい支出を残した条件で「"+GOALS[goal].thing+"」を整理する";
 }else if(c3.costKnown!==true){
  kind="COST_UNKNOWN";headline="未来の条件を一つだけ数字にしてみよう";explanation="目標の方向と時期が見えてきた。次は「"+GOALS[goal].thing+"」を確かめることで計画が具体的になる。";action="「"+GOALS[goal].thing+"」を確認する";
 }else if(c3.preparationKnown!==true){
  kind="PREPARATION_UNKNOWN";headline="必要な条件と今の準備をつなげよう";explanation="目標の条件があっても、現在の準備と照合できなければ達成可否は分からない。";action="現在その目的に充てられる資金と毎月の準備状況を確認する";
 }else {
  kind="PLAN_NOT_VERIFIED";headline="目的地への地図が見えてきた";explanation="目標・時期・準備状況は本人の回答として揃ってきた。実現可能性は試算前に断定しない。";action="希望すれば条件付きの簡易試算で確かめる";
 }
 const math=calculateOptional(c3.optionalMath);
 return {
  version:"CHAPTER3_INSIGHT_EXPERIMENT_V1",kind,goal:goal||null,goalSource:c3Goal?"chapter3":c2Goal?"chapter2":null,adventurer,financial,
  insight:{headline,explanation,action,evidence,insightProven:false,advisoryOnly:true},
  math,
  optionalConsultation:{required:false,copy:"必要なら「"+(goal?GOALS[goal].label:"未来")+"」の条件をライフプラン相談で具体化する"},
  shareSafe:{jobCode:adventurer?.jobCode??null,goalIconCode:goal,completed:kind!=="NEED_GOAL"},
  audit:{chapter1DataAccepted:validC1,chapter2DataAccepted:validC2,identityMismatchDropped:Boolean((c1&&!validC1)||(c2&&!validC2))}
 };
};
