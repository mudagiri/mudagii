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

/**
 * External onLine callbacks are not GAS lead persistence. Keep coverage
 * callback context minimal even if a caller supplies sensitive extra fields.
 * Existing life-plan callback behavior is retained without changes.
 */
export function externalLineContext(ctx,normalPayload){
 return ctx?.placement==='coverage_review'
  ?coverageConsultHandoff(ctx?.diagnosisId,ctx?.handoffCode)
  :normalPayload;
}
