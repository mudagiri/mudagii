import type { Category } from './mudagiri-diagnosis-v2';

export type SatisfactionQuestionReason = 'above_comparable'|'material_spend_no_reference';
export interface SatisfactionQuestion { category:Category; reason:SatisfactionQuestionReason; excess:number|null; priority:number; }

const LIFESTYLE = new Set<Category>(['food','fun','beautyFashion']);
// Only categories whose reducible estimate actually depends on satisfaction belong here.
// Rent is review-only; sub uses unusedAmount; car/daily use guardrails; specialist categories are review-only.
export function resolveSatisfactionQuestions(
  expenses:Record<Category,number>,
  comparable:Partial<Record<Category,number|null>>,
):SatisfactionQuestion[]{
  const out:SatisfactionQuestion[]=[];
  for(const category of LIFESTYLE){
    const actual=Math.max(0,expenses[category]||0);
    if(!actual) continue;
    const ref=comparable[category];
    if(typeof ref==='number' && ref>0){
      const excess=Math.max(0,actual-ref);
      if(excess>0) out.push({category,reason:'above_comparable',excess,priority:excess});
    } else if(actual>=10_000){
      out.push({category,reason:'material_spend_no_reference',excess:null,priority:actual*.25});
    }
  }
  return out.sort((a,b)=>b.priority-a.priority || a.category.localeCompare(b.category));
}
