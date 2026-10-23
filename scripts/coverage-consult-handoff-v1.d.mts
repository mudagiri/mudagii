export type CoverageConsultHandoff={diagnosisId:string;firstQuest:null;placement:'coverage_review';handoffCode:string;goal:null;consultPrimary:'lifeplan';consultSelectedTopic:'insurance';insuranceReview:true};
export function coverageConsultHandoff(diagnosisId:unknown,handoffCode:unknown):CoverageConsultHandoff|null;
export function externalLineContext<T extends Record<string,unknown>>(ctx:Record<string,unknown>|null|undefined,normalPayload:T):CoverageConsultHandoff|T|null;
