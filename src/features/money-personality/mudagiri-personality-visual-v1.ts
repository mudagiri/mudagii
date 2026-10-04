export type MudagiriPoseId='IDLE_01'|'IDLE_02'|'GUIDE'|'EXPLAIN'|'LISTEN'|'THINK'|'QUESTION'|'SURPRISE'|'WORRY'|'HAPPY'|'CELEBRATE'|'PROUD'|'RELIEF'|'RUN'|'POINT_FORWARD'|'READY'|'ATTACK'|'WIN'|'COMPLETE'|'CHECK'|'ANALYZE'|'UNLOCK'|'RESULT'|'SHARE'|'CTA';
export type MudagiriMotionId='idle-breathe'|'idle-float'|'listen-nod'|'think-sway'|'question-tilt'|'surprise-pop'|'happy-bounce'|'celebrate-jump'|'guide-nudge'|'run-dash';
export type MudagiriVisualSpec={pose:MudagiriPoseId;motion:MudagiriMotionId|null;scale:'hero'|'question'|'section'|'mini'};

const MEASUREMENT_VISUAL_CYCLE:readonly MudagiriVisualSpec[]=[
  {pose:'IDLE_01',motion:'idle-breathe',scale:'question'},
  {pose:'LISTEN',motion:'listen-nod',scale:'question'},
  {pose:'IDLE_02',motion:'idle-float',scale:'question'},
];

/** Measurement-safe: visual never depends on factor, answer, or A/B side. */
export function measurementVisual(screenCount:number):MudagiriVisualSpec{
  const i=((screenCount%MEASUREMENT_VISUAL_CYCLE.length)+MEASUREMENT_VISUAL_CYCLE.length)%MEASUREMENT_VISUAL_CYCLE.length;
  return MEASUREMENT_VISUAL_CYCLE[i];
}

export const PERSONALITY_SCENE_VISUALS={
  intro:{pose:'IDLE_02',motion:'idle-float',scale:'hero'},
  separator:{pose:'QUESTION',motion:'question-tilt',scale:'question'},
  finalAnalysis:{pose:'ANALYZE',motion:'think-sway',scale:'hero'},
  resultHero:{pose:'RESULT',motion:'idle-float',scale:'hero'},
  resultDialogue:{pose:'EXPLAIN',motion:'idle-float',scale:'section'},
  resultStyle:{pose:'PROUD',motion:'idle-breathe',scale:'section'},
  resultStrength:{pose:'HAPPY',motion:'happy-bounce',scale:'mini'},
  resultBlindSpot:{pose:'WORRY',motion:'think-sway',scale:'mini'},
  resultStrategy:{pose:'GUIDE',motion:'guide-nudge',scale:'mini'},
  resultAxes:{pose:'ANALYZE',motion:'think-sway',scale:'section'},
  nextMove:{pose:'POINT_FORWARD',motion:'guide-nudge',scale:'section'},
  share:{pose:'SHARE',motion:'happy-bounce',scale:'section'},
  householdCta:{pose:'CTA',motion:'guide-nudge',scale:'section'},
} as const satisfies Record<string,MudagiriVisualSpec>;

export const JOB_UNLOCK_SEQUENCE=[
  {key:'think',pose:'THINK',motion:'think-sway',scale:'hero',holdMs:650},
  {key:'unlock',pose:'UNLOCK',motion:'surprise-pop',scale:'hero',holdMs:520},
  {key:'celebrate',pose:'CELEBRATE',motion:'celebrate-jump',scale:'hero',holdMs:780},
] as const satisfies readonly (MudagiriVisualSpec&{key:string;holdMs:number})[];
