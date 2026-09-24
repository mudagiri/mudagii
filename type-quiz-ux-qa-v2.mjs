import fs from 'node:fs';
const app=fs.readFileSync(new URL('./MudagiriAppV2.tsx',import.meta.url),'utf8');
const questionnaire=fs.readFileSync(new URL('./type-questionnaire-v2.ts',import.meta.url),'utf8');
const tests=[
 ['8 questions remain', (questionnaire.match(/id:'Q[1-8]'/g)||[]).length===8],
 ['one-question index state', app.includes('psychQuestionIndex')],
 ['progress shows x / 8', app.includes('{psychQuestionIndex+1} / 8')],
 ['single current question rendered', app.includes('TYPE_QUESTIONS[psychQuestionIndex]')],
 ['old full map removed', !app.includes('TYPE_QUESTIONS.map((q,i)=><TypeQ')],
 ['four forced-choice answers', app.includes("v:2,label:'かなり近い'") && app.includes("v:-2,label:'かなり近い'")],
 ['no neutral option', app.includes('真ん中はなし')],
 ['back one question', app.includes('← 1問戻る')],
 ['answers editable', app.includes('回答は戻って変更できます')],
 ['auto advance', app.includes('setPsychQuestionIndex(i=>Math.min(i+1')],
 ['final gate requires all answers', app.includes('TYPE_QUESTIONS.some(q=>typeAnswers[q.id]===undefined)')],
 ['completion CTA', app.includes('属性判定を完了する →')],
 ['answer analytics event', app.includes("type_question_answered")],
 ['axis scoring untouched', questionnaire.includes("const code=((scores.fv>=0?'F':'V')")],
];
let pass=0;
for(const [name,ok] of tests){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}
console.log(`\n${pass}/${tests.length} PASS`);
if(pass!==tests.length) process.exit(1);
