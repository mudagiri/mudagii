import assert from 'node:assert/strict';
import type {JobCode,StyleId} from './src/features/money-personality/classifierV1';
import {resultV9For,RESULT_V9_SCENE_COUNT,RESULT_V9_TYPE_COUNT} from './src/features/money-personality/resultV9Content';
import {resultV10InsightFor} from './src/features/money-personality/resultV10Insight';

/** Guard against copy inferring unmeasured purchases, job, and response speed. */
const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];
const STYLE_SHORT:Record<StyleId,'D'|'E'|'S'|'O'>={DRIVE:'D',ENJOY:'E',SECURE:'S',OPTIMIZE:'O'};
const blockedFirstPersonClaims=['普段は放置','家計全部は見ない','数字もレビューも見る','比較したのに','必要だと思ったら早い'];
const typeExpectations:Record<string,readonly string[]>={
  'FDP-O':['更新','この先'],
  'FNM-E':['先','楽し'],
  'FNP-E':['目的','楽し'],
  'IDP-O':['節目','比べ'],
  'INM-D':['財布','しっくり'],
  'INM-E':['余力','うれしい'],
  'INP-D':['節目','今'],
};
let count=0;
const heroSet=new Set<string>(),deepSet=new Set<string>();
for(const job of JOBS)for(const style of STYLES){
 const key=job+'-'+STYLE_SHORT[style];
 const v9=resultV9For(job,style),v10=resultV10InsightFor(job,style);
 assert.equal(v9.scenes.length,6);
 const headlines=v9.hero+' '+v9.truth+' '+v10.truth;
 for(const prohibited of blockedFirstPersonClaims)assert.ok(!headlines.includes(prohibited),key+' overclaims '+prohibited);
 heroSet.add(v9.hero);deepSet.add(v10.truth);
 for(const keyword of typeExpectations[key]??[]){
  assert.ok(headlines.includes(keyword),key+' explanation must mention '+keyword);
 }
 count++;
}
assert.equal(count,32);
assert.equal(RESULT_V9_TYPE_COUNT,32);
assert.equal(RESULT_V9_SCENE_COUNT,192);
assert.equal(heroSet.size,32);
assert.equal(deepSet.size,32);
console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_TYPE_SEMANTIC_GUARD_V1',types:count,scenes:192,
  repairedHighRiskTypes:Object.keys(typeExpectations).length,unmeasuredHeroGuards:blockedFirstPersonClaims.length}));
