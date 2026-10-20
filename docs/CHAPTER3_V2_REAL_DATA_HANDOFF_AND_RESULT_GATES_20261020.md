# 第3章 V2｜第1・2章実コード照合・データ引継ぎ契約案・結果妥当性監査

**2026-10-20 / 技術＋コンテンツ監査 Draft 0.3 / 本番・診断エンジン・UI・画像は未変更。**
対象参照ブランチ：`release/chapter12-latest-rpg-ui-first-20261016`（**実装候補の読み取り**。このブランチが本番稼働中とは未確認）
V2設計ブランチ：`design/chapter3-v2-result-first-20261020`
先行文書：`CHAPTER3_V2_EVENT_DECISION_AUDIT_DRAFT_02_20261020.md`

## 0. 判定サマリー

**設計上の結論：第1章JOB/STYLEの安全な引継ぎ契約は既にある。第2章の確定額Aと未確定候補CはV5の結果VMに存在するが、現在の保存契約V4と同一ではない。第3章には別の最小限・同意型ハンドオフ契約が必要。**

最重要の誤り防止：
- `confirmedA` は**「未使用・解約可能等の具体的根拠により確認できた見直し機会」**であり**既に現金を節約・貯蓄・投資できた実績ではない**。
- `cUpper` は **未確定の見直し候補上限（参考）**。比較データの差額や所得帯の平均との差を加算してはいけない。
- 月手取りや12カテゴリの回答があっても**生活防衛資金、債務全体、貯金の流動性、税後増収見込み、資金使途、投資のリスク負担力は判定できない**。
- 第1章のJOB/STYLEは自己理解の言葉の手掛かり。**稼得能力・職業適性・金融商品適合性を示さない**。
- 第3章のE3「霧の橋」は**ゲーム内の選択順序**で、金融商品への適合性やリスク許容度には使わない。

## 1. コード照合の根拠（参照した具体ファイル）

| 実装元 | 確認した契約・処理 | 第3章での結論 |
|---|---|---|
| `chapter2-v2-contract.ts` | `Chapter1HandoffV1`、ストレージキー `mudagiri_money_type_handoff_v1`、バージョン `MUDAGIRI_MONEY_TYPE_HANDOFF_V1`、8 JOBコード・4 STYLEコード、`anonymousUserId`一致必須 | 本人一致を検証した前章データ以外使わない |
| `chapter1-linkage-v1.ts` | `Chapter1LinkageV1`に `chapter1SessionId,chapter1JobCode,chapter1JobName,chapter1StyleCode,chapter1CompletedAt` を格納。正本再判定はしない | JOB/STYLE再計算禁止。表示名は公式JOBアセットとの一致を確認 |
| `src/features/money-personality/job-character-assets-v1.ts` | `JOB_CHARACTER_ASSETS`は8コードと正本画像名を対応づけている | 既存アセットを再利用し、第3章独自JOB画像を捏造しない |
| `mudagiri-diagnosis-v2.ts` | Categoryは12種、`confirmedSaving`はサブスク未使用額が分かり停止可能と答えた場合など具体的根拠のみ。比較差はscreening | `comparisonDifference`を削減額にしない |
| `final-judgement-v4.ts` | `confirmedSaving`はカテゴリ単位。12カテゴリ全件・守る/確認する等の区別あり | 戦果は「守る」カテゴリも同じ尊重度で紹介 |
| `result-view-model-v5.ts` | `rows[].v5Status,aAmount,cUpper`、`potential.confirmedA,cUpper,lower,upper`、`firstQuest`。現バージョン `MUDAGIRI_RESULT_VM_V5_2` | V5のA/Cを別フィールドにする。 `upper`は確定資金とみなさない |
| `persistence-v4.ts` | `MUDAGIRI_PERSISTENCE_V4`: category、known/unknown/na、比較出典、`confirmedSaving`など。**V5の`cUpper`と`v5Status`は保存契約V4にはない** | persistence V4だけ読んでもV5の候補額は復元不能。欠けた場合は不明にする |
| `MudagiriAppV2.tsx` | `MUDAGIRI_ACTIVE_RESULT_V1`へ `completed.scopeV4`と検証済み `chapter1Link`をローカル保存、`result.analyticsV5.potential/rows`は別の診断スナップショットへ保存 | 第3章は勝手なローカルストレージキー解読で本番連携せず、明示エクスポートを作る |
| `chapter2-recognition-v1.ts` | 価値を守った根拠と未確定見直し候補を明示し、金額やJOBを勝手に性格証拠として扱わない | 第3章でも「守る価値」を損なわない |
| `chapter2-two-reference-lens-v1.ts` | 年齢×所得の異なる母集団を合成しない。二つの参考比較による手掛かりは削減上限ではない | 比較額・参考負担率から現金余力を作らない |
| `qa-chapters-integration-browser-v1.mjs` | 同一originでC1→C2へ進み、匿名ID＋JOBの引継ぎ・サブスク¥1,800の確認をテスト | **C1→C2のテスト存在は確認。C2→C3 V2の統合E2Eは未作成** |

**本番環境の実URLやブランチが最新かはこの監査からは断定しない**。2026-10-20の他の第2章ピア比較ブランチとのコード差分・デプロイ状況は別のリリース監査事項。

## 2. 第3章 V2最小引継ぎ契約（提案：まだ実装しない）

仮名：`MUDAGIRI_CHAPTER3_HANDOFF_V2_DRAFT`。第2章リザルトでユーザーが「未来を探索する」を押した際、**必要な情報だけを第3章へ明示的に渡す**。

```ts
type Chapter3HandoffDraft = {
  version: 'MUDAGIRI_CHAPTER3_HANDOFF_V2_DRAFT';
  source: {
    chapter1: 'validated'|'unlinked';
    chapter2: 'validated'|'unlinked';
    chapter2VmVersion: string|null;
  };
  linkage: {
    // Same-origin or another explicit, permitted linkage. Never assume name-only matching.
    anonymousUserId: string | null; 
    chapter1SessionId: string | null;
    chapter2DiagnosisId: string | null;
    capturedAt: string;
  };
  chapter1: null | {
    jobCode:'FDM'|'FDP'|'FNM'|'FNP'|'IDM'|'IDP'|'INM'|'INP';
    primaryStyle:'DRIVE'|'ENJOY'|'SECURE'|'OPTIMIZE';
    jobName: string;
  };
  chapter2: null | {
    // The methodology must still be V5, not a V4 save masquerading as V5.
    categories: {
      category:string;
      amountKnown:boolean;
      applicable:boolean;
      status:'cut'|'optimize'|'protect'|'inspect'|'ok'|'na';
      confirmedOpportunityMonthlyYen:number;
      unconfirmedReviewUpperMonthlyYen:number;
      // The source must be a validated V5 row, not the statistical gap.
    }[];
    confirmedOpportunityMonthlyYen:number;
    unconfirmedReviewUpperMonthlyYen:number;
    // Do not include household salary, address, loan details or raw answers by default.
  };
};
```

**セキュリティと出典に関する実装要求**：
1. C1の既存ハンドオフバリデーション（匿名ID一致・有効JOB/STYLE・完了時刻）をそのまま利用する。スコア再計算は厳禁。
2. C2については`diagnosisId`、診断時刻、`methodologyVersion`、12カテゴリの一意性・全件性・金額範囲・A/C整合を検証してから出力する。
3. 行レベルのA/Cを合計した値と `potential.confirmedA/cUpper` が一致しない場合は**金額を表示しない**。勝手に両方足し込まない。
4. Aは「条件確認済みの見直し**機会**」として表示、実行済みかは別の本人確認が必要。Cは未確定と明記。
5. rawな家計支出・手取り・自治体・年齢・金融商品・相談したいテーマはC3へ**初期引継ぎ不要**。必要な場合は本人の追加同意・用途・保持期間を別途設計。
6. 他人／別診断セッションの結果を引き継がない。失効・再診断・アカウント/端末間データ不一致時は未連携にフォールバックする。
7. LINE/面談申し込み時も、本人の理解なしに家計・診断情報を一括送信しない。共有カードは経済情報を非表示にする。
8. これらは**本番導入前の新しい仕様提案**。今のV1.6はC1/C2未連携の隔離プレビューであり、完了を主張しない。

## 3. 「本当の資産形成能力」の判定に足りない条件

| 目的 | 今確認できる可能性のある情報 | C1/C2からは確定できない情報 | V2の安全な出し方 |
|---|---|---|---|
| 稼ぐ | 本人がC3で明示した収入増の希望、E2の時間/経験の自己申告 | 職務経験、市場価値、職場制約、税後収入増、スキルの売り先 | 「収入を増やす方法を調べる」探索提案 |
| 育てる | C3で将来安心への希望、E2で資金を検討したいという申告、C2の見直し機会 | 投資可能現預金、負債、生活防衛額、投資経験、使用時期、値下がり耐性 | 「使う時期別にお金を仕分ける」準備提案 |
| 整える | C2の未確定カテゴリ・守るカテゴリ、C3での優先価値 | 本当の生活資金不足、保険の重複、全負債、具体的な実行可能額 | 「次の判断を左右する1条件を確認」 |
| 時間を守る | C3が時間重視と答えた事実 | 実際の週の稼働時間、業務委譲可能性、収入へのトレードオフ | 「増収」や「投資」を押し付けない |
| すでに資産形成中 | C3で本人申告できるなら活動中という情報 | ポートフォリオ・リスク・目標期限・他資産 | 既存の準備の見直しを提案、初心者向け「始める」を連呼しない |

## 4. 入力×根拠×出力：実装前のシナリオ・ゲート

**8件は架空の検証ケース。診断ロジック実装や実利用者によるスコアではない。**
E3の分岐を変更しても、`nextActionCategory` は原則変えない。変更するのは「着手する順番・伝え方」であり、投資適合性や稼得能力ではない。

| Case | E1の希望 | E2の装備（自己申告） | C2追加情報 | 第3章で返す候補（暫定） | 禁止する結論 |
|---|---|---|---|---|---|
| A | 収入増 | 時間＋経験 | 実余力未確認 | 本業昇給/転職/副業の検討条件を1つ比較 | 「あなたは起業に向く」「収入が増える」 |
| B | 将来安心 | 資金を考えたい | Aが一部確認 | 将来の資金の使う時期を仕分け | 「Aを全額運用できる」 |
| C | 時間重視 | 不明 | 家計データ一部不明 | 増やしたい時間の用途と制約を整理 | 「副業を増やそう」 |
| D | 暮らしの余裕 | 時間 | 返済負担未確認 | 月々何を圧迫しているか一項目確認 | 「支出を削れば実際に余裕が増える」 |
| E | 挑戦 | 経験 | C2全12カテゴリあり | 必要な資源/期限を1つ具体化 | 「第1章挑戦JOBだから起業」 |
| F | 未定 | 不明 | C2にC候補のみ、A=0 | 未確定候補の根拠・本人の優先事項を1つ確認 | 「未確定候補が現金になる」 |
| G | 将来安心 | 資金＋時間 | 今後の大きな支出が判明 | 短期に必要なお金を守ることから整理 | 「運用して増やすのが優先」 |
| H | 時間重視 | 経験 | 高所得の家計、時間が不足 | 無理のない働き方・業務負担を確認 | 「高所得だからこれ以上稼がなくていい」 |

### 追加で確認すべき構造的な穴

- **「目標の期限」**：E1/2/3には時期の明示質問がない。期限が分からなければ運用の優先度は判断できない。必要時の補助問い／面談での確認を選ぶ。
- **「現実の資源」**：C2の支出カテゴリ結果に預貯金残高・全負債・金融資産の利用可能性は含まれない。E2「資金ありそう」も裏付けではない。
- **「E3の情報価値」**：冒険演出としては強くても、金融の優先一手の判定精度は上がらない恐れが大きい。イベント後の意思決定が本当に変わるかPilotで監査し、変わらないなら削除候補にする。

## 5. 4視点を使った「次の一手」リザルト品質ゲート（全ケース適用）

| 観点 | この段階で守る基準 | 不合格の例 | Pilotで検証 |
|---|---|---|---|
| 行動経済学 | 1つの行動をできるだけ小さく示す／選択の自由を保つ | AもBもCも同じ「もう少し情報を確認しましょう」で終わる | 理由理解と翌日行動率・戻り |
| 心理学 | 本人の希望とC1自己理解を尊重し、現実のC2根拠を使い分ける | C1のJOBから副業適性を推測して人格を決めつける | 「新しい発見」「納得」「嫌な気持ち」の自由回答 |
| マーケティング | 面談は1つだがテーマは本人の結果に合わせる | 稼ぐ相談にライフプランのテンプレを押し付ける | 章2完了者あたり予約実数、実施率、期待一致 |
| バズ理論 | 冒険ルートやJOB名だけを自分らしい共有素材にする | 貯金・負債・改善金額を結果カードのデフォルトに含める | 共有実行と共有時のプライバシー評価 |

**安全性を別ゲート**：第2章の金額を誤認させたら4視点満点でも却下。第1章のJOB/STYLE誤紐付けも即却下。

## 6. 現在地・残タスク

- **今回完了（設計検証）**：参照ブランチのC1/C2の実コードから、JOB/STYLE／V5 A・C／12カテゴリ／永続化契約の意味と制約を確認。C2→C3の最小ハンドオフスキーマ案と8ケースの反証ゲートを文書化。
- **未完了**：本番の実際のビルド/最新ブランチの確定、C2→C3の実ハンドオフ、実データ運用の本人同意、実際の結果計算・E2Eテスト、Pilot、画像生成、CSS実装、面談予約接続。
- **次の最優先**：第2章の実装中のソース（最新のピア比較版を含む）と前章結果の契約をリリース責任者視点で照合し、真の対象ブランチ確定→C3の入力・出力の厳密スキーマを確定。次いでE3の増分価値を被験者で検証。
