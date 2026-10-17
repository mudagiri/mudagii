/**
 * Automated contrast gate for Chapter 2 result's data-reading surfaces.
 * WCAG 2.2 AA: text >=4.5:1 (also enforced for large labels).
 *
 * No screenshot-level sampling, which varies with DPR/GPU; all approved
 * information panels have solid CSS background-colors in the cascade.
 */
export async function auditChapter2TextContrast(page,{requireWorker=false,viewportWidth=390}={}){
 const output=await page.evaluate(({requireWorker})=>{
  const cssColors=s=>{
   const match=String(s||'').match(/rgba?\(([^)]+)\)/i);
   if(!match)return null;
   const components=match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
   if(components.length<3||components.slice(0,3).some(x=>!Number.isFinite(x)))return null;
   return {r:components[0],g:components[1],b:components[2],a:components.length>3?components[3]:1};
  };
  function surfaceFor(element){
   let el=element;
   for(let attempts=0;el&&attempts<30;attempts++,el=el.parentElement){
    const c=cssColors(getComputedStyle(el).backgroundColor);
    if(c&&c.a>=.99)return c;
   }
   return null;
  }
  const srgb=x=>{const s=x/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4};
  const luminance=c=>.2126*srgb(c.r)+.7152*srgb(c.g)+.0722*srgb(c.b);
  const contrast=(a,b)=>{
   const l1=luminance(a),l2=luminance(b);
   return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
  };
  const classes=[
   ['comparison-title','.c2v22-comparison-ledger .c2v23-comparison-identity strong'],
   ['user-expense-label','.c2v22-comparison-ledger .c2v32-merged-values>span>small'],
   ['user-expense-amount','.c2v22-comparison-ledger .c2v32-merged-values>span>b'],
   ['reference-amount','.c2v22-comparison-ledger .c2v32-merged-values>span:nth-child(2)>b'],
   ['own-burden-caption','.c2v22-comparison-ledger .c2v32-inline-percent'],
   ['own-burden-number','.c2v22-comparison-ledger .c2v32-inline-percent b'],
   ['comparison-statement','.c2v22-comparison-ledger .c2v32-comparison-story'],
   ['comparison-statement-label','.c2v22-comparison-ledger .c2v32-comparison-story>b'],
   ['reference-criteria','.c2v22-comparison-ledger .c2v32-context-brief'],
   ['evidence-trigger','.c2v22-comparison-ledger .c2v32-evidence-toggle'],
   ['parchment-footnote','.c2v22-comparison-ledger .c2v22-ledger-footnote'],
   ['category-status','.c2v22-comparison-ledger .c2v23-comparison-status'],
   ['own-income-paragraph','.c2v32-income-burden--compact>p'],
  ];
  if(document.querySelector('.c2v32-income-food-context--merged')){
   classes.push(
    ['income-reference-note','.c2v32-income-food-context--merged .c2v32-income-food-note'],
    ['income-reference-title','.c2v32-income-food-context--merged h3'],
    ['income-amount','.c2v22-comparison-ledger .c2v32-income-inline b'],
    ['income-caption','.c2v22-comparison-ledger .c2v32-income-inline small'],
    ['income-comparison','.c2v22-comparison-ledger .c2v32-income-story']
   );
  }
  if(requireWorker||document.querySelector('.c2v32-worker-rate-card')){
   classes.push(
    ['worker-burden-heading','.c2v22-comparison-ledger .c2v32-worker-rate-head>span strong'],
    ['worker-burden-number','.c2v22-comparison-ledger .c2v32-worker-rate-head>strong'],
    ['worker-own-number','.c2v22-comparison-ledger .c2v32-worker-rate-comparison b'],
    ['worker-caption','.c2v22-comparison-ledger .c2v32-worker-rate-comparison small'],
    ['worker-paragraph','.c2v22-comparison-ledger .c2v32-worker-rate-card>p'],
    ['worker-source-note','.c2v22-comparison-ledger .c2v32-worker-rate-card>small']
   );
  }
  if(document.querySelector('.c2v32-statistical-buffer')){
   classes.push(
    ['stats-hero-title','.c2v32-statistical-buffer>strong'],
    ['stats-amount','.c2v32-statistical-buffer .c2v32-statistical-gap'],
    ['stats-note','.c2v32-statistical-buffer>small'],
    ['stats-chip','.c2v32-statistical-gap-items>span'],
    ['stats-chip-footnote','.c2v32-statistical-gap-items small']
   );
  }
  const sampled=classes.map(([label,selector])=>{
   const el=[...document.querySelectorAll(selector)].find(x=>{
    const style=getComputedStyle(x);
    return style.display!=='none'&&style.visibility!=='hidden'&&x.getClientRects().length>0;
   });
   if(!el)return {label,selector,missing:true};
   const color=cssColors(getComputedStyle(el).color);
   const background=surfaceFor(el);
   return {label,selector,text:(el.textContent||'').trim().slice(0,100),
    color:getComputedStyle(el).color,background:background?\`rgb(\${background.r},\${background.g},\${background.b})\`:null,
    contrast:color&&background?Math.round(contrast(color,background)*100)/100:null,
    pass:color!==null&&background!==null&&contrast(color,background)>=4.5};
  });
  const missing=sampled.filter(x=>x.missing);
  const inadequate=sampled.filter(x=>!x.missing&&!x.pass);
  return {sampled,missing,inadequate,requireWorker,backgroundRulesInstalled:
   document.querySelector('style')?.textContent?.includes('Chapter 2 V3.2 legibility repair')??false};
 },{requireWorker});
 if(!output.backgroundRulesInstalled)throw new Error('CH2_READABILITY_CSS_NOT_LOADED');
 if(output.missing.length||output.inadequate.length){
  const failures=[...output.missing,...output.inadequate];
  throw new Error('CHAPTER2_V32_CONTRAST_FAILURE '+JSON.stringify({viewportWidth,failures,
   checked:output.sampled.length}));
 }
 console.log('CHAPTER2_V32_CONTRAST_AA_PASS',viewportWidth,
  requireWorker?'worker':'general',output.sampled.length,'labels',
  'min',Math.min(...output.sampled.map(x=>x.contrast)));
 return output;
}
