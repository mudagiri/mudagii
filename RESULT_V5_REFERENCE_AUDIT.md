# MUDAGIRI RESULT V5 — REFERENCE AUDIT

Updated: 2026-10-01  
Status: **CURRENT REFERENCE SOT**  
Purpose: document provenance, source population, allowed UI usage, and prohibited interpretation for Result V5 references.

## Global contract

- A reference is a **positioning lens**, not proof of waste.
- Reference difference != reducible amount.
- Structural references do not automatically enter Potential.
- Source-population mismatch means **no comparison**, not interpolation.
- Product MODEL values must be labeled as comparison guidance and must not be called an official average.

## 1. Insurance

### Personal
Source: 生命保険文化センター「2025年度 生活保障に関する調査」  
Public page: https://www.jili.or.jp/research/chousa/10350.html

Use:
- personal diagnosis scope;
- age-based personal premium reference;
- where sex is not collected, Result V5 uses a transparent sample-N weighted age reference derived from the published sex×age means.

Allowed:
- POSITION;
- comparison difference;
- purpose/review-recency context.

Prohibited:
- comparison gap as saving;
- fabricated age×income cross-average.

### Household
Source: 生命保険文化センター「2024年度 生命保険に関する全国実態調査」  
Public page: https://www.jili.or.jp/research/report/9850.html?lid=mm165  
Public summary: https://www.jili.or.jp/lifeplan/houseeconomy/847.html

Use:
- household diagnosis scope;
- household age reference as a primary Result V5 lens;
- household-income reference as a separate secondary lens only where the app income band maps cleanly to the published band.

Allowed:
- show both lenses separately.

Prohibited:
- blending age and income lenses into an invented “same age × same income average”;
- automatic Potential C.

## 2. Beauty / fashion — multi-household

Source family: 2025 Family Income and Expenditure Survey detailed household-head-age tables.  
e-Stat example database: https://www.e-stat.go.jp/dbview?sid=0002070011  
Detailed item view: https://www.e-stat.go.jp/dbview?sid=0004023609

Runtime model:
- age buckets: <=29 / 30–39 / 40–49 / 50–59 / 60–69 / 70+;
- scope: clothing/footwear + beauty services + cosmetics;
- daily-consumable hygiene items excluded to avoid overlap with 日用品;
- confidence: MODEL/reference.

Allowed:
- POSITION with WIDE/model semantics;
- C only when comparison scope matches the diagnosis amount, under the V5 Potential rules.

Prohibited:
- calling the model a direct official mean;
- adding hygiene/daily consumables again.

## 3. Owned housing / mortgage

Source: 総務省「家計調査 2025年 家計収支編 二人以上の世帯 詳細結果表 第3-10表」  
Table title: 住宅ローン返済世帯－世帯主の年齢階級別1世帯当たり1か月間の収入と支出  
e-Stat dataset: https://www.e-stat.go.jp/stat-search/files?stat_infid=000040409541  
Excel download: https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040409541&fileKind=0

Row: 土地家屋借金返済（月額）
- average: ¥92,873
- <=34: ¥99,357
- 35–39: ¥96,307
- 40–44: ¥93,705
- 45–49: ¥88,378
- 50–54: ¥88,269
- 55–59: ¥97,046
- 60–64: ¥96,646
- 65–69: ¥93,869
- 70+: ¥88,125

Use:
- owned + mortgage;
- household size >=2;
- profile age is used only as a proxy for household-head age and this limitation must remain explicit;
- structural POSITION/reference only.

Prohibited:
- private-rent comparator for owned housing;
- single-person mortgage extrapolation from Table 3-10;
- automatic Potential C from mortgage difference.

## 4. Car

Source: ソニー損保「2025年 全国カーライフ実態調査」  
Public page: https://from.sonysonpo.co.jp/topics/pr/2025/08/20250821.html

Reference:
- average monthly maintenance: ¥14,100;
- survey population: self-owned car users aged 18–59;
- includes items such as insurance, fuel, parking and repair/maintenance;
- excludes taxes, loan repayments and toll-road charges.

Runtime scope question:
- 維持費中心 -> reference may be shown;
- ローンや税金も含む -> no maintenance-reference comparison;
- よく分からない -> no maintenance-reference comparison.

Use:
- structural POSITION/reference only.

Prohibited:
- comparing a loan/tax-inclusive total with ¥14,100;
- applying the reference beyond the surveyed age population;
- automatic Potential C.

## 5. QA contract

Automated checks cover:
- structural references never enter automatic C;
- car scope mismatch suppresses comparison;
- single mortgage suppresses Table 3-10 comparison;
- insurance reference gaps do not inflate Potential;
- multi beauty remains MODEL;
- scope mismatch blocks C;
- C never enters Potential lower bound;
- extreme C is capped at 2× benchmark;
- 10,000-case calibration boundary QA;
- existing 10,000-case fuzz QA.

Reference audit version: **MUDAGIRI_RESULT_V5_REFERENCE_AUDIT_1_0**
