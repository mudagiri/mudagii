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
console.log('P0_EVIDENCE_STATUS',JSON.stringify({sourceRows:rows.length-1,missing:f.remainingMissingResults,blockers:outstanding,releaseReady:outstanding.length===0&&m.release.approved===true}));
