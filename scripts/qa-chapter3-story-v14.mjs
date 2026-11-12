import assert from "node:assert/strict";
import {JOBS,STYLES,DEMO_JOURNEY,validateStoryHandoff,journeyView,journeyDialogue,chapter2StoryDescription,FOG_STAGES,MAP_REWARD} from "../public/pilot/chapter3-v12/story.mjs";
import {buildChapter3Motivation} from "../public/pilot/chapter3-v12/motivation.mjs";
assert.equal(Object.keys(JOBS).length,8,"must use every real Chapter 1 JOB");
assert.deepEqual(Object.values(STYLES),["前進","楽しさ","安心","納得"],"official styles remain consistent");
assert.equal(FOG_STAGES.length,5,"five chapters-to-map quests");
assert.match(MAP_REWARD.earned,/第一片/);
assert.match(MAP_REWARD.lockedMoney,/必要/);
assert.match(MAP_REWARD.lockedGap,/ギャップ/);
const neutral=journeyView();
assert.equal(neutral.chapter1,null);assert.equal(neutral.chapter2,null);assert.equal(neutral.ready,false);
assert.match(neutral.label,/未連携/);
assert.ok(!journeyDialogue().includes("CLEAR"),"unverified chapters cannot be marked clear");
assert.ok(!chapter2StoryDescription(null).includes("円"),"unverified amount must not appear");
const sample=journeyView(true);
assert.equal(sample.kind,"sample");assert.match(sample.label,/架空/);
assert.equal(sample.chapter1.job,"FDM");assert.equal(sample.chapter2.confirmedSavingMonthlyJPY,null);
assert.equal(sample.chapter2.reviewCandidateUpperMonthlyJPY,null);
assert.ok(chapter2StoryDescription(sample.chapter2).includes("見直し候補"));
for(const job of Object.keys(JOBS))for(const style of Object.keys(STYLES)){
 const data={version:"CH3_STORY_HANDOFF_V1",chapter1:{job,style},chapter2:{confirmedSavingMonthlyJPY:0,reviewCandidateUpperMonthlyJPY:null}};
 const result=validateStoryHandoff(data);
 assert.equal(result.ok,true,job+style);assert.equal(result.data.chapter1.job,job);
}
for(const bad of [
 null,{},{version:"bad"},
 {version:"CH3_STORY_HANDOFF_V1",chapter1:{job:"XXX",style:"DRIVE"},chapter2:{confirmedSavingMonthlyJPY:0,reviewCandidateUpperMonthlyJPY:null}},
 {version:"CH3_STORY_HANDOFF_V1",chapter1:{job:"FDM",style:"UNKNOWN"},chapter2:{confirmedSavingMonthlyJPY:0,reviewCandidateUpperMonthlyJPY:null}},
 {version:"CH3_STORY_HANDOFF_V1",chapter1:{job:"FDM",style:"DRIVE"},chapter2:{confirmedSavingMonthlyJPY:-1,reviewCandidateUpperMonthlyJPY:null}},
 {version:"CH3_STORY_HANDOFF_V1",chapter1:{job:"FDM",style:"DRIVE"},chapter2:{confirmedSavingMonthlyJPY:1.2,reviewCandidateUpperMonthlyJPY:null}},
 {version:"CH3_STORY_HANDOFF_V1",chapter1:{job:"FDM",style:"DRIVE"},chapter2:{confirmedSavingMonthlyJPY:0}},
]){
 assert.equal(validateStoryHandoff(bad).ok,false,"invalid handoff must not be accepted");
}
const gain=buildChapter3Motivation({goal:"freedom",horizon:"threeTo10",forces:{capital:"notNow",time:"notNow",credit:"unknown"},concern:"busy",topics:["career","sideWork"]});
assert.ok(gain.aha.question.length>24,"reflect cross-answer motivation");
assert.ok(!gain.copy.includes("忙しく"),"no personal pain leaks into share copy");
assert.match(gain.copy,/第一片/,"share only the true reward");
console.log("CH3_V14_STORY_CONTRACT_AND_MAP_QA_PASS",Object.keys(JOBS).length*Object.keys(STYLES).length,"JOB/STYLE combinations");
