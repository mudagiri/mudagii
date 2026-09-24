import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process'; import fs from 'node:fs';
const out='/tmp/mudagiri-dataqa'; fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true}); fs.writeFileSync(out+'/package.json','{"type":"commonjs"}');
execFileSync('npx',['tsc','data-platform-v1.ts','--target','ES2020','--module','commonjs','--moduleResolution','node','--outDir',out,'--skipLibCheck'],{cwd:'/mnt/data/mudagiri_v2',stdio:'inherit'});
const d=await import('file://'+out+'/data-platform-v1.js');
assert.equal(d.benchmarkQuality(29),'hidden'); assert.equal(d.benchmarkQuality(30),'reference_only'); assert.equal(d.benchmarkQuality(100),'publishable'); assert.equal(d.benchmarkQuality(500),'strong');
const b=d.aggregateBenchmark([1,2,3,4,100],'food',{household:'single',ageBand:'30s',incomeBand:'500-699'}); assert.equal(b.median,3); assert.equal(b.n,5); assert.ok(b.mean>b.median);
const f=d.benchmarkFallbacks({household:'single',familyProfile:'single',ageBand:'30s',incomeBand:'500-699',prefecture:'東京都',region:'関東'}); assert.ok(f.length>=4); assert.equal(f[0].prefecture,'東京都'); assert.equal(f.at(-1).familyProfile,undefined);
console.log('PASS data platform QA 10/10');
