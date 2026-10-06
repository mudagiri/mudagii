import fs from 'node:fs';
import {
  corePatternForType,
  dailyScenesForType,
  humanRecognitionScenesForType,
  DAILY_SCENE_LIBRARY_SIZE,
  PUBLIC_TYPE_PATTERN_COUNT,
  PRIMARY_RECOGNITION_HIT_COUNT,
  HUMAN_RECOGNITION_SCENE_COUNT,
} from './src/features/money-personality/resultDailySceneNarrativeV7';
import type {JobCode,StyleId} from './src/features/money-personality/classifierV1';

const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const FORBIDDEN=['浪費家','ズボラ','ケチ','衝動買い','何も考えない','必ずこうする','絶対こうする'];
const VAGUE_POINTERS=['こっち','そっち','あっち','こちら','どっち'];
const ARBITRARY_VISIBLE_NUMBERS=['数か月','数年','半年','20分','数千円'];
const GENERIC_VISIBLE=[
  '今必要な理由',
  '必要な理由は見えている',
  '条件を確認して決める',
  '何を優先して決める',
  '選んでよかったと思えそう',
  '今の自分は何を優先',
];

function assert(ok:unknown,message:string):asserts ok{if(!ok)throw new Error(message)}

assert(DAILY_SCENE_LIBRARY_SIZE>=50,`SCENE_LIBRARY_TOO_SMALL:${DAILY_SCENE_LIBRARY_SIZE}`);
assert(PUBLIC_TYPE_PATTERN_COUNT===32,`TYPE_PATTERN_COUNT_BAD:${PUBLIC_TYPE_PATTERN_COUNT}`);
assert(PRIMARY_RECOGNITION_HIT_COUNT===96,`PRIMARY_RECOGNITION_HIT_COUNT_BAD:${PRIMARY_RECOGNITION_HIT_COUNT}`);
assert(HUMAN_RECOGNITION_SCENE_COUNT===96,`HUMAN_RECOGNITION_SCENE_COUNT_BAD:${HUMAN_RECOGNITION_SCENE_COUNT}`);

const resultUi=fs.readFileSync('./src/features/money-personality/ResultCompetitiveV6.tsx','utf8');
const resultV7Css=fs.readFileSync('./src/features/money-personality/result-competitive-v7.css','utf8');
const resultV8Css=fs.readFileSync('./src/features/money-personality/result-competitive-v8.css','utf8');
for(const word of VAGUE_POINTERS)assert(!resultUi.includes(word),`RESULT_UI_VAGUE_POINTER:${word}`);
assert(resultUi.includes("from './resultDailySceneNarrativeV7'"),`RESULT_UI_NOT_USING_HUMAN_SCENES_V7`);
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

const patternHeadlines=new Set<string>();
const patternWhys=new Set<string>();
const humanTitles=new Set<string>();
const humanVoices=new Set<string>();
const typeTriples=new Set<string>();
let totalTypes=0;
let totalScenes=0;
let minCategoryDiversity=99;
let maxHumanTitleLength=0;
let maxHumanVoiceLength=0;

for(const job of JOBS){
  for(const style of STYLES){
    totalTypes++;
    const pattern=corePatternForType(job,style);
    assert(pattern.headline.length>=18,`TYPE_CORE_HEADLINE_THIN:${job}-${style}:${pattern.headline}`);
    assert(pattern.why.length>=45,`TYPE_CORE_WHY_THIN:${job}-${style}:${pattern.why}`);
    patternHeadlines.add(pattern.headline);
    patternWhys.add(pattern.why);
    const coreText=`${pattern.headline}${pattern.why}`;
    for(const word of FORBIDDEN)assert(!coreText.includes(word),`TYPE_CORE_OVERINFERENCE:${job}-${style}:${word}`);
    for(const word of VAGUE_POINTERS)assert(!coreText.includes(word),`TYPE_CORE_VAGUE_POINTER:${job}-${style}:${word}`);
    for(const word of ARBITRARY_VISIBLE_NUMBERS)assert(!coreText.includes(word),`TYPE_CORE_ARBITRARY_NUMBER:${job}-${style}:${word}`);

    const hits=humanRecognitionScenesForType(job,style);
    assert(hits.length===3,`HUMAN_HIT_COUNT_BAD:${job}-${style}`);
    assert(new Set(hits.map(x=>x.label)).size===3,`HUMAN_HIT_LABEL_DUPLICATE:${job}-${style}`);
    assert(new Set(hits.map(x=>x.category)).size===3,`HUMAN_HIT_CATEGORY_DUPLICATE:${job}-${style}`);
    typeTriples.add(hits.map(x=>`${x.label}|${x.title}|${x.voice}`).join('||'));

    hits.forEach((hit,index)=>{
      humanTitles.add(hit.title);humanVoices.add(hit.voice);
      maxHumanTitleLength=Math.max(maxHumanTitleLength,hit.title.length);
      maxHumanVoiceLength=Math.max(maxHumanVoiceLength,hit.voice.length);
      assert(hit.title.length>=15&&hit.title.length<=64,`HUMAN_TITLE_LENGTH_BAD:${job}-${style}:${index}:${hit.title.length}:${hit.title}`);
      assert(hit.voice.length>=12&&hit.voice.length<=55,`HUMAN_VOICE_LENGTH_BAD:${job}-${style}:${index}:${hit.voice.length}:${hit.voice}`);
      const visible=`${hit.label}${hit.title}${hit.voice}`;
      for(const word of VAGUE_POINTERS)assert(!visible.includes(word),`HUMAN_VISIBLE_VAGUE_POINTER:${job}-${style}:${index}:${word}`);
      for(const word of ARBITRARY_VISIBLE_NUMBERS)assert(!visible.includes(word),`HUMAN_VISIBLE_ARBITRARY_NUMBER:${job}-${style}:${index}:${word}`);
      for(const phrase of GENERIC_VISIBLE)assert(!visible.includes(phrase),`HUMAN_VISIBLE_GENERIC_TEMPLATE:${job}-${style}:${index}:${phrase}`);
      for(const word of FORBIDDEN)assert(!visible.includes(word),`HUMAN_VISIBLE_OVERINFERENCE:${job}-${style}:${index}:${word}`);
    });

    const scenes=dailyScenesForType(job,style,6);
    assert(scenes.length===6,`SCENE_COUNT_BAD:${job}-${style}:${scenes.length}`);
    totalScenes+=scenes.length;
    const categories=new Set(scenes.map(x=>x.category));
    minCategoryDiversity=Math.min(minCategoryDiversity,categories.size);
    assert(new Set(scenes.map(x=>x.label)).size===6,`SCENE_LABEL_DUPLICATE:${job}-${style}`);
    assert(categories.size>=5,`SCENE_CATEGORY_DIVERSITY_LOW:${job}-${style}:${[...categories].join('|')}`);
    for(let index=0;index<3;index++){
      assert(scenes[index].title===hits[index].title,`RENDERED_HUMAN_TITLE_MISMATCH:${job}-${style}:${index}`);
      assert(scenes[index].voice===`「${hits[index].voice}」`,`RENDERED_HUMAN_VOICE_MISMATCH:${job}-${style}:${index}`);
    }
  }
}

assert(totalTypes===32,`TYPE_COUNT_BAD:${totalTypes}`);
assert(totalScenes===192,`TOTAL_RENDERED_SCENES_BAD:${totalScenes}`);
assert(patternHeadlines.size===32,`TYPE_CORE_HEADLINE_NOT_UNIQUE:${patternHeadlines.size}`);
assert(patternWhys.size===32,`TYPE_CORE_WHY_NOT_UNIQUE:${patternWhys.size}`);
assert(typeTriples.size===32,`HUMAN_TYPE_TRIPLES_NOT_UNIQUE:${typeTriples.size}`);
assert(humanTitles.size>=92,`HUMAN_TITLE_VARIETY_LOW:${humanTitles.size}`);
assert(humanVoices.size>=92,`HUMAN_VOICE_VARIETY_LOW:${humanVoices.size}`);

console.log(JSON.stringify({
  ok:true,
  qa:'MUDAGIRI_MONEY_SCENE_RESONANCE_V9_HUMAN_FIRST',
  librarySize:DAILY_SCENE_LIBRARY_SIZE,
  publicTypePatterns:PUBLIC_TYPE_PATTERN_COUNT,
  humanRecognitionScenes:HUMAN_RECOGNITION_SCENE_COUNT,
  types:totalTypes,
  renderedScenes:totalScenes,
  uniqueHumanTitles:humanTitles.size,
  uniqueHumanVoices:humanVoices.size,
  uniqueHumanTypeTriples:typeTriples.size,
  minCategoryDiversity,
  maxHumanTitleLength,
  maxHumanVoiceLength,
  genericTemplateGuard:true,
  vaguePointerGuard:true,
  arbitraryVisibleNumberGuard:true,
  recognitionFirst:true,
  legacyManualHidden:true,
  weaponOverdriveCausalFlow:true,
},null,2));
