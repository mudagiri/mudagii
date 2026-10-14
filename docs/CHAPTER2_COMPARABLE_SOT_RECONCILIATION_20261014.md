# 第2章 比較基準の正本引継ぎ・非劣化監査（2026-10-14）

> 状態：調査・不具合修正の記録。**最終データ契約そのものではない。**
> 対象：未マージの `design/chapter12-personality-household-answercheck-v1-20261012`、Draft PR #46。
> FROZEN基点：`a6ac415a118ed66cccdca805bca403f047b92e30`（2026-09-30）。
> 9/30の `START_HERE.md` と9/28の正式12カテゴリExcelに仕様矛盾が見つかった。どちらも勝手に書き換えない。

## A. 根拠を失わないための区別

1. **歴史資料**：`Mudagiri_Reference_Data_V1.0_FINAL_FROZEN.xlsx` 等。単身者・複数人世帯の所得表と年齢表が存在した。旧の `Comparable -> Target -> Reducible` を現行の CONFIRMED saving と混ぜない。
2. **Runtime FROZEN**：2026-09-30 基点の `START_HERE.md` と `comparable-resolver-v1/v2.ts`。世帯年収500万円以上、複数人世帯の一部カテゴリに、公式統計から作った所得補正を適用する。単身者には適用しない（`comparable-resolver-v1.ts` に n=32/n=49 という薄い標本に関する理由が明記）。
3. **後継実装**：`mudagiri-profile-v4.ts` → `benchmark-router-v4.ts` → `final-judgement-v4.ts` → `result-view-model-v5.ts` → `ResultScreenChapter2V32.tsx`。
4. **回収済み最終契約**：Library `/ムダギリ診断/MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0.xlsx` の索引本文を確認。5タブ（MASTER_ENGINE / GLOBAL_RULES / CANONICAL_OWNER / FINAL_AUDIT / README）、V1.0/2026-09-28、12/12 FROZEN。コピー `(1)` `(2)` のバイト同一性は未確認。

## B. 12カテゴリ：比較の成立条件と不変原則

| カテゴリ | 現行比較元・属性 | 値の扱いと守る条件 |
|---|---|---|
| 通信 mobile | `COMMUNICATION_V1.0_DIRECT_BANDS`／回線種別・スマホ1回線か確認 | 全国平均を創作しない。家族分・固定回線・端末代とスマホ1回線を直接比較しない |
| 光熱 energy | 契約：単身年齢、複数は人数×地域×月。現行：複数のみ年収係数も追加 | 年収係数の適合性を確認。比較差は節約額にしない |
| サブスク sub | AUDIT、利用実態と解約可能性 | 未使用かつ確認できた停止可能額のみ CONFIRMED 改善機会。未解約を節約済みと言わない |
| 車 car | 通常AUDIT／V5は維持費のみ・18〜59歳に参考14,100円 | ローン・税金混合額を維持費参考と比べない。構造参考値は改善額に算入しない |
| 食費 food | **最終契約：所得五分位は参考のみ、人数基準へ所得係数乗算は禁止**。現行：複数へ乗算 | **P0衝突**。解決まで公開禁止。差額をムダ額化しない |
| 日用品 daily | 契約：単身年齢・複数人数。現行：複数へ年収係数も追加 | 属性クロスの根拠を確認。一時的上振れと継続的上振れを分ける |
| 娯楽 fun | 契約：年齢／人数の公式総額＋細品目監査、直接クロスがなければ推計禁止。現行：複数へ年収係数 | 属性クロスの根拠要確認。満足と価値判断を尊重 |
| 美容・服飾 beautyFashion | 単身:年代と条件付き性別、複数:年代別参考モデル | 個人の性別×年代表と世帯の年代別モデルを混同しない。日用品と重複計上しない |
| 住居 rent | `HOUSING_V2.0_PRIVATE_RENT_2023`／民営賃貸×都道府県、V5住宅ローン返済参考は複数人世帯×世帯主年代近似 | 本人負担と物件全体の返済を比較しない。公営賃貸や実家負担を民営家賃平均と比べない。住宅ローン参照は表示のみ |
| 保険 insurance | 2025個人年代別モデル／2024世帯別および年代・年収帯の別レンズ | 比較対象を個人と世帯で揃える。年収・年代を根拠なく混合平均にしない。保障内容・治療環境の見直しを別途促す |
| 子どもの教育 childEducation | `CHILD_EDUCATION_V1.1_CORRECTED`／子どもの人数・学校段階 | 子がいない人は対象外。進路の意向を尊重。平均との差は削減額にしない |
| 自己投資 selfDevelopment | AUDIT／目的・成果・惰性の本人回答 | 公式平均を捏造しない。目的ある支出を保護 |

注：公式表の直接観測値と複数表の補正済み参考値は別概念。現在の `confidence` と `comparisonQuality` が補正方式を十分に表すかは**残監査項目**。勝手に現行の閾値・V1 FROZEN 判定を変更しない。

## C. 確認済みの仕様差と判断

- 旧Excelには単身者の所得別表が存在する。一方で9/30の `comparable-resolver-v1.ts` と `qa-resolver-v2.ts` は、単身の所得補正を非適用とする。未実装と断定して旧表を自動復活させない。
- 9/30の `comparable-resolver-v2.ts` の単身・複数人世帯の費目配列、地域・月・年収補正ロジックは今回のDraftブランチに継承されていることをSHAと実コードで比較確認。
- V5では保険、住宅ローン、車の一部に、**判定・Potentialを変えない表示専用参考値**を追加する。
- `comparisonAmount=null`（比較母集団が不整合）から `diagnosisAmount` に黙ってフォールバックしない。
- `known=false`、`applicability='na'`、0円を別物として扱う。
- 性格JOB/STYLEの連携、敵12体、匿名ID・GAS分離、LINE、共有Privacyは別ゲートで確認する。

## D. 2026-10-14の修正

- `result-view-model-v5.ts`：住宅ローン参考値を世帯の返済総額とだけ照合し、個人負担・実家負担を排除。
- `ResultScreenChapter2V32.tsx`：住宅ローンの比較表示額を比較対象と一致。対象外の正式値 `na` を認識。美容・服飾の参考モデル母集団を一覧に明記。
- `qa-result-v5.ts`：個人負担のみ／世帯総額あり／実家負担の３条件を追加。
- `qa-chapter2-v32.ts`：V5の比較・判定QAを第2章画面QAから必須で呼び出す。美容・服飾の母集団表示も回帰テスト化。
- **本番マージなし、診断コアの判定式変更なし。**

## E. 次の公開ブロッカー（非劣化ゲート）

- [x] 最終12カテゴリExcelの索引本文・5タブ・FROZEN規則を確認。
- [ ] **P0：食費の所得係数乗算禁止と9/30実装の衝突を解決するまで本番マージ禁止**。
- [ ] 光熱・日用品・娯楽の年収係数について、正本の属性許可・母集団一致・出典を確認する。
- [ ] 属性固定で比較値のスナップショット検証：単身（全年齢境界）、複数世帯（人数2〜6）、年収500万円前後・800万円・上限、地域47都道府県、月1〜12、賃貸／持ち家、学校段階、保険個人／世帯。
- [ ] `qa:result-v5` と `qa:chapter2-v32` を同一HEADで実行し、Chrome/WebKit 8環境、Preview SHAを検証。
- [ ] データ保存（本体GASと性格GASの分離・匿名ID紐付け）/ LINEクリック→遷移→面談計測 / SNS共有に本人支出・収入・所在地を含まない確認。
- [ ] 年収補正した `DIRECT` 比較の表示ラベルが、ユーザーに「統計表の直接平均」と誤認されないか精査。

**原則：QA PASS は実行した項目についてだけ言う。架空プレビューの数値を本番統計の正本検証の代わりにしない。**

## F. 第1章→第2章の保存・CV監査（追記）

- **実装差を修復**：Chapter 1の8JOB/4STYLEが画面表示のみに残り、Chapter 2の診断保存／公式LINEリードには引継がれていなかった。新しい `chapter1-linkage-v1.ts` は匿名ID一致とJOB/STYLE/セッションIDの妥当性を検証し、診断スナップショット、再開用結果、LINE相談リードへ追加する。質問の回答、収入、家計金額、氏名はこのリンク情報に含めない。
- **分析の旧8タイプとの混同禁止**：現在の第2章 `MUDAGIRI_GAS_CODE_V4.gs` の `type_code/type_name` と画面集計用 `TYPES` は旧8タイプ前提。新しい8JOB × 4STYLE を旧タイプに見せかけて代入しない。確定したJOB/STYLEは既存 `raw_json` と `data_json` に保存されるが、**現行ダッシュボードにJOB/STYLE分布を表示する機能は未実装**。GASシートを無断変更しない。将来の集計は別途、匿名ID＋Chapter 1セッションIDを鍵にして読み取り専用で設計する。
- **相談経路の重複防止**：従来は同じ `diagnosisId` ＋手動引継ぎコードから生成した `leadId` が、ライフプラン相談と保障相談で同一になる。GASは同一 conversion_id の再保存を抑止するため、2件目のリード文脈が欠落し得た。`line-lead-id-v1.ts` は同じ診断・引継ぎコードのまま、`consult_route` と `coverage_review` を別IDとして永続化する。各経路の再タップは同じIDなので増殖しない。
- **用語統一**：`CHAPTER1_STYLE_NAMES.DRIVE` は正式語の「前進」。旧V2/V3/V31と現行V32の表記ゆれを防止。
- **実運用で未検証**：`persistence-v3.ts` の GAS POST は `no-cors` で結果を読めず、通信が成功しただけではサーバーの保存完了を証明できない。したがって本番のGAS受信・匿名ID結合・LINEからの面談連携は、実データによる送信先照会と照合が終わるまで未完了扱い。生の顧客情報を監査レポートに出さない。

追加回帰QA：`qa-chapter1-linkage-v1.ts`（匿名ID不一致、JOB/STYLE不正、復帰、内部リード保存、2相談経路の独立、再タップの冪等性）、`qa-chapter2-v32.ts` 経由で実行。

**重要**：ここまでのGitHubの検証はコード・疑似データの結果である。GAS側の実際の保存完了や、有効面談の成果まで成功と主張しない。

## G. 回収した最終正本とのP0矛盾（2026-10-14）

**証拠A**：`MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0.xlsx`（2026-09-28、5タブ・12/12 FROZEN）。MASTER_ENGINEの食費は「所得五分位は参考のみ」「所得係数を人数基準へ乗算しない」。GLOBAL_RULES G03「直接クロス表がない属性を掛け合わせない」、G07「母集団が違う統計を倍率補正で接続しない」、G12「推計値は観測値と区別」。娯楽は「直接クロスがなければ推計しない」。

**証拠B**：9/30 FROZEN `a6ac415a118ed66cccdca805bca403f047b92e30` と現行Draftの `comparable-resolver-v2.ts` では、複数人世帯の `energy` / `food` / `daily` / `fun` に `incomeFactor(category)` を乗算する。所得係数には統計出典があるが、人数別基準と同じ母集団の直接クロスであることは未証明。

これは10/14のV2.2画面改善で新規発生した変更ではなく、9/30 FROZEN実装時点に存在した矛盾。9/30の `START_HERE.md` は「カテゴリ正本で指定された場合に利用」と書くが、カテゴリ正本の食費は乗算禁止を明記。作成日だけで勝手に優先順位を決めない。

**公開ゲート**：年収別の統計データ自体は保持。食費をP0として保留し、energy/daily/funも直接クロス・属性許可・表示品質を調査。FROZEN数式の自動変更や過去のQA上書きはしない。既存UI/QAのSUCCESSは最終Excel正本への一致を証明しない。PR #46の本番マージは保留。

## H. 数値影響の並列評価・根拠の表示（2026-10-14）

3つの履歴を分けた：(A) 9/28 `MUDAGIRI_12CATEGORY_FINAL_DATA_CONTRACT_V1_0.xlsx` 食費の掛け算禁止とG03/G07/G12、(B) 同日 `MUDAGIRI_V3_0_12CATEGORY_ENGINE_SPEC_2026-09-28.csv` の `base × sqrt(income_factor × age_factor)` という別方針、(C) 9/30 `4d2cc8f…` で意図的にV1年収係数をV2人数基準へ復元。**BとCの計算も一致するとは限らない。** よって作成日の新旧だけで判断しない。

- `contract-benchmark-projection-v1.ts`：既存FROZEN式はそのまま実行し、もう一方に「人数別公式基準を維持してV1所得係数だけ外した値」を算出する**監査専用**の純関数を追加。診断エンジン・削減額・RPG判定・公開VMには接続しない。
- `qa-final-contract-projection-v1.ts`：47都道府県×4代表月（1,2,6,12）×世帯人数2〜6×年収4条件（0, 499.9万, 500万, 800万）＝**3,760プロフィール／15,040カテゴリ比較**でFROZEN式と契約投影式を照合。差分があること自体をP0として記録、データを失わない。
- `comparable-resolver-v2.ts`：年収補正を実行した4カテゴリに `meta.modelEstimate=true`、`crossTableObserved=false`、`contractStatus` を追記。**比較の金額は変更しない**。
- `result-view-model-v4.ts` と `ResultScreenChapter2V32.tsx`：属性別の**直接観測平均と誤認させない**ため「人数別基準×年収帯の推計（直接集計ではない）」「統計を組み合わせた推計値」を表示。診断に使う `ComparisonFactV4.quality` はFROZEN維持し、画面に使う `comparisonQuality` だけreferenceへ、かつ `comparisonModelEstimate=true` を伝える。
- `persistence-v4.ts`：比較品質とは別の `benchmarkMethod`（`income_cross_model`／`modeled_reference`／`direct_reference`／`none`）を追記し、正本・推計の出自をスナップショットのカテゴリ内に保存。GASシート列は変更しない。
- `qa-scope-v4.ts` と第2章V32のSSR検証に、年収補正の推計ラベル／保存メソッド／CORE数値が不変であることの検証を追加。

**結論**：9/28契約だけから、元の価値ある属性別統計データを破棄しない。9/30実装だけから「所得×人数の公表クロス表が存在する」とも断定しない。比較の正本政策はP0レビュー対象のまま。現時点の「数値が従来どおり」＝「統計規則に完全準拠」とは言わない。
