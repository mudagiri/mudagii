import type { Category } from './mudagiri-diagnosis-v2';
import type { FutureGoal } from './result-payload-v2';
import { getEnemyContent } from './enemy-content-v2';

export type ActionTier = 'SELF_ACTION'|'CHECK'|'SPECIALIST_REVIEW';
export interface LineAction { category:Category; tier:ActionTier; title:string; body:string; }

const tierByCategory:Record<Category,ActionTier> = {
  mobile:'SELF_ACTION', energy:'SELF_ACTION', sub:'SELF_ACTION', daily:'SELF_ACTION',
  food:'CHECK', fun:'CHECK', beautyFashion:'CHECK', car:'CHECK', rent:'CHECK',
  insurance:'SPECIALIST_REVIEW', childEducation:'SPECIALIST_REVIEW', selfDevelopment:'SPECIALIST_REVIEW'
};

export const GOAL_COPY:Record<FutureGoal,string> = {
  investment:'浮いたお金を将来の資産形成へ回す', travel:'我慢ではなく、次の旅行資金をつくる',
  home:'住まいの選択肢を増やす', children:'子どもの未来に使える余白をつくる',
  hobby:'好きなことに罪悪感なく使える予算をつくる', saving:'まず現金の安心を厚くする', other:'本当に使いたいことへお金を戻す'
};

export function buildLineActions(categories:Category[]):LineAction[]{
  return categories.map(category=>{
    const e=getEnemyContent(category); const tier=tierByCategory[category];
    return {category,tier,title:e.action,body:e.lineDetail};
  });
}

export function lineWelcomeText(typeName:string, monthly:number, fiveYear:number){
  const y=(n:number)=>new Intl.NumberFormat('ja-JP').format(Math.round(n||0));
  return `ムダギリ診断おつかれさま！\nあなたの称号は「${typeName}」。\n算定済みの推定改善余地は月${y(monthly)}円、5年で${y(fiveYear)}円。\n\nここでは①残りのムダ敵 ②自分でできる改善 ③内容確認が必要な項目を分けて見ていきます。\n※保険など、内容を見ないと判断できない項目はこの金額に含めていません。`;
}
