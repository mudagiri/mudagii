import assert from 'node:assert/strict';
import {resolveMudagiriPublicEntryV1} from './src/features/money-personality/site-entry-route-v1';
import {chapter2V2ReferralUrl} from './chapter2-v2-contract';

for(const root of ['/','/mudagii/','/mudagii']){
 assert.equal(resolveMudagiriPublicEntryV1(root,'',false),'adaptive','new public visitors start in Chapter 1');
 assert.equal(resolveMudagiriPublicEntryV1(root,'',true),'household','saved household result/draft keeps its legacy screen');
 assert.equal(resolveMudagiriPublicEntryV1(root,'?mode=household',false),'household','explicit legacy bookmark survives');
 assert.equal(resolveMudagiriPublicEntryV1(root,'?legacy=1',false),'household','explicit legacy link survives');
 assert.equal(resolveMudagiriPublicEntryV1(root,'?chapter2v32=1',false),'household','Chapter 1 continuation launches latest Chapter 2');
 assert.equal(resolveMudagiriPublicEntryV1(root,'?mode=adaptive',true),'adaptive','explicit Chapter 1 wins over old saved session');
 assert.equal(resolveMudagiriPublicEntryV1(root,'?ref=share',false),'adaptive','share referral opens Chapter 1');
}
for(const pilot of ['/pilot/chapter2-v32/','/mudagii/pilot/chapter2-v32/']){
 assert.equal(resolveMudagiriPublicEntryV1(pilot,'',false),'household','standalone Chapter 2 preview still opens its quest');
 assert.equal(resolveMudagiriPublicEntryV1(pilot+'pilot/money-type/','',false),'adaptive','pilot Chapter1 entry is adaptive');
}
assert.equal(resolveMudagiriPublicEntryV1('/mudagii/','?pilot=money-type&mode=legacy-pilot',false),'legacy-pilot');
assert.equal(chapter2V2ReferralUrl('https://mudagiri.github.io/mudagii/?chapter2v32=1','x'),
 'https://mudagiri.github.io/mudagii/?mode=adaptive&utm_source=x&utm_campaign=household_quest_clear');
assert.equal(chapter2V2ReferralUrl('https://mudagiri.github.io/mudagii/pilot/chapter2-v32/','line'),
 'https://mudagiri.github.io/mudagii/pilot/chapter2-v32/pilot/money-type/?utm_source=line&utm_campaign=household_quest_clear');
console.log('PUBLIC_CHAPTER12_ENTRY_V1_QA_PASS: root adaptive, old V5 resume, V3.2 continuation and referral');
