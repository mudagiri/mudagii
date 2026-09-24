import type { DiagnosisFactV1, LeadProfileV1 } from './data-platform-v1';
import type { AcquisitionV1, FunnelEventV1, MudagiriPersistenceAdapter } from './persistence-v1';

export interface CentralApiConfig { baseUrl:string; apiKey?:string; fetchImpl?:typeof fetch; }
export class CentralApiPersistenceAdapter implements MudagiriPersistenceAdapter {
  private fetcher:typeof fetch;
  constructor(private cfg:CentralApiConfig){this.fetcher=cfg.fetchImpl??fetch}
  private async post(path:string, body:unknown){
    const r=await this.fetcher(`${this.cfg.baseUrl.replace(/\/$/,'')}${path}`,{method:'POST',headers:{'content-type':'application/json',...(this.cfg.apiKey?{'x-mudagiri-key':this.cfg.apiKey}:{})},body:JSON.stringify(body),keepalive:true});
    if(!r.ok) throw new Error(`MUDAGIRI_API_${r.status}`);
  }
  saveDiagnosis(v:DiagnosisFactV1 & {anonymousUserId:string; acquisition?:AcquisitionV1}){return this.post('/v1/diagnoses',v)}
  saveLead(v:LeadProfileV1 & {anonymousUserId:string}){return this.post('/v1/leads',v)}
  appendEvent(v:FunnelEventV1){return this.post('/v1/events',v)}
}

export function productionPersistence(fallback:MudagiriPersistenceAdapter){
  const base=(import.meta as any).env?.VITE_MUDAGIRI_API_URL as string|undefined;
  return base?new CentralApiPersistenceAdapter({baseUrl:base}):fallback;
}
