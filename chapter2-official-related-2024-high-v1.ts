/**
 * Display-only ORIGINAL OFFICIAL expenditure-category source for high-income
 * national TWO-OR-MORE WORKER households, 2024 Survey of Household Economy
 * table 1-29-1, source a010292.xlsx SHA-256:
 * 0a73765d1cda9c6c2a0ba8238e2260ee595dfbdbbbb91b67aa1abb55adf82c45
 *
 * A "関連公表費目率" is official mean ITEM payment / official mean disposable
 * income for the same age×income×worker population. It is NOT the exact
 * diagnosis-category average and MUST NOT be subtracted from personal spending
 * or used in confirmedA, cUpper, recommendation rank, GAS or social shares.
 *
 * Some items are subcategories of other items (car maintenance within total);
 * do NOT add them together. Other items span owner/nonowner, child/no-child,
 * deposit insurance, or overlapping personal subscriptions.
 */
import {ageBandForObserved2024V1,type HighGrossBand2024V1} from './age-income-joint-burden-gate-v1';

export const PEER_2024_OFFICIAL_ADJACENT_SOURCE={
 statsDataId:'0004039867',fileId:'000040379261',
 workbookSha256:'0a73765d1cda9c6c2a0ba8238e2260ee595dfbdbbbb91b67aa1abb55adf82c45',
 age:'世帯主年齢（10歳階級2）',household:'二人以上・勤労者',
 year:2024,sampleMinimum:50,
 productionSavingEligible:false,
} as const;

const EXTRA_ITEMS=[
 {category:'mobile',code:'21010703_通信',label:'通信',scope:'スマホ1回線の料金ではなく郵便・固定通信等も含む公表費目'},
 {category:'car',code:'21010702_自動車等関係費',label:'自動車等関係費',scope:'購入費や非保有世帯を含む。維持費とは合算しない'},
 {category:'car',code:'210107023_自動車等維持',label:'自動車等維持',scope:'自動車等関係費の内数。車保有世帯のみの平均ではない'},
 {category:'fun',code:'210109_教養娯楽',label:'教養娯楽',scope:'アプリの交際・サブスク・旅行等と費目範囲が異なる'},
 {category:'fun',code:'21011003_交際費',label:'交際費',scope:'公表の交際費はアプリの娯楽総額と同じではない'},
 {category:'beautyFashion',code:'210105_被服及び履物',label:'被服及び履物',scope:'美容・衛生用品は別費目。本人だけの支出ではない'},
 {category:'beautyFashion',code:'210110011_理美容サービス',label:'理美容サービス',scope:'美容サブスクや子ども分との境界を確認できない'},
 {category:'beautyFashion',code:'210110012_理美容用品',label:'理美容用品',scope:'シャンプー等の日用品と範囲が重なり得る'},
 {category:'rent',code:'21010201_家賃地代',label:'家賃地代',scope:'持ち家世帯も母集団に含む。住宅ローン返済の負担率ではない'},
 {category:'insurance',code:'23000002_保険料',label:'保険料（実支出以外の支払）',scope:'保障だけでなく貯蓄型・個人年金等を含む。適正保険料率ではない'},
 {category:'childEducation',code:'210108_教育',label:'教育',scope:'子なし世帯や学校段階・公私が異なる世帯も含む'},
] as const;
export type OfficialAdjacentCategory2024=typeof EXTRA_ITEMS[number]['category'];
type OriginalRow=readonly [string,'BB'|'BC'|'BD',number,number,...number[]];
/** Per original row: [head age, official public income column, n,
 *  mean disposable, then monthly mean expense in exact EXTRA_ITEMS order].
 *  A number of omitted low-n cells from the original never appear here.
 */
const VERIFIED_2024_HIGH_OFFICIAL_EXTRA:readonly OriginalRow[]=[
 ['30～39（10歳階級2）','BB',280,593662,11192,20274,17552,43582,8340,15097,3703,5851,29492,20412,7604],
 ['30～39（10歳階級2）','BC',80,734251,11710,16190,14885,53715,9992,14985,3986,5800,79303,46055,4035],
 ['40～49（10歳階級2）','BB',670,579148,14326,39604,20145,38107,10375,16602,3733,5797,11365,23119,33208],
 ['40～49（10歳階級2）','BC',300,667844,16879,30511,19506,48063,11273,20384,4522,6715,10969,29839,30092],
 ['40～49（10歳階級2）','BD',200,965121,15948,37587,22970,61462,8896,23277,7301,9524,19434,32191,44405],
 ['50～59（10歳階級2）','BB',850,583144,17679,24700,21277,34395,9951,14652,3656,5589,11724,23731,33990],
 ['50～59（10歳階級2）','BC',450,692673,19768,44485,27453,41118,14127,16951,5868,7282,5209,39668,38657],
 ['50～59（10歳階級2）','BD',410,870777,21412,42801,27936,50420,13590,21026,6213,9665,9085,43365,71428],
 ['60～69（10歳階級2）','BB',330,623748,16917,44961,31801,44702,11558,13352,3715,5182,7323,45781,11897],
 ['60～69（10歳階級2）','BC',170,685680,19453,53245,28079,41811,25937,13708,5073,6396,6190,24303,7073],
 ['60～69（10歳階級2）','BD',140,1008240,21478,33775,30074,87318,12187,19227,4527,8367,4066,26194,29102],
 ['70～79（10歳階級2）','BB',50,679327,19682,30229,29657,27719,10431,13106,4079,6581,7309,22363,2061],
] as const;

export function relatedOfficialExpenseItems2024(params:{
 household:'multi'|'single';headAge:number|null|undefined;
 gross:HighGrossBand2024V1|null|undefined;
 headAgeConfirmed:boolean;headWorkerConfirmed:boolean;
}){
 const unavailable=(reason:string)=>({
  available:false as const,reason,
  n:null as number|null,disposableYen:null as number|null,
  items:[] as readonly {
   category:OfficialAdjacentCategory2024;code:string;label:string;scope:string;
   averageMonthlyExpenseYen:number;officialRelatedRatePct:number;
  }[],
  savingEligible:false as const,
 });
 if(params.household!=='multi')return unavailable('NOT_MULTI_WORKER_COHORT');
 if(!params.headAgeConfirmed||!params.headWorkerConfirmed)return unavailable('HEAD_COHORT_NOT_CONFIRMED');
 const age=typeof params.headAge==='number'?ageBandForObserved2024V1(params.headAge):null;
 const col=params.gross==='1000_1249'?'BB':params.gross==='1250_1499'?'BC':
  params.gross==='1500plus'?'BD':null;
 if(!age||!col)return unavailable('AGE_OR_GROSS_UNSUPPORTED');
 const row=VERIFIED_2024_HIGH_OFFICIAL_EXTRA.find(x=>x[0]===age&&x[1]===col);
 if(!row)return unavailable('OFFICIAL_CELL_SAMPLE_TOO_SMALL_OR_MISSING');
 const [, ,n,disposable,...values]=row;
 if(n<PEER_2024_OFFICIAL_ADJACENT_SOURCE.sampleMinimum||disposable<=0||values.length!==EXTRA_ITEMS.length||
  values.some(v=>!Number.isFinite(v)||v<0))return unavailable('OFFICIAL_CELL_INCOMPLETE');
 return {
  available:true as const,reason:'OFFICIAL_RELATED_ITEMS_ONLY',n,disposableYen:disposable,
  items:EXTRA_ITEMS.map((x,i)=>({
   ...x,averageMonthlyExpenseYen:values[i],
   officialRelatedRatePct:Math.round(values[i]/disposable*10000)/100,
  })),
  savingEligible:false as const,
 };
}
