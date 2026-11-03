import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';

/** UI-only STYLE identity. Classifier IDs and scoring remain unchanged. */
export const STYLE_IDENTITY:Record<StyleId,{
  code:'D'|'E'|'S'|'O';
  label:string;
  typeLabel:string;
  short:string;
  voice:string;
  description:string;
  example:string;
}>={
  DRIVE:{
    code:'D',label:'DRIVE',typeLabel:'DRIVE',short:'できることを増やしたい',
    voice:'できることが増えたり、毎日がラクになるなら使いたい',
    description:'今までできなかったことができるようになったり、毎日の面倒がひとつ減ったり。使ったお金のおかげで生活が便利になるとうれしい。仕事や勉強のためだけじゃなく、普段のちょっとした買い物でも同じ。',
    example:'これがあれば、もっとラクにできそう！',
  },
  ENJOY:{
    code:'E',label:'ENJOY',typeLabel:'ENJOY',short:'楽しいことに使いたい',
    voice:'好きなことや、気分が上がる体験に使いたい',
    description:'好きなことに夢中になれる時間や、使うたびに気分が上がるものにお金を使いたい。形に残らなくても、「あの日楽しかったな」と思えるなら、それで十分。',
    example:'せっかくだし、こっちの方が楽しそう！',
  },
  SECURE:{
    code:'S',label:'SECURE',typeLabel:'SECURE',short:'あとで困りたくない',
    voice:'使ったあとも、落ち着いていられる方がいい',
    description:'欲しいものがあっても、払ったあとに困るのは避けたい。急な出費にも慌てずに済むか、あとからモヤモヤしないか。今のことでも先のことでも、安心して選べるのが大事。',
    example:'これ払っても、そのあと大丈夫かな？',
  },
  OPTIMIZE:{
    code:'O',label:'OPTIMIZE',typeLabel:'OPTIMIZE',short:'余計な出費はしたくない',
    voice:'本当に使うものに、ちょうどよくお金を使いたい',
    description:'安いものばかり買いたいわけじゃない。使わない機能や、なんとなく続けている支払いは減らしたい。そのぶん、本当に使うものには気持ちよく払いたい。',
    example:'これ、本当に使う？ いらなくない？',
  },
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
