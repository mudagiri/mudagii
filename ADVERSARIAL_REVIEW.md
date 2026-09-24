# ムダギリ診断 公開前・敵対的レビュー

## 修正済み
- FIXED: GAS no-cors could silently lose central writes without local backup on opaque success; now always local-backups.
- FIXED: future_goal column stayed blank because diagnosis row was immutable; GAS now syncs it from future_goal_selected.
- FIXED: appointment CTA could appear before LINE connection; removed from result screen until post-LINE flow exists.

## 公開前ブロッカー
- BLOCKER: public-facing privacy policy / terms / financial-service disclaimer links are not implemented.
- BLOCKER: result UI claims '総務省「家計調査」2025年等を基にした独自比較値'; release package does not by itself prove every comparable row/source mapping. Verify source table/version before public launch.
- BLOCKER: package-lock.json is absent. GitHub build is not reproducible; first successful install should commit the generated lockfile and switch workflow to npm ci.

## 静的チェック
```json
{
  "v31": true,
  "old_16_runtime": false,
  "axis_se_runtime": false,
  "line_exact": true,
  "appointment_cta_result_removed": true,
  "gas_goal_sync": true,
  "always_local_backup": true
}
```

## 実環境でのみ確認可能
- GitHub Actions production build
- GAS Web App POST → Diagnoses_V2 / Events_V2
- Android/iPhone実機の全導線
- LINE友だち追加後の取得・追客
- 面談予約URL/Webhook/valid_appointment計測


## 2026-09-23 history recovery correction
Past React-code history and the frozen workbook were rechecked. The 6-category macro reference was intentionally superseded by the 12-category product resolver, which was separately stress-tested. Exact cell-address provenance is an archival enhancement, not evidence that the current model is unverified. See MODEL_LINEAGE_RECOVERED.md.
