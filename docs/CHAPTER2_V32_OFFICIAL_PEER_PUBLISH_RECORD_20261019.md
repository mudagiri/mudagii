# 第2章V3.2｜同年代×世帯区分×所得帯・比較表示リリース記録
更新日：2026-10-19

## 変更元（隔離プレビューのみ）
- Source branch: `release/chapter12-latest-rpg-ui-first-20261016`
- Release SHA: `5cd40ed996b11bb09b5bb49101c3be15f94edf3e`
- PR #67: 同条件の比較が可能な費目は、本人支出・本人負担率・2024年同一交差集計の参考率・その差を1パネルに統合。古い2列カードの二重表示を解消。
- PR #68: Chrome/WebKit統合QAの表示契約を新パネルへ更新。

## 検証済み
- `Validate Diagnosis V2.1`: run 39270284473 SUCCESS
- `V5 Visual Smoke`: run 39270284487 SUCCESS
- `Latest Chapter 1 × Chapter 2 V3.2 UI First Gate`: run 39270859315 の `latest-ui` job は Chrome / iPhone WebKit の統合導線と高所得帯比較QAに SUCCESS。
- プレビュー専用 `isolated-preview-build` SUCCESS。
- 同workflowの本番GAS設定チェックは、別途必要な第1章専用GAS環境変数が不足しているためFAIL。プレビューはGAS書き込みを無効にして分離している。

## 表示ルール（変更不可）
- 同年代×単身/二人以上×額面年間収入帯×勤労者世帯の原表セルが確定したときだけ、食費・光熱水道・日用品の2024年公式参考負担率を表示する。
- 公式率は「同一セルの平均支出 ÷ 平均可処分所得」であり、個々の世帯の負担率の平均ではない。二人以上の家族人数・地域・費目範囲の完全一致は保証しない。
- 参考率との差を本人の手取りで換算した金額は、削減可能額、ムダ額、未確定見直し上限のいずれにも加算しない。
- コホート条件の不成立・未回答・標本不足・費目範囲不一致なら同条件差は出さず、独立した参考データだけを明示する。
- FROZENの診断コア、確定改善額、未確定候補、GASへの送信、Chapter 1/3は変更しない。

## 公開
GitHub Pagesの復旧ワークフローはmainの本番ルートを維持し、隔離preview配下にrelease branchのビルドを配置する。公開後は `pilot/chapter2-v32/REVISION_SHA.txt` をrelease SHAと照合すること。