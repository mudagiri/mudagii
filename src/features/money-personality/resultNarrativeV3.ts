import type {AxisId,AxisPole,EngineEvaluation,JobCode,StyleId} from './classifierV1';
import type {MoneyResultExperienceV2,ResultPatternLine} from './resultExperienceV2';

/**
 * Narrative-only refinement for the public result.
 * The classifier is untouched. This layer translates relative direction +
 * absolute strength into human language so a low/low axis is never described
 * as a "strong" preference merely because the gap is clear.
 */

const TYPE_PRIMARY_HOOK:Record<JobCode,Record<StyleId,string>>={
  FDM:{
    DRIVE:'先の予定は守る。でも、前に進むためなら今もちゃんと使える。',
    ENJOY:'先の予定は崩したくない。でも、楽しむべき時まで我慢する気はない。',
    SECURE:'先の余白が見えていると、安心して今の一手を選べる。',
    OPTIMIZE:'先まで見たうえで、必要なところだけにきれいに使いたい。',
  },
  FDP:{
    DRIVE:'ずっと管理するより、節目で作戦を立て直して前へ進みたい。',
    ENJOY:'先は考える。でも楽しむ時は楽しむ。見直すのは節目でいい。',
    SECURE:'節目ごとに確認して、「この先も大丈夫」を作っておきたい。',
    OPTIMIZE:'普段は細かく触らず、節目でムダをまとめて整える方が合う。',
  },
  FNM:{
    DRIVE:'先を見ながら動く。でも最後の違和感は置き去りにしない。',
    ENJOY:'先のことも考える。でも「楽しめるか」はちゃんと残したい。',
    SECURE:'数字で先を確認して、最後は「これなら安心できるか」で決めたい。',
    OPTIMIZE:'先の見通しは持つ。でも余分かどうかは自分の感覚でも見抜きたい。',
  },
  FNP:{
    DRIVE:'目的地は決める。進み方は、その時いちばん前に進める方へ変える。',
    ENJOY:'行き先はある。でも途中まで我慢だらけの旅にはしたくない。',
    SECURE:'未来は見たい。でも道中は安心できる範囲で柔軟に進みたい。',
    OPTIMIZE:'ゴールは決める。ルートは、その時いちばん無理のない方へ変える。',
  },
  IDM:{
    DRIVE:'今使うなら、前に進む実感があるものを選びたい。',
    ENJOY:'節約したいわけじゃない。使うなら、ちゃんと満足できるものに使いたい。',
    SECURE:'使ってもいい。でも、あとで困らない線は越えたくない。',
    OPTIMIZE:'使うところは使う。でも、意味の薄い支出は残したくない。',
  },
  IDP:{
    DRIVE:'今いちばん効く一手を選び、次の節目でまた狙い直す。',
    ENJOY:'今楽しめる選択肢を比べて、満足度の高い方を狙いたい。',
    SECURE:'今のベストは選びたい。でも次の節目まで困らない余白は残したい。',
    OPTIMIZE:'今いちばんムダの少ない一手に絞って、節目でまた見直す。',
  },
  INM:{
    DRIVE:'今の自分に合っていて、前に進めるなら動きやすい。',
    ENJOY:'今の自分がちゃんと楽しめるか。そこはお金を使う理由になる。',
    SECURE:'今の感覚は大事。でも、安心できない使い方には乗りにくい。',
    OPTIMIZE:'今の自分に必要かどうかを、かなり感覚的に見分けたい。',
  },
  INP:{
    DRIVE:'今の流れで動き、節目が来たら次に進む方向を決め直す。',
    ENJOY:'普段は自由に楽しむ。必要な時だけ財布を見て構え直す。',
    SECURE:'普段は縛りすぎない。でも節目では安心できる状態に戻したい。',
    OPTIMIZE:'普段は自由。節目が来たら余分を整理して身軽に戻したい。',
  },
};

function scoreLabel(score:number|null){
  if(score===null)return '不明';
  if(score>=80)return 'かなり強い';
  if(score>=65)return '強い';
  if(score>=45)return '中くらい';
  if(score>=30)return 'やや弱い';
  return '弱い';
}

function poleWord(pole:AxisPole|null){
  if(pole==='F')return '未来寄り';
  if(pole==='I')return '今寄り';
  if(pole==='D')return '比較寄り';
  if(pole==='N')return '感覚寄り';
  if(pole==='M')return '普段把握寄り';
  if(pole==='P')return '節目確認寄り';
  return 'ほぼ半々';
}

function axisBadge(e:EngineEvaluation,axis:AxisId){
  const x=e.axes[axis];
  if(x.absoluteState==='LOW_LOW')return `${poleWord(x.dominant)} / 両方弱め`;
  if(x.absoluteState==='HIGH_HIGH')return `${poleWord(x.dominant)} / 両方強い`;
  if(x.balanceState==='BALANCED')return 'ほぼ半々';
  return x.balanceState==='LEAN'?`やや${poleWord(x.dominant)}`:`${poleWord(x.dominant)}・明確`;
}

function timePattern(e:EngineEvaluation){
  const x=e.axes.TIME;const future=x.scoreA;const now=x.scoreB;
  if(x.absoluteState==='LOW_LOW'){
    const relative=x.dominant==='F'?'二択なら未来寄り':x.dominant==='I'?'二択なら今寄り':'ほぼ同じ';
    return `「先のため」と「今しかない」のどちらも、単独では強い決め手になっていない。${relative}だけど、時間軸そのものより「その支出に意味があるか」の方が判断を動かしやすい。`;
  }
  if(x.absoluteState==='HIGH_HIGH'){
    return `先の予定も今得られる価値も、どちらもかなり判断に入る。${poleWord(x.dominant)}ではあるけれど、片方を捨てるより「今も満たして、先も壊さない」着地点を探しやすい。`;
  }
  if(x.balanceState==='BALANCED')return '先の予定と今得られる価値がほぼ半々。将来か現在かを先に固定せず、その場の条件を見ながら両方を残して決めやすい。';
  if(x.dominant==='F')return `未来を考える力は${scoreLabel(future)}。目の前で払えるかだけでなく、この選択のあとに予定や余白がどう残るかを見てから決めやすい。`;
  return `今を活かす力は${scoreLabel(now)}。先を無視するというより、「今このお金を使う意味があるか」がはっきりすると判断が前に進みやすい。`;
}

function decisionPattern(e:EngineEvaluation){
  const x=e.axes.DECISION;const compare=x.scoreA;const intuition=x.scoreB;
  if(x.absoluteState==='LOW_LOW')return `比較と感覚のどちらも、単独では強い決め手になっていない。${poleWord(x.dominant)}ではあるけれど、用途・満足・安心など別の条件が最後の一押しになりやすい。`;
  if(x.absoluteState==='HIGH_HIGH')return '比較して筋を通す力も、「なんか違う」を拾う感覚も両方かなり強い。条件として納得できて、自分にも合う時に一番気持ちよく決めやすい。';
  if(x.balanceState==='BALANCED')return '比較して考えることと、自分のしっくり感がほぼ半々。数字で筋が通っていても違和感が残れば気になりやすく、逆も同じ。';
  if(x.dominant==='D'){
    const extra=intuition!==null&&intuition>=50?'。ただ、感覚も弱くないので「数字上は正しいけど自分には違う」は残りやすい':'';
    return `比較して考える力は${scoreLabel(compare)}。候補が複数あるほど、違いを並べて「なぜこっちか」を自分で説明できると決めやすい${extra}。`;
  }
  const extra=compare!==null&&compare>=50?'。ただ、比較する力も残っているので「なんとなく好き」だけでは終わらせにくい':'';
  return `感覚を信じる力は${scoreLabel(intuition)}。条件が整っていても違和感が残ると無視しにくく、最後は「自分に合うか」が判断を動かしやすい${extra}。`;
}

function awarenessPattern(e:EngineEvaluation){
  const x=e.axes.AWARENESS;const daily=x.scoreA;const periodic=x.scoreB;
  if(x.absoluteState==='LOW_LOW')return '普段ずっと見ることにも、決まった節目だけで見ることにも強く固定されていない。必要な時に必要な情報を取りにいく方が自然。';
  if(x.absoluteState==='HIGH_HIGH')return '普段から現在地をつかむ感覚も、節目で確認し直す習慣も両方強い。日常の感覚と、意味のあるタイミングでの再確認を併用しやすい。';
  if(x.balanceState==='BALANCED')return `普段から把握する力は${scoreLabel(daily)}、節目で確認する力は${scoreLabel(periodic)}でほぼ互角。「ずっと管理」でも「節目だけ」でもなく、その中間が自然。`;
  if(x.dominant==='M')return `普段から把握する力は${scoreLabel(daily)}。毎回細かく記録しなくても、「今どのくらいの位置にいるか」を日常の判断材料として持ちやすい。`;
  return `節目で確認する力は${scoreLabel(periodic)}。ずっと見続けるより、給料日・支払日・大きな予定など「ここで見る」というタイミングで整理し直す方が自然。`;
}

function pattern(e:EngineEvaluation,axis:AxisId):ResultPatternLine{
  if(axis==='TIME')return {title:'お金を使うタイミング',badge:axisBadge(e,axis),text:timePattern(e)};
  if(axis==='DECISION')return {title:'お金の決め方',badge:axisBadge(e,axis),text:decisionPattern(e)};
  return {title:'お金の見方',badge:axisBadge(e,axis),text:awarenessPattern(e)};
}

function headline(e:EngineEvaluation,primary:StyleId){
  const style=primary==='DRIVE'?'前に進めるか':primary==='ENJOY'?'ちゃんと満足できるか':primary==='SECURE'?'あとで困らないか':'今の用途に合っているか';
  const d=e.axes.DECISION;
  const decision=d.absoluteState==='LOW_LOW'?'決め方は場面ごと':d.balanceState==='BALANCED'?'比較と感覚を両方使う':d.dominant==='D'?'決める時は比較して筋を通す':'最後はしっくり感を残す';
  const t=e.axes.TIME;
  const time=t.absoluteState==='LOW_LOW'?'未来か今かは主役じゃない':t.balanceState==='BALANCED'?'未来と今を両方見る':t.dominant==='F'?'先への影響も見る':'今の価値を重く見る';
  return `まず「${style}」。${decision}。${time}。`;
}

export function refineMoneyResultExperienceV3(evaluation:EngineEvaluation,base:MoneyResultExperienceV2):MoneyResultExperienceV2{
  if(!evaluation.jobCode||!evaluation.style.primary)return base;
  return {
    ...base,
    heroLine:TYPE_PRIMARY_HOOK[evaluation.jobCode][evaluation.style.primary],
    headline:headline(evaluation,evaluation.style.primary),
    patterns:(['TIME','DECISION','AWARENESS'] as AxisId[]).map(axis=>pattern(evaluation,axis)),
  };
}
