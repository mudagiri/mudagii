import { ENEMY_CONTENT } from './enemy-content-v2';
const cats=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
let assertions=0;
function ok(v:any,msg:string){assertions++; if(!v) throw new Error(msg)}
ok(Object.keys(ENEMY_CONTENT).length===12,'12 enemies');
for(const c of cats){ const e=(ENEMY_CONTENT as any)[c]; ok(!!e,c); ok(!!e.name,'name '+c); ok(!!e.encounter,'encounter '+c); ok(!!e.action,'action '+c); ok(!!e.lineDetail,'line '+c); }
for(const c of ['food','fun','beautyFashion']) ok(!!(ENEMY_CONTENT as any)[c].spared,'spared '+c);
for(const c of ['insurance','childEducation','selfDevelopment','rent']) ok(!!(ENEMY_CONTENT as any)[c].needsReview,'review '+c);
console.log(`Enemy content: ${assertions} assertions / PASS`);
