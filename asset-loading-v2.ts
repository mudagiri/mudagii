import { ENEMY_ASSETS, type EnemyAssetCategory } from './enemy-assets-v1';

const loaded=new Set<string>();
export function preloadImage(src:string|undefined){
 if(!src||typeof window==='undefined'||loaded.has(src))return;
 const img=new Image(); img.decoding='async'; img.src=src; loaded.add(src);
}
export function preloadList(srcs:(string|undefined)[]){srcs.forEach(preloadImage)}

const PRE='./assets/prebattle';
const BATTLE='./assets/battle1';

export function preloadOpening(){
 preloadList([
  `${PRE}/BG-001_OP_FIXED.png`,
  `${PRE}/MONSTER_HORDE_OP_MASTER.png`,
 ]);
}
export function preloadProfile(questionSprite?:string,nextSprite?:string){
 preloadList([`${PRE}/BG-002_PROFILE_FIXED.png`,questionSprite,nextSprite]);
}
export function preloadScan(current?:EnemyAssetCategory){
 const cats=[current].filter(Boolean) as EnemyAssetCategory[];
 preloadList([
  `${BATTLE}/BG-003_SCAN_BATTLE.png`,
  `${PRE}/MUDAGIRI_PROFILE_Q1.png`,
  `${PRE}/MUDAGIRI_PROFILE_Q2.png`,
  `${BATTLE}/MUDAGIRI_BATTLE.png`,
  `${BATTLE}/FX-01_REVEAL.png`,
  ...cats.flatMap(c=>[ENEMY_ASSETS[c].trace,ENEMY_ASSETS[c].normal])
 ]);
}
export function preloadAppraisal(categories:EnemyAssetCategory[]){
 preloadList(categories.slice(0,2).map(c=>ENEMY_ASSETS[c].normal));
}
export function preloadBattle(targets:EnemyAssetCategory[]){
 preloadList([
  `${BATTLE}/BG-003_SCAN_BATTLE.png`,
  `${BATTLE}/MUDAGIRI_BATTLE_READY.png`,
  `${BATTLE}/MUDAGIRI_BATTLE_SWING.png`,
  `${BATTLE}/MUDAGIRI_BATTLE_FOLLOW.png`,
  `${BATTLE}/FX-02_SLASH.png`,
  `${BATTLE}/FX-03_HIT.png`,
  ...targets.slice(0,3).flatMap(c=>[ENEMY_ASSETS[c].normal,ENEMY_ASSETS[c].defeated]),
 ]);
}
export function preloadResult(){}

export function idle(fn:()=>void){
 if(typeof window==='undefined')return;
 const w=window as Window & {requestIdleCallback?:(cb:()=>void,opts?:{timeout:number})=>number};
 if(typeof w.requestIdleCallback==='function')w.requestIdleCallback(fn,{timeout:900});
 else window.setTimeout(fn,120);
}
