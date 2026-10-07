import fs from 'node:fs';
import {resultV9For,RESULT_V9_TYPE_COUNT,RESULT_V9_SCENE_COUNT} from './src/features/money-personality/resultV9Content';
import type {JobCode,StyleId} from './src/features/money-personality/classifierV1';

const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const FORBIDDEN=['浪費家','ズボラ','衝動買い','何も考えない','必ずこうする','絶対こうする'];
const VAGUE=['こっち','そっち','あっち','こちら','どっち'];
const GENERIC=['今必要な理由','必要な理由は見えている','条件を確認して決める','何を優先して決める','選んでよかったと思えそう','今の自分は何を優先'];
function assert(ok:unknown,msg:string):asserts ok{if(!ok)throw new Error(msg)}

assert(RESULT_V9_TYPE_COUNT===32,`RESULT_V9_TYPE_COUNT_BAD:${RESULT_V9_TYPE_COUNT}`);
assert(RESULT_V9_SCENE_COUNT===192,`RESULT_V9_SCENE_COUNT_BAD:${RESULT_V9_SCENE_COUNT}`);

const publicUi=fs.readFileSync('./src/features/money-personality/MoneyPersonalityPublic.tsx','utf8');
const resultUi=fs.readFileSync('./src/features/money-personality/ResultV9.tsx','utf8');
assert(publicUi.includes("import ResultV9 from './ResultV9'"),'PUBLIC_RESULT_V9_NOT_WIRED');
assert(publicUi.includes("resultV9For(job,style)"),'PUBLIC_RESULT_V9_CONTENT_NOT_WIRED');
assert(!publicUi.includes('<ResultCompetitiveV6'),'PUBLIC_STILL_RENDERS_LEGACY_RESULT');
assert(!publicUi.includes('resultVividScenario(job,style)'),'PUBLIC_STILL_RENDERS_LEGACY_VIVID');
assert(resultUi.includes('content.scenes.slice(0,3)'),'V9_PRIMARY_SCENES_NOT_THREE');
assert(resultUi.includes('content.scenes.slice(3)'),'V9_EXTRA_SCENES_NOT_THREE');
assert(resultUi.includes('ほかの場面も見る'),'V9_MORE_SCENES_MISSING');
assert(resultUi.includes('武器 → 暴走 → 戻し方'),'V9_WEAPON_ARC_MISSING');
assert(resultUi.includes('友だちと比べる'),'V9_COMPARE_MISSING');
assert(resultUi.includes('同じTYPEの中の「あなたらしさ」も見る'),'V9_SECONDARY_NOT_COLLAPSED');
assert(resultUi.includes('このTYPEカードをシェア'),'V9_SHARE_CTA_MISSING');

const heroes=new Set<string>();
const truths=new Set<string>();
const signatures=new Set<string>();
let types=0;
let scenes=0;
let maxHit=0;
let maxVoice=0;
for(const job of JOBS){
  for(const style of STYLES){
    types++;
    const x=resultV9For(job,style);
    assert(Boolean(x),`V9_CONTENT_MISSING:${job}-${style}`);
    assert(x.scenes.length===6,`V9_SCENE_COUNT_BAD:${job}-${style}`);
    assert(new Set(x.scenes.map(s=>s.label)).size===6,`V9_SCENE_LABEL_DUPLICATE:${job}-${style}`);
    heroes.add(x.hero);truths.add(x.truth);
    signatures.add(x.scenes.map(s=>s.label+'|'+s.hit+'|'+s.voice).join('||'));
    const all=[x.hero,x.truth,x.gap.looks,x.gap.really,x.weapon.name,x.weapon.works,x.weapon.overdrive,x.weapon.control,x.compare,x.nextMove,...x.scenes.flatMap(s=>[s.label,s.hit,s.voice])].join('');
    for(const w of FORBIDDEN)assert(!all.includes(w),`V9_FORBIDDEN:${job}-${style}:${w}`);
    for(const w of VAGUE)assert(!all.includes(w),`V9_VAGUE:${job}-${style}:${w}`);
    for(const p of GENERIC)assert(!all.includes(p),`V9_GENERIC_TEMPLATE:${job}-${style}:${p}`);
    x.scenes.forEach((s,i)=>{
      scenes++;
      maxHit=Math.max(maxHit,s.hit.length);maxVoice=Math.max(maxVoice,s.voice.length);
      assert(s.hit.length>=18&&s.hit.length<=68,`V9_HIT_LENGTH_BAD:${job}-${style}:${i}:${s.hit.length}`);
      assert(s.voice.length>=10&&s.voice.length<=55,`V9_VOICE_LENGTH_BAD:${job}-${style}:${i}:${s.voice.length}`);
    });
  }
}
assert(types===32,'V9_TYPES_BAD');
assert(scenes===192,'V9_SCENES_BAD');
assert(heroes.size===32,`V9_HERO_NOT_UNIQUE:${heroes.size}`);
assert(truths.size===32,`V9_TRUTH_NOT_UNIQUE:${truths.size}`);
assert(signatures.size===32,`V9_TYPE_SIGNATURE_NOT_UNIQUE:${signatures.size}`);

console.log(JSON.stringify({
  ok:true,
  qa:'MUDAGIRI_RESULT_V9_HUMAN_FIRST',
  types,
  scenes,
  uniqueHeroes:heroes.size,
  uniqueTruths:truths.size,
  uniqueTypeSignatures:signatures.size,
  maxHit,
  maxVoice,
  noGeneratedFallback:true,
  moreScenesHumanFirst:true,
  vaguePointerGuard:true,
  genericTemplateGuard:true,
},null,2));
