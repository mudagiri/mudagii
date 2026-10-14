import type {Category} from './mudagiri-diagnosis-v2';

/**
 * Chapter 2 self-recognition, derived only from the person's explicit
 * household questionnaire answers. This is narrative copy, NOT a personality
 * classification, benchmark, reduction estimate or correlation score.
 *
 * Do not infer traits from large spending, demographics, JOB or STYLE.
 */
type CategoryObservationRow={
 category?:Category;
 label?:string;
 known?:boolean;
 applicability?:string;
 amount?:number|null;
 v5Status?:string;
 aAmount?:number|null;
 cUpper?:number|null;
 appraisal?:{
  satisfaction?:string;
  rentPreference?:string;
  selfDevelopmentValue?:string;
  subUnusedAmount?:number|null;
  subCancellationConfirmed?:boolean;
 }|null;
};
export type Chapter2RecognitionV1={
 kind:'protected_and_confirmed_contract'|'protected_and_candidate'|'protected_only'|'confirmed_unused_contract';
 line:string;
 protectCategory?:Category;
 reviewCategory?:Category;
 /** Codes only; never user amounts, personal identifiers, or financial traits. */
 evidenceCodes:readonly string[];
 shareAllowed:false;
};
const LABEL:Partial<Record<Category,string>>={
 fun:'娯楽・趣味',food:'食費',beautyFashion:'美容・服飾',selfDevelopment:'自己投資',rent:'住まい',
 mobile:'通信費',energy:'光熱費',daily:'日用品',sub:'サブスク',car:'車',insurance:'保険',
 childEducation:'教育費'
};
const VALUED=['fun','food','selfDevelopment','beautyFashion','rent'] as const;
function active(r:CategoryObservationRow|undefined):r is CategoryObservationRow{
 return !!r&&r.known===true&&r.applicability!=='na'&&r.applicability!=='notApplicable'
  &&typeof r.amount==='number'&&Number.isFinite(r.amount)&&r.amount>0;
}
function declaredProtection(r:CategoryObservationRow):string|null{
 if(r.v5Status!=='protect')return null;
 if(['fun','food','beautyFashion'].includes(String(r.category))&&['satisfied','verySatisfied'].includes(String(r.appraisal?.satisfaction)))
  return '満足して守りたいと答えた';
 if(r.category==='selfDevelopment'&&['purpose','results'].includes(String(r.appraisal?.selfDevelopmentValue)))
  return '目的や成果があると答えた';
 if(r.category==='rent'&&r.appraisal?.rentPreference==='protect')
  return '今の住環境を優先したいと答えた';
 if(r.category==='rent'&&r.appraisal?.rentPreference==='reasonable')
  return '今の住居費を妥当と答えた';
 return null;
}
function unusedConfirmed(r:CategoryObservationRow|undefined):boolean{
 if(!active(r)||r.category!=='sub'||r.v5Status!=='cut'
  ||r.appraisal?.subCancellationConfirmed!==true)return false;
 const unused=r.appraisal.subUnusedAmount,opportunity=r.aAmount;
 return typeof unused==='number'&&Number.isSafeInteger(unused)&&unused>0&&unused<=r.amount!
  &&typeof opportunity==='number'&&Number.isSafeInteger(opportunity)&&opportunity>0&&opportunity<=unused;
}
export function chapter2RecognitionV1(raw:unknown):Chapter2RecognitionV1|null{
 if(!Array.isArray(raw)||raw.length!==12)return null;
 const byCat=new Map<Category,CategoryObservationRow>();
 for(const row of raw){
  if(!row||typeof row!=='object'||typeof row.category!=='string'
   ||!Object.prototype.hasOwnProperty.call(LABEL,row.category)||byCat.has(row.category as Category))return null;
  byCat.set(row.category as Category,row);
 }
 // Protect only when explicitly self-reported AND the computed result agrees.
 const p=VALUED.map(c=>byCat.get(c)).find(r=>active(r)&&declaredProtection(r!)!==null);
 const pReason=p?declaredProtection(p):null;
 const sub=byCat.get('sub');
 const confirmed=unusedConfirmed(sub);
 // Candidate means review upper, not a saving. Never use the biggest amount
 // as a personality proof or a claim that money has already been saved.
 const candidate=[...byCat.values()].filter(r=>r.category!==p?.category
  &&active(r)&&['optimize','inspect','cut'].includes(r.v5Status??'')
  &&typeof r.cUpper==='number'&&Number.isFinite(r.cUpper)&&r.cUpper>0)
  .sort((a,b)=>(b.cUpper??0)-(a.cUpper??0))[0];
 const catName=(x:CategoryObservationRow)=>LABEL[x.category!]??x.label??'支出';
 if(p&&pReason){
  if(confirmed)return {
   kind:'protected_and_confirmed_contract',
   line:`「${catName(p)}」は${pReason}んだな。一方で、サブスクには未使用・解約可能と答えた契約がある。大切な支出を守って、そっちから確かめよう！`,
   protectCategory:p.category,reviewCategory:'sub',
   evidenceCodes:['SELF_REPORTED_VALUE','PROTECTED_V5','UNUSED_CANCELLABLE_SELF_REPORT'],shareAllowed:false
  };
  if(candidate)return {
   kind:'protected_and_candidate',
   line:`「${catName(p)}」は${pReason}んだな。なら「${catName(candidate)}」の内訳から確かめよう。候補額はまだ節約できた金額じゃないぞ！`,
   protectCategory:p.category,reviewCategory:candidate.category,
   evidenceCodes:['SELF_REPORTED_VALUE','PROTECTED_V5','UNCONFIRMED_REVIEW_UPPER'],shareAllowed:false
  };
  return {
   kind:'protected_only',
   line:`「${catName(p)}」は${pReason}んだな。使う価値があるお金を無理に削らないのも、今回の戦果だ！`,
   protectCategory:p.category,evidenceCodes:['SELF_REPORTED_VALUE','PROTECTED_V5'],shareAllowed:false
  };
 }
 if(confirmed)return {
  kind:'confirmed_unused_contract',
  line:'サブスクに未使用で解約できると答えた契約がある。まず契約一覧を確認しよう。まだ節約済みではないぞ！',
  reviewCategory:'sub',evidenceCodes:['UNUSED_CANCELLABLE_SELF_REPORT'],shareAllowed:false
 };
 return null;
}
