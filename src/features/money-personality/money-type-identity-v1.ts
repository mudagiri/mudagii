import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';

export const STYLE_IDENTITY:Record<StyleId,{code:'D'|'E'|'S'|'O';label:string;typeLabel:string;short:string}>={
  DRIVE:{code:'D',label:'前進',typeLabel:'前進タイプ',short:'前へ進む'},
  ENJOY:{code:'E',label:'満足',typeLabel:'満足タイプ',short:'満足を取る'},
  SECURE:{code:'S',label:'安心',typeLabel:'安心タイプ',short:'安心を守る'},
  OPTIMIZE:{code:'O',label:'ムダなし',typeLabel:'ムダなしタイプ',short:'余分を切る'},
};

export function moneyTypeIdentity(jobCode:JobCode,style:StyleId){
  const asset=jobCharacterAsset(jobCode);
  const styleMeta=STYLE_IDENTITY[style];
  const code=moneyTypeCode(jobCode,style);
  return {
    code,
    jobName:asset.name,
    styleLabel:styleMeta.label,
    styleTypeLabel:styleMeta.typeLabel,
    compact:`${asset.name} × ${styleMeta.label}`,
    full:`${code}｜${asset.name} × ${styleMeta.label}`,
  };
}
