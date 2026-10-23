import assert from 'node:assert/strict';
import {WISHES,WALLS,SHIELDS,TOOLS,createAdventureResult} from '../chapter3-v2/standalone-adventure.mjs';
let passed=0;
const ok=(x,m)=>{assert.ok(x,m);passed++};
const base={wish:'invest',wall:'money',shield:'living',tool:'records'};
const primary=createAdventureResult(base);
ok(primary.ok,'complete input produces a result');
ok(primary.routeCode==='RESOURCE_MAP','money barrier sets evidence-safe cash planning');
ok(primary.milestones.length===3,'7/30/90 day timeline');
ok(primary.dimensions.length===4,'money, time, trust, skills honest labels');
ok(primary.evidence.includes('未接続'),'solo does not claim C1/C2 linkage');
ok(primary.caveat.includes('投資可能資金'),'investment not a suitability verdict');
ok(!JSON.stringify(primary).includes('monthlySavings'),'no fake monthly savings');
const names=new Set(),actions=new Set();
for(const w of WISHES)for(const o of WALLS)for(const sh of SHIELDS)for(const t of TOOLS){
 const r=createAdventureResult({wish:w.id,wall:o.id,shield:sh.id,tool:t.id});
 ok(r.ok,'all allowed paths render');
 ok(r.todayAction.length>18,'specific first-step for '+o.id+'/'+t.id);
 ok(r.discovery.length>70,'meaningful tradeoff and rationale');
 ok(r.milestones.every(x=>x.detail.length>20),'milestone is actionable and not purely decoration');
 ok(r.dimensions.every(x=>!/\d{2,}/.test(x.status)),'no spurious financial metrics');
 ok(r.safeToShare.requiresExplicitAction,'no automatic sharing');
 names.add(r.routeCode);actions.add(r.todayAction);
}
ok(names.size===4,'obstacle yields four substantially different routes');
ok(actions.size===WALLS.length*TOOLS.length,'16 distinct barrier x resource actions');
for(const field of ['wish','wall','shield','tool']){
 const wrong={...base,[field]:'INVALID'};
 ok(!createAdventureResult(wrong).ok,'invalid '+field+' rejected');
}
const ref=createAdventureResult(base);
ok(createAdventureResult({...base,wall:'time'}).routeCode!==ref.routeCode,'barrier changes route');
ok(createAdventureResult({...base,shield:'family'}).discovery!==ref.discovery,'protect condition changes interpretation');
ok(createAdventureResult({...base,tool:'person'}).todayAction!==ref.todayAction,'chosen actual resource changes first action');
ok(createAdventureResult({...base,wish:'home'}).headline!==ref.headline,'future choice changes contextual headline');
console.log('CHAPTER3_STANDALONE_CORE_PASS',JSON.stringify({passed,failed:0,combinations:WISHES.length*WALLS.length*SHIELDS.length*TOOLS.length,distinctActions:actions.size}));
