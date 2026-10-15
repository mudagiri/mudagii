import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

/**
 * Every semantic expectation below was checked against the ACTUAL
 * user-shared MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0 workbook:
 * MASTER_ENGINE (12 rows), GLOBAL_RULES G01-G13, CANONICAL_OWNER (13 rows).
 *
 * This test verifies our text-side contract fixture and rendered scan hints.
 * CI does not have the original XLSX bytes; do not call this a new binary
 * hash verification. A hash of the read user upload is kept in the manifest.
 */
const manifest=JSON.parse(readFileSync('audit/P0_RELEASE_EVIDENCE_MANIFEST_V1.json','utf8'));
const upload=manifest.finalDataContract.uploadedV1;
assert.equal(upload.sha256,'6d22bfdaae592609d0fbe56757cd86cbd329735f4d445996d022917b10234801');
assert.equal(upload.byteSize,16673);
assert.deepEqual(upload.sheets,['MASTER_ENGINE','GLOBAL_RULES','CANONICAL_OWNER','FINAL_AUDIT','README']);
assert.equal(upload.masterCategories,12);
assert.equal(upload.globalRules,13);
assert.equal(upload.canonicalOwnershipRules,13);
assert.equal(upload.frozenAuditCategories,12);
assert.equal(manifest.finalDataContract.laterCopySupersessionProven,false,
 'cannot silently claim unread 2026-09-29 files are the same');

const source=readFileSync('RpgBlock1.tsx','utf8');
const start=source.indexOf('const SCAN_CATEGORIES:');
const stop=source.indexOf('];',start);
assert.ok(start>=0&&stop>start,'scan question configuration must be discoverable');
const block=source.slice(start,stop);
const questions=[...block.matchAll(/\{\s*category:\s*'([a-zA-Z]+)',\s*question:\s*'([^']+)',\s*helper:\s*'([^']+)'\s*\}/g)];
assert.equal(questions.length,12,'one source-aligned scan question for each of 12 final categories');
const descriptions=new Map(questions.map(([,category,question,helper])=>[category,{question,helper}]));
assert.equal(descriptions.size,12,'no duplicate expense category in scan flow');

const canonical=[
 ['mobile','携帯端末分割','端末分割'],
 ['sub','動画/音楽配信','動画・音楽'],
 ['sub','ゲーム月額パス','ゲーム月額パス'],
 ['sub','ジム月会費','ジム月会費'],
 ['selfDevelopment','オンライン英会話/資格スクール','資格・講座'],
 ['childEducation','子どもの塾/習い事','塾・習い事'],
 ['beautyFashion','美容院月額会員','美容院の月額会員'],
 ['sub','フードデリバリー会員費','月額'],
 ['car','自動車保険','自動車保険'],
 ['car','駐車場','駐車場'],
 ['fun','旅行宿泊','旅行・宿泊の一時支出は別確認'],
 ['daily','シャンプー等日常衛生','シャンプー'],
 ['beautyFashion','化粧品','コスメ']
];
assert.equal(canonical.length,13);
for(const [cat,owner,phrase] of canonical){
 const entry=descriptions.get(cat);
 assert.ok(entry?.helper.includes(phrase),'CANONICAL_OWNER '+owner+' must be visible in '+cat+' helper');
}
// The paired anti-double-counting message must also show the destination
// in both potentially overlapping input categories.
for(const [cat,phrases] of [
 ['mobile',['サブスクへ']],
 ['sub',['美容院の月額会員は美容へ']],
 ['food',['会員費はサブスクへ']],
 ['daily',['化粧品']],
 ['fun',['月額契約はサブスク']],
 ['beautyFashion',['シャンプー','日用品へ']],
 ['car',['生命・医療保険や家賃とは分ける']],
 ['rent',['駐車場代は車関連費へ']],
 ['insurance',['自動車保険は車関連費へ']],
 ['childEducation',['大人本人の講座は自己投資へ']],
 ['selfDevelopment',['ジム月会費はサブスク','子の塾は教育費へ']],
 ['energy',['灯油','水道']]
]){
 for(const phrase of phrases){
  assert.ok(descriptions.get(cat)?.helper.includes(phrase),
   'G09 two-sided exclusion absent in '+cat+': '+phrase);
 }
}

// G02 and G01 are protected by dedicated numeric/confirmation tests; the
// contract text contains no license to calculate "saving" from these hints.
assert.ok(source.includes("家へのまとめ払いとは別に"),'personal/shared household scopes remain separated');
console.log('FINAL_CONTRACT_CANONICAL_OWNER_QA_PASS',JSON.stringify({
 uploadedWorkbookSha256:upload.sha256,finalCategories:descriptions.size,
 canonicalOwnerRules:canonical.length,sideExclusionGroups:12,
 realBinaryInCI:false,amountOrJudgementFormulasChanged:false
}));
