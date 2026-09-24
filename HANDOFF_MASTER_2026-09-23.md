> STATUS: Historical handoff/reference. Where this file conflicts with START_HERE.md, SOURCE_AUDIT_2026-09-23.md, or current runtime code, the newer files/runtime win.

# ムダギリ診断 — 完全引き継ぎマスター
更新: 2026-09-23

## 0. このファイルの目的
新しいChatGPTチャット / 開発者 / Codex に、このZIPをそのまま渡して開発を継続できる状態にする。
本ZIPには現時点でコンテナに存在する実装コード、QA、仕様書、GAS、DB将来設計、ページ画像、生成画像候補をまとめる。

## 1. 事業のゴール
SNS（Instagram / Threads）から無料の「ムダギリ診断」へ流入させ、診断完了→結果→Future Goal→LINE→詳細レポート→必要な人のみ作戦会議（面談）へ進める。
最終KPIは「有効面談 / 診断開始」。LINE登録そのものを最終目的にしない。
面談後の収益化候補は固定費見直し、保険見直し、資産形成/投資、不動産等。ただし診断画面では中立性・信頼性を優先し、過剰な販売感を出さない。

North Star分解:
SNS → diagnosis_started → diagnosis_completed → result_viewed → future_goal_selected → line_clicked → line_connected → appointment_cta_clicked → appointment_booked → valid_appointment

## 2. ブランド / UX原則
- サービス名: ムダギリ診断
- ゲーム世界観: QUEST / STAGE / 敵キャラ / 討伐
- ブランド思想: 「好きなものは、斬らない。ムダだけ、斬る。」
- 高い支出=ムダではない。本人の満足度/必要性と比較して過払い・惰性・未使用等を見つける。
- 16タイプは独自4軸。MBTI表記は使わない。
- キャラクター: 黄色いヒヨコ/アヒル系、赤ハチマキ、斧、黒いピクセル輪郭。人間勇者にしない。基本はマントなし。
- ビジュアル: high-detail Pixel-Chibi / 8–16bit inspired / saturated / bold near-black pixel outline。
- スマホ最優先。背景画像に動的コピーやCTAを焼き込まず、HTML/React側で重ねる。
- 匿名ブランド運営を優先。公開上は個人名を前面に出さない。法的表示は必要範囲。

## 3. 診断ロジック（V2）
正式カテゴリ12:
rent, mobile, energy, insurance, sub, car, food, daily, fun, beautyFashion, childEducation, selfDevelopment

Policy:
1. optimization: mobile, energy, sub
2. reference_guardrail: car, daily
3. lifestyle: food, fun, beautyFashion, rent
4. needs_review: insurance, childEducation, selfDevelopment

重要ルール:
- needs_reviewは自動でムダ金額を算出しない。5年改善余地から除外。
- lifestyleは高支出だけでムダ判定しない。
- verySatisfied lifestyle → reducible=0。
- Comparison差額 ≠ 削減可能額。
- 高い ≠ 要見直し ≠ 削減可能。
- fiveYear = monthlyReducible * 12 * 5。運用益を混ぜない。
- 表示名は「推定改善余地」。保証された節約額と表現しない。
- LINE登録状態で診断結果を変えない。

満足度係数:
waste=1 / inertia=.75 / satisfied=.30 / verySatisfied=0

代表ロジック:
- mobile: upper 4,000円、超過分×0.80、actionability 90
- energy: comparable×1.20超過分×0.60、actionability 70
- sub: min(actual, unusedAmount)、actionability 95
- car: comparable超過分×0.40、actionability 55
- daily: comparable×1.30超過分×0.40、actionability 60
- food/fun/beautyFashion: comparable超過分×カテゴリ率×満足度
- rent: review-only、自動reducible 0。comparable×1.25超でreview。rent/income>.35ならneedsReview/risk>=70
- 敵優先度: (reducible/monthly)*50 + actionability*.30 + risk*.20

BattleScore 100:
Savings35 + Balance15 + FixedEfficiency25 + Resilience25。負FCF、emergency<1等にpenalty。

## 4. 16タイプ
4軸: F/V 固定-変動、P/I 計画-衝動、A/U 自覚-無自覚、S/E 安心-楽しさ。
8問、各軸2問、回答 -2/-1/+1/+2。16タイプ全到達可能。

FPAS 鉄壁マネー要塞
FPAE QOL至上主義貴族
FPUS 安心契約の化石キーパー
FPUE 定額ぬるま湯住人
FIAS 安心契約コレクター
FIAE サブスク無限増殖マン
FIUS 安心契約ゾンビ
FIUE 流され課金スライム
VPAS 節約ガチ守護神
VPAE メリハリ消費の賢者
VPUS 穴あき家計の番人
VPUE ご褒美予算ブレイカー
VIAS 心配性ストッカー
VIAE 浪費自覚エンターテイナー
VIUS 無意識チリツモ魔
VIUE 感情課金バーサーカー

## 5. 公式12敵
1 mobile 通信ザウルス
2 energy 電気ウナギ魔人
3 sub サブスクサキュバス
4 car ムダカー
5 food クイダオーレ
6 daily チリツモコビト
7 fun アソビスギー
8 beautyFashion ミエハリーヌ
9 rent ヤチンダー
10 insurance ホケンミエナイダー
11 childEducation マナビンボー
12 selfDevelopment ジコトウシン

状態: encounter / defeated / escape。
needs_reviewカテゴリのdefeatedは「ムダだった」ではなく「整理・可視化できた」の意味。

## 6. 結果画面の推奨順序
1 title/type
2 BattleScore + satisfaction
3 HERO 推定改善余地（月/年/5年）
4 Future Goal
5 守った支出（protected spending）
6 Comparable差額 + disclaimer
7 優先敵
8 12 buckets
9 needsReview / 未討伐
10 LINE「討伐リスト保存」
11 Share（LINEより後）

FutureGoal:
investment | travel | home | children | hobby | saving | other
質問: 「この改善余地、何に変えたい？」

未討伐セクション:
「まだ終わりじゃない…」
「自動では判定できない項目が残っています」
保険・教育費・自己投資等を残敵として表示。
必ず「これはムダという意味ではない。保障内容や目的等を確認しないと判断できない」と説明。
CTAは「残りの討伐リストをLINEに保存」方向。

## 7. トーン
🌱 gentle = やさしめ斬り
⚔️ serious = 本気斬り（default）
🔥 hell = 地獄斬り
数値/判定は同じ。文言だけ変える。毒舌はユーザー人格ではなくムダ/敵へ向ける。

## 8. Reference / Comparable
Reference Engine V1.0 FROZEN
Comparable Reference V1.0 FROZEN
旧Diagnosis V1.x / Target Master = Legacy
現行 MUDAGIRI_DIAGNOSIS_ENGINE_V2.0

Comparableは2025年家計統計等を基にした独自調整比較値であり、「公式平均」と呼ばない。
ユーザー表示例:
「あなた 85,000円 / あなたに近い世帯 約61,000円 / 約24,000円高め」
注記:
「2025年総務省家計調査を基に、世帯・年齢・所得水準等を考慮したムダギリ独自比較値」

## 9. LINE / 面談
公式LINE: https://lin.ee/ZeLu7i6
LINE後の考え方:
SELF_ACTION: mobile, energy, sub, daily
CHECK: food, fun, beautyFashion, car, rent
SPECIALIST_REVIEW: insurance, childEducation, selfDevelopment

LINE内: greeting/result → self-action → progress → CHECK → SPECIALIST → FutureGoal → appointment CTA「ムダギリ作戦会議」→ 商業提案の透明性。
面談時間やオンライン等は未確定なのでハードコードしない。予約URLも未確定なので捏造しない。
V1はline_clickedまで。line_connectedはWebhook/LIFF等の将来実装が必要。

## 10. データ基盤 / 無料ローンチ構成
V1月額固定費0構成:
GitHub Pages → Google Apps Script Web App → Google Sheets → LINE

Sheets:
- Diagnoses
- DiagnosisCategories
- FunnelEvents
- Leads

GAS: MUDAGIRI_GAS_CODE_V1.gs
フロントadapter/永続化コードもZIP内参照。
将来はCentral API/Postgres/Supabaseへ移行可能な契約/SQLを同梱。

GASイベント:
diagnosis_started, diagnosis_completed, result_viewed, future_goal_selected, line_clicked, line_connected, appointment_cta_clicked, appointment_booked, valid_appointment, conversion

lead stages:
anonymous,line_connected,appointment_intent,booked,attended,qualified,won,lost

既知のGAS改善候補:
- upsertが全行scan → 初期V1は可、拡大時改善
- LockService未導入 → 同時書込race対策候補
- ブラウザ秘密鍵は置けないためpayload validation中心
- Benchmark集計tab/aggregationは未実装

## 11. ページ用画像 7点（public/assets/page）
- hero-key-visual.png
- battle-background.png
- encounter-vs.png
- result-victory-background.png
- future-goal-key-visual.png
- share-card-template.png
- unresolved-background.png

画像用途/配置は UX_VISUAL_WIRING_V1.md と MOBILE_VISUAL_IMPLEMENTATION_V1.md を参照。
Future Goal画像は過去版に赤マントがある可能性があり、厳密なキャラ統一では再生成候補。
未討伐画像は修正版を採用: マントなし、文字/LINE CTAを焼かずHTMLで動的表示。

## 12. 現時点の実装/QA状態（重要: 誇張禁止）
過去のコード側QAは38/38 PASSだったが、これはstatic/code QAであり、実ブラウザ/本番E2Eではない。
zero-cost release QAは10/10 PASSだった時点あり。
ただし以下は未完了/未検証:
- 実GAS /exec URL未設定
- 実Google Sheetsとのライブ接続未確認
- GitHub Pages未公開
- Central DB未接続
- 本番npm buildは依存取得環境の問題で未検証だった時点あり
- 実LINE友だち追加の追跡未実装
- 予約/valid appointmentのライブ連携未実装
- 実スマホブラウザE2E未完了

## 13. 公開前に必ず確認
1. package.json / package-lock / vite.config / src の実在と整合性を再確認
2. GitHub Pagesのproject-site base path対策。`/assets/...`のroot absolute参照を避ける。base:'./'等を検討。
3. GitHub Actionsがnpm ciならpackage-lock必須。なければ生成またはworkflow変更。
4. VITE_MUDAGIRI_GAS_URLに実際の/execを設定。
5. GASにLockService追加を検討。
6. privacy/terms/operator/contactを公開方針に合わせ確認。
7. 7枚のpage imageを実スマホcropで確認。
8. 12敵/ムダギリくんsprite群の実ファイル存在を再監査（過去生成した画像が全てprojectフォルダに保存されているとは限らない）。
9. LINE遷移、イベント保存、Future Goal保存、12カテゴリ保存を実データで確認。
10. 公開はコンテンツ完成→QA→公開の順。先に公開しない。

## 14. ZIP内の重要ドキュメント
- UX_VISUAL_WIRING_V1.md : 画像と導線の最終配線
- UX_JOURNEY_V2.md : ユーザージャーニー
- DESIGN_SYSTEM_V3.md : デザインシステム
- PRODUCTION_VISUAL_V1.md : 本番ビジュアル方針
- ASSET_MANIFEST_V1/V2.md : asset manifest
- MOBILE_VISUAL_IMPLEMENTATION_V1.md : mobile visual実装
- FINAL_COPY_PASTE_CHECKLIST_V1.md : GAS/GitHubセットアップ
- GAS_ZERO_COST_SETUP_V1.md : 無料構成
- CENTRAL_DB_SCHEMA_V1.sql : 将来DB
- CENTRAL_DB_API_CONTRACT_V1.md : API契約
- DATA_PLATFORM_V1.md : データプラットフォーム
- E2E_QA_REPORT_V2.md / BOUNDARY_QA_REPORT_V2.md : QA資料
- MUDAGIRI_GAS_CODE_V1.gs : GASバックエンド
- MudagiriAppV2.tsx / ResultScreenV2.tsx / BattleSequenceV2.tsx 等 : UI実装

## 15. raw_generated_assetsについて
ZIPルートの `raw_generated_assets/` は、このセッションの `/mnt/data` に残っていた画像生成物を可能な限りまとめた保全用フォルダ。
ファイル名は生成時の自動名のままなので、正式assetか候補/失敗作かは混在する。
本番採用のページ画像は `mudagiri_v2/public/assets/page/` を優先する。
過去に生成した約50点のspriteすべてがコンテナに確実に残っている保証はない。したがって「画像全部保存済み」とは断言しない。

## 16. 次チャットへの最初の依頼文（コピペ用）
「添付ZIPはムダギリ診断プロジェクトの引き継ぎ一式です。まず HANDOFF_MASTER_2026-09-23.md、UX_VISUAL_WIRING_V1.md、UX_JOURNEY_V2.md、DESIGN_SYSTEM_V3.md を読み、実ファイルを監査してください。推測で完成扱いにせず、存在するコード/asset/QAを確認したうえで、GitHub Pages向けスマホUI実装→base/path/package-lock/GAS hardening→QAまで進めてください。公開はまだしないでください。公式LINEは https://lin.ee/ZeLu7i6。キャラは黄色いヒヨコ＋赤ハチマキ＋斧、基本マントなし。ブランド思想は『好きなものは、斬らない。ムダだけ、斬る。』です。」
