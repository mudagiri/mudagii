# ムダギリ診断 — コピペして公開確認する最短手順

1. このフォルダの中身を GitHub repository 直下へ配置。
2. GitHub → Settings → Secrets and variables → Actions に `VITE_MUDAGIRI_GAS_URL` を登録（GASをまだ作っていなければ先に `MUDAGIRI_GAS_CODE_V2.gs` を Apps Script に貼り `setupMudagiriV2()` → Webアプリとしてデプロイ）。
3. GitHub → Settings → Pages → Source を GitHub Actions にする。
4. Actions の `Deploy Mudagiri to GitHub Pages` が緑になることを確認。
5. 公開URLをAndroid/iPhoneで開き、3モードのうち最低1回ずつ完走。金額結果は同一入力なら3モードで一致すること。
6. LINEボタンが公式LINE `https://lin.ee/ZeLu7i6` を開くことを確認。
7. Spreadsheetで `Diagnoses_V2` と `Events_V2` を確認。最低でも diagnosis_started / diagnosis_completed / result_viewed / line_clicked が記録されること。

現行V1で不要:
- 運営者名の事前設定
- 問い合わせ先の事前設定
- 面談URLの事前設定

面談予約はLINE追加後の導線として次段階で接続する。
