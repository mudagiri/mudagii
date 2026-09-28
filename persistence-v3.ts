export const PERSISTENCE_SCHEMA_V3='MUDAGIRI_SHEET_V3' as const;
export type PersistenceV3={saveDiagnosis(v:any):Promise<void>;appendEvent(v:any):Promise<void>;saveLead?(v:any):Promise<void>};

const safeParse=(x:string|null)=>{try{return JSON.parse(x||'[]')}catch{return []}};
export class LocalPersistenceV3 implements PersistenceV3{
 constructor(private storage:Pick<Storage,'getItem'|'setItem'>=localStorage){}
 async saveDiagnosis(v:any){
   const k='mudagiri_diagnoses_v3',xs:any[]=safeParse(this.storage.getItem(k));
   const i=xs.findIndex(x=>x.diagnosisId===v.diagnosisId); if(i>=0)xs[i]=v; else xs.push(v);
   this.storage.setItem(k,JSON.stringify(xs));
 }
 async appendEvent(v:any){const k='mudagiri_events_v3',xs:any[]=safeParse(this.storage.getItem(k));xs.push(v);this.storage.setItem(k,JSON.stringify(xs))}
 async saveLead(v:any){const k='mudagiri_leads_v3',xs:any[]=safeParse(this.storage.getItem(k));const i=xs.findIndex(x=>x.diagnosisId===v.diagnosisId);if(i>=0)xs[i]=v;else xs.push(v);this.storage.setItem(k,JSON.stringify(xs))}
}
class GasPersistenceV3 implements PersistenceV3{
 constructor(private url:string,private fallback:PersistenceV3){}
 private send(body:any){return fetch(this.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),keepalive:true,mode:'no-cors'})}
 async saveDiagnosis(v:any){await this.fallback.saveDiagnosis(v);try{await this.send({kind:'diagnosis_v3',...v})}catch{}}
 async appendEvent(v:any){await this.fallback.appendEvent(v);try{await this.send({kind:'event_v3',...v})}catch{}}
 async saveLead(v:any){await this.fallback.saveLead?.(v);try{await this.send({kind:'lead_v3',...v})}catch{}}
}
export function productionPersistenceV3(fallback:PersistenceV3){const url=(import.meta as any).env?.VITE_MUDAGIRI_GAS_URL as string|undefined;return url?new GasPersistenceV3(url,fallback):fallback}
export function eventV3(anonymousUserId:string,diagnosisId:string,name:string,data?:Record<string,unknown>){
 return {eventId:`ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`,anonymousUserId,diagnosisId,name,createdAt:new Date().toISOString(),data}
}
