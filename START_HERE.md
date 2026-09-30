# ムダギリ診断 — START HERE / CURRENT SOURCE OF TRUTH

更新: 2026-09-30  
STATUS: CURRENT SOT

> このファイルの CURRENT SOT セクションが、歴史資料・旧V1/V2ファイルより優先です。  
> `HANDOFF_MASTER_2026-09-23.md` は historical reference です。16タイプ/4軸など、現行と衝突する記述を正本として使わないでください。

## 0. 現行Runtime正本
- entry: `src/main.tsx`
- app: `MudagiriAppV2.tsx`
- journey/input: `RpgBlock1.tsx`
- integration: `mudagiri-integration-v3.ts`
- result VM: `result-view-model-v3.ts`
- result/share UI: `ResultScreenV3.tsx`
- persistence: `persistence-v3.ts`
- Type scoring: `type-questionnaire-v3.1.ts`
- Type content: `type-content-v3.1.ts`

旧 `ResultScreenV2.tsx` / `ResultRevealV2.tsx` / `ShareResultCardV2.tsx` / `BattleSequenceV2.tsx` / `data-platform-v1.ts` / `diagnosis-fact-builder-v1.ts` / `server-api-v1.ts` / `persistence-v2.ts` は、現行runtime importで必要性が証明されない限り product specification として参照しません。

## 0.1 FROZEN 診断原則
- 正式カテゴリは12。
- 最初の12カテゴリScanは金額だけ入力。
- 追加質問はAppraisalで条件分岐して聞く。
- benchmark gap ≠ ムダ。
- benchmark gap ≠ 改善額。
- confirmed reducibleだけを改善額/Battle対象へ算入。
- 高い支出だけで悪判定しない。
- AUDIT/要鑑定カテゴリで削減額を捏造しない。
- Toneは文言だけを変え、診断計算を変えない。

## 0.2 PROFILE V4
進捗は 都道府県 → 年齢 → 世帯 →（複数のみ人数）→ 働き方 → 住居 → 月手取り → 年収帯。
世帯人数は追加質問でprogressを増やしません。
`workStyle` はCRM/context用途で、generic benchmark multiplierにしません。
年収帯もgeneric multiplierにはせず、各カテゴリ正本で指定された場合だけ利用します。

## 0.3 MONEY TYPE V3.1
**8問 / 3軸 / 8タイプ。16タイプへ戻さない。**

3軸:
- fv: 未来 vs 今
- pi: 計画 vs 直感
- au: 普段から把握 vs 必要時に確認

8タイプ:
- FPA 鉄壁マネー要塞
- FPU 穴あき家計の番人
- FIA 未来キープストッカー
- FIU 未来直感ゾンビ
- VPA メリハリ消費の賢者
- VPU ご褒美予算ブレイカー
- VIA 直感消費エンターテイナー
- VIU 感情課金バーサーカー

strengthは軸スコアの大きさであり、診断精度/confidenceではありません。

## 0.4 Result / Share / LINE
- 現行Resultは `ResultScreenV3.tsx`。
- Typeをidentity/share rewardとして先に見せ、LINEは後段のoptional utility CTA。
- Share画像/本文に収入・支出金額・地域を含めない。
- Type share流入はacquisitionへ保存し、完走との接続を可能にする。
- LINE登録有無で診断結果を変えない。

## 0.5 Persistence / QA
現行診断SnapshotはProfile、12支出、Type回答/結果、Appraisal、final status、confirmed saving、比較/benchmark metadata、Battle対象、methodology version、acquisitionを保持します。

FROZEN/release判定は同一HEADで以下を通す:
- `npm run build`
- `npm run qa:persona`
- `npm run qa:type`
- `npm run qa:10k`
- GitHub Pages Deploy

## 0.6 OP-01 公開約束
Opening/公開metadataで伝えるのは **家計診断 / RPGとして楽しめる / 約3分 / 無料**。
敵説明、具体的改善額、LINE、相談、タイプ数説明をOpeningへ追加しません。

---

## 0.7 RELEASE FROZEN BOUNDARY — 2026-09-30

現行診断プロダクトは以下をFROZEN境界とします。UX改善・軽量化・コピー調整でも、明示的な再設計判断なしに変更しません。

### FROZEN（勝手に変更しない）
- 12カテゴリと各カテゴリの正本benchmark / AUDIT方針
- benchmark gap ≠ ムダ / 改善額、confirmed reducibleのみ改善額へ算入する原則
- PROFILE V4の質問構成・属性用途
- 初期12カテゴリScanは金額のみ、追加質問はAppraisalで条件分岐
- MONEY TYPE V3.1: 8問 / 3軸 / 8タイプ、scoring・tie-break・type code
- ResultでTypeをidentity/share rewardとして先に見せ、LINEを後段optional utilityにする順序
- Shareに収入・支出金額・地域を含めないprivacy原則
- 48 canonical enemy PNGs = 12カテゴリ × trace / normal / defeated / escape

### 改善可能（FROZEN原則を壊さない範囲）
- CSS・レスポンシブ・safe area・tap target
- preload / lazy loading / asset圧縮など表示速度改善
- accessibility / reduced-motion
- 計測イベントの追加（既存意味を変更しない）
- 誤解を減らすコピー微修正

### RPG encounter V3.1 — 2026-09-30 approved revision
- `battleTargets` remains CONFIRMED-only. Only verified reducible amounts contribute to improvement yen.
- `encounterTargets` is a separate presentation layer for evidence-backed strong review signals; maximum 3.
- No filler: 0 or 1 encounter is valid. Medium review signals never fill empty encounter slots merely to reach 2–3 enemies.
- Strong signals require user appraisal and/or category-specific objective evidence; benchmark gap alone is never waste or confirmed saving.
- `secondaryReviewTargets` retains medium evidence for non-battle follow-up/result context.
- This revision changes RPG presentation eligibility only. It does not change the 12 benchmark sources, Type V3.1, PROFILE V4, or confirmed-saving contract.
- Battle/Result semantics are frozen as: CONFIRMED = verified reducible amount; STRONG encounter = priority check, not a confirmed waste/defeat; MEDIUM = secondary review; zero encounter = no strong priority under current answers, not proof that the entire household is optimal.
- Result must surface encounter targets separately from generic REVIEW and must never render an unconfirmed STRONG encounter as a defeated enemy.

### Release gate
同一HEADで以下をすべて通過してからrelease/FROZEN扱いにする。
1. `npm run build`
2. `npm run qa:persona`
3. `npm run qa:type`
4. `npm run qa:10k`
5. GitHub Pages Deploy success

現行Type UIはA｜VS｜Bの3列構造で中央重なりを防止する。旧2列+absolute VSへ戻さない。

---

## Historical deployment notes
以下は既存の公開・GAS手順を保全したものです。CURRENT SOTと衝突するV1/V2表現はCURRENT SOTを優先してください。

## 1 GAS
Googleスプレッドシート → 拡張機能 → Apps Script → `MUDAGIRI_GAS_CODE_V2.gs` 全文を貼付 → `setupMudagiriV2()` を1回実行。
`Diagnoses_V2` / `Events_V2` / `Meta` が作成されたら、ウェブアプリとしてデプロイし `/exec` URLをコピー。
旧シートは削除しません。

## 2 GitHub Pages
新規repositoryを作成し、このフォルダの中身をrepository直下へアップロード。
Settings → Secrets and variables → Actions で `VITE_MUDAGIRI_GAS_URL` にGASの `/exec` URLを登録。
Settings → Pages → Sourceを GitHub Actions に設定。
Actions → `Deploy Mudagiri to GitHub Pages` が緑になれば公開URLを開く。

## 3 実機確認
スマホで 診断開始 → 12支出 → 8問 → 満足度 → バトル → 結果 → LINE まで1件実行。
`Diagnoses_V2` に診断1行、`Events_V2` に diagnosis_started / diagnosis_completed / result_viewed / line_clicked が入ることを確認。
公式LINEは `https://lin.ee/ZeLu7i6` 実装済み。

## 4 面談
現行V1では結果画面から直接予約させません。LINE追加後に「未討伐項目の仕分け → ムダギリ作戦会議」へ進める設計です。
予約サービスが決まった段階で、そのURLと予約完了Webhook/完了シグナルを接続します。未接続の予約URLを環境変数へ置く必要はありません。

TYPE_MODEL_V3_1_8 / 8問 / 3軸 / 8タイプ。

## 運営者情報・問い合わせ先
現行V1では公開ブロッカーにしません。未設定でも診断フローは動作します。
後から表示したい場合にのみ運営者名・問い合わせ先を追加します。

## Mode analytics
V2 diagnosis facts persist `toneMode` / sheet `tone_mode` so gentle/serious/hell can be compared on completion→LINE→valid appointment without changing diagnosis math.
