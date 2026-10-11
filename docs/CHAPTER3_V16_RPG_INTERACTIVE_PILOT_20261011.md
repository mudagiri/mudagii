# 第3章 V1.6｜ギルドRPG隔離UI Pilot（未承認・未本番）

更新：2026-10-11。第1章・第2章の既存ロジックに変更を加えず、**公式画像を再利用した体験可能な独立プレビュー画面**を実装した。

## 確認する画面・操作

- デモURL（Vite開発時）: `/chapter3-pilot.html`。ビルドでも `dist/chapter3-pilot.html` を作る。
- 既存 `index.html` と `src/main.tsx` の導線は**変更しない**。本番の診断セッション・GAS・予約処理は接続しない。
- デモの第1章：公式JOB画像、JOB切替。第2章：確定改善額0円／未確定の見直し候補12,000円、目的地「旅行・趣味」、守る支出あり。**すべて架空のテストデータでありユーザー実績ではない**。
- 目的地の引継ぎあり：同じ問いを飛ばす。なし：8目的地の選択画面へ。途中「戻る」に対応。
- 質問：「叶えたい未来」→「守りたいもの」→「いつ頃」→「今の準備」。自由入力と「未定」を設ける。
- リザルト：公式ムダギリくんRESULTポーズ、羅針盤、判定根拠、次の一歩、第2章の戦果、任意の単純割算、共有カードの情報プレビュー、任意相談の説明。
- カードへの目的地表示はユーザーが明示的に選択した場合のみ。カードの実SNS送信は**未実装**。第2章の未確定額は投資・旅行に使えるお金には加算しない。

## 既存との資産連続性

- 背景：`public/assets/mudagiri/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp` 等3枚。
- ムダギリくん：`public/assets/mudagiri/poses/v1` のGUIDE/LISTEN/EXPLAIN/THINK/CHECK/RESULTほか、全て既存公式。
- JOB：`src/features/money-personality/job-character-assets-v1.ts` を参照。新JOBや動物キャラは作らない。
- 第3章の判定：`scripts/chapter3-insight-engine-v1.mjs` を、既存C1/C2とは無接続のデモフィクスチャで利用。

## テスト

- 判定エンジン：`npm run qa:chapter3-insight`（前版の32ケースを含み、2026-10-11現在204チェックの隔離V8実行でPASS）。
- ブラウザ：`npm run qa:chapter3-pilot`。事前にPlaywrightを準備し、`CHAPTER3_URL`でプレビューURLを与える。
- CI：`.github/workflows/qa-chapter3-rpg-pilot.yml`。Node/Vite build・隔離判定QA・Chrome/WebKit各320/375/390/430幅のUI完走とスクリーンショットを検証予定。
- **検証が実際にPASSしたとは、CI結果を確認するまで書かない。** 操作テスト、スクリーンショットの結果、ユーザーの実機承認が公開ゲート。
- 次工程：検証結果を反映してテキスト、シーンの奥行き、報酬エフェクト、共有カード、復帰契約を磨く。

## 採用を急がない重要事項

1. この画面は独立した**デモ用プロトタイプ**。第2章の`goal`永続化、`anonymousUserId`の実セッション照合、GAS/PDF/予約フロー、公式公開URLへの接続はまだない。
2. 本番UIに組み込む前に、第1章・第2章の現行候補PR（#40/#42/#43）との衝突と公開状態を再確認する。
3. 「確認済み改善額」の定義と「候補の月最大」は常に別。家計を削る行動や投資を自動推薦しない。
4. 原典再読は検証の手段。原典の全設問を第3章へ強制追加しない。ユーザー価値と完了率を比較して採否決定する。
5. 成功指標は、簡易診断の完了率・ユーザーが自分の言葉で言えた新しい気づき・任意面談の有効実施数。バズ用画像は慎重なデータ最小化を維持。

## 使い方（ローカル）

```bash
npm ci
npm run dev
# ブラウザで http://localhost:5173/chapter3-pilot.html
npm run build
npm run qa:chapter3-insight
```

注：この手順にあるlocalhostは開発者のPC向けであり、公開URLではない。
