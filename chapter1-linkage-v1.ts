import {parseChapter1HandoffV1,type Chapter1HandoffV1} from './chapter2-v2-contract';

/** Preserve an already-scored Chapter 1 JOB/STYLE in Chapter 2 analytics.
 * Never infer the old eight spending types from the newer JOB taxonomy.
 * This deliberately excludes questionnaire answers, income, spend and location.
 */
export type Chapter1LinkageV1={
 schemaVersion:'MUDAGIRI_CHAPTER1_LINKAGE_V1';
 chapter1SessionId:string;
 chapter1JobCode:string;
 chapter1JobName:string;
 chapter1StyleCode:string;
 chapter1CompletedAt:string;
};

export function chapter1LinkageV1(raw:Chapter1HandoffV1|null,anonymousUserId:string):Chapter1LinkageV1|null{
 if(!raw||!anonymousUserId)return null;
 const x=parseChapter1HandoffV1(JSON.stringify(raw),anonymousUserId);
 if(!x)return null;
 return {
  schemaVersion:'MUDAGIRI_CHAPTER1_LINKAGE_V1',
  chapter1SessionId:x.sessionId,
  chapter1JobCode:x.jobCode,
  chapter1JobName:x.jobName,
  chapter1StyleCode:x.primaryStyle,
  chapter1CompletedAt:x.completedAt,
 };
}

export function validatedChapter1LinkageV1(raw:unknown):Chapter1LinkageV1|null{
 if(!raw||typeof raw!=='object')return null;
 const x=raw as Partial<Chapter1LinkageV1>;
 if(x.schemaVersion!=='MUDAGIRI_CHAPTER1_LINKAGE_V1'||
 typeof x.chapter1SessionId!=='string'||!x.chapter1SessionId||
 typeof x.chapter1JobCode!=='string'||!['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'].includes(x.chapter1JobCode)||
 typeof x.chapter1JobName!=='string'||!x.chapter1JobName.trim()||x.chapter1JobName.length>80||
 typeof x.chapter1StyleCode!=='string'||!['DRIVE','ENJOY','SECURE','OPTIMIZE'].includes(x.chapter1StyleCode)||
 typeof x.chapter1CompletedAt!=='string'||!Number.isFinite(Date.parse(x.chapter1CompletedAt)))return null;
 return {
  schemaVersion:'MUDAGIRI_CHAPTER1_LINKAGE_V1',
  chapter1SessionId:x.chapter1SessionId,
  chapter1JobCode:x.chapter1JobCode,
  chapter1JobName:x.chapter1JobName,
  chapter1StyleCode:x.chapter1StyleCode,
  chapter1CompletedAt:x.chapter1CompletedAt
 };
}
