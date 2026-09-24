import type { AcquisitionV1, FunnelEventV1 } from './persistence-v1';
export interface DiagnosisFactV2 {diagnosisId:string;createdAt:string;schemaVersion:'MUDAGIRI_SHEET_V2';typeModelVersion:string;methodologyVersion:string; toneMode?:'gentle'|'serious'|'hell';household:string;age:number;monthlyIncome:number;monthlySaving:number;type:{code:string;axes:{fv:number;pi:number;au:number};strength:{fv:number;pi:number;au:number};nearMiddle:{fv:boolean;pi:boolean;au:boolean}};monthlyImprovement:number;goal?:string;needsReview:unknown[];expenses:Record<string,number>;typeAnswers:Record<string,unknown>;anonymousUserId:string;acquisition?:AcquisitionV1}
export interface MudagiriPersistenceAdapterV2 {saveDiagnosis(v:DiagnosisFactV2):Promise<void>;appendEvent(v:FunnelEventV1):Promise<void>}
export class LocalPersistenceAdapterV2 implements MudagiriPersistenceAdapterV2{constructor(private storage:Pick<Storage,'getItem'|'setItem'>=localStorage){}private add(k:string,v:unknown){const xs=JSON.parse(this.storage.getItem(k)||'[]');xs.push(v);this.storage.setItem(k,JSON.stringify(xs))}async saveDiagnosis(v:DiagnosisFactV2){this.add('mudagiri_diagnoses_v2',v)}async appendEvent(v:FunnelEventV1){this.add('mudagiri_events_v2',v)}}
class GasPersistenceAdapterV2 implements MudagiriPersistenceAdapterV2{
 constructor(private url:string,private fallback:MudagiriPersistenceAdapterV2){}
 private async send(body:unknown){await fetch(this.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),keepalive:true,mode:'no-cors'})}
 async saveDiagnosis(v:DiagnosisFactV2){
   // GAS no-cors responses are opaque: keep a durable browser backup even when fetch appears successful.
   await this.fallback.saveDiagnosis(v);
   try{await this.send({kind:'diagnosis',...v})}catch{/* local backup already exists */}
 }
 async appendEvent(v:FunnelEventV1){
   await this.fallback.appendEvent(v);
   try{await this.send({kind:'event',...v})}catch{/* local backup already exists */}
 }
}
export function productionPersistenceV2(fallback:MudagiriPersistenceAdapterV2){const url=(import.meta as any).env?.VITE_MUDAGIRI_GAS_URL as string|undefined;return url?new GasPersistenceAdapterV2(url,fallback):fallback}
