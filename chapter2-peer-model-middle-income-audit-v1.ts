/**
 * Research-only stress test of the archived 2025 income×age coefficients
 * against 2024 observed TWO-OR-MORE WORKER-household age×income cells.
 *
 * 2024 bracket midpoint (e.g. 500–550 -> 525万円) is an ANALYST
 * ASSUMPTION. It is not the exact average gross income of that cell.
 * This backtest is intentionally NOT a runtime peer rate or savings engine.
 */
import {OBSERVED_2024_MULTI_WORKER_CELLS} from './age-income-joint-multi-2024-official-v1';
import {
 LEGACY_2025_BASE_MONTHLY_V1,LEGACY_2025_MULTI_AGE_FACTORS_V1,
} from './chapter2-peer-model-calibration-audit-v1';

export const LEGACY_2025_MIDDLE_INCOME_ANCHORS_V1={
 food:[
  [500,0.8914],[550,0.9061],[599,0.9251],[600,0.9253],
  [650,0.9431],[700,0.9668],[750,0.9806],[800,1.0002],
  [900,1.0388],[1000,1.0653],
 ],
 utilities:[
  [500,0.9847],[550,0.9913],[599,0.9921],[600,0.9919],
  [650,0.9868],[700,0.9902],[750,0.9990],[800,1.0058],
  [900,1.0033],[1000,1.0087],
 ],
} as const;
const UNDER30_AGE_FACTOR={food:0.8077,utilities:0.8500} as const;
type ModelCat='food'|'utilities';
const round=(x:number,d=2)=>Number(x.toFixed(d));

/** Piecewise linear interpolation from existing archived anchor knots. */
function anchorFactor(cat:ModelCat,incomeMan:number):number|null{
 if(!Number.isFinite(incomeMan)||incomeMan<500||incomeMan>=1000)return null;
 const anchors=LEGACY_2025_MIDDLE_INCOME_ANCHORS_V1[cat];
 for(let i=1;i<anchors.length;i++){
  const [lo,lf]=anchors[i-1],[hi,hf]=anchors[i];
  if(incomeMan<=hi)return lf+(hf-lf)*(incomeMan-lo)/(hi-lo);
 }
 return null;
}

function ageFactor(cat:ModelCat,ageLabel:string):number|null{
 if(ageLabel.startsWith('30歳未満'))return UNDER30_AGE_FACTOR[cat];
 const decade=ageLabel.match(/^(30|40|50|60|70)～/)?.[1];
 if(!decade)return null;
 return LEGACY_2025_MULTI_AGE_FACTORS_V1[cat][decade as '30'|'40'|'50'|'60'|'70'];
}

export type MiddleIncomeBacktestCellV1={
 category:ModelCat;
 ageClass:string;
 grossIncomeClass:string;
 assumedIncomeMidpointMan:number;
 approximateSample:number;
 observedExpenseMonthlyYen:number;
 predictedExpenseMonthlyYen:number;
 signedErrorPct:number;
 officialAverageDisposableMonthlyYen:number;
 officialBurdenPct:number;
 illustrativeModelBurdenPct:number;
};

export function auditLegacy2025VsOfficialMiddleIncome2024V1(category:ModelCat){
 const rows:MiddleIncomeBacktestCellV1[]=[];
 for(const r of OBSERVED_2024_MULTI_WORKER_CELLS){
  const [ageClass,grossIncomeClass,approximateSample,disposable,food,energy]=r;
  const match=grossIncomeClass.match(/^(\d+)～(\d+)万円$/);
  if(!match)continue;
  const midpoint=(Number(match[1])+Number(match[2]))/2;
  if(midpoint<500||midpoint>=1000)continue;
  const ia=anchorFactor(category,midpoint);
  const aa=ageFactor(category,ageClass);
  if(ia===null||aa===null||approximateSample<50||disposable<=0)
   throw new Error('UNVERIFIED_2024_OFFICIAL_MIDDLE_CELL');
  const actual=category==='food'?food:energy;
  if(actual<=0)throw new Error('UNVERIFIED_2024_MIDDLE_EXPENSE');
  const pred=LEGACY_2025_BASE_MONTHLY_V1[category]*ia*aa;
  rows.push({
   category,ageClass,grossIncomeClass,assumedIncomeMidpointMan:midpoint,
   approximateSample,
   observedExpenseMonthlyYen:actual,predictedExpenseMonthlyYen:Math.round(pred),
   signedErrorPct:round((pred-actual)/actual*100,4),
   officialAverageDisposableMonthlyYen:disposable,
   officialBurdenPct:round(actual/disposable*100),
   illustrativeModelBurdenPct:round(pred/disposable*100),
  });
 }
 if(!rows.length)throw new Error('NO_MIDDLE_VALIDATION_CELLS');
 // Aggregate metrics use original unrounded estimate to avoid yen rounding.
 const residuals=rows.map(r=>{
  const pred=LEGACY_2025_BASE_MONTHLY_V1[category]*
   anchorFactor(category,r.assumedIncomeMidpointMan)!*ageFactor(category,r.ageClass)!;
  return pred-r.observedExpenseMonthlyYen;
 });
 const count=rows.length;
 const officialSum=rows.reduce((s,r)=>s+r.observedExpenseMonthlyYen,0);
 const summary={
  category,rows:count,
  mapePct:round(residuals.reduce((s,e,i)=>s+Math.abs(e)/rows[i].observedExpenseMonthlyYen,0)/count*100),
  wapePct:round(residuals.reduce((s,e)=>s+Math.abs(e),0)/officialSum*100),
  maxAbsolutePercentageErrorPct:round(Math.max(...residuals.map((e,i)=>Math.abs(e)/rows[i].observedExpenseMonthlyYen))*100),
  meanSignedRelativeErrorPct:round(residuals.reduce((s,e,i)=>s+e/rows[i].observedExpenseMonthlyYen,0)/count*100),
  productionEligibility:'RESEARCH_ONLY_NOT_DEPLOYABLE' as const,
  cohort:'MULTI_WORKER_HEAD_AGE_2024' as const,
  imputedIncomeMidpoint:true as const,
  calibrationSourceYear:2025 as const,
  validationYear:2024 as const,
 };
 return {summary,cells:rows};
}
