# ムダギリ診断｜第3章V2｜正式V5アダプターP0実装監査・次のUI橋渡し（2026-10-21）

状態：**第3章専用の独立アダプター実装・CI PASS。ただし正式なユーザー同意UI／C2本体への接続は未実装。第1・第2章のFROZEN診断エンジン、公開main、本番GASは非変更。**

PR #70 ブランチ：\`design/chapter3-v2-result-first-20261020\`。
接続元の最新版候補：PR #51 \`release/chapter12-latest-rpg-ui-first-20261016\`（2026-10-21の確認時点Draft・未マージ）。

## 結論

独立アダプター \`chapter3-v2/handoff-adapter.mjs\` を作成。
**既存V5計算関数 \`buildResultViewModelV5\` で生成した合成診断結果を入力し、本人一致を確認したC1のJOB/STYLEと第2章12カテゴリ/A/C/任意の目標だけを第3章用に射影できた。**

**GitHub Actions実行ログで81/81 PASS**：
[Chapter 3 V2 Isolated Counterfactual QA #39526638344](https://github.com/mudagiri/mudagii/actions/runs/39526638344)。
内訳：
- \`scripts/qa-chapter3-v2-counterfactual.mjs\`：37件
- \`scripts/qa-chapter3-v2-handoff.mjs\`：31件
- \`scripts/qa-chapter3-v2-realvm.ts\`：13件（**第2章の実V5ビルダーが生成した合成結果を使う統合形状QA**）

合計81件のテストが通ったのは**合成データによるコード動作に限る**。本番のセッション・実利用者・実ブラウザ・面談CVの検証ではない。

## 1. 入出力の厳密な対応

### C2実装で確認した入力
- \`MudagiriAppV2.tsx\`：\`diagnosisId\`と\`anonymousUserId\`を持ち、\`buildResultViewModelV5(...)\`で結果VMを作る。レンダリング時は\`vm={result}\`, \`chapter1={readChapter1HandoffV1(anonymousUserId)}\`を引き渡している。
- \`result-view-model-v5.ts\`：\`vm.version='MUDAGIRI_RESULT_VM_V5_0'\`、\`vm.methodologyVersion='MUDAGIRI_RESULT_VM_V5_2'\`、\`vm.diagnosisId\`、\`vm.rows[].{category,known,v5Status,aAmount,cUpper}\`、\`vm.potential.{confirmedA,cUpper}\`。
- \`ResultScreenChapter2V32.tsx\`：任意の「未来の目的地」の\`goal\`は**React \`useState\`内の値**。C3には現時点で渡していない。
- \`chapter2-v2-contract.ts\`：第1章JOB・STYLEの正式ハンドオフは \`MUDAGIRI_MONEY_TYPE_HANDOFF_V1\` で、匿名ID一致の検証が必要。
- \`vm.chapter1Link\`は表示用の派生値で匿名IDを保持しないため、**単独ではC1本人照合の根拠にしない**。

### アダプターAPI

\`\`\`js
import {
  buildChapter3HandoffFromV5, C3_HANDOFF_CONSENT
} from './chapter3-v2/handoff-adapter.mjs';

// PSEUDOCODE: Click handler within authenticated/verified same-session C2 app.
// The caller must verify the active diagnosis context; this is not a finished UI.
const result = buildChapter3HandoffFromV5({
  consent: C3_HANDOFF_CONSENT, // only after a real user entry action
  anonymousUserId: currentChapter2AnonymousUserId,
  diagnosisId: currentChapter2DiagnosisId,
  chapter2Vm: currentV5Result,
  chapter2Goal: currentlySelectedOptionalGoal ?? null,
  chapter1Handoff: validatedRawChapter1Handoff ?? null,
  createdAt: new Date().toISOString()
});
if (result.ok) {
  // Pass the minimized handoff through a future explicit, authorized C3 entry.
  // No automatic LINE dispatch, no background upload or persistence here.
}
\`\`\`

\`consent\` は**クリック済みの状態を呼び出し元が申告するフラグ**。フラグを渡すだけで真の同意・本人認証が成立するわけではない。本番では実UIとサーバー側の本人同一性・保持期間の設計が必要。

### 第3章へ移すデータ
- バージョン \`MUDAGIRI_C3_V2_TEST_V1\`（**試作形式／正式FROZEN名ではない**）。
- 第1章：匿名ID一致済みの\`jobCode\`, \`primaryStyle\`, \`sessionId\`, \`completedAt\`のみ。JOB名はC1の正式アセットから描画する。
- 第2章：\`diagnosisId\`, V5版数、任意\`goal\`、12カテゴリの\`category/known/v5Status/aAmount/cUpper\`、A/C合計。
- 利用者の手取り、世帯情報、都道府県、貯金、各カテゴリ実支出、比較基準差、個別の保険契約、解答生データは**出力しない**。
- A：条件を確認できた見直し機会（**実際に貯金された額ではない**）。C：未確定参考上限（**運用原資ではない**）。
- 出力の\`anonymousUserId\`は同じセッション内の照合用。SNS共有用の情報ではない。

## 2. フェイルクローズ検証（アダプターから拒否する条件）

1. 第3章進入を明示したフラグがない。
2. 第2章VMのバージョン/診断IDが現在のC2アプリの診断と一致しない。
3. C1ハンドオフの匿名ID・JOB・STYLE・完了時刻が不正。
4. \`vm.chapter1Link\`が存在するとき、C1生ハンドオフとsession/JOB/STYLEが矛盾する。
5. C2カテゴリが12件未満/重複/未知コード、\`known\`と金額が矛盾。
6. \`aAmount\`が対象外カテゴリに付与、\`na\`状態に金額が付与、またはA/CにNaN/負数が含まれる。
7. カテゴリ金額の合計と\`potential\`の合計に矛盾がある（Cの小数は微小浮動小数誤差のみ許容）。
8. 任意ゴールのコードが第2章の8つの正式候補にない。

\`chapter1Handoff=null\` の場合、VMの\`chapter1Link\`から匿名本人のC1情報を**推測して復元しない**。JOBなしの第3章ルートを許す。

## 3. 現時点の限界

- 第2章の表示コンポーネントへ\`onChapter3\`などの明示操作と、任意\`goal\`状態の引渡しは**まだ実装していない**。
- C2のVMは\`diagnosisId\`を持つが、**VM自体には\`anonymousUserId\`が無い**。この実装は呼出元が提供するアプリの\`diagnosisId/anonymousUserId\`と照合する形状QAであり、認証システムや耐改ざん署名ではない。
- \`confirmedA\`や\`cUpper\`の意味論はC2のV5と整合していても、投資の適合性・増収可能額は出せない。
- 第1・第2章の表示や既存の直接面談導線は変更していない。
- 第3章のユーザー画面、背景、ムダギリくん素材の配置、CSSは未実装。内容FROZEN前なので画像制作はまだ行わない。
- 4視点100点は**検証基準であり達成した点数ではない**。81テストPASSは機能の一部の正しさだけ。

## 4. 次に実装するC2→C3のUI橋渡し（独立PR推奨）

1. PR #51の正式リリースSHAが固まったら、そのブランチを参照して、**第2章ResultScreenV32のUIレイヤーにだけ**任意の「未来の冒険へ」ボタンを配置。C2の12カテゴリ判定コアと基準値は変更しない。
2. 第2章画面の\`goal\`は本人の任意選択。ボタンクリック直後に\`onChapter3({goal})\`で親のアプリに渡し、C1のidentity-checked handoffとVMでadapterを呼び出す。強制遷移なし。
3. 第3章が同じoriginでホストされるなら最小handoffを安全な一時状態で受け渡す。別originの場合は個人情報をURLクエリへ埋めず、期限付き・認証/同意付きのサーバー側交換を設計する。
4. C3画面では引き継いだ目標を表示し「この旗で進む／変更する」。時の塔→必要な場合のみ霧の関門。面談CVは1つだが第2章からの直接面談は保持。
5. 第2章→第3章の実際のブラウザE2E（戻る、二重タップ、ページ再訪、別端末、期限切れ、診断ID不一致）と、LINEへ勝手に家計情報が渡らないQAを行う。
6. 実ユーザーCognitive Pilotで第1〜3章の一体感と4視点の新しい発見を検証。その後必要な背景画像や透過素材を別制作。

## 5. 現在地・タスク

**今回完了**：独立adapter実装、合成31件の検証、実V5ビルダー出力との統合13件、既存判定37件、GitHub Actions 81/81 PASS。  
**P0残**：正式C2 UI操作とgoal stateの受渡し・C3の遷移先、実ブラウザE2E、正式データ契約FROZEN。  
**P1残**：6リザルトの新しい気づきのCognitive Pilot、面談で実際に対応できるテーマの照合。  
**P2残**：背景・イベント透過画像・公式ムダギリくん不足ポーズの別制作指示書、CSS/画面実装、モバイル実機QA。

**GO判断**：アダプターの限定的な動作検証はPASS。**本番公開と「4視点100点」認定はNO-GOのまま**。
