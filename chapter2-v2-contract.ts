/** Chapter 2 V2 presentation contract. Household diagnosis core remains untouched. */
export const CHAPTER2_V2_VERSION='MUDAGIRI_CHAPTER2_V2_PRESENTATION_RC1' as const;
export const CHAPTER1_HANDOFF_STORAGE_KEY='mudagiri_money_type_handoff_v1';
const ALLOWED_JOBS=new Set(['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP']);
const ALLOWED_STYLES=new Set(['DRIVE','ENJOY','SECURE','OPTIMIZE']);
export const CHAPTER1_STYLE_NAMES:Record<string,string>={DRIVE:'挑戦',ENJOY:'楽しさ',SECURE:'安心',OPTIMIZE:'納得'};

export type Chapter1HandoffV1={
 version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1';
 anonymousUserId:string;
 sessionId:string;
 completedAt:string;
 jobCode:string;
 jobName:string;
 primaryStyle:string;
};

export function chapter2V2Enabled(search:string,buildValue?:string){
 return buildValue==='1'||new URLSearchParams(search).get('chapter2v2')==='1';
}
export function chapter2V2ResumeScene(scene:string,enabled:boolean){
 return enabled&&(scene==='typeQuiz'||scene==='typeComplete')?'battleIntro':scene;
}
/**
 * Use only Chapter 1's explicit handoff, never re-score its answers.
 * Reject unrelated identities and invalid or unfinished handoffs.
 */
export function parseChapter1HandoffV1(raw:string|null,anonymousUserId:string):Chapter1HandoffV1|null{
 if(!raw||!anonymousUserId)return null;
 try{
  const x=JSON.parse(raw);
  if(!x||x.version!=='MUDAGIRI_MONEY_TYPE_HANDOFF_V1'||x.anonymousUserId!==anonymousUserId||
    typeof x.sessionId!=='string'||!x.sessionId||!ALLOWED_JOBS.has(x.jobCode)||
    !ALLOWED_STYLES.has(x.primaryStyle)||typeof x.jobName!=='string'||
    !x.jobName.trim()||x.jobName.length>80||!Number.isFinite(Date.parse(x.completedAt)))return null;
  return {
   version:x.version,anonymousUserId:x.anonymousUserId,sessionId:x.sessionId,
   completedAt:x.completedAt,jobCode:x.jobCode,jobName:x.jobName,
   primaryStyle:x.primaryStyle,
  };
 }catch{return null;}
}
export function readChapter1HandoffV1(anonymousUserId:string,storage?:Pick<Storage,'getItem'>):Chapter1HandoffV1|null{
 try{
  const target=storage??(typeof localStorage!=='undefined'?localStorage:null);
  return target?parseChapter1HandoffV1(target.getItem(CHAPTER1_HANDOFF_STORAGE_KEY),anonymousUserId):null;
 }catch{return null;}
}
/** Chapter 2 share carries no amounts, identifiers, household attributes, or Chapter 1 type claims. */
/** Route all Chapter 2 quest shares to the Chapter 1 entry. The Chapter 1 release is a dependency. */
export function chapter2V2ReferralUrl(currentUrl:string,platform:string){
 const root=new URL('./',currentUrl);
 const url=new URL('pilot/money-type/',root);
 url.searchParams.set('utm_source',platform);
 url.searchParams.set('utm_campaign','household_quest_clear');
 return url.toString();
}
/** A comparison difference has a direction. Never present a negative as positive. */
export function chapter2V2SignedComparisonYen(raw:number){
 if(!Number.isFinite(raw))return '—';
 const amount='¥'+new Intl.NumberFormat('ja-JP').format(Math.round(Math.abs(raw)));
 return (raw>0?'+':raw<0?'−':'±')+amount;
}
export function chapter2V2ShareText(url:string){
 return '家計クエスト、12カテゴリの鑑定完了！\n好きなものは守って、ムダだけ斬る。\nまずはお金の性格診断から、冒険してみる？\n'+url+'\n#ムダギリ診断';
}
