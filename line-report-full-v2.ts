import type { Category } from './mudagiri-diagnosis-v2';
import type { ActionTier } from './line-report-content-v2';

export interface FullLineReportContent { category:Category; tier:ActionTier; headline:string; why:string; firstAction:string; check:string[]; guardrail:string; consultation:string; }

export const FULL_LINE_REPORT:Record<Category,FullLineReportContent> = {
 mobile:{category:'mobile',tier:'SELF_ACTION',headline:'通信品質を落とさず、契約のムダだけ斬る',why:'通信費は「高いか」より、実際のデータ量・通話・端末代に対して契約が過剰かを見る項目です。',firstAction:'直近3か月のデータ使用量と請求内訳を開き、端末代と通信料を分ける。',check:['月間データ使用量','通話オプション','端末分割残高','家族割・セット割'],guardrail:'仕事用回線や通信品質への満足を犠牲にしてまで下げない。',consultation:'自分で比較できるため、原則セルフ改善。'},
 energy:{category:'energy',tier:'SELF_ACTION',headline:'我慢ではなく、契約と単価を見直す',why:'光熱費は季節・地域・住宅性能の影響が大きいため、使用量を責めず契約条件から確認します。',firstAction:'電気・ガスの直近12か月請求を確認し、使用量と単価を分けて見る。',check:['契約会社','料金プラン','契約アンペア/容量','セット契約','季節変動'],guardrail:'冷暖房を我慢する節約は推奨しない。生活品質を守る。',consultation:'契約比較で完結しやすいセルフ改善項目。'},
 sub:{category:'sub',tier:'SELF_ACTION',headline:'使っていない定額だけ即討伐',why:'サブスクは金額より利用頻度。使っているサービスは残し、忘れている契約だけ斬ります。',firstAction:'カード・Apple/Google・Amazon等の定期課金一覧を一度すべて並べる。',check:['30日以内に使ったか','同種サービスの重複','年払い更新日','無料期間終了'],guardrail:'頻繁に使い満足しているサービスは削らない。',consultation:'その場で解約判断できるセルフ改善項目。'},
 car:{category:'car',tier:'CHECK',headline:'車そのものではなく、持ち方のムダを見る',why:'車は地域・仕事・家族構成で必要性が大きく変わります。所有を否定せず維持費の中身を確認します。',firstAction:'ローン、保険、駐車場、燃料、整備を月額換算して分ける。',check:['年間走行距離','駐車場代','任意保険','ローン条件','利用目的'],guardrail:'生活必需品なら手放す前提にしない。',consultation:'高額なら条件を並べて個別チェック。'},
 food:{category:'food',tier:'CHECK',headline:'幸せな食費は守る。惰性だけ斬る',why:'食費はQOLと直結します。外食や食材への満足が高いなら、平均との差だけでムダ扱いしません。',firstAction:'「満足した食事」と「なんとなく買った食事」を1週間だけ分けて記録する。',check:['外食頻度','コンビニ頻度','デリバリー','廃棄','満足度'],guardrail:'好きな店・健康のための食費は守る。',consultation:'金額より行動パターンを一緒に確認する項目。'},
 daily:{category:'daily',tier:'SELF_ACTION',headline:'小さい固定化をまとめて発見',why:'日用品は1回の金額が小さく、重複購入や買い置きが見えにくい項目です。',firstAction:'ドラッグストア・ECの購入履歴を30日分だけ確認する。',check:['定期便','重複在庫','まとめ買い','衝動買い'],guardrail:'必要な衛生用品まで削らない。',consultation:'履歴確認だけで改善しやすいセルフ項目。'},
 fun:{category:'fun',tier:'CHECK',headline:'楽しい支出は守る。後悔する支出だけ斬る',why:'娯楽・交際費は人生の満足度そのもの。高額でも価値があるならムダではありません。',firstAction:'直近1か月の支出を「また払いたい / どちらでも / 後悔」の3つに分ける。',check:['満足度','惰性の飲み会','衝動課金','付き合い支出','月予算'],guardrail:'人間関係や趣味を機械的に削らない。',consultation:'本人の価値観を基準にチェック。'},
 beautyFashion:{category:'beautyFashion',tier:'CHECK',headline:'自信につながる支出は守る',why:'美容・服飾は自己表現や仕事にも関係します。使用頻度と満足度の低い購入だけを探します。',firstAction:'直近3か月の購入を「よく使う / 眠っている」に分ける。',check:['着用頻度','美容施術の満足','セール買い','似た商品の重複'],guardrail:'自信や仕事に寄与する支出を一律に削らない。',consultation:'高額・継続契約だけ個別チェック。'},
 rent:{category:'rent',tier:'CHECK',headline:'家賃比率だけで引っ越し判定しない',why:'住居費は立地、通勤、広さ、安全性、家族構成を含むため、平均だけでは判断できません。',firstAction:'家賃だけでなく通勤時間・交通費・在宅環境まで含めて現在の価値を書き出す。',check:['手取り比率','更新時期','通勤時間','広さ','住環境満足度'],guardrail:'安さだけを理由に住環境を悪化させない。',consultation:'更新・転居のタイミングなら個別比較。'},
 insurance:{category:'insurance',tier:'SPECIALIST_REVIEW',headline:'保険料だけでは絶対に斬らない',why:'必要保障は家族、収入、資産、住宅ローン、公的保障で変わります。月額だけで過不足は判断できません。',firstAction:'保険証券・設計書を集め、保障内容と期間を一覧にする。',check:['死亡保障','医療保障','就業不能','貯蓄性','保障期間','重複'],guardrail:'内容確認前の解約はしない。',consultation:'保障目的と公的保障まで含めて専門確認する。'},
 childEducation:{category:'childEducation',tier:'SPECIALIST_REVIEW',headline:'教育費は「高い」ではなく目的から逆算',why:'年齢、学校区分、進路希望、習い事で必要額が大きく違います。平均超過だけでムダ判定しません。',firstAction:'子どもの年齢と希望進路、現在の教育費を時系列で並べる。',check:['学校区分','進学希望','習い事','積立状況','教育資金の時期'],guardrail:'教育機会を削ることを改善とは扱わない。',consultation:'必要時期と資金準備を専門確認。'},
 selfDevelopment:{category:'selfDevelopment',tier:'SPECIALIST_REVIEW',headline:'自己投資は成果と目的で判定',why:'資格・スクール・コミュニティは将来価値があり得るため、金額だけでは判定不能です。',firstAction:'各支出について「何を得るためか」「いつまでに使うか」を1行で書く。',check:['目的','利用頻度','期限','成果指標','類似サービス'],guardrail:'将来の収入や成長につながる支出を短期節約だけで切らない。',consultation:'高額契約や目的が曖昧な場合のみ個別確認。'}
};

export function getFullLineReport(category:Category){ return FULL_LINE_REPORT[category]; }
