import type {JobCode,StyleId} from './classifierV1';
import {moneyTypeIdentity} from './money-type-identity-v1';

const JOBS:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];

function jobDistance(a:JobCode,b:JobCode){
  let n=0;
  for(let i=0;i<3;i++)if(a[i]!==b[i])n++;
  return n;
}

function oppositeJob(job:JobCode):JobCode{
  const flip=(c:string)=>c==='F'?'I':c==='I'?'F':c==='D'?'N':c==='N'?'D':c==='M'?'P':'M';
  return (flip(job[0])+flip(job[1])+flip(job[2])) as JobCode;
}

export type MoneyTypeNeighbors={
  close:{jobCode:JobCode;style:StyleId;title:string;reason:string};
  similar:{jobCode:JobCode;style:StyleId;title:string;reason:string};
  contrast:{jobCode:JobCode;style:StyleId;title:string;reason:string};
};

export function moneyTypeNeighbors(jobCode:JobCode,primaryStyle:StyleId,secondaryStyle:StyleId):MoneyTypeNeighbors{
  const nearest=JOBS.filter(job=>job!==jobCode).sort((a,b)=>jobDistance(jobCode,a)-jobDistance(jobCode,b)||JOBS.indexOf(a)-JOBS.indexOf(b))[0];
  const opposite=oppositeJob(jobCode);
  return {
    close:{jobCode,style:secondaryStyle,title:moneyTypeIdentity(jobCode,secondaryStyle).compact,reason:'行動のクセはかなり近く、何にお金を使いたいかだけ少し違うタイプ。'},
    similar:{jobCode:nearest,style:primaryStyle,title:moneyTypeIdentity(nearest,primaryStyle).compact,reason:'大事にする価値観は同じ。決め方や確認のタイミングが一つだけ違う近いタイプ。'},
    contrast:{jobCode:opposite,style:primaryStyle,title:moneyTypeIdentity(opposite,primaryStyle).compact,reason:'大事にする価値観は同じでも、お金を決めるまでの流れはかなり対照的。'},
  };
}