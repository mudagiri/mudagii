/**
 * Opt-in, coverage-specific official LINE handoff.
 * This is a CTA context, NOT a diagnosis, saving estimate or endorsement.
 * No premiums, medical information, coverage decisions, or personality data.
 */
export function coverageConsultHandoff(diagnosisId,handoffCode){
 if(typeof diagnosisId!=='string'||!diagnosisId.trim()||typeof handoffCode!=='string'||!handoffCode.trim())return null;
 return {
  diagnosisId,
  firstQuest:null,
  placement:'coverage_review',
  handoffCode,
  goal:null,
  consultPrimary:'lifeplan',
  consultSelectedTopic:'insurance',
  insuranceReview:true
 };
}
