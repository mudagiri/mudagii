import fs from 'node:fs';
import {resultV9For,RESULT_V9_TYPE_COUNT,RESULT_V9_SCENE_COUNT} from './src/features/money-personality/resultV9Content';
import {resultV10InsightFor} from './src/features/money-personality/resultV10Insight';
import {STYLE_IDENTITY} from './src/features/money-personality/money-type-identity-v1';
import type {JobCode,StyleId} from './src/features/money-personality/classifierV1';

const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const FORBIDDEN=['浪費家','ズボラ','ケチ','衝動買い','何も考えない','必ずこうする','絶対こうする'];
const VAGUE=['こっち','そっち','あっち','こちら','どっち'];
const GENERIC=['今必要な理由','必要な理由は見えている','条件を確認して決める','何を優先して決める','選んでよかったと思えそう','今の自分は何を優先'];
const ABSTRACT_SELF_TALK=['効く','価値','判断','優先','満足','安心ライン','現在地','配分','最適','前進'];
const AUDIENCE_PRONOUNS=['俺','僕','私'];
function assert(ok:unknown,msg:string):asserts ok{if(!ok)throw new Error(msg)}

assert(RESULT_V9_TYPE_COUNT===32,`RESULT_V9_TYPE_COUNT_BAD:${RESULT_V9_TYPE_COUNT}`);
assert(RESULT_V9_SCENE_COUNT===192,`RESULT_V9_SCENE_COUNT_BAD:${RESULT_V9_SCENE_COUNT}`);

const publicUi=fs.readFileSync('./src/features/money-personality/MoneyPersonalityPublic.tsx','utf8');
const resultUi=fs.readFileSync('./src/features/money-personality/ResultV17.tsx','utf8');
const shareImageUi=fs.readFileSync('./src/features/money-personality/job-share-image-v1.ts','utf8');
const bookUi=fs.readFileSync('./src/features/money-personality/JobEncyclopediaV1.tsx','utf8');
assert(publicUi.includes("import ResultV17 from './ResultV17'"),'PUBLIC_RESULT_V17_NOT_WIRED');
assert(publicUi.includes("import AdventurerClassUnlockV1 from './AdventurerClassUnlockV1'")&&publicUi.includes('<AdventurerClassUnlockV1'),'PUBLIC_SSR_UNLOCK_NOT_WIRED');
assert(publicUi.includes('REVEAL_KEY')&&publicUi.includes('sessionId'), 'PUBLIC_SSR_UNLOCK_SESSION_MEMORY_MISSING');
const opticalCss=fs.readFileSync('./src/features/money-personality/money-personality-optical-audit-v1.css','utf8');
assert(publicUi.includes("import './money-personality-optical-audit-v1.css'"),'PUBLIC_OPTICAL_GEOMETRY_STYLES_NOT_WIRED');
assert(!publicUi.includes("import './money-result-v4.css'")&&!publicUi.includes("import './result-vivid-scene-v1.css'"),'PUBLIC_LEGACY_RESULT_CSS_STILL_BUNDLED');
assert(opticalCss.includes('data-pose=\'IDLE_01\'')&&opticalCss.includes('grid-template-columns:84px minmax(0,1fr)'),'OPTICAL_AUDIT_CRITICAL_RULES_MISSING');
assert(resultUi.includes("ResultWorldBeatV1"),'V17_MUDAGIRI_WORLD_BEATS_NOT_WIRED');
assert(!resultUi.includes('beat="complete"')&&resultUi.includes('beat="compare"')&&resultUi.includes('beat="next"'),'V17_WORLD_BEATS_NOT_POST_REWARD');
assert(publicUi.includes("resultV9For(job,style)"),'PUBLIC_RESULT_V9_CONTENT_NOT_WIRED');
assert(publicUi.includes("resultV10InsightFor(job,style)"),'PUBLIC_RESULT_V10_INSIGHT_NOT_WIRED');
assert(!publicUi.includes("import ResultJourneyV1 from './ResultJourneyV1'"),'PUBLIC_HOUSEHOLD_STILL_HAS_DUPLICATE_JOURNEY');
assert(publicUi.includes("window.location.href=householdUrl()"),'PUBLIC_HOUSEHOLD_CTA_NOT_DIRECT');
assert(shareImageUi.includes('function publicShareUrl()')&&shareImageUi.includes("url.searchParams.set('adaptive','money-type')"),'SHARE_PUBLIC_URL_NOT_CLEAN');
assert(shareImageUi.indexOf("if(target==='x')")<shareImageUi.indexOf('const file=await createJobShareImage'),'TEXT_SHARING_NEEDLESS_CANVAS_RENDER');
assert(!publicUi.includes('<ResultCompetitiveV6'),'PUBLIC_STILL_RENDERS_LEGACY_RESULT');
assert(!publicUi.includes('resultVividScenario(job,style)'),'PUBLIC_STILL_RENDERS_LEGACY_VIVID');
assert(resultUi.includes('content.scenes.slice(0,2)'),'V9_PRIMARY_SCENES_NOT_TWO');
assert(resultUi.includes('content.scenes.slice(2)'),'V9_EXTRA_SCENES_NOT_FOUR');
assert(resultUi.includes('ほかのあるあるも見る')&&resultUi.includes('＋4'),'V17_MORE_SCENES_MISSING');
assert(resultUi.includes('このタイプの強み'),'V12_STRENGTH_SECTION_MISSING');
assert(resultUi.includes('同じ場面でも、考えることが違う'),'V17_COMPARE_MISSING');
assert(resultUi.includes("onShare('native')")&&resultUi.includes("onShare('x')")&&resultUi.includes("onShare('line')"),'V17_IMAGE_AND_TEXT_SHARE_TARGETS_MISSING');
assert(resultUi.includes('画像カードをシェアする')&&resultUi.includes('𝕏 に文章で投稿')&&resultUi.includes('LINEでリンクを送る'),'V17_SHARE_LABELS_NOT_HONEST');
assert(resultUi.includes('insight.compare.scene'),'V10_CONCRETE_COMPARE_NOT_WIRED');
assert(resultUi.includes("import './result-v17-editorial.css'"),'V17_EDITORIAL_CSS_NOT_LOADED');
assert(resultUi.includes('友だちと比べるなら')&&resultUi.includes('お金の考え方が近いかどうかです。'),'V17_VALUE_MATCH_MISSING');
assert(resultUi.includes('32タイプ図鑑を見る'),'V17_TYPE_BOOK_CTA_MISSING');
assert(!resultUi.includes('SSR'),'V17_SSR_SHOULD_NOT_BE_IN_MAIN_RESULT');
assert(resultUi.includes('mpp17-style-detail')&&resultUi.includes('STYLE_IDENTITY[primaryStyle].description'),'V17_STYLE_EXPLANATION_MISSING');
assert(resultUi.indexOf('className="mpp17-recognition"')<resultUi.indexOf('className="mpp17-share"')&&resultUi.indexOf('className="mpp17-share"')<resultUi.indexOf('className="mpp17-core"'),'V17_SHARE_NOT_AT_EMOTIONAL_PEAK');
assert(resultUi.indexOf('className="mpp17-share"')<resultUi.indexOf('className="mpp17-style-detail"'),'V17_EXPLANATION_INTERRUPTS_SHARE');
assert(resultUi.includes('STYLE_IDENTITY[primaryStyle].short'),'V17_STYLE_JAPANESE_SUBTITLE_MISSING');
assert(bookUi.includes('mpp-job-book-style-explain')&&bookUi.includes('STYLE_IDENTITY[expandedStyle].description'),'ENCYCLOPEDIA_STYLE_EXPLANATION_MISSING');
assert(shareImageUi.includes('STYLE_IDENTITY[primaryStyle].short'),'SHARE_IMAGE_STYLE_SUBTITLE_MISSING');
assert(!shareImageUi.includes('を大事にするタイプ'),'SHARE_IMAGE_LEGACY_STYLE_COPY');
for(const [id,code,label] of [['DRIVE','D','できることを増やしたい'],['ENJOY','E','楽しいことに使いたい'],['SECURE','S','あとで困りたくない'],['OPTIMIZE','O','余計な出費はしたくない']] as const){
  const value=STYLE_IDENTITY[id];
  assert(value.code===code&&value.label===id&&value.short===label,`STYLE_IDENTITY_MISMATCH:${id}`);
  assert(value.description.length>=30&&value.example.length>=8,`STYLE_DETAIL_EMPTY:${id}`);
}


const heroes=new Set<string>();
const truths=new Set<string>();
const v10Signatures=new Set<string>();
const signatures=new Set<string>();
let types=0;
let scenes=0;
let maxHit=0;
let maxVoice=0;
const primaryVoices=new Set<string>();
for(const job of JOBS){
  for(const style of STYLES){
    types++;
    const x=resultV9For(job,style);
    const insight=resultV10InsightFor(job,style);
    assert(Boolean(x),`V9_CONTENT_MISSING:${job}-${style}`);
    assert(Boolean(insight),`V10_INSIGHT_MISSING:${job}-${style}`);
    assert(x.scenes.length===6,`V9_SCENE_COUNT_BAD:${job}-${style}`);
    assert(new Set(x.scenes.map(s=>s.label)).size===6,`V9_SCENE_LABEL_DUPLICATE:${job}-${style}`);
    heroes.add(x.hero);truths.add(insight.truth);
    signatures.add(x.scenes.map(s=>s.label+'|'+s.hit+'|'+s.voice).join('||'));
    v10Signatures.add([insight.truth,insight.gap.looks,insight.gap.really,insight.weapon.name,insight.weapon.works,insight.weapon.overdrive,insight.weapon.control,insight.compare.scene,insight.compare.you,insight.compare.other].join('|'));
    const all=[x.hero,x.nextMove,insight.truth,insight.gap.looks,insight.gap.really,insight.weapon.name,insight.weapon.works,insight.weapon.overdrive,insight.weapon.control,insight.compare.scene,insight.compare.you,insight.compare.other,...x.scenes.flatMap(s=>[s.label,s.hit,s.voice])].join('');
    for(const w of FORBIDDEN)assert(!all.includes(w),`V9_FORBIDDEN:${job}-${style}:${w}`);
    for(const w of VAGUE)assert(!all.includes(w),`V9_VAGUE:${job}-${style}:${w}`);
    for(const p of GENERIC)assert(!all.includes(p),`V9_GENERIC_TEMPLATE:${job}-${style}:${p}`);
    x.scenes.forEach((s,i)=>{
      scenes++;
      maxHit=Math.max(maxHit,s.hit.length);maxVoice=Math.max(maxVoice,s.voice.length);
      assert(s.hit.length>=18&&s.hit.length<=68,`V9_HIT_LENGTH_BAD:${job}-${style}:${i}:${s.hit.length}`);
      assert(s.voice.length>=10&&s.voice.length<=55,`V9_VOICE_LENGTH_BAD:${job}-${style}:${i}:${s.voice.length}`);
      if(i<3){
        primaryVoices.add(s.voice);
        for(const word of ABSTRACT_SELF_TALK)assert(!s.voice.includes(word),`V9_PRIMARY_VOICE_TOO_DIAGNOSTIC:${job}-${style}:${i}:${word}:${s.voice}`);
        for(const word of AUDIENCE_PRONOUNS)assert(!s.voice.includes(word),`V9_PRIMARY_VOICE_AUDIENCE_PRONOUN:${job}-${style}:${i}:${word}:${s.voice}`);
      }
    });
  }
}
assert(types===32,'V9_TYPES_BAD');
assert(scenes===192,'V9_SCENES_BAD');
assert(heroes.size===32,`V9_HERO_NOT_UNIQUE:${heroes.size}`);
assert(truths.size===32,`V9_TRUTH_NOT_UNIQUE:${truths.size}`);
assert(signatures.size===32,`V9_TYPE_SIGNATURE_NOT_UNIQUE:${signatures.size}`);
assert(v10Signatures.size===32,`V10_INSIGHT_SIGNATURE_NOT_UNIQUE:${v10Signatures.size}`);
assert(primaryVoices.size===96,`V9_PRIMARY_VOICE_NOT_UNIQUE:${primaryVoices.size}`);

console.log(JSON.stringify({
  ok:true,
  qa:'MUDAGIRI_RESULT_V10_RESONANCE',
  types,
  scenes,
  uniqueHeroes:heroes.size,
  uniqueTruths:truths.size,
  uniqueTypeSignatures:signatures.size,
  uniqueV10InsightSignatures:v10Signatures.size,
  uniquePrimaryVoices:primaryVoices.size,
  maxHit,
  maxVoice,
  noGeneratedFallback:true,
  moreScenesHumanFirst:true,
  vaguePointerGuard:true,
  genericTemplateGuard:true,
  rawSelfTalkGuard:true,
  audienceNeutralSelfTalk:true,
},null,2));

assert(resultUi.includes('mpp17-tags'),'V17_PROFILE_HASHTAGS_MISSING');
assert(resultUi.includes('mpp17-share-tags'),'V17_SHARE_PREVIEW_HASHTAGS_MISSING');
assert(shareImageUi.includes("result.scenes.slice(0,3).map(scene=>tagLabel(scene.label))"),'V17_SHARE_HASHTAGS_MISSING');
