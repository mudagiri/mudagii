export type ChoiceStrength = 1|2;
export type TypeCodeV31='FPA'|'FPU'|'FIA'|'FIU'|'VPA'|'VPU'|'VIA'|'VIU';
export type AxisV31='fv'|'pi'|'au';
export const TYPE_MODEL_VERSION='TYPE_MODEL_V3_1_8' as const;

type Choice={text:string; dir:1|-1};
type Q={id:string;prompt:string;axis:AxisV31|`cross_${string}`;a:Choice;b:Choice};

export const TYPE_QUESTIONS_V31:readonly Q[]=[
{id:'q1',axis:'fv',prompt:'予定外で10万円入った。いちばん自然なのは？',
 a:{text:'前からやりたかったことに使う',dir:-1},b:{text:'いったん将来用に残す',dir:1}},
{id:'q2',axis:'pi',prompt:'3万円くらいの買い物。決め方はどっちに近い？',
 a:{text:'候補を比べてから決める',dir:1},b:{text:'見た瞬間の「これだ」で決める',dir:-1}},
{id:'q3',axis:'au',prompt:'毎月のお金の流れ、頭の中では？',
 a:{text:'細かく見なくても、だいたいの全体像はつかんでいる',dir:1},b:{text:'必要なときに見れば分かるので、普段はあまり意識しない',dir:-1}},
{id:'q4',axis:'fv',prompt:'自由に使える3万円が残った月。うれしいのは？',
 a:{text:'来月以降の選択肢が増えること',dir:1},b:{text:'今月の楽しみが一つ増えること',dir:-1}},
{id:'q5',axis:'pi',prompt:'旅行や大きめの買い物をするときは？',
 a:{text:'行きたい・欲しいが先。金額はあとで調整する',dir:-1},b:{text:'使う範囲を決めて、その中から選ぶ',dir:1}},
{id:'q6',axis:'au',prompt:'カード明細を見るタイミングは？',
 a:{text:'必要があるときや請求が来たときに見る',dir:-1},b:{text:'特に用がなくても、ときどき見る',dir:1}},
{id:'q7',axis:'cross_fv_pi',prompt:'欲しいものがある。でも今月の予定には入っていない。近いのは？',
 a:{text:'満足度が高そうなら、予定を組み替えて買う',dir:-1},b:{text:'次の予算に入れてから買う',dir:1}},
{id:'q8',axis:'cross_pi_au',prompt:'新しい定額サービスを始めるときは？',
 a:{text:'まず使ってみて、必要ならあとで整理する',dir:-1},b:{text:'料金や条件を見てから始める',dir:1}},
] as const;

export type RawAnswerV31={choice:'a'|'b';strength:ChoiceStrength};
export type TypeAnswersV31=Partial<Record<string,RawAnswerV31>>;

export function scoreTypeAnswersV31(ans:TypeAnswersV31){
 const signed=(id:string)=>{
   const q=TYPE_QUESTIONS_V31.find(x=>x.id===id)!; const r=ans[id];
   if(!r)return 0; return q[r.choice].dir*r.strength;
 };
 const fv=signed('q1')+signed('q4')+signed('q7')*.5;
 const pi=signed('q2')+signed('q5')+signed('q7')*.25+signed('q8')*.5;
 const au=signed('q3')+signed('q6')+signed('q8')*.5;

 // Exact zero is not silently treated as the "positive" trait.
 // Anchor question breaks the tie deterministically; UI labels it "ほぼ中間".
 const side=(score:number,anchor:number,pos:string,neg:string)=>
   score>0?pos:score<0?neg:(anchor>=0?pos:neg);
 const code=`${side(fv,signed('q1'),'F','V')}${side(pi,signed('q2'),'P','I')}${side(au,signed('q3'),'A','U')}` as TypeCodeV31;

 // "strength", not diagnostic accuracy/confidence.
 const strength={fv:Math.round(Math.abs(fv)/5*100),pi:Math.round(Math.abs(pi)/5.5*100),au:Math.round(Math.abs(au)/5*100)};
 const nearMiddle={fv:Math.abs(fv)<1,pi:Math.abs(pi)<1,au:Math.abs(au)<1};
 return {version:TYPE_MODEL_VERSION,code,axes:{fv,pi,au},strength,nearMiddle};
}
