import assert from "node:assert/strict";
import {buildChapter3Motivation} from "../public/pilot/chapter3-v12/motivation.mjs";
const goals=["stability","future","retirement","family","freedom","undecided"];
const concerns=["living","debt","dontKnow","loss","busy","none","skip"];
const horizons=["under3","threeTo10","over10","unknown"];
const topics=["investBasics","propertyLearning","sideWork","career","skills","insurance","budget","consult","resultOnly"];
let assertions=0;const a=(condition,message)=>{assert.ok(condition,message);assertions++};
for(const goal of goals)for(const concern of concerns)for(const horizon of horizons)for(const topic of topics){
 const m=buildChapter3Motivation({goal,concern,horizon,topics:[topic]});
 a(m.version==="CH3_MOTIVATION_V1_3","correct version");
 a(typeof m.goal.label==="string"&&m.goal.label.length>10,"real goal copy");
 a(typeof m.gain.lifeChange==="string"&&m.gain.lifeChange.length>10,"gain tied to life");
 a(typeof m.aha.question==="string"&&m.aha.question.length>26,"derived missing-piece aha");
 a(m.aha.selfReportedPremiseOnly===true,"no generated fake financial personal facts");
 a(typeof m.benefit.therefore==="string"&&m.benefit.therefore.length>10,"first because");
 a(typeof m.benefit.life==="string"&&m.benefit.life.length>10,"second because");
 a(m.pain.selfReported===(concern!=="none"&&concern!=="skip"),"pain only if self reported");
 a((m.pain.conditionalRisk!==null)===m.pain.selfReported,"no fabricated fear");
 a(m.gap.goalAmountJPY===null&&m.gap.currentAssetsJPY===null&&m.gap.verifiedDifferenceJPY===null,"no invented money gap");
 a(m.gap.reason.includes("算出できません"),"gap explicitly unknown");
 a(!/[¥￥][\d,]+/.test(JSON.stringify(m)),"no fabricated amounts or guarantees");
 a(m.copy.includes("未来の大陸")&&!m.copy.includes(m.pain.label),"share must exclude personal concern");
 a(m.consent.referralNeedsExplicitConsent===true&&m.consent.shareNeedsUserAction===true,"consent first");
}
const empty=buildChapter3Motivation({goal:"undecided",concern:"skip",horizon:"unknown",topics:["resultOnly"]});
a(empty.pain.conditionalRisk===null,"skip is not converted to fictional fear");
const noConcern=buildChapter3Motivation({goal:"retirement",concern:"none",horizon:"over10",topics:["investBasics"]});
a(noConcern.pain.conditionalRisk===null,"none is not converted to fictional fear");
console.log("CHAPTER3_V13_PAIN_GAIN_BENEFIT_QA_PASS",assertions,"assertions");
