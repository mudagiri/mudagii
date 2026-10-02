import fs from 'node:fs';

const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const gas=fs.readFileSync('./MUDAGIRI_GAS_CODE_V3.gs','utf8');

const checks=[
 ['snapshot persists Result V5 analytics',app.includes('analyticsV5:v.scopeV4?{')&&app.includes('resultVmVersion:vm.methodologyVersion')&&app.includes('firstQuest:vm.firstQuest?.category??null')],
 ['snapshot persists V5 rows by category',app.includes('rows:Object.fromEntries(vm.rows.map')&&app.includes('v5Status:x.v5Status??null')&&app.includes('cUpper:x.cUpper??0')],
 ['LINE lead carries potential values',app.includes('confirmedMonthly:result.potential?.confirmedA')&&app.includes('potentialLower:result.potential?.lower')&&app.includes('potentialUpper:result.potential?.upper')],
 ['GAS creates normalized category sheet',gas.includes("CAT:'03_Categories'")&&gas.includes("const CAT_HEADERS=")&&gas.includes('saveCategories_(b)')],
 ['GAS category key is diagnosis plus category',gas.includes('String(vals[i][0])===String(obj.diagnosis_id)')&&gas.includes('String(vals[i][1])===String(obj.category_code)')],
 ['GAS stores confirmed saving separately',gas.includes('confirmed_saving:numOrBlank_')&&gas.includes('potential_c_upper:numOrBlank_(v.cUpper)')],
 ['GAS stores comparison difference without treating it as saving',gas.includes('comparison_difference:numOrBlank_(d.comparisonDifference)')&&!gas.includes('confirmed_saving:numOrBlank_(d.comparisonDifference)')],
 ['goal_selected updates diagnosis future_goal',gas.includes("b.name==='goal_selected'")&&gas.includes("'future_goal'")],
 ['diagnosis and lead are upserts',gas.includes('upsertByKey_(s,DIAG_HEADERS,obj,1,id)')&&gas.includes('upsertByKey_(s,LEAD_HEADERS,obj,3,id)')],
 ['events dedupe on event id',gas.includes("if(find_(s,1,id)>1)return")],
 ['schema/header mismatch fails loudly',gas.includes("throw new Error('HEADER_MISMATCH:")],
 ['health endpoint exposes schema',gas.includes("schema_version:CFG.VERSION")&&gas.includes("gas_version:'MUDAGIRI_GAS_V3_0'")],
];

for(const [name,ok] of checks){
 if(!ok)throw new Error('DATA_PIPELINE_V1_QA_FAIL:'+name);
 console.log('PASS',name);
}
console.log('DATA_PIPELINE_V1_QA_PASS',checks.length);
