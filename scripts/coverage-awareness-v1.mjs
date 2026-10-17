/**
 * Supplemental coverage-awareness copy only. Independent of Chapter 1 STYLE
 * and frozen Chapter 2 benchmark/saving/money calculations.
 *
 * A monthly insurance premium is NOT proof of adequate/inadequate protection.
 * Absence of a premium is NOT proof that a person has no coverage.
 */
const REASONS=Object.freeze({
 CLEAR:'PURPOSE_AND_COVERAGE_UNDERSTOOD',
 RECENT:'REVIEWED_WITHIN_ONE_YEAR',
 UNCLEAR:'UNCLEAR_PURPOSE',
 MOSTLY:'PARTIAL_KNOWLEDGE',
 OLD:'REVIEW_OLD_OR_NEVER',
 UNKNOWN:'CURRENT_STATUS_UNKNOWN',
 ZERO:'NO_PREMIUM_RECORDED',
 NA:'CATEGORY_NOT_APPLICABLE',
});
const base={moneyImpact:null,insuranceAdequacy:null,personalityMatch:null,productRecommendation:null,requiresConsultation:false,shareAllowed:false,scope:'coverage_check_only'};
export function coverageAwarenessFor(rows){
 if(!Array.isArray(rows))return null;
 const x=rows.find(x=>x?.category==='insurance');
 if(!x||rows.filter(x=>x?.category==='insurance').length!==1)return null;
 const purpose=x.appraisal?.insurancePurpose;
 const last=x.appraisal?.insuranceLastReview;
 // Contract "clear" answers both objective and coverage-content awareness.
 // The questionnaire does not ask lastReview after "clear", by design.
 if(purpose==='clear')return {...base,status:'exempt',reason:REASONS.CLEAR,show:false};
 // "Reviewed recently" is the respondent's own statement, not a medical or
 // financial certification; the extra reminder is simply unnecessary.
 if(last==='within1y')return {...base,status:'exempt',reason:REASONS.RECENT,show:false};
 const noPremium=x.applicability==='na'||x.known===true&&x.amount===0;
 if(noPremium)return {...base,status:'attention',reason:x.applicability==='na'?REASONS.NA:REASONS.ZERO,show:true,
  heading:x.applicability==='na'?'保険料の入力対象外でも、保障は確認できる。':'保険料が0円でも、保障の確認はできる。',
  text:'今の公的保障や勤務先・家族からの備えを、どこまで使えるか確認してみよう。保険への加入を勧める判定ではないよ。',
  next:'もしものとき、誰にどんな保障があるかを一度整理する'};
 if(purpose==='unclear')return {...base,status:'attention',reason:REASONS.UNCLEAR,show:true,
  heading:'今の保険、何に備えるためだっけ？',
  text:'保障の目的がよく分からないと回答したね。今の暮らしに合っているか、内容を確かめよう。保険料の削減や加入が必要と決まったわけではないよ。',
  next:'保険証券で保障対象・金額・期間を確かめる'};
 if(purpose==='mostly')return {...base,status:'attention',reason:REASONS.MOSTLY,show:true,
  heading:'「だいたい分かる」を、もう少しはっきり。',
  text:'保障内容を大まかに把握している回答だったね。今必要な保障と重複がないか、落ち着いて確認してみよう。',
  next:'目的・保障額・保障期間の3つを確認する'};
 if(['over3y','never'].includes(last))return {...base,status:'attention',reason:REASONS.OLD,show:true,
  heading:'暮らしが変わったなら、保障も確認しておこう。',
  text:'保障を最後に確認してから時間がたっている回答だったね。必要な保障を決めつけず、いまの生活と内容が合うかを確かめよう。',
  next:'契約内容と、家族・仕事・住まいの変化を見比べる'};
 return {...base,status:'attention',reason:REASONS.UNKNOWN,show:true,
  heading:'保障の中身、最後に確かめたのはいつ？',
  text:'保障を確認した記録が十分ではなかったよ。契約の有無や内容が分かる資料を確認するところからで大丈夫。',
  next:'加入状況と保障内容を一度確認する'};
}
export const coverageAwarenessReasons=REASONS;
