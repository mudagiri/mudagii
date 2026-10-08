import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';

export const STYLE_IDENTITY:Record<StyleId,{code:'D'|'E'|'S'|'O';label:string;typeLabel:string;short:string;voice:string}>={
  DRIVE:{code:'D',label:'前進',typeLabel:'前進タイプ',short:'前に進める',voice:'せっかく使うなら、前に進みたい'},
  ENJOY:{code:'E',label:'楽しさ',typeLabel:'楽しさタイプ',short:'ちゃんと楽しむ',voice:'今をちゃんと楽しみたい'},
  SECURE:{code:'S',label:'安心',typeLabel:'安心タイプ',short:'あとで困らない',voice:'あとで困りたくない'},
  OPTIMIZE:{code:'O',label:'納得',typeLabel:'納得タイプ',short:'意味なく払わない',voice:'意味ない出費はしたくない'},
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
