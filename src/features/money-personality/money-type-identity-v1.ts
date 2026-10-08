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
    description:'お金を使うことで、今までできなかったことができたり、面倒なことがラクになったりするのがうれしい。勉強や仕事だけじゃなく、普段の生活が便利になることも含みます。',
    example:'これがあれば、もっとラクにできそう！',
  },
  ENJOY:{
    code:'E',label:'ENJOY',typeLabel:'ENJOY',short:'楽しいことに使いたい',
    voice:'好きなことや、気分が上がる体験に使いたい',
    description:'好きなことを楽しむ時間や、使うたびに気分が上がるものを大切にします。形に残らない思い出も、使ってよかったと思えるなら十分意味があります。',
    example:'せっかくだし、こっちの方が楽しそう！',
  },
  SECURE:{
    code:'S',label:'SECURE',typeLabel:'SECURE',short:'あとで困りたくない',
    voice:'使ったあとも、落ち着いていられる方がいい',
    description:'予想外の出費があっても慌てない余裕や、見通しが立つ支払いを大切にします。今か将来かに関係なく、選んだあとも安心できることが大事です。',
    example:'これ払っても、そのあと大丈夫かな？',
  },
  OPTIMIZE:{
    code:'O',label:'OPTIMIZE',typeLabel:'OPTIMIZE',short:'余計な出費はしたくない',
    voice:'本当に使うものに、ちょうどよくお金を使いたい',
    description:'安ければいいわけじゃありません。自分に必要な機能や量を選んで、使わないものを減らしたい。必要なものにはしっかり使う考え方です。',
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
