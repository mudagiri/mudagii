import type { Category, CategoryResult } from './mudagiri-diagnosis-v2';
import type { FutureGoal } from './result-payload-v2';
import type { ToneMode } from './tone-mode-v3';
import { FULL_LINE_REPORT } from './line-report-full-v2';

export type TaskState='todo'|'done';
export interface PostLineTask { category:Category; tier:'SELF_ACTION'|'CHECK'|'SPECIALIST_REVIEW'; state:TaskState; title:string; firstAction:string; }
export interface PostLineFunnelInput { categories:CategoryResult[]; needsReview:Category[]; unknownCategories?:Category[]; futureGoal?:FutureGoal; toneMode:ToneMode; completed?:Category[]; }

const goalMeeting:Record<FutureGoal,string>={
 investment:'家計の余白を、いくら残して・いくら資産形成へ回せるか整理する',
 travel:'旅行を我慢せずに続けられる予算の作り方を整理する',
 home:'住居費と今後の住まいに使える予算を整理する',
 children:'教育・子どもの将来資金を、時期と金額から逆算する',
 hobby:'好きなことを削らずに続けるための予算を整理する',
 saving:'まず現金でどこまで安心を作るか整理する',
 other:'本当に使いたいことへ回せる家計の余白を整理する'
};

export function buildPostLineFunnel(i:PostLineFunnelInput){
 const completed=new Set(i.completed??[]), unknown=new Set(i.unknownCategories??[]), review=new Set(i.needsReview);
 const actionable=i.categories.filter(x=>x.reducible>0).map(x=>x.category);
 const relevant=[...new Set<Category>([...actionable,...i.needsReview,...(i.unknownCategories??[])])];
 const tasks:PostLineTask[]=relevant.map(category=>{
   const r=FULL_LINE_REPORT[category];
   return {category,tier:r.tier,state:completed.has(category)?'done':'todo',title:r.headline,firstAction:unknown.has(category)?'まず毎月の支払額・契約名を確認する':r.firstAction};
 });
 const self=tasks.filter(t=>t.tier==='SELF_ACTION');
 const unresolved=tasks.filter(t=>t.state==='todo' && (t.tier==='SPECIALIST_REVIEW'||review.has(t.category)||unknown.has(t.category)));
 const done=tasks.filter(t=>t.state==='done').length;
 const meetingReason=i.futureGoal?goalMeeting[i.futureGoal]:'金額だけでは判断できない項目を、目的と契約内容から仕分ける';
 const title=i.toneMode==='gentle'?'一人で判断しづらいところだけ、一緒に確認できます。':i.toneMode==='hell'?'☠️ 小物を倒して満足するな。まだ要鑑定が残ってる。':'自分で斬れるところは出した。残りを仕分ける。';
 return {tasks,progress:{done,total:tasks.length,percent:tasks.length?Math.round(done/tasks.length*100):100},selfAction:self,unresolved,meeting:{show:unresolved.length>0,title,reason:meetingReason,cta:`残った${unresolved.length}体を鑑定する`,duration:'30分 / オンライン',disclosure:'必要に応じて具体的なサービスや商品の選択肢をご案内する場合があります。不要な提案は断れます。'}};
}
