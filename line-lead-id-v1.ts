/** A single diagnosis may open two different official LINE consultation routes.
 * Store one idempotent lead event per route; keep the same human handoff code.
 * This prevents an insurance intent from being silently deduplicated as life-plan.
 */
export function lineLeadIdV1(diagnosisId:string,handoffCode:string|null|undefined,placement:string|null|undefined){
 const lane=placement==='coverage_review'?'coverage_review':'consult_route';
 return 'lead_'+diagnosisId+(handoffCode?'_'+handoffCode:'')+'_'+lane;
}
