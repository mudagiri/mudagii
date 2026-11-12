import assert from "node:assert/strict";
import {GUIDES,getTopicGuide,getChosenGuides} from "../public/pilot/chapter3-v12/next-guide.mjs";
const topics=["investBasics","propertyLearning","sideWork","career","skills","insurance","budget","consult"];
assert.deepEqual(Object.keys(GUIDES),topics);
for(const id of topics){
 const g=getTopicGuide(id);
 assert.ok(g);
 assert.ok(g.title.length>=3,"topic label");
 assert.ok(g.benefit.length>=20,"why it benefits user's decisions");
 assert.ok(g.check.length===3&&g.check.every(q=>q.endsWith("？")),"three actionable decision questions");
 assert.ok(g.first.length>=10,"first action");
 assert.ok(g.caveat.length>=15,"caveat");
 assert.ok(!/(必ず儲か|確実に儲か|確実に増|誰でも稼|すぐ借りられる|年率\d+|絶対に安全)/.test(JSON.stringify(g)),"no earnings or borrowing guarantee");
}
assert.deepEqual(getChosenGuides(["sideWork","career","sideWork"]).map(g=>g.title),["副業・収入を増やす","転職・キャリア"],"unique two interests");
assert.equal(getChosenGuides(["resultOnly"]).length,0,"result only must not be upsold");
assert.equal(getTopicGuide("notInContract"),null,"unknown topic is not recommended");
console.log("CHAPTER3_V15_PERSONAL_GUIDES_STATIC_PASS 8 topics, 24 questions, no forced referrals");
