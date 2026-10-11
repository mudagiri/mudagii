/**
 * Release candidate static checks. These are guardrails, not production
 * end-to-end proof or a replacement for checking the real GAS/LINE backends.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=p=>readFileSync(p,'utf8');
const c1=text('src/features/money-personality/ResultV17.tsx');
const c1css=text('src/features/money-personality/chapter1-to-chapter2-launch-bridge.css');
const c2=text('ResultScreenChapter2V32.tsx');
const app=text('MudagiriAppV2.tsx');
const c1line=text('src/features/money-personality/line-conversion-v1.ts');
const persist=text('persistence-v3.ts');
const deploy=text('.github/workflows/deploy-pages.yml');
const bridge={
  ch1ToCh2Label:c1.includes('NEXT QUEST ／ 第2章へ'),
  ch1ToCh2Button:c1.includes('家計クエストへ進む'),
  ch1KeepsAvatar:c1.includes('mpp17-mudagiri-beat'),
  ch1ToCh2CSS:c1.includes("import './chapter1-to-chapter2-launch-bridge.css'")&&c1css.includes('.mpp17-page .mpp17-next'),
  ch2RpgPortraits:(c2.match(/<MudagiriBeat pose=/g)||[]).length===5,
  allEnemies:c2.includes('ENEMY_FULL_GALLERY')&&c2.includes('enemy?.name')&&c2.includes('ENEMY_ASSETS'),
  ch2FutureAccurate:c2.includes('reviewUpper*120')&&c2.includes('未確定の参考シミュレーション'),
  frozenCoreNotAffected:!c1css.includes('.mpp17-profile')&&!c1css.includes('.c2v2-'),
  activeResultBeforeLine:c2.includes('onBeforeExternal?.()')&&app.includes('readActiveResultV1()'),
  lineTargetMatched:c1line.includes("LINE_URL='https://lin.ee/ZeLu7i6'")&&c2.includes('https://lin.ee/ZeLu7i6')&&app.includes('https://lin.ee/ZeLu7i6'),
  chapter2V32FlagExplicit:app.includes("VITE_CHAPTER2_V32")&&app.includes('ResultScreenChapter2V32'),
  gasSendOpaqueNotReceipt:persist.includes("mode:'no-cors'")&&persist.includes("keepalive:true"),
  prodReleaseNotYetV32:!deploy.includes('VITE_CHAPTER2_V32:')
};
for(const [name,passed] of Object.entries(bridge))assert.ok(passed,'Launch RC static guard failed: '+name);
console.log(JSON.stringify({suite:'MUDAGIRI_CHAPTERS_LAUNCH_RC_STATIC_V1',guards:bridge,passed:Object.keys(bridge).length,
 externalNotVerified:['household_GAS_ack_and_sheet','money_personality_GAS_ack_and_sheet','LINE_consultation_booking_completion','real_iOS_Android_appearance'],productionNotChanged:true}));
