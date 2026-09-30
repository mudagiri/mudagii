export const JOURNEY_DRAFT_SCHEMA='MUDAGIRI_JOURNEY_DRAFT_V1' as const;
export const ACTIVE_RESULT_SCHEMA='MUDAGIRI_ACTIVE_RESULT_V1' as const;
export const JOURNEY_DRAFT_KEY='mudagiri_journey_draft_v1';
export const ACTIVE_RESULT_KEY='mudagiri_active_result_v1';

export type JourneyDraftV1={
 schemaVersion:typeof JOURNEY_DRAFT_SCHEMA;
 diagnosisId:string;
 anonymousUserId:string;
 updatedAt:string;
 toneMode:string;
 scene:string;
 questionIndex:number;
 householdSizePending:boolean;
 flow:any;
 profileV4Draft?:any;
 profileV4?:any;
 annualIncomeBand:any;
 scanIndex:number;
 rawExpenses:any;
 scanTouched:any;
 appraisalIndex:number;
 appraisalAnswers:any;
 typeIndex:number;
 typeAnswers:any;
};
export type ActiveResultV1={
 schemaVersion:typeof ACTIVE_RESULT_SCHEMA;
 diagnosisId:string;
 anonymousUserId:string;
 completedAt:string;
 methodology:{diagnosis:string;resolver:string;type:string};
 completed:any;
};

const parse=<T>(raw:string|null):T|null=>{try{return raw?JSON.parse(raw) as T:null}catch{return null}};

const STABLE_DRAFT_SCENES=new Set(['profile','incomeCalibration','scan','scanComplete','appraisal','appraisalComplete','typeQuiz','typeComplete','battleIntro']);
export function readJourneyDraftV1(storage:Pick<Storage,'getItem'>=localStorage):JourneyDraftV1|null{
 const v=parse<JourneyDraftV1>(storage.getItem(JOURNEY_DRAFT_KEY));
 if(!v||v.schemaVersion!==JOURNEY_DRAFT_SCHEMA||!v.diagnosisId||!STABLE_DRAFT_SCENES.has(v.scene))return null;
 if(!Number.isInteger(v.questionIndex)||v.questionIndex<0||v.questionIndex>9)return null;
 if(!Number.isInteger(v.scanIndex)||v.scanIndex<0||v.scanIndex>11)return null;
 if(!Number.isInteger(v.appraisalIndex)||v.appraisalIndex<0)return null;
 if(!Number.isInteger(v.typeIndex)||v.typeIndex<0||v.typeIndex>7)return null;
 return v;
}
export function writeJourneyDraftV1(v:JourneyDraftV1,storage:Pick<Storage,'setItem'>=localStorage){storage.setItem(JOURNEY_DRAFT_KEY,JSON.stringify(v))}
export function readActiveResultV1(storage:Pick<Storage,'getItem'>=localStorage):ActiveResultV1|null{
 const v=parse<ActiveResultV1>(storage.getItem(ACTIVE_RESULT_KEY));
 if(!v||v.schemaVersion!==ACTIVE_RESULT_SCHEMA||!v.diagnosisId||!v.anonymousUserId||!v.completed||!v.methodology)return null;
 return v;
}
export function writeActiveResultV1(v:ActiveResultV1,storage:Pick<Storage,'setItem'>=localStorage){
 storage.setItem(ACTIVE_RESULT_KEY,JSON.stringify(v));
}
export function clearActiveResultV1(storage:Pick<Storage,'removeItem'>=localStorage){storage.removeItem(ACTIVE_RESULT_KEY)}
export function clearJourneyDraftV1(storage:Pick<Storage,'removeItem'>=localStorage){storage.removeItem(JOURNEY_DRAFT_KEY)}
export function clearResumeStateV1(storage:Pick<Storage,'removeItem'>=localStorage){clearJourneyDraftV1(storage);clearActiveResultV1(storage)}
