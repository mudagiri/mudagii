import assert from 'node:assert/strict';
import {chapter2PeerGapV1} from './chapter2-official-peer-gap-v1';
// Based on 2024 verified 30-39 single worker cohort gross 400-499 example;
// the rate endpoints are already rounded to one decimal by the original source gate.
const demo=chapter2PeerGapV1({ownMonthlyExpenseYen:60000,ownMonthlyTakeHomeYen:500000,
 peerPctLow:14.8,peerPctHigh:25.3,sameExpenseScopeConfirmed:true,sourceVerified:true});
assert.equal(demo.available,true);
if(demo.available){
 assert.equal(demo.ownPct,12);
 assert.deepEqual([demo.gapPointsLow,demo.gapPointsHigh],[-13.3,-2.8]);
 assert.deepEqual([demo.gapYenLow,demo.gapYenHigh],[-66500,-14000]);
 assert.equal(demo.sourceRegion,'national_only');
 assert.equal(demo.contributesToConfirmedSaving,false);
 assert.equal(demo.contributesToPossibleSaving,false);
}
const above=chapter2PeerGapV1({ownMonthlyExpenseYen:100000,ownMonthlyTakeHomeYen:500000,
 peerPctLow:13,peerPctHigh:14,sameExpenseScopeConfirmed:true,sourceVerified:true});
assert.equal(above.available,true);
if(above.available)assert.deepEqual([above.gapYenLow,above.gapYenHigh],[30000,35000]);
const straddle=chapter2PeerGapV1({ownMonthlyExpenseYen:75000,ownMonthlyTakeHomeYen:500000,
 peerPctLow:13,peerPctHigh:17,sameExpenseScopeConfirmed:true,sourceVerified:true});
assert.equal(straddle.available,true);
if(straddle.available)assert.deepEqual([straddle.gapYenLow,straddle.gapYenHigh],[-10000,10000]);
for(const input of [
 {ownMonthlyExpenseYen:60000,ownMonthlyTakeHomeYen:500000,peerPctLow:14.8,peerPctHigh:25.3,sameExpenseScopeConfirmed:false,sourceVerified:true},
 {ownMonthlyExpenseYen:60000,ownMonthlyTakeHomeYen:500000,peerPctLow:14.8,peerPctHigh:25.3,sameExpenseScopeConfirmed:true,sourceVerified:false},
 {ownMonthlyExpenseYen:null,ownMonthlyTakeHomeYen:500000,peerPctLow:14.8,peerPctHigh:25.3,sameExpenseScopeConfirmed:true,sourceVerified:true},
 {ownMonthlyExpenseYen:60000,ownMonthlyTakeHomeYen:null,peerPctLow:14.8,peerPctHigh:25.3,sameExpenseScopeConfirmed:true,sourceVerified:true},
 {ownMonthlyExpenseYen:60000,ownMonthlyTakeHomeYen:500000,peerPctLow:null,peerPctHigh:25.3,sameExpenseScopeConfirmed:true,sourceVerified:true},
 {ownMonthlyExpenseYen:60000,ownMonthlyTakeHomeYen:500000,peerPctLow:25.3,peerPctHigh:14.8,sameExpenseScopeConfirmed:true,sourceVerified:true},
 ]){
 assert.equal(chapter2PeerGapV1(input).available,false,'must fail closed when source, rate, income or scope is not proven');
}
console.log('CHAPTER2_OFFICIAL_PEER_GAP_DISPLAY_ONLY_PASS');
