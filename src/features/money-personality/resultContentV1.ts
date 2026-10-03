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
    blindSpot:'考える材料を増やしすぎると、十分に条件がそろっていても設計を続けてしまうことがある。',
    strategy:'「何を守りたいか」を先に決めてから、今の支出と将来への影響を並べると判断がまとまりやすい。',
    oneAction:'家計クエストでは、改善候補TOP1を「今月」と「1年後」の両方で見る。',
  },
  FDP:{
    weapon:'節目の作戦会議',
    strength:'先を見据えながら、比較して考え、意味のある節目でお金の作戦を組み直せる。',
    blindSpot:'次の確認タイミングが明確なほど、その節目まで判断を送ることがある。',
    strategy:'毎日細かく管理するより、給料日・月初・大きな予定の前など「作戦会議の日」を決める方が持ち味を活かしやすい。',
    oneAction:'家計クエストで見つけた改善候補に、次に確認する節目を1つだけ決める。',
  },
  FNM:{
    weapon:'予兆キャッチ',
    strength:'先の見通しと今の現在地を持ちながら、自分のしっくり感や違和感も判断に使える。',
    blindSpot:'感覚を大切にするほど、複数の可能性がどれもありそうに見えて選択肢が広がることがある。',
    strategy:'まず数字で現在地を確認し、そのあと「どこが一番引っかかるか」を使うと感覚が活きる。',
    oneAction:'家計クエストの基準比較を見たあと、最も違和感のある1カテゴリだけ深掘りする。',
  },
  FNP:{
    weapon:'航路変更力',
    strength:'先の目的地を意識しながら、その時の感覚と節目の確認を使って進み方を調整できる。',
    blindSpot:'進める航路が多いと、どの道を選ぶかで迷いやすくなることがある。',
    strategy:'目的地を1つに絞り、節目ごとに「この航路でまだ合っているか」を確認すると動きやすい。',
    oneAction:'家計クエスト前に、今いちばん守りたい未来の予定を1つだけ決める。',
  },
  IDM:{
    weapon:'納得配分',
    strength:'今の状況をつかみながら、比較して考え、自分が納得できる配分を選びやすい。',
    blindSpot:'どちらにも理由がある選択では、比較する項目が増えて判断コストが大きくなることがある。',
    strategy:'全部を同じ基準で削るより、「守る支出」と「見直す支出」を分けると判断しやすい。',
    oneAction:'家計クエストでは、守りたい支出1つと見直してよい支出1つを分ける。',
  },
  IDP:{
    weapon:'ターゲット選定',
    strength:'目の前の条件を比較して見定め、節目で照準を合わせ直しながら判断できる。',
    blindSpot:'大きなターゲットに集中すると、小さな改善候補が視界から外れることがある。',
    strategy:'候補を広げ続けるより、優先順位をつけて「次に見る1つ」を明確にすると強みが出やすい。',
    oneAction:'家計クエストでは、最優先の改善候補TOP1だけにまず照準を合わせる。',
  },
  INM:{
    weapon:'感覚と現在地の両立',
    strength:'手元の現在地をつかみながら、自分にしっくりくる感覚を判断に重ねられる。',
    blindSpot:'現在地が見えている安心感が強いと、使える余力を大きめに感じることがある。',
    strategy:'感覚を変えようとするより、判断前に「残る余力」だけ見える状態を作ると持ち味を保ちやすい。',
    oneAction:'家計クエストでは、いちばん大きい改善候補を1つだけ先に見る。',
  },
  INP:{
    weapon:'柔軟な構え',
    strength:'今の状況を感覚で読みながら、節目ごとに構えを整えて次の一手を選べる。',
    blindSpot:'感覚で進められる場面ほど、次の節目まで振り返る材料が少なくなることがある。',
    strategy:'細かな管理ルールを増やすより、節目で見る数字を1つだけ決めると続けやすい。',
    oneAction:'家計クエストの結果から、今日できるアクションを1つだけ選ぶ。',
  },
};

const STYLE_RESULT:Record<StyleId,{primary:string;secondary:string}>={
  DRIVE:{
    primary:'主属性はDRIVE。お金を使うなら、前進したり、できることが増える価値を重視しやすい。',
    secondary:'副属性のDRIVEも強く、判断では「この選択で前に進めるか」がもう一つの評価軸になりやすい。',
  },
  ENJOY:{
    primary:'主属性はENJOY。お金を使うなら、楽しさ・体験・気分が上がる価値を重視しやすい。',
    secondary:'副属性のENJOYも強く、合理性だけでなく「ちゃんと満足できるか」も大切な評価軸になりやすい。',
  },
  SECURE:{
    primary:'主属性はSECURE。お金を使うなら、確実性・予測可能性・安心できる余白を重視しやすい。',
    secondary:'副属性のSECUREも強く、選択肢を比べるときに「あとで困りにくいか」も大切な評価軸になりやすい。',
  },
  OPTIMIZE:{
    primary:'主属性はOPTIMIZE。お金を使うなら、必要なものに絞り、不要を減らし、効率よく使えることを重視しやすい。',
    secondary:'副属性のOPTIMIZEも強く、「余分がないか」「今の用途に合っているか」も大切な評価軸になりやすい。',
  },
};

function balanceBadge(state:BalanceState|null,absolute:AbsoluteState|null,dominant:AxisPole|null){
  if(state==='BALANCED'){
    if(absolute==='HIGH_HIGH')return '両方強い';
    if(absolute==='LOW_LOW')return 'どちらも控えめ';
    return 'かなり拮抗';
  }
  if(state==='LEAN')return `${dominant??''}寄り`;
  return 'はっきり';
}

function axisText(axis:AxisId,state:BalanceState|null,absolute:AbsoluteState|null,dominant:AxisPole|null){
  if(axis==='TIME'){
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '先の予定も、今得られる機会も、どちらも強く判断に入れるタイプ。片方を捨てるより両方を成立させようとしやすい。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '未来か今かのどちらか一方を強い基準にするより、その場の条件に合わせて判断しやすい。';
    if(state==='BALANCED')return '先の予定と今の機会がかなり拮抗。場面によって重みづけが変わりやすい。';
    if(dominant==='F')return state==='CLEAR'?'先の予定や余裕への影響を、今の判断にかなり強く織り込みやすい。':'先の予定や余裕への影響を、今の判断にやや多めに織り込みやすい。';
    return state==='CLEAR'?'今得られる機会や便益を、判断にかなり強く取り込みやすい。':'今得られる機会や便益を、判断にやや多めに取り込みやすい。';
  }
  if(axis==='DECISION'){
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '比較・整理と、しっくり感・違和感の両方を強く使う。数字だけでも感覚だけでも決めにくいタイプ。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '比較か感覚のどちらか一方が強いというより、状況に応じて判断材料を選びやすい。';
    if(state==='BALANCED')return '比較して考える力と、自分の感覚を使う力がかなり拮抗している。';
    if(dominant==='D')return state==='CLEAR'?'比較・整理・確認を、判断根拠としてかなり強く使いやすい。':'比較・整理・確認を、判断根拠としてやや多めに使いやすい。';
    return state==='CLEAR'?'しっくり感や違和感を、判断根拠としてかなり強く使いやすい。':'しっくり感や違和感を、判断根拠としてやや多めに使いやすい。';
  }
  if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '普段から現在地をつかむ感覚も、節目で確認する習慣も両方強い。2つの把握方法を併用しやすい。';
  if(state==='BALANCED'&&absolute==='LOW_LOW')return '普段の把握か節目の確認のどちらか一方が強いというより、必要な場面に合わせて確認方法が変わりやすい。';
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
  return `${jobShort[job]}。お金では「${styleWord[primary]}」を軸にしつつ、「${styleWord[secondary]}」も大切にする。`;
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
