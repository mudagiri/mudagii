import fs from 'node:fs';
const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const gas=fs.readFileSync('./MUDAGIRI_GAS_CODE_V2.gs','utf8');
const persistence=fs.readFileSync('./persistence-v3.ts','utf8');

const checks=[
 ['handoff code generated from diagnosis id',result.includes("function lineHandoffCode(diagnosisId:string)")&&result.includes("return 'MG-'")],
 ['LINE CTA opens handoff prompt first',result.includes("setLinePrompt(placement)")&&result.includes("'line_handoff_prompted'")],
 ['handoff modal explains manual code send',result.includes('友だち追加後、このコードをトークで送ってください。今回の診断と照合できます。')],
 ['handoff code itself contains no financial copy',result.includes('コード自体には収入・支出額は含まれません。')],
 ['confirm copies code before LINE',result.includes("navigator.clipboard?.writeText(message)")&&result.includes("line_handoff_confirmed")],
 ['lead payload stores handoff code',app.includes('handoffCode:ctx?.handoffCode??null')],
 ['handoff code is searchable in current Lead ID without GAS redeploy',app.includes("leadId:'lead_'+diagnosisId+(ctx?.handoffCode?'_'+ctx.handoffCode:'')")],
 ['lead payload stores CTA placement',app.includes('ctaPlacement:ctx?.placement??null')],
 ['LINE navigation does not await lead persistence',app.includes("void Promise.resolve(store?.saveLead?.(")&&!app.includes("try{await store?.saveLead?.(")],
 ['GAS lead keepalive request starts immediately',persistence.includes("const local=this.fallback.saveLead?.(v);")&&persistence.includes("remote=this.send({kind:'lead_v3',...v})")],
 ['GAS exposes searchable handoff column',gas.includes("'handoff_code','cta_placement'")],
 ['GAS lead row stores handoff code',gas.includes("b.handoffCode||'',b.ctaPlacement||''")],
 ['CTA copy does not claim automatic LINE save',!result.includes('LINEに保存する')&&!result.includes('診断結果をLINEに残す')],
 ['LINE analytics contain no raw financial amounts',(()=>{
   const lines=result.split('\n').filter(x=>x.includes("'line_clicked'")||x.includes("'line_handoff_prompted'")||x.includes("'line_handoff_confirmed'"));
   return lines.length>=3&&lines.every(x=>!/(amount|income|saving|expense|takeHome|benchmark|monthlyImprovement)/i.test(x));
 })()],
];
for(const [name,ok] of checks){if(!ok)throw new Error('LINE_HANDOFF_V1_QA_FAIL:'+name);console.log('PASS',name)}
console.log('LINE_HANDOFF_V1_QA_PASS',checks.length);
