import type {Category} from './mudagiri-diagnosis-v2';
import {buildResultViewModelV5} from './result-view-model-v5';

const ALL:Category[]=['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment'];
let seed=20261001;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const pick=<T>(a:T[])=>a[Math.floor(rnd()*a.length)];
const type:any={code:'VIA',name:'QA',description:'QA',catchphrase:'QA',strengthLabel:'QA',blindSpot:'QA',shareHook:'QA',axes:{fv:0,pi:0,au:0},axisStrength:{fv:0,pi:0,au:0},nearMiddle:{fv:true,pi:true,au:true}};
const baseProfile:any={diagnosisScope:'personal',householdSize:1,adultCount:1,childCount:0,relationships:[],expenseSharing:null,householdContributionMode:null,bundledContributionAmount:null,prefecture:'東京都',age:35,housingTenure:'rental',housingSubtype:'private_rental',monthlyTakeHome:400000,annualIncomeBand:'600_699'};

function cat(category:Category,o:any={}){
 const amount=o.amount??0,benchmark=o.benchmark??null,quality=o.quality??(benchmark===null?'none':'exact');
 return {
  category,
  record:{category,diagnosisAmount:amount,personalBurden:amount,householdTotal:null,comparisonAmount:amount,comparisonBenchmark:benchmark,comparisonQuality:quality,known:true,applicability:'applicable',metadata:o.metadata??{}},
  comparison:{category,amount,benchmark,quality,amountScope:o.amountScope??'personal',sourceVersion:'CAL',difference:benchmark===null?null:amount-benchmark,engineComparableAllowed:o.engineComparableAllowed??(benchmark!==null&&category!=='mobile'),autoSavingAllowed:false,benchmarkMeta:benchmark===null?null:{value:benchmark,confidence:quality==='reference'?'MODEL':'DIRECT',sourceVersion:'CAL',meta:o.meta??{}},reason:'CAL'},
  engine:null,status:'review',confirmedSaving:o.confirmedSaving??0,screeningDelta:benchmark===null?null:amount-benchmark,attentionFlag:true,reasonCode:'CAL',appraisal:o.appraisal??null
 } as any;
}
function vmFor(target:any,profile:any=baseProfile){
 const categories=ALL.map(c=>c===target.category?target:cat(c,{amount:0,benchmark:null}));
 return buildResultViewModelV5({diagnosisId:'CAL',toneMode:'serious',type,profile,annualIncomeBand:'600_699',finalCategories:categories as any});
}
const row=(vm:any,c:Category)=>vm.rows.find((x:any)=>x.category===c);
const expectedStandard=(r:number)=>r<.8?'かなり低め':r<.95?'やや低め':r<=1.10?'標準圏':r<1.30?'やや高め':'かなり高め';
const expectedWide=(r:number)=>r<.75?'かなり低め':r<.90?'やや低め':r<=1.15?'標準圏':r<1.40?'やや高め':'かなり高め';
const failures:string[]=[];
const fail=(id:number,m:string)=>{if(failures.length<50)failures.push('#'+id+' '+m)};
const stdRatios=[.79,.80,.949,.95,1.00,1.10,1.101,1.299,1.30,1.99,2.01,2.8];
const wideRatios=[.74,.75,.899,.90,1.00,1.15,1.151,1.399,1.40,1.99,2.01,2.8];
let standardCases=0,wideCases=0,mobileCases=0,scopeBlocked=0,extremeCases=0;

for(let id=1;id<=10000;id++){
 try{
  const mode=id%5;
  if(mode<=2){
   const category=pick(['food','fun','beautyFashion','daily'] as Category[]);
   const benchmark=Math.round((5000+rnd()*95000)/100)*100;
   const ratio=pick(stdRatios);
   const amount=Math.round(benchmark*ratio);
   const blocked=id%17===0;
   const appraisal=category==='daily'?{dailyPersistence:'persistent'}:{satisfaction:pick(['waste','inertia','satisfied','verySatisfied'] as const)};
   const vm=vmFor(cat(category,{amount,benchmark,engineComparableAllowed:!blocked,appraisal}));
   const x=row(vm,category);
   if(x.positionLabel!==expectedStandard(ratio))fail(id,category+' standard position '+x.positionLabel+' ratio '+ratio);
   const expectedC=blocked?0:Math.max(0,Math.min(amount,benchmark*2)-benchmark*1.10);
   if(Math.abs(x.cUpper-expectedC)>1)fail(id,category+' C '+x.cUpper+' != '+expectedC);
   if(vm.potential.lower!==0)fail(id,'C-only lower must be 0');
   if(vm.potential.upper<vm.potential.lower)fail(id,'lower > upper');
   if(blocked){scopeBlocked++;if(x.cUpper!==0)fail(id,'scope block leaked C')}
   if(ratio>2&&!blocked){extremeCases++;if(!x.detailReview)fail(id,'extreme missing detail flag')}
   if((category==='food'||category==='fun'||category==='beautyFashion')&&appraisal.satisfaction==='verySatisfied'&&ratio>1.10&&x.v5Status!=='optimize')fail(id,'high satisfaction high spend must optimize');
   standardCases++;
  }else if(mode===3){
   const benchmark=Math.round((8000+rnd()*45000)/100)*100;
   const ratio=pick(wideRatios);
   const amount=Math.round(benchmark*ratio);
   const blocked=id%19===0;
   const vm=vmFor(cat('energy',{amount,benchmark,quality:'reference',engineComparableAllowed:!blocked,appraisal:{energyPersistence:'persistent'}}));
   const x=row(vm,'energy');
   if(x.positionLabel!==expectedWide(ratio))fail(id,'energy wide position '+x.positionLabel+' ratio '+ratio);
   const expectedC=blocked?0:Math.max(0,Math.min(amount,benchmark*2)-benchmark*1.15);
   if(Math.abs(x.cUpper-expectedC)>1)fail(id,'energy C '+x.cUpper+' != '+expectedC);
   if(vm.potential.lower!==0)fail(id,'energy C-only lower must be 0');
   if(blocked){scopeBlocked++;if(x.cUpper!==0)fail(id,'energy scope block leaked C')}
   if(ratio>2&&!blocked){extremeCases++;if(!x.detailReview)fail(id,'energy extreme missing detail flag')}
   wideCases++;
  }else{
   const carrier=pick(['major','mvno'] as const);
   const bands=carrier==='major'?[2500,3500,5000,7000,12000,25000]:[1000,1700,2500,3500,6000,14000];
   const amount=pick(bands);
   const vm=vmFor(cat('mobile',{amount,benchmark:null,engineComparableAllowed:false,appraisal:{mobileScope:'mobileOnly',mobileCarrier:carrier}}));
   const x=row(vm,'mobile');
   const floor=carrier==='major'?6000:3000,cap=carrier==='major'?20000:10000;
   const expected=Math.max(0,Math.min(amount,cap)-floor);
   if(x.cUpper!==expected)fail(id,'mobile C '+x.cUpper+' != '+expected);
   if(vm.potential.lower!==0)fail(id,'mobile C-only lower must be 0');
   if(amount>cap&&!x.detailReview)fail(id,'mobile extreme missing flag');
   mobileCases++;
  }
 }catch(e){fail(id,e instanceof Error?e.message:String(e))}
}
if(failures.length){console.error(failures.join('\n'));throw new Error('V5 calibration violations: '+failures.length)}
console.log(JSON.stringify({cases:10000,standardCases,wideCases,mobileCases,scopeBlocked,extremeCases,violations:0},null,2));
console.log('RESULT_V5_CALIBRATION_10000_PASS');
