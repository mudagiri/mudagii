import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ResultScreenChapter2V2 from './ResultScreenChapter2V2';
import {
 chapter2V2Enabled,chapter2V2ResumeScene,parseChapter1HandoffV1,
 readChapter1HandoffV1,chapter2V2ShareText,chapter2V2ReferralUrl,chapter2V2SignedComparisonYen,CHAPTER1_HANDOFF_STORAGE_KEY,
} from './chapter2-v2-contract';

assert.equal(chapter2V2Enabled('',undefined),false,'V1 must stay the default');
assert.equal(chapter2V2Enabled('?chapter2v2=1',undefined),true);
assert.equal(chapter2V2Enabled('', '1'),true);
assert.equal(chapter2V2Enabled('?chapter2v2=0','0'),false);
assert.equal(chapter2V2ResumeScene('typeQuiz',true),'battleIntro');
assert.equal(chapter2V2ResumeScene('typeComplete',true),'battleIntro');
assert.equal(chapter2V2ResumeScene('appraisal',true),'appraisal');
assert.equal(chapter2V2ResumeScene('typeQuiz',false),'typeQuiz');

const raw=JSON.stringify({
 version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',sessionId:'chapter1-session',
 anonymousUserId:'anon-1',completedAt:'2026-10-09T05:00:00.000Z',
 jobCode:'FDM',jobName:'冒険者',primaryStyle:'DRIVE'
});
assert.equal(parseChapter1HandoffV1(raw,'anon-1')?.jobCode,'FDM');
assert.equal(parseChapter1HandoffV1(raw,'anon-2'),null,'no cross-identity type inheritance');
assert.equal(parseChapter1HandoffV1(null,'anon-1'),null);
assert.equal(parseChapter1HandoffV1('{bad','anon-1'),null);
assert.equal(parseChapter1HandoffV1(raw.replace('FDM','XXX'),'anon-1'),null);
assert.equal(parseChapter1HandoffV1(raw.replace('DRIVE','INVALID'),'anon-1'),null);
const fakeStorage={getItem:(key:string)=>key===CHAPTER1_HANDOFF_STORAGE_KEY?raw:null};
assert.equal(readChapter1HandoffV1('anon-1',fakeStorage)?.jobName,'冒険者');
const text=chapter2V2ShareText('https://example.test/mudagii/?ref=share');
assert.equal(chapter2V2SignedComparisonYen(-1800),'−¥1,800');
assert.equal(chapter2V2SignedComparisonYen(1800),'+¥1,800');
assert.equal(chapter2V2SignedComparisonYen(0),'±¥0');
assert.equal(chapter2V2SignedComparisonYen(Number.NaN),'—');
assert.match(text,/家計クエスト/);
assert.equal(chapter2V2ReferralUrl('https://mudagiri.github.io/mudagii/?chapter2v2=1','x'),'https://mudagiri.github.io/mudagii/pilot/money-type/?utm_source=x&utm_campaign=household_quest_clear');
assert.doesNotMatch(text,/TYPE MODEL|称号|\d+円|¥/);
assert.match(text,/\n/,'share should have actual line breaks');

const quiz=readFileSync('RpgBlock1.tsx','utf8');
assert.match(quiz,/if\(chapter2V2\)\{/);
assert.match(quiz,/setScene\('battleIntro'\)/);
assert.match(quiz,/typeAnswers:chapter2V2\?\{\}:typeAnswers/);
const app=readFileSync('MudagiriAppV2.tsx','utf8');
assert.match(app,/chapter2V2\?null:scoreTypeAnswersV31/);
assert.match(app,/ResultScreenChapter2V2/);
assert.match(app,/chapter2Version:'V2_NO_DUPLICATE_PERSONALITY'/);

const mock:any={
 version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'diag-unit-test',toneMode:'serious',
 rows:[],v5Counts:{cut:0,optimize:0,protect:0,inspect:0},
 potential:{confirmedA:0,cUpper:0},firstQuest:null,consultRoute:null,
};
const html=renderToStaticMarkup(React.createElement(ResultScreenChapter2V2,{vm:mock}));
assert.match(html,/家計クエスト/);
assert.match(html,/ライフプラン相談/);
assert.match(html,/画像カードをシェア/);
assert.doesNotMatch(html,/8タイプ図鑑|TYPE UNLOCKED|称号を獲得|お金タイプの3つの傾向/);
const withChapter1=renderToStaticMarkup(React.createElement(ResultScreenChapter2V2,{
 vm:mock,chapter1:parseChapter1HandoffV1(raw,'anon-1')
}));
assert.match(withChapter1,/第1章から引き継いだ職業/);
assert.match(withChapter1,/冒険者/);
assert.doesNotMatch(html,/第1章から引き継いだ職業/,'no fake Chapter 1 result');

console.log('CHAPTER2_V2_UX_CONTRACT_QA PASS: V1 isolation, 8-question skip, resume, handoff, battle-first result, share privacy');
