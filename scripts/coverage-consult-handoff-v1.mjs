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
 * External onLine callbacks are NOT the GAS lead archive. They should receive
 * the minimal handoff envelope for BOTH coverage and life-plan. The private
 * snapshot (monthly expenses, income, household, anonymous ID, insurance
 * answers) is saved only via the internal GAS path, never passed to a host
 * callback that might construct a third-party URL or log its arguments.
 * The existing callback signature remains accepted for compatibility.
 */
const APPROVED_GOALS=new Set(['home','family','travel','invest','challenge','safety','retirement','undecided']);
const APPROVED_QUESTS=new Set(['mobile','energy','sub','car','food','daily','fun','beautyFashion','rent','insurance','childEducation','selfDevelopment']);
const APPROVED_PLACEMENTS=new Set(['after_rewards','goal_quest','consult_route']);
export function externalLineContext(ctx,normalPayload){
 const diagnosisId=ctx?.diagnosisId??normalPayload?.diagnosisId;
 const handoffCode=ctx?.handoffCode??normalPayload?.handoffCode;
 if(ctx?.placement==='coverage_review')return coverageConsultHandoff(diagnosisId,handoffCode);
 if(typeof diagnosisId!=='string'||!diagnosisId.trim()||
    typeof handoffCode!=='string'||!handoffCode.trim())return null;
 return {
  diagnosisId,
  handoffCode,
  placement:APPROVED_PLACEMENTS.has(ctx?.placement)?ctx.placement:'consult_route',
  firstQuest:APPROVED_QUESTS.has(ctx?.firstQuest)?ctx.firstQuest:null,
  goal:APPROVED_GOALS.has(ctx?.goal)?ctx.goal:null,
  consultPrimary:'lifeplan',
  consultSelectedTopic:'lifeplan'
 };
}
