import type {AbsoluteState,AxisId,AxisPole,BalanceState,EngineEvaluation,JobCode,StyleId} from './classifierV1';

export const MONEY_RESULT_EXPERIENCE_VERSION='MUDAGIRI_MONEY_RESULT_EXPERIENCE_V2_PILOT' as const;

export const STYLE_JP:Record<StyleId,string>={
  DRIVE:'前進',
  ENJOY:'満足',
  SECURE:'安心',
  OPTIMIZE:'最適化',
};

export type ResultPatternLine={title:string;badge:string;text:string};
export type MoneyResultExperienceV2={
  version:typeof MONEY_RESULT_EXPERIENCE_VERSION;
  heroLine:string;
  headline:string;
  mudagiriLine:string;
  typeMeaning:string;
  weapon:string;
  strength:string;
  blindSpot:string;
  strategy:string;
  oneAction:string;
  styleSynthesis:string;
  patterns:ResultPatternLine[];
};

type TypeProfile={
  heroLine:string;
  typeMeaning:string;
  weapon:string;
  strength:string;
  blindSpot:string;
  strategy:string;
  oneAction:string;
};

const TYPE_PROFILE:Record<JobCode,TypeProfile>={
  FDM:{
    heroLine:'先の予定を守りながら、今の選択を比較して組み立てる。',
    typeMeaning:'「先回り」は、何でも我慢することではない。今使う前に「このあとに影響しないか」を見て、候補を比べてから決める。普段から財布の現在地もつかみやすいから、先の予定と今の選択をつなげて考えるタイプ。',
    weapon:'先回り設計',
    strength:'大きな支出や選択肢が多い場面でも、「何を守りたいか」が決まると判断を組み立てやすい。目の前の得だけでなく、その選択をしたあとにどれだけ余白が残るかまで見て選びやすい。',
    blindSpot:'比較できるからこそ、条件を増やしすぎると「結局どれが一番大事？」がぼやけやすい。全部を同じ重さで検討し始めると、判断に必要な情報まで増えやすい。',
    strategy:'最初に「絶対に守る条件」を1つ決める。その条件を満たす候補だけを比較すると、考える力がそのまま武器になる。',
    oneAction:'家計クエストでは、改善候補TOP1を「今月の負担」と「1年後の差」の2つで見る。',
  },
  FDP:{
    heroLine:'先は見る。でも毎日追いかけるより、節目で一気に作戦を組み直す。',
    typeMeaning:'先の予定を意識し、決める時は比較して考える。一方で、お金をずっと細かく追うより、給料日や大きな予定など「意味のあるタイミング」で見直す方が自然だからこのタイプ。',
    weapon:'節目の作戦会議',
    strength:'普段から管理で頭をいっぱいにしなくても、見るタイミングが来ると必要な情報を並べて整理しやすい。先の予定と今の条件を、節目ごとに作戦へ落とし込みやすい。',
    blindSpot:'見直すタイミングが決まっていないと、比較する力を使うきっかけ自体が曖昧になりやすい。何を見るかより、「いつ見るか」が抜けると持ち味が出にくい。',
    strategy:'給料日・月初・契約更新前など、自分にとって意味のある「作戦会議の日」を1つ決める。そこで見る項目も3つ程度に絞る。',
    oneAction:'家計クエストで見つけた改善候補に、「次に確認する日」を1つだけ決める。',
  },
  FNM:{
    heroLine:'先は考える。でも最後の「なんか違う」を置き去りにしない。',
    typeMeaning:'先の見通しも、普段の財布の現在地も見る。そのうえで、条件が整っていても自分の中に違和感が残るなら、その感覚も判断材料にするからこのタイプ。',
    weapon:'予兆キャッチ',
    strength:'数字だけで決め切らず、「条件は悪くないけど、何か引っかかる」を残せる。先の影響と今の現在地を見たうえで感覚を使えるので、数字と自分の納得感を両方持ちやすい。',
    blindSpot:'数字ではOKなのに感覚ではNO、またはその逆になった時、どちらを優先するか決めていないと判断が散りやすい。',
    strategy:'先に「ここだけは越えない」という数字の線を1つ置く。その線の中で最後に自分の違和感やしっくり感を見ると、両方を活かしやすい。',
    oneAction:'家計クエストの基準比較を見たあと、いちばん違和感のある1カテゴリだけ深掘りする。',
  },
  FNP:{
    heroLine:'目的地は先に置く。進み方は、その時の感覚で変える。',
    typeMeaning:'先の予定や目的地は意識する。でも途中の選び方まで最初から固定するより、その時の感覚と節目の確認で航路を調整する方が自然だからこのタイプ。',
    weapon:'航路変更力',
    strength:'ゴールを見失わずに、途中の条件が変わればやり方も変えられる。細かなルールを固定するより、「どこへ行きたいか」を持ったまま柔軟に進みやすい。',
    blindSpot:'守りたい未来が複数並ぶと、節目でどの方向へ航路を切るかが曖昧になりやすい。目的地が多いほど、今の優先順位が見えにくくなる。',
    strategy:'今いちばん守りたい予定を1つだけ置く。節目では「まだこの目的地で合ってる？」だけ確認して、必要なら航路を変える。',
    oneAction:'家計クエストへ進む前に、今いちばん守りたい未来の予定を1つだけ決める。',
  },
  IDM:{
    heroLine:'使うところは使う。削るところは削る。決め手は「自分が納得できるか」。',
    typeMeaning:'「メリハリ」は、何でも安くすることではない。今の状況を見て、候補を比べて、理由に納得できたものは残す。逆に、意味が薄いと感じるものは見直す。支出を全部同じ基準で扱わないからこのタイプ。',
    weapon:'納得配分',
    strength:'「高い・安い」だけで決めず、使ったあとに納得できるかまで見て線を引きやすい。価値があると思えば使えるし、逆に意味が薄いと感じたものは見直しやすい。',
    blindSpot:'満足・価格・用途・将来への影響など、比較する条件を増やしすぎると「結局、何を守りたいのか」がぼやけやすい。全部を同時に満たそうとすると判断が重くなる。',
    strategy:'最初に「これは守る支出」「これは見直していい支出」を分ける。そのあと、見直す側だけを比較すると、無理に全部を削らずにメリハリを作りやすい。',
    oneAction:'家計クエストでは、「守りたい支出」1つと「見直していい支出」1つを先に分ける。',
  },
  IDP:{
    heroLine:'今いちばん効く一手を比べて選び、節目で狙い直す。',
    typeMeaning:'目の前で使える選択肢を比較して、「今はここ」と狙いを決める。ずっと同じ対象を追うより、節目ごとに優先順位を見直して照準を合わせ直すからこのタイプ。',
    weapon:'ターゲット選定',
    strength:'候補がいくつかあっても、「今いちばん効くもの」が見えると判断しやすい。全部を一度に整えるより、優先順位をつけて1つずつ進める時に強みが出やすい。',
    blindSpot:'優先したいものが同時に複数並ぶと、比較はできても「次に動く1つ」が決まらず、照準が散りやすい。',
    strategy:'比較するのはTOP3まで、実際に動くのはTOP1だけにする。次の節目が来たら、そこでまた照準を合わせ直す。',
    oneAction:'家計クエストでは、最優先の改善候補TOP1だけにまず照準を合わせる。',
  },
  INM:{
    heroLine:'今の現在地を見ながら、最後は自分がしっくりくる方へ。',
    typeMeaning:'今使う意味を大事にしつつ、普段から財布の現在地もつかみやすい。そのうえで最後は「自分に合うか」「なんか違わないか」という感覚を残して決めるからこのタイプ。',
    weapon:'感覚と現在地の両立',
    strength:'今どのくらい使えるかを見ながら、自分が納得できる方を選びやすい。数字だけに寄せず、今の自分に合っているかまで含めて決められる。',
    blindSpot:'現在地と感覚だけでは決め切れない場面で、追加で何を確認するかが曖昧だと判断軸が散りやすい。情報を増やしすぎる必要はないが、「あと1つ何を見るか」はあると整いやすい。',
    strategy:'判断前に「このあとどれくらい余力が残るか」だけ確認する。そこが問題なければ、最後は自分のしっくり感を使う。',
    oneAction:'家計クエストでは、金額が大きい改善候補を1つだけ先に見る。',
  },
  INP:{
    heroLine:'今の感覚で動き、必要な節目で構えを整える。',
    typeMeaning:'今この瞬間の価値やしっくり感を判断に入れやすく、お金の確認はずっと続けるより意味のある節目で行う方が自然。状況に合わせて構えを変えるからこのタイプ。',
    weapon:'柔軟な構え',
    strength:'毎日同じルールで縛らなくても、必要なタイミングで見直して次の一手を選びやすい。今の条件や感覚に合わせて柔軟に動ける。',
    blindSpot:'節目ごとに見る基準まで毎回変わると、前回から何が変わったのかがつかみにくくなる。自由度が高いぶん、比較の基準を1つだけ固定した方が流れを追いやすい。',
    strategy:'節目で必ず見る数字を1つだけ決める。その数字を確認したあとで、今の自分に合う次の一手を選ぶ。',
    oneAction:'家計クエストの結果から、今日できるアクションを1つだけ選ぶ。',
  },
};

const STYLE_CORE:Record<StyleId,string>={
  DRIVE:'「これで前に進めるか」をまず見たい',
  ENJOY:'「ちゃんと満足できるか」をまず見たい',
  SECURE:'「あとで困らないか」をまず見たい',
  OPTIMIZE:'「今の用途に合っているか」をまず見たい',
};

const STYLE_PAIR:Record<StyleId,Partial<Record<StyleId,string>>>={
  DRIVE:{
    ENJOY:'前に進める使い方がまず大事。そのうえで、ちゃんと楽しめる・満足できるならさらに価値を感じやすい。成果だけでも楽しさだけでもなく、「前進できて、気持ちよく使える」がそろうと納得しやすい組み合わせ。',
    SECURE:'前に進めるかをまず見る一方で、あとで困りにくい余白も残したい。挑戦か安全かの二択ではなく、「進めるけど、戻れないほどは張らない」という形がしっくり来やすい組み合わせ。',
    OPTIMIZE:'前に進むために必要なら使う。ただし、成果につながらない余分は残したくない。「使うか削るか」の基準が、安さより“前進につながるか”になりやすい組み合わせ。',
  },
  ENJOY:{
    DRIVE:'満足できるかがまず大事。その体験や支出が次の行動につながると、さらに意味を感じやすい。「楽しいから使う」で終わらず、満足が前進にもつながると納得度が上がりやすい組み合わせ。',
    SECURE:'楽しめる・満足できることを大事にしつつ、あとで不安が残る使い方は気持ちよくない。「楽しむ」と「余白を残す」の両方が成立すると、安心して使いやすい組み合わせ。',
    OPTIMIZE:'安いから選ぶより、「使って満足できるか」が先。そのうえで「この出費は今の用途に合っているか」「余分はないか」も気になる。価値を感じるものには使う一方、満足につながらない余分は見直したくなる組み合わせ。',
  },
  SECURE:{
    DRIVE:'まずはあとで困りにくい余白を守りたい。その安全ラインが見えたうえで、前に進める使い方ならGOを出しやすい。「守るだけ」ではなく、守ったうえで動く形が自然な組み合わせ。',
    ENJOY:'まず安心できる余白を残したい。そのうえで、ちゃんと楽しめるか・満足できるかも大切。後悔しにくい範囲を作ってから楽しむと、気持ちよく使いやすい組み合わせ。',
    OPTIMIZE:'あとで困りにくい状態を作るために、今の用途に合っているか・余分がないかも確認したい。「安心のために整える」という方向に判断がまとまりやすい組み合わせ。',
  },
  OPTIMIZE:{
    DRIVE:'まず「今の用途に合っているか」「余分がないか」を見たい。そのうえで前進につながるなら、必要なものには使える。ムダを減らすこと自体より、必要なところへ資源を寄せる方がしっくり来やすい組み合わせ。',
    ENJOY:'まず余分がないか、今の用途に合っているかを確認したい。そのうえで、使うならちゃんと満足できるものを選びたい。「削るために削る」より、残した支出の満足度を上げる方が自然な組み合わせ。',
    SECURE:'まず余分を減らして整えたい。その結果として、あとで困りにくい余白も作りたい。「ムダを減らすこと」と「安心を残すこと」が同じ方向を向きやすい組み合わせ。',
  },
};

const STYLE_MUDAGIRI:Record<StyleId,Partial<Record<StyleId,string>>>={
  DRIVE:{
    ENJOY:'前に進めて、しかも楽しめる使い方が刺さりやすいんだな。',
    SECURE:'進みたい。でも、あとで詰むほどは張りたくないんだな。',
    OPTIMIZE:'前に進むためなら使う。でも、前進につながらない余分は気になるんだな。',
  },
  ENJOY:{
    DRIVE:'満足できるかが先。その満足が次の前進につながると、さらに強いんだな。',
    SECURE:'楽しみたい。でも、あとで不安が残る使い方は気持ちよくないんだな。',
    OPTIMIZE:'満足できるなら使う。でも、満足につながらない余分は残したくないんだな。',
  },
  SECURE:{
    DRIVE:'まず余白を守る。そのうえで前に進めるなら動きやすいんだな。',
    ENJOY:'安心できる範囲を作ってから、ちゃんと楽しみたいんだな。',
    OPTIMIZE:'安心を残すために、余分を整えておきたいんだな。',
  },
  OPTIMIZE:{
    DRIVE:'まず余分を整理して、必要なところにはちゃんと使いたいんだな。',
    ENJOY:'ムダは減らしたい。でも、残すならちゃんと満足できるものがいいんだな。',
    SECURE:'余分を減らして、あとで困りにくい形に整えたいんだな。',
  },
};

function badge(state:BalanceState|null,absolute:AbsoluteState|null,dominant:AxisPole|null){
  if(state==='BALANCED'){
    if(absolute==='HIGH_HIGH')return '両方かなり使う';
    if(absolute==='LOW_LOW')return 'どちらか一方では決めない';
    return 'ほぼ半々';
  }
  if(state==='LEAN')return dominant==='F'?'やや未来寄り':dominant==='I'?'やや今寄り':dominant==='D'?'やや比較寄り':dominant==='N'?'やや感覚寄り':dominant==='M'?'やや普段把握寄り':'やや節目確認寄り';
  return dominant==='F'?'未来寄り・かなり明確':dominant==='I'?'今寄り・かなり明確':dominant==='D'?'比較寄り・かなり明確':dominant==='N'?'感覚寄り・かなり明確':dominant==='M'?'普段把握寄り・かなり明確':'節目確認寄り・かなり明確';
}

function axisText(axis:AxisId,state:BalanceState|null,absolute:AbsoluteState|null,dominant:AxisPole|null){
  if(axis==='TIME'){
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '先の予定も、今しか得られない機会も、どちらも判断に強く入る。片方を捨てて決めるより、両方が成立する着地点を探しやすい。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '「未来のため」か「今のため」かだけでは決めにくい。用途・納得感・安心など、時間軸以外の条件が決め手になりやすい。';
    if(state==='BALANCED')return '先の予定と今得られる価値がほぼ半々。将来か現在かを先に固定せず、その場の条件を見て決める形が自然。';
    if(dominant==='F')return state==='CLEAR'?'目の前で払えるかより、「この選択をしたあと、先の予定にどれだけ余白が残るか」を強く見やすい。今の魅力があっても、先への影響が大きいと判断が変わりやすい。':'今の魅力も見るが、先の予定や余白への影響を少し多めに考えやすい。大きな影響がある時ほど、一度先まで見てから決めやすい。';
    return state==='CLEAR'?'「いつかのために今は抑える」より、今ここで得られる価値がはっきりしていると動きやすい。先を考えないわけではなく、“今使う意味があるか”が判断を大きく動かす。':'先への影響も見るが、今得られる価値を少し多めに重視しやすい。今使う意味がはっきりしていると、判断が前に進みやすい。';
  }
  if(axis==='DECISION'){
    if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '候補を比べて筋を通すことも、「なんか違う」という感覚も両方かなり使う。条件として納得できて、自分にも合う時にいちばん決めやすい。';
    if(state==='BALANCED'&&absolute==='LOW_LOW')return '比較だけ、感覚だけのどちらか一方では決めにくい。場面によって、用途・安心・満足など別の条件が最後の決め手になりやすい。';
    if(state==='BALANCED')return '比較して考えることと、自分のしっくり感がほぼ半々。数字で筋が通っていても違和感が残れば気になりやすく、逆も同じ。';
    if(dominant==='D')return state==='CLEAR'?'候補が複数あると、違いを並べて「なぜこっちか」を自分で説明できると決めやすい。感覚だけで押し切るより、理由に筋が通ることが納得につながりやすい。':'感覚も使うが、迷った時は条件を一度並べると決めやすい。「理由を言葉にできるか」が最後の整理に効きやすい。';
    return state==='CLEAR'?'条件が整っていても、自分の中に「なんか違う」が残ると、その違和感を無視しにくい。最後は“自分に合うか”が判断を大きく動かしやすい。':'比較材料も見るが、最後は自分のしっくり感を少し多めに使いやすい。条件が近いほど、違和感の有無が決め手になりやすい。';
  }
  if(state==='BALANCED'&&absolute==='HIGH_HIGH')return '普段から残高や支出ペースをつかむ感覚も、給料日や大きな支払いなどの節目で確認する習慣も両方使う。普段の感覚と節目の再確認を併用する形。';
  if(state==='BALANCED'&&absolute==='LOW_LOW')return '普段ずっと見ることにも、決まった節目で見ることにも強く固定されていない。必要な場面で必要な情報を取りにいく形になりやすい。';
  if(state==='BALANCED')return '普段から残高や支出ペースをなんとなく把握しつつ、給料日や大きな支払いなどの節目でも確認する。「ずっと管理」でも「たまにだけ見る」でもなく、その中間が自然。';
  if(dominant==='M')return state==='CLEAR'?'毎回細かく記録していなくても、普段から「今どのくらいの位置にいるか」をつかみやすい。必要な時だけ見るより、日常の感覚が判断の土台になりやすい。':'普段から残りや支出ペースを少し多めにつかみやすい。節目でも見るが、日常の現在地が判断のベースになりやすい。';
  return state==='CLEAR'?'ずっと見続けるより、給料日・支払日・大きな予定など「ここで見る」という節目で整理し直す方が自然。意味のあるタイミングで一気に現在地をつかみやすい。':'普段の感覚もあるが、重要な判断は節目で見直す方が整いやすい。見るタイミングがあると判断しやすい。';
}

function axisTitle(axis:AxisId){
  if(axis==='TIME')return 'お金を使うタイミング';
  if(axis==='DECISION')return 'お金の決め方';
  return 'お金の見方';
}

function timeShort(evaluation:EngineEvaluation){
  const x=evaluation.axes.TIME;
  if(x.balanceState==='BALANCED')return x.absoluteState==='HIGH_HIGH'?'未来も今も両方かなり見る':x.absoluteState==='LOW_LOW'?'未来か今だけでは決めない':'未来と今はほぼ半々';
  return x.dominant==='F'?'先への影響を先に見る':'今の価値を先に見る';
}
function decisionShort(evaluation:EngineEvaluation){
  const x=evaluation.axes.DECISION;
  if(x.balanceState==='BALANCED')return x.absoluteState==='HIGH_HIGH'?'比較も感覚も両方かなり使う':x.absoluteState==='LOW_LOW'?'比較か感覚だけでは決めない':'比較と感覚はほぼ半々';
  return x.dominant==='D'?'決める時は比較して納得する':'最後はしっくり感を残して決める';
}
function awarenessShort(evaluation:EngineEvaluation){
  const x=evaluation.axes.AWARENESS;
  if(x.balanceState==='BALANCED')return x.absoluteState==='HIGH_HIGH'?'普段も節目もよく確認する':x.absoluteState==='LOW_LOW'?'見るタイミングを固定しすぎない':'普段も節目もほどよく確認する';
  return x.dominant==='M'?'普段から現在地をつかむ':'節目でまとめて確認する';
}

export function buildMoneyResultExperienceV2(evaluation:EngineEvaluation):MoneyResultExperienceV2{
  if(!evaluation.complete||!evaluation.jobCode||!evaluation.style.primary||!evaluation.style.secondary){
    throw new Error('Money result experience requires a complete evaluation');
  }
  const job=evaluation.jobCode;
  const primary=evaluation.style.primary;
  const secondary=evaluation.style.secondary;
  const profile=TYPE_PROFILE[job];
  const styleSynthesis=STYLE_PAIR[primary][secondary]||`${STYLE_JP[primary]}をまず重視し、その次に${STYLE_JP[secondary]}も判断材料にしやすい。`;
  const mudagiriLine=STYLE_MUDAGIRI[primary][secondary]||`まず「${STYLE_JP[primary]}」、次に「${STYLE_JP[secondary]}」を見やすいんだな。`;
  const patterns=(['TIME','DECISION','AWARENESS'] as AxisId[]).map(axis=>{
    const x=evaluation.axes[axis];
    return {title:axisTitle(axis),badge:badge(x.balanceState,x.absoluteState,x.dominant),text:axisText(axis,x.balanceState,x.absoluteState,x.dominant)};
  });
  return {
    version:MONEY_RESULT_EXPERIENCE_VERSION,
    heroLine:profile.heroLine,
    headline:`${STYLE_CORE[primary]}。${timeShort(evaluation)}、${decisionShort(evaluation)}。お金は${awarenessShort(evaluation)}。`,
    mudagiriLine,
    typeMeaning:profile.typeMeaning,
    weapon:profile.weapon,
    strength:profile.strength,
    blindSpot:profile.blindSpot,
    strategy:profile.strategy,
    oneAction:profile.oneAction,
    styleSynthesis,
    patterns,
  };
}
