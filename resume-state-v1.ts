export const JOURNEY_DRAFT_SCHEMA='MUDAGIRI_JOURNEY_DRAFT_V1' as const;
export const ACTIVE_RESULT_SCHEMA='MUDAGIRI_ACTIVE_RESULT_V1' as const;
export const JOURNEY_DRAFT_KEY='mudagiri_journey_draft_v1';
export const ACTIVE_RESULT_KEY='mudagiri_active_result_v1';

export type ActiveResultV1={
 schemaVersion:typeof ACTIVE_RESULT_SCHEMA;
 diagnosisId:string;
 anonymousUserId:string;
 completedAt:string;
 methodology:{diagnosis:string;resolver:string;type:string};
 completed:any;
};

const parse=<T>(raw:string|null):T|null=>{try{return raw?JSON.parse(raw) as T:null}catch{return null}};

export function readActiveResultV1(storage:Pick<Storage,'getItem'>=localStorage):ActiveResultV1|null{
 const v=parse<ActiveResultV1>(storage.getItem(ACTIVE_RESULT_KEY));
 if(!v||v.schemaVersion!==ACTIVE_RESULT_SCHEMA||!v.diagnosisId||!v.completed)return null;
 return v;
}
export function writeActiveResultV1(v:ActiveResultV1,storage:Pick<Storage,'setItem'>=localStorage){
 storage.setItem(ACTIVE_RESULT_KEY,JSON.stringify(v));
}
export function clearActiveResultV1(storage:Pick<Storage,'removeItem'>=localStorage){storage.removeItem(ACTIVE_RESULT_KEY)}
export function clearJourneyDraftV1(storage:Pick<Storage,'removeItem'>=localStorage){storage.removeItem(JOURNEY_DRAFT_KEY)}
export function clearResumeStateV1(storage:Pick<Storage,'removeItem'>=localStorage){clearJourneyDraftV1(storage);clearActiveResultV1(storage)}
