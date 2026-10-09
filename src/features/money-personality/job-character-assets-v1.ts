import type {JobCode} from './classifierV1';

export type JobCharacterEffect='command'|'insight'|'stars'|'water'|'wisdom'|'focus'|'magic'|'wind';

export type JobCharacterAsset={
  jobCode:JobCode;
  jobNumber:number;
  name:string;
  animal:string;
  file:string;
  effect:JobCharacterEffect;
  accent:string;
  tagline:string;
  motifReason:string;
};

// Vite is built with base:'./'. Keeping the public JOB assets relative makes
// them resolve correctly both at the production root and inside the hidden
// /pilot/money-type/ preview without requiring ImportMeta env typings.
const BASE='./assets/jobs/v1';

/**
 * Shared canonical JOB character assets used across Chapter 1 SSR reveal,
 * the CLASS encyclopedia, share surfaces, and Chapter 2 handoff.
 * Diagnosis/classification logic is intentionally independent from artwork.
 */
export const JOB_CHARACTER_ASSETS:Record<JobCode,JobCharacterAsset>={
  FDM:{jobCode:'FDM',jobNumber:1,name:'先回り司令官',animal:'アフリカゾウ',file:`${BASE}/JOB_01_FDM_elephant.webp`,effect:'command',accent:'#f5c84c',tagline:'先を読み、みんなを導く。',motifReason:'経験を蓄え、群れで危険を見極めながら先回りして動く。'},
  FDP:{jobCode:'FDP',jobNumber:2,name:'節目軍師',animal:'キツネリス',file:`${BASE}/JOB_02_FDP_squirrel.webp`,effect:'insight',accent:'#8dd06f',tagline:'節目を見極め、作戦を組み直す。',motifReason:'価値を見分けて備え、必要なタイミングで取り出す。'},
  FNM:{jobCode:'FNM',jobNumber:3,name:'兆しの占星術師',animal:'ルリノジコ',file:`${BASE}/JOB_03_FNM_blue_bird.webp`,effect:'stars',accent:'#79c7ff',tagline:'未来の兆しを、感覚でつかむ。',motifReason:'夜空の手がかりから方向を読み、見えない先をつかむ。'},
  FNP:{jobCode:'FNP',jobNumber:4,name:'ひらめき航海士',animal:'ウミガメ',file:`${BASE}/JOB_04_FNP_turtle.webp`,effect:'water',accent:'#52d4cf',tagline:'ひらめきで進路を切りひらく。',motifReason:'遠い海でも方角を感じ取り、迷わず進路を選ぶ。'},
  IDM:{jobCode:'IDM',jobNumber:5,name:'メリハリ賢者',animal:'マダコ',file:`${BASE}/JOB_05_IDM_octopus.webp`,effect:'wisdom',accent:'#f09a72',tagline:'必要なところだけ、賢く整える。',motifReason:'状況を観察し、学びながら柔軟に問題を解く。'},
  IDP:{jobCode:'IDP',jobNumber:6,name:'戦術ハンター',animal:'Portiaハエトリグモ',file:`${BASE}/JOB_06_IDP_spider.webp`,effect:'focus',accent:'#b9a273',tagline:'狙いを定め、最適な一手で仕留める。',motifReason:'相手を観察し、迂回まで使って最適な狩り筋を選ぶ。'},
  INM:{jobCode:'INM',jobNumber:7,name:'直感魔導士',animal:'コウイカ',file:`${BASE}/JOB_07_INM_cuttlefish.webp`,effect:'magic',accent:'#b887ff',tagline:'考えるより先に、ひらめきが走る。',motifReason:'一瞬で模様を変え、直感的にその場へ適応する。'},
  INP:{jobCode:'INP',jobNumber:8,name:'風読み剣士',animal:'ハヤブサ',file:`${BASE}/JOB_08_INP_peregrine.webp`,effect:'wind',accent:'#8bcfff',tagline:'風を読み、瞬時に動く。',motifReason:'高速の中でも視覚で軌道を修正し、最短で仕留める。'},
};

export function jobCharacterAsset(jobCode:JobCode){return JOB_CHARACTER_ASSETS[jobCode];}
