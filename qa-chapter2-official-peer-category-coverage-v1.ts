import assert from 'node:assert/strict';
import {CHAPTER2_2024_PEER_COVERAGE_AUDIT_V1,
 CHAPTER2_2024_PEER_CROSS_SUPPORTED_CATEGORIES,
 chapter2OfficialPeerCoverageV1} from './chapter2-official-peer-category-coverage-v1';
import {V4_CATEGORIES} from './expense-record-v4';
import fs from 'node:fs';

const audit=CHAPTER2_2024_PEER_COVERAGE_AUDIT_V1;
assert.equal(audit.length,12,'Every FROZEN category must be audited exactly once');
assert.deepEqual(new Set(audit.map(x=>x.category)),new Set(V4_CATEGORIES),
 'Coverage must exactly match all contract categories without extra ones');
assert.equal(new Set(audit.map(x=>x.category)).size,12,'No duplicate rows');
assert.equal(audit.filter(x=>x.status==='official_cross_reference_with_scope_warning').length,3);
assert.deepEqual(new Set(CHAPTER2_2024_PEER_CROSS_SUPPORTED_CATEGORIES),
 new Set(['food','energy','daily']));
assert.equal(audit.filter(x=>x.status==='related_official_item_not_comparable').length,7);
assert.equal(audit.filter(x=>x.status==='no_separate_official_item').length,2);
assert.deepEqual(new Set(audit.filter(x=>x.status==='no_separate_official_item').map(x=>x.category)),
 new Set(['sub','selfDevelopment']));
for(const row of audit){
 assert.ok(row.userNotice.length>=15,'Every category needs a concrete human explanation');
 assert.ok(row.scopeCaveat.length>=18,'Every code has an explicit mismatch rationale');
 if(row.status==='no_separate_official_item')
  assert.equal(row.officialItems.length,0,'Do not invent a public expense code');
 else
  assert.ok(row.officialItems.length>0&&row.officialItems.every(code=>/^\d+_.+/.test(code)));
}
const row=(key:string)=>chapter2OfficialPeerCoverageV1(key);
assert.ok(row('mobile').officialItems.includes('21010703_通信'));
assert.ok(row('car').officialItems.includes('21010702_自動車等関係費'));
assert.ok(row('fun').officialItems.includes('21011003_交際費'));
assert.ok(row('beautyFashion').officialItems.includes('210105_被服及び履物'));
assert.ok(row('rent').officialItems.includes('21010201_家賃地代'));
assert.ok(row('insurance').officialItems.includes('23000002_保険料'));
assert.ok(row('childEducation').officialItems.includes('210108_教育'));
assert.ok(row('daily').scopeCaveat.includes('シャンプー'),'Daily FROZEN input is broader than two official items');
assert.equal(row('arbitrary').status,'no_separate_official_item','Unknown category must fail closed');
const ui=fs.readFileSync('ResultScreenChapter2V32.tsx','utf8');
assert.ok(!ui.includes('data-section="PEER_2024_CATEGORY_COVERAGE_AUDIT"'),
 'The nine repeated category caveats no longer occupy a second block ahead of the ledger');
assert.ok(ui.includes('OFFICIAL_12_CATEGORY_REFERENCE_LEGEND'),
 'The 3/7/2 public-source-scope guide stays discoverable');
assert.ok(ui.includes('c2v32-coverage-legend'),
 'Full population and source explanation is one on-demand disclosure');
assert.ok(ui.includes("chapter2OfficialPeerCoverageV1(x.category).userNotice"));
assert.ok(ui.includes('PEER_SCOPE_CAVEAT_'));
assert.ok(!ui.includes('peerReferenceFor(x.category)?.eligibleForReviewBuffer===true'),
 'Published peer expense must never become a saving');
assert.match(ui,/あなたの支出と、判断の目安を見よう/);
assert.ok(!ui.includes('参考データは3種類'), 'The reader should not have to choose between three statistical lenses');
assert.ok(ui.includes("CATEGORY_REFERENCE_EVIDENCE_"),'Secondary statistical sources must be available on demand');
console.log('CHAPTER2_2024_PEER_CATEGORY_SCOPE_AUDIT_PASS');
