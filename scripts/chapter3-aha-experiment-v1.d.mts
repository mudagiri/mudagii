export type MissingAha={status:'need_data';ask:string;missing:string};
export type InvalidAha={status:'invalid';message:string};
export type WorkAha={status:'conditional_insight';kind:'work_bridge';headline:string;keyFinding:string;nuance:string;investmentContext:string;evidence:Array<{key:string;value:number}>;calculated:{months:number;bridgeYen:number;contributedPrincipal:number|null};oneNextStep:string;caveat:string;insightProven:false};
export type TravelAha={status:'conditional_insight';kind:'travel_reframe';headline:string;keyFinding:string;householdBridge:string;evidence:Array<{key:string;value:number}>;calculated:{annual:number;monthly:number;scenario:null|{ifAllCandidatesRealizedYen:number;hypotheticalPortionPercent:number|null;hypotheticalRemainingYen:number;guaranteed:false}};oneNextStep:string;caveat:string;insightProven:false};
export function workFreedomAha(v:{currentAge?:number;changeAtAge?:number;bridgeUntilAge?:number;monthlyIncomeGapYen?:number;monthlyInvestmentYen?:number}):MissingAha|InvalidAha|WorkAha;
export function travelAha(v:{tripsPerYear?:number;costPerTripYen?:number;chapter2CandidateUpperMonthlyYen?:number}):MissingAha|InvalidAha|TravelAha;
