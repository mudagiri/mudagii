import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const result=readFileSync('src/features/money-personality/ResultV17.tsx','utf8');
const css=readFileSync('src/features/money-personality/chapter-unified-result-v1.css','utf8');
const ch2=readFileSync('ResultScreenChapter2V32.tsx','utf8');
const ch2css=readFileSync('chapter2-v32-rpg-css.ts','utf8');
const base=readFileSync('qa-chapters-v32-browser.mjs','utf8');
const checklist={
 chapter1ScreenScoped:result.includes('mpp17-unified-world')&&css.includes('.mpp17-unified-world'),
 chapter2ScreenScoped:ch2.includes('c2v32-chapter-label')&&ch2css.includes('.c2v32-chapter-label'),
 officialGuildWorld:css.includes('var(--mpp-bg-guild)'),
 progressConnected:result.includes('第1章 <b>JOB獲得</b>')&&ch2.includes('第1章 JOB獲得'),
 preservesSSR:result.includes('mpp17-holo-foil')&&result.includes('JobCharacterCard jobCode={jobCode} variant="hero"'),
 preservesTalk:result.includes('mpp17-mudagiri-beat')&&result.includes('MoneyPersonalityMudagiri'),
 preservesShare:result.includes('onShare(\'native\')')&&result.includes('mpp17-share-preview'),
 earlyNextQuest:result.includes('CHAPTER1_NEXT_BATTLE')&&result.includes('mpp17-unified-next-cta'),
 earlyAndDeepContinue:(result.match(/onClick=\{onHousehold\}/g)||[]).length===2,
 noLineGate:result.includes('ここから先もLINE登録なしで進められるよ。'),
 canonicalThreeEnemies:result.includes("(['mobile','sub','food'] as const)")&&result.includes("ENEMY_ASSETS[category].normal"),
 fakeSavingsNotShown:!result.includes('cUpper')&&!result.includes('confirmedA'),
 keepsExistingDetailedResult:result.includes('mpp17-style-detail')&&result.includes('mpp17-core')&&result.includes('mpp17-match'),
 enforcedByBrowser:base.includes('ch1Journey.loaded')&&base.includes('ch2Hud.includes'),
};
for(const [name,pass] of Object.entries(checklist))assert.ok(pass,'CHAPTERS_UNIFIED_GUARD_'+name);
console.log('CHAPTERS_UNIFIED_STATIC_QA_PASS',JSON.stringify(checklist));
