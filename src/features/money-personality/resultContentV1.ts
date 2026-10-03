import type {AbsoluteState,AxisId,AxisPole,BalanceState,EngineEvaluation,JobCode,StyleId} from './classifierV1';

export const MONEY_RESULT_CONTENT_VERSION='MUDAGIRI_MONEY_RESULT_CONTENT_V1_PILOT' as const;

export type JobResultBase={
  weapon:string;
  strength:string;
  blindSpot:string;
  strategy:string;
  oneAction:string;
};

export type AxisInsight={
  axis:AxisId;
  title:string;
  badge:string;
  text:string;
};

export type MoneyResultContent={
  version:typeof MONEY_RESULT_CONTENT_VERSION;
  headline:string;
  summary:string;
  weapon:string;
  strength:string;
  blindSpot:string;
  strategy:string;
  oneAction:string;
  primaryStyleLine:string;
  secondaryStyleLine:string;
  axisInsights:AxisInsight[];
};

export const JOB_RESULT_BASE:Record<JobCode,JobResultBase>={
  FDM:{
    weapon:'先回り設計',
    strength:'先の予定を見ながら、比較して考え、普段の財布の現在地も判断材料にできる。',
    blindSpot:'比較材料が増え続ける場面では、判断基準を先に絞らないと整理する情報が広がりやすい。',
    strategy:'「何を守りたいか」を先に決めてから、今の支出と将来への影響を並べると判断がまとまりやすい。',
    oneAction:'家計クエストでは、改善候補TOP1を「今月」と「1年後」の両方で見る。',
  },
  FDP:{
    weapon:'節目の作戦会議',
    strength:'先を見据えながら、比較して考え、意味のある節目でお金の作戦を組み直せる。',
    blindSpot:'確認する節目が決まっていないと、比較や見直しの強みを使うタイミングが曖昧になりやすい。',
    strategy:'毎日細かく管理するより、給料日・月初・大きな予定の前など「作戦会議の日」を決める方が持ち味を活かしやすい。',
    oneAction:'家計クエストで見つけた改善候補に、次に確認する節目を1つだけ決める。',
  },
  FNM:{
    weapon:'予兆キャッチ',
    strength:'先の見通しと今の現在地を持ちながら、自分のしっくり感や違和感も判断に使える。',
    blindSpot:'数字と感覚が違う方向を向いた場面では、どちらを優先するか決めていないと判断軸が散りやすい。',
    strategy:'まず数字で現在地を確認し、そのあと「どこが一番引っかかるか」を使うと感覚が活きる。',
    oneAction:'家計クエストの基準比較を見たあと、最も違和感のある1カテゴリだけ深掘りする。',
  },
  FNP:{
    weapon:'航路変更力',
    strength:'先の目的地を意識しながら、その時の感覚と節目の確認を使って進み方を調整できる。',
    blindSpot:'未来の目的地が複数あると、節目で何を基準に航路を選ぶかが曖昧になりやすい。',
    strategy:'目的地を1つに絞り、節目ごとに「この航路でまだ合っているか」を確認すると動きやすい。',
    oneAction:'家計クエスト前に、今いちばん守りたい未来の予定を1つだけ決める。',
  },
  IDM:{
    weapon:'納得配分',
    strength:'今の状況をつかみながら、比較して考え、自分が納得できる配分を選びやすい。',
    blindSpot:'比較する基準が増えすぎると、「守る支出」と「見直す支出」の境目が見えにくくなることがある。',
    strategy:'全部を同じ基準で削るより、「守る支出」と「見直す支出」を分けると判断しやすい。',
    oneAction:'家計クエストでは、守りたい支出1つと見直してよい支出1つを分ける。',
  },
  IDP:{
    weapon:'ターゲット選定',
    strength:'目の前の条件を比較して見定め、節目で照準を合わせ直しながら判断できる。',
    blindSpot:'優先対象が複数あると、節目で何を先に確認するかが散りやすい。',
    strategy:'候補を広げ続けるより、優先順位をつけて「次に見る1つ」を明確にすると強みが出やすい。',
    oneAction:'家計クエストでは、最優先の改善候補TOP1だけにまず照準を合わせる。',
  },
  INM:{
    weapon:'感覚と現在地の両立',
    strength:'手元の現在地をつかみながら、自分にしっくりくる感覚を判断に重ねられる。',
    blindSpot:'現在地と感覚だけでは決めきれない選択では、追加で何を見るかが曖昧だと判断軸が散りやすい。',
    strategy:'感覚を変えようとするより、判断前に「残る余力」だけ見える状態を作ると持ち味を保ちやすい。',
    oneAction:'家計クエストでは、いちばん大きい改善候補を1つだけ先に見る。',
  },
  INP:{
    weapon:'柔軟な構え',
    strength:'今の状況を感覚で読みながら、節目ごとに構えを整えて次の一手を選べる。',
    blindSpot:'節目で見る基準が毎回変わると、前回との差をつかみにくくなる。',
    strategy:'細かな管理ルールを増やすより、節目で見る数字を1つだけ決めると続けやすい。',
    oneAction:'家計クエストの結果から、今日できるアクションを1つだけ選ぶ。',
  },
};

const STYLE_RESULT:Record<StyleId,{primary:string;secondary:string}>={
  DRIVE:{
    primary:'4属性の中ではDRIVEが最も前に出た。選択肢を比べるとき、前進したり、できることが増える価値が相対的に判断材料になりやすい。',
    secondary:'4属性ではDRIVEが2番目。必要な場面では「この選択で前に進めるか」も補助的な評価軸になりうる。',
  },
  ENJOY:{
    primary:'4属性の中ではENJOYが最も前に出た。選択肢を比べるとき、楽しさ・体験・気分が上がる価値が相対的に判断材料になりやすい。',
    secondary:'4属性ではENJOYが2番目。必要な場面では「ちゃんと満足できるか」も補助的な評価軸になりうる。',
  },
  SECURE:{
    primary:'4属性の中ではSECUREが最も前に出た。選択肢を比べるとき、確実性・予測可能性・安心できる余白が相対的に判断材料になりやすい。',
    secondary:'4属性ではSECUREが2番目。必要な場面では「あとで困りにくいか」も補助的な評価軸になりうる。',
  },
  OPTIMIZE:{
    primary:'4属性の中ではOPTIMIZEが最も前に出た。選択肢を比べるとき、必要なものに絞り、不要を減らし、効率よく使えることが相対的に判断材料になりやすい。',
    secondary:'4属性ではOPTIMIZEが2番目。必要な場面では「余分がないか」「今の用途に合っているか」も補助的な評価軸になりうる。',
  },
};

const POLE_BADGE:Record<AxisPole,string>={
  F:'未来寄り',I:'今寄り',D:'比較寄り',N:'感覚寄り',M:'普段把握寄り',P:'節目確認寄り',
};

function balanceBadge(state:BalanceState|null,absolute:AbsoluteState|null,dominant:AxisPole|null){
  if(state==='BALANCED'){
    if(absolute==='HIGH_HIGH')return '両方強い';
    if(absolute==='LOW_LOW')return 'どちらも控えめ';
    return 'かなり拮抗';
  }
  if(!dominant)return '';
  if(state==='LEAN')return POLE_BADGE[dominant];
  return `${POLE_BADGE[dominant]}・明確`;
}

function axisText(axis:AxisId,state:BalanceState|null,absolute:AbsoluteState|null,dominant:AxisPole|null){
  if(axis==='TIME'){
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '先の予定も、今得られる機会も、どちらも強く判断に入れる。片方だけに寄せず、両方を判断材料として残しやすい。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '先の予定と今の機会のどちらも、単独では強い判断基準になっていない。時間軸以外の条件も含めて決める余地が大きい結果。';
    if(state==='BALANCED')return '先の予定と今の機会がかなり拮抗。どちらか一方だけを強く優先する結果ではない。';
    if(dominant==='F')return state==='CLEAR'?'先の予定や余裕への影響を、今の判断にかなり強く織り込みやすい。':'先の予定や余裕への影響を、今の判断にやや多めに織り込みやすい。';
    return state==='CLEAR'?'今得られる機会や便益を、判断にかなり強く取り込みやすい。':'今得られる機会や便益を、判断にやや多めに取り込みやすい。';
  }
  if(axis==='DECISION'){
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '比較・整理と、しっくり感・違和感の両方を強く使う。数字だけ、感覚だけに寄せず、両方を判断材料にしやすい。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '比較・整理と、しっくり感・違和感のどちらも強く出ていない。決め方を一方に固定する結果ではない。';
    if(state==='BALANCED')return '比較して考える力と、自分の感覚を使う力がかなり拮抗している。';
    if(dominant==='D')return state==='CLEAR'?'比較・整理・確認を、判断根拠としてかなり強く使いやすい。':'比較・整理・確認を、判断根拠としてやや多めに使いやすい。';
    return state==='CLEAR'?'しっくり感や違和感を、判断根拠としてかなり強く使いやすい。':'しっくり感や違和感を、判断根拠としてやや多めに使いやすい。';
  }
  if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '普段から現在地をつかむ感覚も、節目で確認する習慣も両方強い。2つの把握方法を併用しやすい。';
  if(state==='BALANCED'&&absolute==='LOW_LOW')return '普段からの把握と、決まった節目での確認のどちらも強く出ていない。把握方法を一方に固定する結果ではない。';
  if(state==='BALANCED')return '普段からの把握と、節目での確認がかなり拮抗している。';
  if(dominant==='M')return state==='CLEAR'?'普段から残りや支出ペースなど、お金の現在地をかなりつかみやすい。':'普段から残りや支出ペースなど、お金の現在地をややつかみやすい。';
  return state==='CLEAR'?'給料日・支払日・予定など、意味のある節目で確認する傾向がかなり強い。':'給料日・支払日・予定など、意味のある節目で確認する傾向がやや強い。';
}

function axisTitle(axis:AxisId){
  if(axis==='TIME')return '時間視野';
  if(axis==='DECISION')return '判断根拠';
  return '把握リズム';
}

function headline(job:JobCode,primary:StyleId,secondary:StyleId){
  const jobShort:Record<JobCode,string>={
    FDM:'先を見て、納得してから動く',
    FDP:'先を見据え、節目で作戦を整える',
    FNM:'先の気配と自分の感覚を重ねる',
    FNP:'目的地を持ち、風を読みながら進む',
    IDM:'今の状況を見て、納得できる一手を選ぶ',
    IDP:'目の前を見定め、狙いを絞って動く',
    INM:'現在地をつかみ、自分の感覚で選ぶ',
    INP:'今の風を読み、節目で構え直す',
  };
  const styleWord:Record<StyleId,string>={DRIVE:'前進',ENJOY:'満足',SECURE:'安心',OPTIMIZE:'最適化'};
  return `${jobShort[job]}。4属性では「${styleWord[primary]}」が先頭で、「${styleWord[secondary]}」が次に続く。`;
}

export function buildMoneyResultContent(evaluation:EngineEvaluation):MoneyResultContent{
  if(!evaluation.complete||!evaluation.jobCode||!evaluation.style.primary||!evaluation.style.secondary){
    throw new Error('Money result content requires a complete evaluation');
  }
  const job=evaluation.jobCode;
  const primary=evaluation.style.primary;
  const secondary=evaluation.style.secondary;
  const base=JOB_RESULT_BASE[job];
  const axisInsights=(['TIME','DECISION','AWARENESS'] as AxisId[]).map(axis=>{
    const x=evaluation.axes[axis];
    return {
      axis,
      title:axisTitle(axis),
      badge:balanceBadge(x.balanceState,x.absoluteState,x.dominant),
      text:axisText(axis,x.balanceState,x.absoluteState,x.dominant),
    };
  });
  return {
    version:MONEY_RESULT_CONTENT_VERSION,
    headline:headline(job,primary,secondary),
    summary:`${base.strength} ${STYLE_RESULT[primary].primary}`,
    weapon:base.weapon,
    strength:base.strength,
    blindSpot:base.blindSpot,
    strategy:base.strategy,
    oneAction:base.oneAction,
    primaryStyleLine:STYLE_RESULT[primary].primary,
    secondaryStyleLine:STYLE_RESULT[secondary].secondary,
    axisInsights,
  };
}
