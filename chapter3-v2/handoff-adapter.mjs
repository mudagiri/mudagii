/**
 * Chapter3 V2 opt-in handoff adapter. Isolated on PR #70.
 * Does not mutate C1/C2, persist raw results, track clicks or contact LINE.
 *
 * The V5 VM does NOT carry anonymousUserId. This adapter checks its diagnosisId
 * against the active application context; the caller must obtain that context
 * from the completed, same-session Chapter2 app, not from URL/user-supplied JSON.
 * Browser-local identity is NOT server authentication or tamper-proof consent.
 */
import {CATS,CHAPTER3_HANDOFF_VERSION,validateHandoff} from './decision-core.mjs';

export const C3_HANDOFF_CONSENT='chapter3_entry_confirmed';
export const CHAPTER2_VM_VERSION='MUDAGIRI_RESULT_VM_V5_0';
export const CHAPTER2_VM_METHODOLOGY='MUDAGIRI_RESULT_VM_V5_2';
export const CHAPTER1_SOURCE_VERSION='MUDAGIRI_MONEY_TYPE_HANDOFF_V1';

const CH2_GOALS=new Set(['home','family','travel','invest','challenge','safety','retirement','undecided']);
const ALLOWED_JOBS=new Set(['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP']);
const ALLOWED_STYLES=new Set(['DRIVE','ENJOY','SECURE','OPTIMIZE']);
const validId=x=>typeof x==='string'&&x.length>0&&x.length<=160;
const validTime=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
const number=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
const resultError=code=>({ok:false,error:code});

export function buildChapter3HandoffFromV5({
 consent,anonymousUserId,diagnosisId,chapter2Vm,chapter2Goal=null,
 chapter1Handoff=null,createdAt
}={}){
 if(consent!==C3_HANDOFF_CONSENT)return resultError('EXPLICIT_C3_ENTRY_REQUIRED');
 if(!validId(anonymousUserId)||!validId(diagnosisId))return resultError('INVALID_ACTIVE_CONTEXT');
 if(!validTime(createdAt))return resultError('INVALID_CAPTURE_TIME');

 const vm=chapter2Vm;
 if(!vm||typeof vm!=='object'||
    vm.version!==CHAPTER2_VM_VERSION||
    vm.methodologyVersion!==CHAPTER2_VM_METHODOLOGY ||
    vm.diagnosisId!==diagnosisId)return resultError('WRONG_V5_RESULT_OR_DIAGNOSIS_ID');
 if(chapter2Goal!==null&&!CH2_GOALS.has(chapter2Goal))return resultError('INVALID_CHAPTER2_GOAL');

 let chapter1=null;
 if(chapter1Handoff!==null){
  const x=chapter1Handoff;
  if(!x||typeof x!=='object'||x.version!==CHAPTER1_SOURCE_VERSION||
     x.anonymousUserId!==anonymousUserId||!validId(x.sessionId)||
     !ALLOWED_JOBS.has(x.jobCode)||!ALLOWED_STYLES.has(x.primaryStyle)||
     !validTime(x.completedAt)||
     typeof x.jobName!=='string'||!x.jobName.trim()||x.jobName.length>80)
    return resultError('INVALID_OR_FOREIGN_CHAPTER1');
  // A displayed Chapter1Linkage is optional, but if present it must agree
  // with the independently identity-checked source handoff.
  const link=vm.chapter1Link;
  if(link!=null &&
     (link.schemaVersion!=='MUDAGIRI_CHAPTER1_LINKAGE_V1'||
      link.chapter1SessionId!==x.sessionId||
      link.chapter1JobCode!==x.jobCode||
      link.chapter1StyleCode!==x.primaryStyle))
    return resultError('CHAPTER1_LINK_CONFLICT');
  chapter1={
    anonymousUserId,sessionId:x.sessionId,completedAt:x.completedAt,
    jobCode:x.jobCode,primaryStyle:x.primaryStyle
  };
 }
 // If Chapter1 is missing, we DO NOT infer JOB from vm.chapter1Link alone,
 // because that projection contains no anonymous identity.
 if(!Array.isArray(vm.rows)||vm.rows.length!==CATS.length||!vm.potential)
    return resultError('V5_ROWS_OR_POTENTIAL_MISSING');

 const rows=[];
 const seen=new Set();
 let totalA=0,totalC=0;
 for(const x of vm.rows){
  if(!x||!CATS.includes(x.category)||seen.has(x.category)||
     typeof x.known!=='boolean'||
     !['cut','optimize','protect','inspect','ok','na'].includes(x.v5Status)||
     !Number.isSafeInteger(x.aAmount)||x.aAmount<0||
     !number(x.cUpper) ||
     (x.v5Status==='na'&&(x.aAmount!==0||x.cUpper!==0))||
     (x.aAmount>0&&(x.category!=='sub'||x.v5Status!=='cut'))||
     (!x.known&&(x.aAmount!==0||x.cUpper!==0)))
    return resultError('INVALID_V5_ROW');
  seen.add(x.category);
  totalA+=x.aAmount;
  totalC+=x.cUpper;
  if(!Number.isSafeInteger(totalA)||!Number.isFinite(totalC))
    return resultError('INVALID_V5_TOTAL');
  // Minimize: do not pass profile, actual expense, comparisons, satisfaction,
  // income, insurance details, or diagnostic answers.
  rows.push({category:x.category,v5Status:x.v5Status,known:x.known,
             aAmount:x.aAmount,cUpper:x.cUpper});
 }
 if(seen.size!==CATS.length||
    !Number.isSafeInteger(vm.potential.confirmedA)||
    !number(vm.potential.cUpper)||
    vm.potential.confirmedA!==totalA||
    Math.abs(vm.potential.cUpper-totalC)>0.00001)
  return resultError('V5_TOTALS_NOT_RECONCILED');

 const handoff={
   version:CHAPTER3_HANDOFF_VERSION,
   anonymousUserId,
   // Capturing source of explicit entry is metadata, not authentication.
   chapter3EntryAt:createdAt,
   chapter1,
   chapter2:{
     anonymousUserId,diagnosisId,vmVersion:CHAPTER2_VM_METHODOLOGY,
     goal:chapter2Goal,rows,
     potential:{confirmedA:totalA,cUpper:totalC}
   }
 };
 const checked=validateHandoff(handoff,anonymousUserId);
 if(!checked.ok)return resultError('DECISION_CORE_REJECTED_'+checked.error);
 return {ok:true,handoff};
}
