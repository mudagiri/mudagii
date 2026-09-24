import type { DiagnosisFactV1, LeadProfileV1 } from './data-platform-v1';

export type FunnelEventName='diagnosis_started'|'diagnosis_completed'|'result_viewed'|'future_goal_selected'|'line_clicked'|'line_connected'|'appointment_cta_clicked'|'appointment_booked'|'valid_appointment'|'conversion';
export interface FunnelEventV1 {eventId:string; anonymousUserId:string; diagnosisId:string; name:FunnelEventName; createdAt:string; data?:Record<string,unknown>}
export interface MudagiriPersistenceAdapter {
 saveDiagnosis(fact:DiagnosisFactV1 & {anonymousUserId:string; acquisition?:AcquisitionV1}):Promise<void>;
 saveLead(lead:LeadProfileV1 & {anonymousUserId:string}):Promise<void>;
 appendEvent(event:FunnelEventV1):Promise<void>;
}
export interface AcquisitionV1 {source?:string;medium?:string;campaign?:string;content?:string;term?:string;referrer?:string;landingPath?:string}
const AU='mudagiri_anonymous_user_id_v1';
const DX='mudagiri_active_diagnosis_id_v1';
export const uid=(prefix:string)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
export function getOrCreateAnonymousUserId(storage:Pick<Storage,'getItem'|'setItem'>=localStorage){let id=storage.getItem(AU);if(!id){id=uid('au');storage.setItem(AU,id)}return id}
export function newDiagnosisId(storage:Pick<Storage,'setItem'>=localStorage){const id=uid('dx');storage.setItem(DX,id);return id}
export function acquisitionFromLocation(loc:Pick<Location,'search'|'pathname'>=location,referrer=(typeof document!=='undefined'?document.referrer:'')):AcquisitionV1{const q=new URLSearchParams(loc.search);return {source:q.get('utm_source')||undefined,medium:q.get('utm_medium')||undefined,campaign:q.get('utm_campaign')||undefined,content:q.get('utm_content')||undefined,term:q.get('utm_term')||undefined,referrer:referrer||undefined,landingPath:loc.pathname}}

// Browser beta adapter. Durable across reloads on the same device; replace with server adapter before public launch.
export class LocalPersistenceAdapter implements MudagiriPersistenceAdapter{
 constructor(private storage:Pick<Storage,'getItem'|'setItem'>=localStorage){}
 private add(key:string,v:unknown){const xs=JSON.parse(this.storage.getItem(key)||'[]');xs.push(v);this.storage.setItem(key,JSON.stringify(xs))}
 async saveDiagnosis(v:DiagnosisFactV1 & {anonymousUserId:string}){this.add('mudagiri_diagnosis_facts_v1',v)}
 async saveLead(v:LeadProfileV1 & {anonymousUserId:string}){this.add('mudagiri_leads_v1',v)}
 async appendEvent(v:FunnelEventV1){this.add('mudagiri_funnel_events_v1',v)}
}
export function event(anonymousUserId:string,diagnosisId:string,name:FunnelEventName,data?:Record<string,unknown>):FunnelEventV1{return {eventId:uid('ev'),anonymousUserId,diagnosisId,name,createdAt:new Date().toISOString(),data}}
