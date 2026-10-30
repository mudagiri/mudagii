import type {AxisPole,StyleId} from './classifierV1';

export type AxisSeparatorId='SEP_TIME'|'SEP_DECISION'|'SEP_AWARENESS';
export type SeparatorId=AxisSeparatorId|'SEP_STYLE';

export type SeparatorChoice<T extends string>={
  value:T;
  text:string;
};

export type AxisSeparatorItem={
  id:AxisSeparatorId;
  scenario:string;
  prompt:string;
  choices:readonly [SeparatorChoice<AxisPole>,SeparatorChoice<AxisPole>];
  purpose:string;
};

/**
 * Separators are classification-only tie breakers.
 * They NEVER change factor scores and are only shown after max adaptive
 * measurement still leaves a classification boundary unresolved.
 */
export const AXIS_SEPARATOR_ITEMS:Record<AxisSeparatorId,AxisSeparatorItem>={
  SEP_TIME:{
    id:'SEP_TIME',
    scenario:'先の予定も、いま目の前の機会も、どちらも大切だと感じる場面です。',
    prompt:'最後に判断の軸として、ほんの少しでも自分に近いのは？',
    choices:[
      {value:'F',text:'この先の予定や余裕への影響を基準にする'},
      {value:'I',text:'いま得られる機会や便益を基準にする'},
    ],
    purpose:'FUTUREとIMMEDIATEが十分な追加測定後も拮抗した人をJOB上どちら側へ配置する',
  },
  SEP_DECISION:{
    id:'SEP_DECISION',
    scenario:'比べて考えた結果も、自分の感覚も、どちらも悪くありません。',
    prompt:'最後の決め手として、ほんの少しでも自分に近いのは？',
    choices:[
      {value:'D',text:'比較・整理して、納得できる理由を基準にする'},
      {value:'N',text:'自分にしっくりくる感覚を基準にする'},
    ],
    purpose:'DELIBERATIONとINTUITIONが十分な追加測定後も拮抗した人をJOB上どちら側へ配置する',
  },
  SEP_AWARENESS:{
    id:'SEP_AWARENESS',
    scenario:'普段からの把握も、節目での確認も、どちらも自分に当てはまるとします。',
    prompt:'お金の状況をつかむスタイルとして、ほんの少しでも自分らしいのは？',
    choices:[
      {value:'M',text:'普段から、残りや使うペースがだいたい頭に入っている'},
      {value:'P',text:'給料日・支払日・予定など、節目で状況を確認する'},
    ],
    purpose:'MONITORINGとPERIODICが十分な追加測定後も拮抗した人をJOB上どちら側へ配置する',
  },
};

export const STYLE_SEPARATOR_VALUE_COPY:Record<StyleId,string>={
  DRIVE:'できることが増えたり、目標に近づけたと感じる',
  ENJOY:'楽しかったり、気分が上がったと感じる',
  SECURE:'安心できる余裕や見通しが増えたと感じる',
  OPTIMIZE:'ムダが減り、必要なものにうまく絞れたと感じる',
};

export type StyleSeparatorItem={
  id:'SEP_STYLE';
  scenario:string;
  prompt:string;
  choices:readonly [SeparatorChoice<StyleId>,SeparatorChoice<StyleId>];
  purpose:string;
};

export function buildStyleSeparator(styleA:StyleId,styleB:StyleId):StyleSeparatorItem{
  if(styleA===styleB)throw new Error('Style separator requires two different styles');
  return {
    id:'SEP_STYLE',
    scenario:'どちらの価値も、自分にかなり当てはまります。',
    prompt:'自由に使えるお金や時間を使ったあと、ほんの少しでも「使ってよかった」と感じやすいのは？',
    choices:[
      {value:styleA,text:STYLE_SEPARATOR_VALUE_COPY[styleA]},
      {value:styleB,text:STYLE_SEPARATOR_VALUE_COPY[styleB]},
    ],
    purpose:'PrimaryとSecondary Styleが十分な追加測定後も拮抗した人の表示上の主属性を決める',
  };
}

export type SeparatorPresentation<T extends string>={
  left:SeparatorChoice<T>;
  right:SeparatorChoice<T>;
  isSwapped:boolean;
};

function hashString(input:string){
  let h=2166136261>>>0;
  for(let i=0;i<input.length;i++){
    h^=input.charCodeAt(i);
    h=Math.imul(h,16777619)>>>0;
  }
  return h>>>0;
}

/** Deterministic per participant so resume never changes card position. */
export function separatorPresentation<T extends string>(
  separatorKey:string,
  participantId:string,
  choices:readonly [SeparatorChoice<T>,SeparatorChoice<T>],
):SeparatorPresentation<T>{
  const swap=(hashString(participantId+'|'+separatorKey+'|SEPARATOR_V1')&1)===1;
  return swap
    ?{left:choices[1],right:choices[0],isSwapped:true}
    :{left:choices[0],right:choices[1],isSwapped:false};
}

export const SEPARATOR_DESIGN_RULES={
  changesFactorScores:false,
  shownOnlyAfterMaxAdaptive:true,
  neutralOption:false,
  preserveBalanceInResult:true,
  randomizePhysicalSide:true,
  interpretation:'Separatorは「どちらの因子が強いか」を再測定する質問ではなく、拮抗情報を残したままJOB/主属性の表示上の所属だけを決める。',
} as const;
