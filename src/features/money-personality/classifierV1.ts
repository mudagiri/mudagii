export type MainFactorId='FUTURE'|'IMMEDIATE'|'INTUITION'|'DELIBERATION'|'MONITORING'|'PERIODIC';
export type StyleFactorId='DRIVE'|'ENJOY'|'SECURE'|'OPTIMIZE';
export type FactorId=MainFactorId|StyleFactorId;
export type AxisId='TIME'|'DECISION'|'AWARENESS';
export type AxisPole='F'|'I'|'D'|'N'|'M'|'P';
export type StyleId=StyleFactorId;
export type BalanceState='BALANCED'|'LEAN'|'CLEAR';
export type AbsoluteState='HIGH_HIGH'|'LOW_LOW'|'MIXED';
export type ConfidenceLabel='HIGH'|'MEDIUM'|'LOW';
export type JobCode='FDM'|'FDP'|'FNM'|'FNP'|'IDM'|'IDP'|'INM'|'INP';

export type TraitAnswers=Record<string,number|undefined>;
export type SeparatorAnswers=Partial<Record<'SEP_TIME'|'SEP_DECISION'|'SEP_AWARENESS',AxisPole>> &
  Partial<Record<'SEP_STYLE',StyleId>>;

export const MONEY_PERSONALITY_ITEM_PLAN={
  FUTURE:{core:['F05','F01','F03'],reserve1:'F02',reserve2:'F04'},
  IMMEDIATE:{core:['I03','I02','I05'],reserve1:'I01',reserve2:'I04'},
  INTUITION:{core:['N03','N04','N05'],reserve1:'N01',reserve2:'N02'},
  DELIBERATION:{core:['D03','D01','D04'],reserve1:'D05',reserve2:'D02'},
  MONITORING:{core:['M01','M03','M05'],reserve1:'M04',reserve2:'M02'},
  PERIODIC:{core:['P01','P02','P05'],reserve1:'P03',reserve2:'P04'},
  DRIVE:{core:['R04','R01','R02'],reserve1:'R05',reserve2:'R03'},
  ENJOY:{core:['E04','E01','E03'],reserve1:'E02',reserve2:'E05'},
  SECURE:{core:['S02','S03','S05'],reserve1:'S01',reserve2:'S04'},
  OPTIMIZE:{core:['O01','O03','O04'],reserve1:'O02',reserve2:'O05'},
} as const satisfies Record<FactorId,{core:readonly [string,string,string];reserve1:string;reserve2:string}>;

export const JOBS:Record<JobCode,string>={
  FDM:'先回り司令官',
  FDP:'節目軍師',
  FNM:'兆しの占星術師',
  FNP:'ひらめき航海士',
  IDM:'メリハリ賢者',
  IDP:'戦術ハンター',
  INM:'直感魔導士',
  INP:'風読み剣士',
};

export const FACTOR_GUARDRAILS:Record<FactorId,{measures:readonly string[];forbidden:readonly string[]}>= {
  FUTURE:{measures:['先の予定や見通しを今の判断に織り込む'],forbidden:['投資家である','資産形成をしている','老後不安が強い']},
  IMMEDIATE:{measures:['目の前の機会や今得られる便益を判断に取り込む'],forbidden:['浪費家である','短絡的である','計画性がない']},
  INTUITION:{measures:['しっくり感・違和感・感覚を判断根拠にする'],forbidden:['即決する','衝動買いする','考えない']},
  DELIBERATION:{measures:['比較・整理・確認を判断根拠にする'],forbidden:['節約家である','ケチである','決断が遅い']},
  MONITORING:{measures:['普段から自分のお金の現在地・余力感をつかんでいる'],forbidden:['毎日家計簿をつける','常に市場を監視する']},
  PERIODIC:{measures:['予定や区切りなど意味のある節目でお金を確認する'],forbidden:['普段は見ない','ズボラである','放置する']},
  DRIVE:{measures:['前進・能力拡張・できることを増やす価値を重視する'],forbidden:['仕事人間である','高収入を目指す']},
  ENJOY:{measures:['楽しさ・体験・気分が上がる価値を重視する'],forbidden:['浪費家である','社交的である']},
  SECURE:{measures:['確実性・予測可能性・安全余白を重視する'],forbidden:['臆病である','保険に多く入っている']},
  OPTIMIZE:{measures:['必要量・不要除去・効率を重視する'],forbidden:['最安値だけを選ぶ','コスパ厨である']},
};

export type EngineConfig={
  mainRound1Gap:number;
  mainRound2Gap:number;
  balanceGap:number;
  clearGap:number;
  highThreshold:number;
  lowThreshold:number;
  styleRound1Gap:number;
  styleRound2Gap:number;
  styleSeparatorGap:number;
};

export const DEFAULT_ENGINE_CONFIG:EngineConfig={
  mainRound1Gap:10,
  mainRound2Gap:6.25,
  balanceGap:7.5,
  clearGap:15,
  highThreshold:66.67,
  lowThreshold:33.33,
  styleRound1Gap:10,
  styleRound2Gap:6.25,
  styleSeparatorGap:5,
};

export type FactorResult={
  factor:FactorId;
  score:number|null;
  answered:number;
  itemIds:string[];
  itemScores:number[];
  dispersion:number|null;
  strongConflict:boolean;
  hasCore:boolean;
  hasReserve1:boolean;
  hasReserve2:boolean;
};

export type AxisResult={
  axis:AxisId;
  factorA:MainFactorId;
  factorB:MainFactorId;
  poleA:AxisPole;
  poleB:AxisPole;
  scoreA:number|null;
  scoreB:number|null;
  gap:number|null;
  dominant:AxisPole|null;
  balanceState:BalanceState|null;
  absoluteState:AbsoluteState|null;
  strongConflict:boolean;
  directionChangedAfterReserve1:boolean;
  separatorUsed:boolean;
  classificationConfidence:ConfidenceLabel|null;
};

export type StyleResult={
  primary:StyleId|null;
  secondary:StyleId|null;
  gap:number|null;
  scores:Record<StyleId,number|null>;
  separatorUsed:boolean;
  dualLike:boolean;
  classificationConfidence:ConfidenceLabel|null;
};

export type AdaptivePlan={
  nextItemIds:string[];
  separatorIds:Array<'SEP_TIME'|'SEP_DECISION'|'SEP_AWARENESS'|'SEP_STYLE'>;
};

export type EngineEvaluation={
  factors:Record<FactorId,FactorResult>;
  axes:Record<AxisId,AxisResult>;
  style:StyleResult;
  jobCode:JobCode|null;
  jobName:string|null;
  adaptive:AdaptivePlan;
  complete:boolean;
};

const FACTORS=Object.keys(MONEY_PERSONALITY_ITEM_PLAN) as FactorId[];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];

const AXES:{axis:AxisId;factorA:MainFactorId;factorB:MainFactorId;poleA:AxisPole;poleB:AxisPole;separator:'SEP_TIME'|'SEP_DECISION'|'SEP_AWARENESS'}[]=[
  {axis:'TIME',factorA:'FUTURE',factorB:'IMMEDIATE',poleA:'F',poleB:'I',separator:'SEP_TIME'},
  {axis:'DECISION',factorA:'DELIBERATION',factorB:'INTUITION',poleA:'D',poleB:'N',separator:'SEP_DECISION'},
  {axis:'AWARENESS',factorA:'MONITORING',factorB:'PERIODIC',poleA:'M',poleB:'P',separator:'SEP_AWARENESS'},
];

function mean(xs:number[]){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function stddev(xs:number[]){
  if(xs.length<2)return 0;
  const m=mean(xs);
  return Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/xs.length);
}
function round2(x:number){return Math.round(x*100)/100;}

export function traitScore1to5(raw:number){
  if(!Number.isInteger(raw)||raw<1||raw>5)throw new Error('Trait answer must be integer 1..5');
  return (raw-1)*25;
}

function dominantPole(a:number,b:number,poleA:AxisPole,poleB:AxisPole):AxisPole|null{
  if(a>b)return poleA;
  if(b>a)return poleB;
  return null;
}

function factorResult(factor:FactorId,answers:TraitAnswers):FactorResult{
  const plan=MONEY_PERSONALITY_ITEM_PLAN[factor];
  const ordered=[...plan.core,plan.reserve1,plan.reserve2];
  const itemIds:string[]=[];
  const itemScores:number[]=[];
  for(const id of ordered){
    const raw=answers[id];
    if(raw===undefined)continue;
    itemIds.push(id);
    itemScores.push(traitScore1to5(raw));
  }
  const score=itemScores.length?round2(mean(itemScores)):null;
  const dispersion=itemScores.length?round2(stddev(itemScores)):null;
  const strongConflict=itemScores.some(x=>x<=25)&&itemScores.some(x=>x>=75);
  return {
    factor,score,answered:itemScores.length,itemIds,itemScores,dispersion,strongConflict,
    hasCore:plan.core.every(id=>answers[id]!==undefined),
    hasReserve1:answers[plan.reserve1]!==undefined,
    hasReserve2:answers[plan.reserve2]!==undefined,
  };
}

function absoluteState(a:number,b:number,config:EngineConfig):AbsoluteState{
  if(a>=config.highThreshold&&b>=config.highThreshold)return 'HIGH_HIGH';
  if(a<=config.lowThreshold&&b<=config.lowThreshold)return 'LOW_LOW';
  return 'MIXED';
}

function balanceState(gap:number,config:EngineConfig):BalanceState{
  if(gap<=config.balanceGap)return 'BALANCED';
  if(gap<config.clearGap)return 'LEAN';
  return 'CLEAR';
}

function axisConfidence(state:BalanceState,changed:boolean,conflict:boolean,separatorUsed:boolean):ConfidenceLabel{
  if(state==='BALANCED'||separatorUsed||changed||conflict)return 'LOW';
  if(state==='LEAN')return 'MEDIUM';
  return 'HIGH';
}

function coreOnlyScore(factor:MainFactorId,answers:TraitAnswers){
  const ids=MONEY_PERSONALITY_ITEM_PLAN[factor].core;
  if(!ids.every(id=>answers[id]!==undefined))return null;
  return mean(ids.map(id=>traitScore1to5(answers[id]!)));
}

function throughReserve1Score(factor:MainFactorId,answers:TraitAnswers){
  const p=MONEY_PERSONALITY_ITEM_PLAN[factor];
  const ids=[...p.core,p.reserve1];
  if(!ids.every(id=>answers[id]!==undefined))return null;
  return mean(ids.map(id=>traitScore1to5(answers[id]!)));
}

function conflictForIds(ids:readonly string[],answers:TraitAnswers){
  if(!ids.every(id=>answers[id]!==undefined))return false;
  const scores=ids.map(id=>traitScore1to5(answers[id]!));
  return scores.some(x=>x<=25)&&scores.some(x=>x>=75);
}

function evaluateAxis(def:(typeof AXES)[number],factors:Record<FactorId,FactorResult>,answers:TraitAnswers,separators:SeparatorAnswers,config:EngineConfig):AxisResult{
  const a=factors[def.factorA],b=factors[def.factorB];
  if(a.score===null||b.score===null){
    return {axis:def.axis,factorA:def.factorA,factorB:def.factorB,poleA:def.poleA,poleB:def.poleB,scoreA:a.score,scoreB:b.score,gap:null,dominant:null,balanceState:null,absoluteState:null,strongConflict:a.strongConflict||b.strongConflict,directionChangedAfterReserve1:false,separatorUsed:false,classificationConfidence:null};
  }
  const gap=round2(Math.abs(a.score-b.score));
  const state=balanceState(gap,config);
  const coreA=coreOnlyScore(def.factorA,answers),coreB=coreOnlyScore(def.factorB,answers);
  const r1A=throughReserve1Score(def.factorA,answers),r1B=throughReserve1Score(def.factorB,answers);
  const d0=coreA===null||coreB===null?null:dominantPole(coreA,coreB,def.poleA,def.poleB);
  const d1=r1A===null||r1B===null?null:dominantPole(r1A,r1B,def.poleA,def.poleB);
  const changed=d0!==null&&d1!==null&&d0!==d1;
  const sep=separators[def.separator];
  const separatorUsed=state==='BALANCED'&&(sep===def.poleA||sep===def.poleB);
  let dominant=dominantPole(a.score,b.score,def.poleA,def.poleB);
  if(state==='BALANCED')dominant=separatorUsed?sep as AxisPole:null;
  return {
    axis:def.axis,factorA:def.factorA,factorB:def.factorB,poleA:def.poleA,poleB:def.poleB,
    scoreA:a.score,scoreB:b.score,gap,dominant,balanceState:state,
    absoluteState:absoluteState(a.score,b.score,config),
    strongConflict:a.strongConflict||b.strongConflict,
    directionChangedAfterReserve1:changed,separatorUsed,
    classificationConfidence:axisConfidence(state,changed,a.strongConflict||b.strongConflict,separatorUsed),
  };
}

function addUnique(target:string[],...ids:string[]){for(const id of ids)if(!target.includes(id))target.push(id);}

function planMainAdaptive(factors:Record<FactorId,FactorResult>,axes:Record<AxisId,AxisResult>,answers:TraitAnswers,config:EngineConfig,separatorIds:AdaptivePlan['separatorIds'],nextItemIds:string[]){
  for(const def of AXES){
    const a=factors[def.factorA],b=factors[def.factorB],axis=axes[def.axis];
    if(!a.hasCore||!b.hasCore||axis.gap===null)continue;
    const pA=MONEY_PERSONALITY_ITEM_PLAN[def.factorA],pB=MONEY_PERSONALITY_ITEM_PLAN[def.factorB];
    const coreA=coreOnlyScore(def.factorA,answers)!;
    const coreB=coreOnlyScore(def.factorB,answers)!;
    const coreGap=Math.abs(coreA-coreB);
    const coreConflict=conflictForIds(pA.core,answers)||conflictForIds(pB.core,answers);
    const r1Trigger=coreGap<=config.mainRound1Gap||coreConflict;

    if(r1Trigger&&(!a.hasReserve1||!b.hasReserve1)){
      if(!a.hasReserve1)addUnique(nextItemIds,pA.reserve1);
      if(!b.hasReserve1)addUnique(nextItemIds,pB.reserve1);
      continue;
    }

    let r2Trigger=false;
    if(r1Trigger&&a.hasReserve1&&b.hasReserve1){
      const r1A=throughReserve1Score(def.factorA,answers)!;
      const r1B=throughReserve1Score(def.factorB,answers)!;
      const r1Gap=Math.abs(r1A-r1B);
      const coreDominant=dominantPole(coreA,coreB,def.poleA,def.poleB);
      const r1Dominant=dominantPole(r1A,r1B,def.poleA,def.poleB);
      const changed=coreDominant!==null&&r1Dominant!==null&&coreDominant!==r1Dominant;
      const r1Conflict=conflictForIds([...pA.core,pA.reserve1],answers)||conflictForIds([...pB.core,pB.reserve1],answers);
      r2Trigger=r1Gap<=config.mainRound2Gap||changed||r1Conflict;
      if(r2Trigger&&(!a.hasReserve2||!b.hasReserve2)){
        if(!a.hasReserve2)addUnique(nextItemIds,pA.reserve2);
        if(!b.hasReserve2)addUnique(nextItemIds,pB.reserve2);
        continue;
      }
    }

    const adaptiveComplete=!r1Trigger||(a.hasReserve1&&b.hasReserve1&&(!r2Trigger||(a.hasReserve2&&b.hasReserve2)));
    if(adaptiveComplete&&axis.balanceState==='BALANCED'&&!axis.separatorUsed&&!separatorIds.includes(def.separator))separatorIds.push(def.separator);
  }
}

function styleRanking(factors:Record<FactorId,FactorResult>){
  return STYLES.map(style=>({style,score:factors[style].score}))
    .filter((x):x is {style:StyleId;score:number}=>x.score!==null)
    .sort((a,b)=>b.score-a.score||STYLES.indexOf(a.style)-STYLES.indexOf(b.style));
}

function evaluateStyle(factors:Record<FactorId,FactorResult>,separators:SeparatorAnswers,config:EngineConfig):StyleResult{
  const ranking=styleRanking(factors);
  const first=ranking[0]??null,second=ranking[1]??null;
  if(!first||!second){
    return {primary:null,secondary:null,gap:null,scores:Object.fromEntries(STYLES.map(s=>[s,factors[s].score])) as Record<StyleId,number|null>,separatorUsed:false,dualLike:false,classificationConfidence:null};
  }
  const gap=round2(first.score-second.score);
  const sep=separators.SEP_STYLE;
  const needsSeparator=gap<=config.styleSeparatorGap;
  const separatorUsed=needsSeparator&&(sep===first.style||sep===second.style);
  const primary=separatorUsed?sep as StyleId:first.style;
  const secondary=primary===first.style?second.style:first.style;
  const conflict=factors[first.style].strongConflict||factors[second.style].strongConflict;
  const confidence:ConfidenceLabel=needsSeparator||separatorUsed||conflict?'LOW':gap<=config.styleRound1Gap?'MEDIUM':'HIGH';
  return {
    primary,secondary,gap,
    scores:Object.fromEntries(STYLES.map(s=>[s,factors[s].score])) as Record<StyleId,number|null>,
    separatorUsed,dualLike:gap<=config.styleSeparatorGap,classificationConfidence:confidence,
  };
}

function planStyleAdaptive(factors:Record<FactorId,FactorResult>,answers:TraitAnswers,style:StyleResult,config:EngineConfig,separatorIds:AdaptivePlan['separatorIds'],nextItemIds:string[]){
  if(!STYLES.every(s=>factors[s].hasCore))return;
  const baseScores=STYLES.map(s=>({style:s,score:mean(MONEY_PERSONALITY_ITEM_PLAN[s].core.map(id=>traitScore1to5(answers[id]!)))})).sort((a,b)=>b.score-a.score||STYLES.indexOf(a.style)-STYLES.indexOf(b.style));
  const baseTop=baseScores.slice(0,2).map(x=>x.style);
  const baseGap=baseScores[0].score-baseScores[1].score;
  const r1Trigger=baseGap<=config.styleRound1Gap||baseTop.some(s=>factors[s].strongConflict);
  if(r1Trigger){
    const missingR1=baseTop.filter(s=>!factors[s].hasReserve1);
    if(missingR1.length){
      for(const s of missingR1)addUnique(nextItemIds,MONEY_PERSONALITY_ITEM_PLAN[s].reserve1);
      return;
    }
  }
  const current=styleRanking(factors);
  if(current.length<2)return;
  const currentTop=current.slice(0,2).map(x=>x.style);
  const currentGap=current[0].score-current[1].score;
  const primaryChanged=current[0].style!==baseScores[0].style;
  const currentConflict=currentTop.some(s=>factors[s].strongConflict);
  const r2Trigger=r1Trigger&&(currentGap<=config.styleRound2Gap||primaryChanged||currentConflict);
  if(r2Trigger){
    const missingR1=currentTop.filter(s=>!factors[s].hasReserve1);
    if(missingR1.length){
      for(const s of missingR1)addUnique(nextItemIds,MONEY_PERSONALITY_ITEM_PLAN[s].reserve1);
      return;
    }
    const missingR2=currentTop.filter(s=>!factors[s].hasReserve2);
    if(missingR2.length){
      for(const s of missingR2)addUnique(nextItemIds,MONEY_PERSONALITY_ITEM_PLAN[s].reserve2);
      return;
    }
  }
  if(style.gap!==null&&style.gap<=config.styleSeparatorGap&&!style.separatorUsed&&!separatorIds.includes('SEP_STYLE'))separatorIds.push('SEP_STYLE');
}

function jobFromAxes(axes:Record<AxisId,AxisResult>):JobCode|null{
  const t=axes.TIME.dominant,d=axes.DECISION.dominant,a=axes.AWARENESS.dominant;
  if(!t||!d||!a)return null;
  if((t!=='F'&&t!=='I')||(d!=='D'&&d!=='N')||(a!=='M'&&a!=='P'))return null;
  return `${t}${d}${a}` as JobCode;
}

export function evaluateMoneyPersonality(answers:TraitAnswers,separators:SeparatorAnswers={},config:EngineConfig=DEFAULT_ENGINE_CONFIG):EngineEvaluation{
  const factors=Object.fromEntries(FACTORS.map(f=>[f,factorResult(f,answers)])) as Record<FactorId,FactorResult>;
  const axes=Object.fromEntries(AXES.map(def=>[def.axis,evaluateAxis(def,factors,answers,separators,config)])) as Record<AxisId,AxisResult>;
  const style=evaluateStyle(factors,separators,config);
  const adaptive:AdaptivePlan={nextItemIds:[],separatorIds:[]};
  planMainAdaptive(factors,axes,answers,config,adaptive.separatorIds,adaptive.nextItemIds);
  planStyleAdaptive(factors,answers,style,config,adaptive.separatorIds,adaptive.nextItemIds);
  const jobCode=jobFromAxes(axes);
  const jobName=jobCode?JOBS[jobCode]:null;
  const complete=FACTORS.every(f=>factors[f].hasCore)&&adaptive.nextItemIds.length===0&&adaptive.separatorIds.length===0&&jobCode!==null&&style.primary!==null;
  return {factors,axes,style,jobCode,jobName,adaptive,complete};
}

export function publicCore30ItemIds(){
  return FACTORS.flatMap(f=>[...MONEY_PERSONALITY_ITEM_PLAN[f].core]);
}

export function reserve20ItemIds(){
  return FACTORS.flatMap(f=>[MONEY_PERSONALITY_ITEM_PLAN[f].reserve1,MONEY_PERSONALITY_ITEM_PLAN[f].reserve2]);
}
