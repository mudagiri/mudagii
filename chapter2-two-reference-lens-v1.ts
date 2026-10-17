/**
 * Chapter 2 display-only two-reference lens.
 *
 * Primary comparable and official 2025 income-class observations are DIFFERENT
 * populations. Do not synthesize an age × income official mean. Their overlap
 * is a conservative DISPLAY clue, never verified or possible savings and NEVER
 * passed to the frozen engine / cUpper / confirmed A.
 *
 * Percentages with the reference use the PARTICIPANT'S OWN take-home as an
 * identical illustration denominator, not FIES peer household burden rates.
 */
export const TWO_REFERENCE_LENS_VERSION='MUDAGIRI_TWO_REFERENCE_LENS_V1' as const;
type OptionalAmount=number|null|undefined;
export type TwoReferenceLensInput={
 currentAmountYen:OptionalAmount;
 primaryReferenceYen:OptionalAmount;
 incomeReferenceLowYen:OptionalAmount;
 incomeReferenceHighYen:OptionalAmount;
 ownMonthlyTakeHomeYen:OptionalAmount;
};
const valid=(x:OptionalAmount):x is number=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
const yen=(n:number)=>Math.round(n);
const pct=(a:number,b:number)=>Math.round(a/b*1000)/10;
export function twoReferenceLensV1(i:TwoReferenceLensInput){
 const own=valid(i.currentAmountYen)?yen(i.currentAmountYen):null;
 const primary=valid(i.primaryReferenceYen)?yen(i.primaryReferenceYen):null;
 const incomeLow=valid(i.incomeReferenceLowYen)?yen(i.incomeReferenceLowYen):null;
 const incomeHigh=valid(i.incomeReferenceHighYen)?yen(i.incomeReferenceHighYen):null;
 const incomeValid=incomeLow!==null&&incomeHigh!==null&&incomeLow<=incomeHigh;
 const takeHome=valid(i.ownMonthlyTakeHomeYen)&&i.ownMonthlyTakeHomeYen>0?i.ownMonthlyTakeHomeYen:null;
 const primaryDelta=own!==null&&primary!==null?own-primary:null;
 // 0 means the participant is within a band of observed class means.
 const incomeDelta=own!==null&&incomeValid
  ?(own>incomeHigh!?own-incomeHigh!:own<incomeLow!?own-incomeLow!:0):null;
 // Positive only when the observed spend exceeds BOTH independent reference
 // ceilings. This is a comparison CLUE, not a financial saving upper bound.
 const dualPositiveClue=primaryDelta!==null&&incomeDelta!==null
  ?Math.min(Math.max(0,primaryDelta),Math.max(0,incomeDelta)):null;
 return {
  version:TWO_REFERENCE_LENS_VERSION,ownYen:own,primaryYen:primary,
  incomeLowYen:incomeValid?incomeLow:null,incomeHighYen:incomeValid?incomeHigh:null,
  primaryDeltaYen:primaryDelta,incomeDeltaYen:incomeDelta,
  dualPositiveClueYen:dualPositiveClue,
  ownPct:own!==null&&takeHome!==null?pct(own,takeHome):null,
  primaryOnOwnTakeHomePct:primary!==null&&takeHome!==null?pct(primary,takeHome):null,
  incomeLowOnOwnTakeHomePct:incomeValid&&takeHome!==null?pct(incomeLow!,takeHome):null,
  incomeHighOnOwnTakeHomePct:incomeValid&&takeHome!==null?pct(incomeHigh!,takeHome):null,
  isOfficialMeanOfSameAgeAndIncome:false as const,
  isPeerAverageBurdenRate:false as const,
  affectsConfirmedOrCandidateSavings:false as const,
 };
}
