export type Chapter3InsightV1={
  version:string;
  kind:string;
  goal:string|null;
  goalSource:"chapter2"|"chapter3"|null;
  adventurer:{jobCode:string;jobName:string;primaryStyle:string}|null;
  financial:{confirmedA:number|null;cUpper:number|null;confirmedLabel:string;candidateLabel:string;neverAdd:boolean}|null;
  insight:{headline:string;explanation:string;action:string;evidence:Array<{source:string;text:string}>;insightProven:boolean;advisoryOnly:boolean};
  math:null|{status:"need_conditions";message:string}|{status:"arithmetic_only";targetYen:number;earmarkedYen:number;monthsUntil:number;additionalTargetYen:number;monthlyYen:number;assumption:string;isAffordabilityAssessment:false};
  optionalConsultation:{required:false;copy:string};
  shareSafe:{jobCode:string|null;goalIconCode:string|null;completed:boolean};
  audit:{chapter1DataAccepted:boolean;chapter2DataAccepted:boolean;identityMismatchDropped:boolean};
};
export function evaluateChapter3(raw:unknown):Chapter3InsightV1;
