import fs from 'node:fs';
import {corePatternForType,dailyScenesForType,DAILY_SCENE_LIBRARY_SIZE,PUBLIC_TYPE_PATTERN_COUNT,PRIMARY_RECOGNITION_HIT_COUNT,primaryRecognitionPunchesForType} from './src/features/money-personality/resultDailySceneNarrativeV6';
import type {JobCode,StyleId} from './src/features/money-personality/classifierV1';

const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const FORBIDDEN=['浪費家','ズボラ','ケチ','衝動買い','何も考えない','必ずこうする','絶対こうする'];
const VAGUE_POINTERS=['こっち','そっち','あっち','こちら','どっち'];
const ARBITRARY_VISIBLE_NUMBERS=['数か月','数年','半年','20分','数千円'];

function assert(ok:unknown,message:string):asserts ok{if(!ok)throw new Error(message)}
function bigrams(text:string){const xs=new Set<string>();for(let i=0;i<text.length-1;i++)xs.add(text.slice(i,i+2));return xs}
function similarity(a:string,b:string){
  const aa=bigrams(a),bb=bigrams(b);let overlap=0;
  for(const x of aa)if(bb.has(x))overlap++;
  const union=new Set([...aa,...bb]).size;
  return union?overlap/union:0;
}

assert(DAILY_SCENE_LIBRARY_SIZE>=50,`SCENE_LIBRARY_TOO_SMALL:${DAILY_SCENE_LIBRARY_SIZE}`);
assert(PUBLIC_TYPE_PATTERN_COUNT===32,`TYPE_PATTERN_COUNT_BAD:${PUBLIC_TYPE_PATTERN_COUNT}`);
assert(PRIMARY_RECOGNITION_HIT_COUNT===96,`PRIMARY_RECOGNITION_HIT_COUNT_BAD:${PRIMARY_RECOGNITION_HIT_COUNT}`);

const resultUi=fs.readFileSync('./src/features/money-personality/ResultCompetitiveV6.tsx','utf8');
const resultV7Css=fs.readFileSync('./src/features/money-personality/result-competitive-v7.css','utf8');
const resultV8Css=fs.readFileSync('./src/features/money-personality/result-competitive-v8.css','utf8');
for(const word of VAGUE_POINTERS)assert(!resultUi.includes(word),`RESULT_UI_VAGUE_POINTER:${word}`);
assert(!resultUi.includes('scene.body'),`RESULT_UI_REPEATS_SCENE_BODY`);
assert(!resultUi.includes('scene.insight'),`RESULT_UI_REPEATS_SCENE_INSIGHT`);
assert(!resultUi.includes('DAILY_SCENE_LIBRARY_SIZE'),`RESULT_UI_EXPOSES_INTERNAL_LIBRARY_COUNT`);
assert(resultUi.includes("primaryScenes=scenes.slice(0,3)"),`RESULT_UI_NOT_RECOGNITION_FIRST_THREE`);
assert(resultUi.indexOf('mpp-v7-scenes')<resultUi.indexOf('mpp-v7-type-core'),`RESULT_UI_EXPLAINS_BEFORE_RECOGNITION`);
assert(!resultUi.includes('WHY THIS TYPE?'),`RESULT_UI_DUPLICATES_AXIS_EXPLANATION`);
assert(resultUi.indexOf('mpp-v8-weapon')<resultUi.indexOf('mpp-v7-compare'),`RESULT_UI_WEAPON_ARC_TOO_LATE`);
assert(resultUi.includes('WEAPON_ARC:Record<JobCode,WeaponArc>'),`RESULT_UI_WEAPON_ARC_MISSING`);
assert(resultUi.includes('武器と暴走 / WEAPON → OVERDRIVE'),`RESULT_UI_WEAPON_OVERDRIVE_COPY_MISSING`);
assert(resultUi.includes('この武器がうまく働くと')&&resultUi.includes('暴走すると')&&resultUi.includes('扱い方はこれだけ'),`RESULT_UI_WEAPON_CAUSAL_FLOW_MISSING`);
assert(resultUi.indexOf('mpp-v7-compare')<resultUi.indexOf('mpp-v7-variant-details'),`RESULT_UI_SECONDARY_NUANCE_TOO_EARLY`);
assert(resultUi.includes('<details className="mpp-v7-variant-details">'),`RESULT_UI_SECONDARY_NUANCE_NOT_COLLAPSED`);
for(const selector of ['.mpp-vivid-scene','.mpp-result-v4-hit','.mpp-result-v4-identity','.mpp-style-synthesis']){
  assert(resultV7Css.includes(selector),`RESULT_DUPLICATE_SECTION_NOT_HIDDEN:${selector}`);
}
for(const selector of ['.mpp-result-v4-section-title','.mpp-result-companion--tight','.mpp-dialogue','.mpp-result-profile']){
  assert(resultV8Css.includes(selector),`RESULT_LEGACY_MANUAL_NOT_HIDDEN:${selector}`);
}

const signatures=new Set<string>();
const patternHeadlines=new Set<string>();
const patternWhys=new Set<string>();
const primaryVoiceTriples=new Set<string>();
const primaryPunchTriples=new Set<string>();
let totalScenes=0;
let totalTypes=0;
let minCategoryDiversity=99;
let maxPrimaryVoiceLength=0;
let maxWithinTypePunchSimilarity=0;

for(const job of JOBS){
  const jobSignatures=new Set<string>();
  for(const style of STYLES){
    totalTypes++;
    const pattern=corePatternForType(job,style);
    assert(pattern.headline.length>=18,`TYPE_CORE_HEADLINE_THIN:${job}-${style}:${pattern.headline}`);
    assert(pattern.why.length>=45,`TYPE_CORE_WHY_THIN:${job}-${style}:${pattern.why}`);
    assert(pattern.heroLabels.length===2,`TYPE_HERO_LABELS_BAD:${job}-${style}`);
    patternHeadlines.add(pattern.headline);
    patternWhys.add(pattern.why);
    const coreText=`${pattern.headline}${pattern.why}`;
    for(const word of FORBIDDEN)assert(!coreText.includes(word),`TYPE_CORE_OVERINFERENCE:${job}-${style}:${word}`);
    for(const word of VAGUE_POINTERS)assert(!coreText.includes(word),`TYPE_CORE_VAGUE_POINTER:${job}-${style}:${word}`);
    for(const word of ARBITRARY_VISIBLE_NUMBERS)assert(!coreText.includes(word),`TYPE_CORE_ARBITRARY_NUMBER:${job}-${style}:${word}`);

    const punches=primaryRecognitionPunchesForType(job,style);
    assert(punches.length===3,`PRIMARY_PUNCH_COUNT_BAD:${job}-${style}`);
    assert(new Set(punches).size===3,`PRIMARY_PUNCH_DUPLICATE:${job}-${style}`);
    primaryPunchTriples.add(punches.join('|'));
    for(let i=0;i<punches.length;i++)for(let j=i+1;j<punches.length;j++){
      const s=similarity(punches[i],punches[j]);
      maxWithinTypePunchSimilarity=Math.max(maxWithinTypePunchSimilarity,s);
      assert(s<0.68,`PRIMARY_PUNCH_TOO_SIMILAR:${job}-${style}:${i}-${j}:${s.toFixed(3)}:${punches[i]}|${punches[j]}`);
    }

    const scenes=dailyScenesForType(job,style,6);
    assert(scenes.length===6,`SCENE_COUNT_BAD:${job}-${style}:${scenes.length}`);

    const labels=scenes.map(x=>x.label);
    const voices=scenes.map(x=>x.voice);
    const categories=new Set(scenes.map(x=>x.category));
    minCategoryDiversity=Math.min(minCategoryDiversity,categories.size);
    assert(new Set(labels).size===6,`SCENE_LABEL_DUPLICATE:${job}-${style}:${labels.join('|')}`);
    assert(new Set(voices).size===6,`SCENE_VOICE_DUPLICATE:${job}-${style}`);
    assert(categories.size>=5,`SCENE_CATEGORY_DIVERSITY_LOW:${job}-${style}:${[...categories].join('|')}`);

    scenes.forEach((scene,index)=>{
      totalScenes++;
      assert(scene.title.length>=18,`SCENE_TITLE_TOO_THIN:${job}-${style}:${index}:${scene.title}`);
      assert(scene.body.length>=60,`SCENE_BODY_TOO_THIN:${job}-${style}:${index}:${scene.body}`);
      assert(scene.voice.length>=28,`SCENE_VOICE_TOO_THIN:${job}-${style}:${index}:${scene.voice}`);
      assert(scene.insight.length>=90,`SCENE_INSIGHT_TOO_THIN:${job}-${style}:${index}:${scene.insight}`);
      assert(scene.voice.startsWith('「')&&scene.voice.endsWith('」'),`SCENE_VOICE_NOT_MONOLOGUE:${job}-${style}:${index}`);
      assert(!scene.title.includes('何を基準にするか')||index>=4,`PRIMARY_SCENE_FALLBACK_COPY:${job}-${style}:${index}:${scene.title}`);
      const allText=`${scene.title}${scene.body}${scene.voice}${scene.insight}`;
      for(const word of FORBIDDEN)assert(!allText.includes(word),`SCENE_OVERINFERENCE:${job}-${style}:${index}:${word}`);
      const visibleText=`${scene.title}${scene.voice}`;
      for(const word of VAGUE_POINTERS)assert(!visibleText.includes(word),`SCENE_VISIBLE_VAGUE_POINTER:${job}-${style}:${index}:${word}`);
      if(index<3){
        maxPrimaryVoiceLength=Math.max(maxPrimaryVoiceLength,scene.voice.length);
        assert(scene.voice.length<=105,`PRIMARY_SCENE_VOICE_TOO_LONG:${job}-${style}:${index}:${scene.voice.length}:${scene.voice}`);
        for(const word of ARBITRARY_VISIBLE_NUMBERS)assert(!visibleText.includes(word),`PRIMARY_SCENE_ARBITRARY_NUMBER:${job}-${style}:${index}:${word}`);
      }
    });

    const primaryTriple=voices.slice(0,3).join('|');
    primaryVoiceTriples.add(primaryTriple);
    const signature=labels.slice(0,4).join('|');
    signatures.add(signature);
    jobSignatures.add(signature);
  }
  assert(jobSignatures.size>=3,`JOB_STYLE_SCENES_NOT_DISTINCT:${job}:${jobSignatures.size}`);
}

assert(totalTypes===32,`TYPE_COUNT_BAD:${totalTypes}`);
assert(patternHeadlines.size===32,`TYPE_CORE_HEADLINE_NOT_UNIQUE:${patternHeadlines.size}`);
assert(patternWhys.size===32,`TYPE_CORE_WHY_NOT_UNIQUE:${patternWhys.size}`);
assert(primaryPunchTriples.size===32,`PRIMARY_PUNCH_TRIPLES_NOT_UNIQUE:${primaryPunchTriples.size}`);
assert(primaryVoiceTriples.size===32,`PRIMARY_VOICE_TRIPLES_NOT_UNIQUE:${primaryVoiceTriples.size}`);
assert(signatures.size>=20,`SCENE_SIGNATURE_VARIETY_LOW:${signatures.size}`);

console.log(JSON.stringify({
  ok:true,
  qa:'MUDAGIRI_MONEY_SCENE_RESONANCE_V8',
  librarySize:DAILY_SCENE_LIBRARY_SIZE,
  publicTypePatterns:PUBLIC_TYPE_PATTERN_COUNT,
  primaryRecognitionHits:PRIMARY_RECOGNITION_HIT_COUNT,
  types:totalTypes,
  renderedScenes:totalScenes,
  uniqueCoreHeadlines:patternHeadlines.size,
  uniqueCoreWhys:patternWhys.size,
  uniquePrimaryPunchTriples:primaryPunchTriples.size,
  uniquePrimaryVoiceTriples:primaryVoiceTriples.size,
  uniquePrimarySignatures:signatures.size,
  minCategoryDiversity,
  maxPrimaryVoiceLength,
  maxWithinTypePunchSimilarity:Number(maxWithinTypePunchSimilarity.toFixed(3)),
  vaguePointerGuard:true,
  arbitraryVisibleNumberGuard:true,
  nonRepeatingPrimaryTripleGuard:true,
  recognitionFirst:true,
  duplicateLegacySectionsHidden:true,
  legacyManualHidden:true,
  weaponOverdriveCausalFlow:true,
  secondaryNuanceCollapsed:true,
},null,2));
