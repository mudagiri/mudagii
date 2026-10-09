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
    strength:'先の予定を見ながら、比較して考え、普段の財布の現在地も判断材料にできる。将来だけを見て今を我慢するというより、「この選択をしても先の余白は守れるか」を確認してから進めるのが得意な型。',
    blindSpot:'比較材料が増え続ける場面では、判断基準を先に絞らないと整理する情報が広がりやすい。見える条件が多いほど全部を扱おうとして、優先順位がぼやけることがある。',
    strategy:'「何を守りたいか」を先に決めてから、今の支出と将来への影響を並べると判断がまとまりやすい。比較項目を増やすより、外したくない条件を1つ置くのが効く。',
    oneAction:'家計クエストでは、改善候補TOP1を「今月」と「1年後」の両方で見る。',
  },
  FDP:{
    weapon:'節目の作戦会議',
    strength:'先を見据えながら、比較して考え、意味のある節目でお金の作戦を組み直せる。常に細かく管理するより、「ここは見る」と決めたタイミングで一気に整理すると持ち味が出やすい。',
    blindSpot:'確認する節目が決まっていないと、比較や見直しの強みを使うタイミングが曖昧になりやすい。見る日が決まると立て直しやすい。',
    strategy:'毎日細かく管理するより、給料日・月初・大きな予定の前など「作戦会議の日」を決める方が持ち味を活かしやすい。見る項目も3つ程度に絞ると続けやすい。',
    oneAction:'家計クエストで見つけた改善候補に、次に確認する節目を1つだけ決める。',
  },
  FNM:{
    weapon:'予兆キャッチ',
    strength:'先の見通しと今の現在地を持ちながら、自分のしっくり感や違和感も判断に使える。数字を無視するわけでも、数字だけで決めるわけでもなく、「条件は悪くないけど何か違う」を拾えるのが特徴。',
    blindSpot:'数字と感覚が違う方向を向いた場面では、どちらを優先するか決めていないと判断軸が散りやすい。先に越えてはいけない線を決めると整いやすい。',
    strategy:'まず数字で現在地を確認し、そのあと「どこが一番引っかかるか」を使うと感覚が活きる。安全ラインを先に置くと両方の強みがぶつかりにくい。',
    oneAction:'家計クエストの基準比較を見たあと、最も違和感のある1カテゴリだけ深掘りする。',
  },
  FNP:{
    weapon:'航路変更力',
    strength:'先の目的地を意識しながら、その時の感覚と節目の確認を使って進み方を調整できる。最初から完璧な計画を固定するより、目的地を見失わずに途中で航路を変える方が自然な型。',
    blindSpot:'未来の目的地が複数あると、節目で何を基準に航路を選ぶかが曖昧になりやすい。「今は何を優先するか」を1つ置くと判断しやすい。',
    strategy:'目的地を1つに絞り、節目ごとに「この航路でまだ合っているか」を確認すると動きやすい。細かなルールより、守りたい予定を1つ置く方が続けやすい。',
    oneAction:'家計クエスト前に、今いちばん守りたい未来の予定を1つだけ決める。',
  },
  IDM:{
    weapon:'納得配分',
    strength:'今の状況をつかみながら、比較して考え、自分が納得できる配分を選びやすい。全部を安くするより、「ここは使う・ここは見直す」と意味を分ける方がしっくり来やすい型。',
    blindSpot:'比較する基準が増えすぎると、「守る支出」と「見直す支出」の境目が見えにくくなることがある。どこで十分とするかを先に決めると整いやすい。',
    strategy:'全部を同じ基準で削るより、「守る支出」と「見直す支出」を分けると判断しやすい。金額だけでなく、使った後に納得できるかも含めると持ち味が出る。',
    oneAction:'家計クエストでは、守りたい支出1つと見直してよい支出1つを分ける。',
  },
  IDP:{
    weapon:'ターゲット選定',
    strength:'目の前の条件を比較して見定め、節目で照準を合わせ直しながら判断できる。全部を一度に整えるより、「今はここ」と狙いを決めた瞬間に判断の精度が上がりやすい型。',
    blindSpot:'優先対象が複数あると、節目で何を先に確認するかが散りやすい。候補が同時に並ぶほど「次の1つ」を決める工程が必要になる。',
    strategy:'候補を広げ続けるより、優先順位をつけて「次に見る1つ」を明確にすると強みが出やすい。比較はTOP3、動くのはTOP1にするとテンポを保ちやすい。',
    oneAction:'家計クエストでは、最優先の改善候補TOP1だけにまず照準を合わせる。',
  },
  INM:{
    weapon:'感覚と現在地の両立',
    strength:'手元の現在地をつかみながら、自分にしっくりくる感覚を判断に重ねられる。数字を見て終わりではなく、「今の自分に合っているか」まで含めて選べるのが特徴。',
    blindSpot:'現在地と感覚だけでは決めきれない選択では、追加で何を見るかが曖昧だと判断軸が散りやすい。足りない時だけ「あと1つ何を見るか」を決めると整いやすい。',
    strategy:'感覚を変えようとするより、判断前に「残る余力」だけ見える状態を作ると持ち味を保ちやすい。現在地→納得感の2段階にするとブレにくい。',
    oneAction:'家計クエストでは、いちばん大きい改善候補を1つだけ先に見る。',
  },
  INP:{
    weapon:'柔軟な構え',
    strength:'今の状況を感覚で読みながら、節目ごとに構えを整えて次の一手を選べる。毎日同じルールで縛るより、必要な時にちゃんと見直せる余白がある方が自然な型。',
    blindSpot:'節目で見る基準が毎回変わると、前回との差をつかみにくくなる。「毎回これだけは見る」という1項目を固定すると流れを追いやすい。',
    strategy:'細かな管理ルールを増やすより、節目で見る数字を1つだけ決めると続けやすい。その数字を確認してから、自分に合う次の一手を選ぶ順番が相性いい。',
    oneAction:'家計クエストの結果から、今日できるアクションを1つだけ選ぶ。',
  },
};

const STYLE_RESULT:Record<StyleId,{primary:string;secondary:string}>={
  DRIVE:{
    primary:'4属性の中ではDRIVEが最も前に出た。選択肢を比べるとき、「これで前に進めるか」「できることが増えるか」が相対的に判断材料になりやすい。単に金額が小さいだけより、次の行動につながる実感がある方に意味を感じやすい結果。',
    secondary:'4属性ではDRIVEが2番目。必要な場面では「この選択で前に進めるか」も補助的な評価軸になりうる。最優先ではなくても、最後のひと押しでは前進感が効きやすい。',
  },
  ENJOY:{
    primary:'4属性の中ではENJOYが最も前に出た。選択肢を比べるとき、「ちゃんと楽しめるか」「体験として満足できるか」が相対的に判断材料になりやすい。支出の意味を、金額だけでなく得られる満足まで含めて見やすい結果。',
    secondary:'4属性ではENJOYが2番目。必要な場面では「ちゃんと満足できるか」も補助的な評価軸になりうる。条件が近い選択肢なら、気持ちよく使える方が最後の差になりやすい。',
  },
  SECURE:{
    primary:'4属性の中ではSECUREが最も前に出た。選択肢を比べるとき、「あとで困りにくいか」「余白を残せるか」が相対的に判断材料になりやすい。得を最大化することより、納得できる安全ラインを守れるかが重要になりやすい結果。',
    secondary:'4属性ではSECUREが2番目。必要な場面では「あとで困りにくいか」も補助的な評価軸になりうる。最優先ではなくても、不安要素が残る選択には最後まで引っかかりやすい。',
  },
  OPTIMIZE:{
    primary:'4属性の中ではOPTIMIZEが最も前に出た。選択肢を比べるとき、「今の用途に合っているか」「余分がないか」が相対的に判断材料になりやすい。単純な安さより、必要なものにきれいに配分できている感覚を重視しやすい結果。',
    secondary:'4属性ではOPTIMIZEが2番目。必要な場面では「余分がないか」「今の用途に合っているか」も補助的な評価軸になりうる。条件が近い時ほど、無駄なく整理できる方が最後の差になりやすい。',
  },
};

const STYLE_WORD:Record<StyleId,string>={DRIVE:'前進',ENJOY:'満足',SECURE:'安心',OPTIMIZE:'最適化'};
const STYLE_QUESTION:Record<StyleId,string>={
  DRIVE:'これで前に進めるか',
  ENJOY:'ちゃんと満足できるか',
  SECURE:'あとで困りにくいか',
  OPTIMIZE:'今の用途に合っているか',
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
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '先の予定も、今得られる機会も、どちらも強く判断に入れる。未来のために今を全部抑えるわけでも、今だけを優先するわけでもなく、両方を残したまま決めやすい。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '先の予定と今の機会のどちらも、単独では強い判断基準になっていない。時間軸だけで決めるより、用途・納得感・安心など別の条件まで含めて決める余地が大きい結果。';
    if(state==='BALANCED')return '先の予定と今の機会がかなり拮抗。将来か現在かを先に固定せず、その場の条件を見ながら両方を残して決めやすい。';
    if(dominant==='F')return state==='CLEAR'?'先の予定や余裕への影響を、今の判断にかなり強く織り込みやすい。目の前で払えるかだけでなく、その選択をした後に予定していることへどれくらい余白が残るかまで見やすい。':'先の予定や余裕への影響を、今の判断にやや多めに織り込みやすい。今の魅力も見つつ、先への影響が大きい時は一度立ち止まって考えやすい。';
    return state==='CLEAR'?'今得られる機会や便益を、判断にかなり強く取り込みやすい。先のことを考えないという意味ではなく、「今この選択をする意味」がはっきりしているほど判断材料として重くなりやすい。':'今得られる機会や便益を、判断にやや多めに取り込みやすい。先への影響も残しながら、今得られる価値をやや優先しやすい。';
  }
  if(axis==='DECISION'){
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '比較・整理と、しっくり感・違和感の両方を強く使う。数字だけ、感覚だけに寄せず、「条件として納得できるか」と「自分に合うか」の両方がそろうと決めやすい。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '比較・整理と、しっくり感・違和感のどちらも強く出ていない。決め方を一方に固定するより、場面ごとに別の条件を使う余地が大きい結果。';
    if(state==='BALANCED')return '比較して考える力と、自分の感覚を使う力がかなり拮抗している。数字で筋が通っていても感覚に違和感があれば残りやすく、逆も同じ。';
    if(dominant==='D')return state==='CLEAR'?'比較・整理・確認を、判断根拠としてかなり強く使いやすい。選択肢が複数ある時ほど、違いを言葉や条件にして並べられると納得して進みやすい。':'比較・整理・確認を、判断根拠としてやや多めに使いやすい。感覚も使うが、迷う場面では一度条件を並べることで決めやすくなる。';
    return state==='CLEAR'?'しっくり感や違和感を、判断根拠としてかなり強く使いやすい。条件が整っていても自分の中で引っかかると、その違和感を無視せず最後まで判断材料に残しやすい。':'しっくり感や違和感を、判断根拠としてやや多めに使いやすい。比較材料も見るが、最後は自分に合うかどうかが判断を動かしやすい。';
  }
  if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '普段から現在地をつかむ感覚も、節目で確認する習慣も両方強い。なんとなく把握するだけでも、節目だけ見るだけでもなく、2つの把握方法を併用しやすい。';
  if(state==='BALANCED'&&absolute==='LOW_LOW')return '普段からの把握と、決まった節目での確認のどちらも強く出ていない。把握方法を一方に固定するより、必要な場面で必要な情報を見る余地が大きい結果。';
  if(state==='BALANCED')return '普段からの把握と、節目での確認がかなり拮抗している。普段の感覚も持ちつつ、意味のあるタイミングでは改めて確認する形が自然。';
  if(dominant==='M')return state==='CLEAR'?'普段から残りや支出ペースなど、お金の現在地をかなりつかみやすい。毎回細かく記録していなくても、「今どのくらいの位置にいるか」を判断材料として持ちやすい。':'普段から残りや支出ペースなど、お金の現在地をややつかみやすい。必要な時だけ確認するより、普段の感覚が判断の土台になりやすい。';
  return state==='CLEAR'?'給料日・支払日・予定など、意味のある節目で確認する傾向がかなり強い。ずっと見続けるより、「ここで見る」と決めた時に状況を整理し直す方が自然。':'給料日・支払日・予定など、意味のある節目で確認する傾向がやや強い。普段の把握も残るが、重要な判断は節目で見直すと整いやすい。';
}

function axisTitle(axis:AxisId){
  if(axis==='TIME')return '時間視野';
  if(axis==='DECISION')return '判断根拠';
  return '把握リズム';
}

function shortAxisClause(axis:AxisId,state:BalanceState|null,absolute:AbsoluteState|null,dominant:AxisPole|null){
  if(state==='BALANCED'){
    if(absolute==='HIGH_HIGH')return axis==='TIME'?'未来と今を両方重く見る':axis==='DECISION'?'比較と感覚を両方使う':'普段把握と節目確認を両方使う';
    if(absolute==='LOW_LOW')return axis==='TIME'?'未来か今だけでは決めない':axis==='DECISION'?'比較か感覚だけでは決めない':'把握方法を固定しすぎない';
    return axis==='TIME'?'未来と今をほぼ同じに見る':axis==='DECISION'?'比較と感覚がかなり拮抗':'普段把握と節目確認がかなり拮抗';
  }
  if(axis==='TIME')return dominant==='F'?'先への影響を先に見る':'今得られる価値を先に見る';
  if(axis==='DECISION')return dominant==='D'?'比較して筋を通す':'しっくり感を残して決める';
  return dominant==='M'?'普段から現在地をつかむ':'節目で財布を確認する';
}

function headline(evaluation:EngineEvaluation,primary:StyleId,secondary:StyleId){
  const t=evaluation.axes.TIME;
  const d=evaluation.axes.DECISION;
  const a=evaluation.axes.AWARENESS;
  return `${shortAxisClause('TIME',t.balanceState,t.absoluteState,t.dominant)}。${shortAxisClause('DECISION',d.balanceState,d.absoluteState,d.dominant)}。${shortAxisClause('AWARENESS',a.balanceState,a.absoluteState,a.dominant)}。4属性は「${STYLE_WORD[primary]}」→「${STYLE_WORD[secondary]}」の順。`;
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
  const strength=`${base.strength} さらに今回の4属性では「${STYLE_WORD[primary]}」が先頭なので、選択肢を見た時に「${STYLE_QUESTION[primary]}」まで含めて判断しやすい。`;
  return {
    version:MONEY_RESULT_CONTENT_VERSION,
    headline:headline(evaluation,primary,secondary),
    summary:`${strength} ${STYLE_RESULT[primary].primary}`,
    weapon:base.weapon,
    strength,
    blindSpot:base.blindSpot,
    strategy:base.strategy,
    oneAction:base.oneAction,
    primaryStyleLine:STYLE_RESULT[primary].primary,
    secondaryStyleLine:STYLE_RESULT[secondary].secondary,
    axisInsights,
  };
}
