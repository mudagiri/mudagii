export type Chapter1AnswerCheckInput={
 version:string;anonymousUserId:string;sessionId:string;completedAt?:string;
 jobCode:string;jobName:string;primaryStyle:string
};
export type Chapter2AnswerCheckRow={
 category:string;v5Status:string;known:boolean;applicability?:string;
 appraisal?:{satisfaction?:string;selfDevelopmentValue?:string;subCancellationConfirmed?:boolean;subUnusedAmount?:number|null}|null;
 aAmount?:number;amount?:number|null;diagnosisAmountLabel?:string;diagnosisAmount?:number|null
};
export type Chapter2AnswerCheckInput={anonymousUserId:string;diagnosisId:string;rows:Chapter2AnswerCheckRow[]};
export type AnswerCheckCard={
 kind:'resonance'|'question';category:string;title:string;body:string;
 evidence:{chapter1:string;chapter2:string};confidence:'self_report_context_only';financialResult:false;
 monthlySnapshot:{kind:'declared_unused_contract'|'declared_monthly_spend';monthlyYen:number;annualYen:number;label:string;scope:string;caveat:string;notSavings:true}|null
};
export type AnswerCheckResult={
 status:'context_found'|'no_supported_link';
 headline:string;cards:AnswerCheckCard[];explanation:string;
 protectedVsReview:{kind:'protect_vs_confirmed_review';protect:{category:'fun';label:string;monthlyYen:number;source:string;isSaving:false};review:{category:'sub';label:string;monthlyYen:number;source:string;isSavingRealized:false};nextStep:string;caveat:string;privacy:'private_only'}|null;
 coverage:{reviewedCategoryCount:number;directMatchRulesApplied:number;axesVerified:0};
 cannotInfer:string[];nextStep:string;sensitivity:'private_only';shareAllowed:false;
 source:'same-person-self-report';score:null
};
export type AnswerCheckUnavailable={
 status:'unavailable';reason:string;headline:string;cards:[];
 coverage:{reviewedCategoryCount:0;directMatchRulesApplied:0;axesVerified:0};cannotInfer:string[]
};
export const CATEGORY_IDS:readonly string[];
export function assessChapter12AnswerCheck(v?:{chapter1?:Chapter1AnswerCheckInput|null;chapter2?:Chapter2AnswerCheckInput|null}):AnswerCheckResult|AnswerCheckUnavailable;
