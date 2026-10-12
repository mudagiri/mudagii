import {chromium,webkit} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const engine=process.env.BROWSER_ENGINE==='webkit'?'webkit':'chromium';
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
const base=process.env.CHAPTER12_URL||'http://127.0.0.1:4173/chapter12-answercheck.html';
const out=path.resolve('chapter12-answercheck-qa');fs.mkdirSync(out,{recursive:true});
const errors=[];const check=(b,msg)=>{if(!b)errors.push(msg)};
for(const width of [320,375,390,430]){
 const ctx=await browser.newContext({viewport:{width,height:870},deviceScaleFactor:1,reducedMotion:'reduce'});
 const page=await ctx.newPage(),outside=[];
 page.on('pageerror',e=>errors.push(width+' runtime '+String(e)));
 page.on('request',r=>{if(/script\.google\.com|\/exec\b|lin\.ee|line\.me|analytics/i.test(r.url()))outside.push(r.url());});
 await page.goto(base,{waitUntil:'networkidle'});
 const selector=page.locator('#case-change');
 const card=page.locator('[data-section="CHAPTER12_ANSWER_CHECK"]');
 await card.waitFor();
 check(await card.count()===1,width+' initial card');
 check(await card.getAttribute('data-answercheck-status')==='context_found',width+' expected resonance');
 const future=page.locator('[data-section="FUTURE_REWARDS"]');
 check(await future.count()===1,width+' V32 future reward remains present');
 const initialFuture=await future.innerText();
 check(initialFuture.includes('¥214,248')&&initialFuture.includes('¥1,071,240')&&initialFuture.includes('¥2,142,480'),width+' original V3.2 large-scale QA case retained');
 // 行動経済学：驚きの直後に、全候補の根拠と一手を開かずに読める。
 const initialBreakdown=page.locator('[data-section="CANDIDATE_BREAKDOWN"]');
 check(await initialBreakdown.count()===1,width+' candidate breakdown exists');
 const initialRows=initialBreakdown.locator('[data-candidate-category]');
 check(await initialRows.count()===2,width+' two nonzero contributors visible with no tap');
 for(const [cat,amount] of [['food','¥12,354'],['mobile','¥5,500']]){
  const tile=initialBreakdown.locator('[data-candidate-category="'+cat+'"]');
  check(await tile.isVisible(),width+' visible breakdown '+cat);
  const t=await tile.innerText();
  check(t.includes(amount)&&t.includes('候補になった理由')&&t.includes('確かめること'),width+' inline numeric why/what '+cat);
  check(t.includes('未確定'),width+' uncertainty adjacent to '+cat);
 }
 const initialBreakdownText=await initialBreakdown.innerText();
 check(initialBreakdownText.includes('月最大 ¥17,854'),width+' full breakdown keeps total as separate upper bound');
 check(initialBreakdownText.includes('¥54,000')&&initialBreakdownText.includes('¥37,860'),width+' food spend and comparison reference both visible');
 check(initialBreakdownText.includes('¥11,500')&&initialBreakdownText.includes('月6,000円を超える部分'),width+' mobile actual spend and carrier floor visible');
 check(initialBreakdownText.includes('平均との差がそのまま削減額になるわけではありません'),width+' comparison reference explicitly not savings');

 check(initialBreakdownText.includes('まだ削減できると決まった金額ではない'),width+' no behavioral anchoring into guaranteed saving');
 const earlyOrder=await page.evaluate(()=>{
  const sel=['POTENTIAL_HERO','POTENTIAL_TREASURE','CANDIDATE_BREAKDOWN','FUTURE_REWARDS','HOUSEHOLD_BATTLE_RESULTS','CONSULTATION_CTA_TOP'];
  const nodes=sel.map(x=>document.querySelector('[data-section="'+x+'"]'));
  return nodes.some(x=>!x)?null:nodes.map(x=>x.getBoundingClientRect().top+scrollY);
 });
 check(Boolean(earlyOrder&&earlyOrder.every((pos,i)=>i===0||pos>earlyOrder[i-1])),width+' trust building occurs before consultation with four-lens order');
 check(!(await page.locator('[data-section="CANDIDATE_BREAKDOWN"] details').count()),width+' essential breakdown never hidden behind details');
 await initialBreakdown.scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,engine+'-'+width+'-candidate-breakdown.png'),fullPage:true});

 await selector.selectOption('uncertain_only');
 const futureText=await future.innerText();
 check(futureText.includes('1年間')&&futureText.includes('5年間')&&futureText.includes('10年間'),width+' all three horizons present');
 check(futureText.includes('¥21,600')&&futureText.includes('¥108,000')&&futureText.includes('¥216,000'),width+' only cUpper * 12/60/120, excludes confirmed');
 check(futureText.includes('未確定')&&futureText.includes('保証するものではなく'),width+' caveats stay adjacent to rewards');
 const rewardJump=page.locator('[data-section="FUTURE_REWARD_JUMP"]');
 check(await rewardJump.count()===1,width+' reward jump available when uncertainty is nonzero');
 check(await rewardJump.innerText().then(x=>x.includes('1年・5年・10年')),width+' reward jump names all time horizons');
 await rewardJump.click();
 const futureViewportPosition=await future.evaluate(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}));
 check(futureViewportPosition.top>=-1&&futureViewportPosition.top<200,width+' reward jump scrolls the main UI to the actual numeric reward '+JSON.stringify(futureViewportPosition));

 await page.locator('.c12preview-top button').first().click();
 check(await future.isVisible(),width+' direct jump to future reward works');
 await page.screenshot({path:path.join(out,engine+'-'+width+'-uncertain-future.png'),fullPage:true});
 await selector.selectOption('uncertain_only');
 check((await page.locator('[data-section="CONFIRMED_REWARD"]').innerText()).includes('¥0'),width+' uncertain-only confirms zero separately');
 check((await future.innerText()).includes('¥216,000'),width+' 10-year cumulative still visible with zero confirmed');
 await selector.selectOption('enjoy_dual');
 check(await card.locator('[data-answercheck-contrast=true]').count()===1,width+' dual proof-gated result');
 check((await card.innerText()).includes('性格の的中率や節約実績ではなく'),width+' no fake personality or realized savings');
 check((await card.innerText()).includes('¥24,000'),width+' actual synthetic monthly fun amount');
 check((await card.innerText()).includes('¥1,200'),width+' separate confirmed subscription opportunity');
 check((await card.innerText()).includes('まだ解約していない金額'),width+' unexecuted cancellation visible');
 check((await card.locator('.c12ac-dual-box').count())===2,width+' protect and review separated');

 const mascot=card.locator('img');
 check(await mascot.evaluate(e=>e.complete&&e.naturalWidth>0),width+' mascot loaded');
 check((await page.locator('.c2v31-job-card').count())===1,width+' official JOB inherited');
 let job=page.locator('.c2v31-job-card img');
 check(await job.evaluate(e=>e.complete&&e.naturalWidth>0),width+' official JOB loaded');
 const positions=await page.evaluate(()=>{
  let a=document.querySelector('.c2v31-job-card'),b=document.querySelector('[data-section=CHAPTER12_ANSWER_CHECK]'),c=document.querySelector('[data-section=POTENTIAL_TREASURE]');
  return a&&b&&c?{a:a.getBoundingClientRect().top+scrollY,b:b.getBoundingClientRect().top+scrollY,c:c.getBoundingClientRect().top+scrollY}:null
 });
 check(Boolean(positions&&positions.c<positions.a&&positions.a<positions.b),width+' candidate reward first, JOB and answercheck after future');
 const cardHeight=await card.evaluate(e=>Math.ceil(e.getBoundingClientRect().height));
 check(cardHeight<=(width<=350?500:450),width+' paired answer-check compact enough: '+cardHeight+'px');
 console.log('CHAPTER12_CARD_GEOMETRY',JSON.stringify({engine,width,height:cardHeight}));
 await card.scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,engine+'-'+width+'-paired.png'),fullPage:true});
 await selector.selectOption('enjoy_good');
 check(await card.locator('[data-insight-kind="resonance"]').count()===1,width+' original single insight stays available');
 check((await card.innerText()).includes('¥288,000'),width+' single expense annualization still labeled');
 await page.screenshot({path:path.join(out,engine+'-'+width+'-resonance.png'),fullPage:true});
 await card.getByRole('button',{name:/根拠を見る/}).click();
 check(await page.locator('[data-answercheck-evidence=true]').isVisible(),width+' evidence opens');
 await card.getByRole('button',{name:/根拠を閉じる/}).click();
 check(await page.locator('[data-answercheck-evidence=true]').count()===0,width+' evidence closes');
 await selector.selectOption('enjoy_question');
 check(await card.locator('[data-insight-kind="question"]').count()===1,width+' dissatisfaction asked as question');
 check(!(await card.innerText()).includes('あなたは浪費家'),width+' no shaming');
 await page.screenshot({path:path.join(out,engine+'-'+width+'-review.png'),fullPage:true});
 await selector.selectOption('drive_inertia');
 check(await card.locator('[data-insight-kind="question"]').count()===1,width+' drive review question');
 await selector.selectOption('drive_dual');
 check(await card.locator('[data-answercheck-contrast=true]').count()===1,width+' drive paired result');
 check((await card.innerText()).includes('自己投資は守る'),width+' drive heading');
 await selector.selectOption('optimize_dual');
 check(await card.locator('[data-answercheck-contrast=true]').count()===1,width+' optimize action pair');
 check((await card.innerText()).includes('納得して使う'),width+' optimize heading');
 await selector.selectOption('secure_check');
 check(await card.getAttribute('data-answercheck-status')==='no_supported_link',width+' insurance not faked as personality match');
 const coverage=page.locator('[data-section="COVERAGE_AWARENESS"]');
 check(await coverage.count()===1,width+' coverage awareness shown independently of STYLE');
 check(await coverage.getAttribute('data-coverage-reason')==='UNCLEAR_PURPOSE',width+' coverage unclear purpose evidence used');
 check((await coverage.innerText()).includes('保険'),width+' coverage message concrete');
 const coverageText=await coverage.innerText();
 for(const phrase of ['医療の変化','通院・薬物療法','暮らしの変化','保険料・重複','古い保険が無意味とは限らない']){
  check(coverageText.includes(phrase),width+' coverage visible reason '+phrase);
 }
 const coverageConsult=coverage.locator('[data-cta="COVERAGE_LINE_CONSULT"]');
 check(await coverageConsult.count()===1,width+' dedicated official LINE insurance consultation button visible');
 check((await coverageConsult.innerText()).includes('公式LINEで保障の相談をする'),width+' insurance-specific CTA wording');
 check((await coverage.locator('details[open]').count())===0,width+' reasons and consultation visible without details tap');
 await coverageConsult.click();
 check((await coverage.locator('[role="status"]').innerText()).includes('LINEへの移動や実際の面談予約は行いません'),width+' pilot suppresses insurance LINE outbound');

 const order=await page.evaluate(()=>{
  const reward=document.querySelector('[data-section="FUTURE_REWARDS"]');
  const battle=document.querySelector('[data-section="HOUSEHOLD_BATTLE_RESULTS"]');
  const cover=document.querySelector('[data-section="COVERAGE_AWARENESS"]');
  const consult=document.querySelector('[data-section="CONSULTATION_CTA_TOP"]');
  return reward&&battle&&cover&&consult?[reward,battle,cover,consult].map(x=>x.getBoundingClientRect().top+window.scrollY):null;
 });
 check(Boolean(order&&order[0]<order[1]&&order[1]<order[2]&&order[2]<order[3]),width+' awareness placed after reward and before consultation');
 await coverage.locator('summary').click();
 check((await coverage.innerText()).includes('公的保障'),width+' broader coverage guidance rather than premium sales');
 await coverage.locator('summary').click();
 await selector.selectOption('secure_recent');
 check(await coverage.count()===0,width+' 1y review exemption');
 check(await page.locator('[data-cta="COVERAGE_LINE_CONSULT"]').count()===0,width+' no insurance CTA on recent review');

 await selector.selectOption('secure_no_link');
 check(await coverage.count()===0,width+' full contents awareness exemption');
 check(await page.locator('[data-cta="COVERAGE_LINE_CONSULT"]').count()===0,width+' no insurance CTA when fully aware');

 await selector.selectOption('coverage_zero');
 check(await coverage.count()===1,width+' zero premium still gets neutral coverage awareness');
 check((await coverage.innerText()).includes('保険料が0円でも'),width+' no insurance product prescribed for zero premium');
 await selector.selectOption('drive_good');
 check(await coverage.count()===1,width+' DRIVE also receives universal coverage prompt');
 await selector.selectOption('drive_good');
 check(await card.locator('[data-insight-kind="resonance"]').count()===1,width+' DRIVE purpose');
 await selector.selectOption('optimize_question');
 check(await card.locator('[data-insight-kind="question"]').count()===1,width+' confirmed unused sub');
 check((await card.innerText()).includes('¥1,200'),width+' declared unused subscription monthly amount');
 check((await card.innerText()).includes('¥14,400'),width+' nominal annual unconsumed contracts not savings');
 check(!(await card.innerText()).includes('¥50,400'),width+' do not mislabel total subscriptions as unused');
 await card.getByRole('button',{name:/根拠を見る/}).click();
 check((await card.innerText()).includes('まだ解約や節約を実行した意味ではありません'),width+' not actual savings');
 await card.getByRole('button',{name:/根拠を閉じる/}).click();
 await page.screenshot({path:path.join(out,engine+'-'+width+'-subscription.png'),fullPage:true});
 await selector.selectOption('secure_no_link');
 check(await card.count()===1,width+' no-link card available');
 check(await card.getAttribute('data-answercheck-status')==='no_supported_link',width+' no unsupported secure insurance link');
 check(await card.locator('.c12ac-insight').count()===0,width+' no invented positive result');
 check(await card.locator('.c12ac-money').count()===0,width+' no numeric pseudo-match in secure no-link');
 check(await card.locator('.c12ac-evidence-toggle').count()===0,width+' no faux evidence toggle on no-link');
 const noLinkHeight=await card.evaluate(e=>Math.ceil(e.getBoundingClientRect().height));
 check(noLinkHeight<220,width+' no-link state stays compact: '+noLinkHeight+'px');
 await page.screenshot({path:path.join(out,engine+'-'+width+'-no-link.png'),fullPage:true});
 await selector.selectOption('no_uncertain');
 check(await page.locator('[data-section="CANDIDATE_BREAKDOWN"]').count()===0,width+' no invented candidates for zero upper bound');
 check(!(await future.innerText()).includes('10年間の積み重ね'),width+' no invented 10y savings when upper bound is zero');
 await selector.selectOption('identity_mismatch');
 check(await card.count()===0,width+' mismatched identity hidden');
 await selector.selectOption('partial');
 check(await card.count()===0,width+' incomplete 12 categories hidden');
 const m=await page.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth}));
 check(m.doc<=width+1,width+' no horizontal overflow '+m.doc);
 check(outside.length===0,width+' no external upload');
 // Test the actual coverage dialog and callback contract with a stubbed clipboard
 // and interception only. Never open the official LINE or transmit lead records.
 const dry=await ctx.newPage(),dryOutside=[];
 dry.on('pageerror',e=>errors.push(width+' coverage dry-run runtime '+String(e)));
 dry.on('request',r=>{if(/script\.google\.com|\/exec\b|lin\.ee|line\.me|analytics/i.test(r.url()))dryOutside.push(r.url());});
 await dry.addInitScript(()=>{
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
   writeText:async text=>{window.__copiedCoverage=text;}
  }});
 });
 await dry.goto(base+'?qaCoverageHandoff=1',{waitUntil:'networkidle'});
 const dryButton=dry.locator('[data-cta="COVERAGE_LINE_CONSULT"]');
 check(await dryButton.count()===1,width+' dry run has coverage CTA');
 await dryButton.click();
 const coverageDialog=dry.locator('[data-dialog="COVERAGE_LINE_HANDOFF"]');
 check(await coverageDialog.count()===1,width+' distinct coverage consultation modal');
 check((await coverageDialog.innerText()).includes('友だち追加だけでは相談内容は伝わりません'),width+' LINE delivery not overpromised');
 check((await coverageDialog.locator('textarea').inputValue()).includes('引継ぎコード：MG-'),width+' selectable draft includes handoff code');
 await coverageDialog.getByRole('button',{name:/相談文をコピーして公式LINEへ/}).click();
 const transfer=await dry.evaluate(()=>({copied:window.__copiedCoverage,context:window.__coverageHandoff}));
 check(transfer.context?.placement==='coverage_review'&&transfer.context?.consultSelectedTopic==='insurance'&&transfer.context?.insuranceReview===true,width+' official LINE callback receives exact coverage intent');
 check(transfer.copied?.includes('保障内容の確認について相談したいです。')&&transfer.copied?.includes('引継ぎコード：'+transfer.context?.handoffCode),width+' copied message correlates to saved lead code');
 check(!/¥|月額|健康情報|保険料|医療履歴/.test(transfer.copied||''),width+' no sensitive diagnostic details in LINE text');
 check(!('rawExpenses' in (transfer.context||{}))&&!('confirmedMonthly' in (transfer.context||{})),width+' privacy-minimal external handoff');
 check(await coverageDialog.count()===0,width+' coverage dialog closes after outbound callback');
 check(dryOutside.length===0,width+' dry-run never opens LINE or sends to GAS');
 if(width===390)await dry.screenshot({path:path.join(out,engine+'-390-coverage-handoff.png'),fullPage:true});
 await dry.close();
 // The real participant has only the synthetic result, not 18 developer fixtures
 // or a real outbound share/consultation. Test both privacy and neutral ordering.
 const participant=await ctx.newPage(),participantOut=[];
 participant.on('pageerror',e=>errors.push(width+' participant runtime '+String(e)));
 participant.on('request',r=>{if(/twitter\.com|line\.me|lin\.ee|script\.google\.com|\/exec\b/i.test(r.url()))participantOut.push(r.url());});
 await participant.goto(base+'?pilot=1',{waitUntil:'networkidle'});
 check(await participant.locator('[data-pilot-role="participant"]').count()===1,width+' distinct neutral participant header');
 check(await participant.locator('#case-change').count()===0,width+' participant cannot see or switch developer cases');
 check(await participant.locator('.c12preview-top').count()===0,width+' developer instructions removed');
 check(await participant.locator('[data-section="CANDIDATE_BREAKDOWN"] [data-candidate-category]').count()===2,width+' participant sees both money candidate explanations');
 check((await participant.locator('[data-pilot-role="participant"]').innerText()).includes('架空の回答'),width+' synthetic and no real data entry disclosed');
 check(await participant.locator('[data-section="FUTURE_REWARDS"]').count()===1,width+' future simulation remains intact');
 await participant.locator('[data-section="CONSULTATION_CTA_TOP"] button').first().click();
 check(await participant.locator('[role="dialog"]').count()===1,width+' participant can inspect lifeplan consultation dialog');
 await participant.locator('[role="dialog"] button').filter({hasText:'公式LINEで'}).click();
 check(await participant.locator('[role="dialog"]').count()===0,width+' no real booking from pilot');
 const alts=participant.locator('.c2v31-share-alternatives');
 await alts.locator('summary').click();
 await alts.getByRole('button',{name:/Xで文章を共有/}).click();
 check((await participant.locator('.c2v2-share-status').innerText()).includes('調査用のサンプルではSNS投稿を実行しません'),width+' social posting blocked in synthetic pilot');

 const pilotCoverage=participant.locator('[data-section="COVERAGE_AWARENESS"]');
 check(await pilotCoverage.locator('[data-cta="COVERAGE_LINE_CONSULT"]').count()===1,width+' participant also sees direct insurance consultation CTA');
 await pilotCoverage.locator('[data-cta="COVERAGE_LINE_CONSULT"]').click();
 check((await pilotCoverage.locator('[role="status"]').innerText()).includes('LINEへの移動'),width+' research insurance CTA stays on page');
 check(participantOut.length===0,width+' pilot no external share/booking or GAS request');
 if(width===390)await participant.screenshot({path:path.join(out,engine+'-390-participant.png'),fullPage:true});
 await participant.close();
 await ctx.close();
}
await browser.close();
if(errors.length){console.error(JSON.stringify({status:'FAIL',engine,errors},null,2));process.exitCode=1}
else console.log(JSON.stringify({status:'PASS',engine,viewports:[320,375,390,430],screenshots:16,scope:'synthetic C1/C2 joins inside real C2 result; no real user validity'}));
