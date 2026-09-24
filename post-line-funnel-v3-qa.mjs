import fs from 'node:fs'; import assert from 'node:assert/strict';
const s=fs.readFileSync(new URL('./post-line-funnel-v3.ts',import.meta.url),'utf8');
const checks=[
 ['3 states/tiers',/SELF_ACTION/.test(s)&&/SPECIALIST_REVIEW/.test(s)],
 ['progress',/percent/.test(s)&&/completed/.test(s)],
 ['unknown becomes first check',/毎月の支払額・契約名/.test(s)],
 ['meeting only unresolved',/show:unresolved.length>0/.test(s)],
 ['future goal personalization',/goalMeeting/.test(s)&&/資産形成/.test(s)&&/教育/.test(s)],
 ['three tone meeting copy',/gentle/.test(s)&&/hell/.test(s)],
 ['30 minute online',/30分 \/ オンライン/.test(s)],
 ['transparent commercial disclosure',/サービスや商品の選択肢/.test(s)&&/断れます/.test(s)],
 ['no auto waste from review',/review.has/.test(s)],
 ['self action retained',/selfAction:self/.test(s)]
];
for(const [n,ok] of checks){assert.ok(ok,n);console.log('PASS',n)} console.log(`PASS ${checks.length}/${checks.length}`);
