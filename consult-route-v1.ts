import type { ProfileV4 } from './mudagiri-profile-v4';
import type { FinalCategoryV4 } from './final-judgement-v4';

export type ConsultPrimaryRouteV1='insurance'|'lifeplan';
export type ConsultTopicV1='insurance'|'lifeplan'|'investment';
export type HomeStructureV1='detached'|'other'|null;

export interface ConsultRouteV1 {
 version:'MUDAGIRI_CONSULT_ROUTE_V1_0';
 primary:ConsultPrimaryRouteV1;
 insuranceReview:boolean;
 insuranceReasonCode:string|null;
 insurancePurpose:string|null;
 insuranceLastReview:string|null;
 lifeplanSignals:string[];
 homeowner:boolean;
 homeStructureRequired:boolean;
}

export function buildConsultRouteV1(a:{profile:ProfileV4;finalCategories:FinalCategoryV4[]}):ConsultRouteV1{
 const insurance=a.finalCategories.find(x=>x.category==='insurance')??null;
 const insuranceReview=!!insurance&&insurance.status==='review';
 const lifeplanSignals:string[]=[];
 if(a.profile.childCount>0)lifeplanSignals.push('children');
 if(a.profile.housingTenure==='owned')lifeplanSignals.push('homeowner');
 if(a.profile.householdSize>=2)lifeplanSignals.push('multi_household');
 const education=a.finalCategories.find(x=>x.category==='childEducation');
 if(education&&education.status==='review')lifeplanSignals.push('education_review');
 const housing=a.finalCategories.find(x=>x.category==='rent');
 if(housing&&housing.status==='review')lifeplanSignals.push('housing_review');
 const savingsPressure=a.finalCategories.filter(x=>x.status==='review'&&x.attentionFlag).length;
 if(savingsPressure>=3)lifeplanSignals.push('multiple_review_items');

 return {
  version:'MUDAGIRI_CONSULT_ROUTE_V1_0',
  primary:insuranceReview?'insurance':'lifeplan',
  insuranceReview,
  insuranceReasonCode:insurance?.reasonCode??null,
  insurancePurpose:insurance?.appraisal?.insurancePurpose??null,
  insuranceLastReview:insurance?.appraisal?.insuranceLastReview??null,
  lifeplanSignals,
  homeowner:a.profile.housingTenure==='owned',
  homeStructureRequired:a.profile.housingTenure==='owned',
 };
}

export function consultTopicCopyV1(topic:ConsultTopicV1){
 if(topic==='insurance')return {
  label:'保障整理',
  title:'保険・保障をいまの家族に合わせて整理',
  body:'保険料を下げることを前提にせず、必要な保障・重複・不足がないかを家計と一緒に確認します。',
  button:'保障と家計を無料で整理する ▶',
  note:'売り替え前提ではありません。今の保障内容の確認から。'
 } as const;
 if(topic==='investment')return {
  label:'資産形成',
  title:'資産形成のゴールと進め方を整理',
  body:'いきなり商品を決めず、いつまでに何のためにいくら必要かを整理してから運用方針を考えます。',
  button:'資産形成のゴールを無料で整理する ▶',
  note:'商品選びより先に、目的・期間・家計とのバランスを確認します。'
 } as const;
 return {
  label:'ライフプラン',
  title:'将来のお金を一枚の地図にする',
  body:'教育・住宅・老後・貯蓄・投資まで、今の家計から将来のお金の流れをまとめて整理します。',
  button:'無料でライフプランを整理する ▶',
  note:'商品を決める前に、まず家計と将来資金の全体像を確認します。'
 } as const;
}

export function consultRouteCopyV1(route:ConsultRouteV1){
 if(route.primary==='insurance'){
  return {
   kicker:'NEXT SUPPORT',
   title:'保障、一度整理しておくと安心かも。',
   body:'保険料を下げる前提ではなく、今の家族構成と保障内容が合っているかを家計と一緒に整理できます。',
   button:'保障と家計を無料で整理する ▶',
   note:'売り替え前提ではありません。まずは今の保障内容の確認から。'
  } as const;
 }
 return {
  kicker:'NEXT SUPPORT',
  title:'今後のお金、一度地図にしてみる？',
  body:'教育・住宅・老後・貯蓄・投資まで、今の家計から将来のお金の流れをまとめて整理できます。',
  button:'無料でライフプランを整理する ▶',
  note:'商品を決める前に、まず家計と将来資金の全体像を確認します。'
 } as const;
}

export const CONSULT_ROUTE_V1_VERSION='MUDAGIRI_CONSULT_ROUTE_V1_0';
