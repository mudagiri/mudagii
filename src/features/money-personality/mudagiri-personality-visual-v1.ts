export type MudagiriPoseId='IDLE_01'|'IDLE_02'|'GUIDE'|'EXPLAIN'|'LISTEN'|'THINK'|'QUESTION'|'SURPRISE'|'WORRY'|'HAPPY'|'CELEBRATE'|'PROUD'|'RELIEF'|'RUN'|'POINT_FORWARD'|'READY'|'ATTACK'|'WIN'|'COMPLETE'|'CHECK'|'ANALYZE'|'UNLOCK'|'RESULT'|'SHARE'|'CTA';
export type MudagiriMotionId='idle-breathe'|'idle-float'|'listen-nod'|'think-sway'|'question-tilt'|'surprise-pop'|'happy-bounce'|'celebrate-jump'|'guide-nudge'|'run-dash'|'attack-lunge';
export type MudagiriVisualSpec={pose:MudagiriPoseId;motion:MudagiriMotionId|null;scale:'hero'|'question'|'section'|'mini'};

const MEASUREMENT_VISUAL_CYCLE:readonly MudagiriVisualSpec[]=[
  {pose:'IDLE_01',motion:'idle-breathe',scale:'question'},
  {pose:'LISTEN',motion:'listen-nod',scale:'question'},
  {pose:'IDLE_02',motion:'idle-float',scale:'question'},
];

/** Measurement-safe: visual never depends on factor, answer, score, or A/B side. */
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

/** Only shown after the user chooses to continue to Chapter 2. */
export const CLASS_UNLOCK_SEQUENCE=[
  {key:'think',pose:'THINK',motion:'think-sway',scale:'hero',holdMs:650},
  {key:'unlock',pose:'UNLOCK',motion:'surprise-pop',scale:'hero',holdMs:520},
  {key:'celebrate',pose:'CELEBRATE',motion:'celebrate-jump',scale:'hero',holdMs:780},
] as const satisfies readonly (MudagiriVisualSpec&{key:string;holdMs:number})[];

export const NEXT_QUEST_SEQUENCE=[
  {key:'point',pose:'POINT_FORWARD',motion:'guide-nudge',scale:'hero',holdMs:700},
  {key:'run',pose:'RUN',motion:'run-dash',scale:'hero',holdMs:640},
] as const satisfies readonly (MudagiriVisualSpec&{key:string;holdMs:number})[];

/** Reserved for Chapter 2 Battle. HIT remains enemy/UI FX, not a character pose. */
export const BATTLE_VISUAL_SEQUENCE={
  ready:{pose:'READY',motion:'idle-breathe',scale:'hero'},
  attack:{pose:'ATTACK',motion:'attack-lunge',scale:'hero'},
  win:{pose:'WIN',motion:'happy-bounce',scale:'hero'},
} as const satisfies Record<string,MudagiriVisualSpec>;
