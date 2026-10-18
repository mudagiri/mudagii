/**
 * Display-only reference gap for matching 2024 age x household x gross income
 * peer cells. NOT a savings amount and NOT the difference in the actual
 * expenses of a peer household; conversion uses the user's own take-home.
 *
 * Inputs must already pass the published-cell gates and same expense scope
 * checks in ResultScreenChapter2V32. Never call when region is purportedly
 * matched: nationwide cohort grid contains no prefecture dimension.
 */
export type Chapter2PeerGapV1={
 available:true;
 ownPct:number;
 peerPctLow:number;
 peerPctHigh:number;
 /** user minus reference; lower/upper remain signed */
 gapPointsLow:number;
 gapPointsHigh:number;
 /** projected on user's OWN monthly disposable income; not official peer yen */
 gapYenLow:number;
 gapYenHigh:number;
 sourceRegion:'national_only';
 contributesToConfirmedSaving:false;
 contributesToPossibleSaving:false;
} | {available:false;reason:'SCOPE_OR_SOURCE_UNCONFIRMED'};
function r1(value:number){return Math.round(value*10)/10;}
function roundedYen(value:number){return Math.round(value);}
export function chapter2PeerGapV1(input:{
 ownMonthlyExpenseYen:number|null;
 ownMonthlyTakeHomeYen:number|null;
 peerPctLow:number|null;
 peerPctHigh:number|null;
 sameExpenseScopeConfirmed:boolean;
 sourceVerified:boolean;
}):Chapter2PeerGapV1{
 const {ownMonthlyExpenseYen:amount,ownMonthlyTakeHomeYen:takehome,
 peerPctLow:lo,peerPctHigh:hi,sameExpenseScopeConfirmed,sourceVerified}=input;
 const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
 if(!sameExpenseScopeConfirmed||!sourceVerified||!finite(amount)||amount<0||
   !finite(takehome)||takehome<=0||!finite(lo)||!finite(hi)||lo<0||hi<lo||hi>100)
  return {available:false,reason:'SCOPE_OR_SOURCE_UNCONFIRMED'};
 const ownPct=r1(amount/takehome*100);
 // Rates already published as 0.1pt rounded in the original cohort resolver.
 // Compute displayed gap from the *same* 0.1pt values shown on the card.
 const gapPointsLow=r1(ownPct-hi);
 const gapPointsHigh=r1(ownPct-lo);
 return {
  available:true,ownPct,peerPctLow:lo,peerPctHigh:hi,
  gapPointsLow,gapPointsHigh,
  gapYenLow:roundedYen(takehome*gapPointsLow/100),
  gapYenHigh:roundedYen(takehome*gapPointsHigh/100),
  sourceRegion:'national_only',
  contributesToConfirmedSaving:false,
  contributesToPossibleSaving:false,
 };
}
