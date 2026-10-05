import type {EngineEvaluation,JobCode,StyleId} from './classifierV1';
import type {MoneyResultExperienceV2} from './resultExperienceV2';
import {refineMoneyResultExperienceV3} from './resultNarrativeV3';

export type MoneyResultExperienceV4=MoneyResultExperienceV2&{
  resultVersion:'MUDAGIRI_MONEY_RESULT_NARRATIVE_V4';
  resonanceChecks:[string,string,string];
  identityTitle:string;
};

const JOB_RESONANCE:Record<JobCode,[string,string]>={
  FDM:[
    '買う前に「この先の予定に響かないか」を一度考えることが多い',
    '候補が複数あると、違いを比べて理由に納得してから選びたい',
  ],
  FDP:[
    '毎日細かく見るより、給料日や大きな予定の前にまとめて確認する方がやりやすい',
    '見直すタイミングが決まると、一気に整理して次の作戦を立てやすい',
  ],
  FNM:[
    '数字では悪くなくても「なんか違う」が残ると、そのまま決めにくい',
    '先のことも考えるけど、最後は自分がしっくりくるかも大事にしたい',
  ],
  FNP:[
    'ゴールは持っていたいけど、途中のやり方まで細かく固定したくはない',
    '状況が変わったら、その時いちばん自然なやり方へ切り替えたい',
  ],
  IDM:[
    '安いから残す、高いから削る、ではなく「自分にとって意味があるか」で分けたい',
    '価値を感じるものには使える一方、意味の薄い出費は気になりやすい',
  ],
  IDP:[
    '全部を一気に整えるより、今いちばん効くものから1つずつ片づけたい',
    '候補を比べて優先順位が見えると、行動に移しやすい',
  ],
  INM:[
    '今どのくらい使えるかは見つつ、最後は自分に合うかで決めたい',
    '数字だけで正しくても、感覚的に違うとそのまま進みにくい',
  ],
  INP:[
    '普段は細かく縛らず、必要になったタイミングで財布を見直す方が自然',
    'その時の状況に合わせて、使い方や優先順位を柔軟に変えたい',
  ],
};

const STYLE_RESONANCE:Record<StyleId,string>={
  DRIVE:'お金を使うなら、「これで何かが前に進む」と感じられる方がいい',
  ENJOY:'安さだけより、「使ったあとにちゃんと満足できるか」が気になる',
  SECURE:'使ってもいいけど、「あとで困らない余白」は残しておきたい',
  OPTIMIZE:'今の自分にとって意味が薄い出費が残っていると、あとで気になりやすい',
};

const IDENTITY_TITLE:Record<JobCode,string>={
  FDM:'先を守りながら、今の選択を組み立てる人',
  FDP:'節目で作戦を立て直す人',
  FNM:'先を見つつ、違和感も置き去りにしない人',
  FNP:'目的地は持ち、進み方は柔軟に変える人',
  IDM:'使う・削るを、自分の納得で分ける人',
  IDP:'今いちばん効く一手に照準を合わせる人',
  INM:'現在地を見ながら、しっくりくる方を選ぶ人',
  INP:'今の流れで動き、節目で構え直す人',
};

export function buildMoneyResultExperienceV4(evaluation:EngineEvaluation,base:MoneyResultExperienceV2):MoneyResultExperienceV4{
  const refined=refineMoneyResultExperienceV3(evaluation,base);
  if(!evaluation.jobCode||!evaluation.style.primary)throw new Error('Result V4 requires a complete evaluation');
  const job=evaluation.jobCode;
  const primary=evaluation.style.primary;
  return {
    ...refined,
    resultVersion:'MUDAGIRI_MONEY_RESULT_NARRATIVE_V4',
    resonanceChecks:[...JOB_RESONANCE[job],STYLE_RESONANCE[primary]],
    identityTitle:IDENTITY_TITLE[job],
  };
}
