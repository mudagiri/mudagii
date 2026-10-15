import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Evidence inventory. This is not an approval to merge or release.
const m=JSON.parse(readFileSync('audit/P0_RELEASE_EVIDENCE_MANIFEST_V1.json','utf8'));
const f=m.frozen100;
const rows=readFileSync(f.fixture,'utf8').trimEnd().split(/\r?\n/);
assert.equal(m.schema,'MUDAGIRI_P0_RELEASE_EVIDENCE_V1');
assert.equal(f.claimTotalResults,1200);
assert.equal(rows.length-1,f.recoveredResultRows);
assert.equal(f.recoveredResultRows+f.remainingMissingResults,f.claimTotalResults);
assert.equal(f.recoveredFullyObservedCases,83);
const original=m.finalDataContract.uploadedV1;
assert.equal(original?.directOriginalBinaryVerified,true,'the attached Sep28 base workbook was inspected as bytes');
assert.equal(original?.sha256,'6d22bfdaae592609d0fbe56757cd86cbd329735f4d445996d022917b10234801');
assert.equal(original?.masterCategories,12);
assert.equal(original?.globalRules,13);
assert.equal(original?.canonicalOwnershipRules,13);
const outstanding=[];
if(f.remainingMissingResults)outstanding.push('remaining FROZEN source rows: '+f.remainingMissingResults);
if(!f.fullOriginal100CaseReplay)outstanding.push('original 100-case input replay');
for(const copy of m.finalDataContract.september29Copies){
 if(!copy.cellByCellCompared||!copy.rawAccessible)outstanding.push('unverified contract copy: '+copy.name);
}
if(!m.finalDataContract.laterCopySupersessionProven)outstanding.push('contract copy precedence');
if(m.verification.liveGAS!=='PASS')outstanding.push('live GAS');
if(m.verification.liveLINE!=='PASS')outstanding.push('live LINE');
if(m.verification.realPersonCognitivePilot!=='PASS')outstanding.push('real-user cognitive pilot');
if(outstanding.length)assert.equal(m.release.mergePermitted,false,'cannot publish without evidence');
console.log('P0_EVIDENCE_STATUS',JSON.stringify({originalV1ExcelVerified:true,originalV1Sha256:original.sha256,sourceRows:rows.length-1,missing:f.remainingMissingResults,blockers:outstanding,releaseReady:outstanding.length===0&&m.release.approved===true}));
