import {dailyScenesForType,DAILY_SCENE_LIBRARY_SIZE} from './src/features/money-personality/resultDailySceneNarrativeV4';
import type {JobCode,StyleId} from './src/features/money-personality/classifierV1';

const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const FORBIDDEN=['浪費家','ズボラ','ケチ','衝動買い','何も考えない','必ずこうする','絶対こうする'];

function assert(ok:unknown,message:string):asserts ok{if(!ok)throw new Error(message)}

assert(DAILY_SCENE_LIBRARY_SIZE>=50,`SCENE_LIBRARY_TOO_SMALL:${DAILY_SCENE_LIBRARY_SIZE}`);

const signatures=new Set<string>();
let totalScenes=0;
let totalTypes=0;
let minCategoryDiversity=99;

for(const job of JOBS){
  const jobSignatures=new Set<string>();
  for(const style of STYLES){
    totalTypes++;
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
      assert(scene.voice.startsWith('「')&&scene.voice.endsWith('」'),`SCENE_VOICE_NOT_MONOLOGUE:${job}-${style}:${index}`);
      assert(!scene.title.includes('何を基準にするか')||index>=4,`PRIMARY_SCENE_FALLBACK_COPY:${job}-${style}:${index}:${scene.title}`);
      const text=`${scene.title}${scene.body}${scene.voice}`;
      for(const word of FORBIDDEN)assert(!text.includes(word),`SCENE_OVERINFERENCE:${job}-${style}:${index}:${word}`);
    });

    const signature=labels.slice(0,4).join('|');
    signatures.add(signature);
    jobSignatures.add(signature);
  }
  assert(jobSignatures.size>=3,`JOB_STYLE_SCENES_NOT_DISTINCT:${job}:${jobSignatures.size}`);
}

assert(signatures.size>=20,`SCENE_SIGNATURE_VARIETY_LOW:${signatures.size}`);

console.log(JSON.stringify({
  ok:true,
  qa:'MUDAGIRI_MONEY_SCENE_RESONANCE_V1',
  librarySize:DAILY_SCENE_LIBRARY_SIZE,
  types:totalTypes,
  renderedScenes:totalScenes,
  uniquePrimarySignatures:signatures.size,
  minCategoryDiversity,
},null,2));
