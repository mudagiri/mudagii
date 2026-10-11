/**
 * MUDAGIRI product funnel instrumentation, opt-in.
 *
 * Never forwards raw diagnosis data, answers, household profile, financial
 * values, URLs, or backend/session identifiers. Web previews are off by default.
 * Events are attempted on a best-effort basis; a browser event is NEVER proof
 * of a LINE friend-add, reward delivery, or a booked consultation.
 */
export type ProductFunnelScope='chapter1'|'chapter2';
const CHAPTER1_EVENTS:Record<string,string>={
 intro_started:'chapter1_started',
 result_seen:'chapter1_completed',
 share_attempt:'chapter1_share_attempted',
 share_native_sheet_resolved:'chapter1_share_sheet_returned',
 share_image_downloaded:'chapter1_share_image_downloaded',
 share_text_handoff:'chapter1_share_text_handoff',
 line_bonus_preview_opened:'chapter1_bonus_preview_opened',
 line_bonus_outbound_clicked:'chapter1_line_outbound_clicked',
 household_cta_clicked:'chapter1_household_cta_clicked',
};
const CHAPTER2_EVENTS:Record<string,string>={
 diagnosis_started:'chapter2_started',
 diagnosis_completed:'chapter2_completed',
 chapter2_v31_share_intent:'chapter2_share_attempted',
 chapter2_v31_share_export:'chapter2_share_exported',
 chapter2_v31_share_cancelled:'chapter2_share_cancelled',
 chapter2_v31_consultation_modal_opened:'chapter2_consultation_modal_opened',
 chapter2_v31_consultation_line_outbound:'chapter2_line_outbound_clicked',
};
const SAFE_METHODS=new Set(['native_image','native_sheet_returned','download','copy_link','x_text','line_text']);
const SAFE_PLACEMENTS=new Set(['after_rewards','goal_quest','consult_route']);
const SAFE_PLATFORMS=new Set(['native','x','line','threads','instagram']);
function allowedConfig(env:Record<string,unknown>,pathname:string){
 if(env.VITE_MUDAGIRI_ANALYTICS_ENABLED!=='1')return null;
 if(pathname.includes('/pilot/')&&env.VITE_MUDAGIRI_ANALYTICS_ALLOW_PILOT!=='1')return null;
 const apiKey=env.VITE_POSTHOG_PROJECT_KEY;
 const host=env.VITE_POSTHOG_HOST;
 if(typeof apiKey!=='string'||!/^phc_[A-Za-z0-9]+$/.test(apiKey))return null;
 if(typeof host!=='string'||!/^https:\/\/(us|eu)\.i\.posthog\.com\/?$/.test(host))return null;
 return {apiKey,host:host.replace(/\/$/,'')};
}
function sessionIdentity(){
 const key='mudagiri_analytics_session_v1';
 try{
  const existing=sessionStorage.getItem(key);
  if(existing&&/^mg_[a-f0-9-]{36}$/.test(existing))return existing;
  const value='mg_'+crypto.randomUUID();
  sessionStorage.setItem(key,value);
  return value;
 }catch{return null;}
}
/** Pure, testable event-mapping boundary. No dynamic properties are forwarded. */
export function buildSafeFunnelEvent(scope:ProductFunnelScope,name:string,details?:Record<string,unknown>){
 const event=(scope==='chapter1'?CHAPTER1_EVENTS:CHAPTER2_EVENTS)[name];
 if(!event)return null;
 const properties:Record<string,string>={chapter:scope};
 const method=details?.method??details?.target;
 const placement=details?.placement;
 if(typeof method==='string'&&SAFE_METHODS.has(method))properties.method=method;
 else if(typeof method==='string'&&SAFE_PLATFORMS.has(method))properties.platform=method;
 if(typeof placement==='string'&&SAFE_PLACEMENTS.has(placement))properties.placement=placement;
 return {event:'mudagiri_'+event,properties};
}
export function trackMudagiriProductEvent(scope:ProductFunnelScope,name:string,details?:Record<string,unknown>){
 if(typeof window==='undefined')return false;
 const payload=buildSafeFunnelEvent(scope,name,details);
 if(!payload)return false;
 const cfg=allowedConfig((import.meta as any).env??{},window.location.pathname);
 const identity=cfg?sessionIdentity():null;
 if(!cfg||!identity)return false;
 try{
  void fetch(cfg.host+'/capture/',{
   method:'POST',mode:'cors',keepalive:true,
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({
    api_key:cfg.apiKey,distinct_id:identity,event:payload.event,
    properties:{...payload.properties,$process_person_profile:false,$geoip_disable:true},
   }),
  }).catch(()=>{});
  return true;
 }catch{return false;}
}
