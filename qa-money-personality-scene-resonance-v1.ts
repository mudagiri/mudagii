import fs from 'node:fs';
import {corePatternForType,dailyScenesForType,DAILY_SCENE_LIBRARY_SIZE,PUBLIC_TYPE_PATTERN_COUNT} from './src/features/money-personality/resultDailySceneNarrativeV5';
import type {JobCode,StyleId} from './src/features/money-personality/classifierV1';

const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const FORBIDDEN=['浪費家','ズボラ','ケチ','衝動買い','何も考えない','必ずこうする','絶対こうする'];
const VAGUE_POINTERS=['こっち','そっち','あっち','こちら','どっち'];

function assert(ok:unknown,message:string):asserts ok{if(!ok)throw new Error(message)}

assert(DAILY_SCENE_LIBRARY_SIZE>=50,`SCENE_LIBRARY_TOO_SMALL:${DAILY_SCENE_LIBRARY_SIZE}`);
assert(PUBLIC_TYPE_PATTERN_COUNT===32,`TYPE_PATTERN_COUNT_BAD:${PUBLIC_TYPE_PATTERN_COUNT}`);

const resultUi=fs.readFileSync('./src/features/money-personality/ResultCompetitiveV6.tsx','utf8');
for(const word of VAGUE_POINTERS)assert(!resultUi.includes(word),`RESULT_UI_VAGUE_POINTER:${word}`);
assert(!resultUi.includes('scene.body'),`RESULT_UI_REPEATS_SCENE_BODY`);
assert(!resultUi.includes('scene.insight'),`RESULT_UI_REPEATS_SCENE_INSIGHT`);

const signatures=new Set<string>();
const patternHeadlines=new Set<string>();
const patternWhys=new Set<string>();
let totalScenes=0;
let totalTypes=0;
let minCategoryDiversity=99;

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
    });

    const signature=labels.slice(0,4).join('|');
    signatures.add(signature);
    jobSignatures.add(signature);
  }
  assert(jobSignatures.size>=3,`JOB_STYLE_SCENES_NOT_DISTINCT:${job}:${jobSignatures.size}`);
}

assert(totalTypes===32,`TYPE_COUNT_BAD:${totalTypes}`);
assert(patternHeadlines.size===32,`TYPE_CORE_HEADLINE_NOT_UNIQUE:${patternHeadlines.size}`);
assert(patternWhys.size===32,`TYPE_CORE_WHY_NOT_UNIQUE:${patternWhys.size}`);
assert(signatures.size>=20,`SCENE_SIGNATURE_VARIETY_LOW:${signatures.size}`);

console.log(JSON.stringify({
  ok:true,
  qa:'MUDAGIRI_MONEY_SCENE_RESONANCE_V3',
  librarySize:DAILY_SCENE_LIBRARY_SIZE,
  publicTypePatterns:PUBLIC_TYPE_PATTERN_COUNT,
  types:totalTypes,
  renderedScenes:totalScenes,
  uniqueCoreHeadlines:patternHeadlines.size,
  uniqueCoreWhys:patternWhys.size,
  uniquePrimarySignatures:signatures.size,
  minCategoryDiversity,
  vaguePointerGuard:true,
  duplicateSceneBodyHidden:true,
},null,2));
