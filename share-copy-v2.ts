import type { TypeCode } from './result-payload-v2';
import { getTypeContentV31 } from './type-content-v3.1';
export type ShareVariant='curiosity'|'identity'|'enemy';
export function buildShareText(args:{code:TypeCode;battleScore:number;fiveYear:number;topEnemyName?:string;privacy?:boolean;variant?:ShareVariant}){const {code,battleScore,fiveYear,topEnemyName,privacy=true,variant='curiosity'}=args;const t=getTypeContentV31(code);const money=privacy?'改善額はひみつ':`5年の推定改善余地 ¥${new Intl.NumberFormat('ja-JP').format(Math.round(fiveYear||0))}`;const lead=variant==='enemy'&&topEnemyName?`最大のムダ敵は「${topEnemyName}」だった。`:variant==='identity'?t.catchphrase:t.shareHook;return `${lead}\n\nムダギリ診断 →「${t.name}」\n家計バトルスコア ${battleScore}/100\n${money}\n\n高いだけでは斬らない家計診断。\nあなたは何タイプ？\n#ムダギリ診断`}
