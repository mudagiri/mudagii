import fs from 'node:fs';
const result=fs.readFileSync('./ResultScreenV4.tsx','utf8');
const app=fs.readFileSync('./MudagiriAppV2.tsx','utf8');
const gas=fs.readFileSync('./MUDAGIRI_GAS_CODE_V2.gs','utf8');

const clear=result.indexOf('className="rv3-clear"');
const benchmark=result.indexOf('className="rv3-benchmark"');
const verdict=result.indexOf('className="rv3-verdict rv3-verdict-open"');
const next=result.indexOf('className="rv3-next"');
const consult=result.indexOf('className="rv3-consult-route"');

const checks=[
 ['Result identifies Mudagiri quest',result.includes('MUDAGIRI QUEST CLEAR!')&&result.includes('ムダギリ家計クエスト、完了！')],
 ['Mudagiri guide assets cover four Result roles',result.includes("clear:'./assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png'")&&result.includes("benchmark:'./assets/battle1/MUDAGIRI_BATTLE_READY.png'")&&result.includes("verdict:'./assets/battle1/MUDAGIRI_BATTLE.png'")&&result.includes("guide:'./assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png'")],
 ['Mudagiri appears at clear benchmark verdict and consult',result.match(/rv3-mudagiri/g)?.length>=4],
 ['share card has visible Mudagiri brand badge',result.includes("x.fillText('ムダギリ診断',187,104)")&&result.includes('MUDAGIRI_RESULT_ART.share')&&result.includes('const mascot=await loadCanvasImage')],
 ['share card keeps type identity primary',result.includes("x.fillText('MONEY TYPE UNLOCKED'")&&result.includes("x.fillText('TYPE '+vm.type.code")&&result.includes('vm.type.strengthLabel')],
 ['share card remains privacy-safe',result.includes('収入・支出金額・都道府県は画像に含まれません')],
 ['Result order keeps benchmark verdict next and consult',clear>=0&&benchmark>clear&&verdict>benchmark&&next>verdict&&consult>next],
 ['1 5 10 year impacts use approximate readable amounts',result.includes('function approxImpactYen')&&result.includes('1年なら')&&result.includes('5年なら')&&result.includes('10年なら')],
 ['10 year impact is visually dominant',result.includes('.rv3-impact-grid .is-10y')&&result.includes('font-size:clamp(30px,8vw,36px)')],
 ['verdict summary is always visible',result.includes('className="rv3-verdict rv3-verdict-open"')&&!result.includes('<details className="rv3-verdict rv3-verdict-details"')],
 ['verdict always shows cut review protect counts',result.includes('⚔️ 削減確定')&&result.includes('🎯 優先チェック')&&result.includes('🛡️ 守る支出')],
 ['zero confirmed savings does not imply no review opportunity',result.includes('削減確定が0でも、見直し余地がないわけではありません')],
 ['consult topics show insurance first then life plan and investment',result.includes("(['insurance','lifeplan','investment'] as ConsultTopicV1[])")],
 ['diagnostic NEXT QUEST remains separate from professional consult',result.includes('診断上のNEXT QUESTとは別に、家計をプロと深掘りする入口です。')],
 ['insurance can be chosen even when not recommended without falsifying diagnosis',result.includes('保険は最優先判定ではありません')&&result.includes('診断結果を曲げず')],
 ['selected consult topic is handed off',result.includes('consultSelectedTopic:consultTopic')&&app.includes('consultSelectedTopic:ctx?.consultSelectedTopic')],
 ['selected consult topic is persisted by GAS',gas.includes("'consult_selected_topic'")&&gas.includes('b.consultSelectedTopic||b.consultPrimary')],
 ['Result reward background is lighter than flat-black baseline',result.includes('radial-gradient(circle at 50% 0')&&result.includes('linear-gradient(180deg,#0a1722')],
];
for(const [name,ok] of checks){if(!ok)throw new Error('RESULT_POLISH_V3_QA_FAIL:'+name);console.log('PASS',name)}
console.log('RESULT_POLISH_V3_QA_PASS',checks.length);
