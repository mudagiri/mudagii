/**
 * Read-only 2024 e-Stat ORIGINAL 50万円 income/age joint source for
 * the SEVEN RELATED published fee groups. The result is a RANGE OF
 * PUBLISHED CELL MEANS, NOT a combined '100万円帯の公式平均' nor an estimate.
 * Never add public rate differences to confirmedA, cUpper, referral/share.
 */
import {OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2,OFFICIAL_2024_ORIGINAL_50MAN_SHA_V2} from './official-2024-50man-aligned-worker-v2';
import {
 AGE_INCOME_SUPPORTED_MULTI_GROSS_BANDS,AGE_INCOME_SUPPORTED_SINGLE_GROSS_BANDS,
 ageBandForObserved2024V1,
} from './age-income-joint-burden-gate-v1';
import {EXTRA_ITEMS} from './chapter2-official-related-2024-high-v1';

export const OFFICIAL_RELATED_MIDDLE_2024_SOURCE={
 year:2024,table:'1-29-1',sha:OFFICIAL_2024_ORIGINAL_50MAN_SHA_V2,
 minimumSample:50,notDiagnosisMean:true,notSaving:true,
} as const;
type SourceRow=typeof OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2[number];
const round=(n:number)=>Math.round(n*100)/100;
const notAvailable=(reason:string)=>({
 available:false as const,reason,items:[] as readonly Official2024RelatedRangeItem[],
 sourceRows:0,minCellSample:null as number|null,sourceIncomeBands:[] as string[],
 savingEligible:false as const,
});
export type Official2024RelatedRangeItem={
 category:typeof EXTRA_ITEMS[number]['category'];
 code:string;label:string;scope:string;
 ratePctLow:number;ratePctHigh:number;
 monthlyMeanLowYen:number;monthlyMeanHighYen:number;
};
export function relatedOfficial50manItems2024(params:{
 household:'multi'|'single';headAge:number|null|undefined;
 grossBand:string|null|undefined;headAgeConfirmed:boolean;headWorkerConfirmed:boolean;
}){
 if(!params.headWorkerConfirmed)return notAvailable('HEAD_WORKER_STATUS_NOT_CONFIRMED');
 if(params.household==='multi'&&!params.headAgeConfirmed)return notAvailable('HEAD_AGE_NOT_CONFIRMED');
 const age=typeof params.headAge==='number'?ageBandForObserved2024V1(params.headAge):null;
 if(!age)return notAvailable('AGE_CLASS_UNAVAILABLE');
 const band=params.grossBand;
 const gross=params.household==='multi'
  ?band&&Object.prototype.hasOwnProperty.call(AGE_INCOME_SUPPORTED_MULTI_GROSS_BANDS,band)
   ?AGE_INCOME_SUPPORTED_MULTI_GROSS_BANDS[band as keyof typeof AGE_INCOME_SUPPORTED_MULTI_GROSS_BANDS]:null
  :band&&Object.prototype.hasOwnProperty.call(AGE_INCOME_SUPPORTED_SINGLE_GROSS_BANDS,band)
   ?AGE_INCOME_SUPPORTED_SINGLE_GROSS_BANDS[band as keyof typeof AGE_INCOME_SUPPORTED_SINGLE_GROSS_BANDS]:null;
 if(!gross)return notAvailable('UNSUPPORTED_GROSS_BAND');
 const rows:SourceRow[]=[];
 for(const income of gross){
  const matches=OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2.filter(row=>
   row[0]===params.household&&row[1]===age&&row[2]===income);
  if(matches.length!==1)return notAvailable('ORIGINAL_CELL_MISSING_OR_LOW_SAMPLE');
  const row=matches[0];
  if(row[3]<50||row[4]<=0)return notAvailable('ORIGINAL_CELL_SMALL_OR_INVALID');
  rows.push(row);
 }
 const items:Official2024RelatedRangeItem[]=[];
 EXTRA_ITEMS.forEach((item,index)=>{
  if(params.household==='single'&&item.category==='childEducation')return;
  const column=9+index;
  const expenses=rows.map(row=>row[column]);
  if(expenses.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0))return;
  const amounts=expenses as number[];
  const rates=amounts.map((amount,i)=>amount/rows[i][4]*100);
  items.push({
   ...item,ratePctLow:round(Math.min(...rates)),ratePctHigh:round(Math.max(...rates)),
   monthlyMeanLowYen:Math.min(...amounts),monthlyMeanHighYen:Math.max(...amounts),
  });
 });
 if(!items.length)return notAvailable('ALL_RELATED_ITEMS_UNAVAILABLE');
 return {
  available:true as const,reason:'ORIGINAL_RELATED_ITEM_RANGES_ONLY',
  items,sourceRows:rows.length,
  minCellSample:Math.min(...rows.map(r=>r[3])),
  sourceIncomeBands:rows.map(r=>r[2]),
  savingEligible:false as const,
 };
}
