import fs from 'node:fs';

const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const gas=fs.readFileSync('./MUDAGIRI_GAS_CODE_V4.gs','utf8');

const checks=[
 ['snapshot persists Result V5 analytics',app.includes('analyticsV5:v.scopeV4?{')&&app.includes('resultVmVersion:vmV5.methodologyVersion')&&app.includes('firstQuest:vmV5.firstQuest?.category??null')],
 ['LINE lead carries potential values',app.includes('confirmedMonthly:result.potential?.confirmedA')&&app.includes('potentialLower:result.potential?.lower')&&app.includes('potentialUpper:result.potential?.upper')],
 ['GAS V4 uses data-asset schema',gas.includes("VERSION:'MUDAGIRI_DATA_ASSET_V1'")&&gas.includes("GAS_VERSION:'MUDAGIRI_GAS_V4_0'")],
 ['visible workbook contract is six Japanese tabs',[
   "HOME:'①ホーム'","PEOPLE:'②どんな人？'","SPEND:'③何に使ってる？'","CONV:'④誰が面談する？'","QUALITY:'⑤データ信頼度'","STORE:'⑥データ保管庫'"
 ].every(x=>gas.includes(x))],
 ['technical raw sheets are hidden',gas.includes("DIAG:'_診断_raw'")&&gas.includes("CAT:'_支出_raw'")&&gas.includes("EVENT:'_イベント_raw'")&&gas.includes("CONV:'_面談_raw'")&&gas.includes("QUALITY:'_品質_raw'")&&gas.includes('s.hideSheet()')],
 ['visible data store includes conversion and quality fields',gas.includes("'LINEクリック'")&&gas.includes("'LINE遷移（コード発行）'")&&gas.includes("'相談希望'")&&gas.includes("'面談実施'")&&gas.includes("'成約'")&&gas.includes("'全体信頼度'")&&gas.includes("'統計利用可'")],
 ['category fact keeps personal and household amounts separate',gas.includes("'personal_burden'")&&gas.includes("'household_total'")&&gas.includes("'analysis_scope'")],
 ['spend dashboard explicitly selects personal or household scope',gas.includes("scope==='世帯合計'?num_(x.household_total):num_(x.personal_burden)")],
 ['category fact keeps psychology and per-category quality',gas.includes("'psychology_tags'")&&gas.includes("'quality_grade'")&&gas.includes("'quality_flags_json'")],
 ['quality engine uses behavior and consistency signals',gas.includes("'SAME_AMOUNT_8PLUS'")&&gas.includes("'EXTREME_FAST'")&&gas.includes("'RAPID_REPEAT_3PLUS'")&&gas.includes("'CHILD_EDU_WITHOUT_CHILD'")],
 ['quality engine does not use a HIGH_AMOUNT exclusion flag',!gas.includes('HIGH_AMOUNT')&&!gas.includes('AMOUNT_TOO_HIGH')],
 ['LINE click and handoff are stored separately',gas.includes("b.name==='line_clicked'")&&gas.includes("'LINEクリック':'TRUE'")&&gas.includes("'LINE遷移（コード発行）':'TRUE'")],
 ['lead handoff does not automatically mark consultation requested',gas.includes("stage:'line_handoff'")&&!gas.match(/function saveLead_[\s\S]*?'相談希望':'TRUE'[\s\S]*?function saveConversion_/)],
 ['future consultation funnel is supported',gas.includes("'consult_requested'")&&gas.includes("'appointment_booked'")&&gas.includes("'appointment_attended'")&&gas.includes("'proposal_made'")&&gas.includes("'contracted'")],
 ['goal_selected remains supported',gas.includes("b.name==='goal_selected'")&&gas.includes("'未来目的'")],
 ['events dedupe on event id',gas.includes("if(find_(s,1,id)>1)return")],
 ['visible store header mismatch fails loudly',gas.includes("throw new Error('HEADER_MISMATCH:")],
 ['health endpoint exposes data-asset schema',gas.includes('schema_version:CFG.VERSION')&&gas.includes('gas_version:CFG.GAS_VERSION')],
];

for(const [name,ok] of checks){
 if(!ok)throw new Error('DATA_PIPELINE_V2_QA_FAIL:'+name);
 console.log('PASS',name);
}
console.log('DATA_PIPELINE_V2_QA_PASS',checks.length);
