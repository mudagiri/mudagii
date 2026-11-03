/**
 * Research-only audit of the archived 2025 income/age adjustment coefficients.
 * NEVER import this module into Chapter 2 result rendering, the frozen benchmark,
 * confirmedA, cUpper, share amounts, or GAS/LINE payloads.
 *
 * Archived source (Library): Mudagiri_Reference_Data_V1.0_FINAL_FROZEN.xlsx
 * sha256 da44ef64aaf52641c7d0d11f97bd64538199ad0d9cb10ddcce885ead00eecba0
 * Sheets: REFERENCE_BASE / INCOME_ANCHORS / AGE_BANDS.
 * Official holdout: 2024 Survey of Household Economy, table 1-29-1,
 * published grouped 1000–1249 / 1250–1499 / 1500+ income cells,
 * e-Stat dbview 0004039867, a010292.xlsx.
 *
 * 2024 is EARLIER than model source year 2025; this is a descriptive
 * cross-year backtest, NOT a prospective model validation or proof of causality.
 */
import {
 AGE_INCOME_HIGH_2024_SOURCE,
 OBSERVED_2024_HIGH_MULTI_WORKER_CELLS,
} from './age-income-joint-high-2024-official-v1';

/**
 * Six original 2025 broad expenditure lines, not twelve diagnostic categories.
 * A code match or factor NEVER grants permission for an official peer comparison.
 */
export const LEGACY_2025_HIGH_INCOME_ANCHORS_V1={
 food:{1000:1.0653,1250:1.1313,1500:1.3000},
 utilities:{1000:1.0087,1250:1.0207,1500:1.0321},
 household:{1000:1.0243,1250:1.0652,1500:1.1721},
 health:{1000:1.0308,1250:1.0690,1500:1.1774},
 transport_comm:{1000:1.0171,1250:1.0617,1500:1.1500},
 recreation:{1000:1.0631,1250:1.1780,1500:1.3500},
} as const;

export const LEGACY_2025_BASE_MONTHLY_V1={
 food:98127.99,
 utilities:24183.75,
 household:14090.53,
 health:14660.40,
 transport_comm:57070.45,
 recreation:35232.99,
} as const;

export const LEGACY_2025_MULTI_AGE_FACTORS_V1={
 food:{'30':0.9371,'40':1.0312,'50':1.0076,'60':1.0199,'70':1.0199},
 utilities:{'30':0.9290,'40':0.9971,'50':1.0245,'60':1.0372,'70':1.0372},
} as const;

export const LEGACY_2025_SCOPE_GUARDS_V1={
 sample:'two_or_more_worker_households',
 incomeYear:2025,
 officialEvaluationYear:2024,
 incomeCapMan:1500,
 individualSingleHighIncomeEstimateAllowed:false,
 hasExpenseMatch:{
  food:'LIMITED_SCOPE_ONLY',
  utilities:'LIMITED_SCOPE_ONLY',
  household:'NO_12_CATEGORY_MATCH',
  health:'NO_12_CATEGORY_MATCH',
  transport_comm:'NO_12_CATEGORY_MATCH',
  recreation:'NO_12_CATEGORY_MATCH',
 },
 productionEligibility:'RESEARCH_ONLY_NOT_DEPLOYABLE',
 savingsEligibility:false,
} as const;

type AuditedCategory='food'|'utilities';
type VerifiedAge='30'|'40'|'50'|'60'|'70';
type VerifiedAnchor=1000|1250|1500;
const OFFICIAL_GROSS_TO_ANCHOR={
 '（再掲）1000～1250万円':1000,
 '（再掲）1250～1500万円':1250,
 '（再掲）1500万円以上':1500,
} as const;
const ageToAnchor=(raw:string):VerifiedAge|null=>{
 const value=raw.match(/^(30|40|50|60|70)/)?.[1];
 return value==='30'||value==='40'||value==='50'||value==='60'||value==='70'?value:null;
};
const sourceIncome=(raw:string):VerifiedAnchor|null=>
 Object.prototype.hasOwnProperty.call(OFFICIAL_GROSS_TO_ANCHOR,raw)
  ?OFFICIAL_GROSS_TO_ANCHOR[raw as keyof typeof OFFICIAL_GROSS_TO_ANCHOR]:null;

export type LegacyModelAuditCellV1={
 category:AuditedCategory;
 originalAgeClass:string;
 originalIncomeClass:string;
 approximateSample:number;
 observedMonthlyExpenseYen:number;
 officialAverageMonthlyDisposableYen:number;
 predictedMonthlyExpenseYen:number;
 officialObservedBurdenPct:number;
 modelBurdenPctUsingOfficialDenominator:number;
 absolutePercentageErrorPct:number;
 signedRelativeErrorPct:number;
};
export type LegacyModelAuditSummaryV1={
 category:AuditedCategory;
 rows:number;
 mapePct:number;
 wapePct:number;
 maeYen:number;
 maxAbsolutePercentageErrorPct:number;
 meanSignedRelativeErrorPct:number;
 productionEligibility:'RESEARCH_ONLY_NOT_DEPLOYABLE';
 official2024CellOnly: true;
 modelYear:2025;
};
const mean=(values:readonly number[]):number=>values.reduce((s,x)=>s+x,0)/values.length;
const round=(value:number,digits=2)=>Number(value.toFixed(digits));

/**
 * Unrounded predicted expense for error metrics; only round yen for the
 * explanatory output. Both burden ratios share the actual 2024 disposable
 * income denominator: it is NOT a projected 2025 disposable-income mean.
 */
export function auditLegacy2025VsOfficialHighIncome2024V1(category:AuditedCategory):{
 summary:LegacyModelAuditSummaryV1;
 cells:readonly LegacyModelAuditCellV1[];
}{
 const base=LEGACY_2025_BASE_MONTHLY_V1[category];
 const factor=LEGACY_2025_HIGH_INCOME_ANCHORS_V1[category];
 const ageFactor=LEGACY_2025_MULTI_AGE_FACTORS_V1[category];
 const cells:LegacyModelAuditCellV1[]=OBSERVED_2024_HIGH_MULTI_WORKER_CELLS.map(row=>{
  const [originalAgeClass,originalIncomeClass,approximateSample,disposable,food,energy]=row;
  const age=ageToAnchor(originalAgeClass);
  const income=sourceIncome(originalIncomeClass);
  if(!age||!income||approximateSample<50||!Number.isFinite(disposable)||disposable<=0){
   throw new Error('UNVERIFIED_OR_UNSUPPORTED_OFFICIAL_CELL');
  }
  const observed=category==='food'?food:energy;
  if(!(observed>0))throw new Error('UNVERIFIED_OFFICIAL_EXPENSE');
  const estimate=base*factor[income]*ageFactor[age];
  const signedPct=(estimate-observed)/observed*100;
  return {
   category,originalAgeClass,originalIncomeClass,approximateSample,
   observedMonthlyExpenseYen:observed,
   officialAverageMonthlyDisposableYen:disposable,
   predictedMonthlyExpenseYen:Math.round(estimate),
   officialObservedBurdenPct:round(observed/disposable*100),
   modelBurdenPctUsingOfficialDenominator:round(estimate/disposable*100),
   absolutePercentageErrorPct:round(Math.abs(signedPct),4),
   signedRelativeErrorPct:round(signedPct,4),
  };
 });
 if(!cells.length)throw new Error('NO_VALIDATION_CELLS');
 const predictedUnrounded=cells.map(c=>{
  const age=ageToAnchor(c.originalAgeClass)!;
  const income=sourceIncome(c.originalIncomeClass)!;
  return base*factor[income]*ageFactor[age];
 });
 const errors=predictedUnrounded.map((p,i)=>p-cells[i].observedMonthlyExpenseYen);
 const totalObserved=cells.reduce((s,x)=>s+x.observedMonthlyExpenseYen,0);
 const summary:LegacyModelAuditSummaryV1={
  category,rows:cells.length,
  mapePct:round(mean(errors.map((e,i)=>Math.abs(e)/cells[i].observedMonthlyExpenseYen))*100),
  wapePct:round(errors.reduce((s,e)=>s+Math.abs(e),0)/totalObserved*100),
  maeYen:round(mean(errors.map(e=>Math.abs(e))),0),
  maxAbsolutePercentageErrorPct:round(Math.max(...errors.map((e,i)=>Math.abs(e)/cells[i].observedMonthlyExpenseYen))*100),
  meanSignedRelativeErrorPct:round(mean(errors.map((e,i)=>e/cells[i].observedMonthlyExpenseYen))*100),
  productionEligibility:'RESEARCH_ONLY_NOT_DEPLOYABLE',
  official2024CellOnly:true,
  modelYear:2025,
 };
 return {summary,cells};
}

export const LEGACY_PEER_AUDIT_REPRODUCIBILITY={
 historicalWorkbookSha256:'da44ef64aaf52641c7d0d11f97bd64538199ad0d9cb10ddcce885ead00eecba0',
 official2024WorkbookSha256:AGE_INCOME_HIGH_2024_SOURCE.workbookSha256,
 publicSource:AGE_INCOME_HIGH_2024_SOURCE.url,
 officialCellCount:OBSERVED_2024_HIGH_MULTI_WORKER_CELLS.length,
 freezeDecision:'NO_RENDERING_UNTIL_EXTERNAL_HOLDOUT_AND_SCOPE_GATE_PASS',
} as const;
