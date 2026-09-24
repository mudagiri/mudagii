# MUDAGIRI_COMPARABLE_REFERENCE_V1.0
## Runtime formula
`comparable = round(age_band_base × income_factor × region_factor)`

### Single household
- Age-band base only for mobile / energy / food / daily / fun / beautyFashion.
- Region factor = 1.
- Income factor = 1.
- This intentionally avoids applying thin multi-household cells to singles.

### Multi household
- Age-band base is adjusted by income factor for annual income >= ¥5,000,000.
- Income factor uses 11 income centers: 525/575/625/675/725/775/850/950/1125/1375/1500万円.
- Raw income series is monotonic-smoothed with PAVA, shrunk toward overall mean using category-specific lambda, then clamped to category bounds.
- Region adjustment applies only to energy and food. Food deviation is damped by 50%.

### Not auto-comparable
rent / insurance / sub / selfDevelopment are null by default.
Car is only populated when car expense > 0, using ¥14,100 private-survey benchmark.
Child education is only populated when expense > 0 and school stage is supplied, using corrected MEXT FY2023 annual learning-cost totals / 12.

## Critical provenance status
The runtime transformation is documented and deterministic.
However, `COMPARABLE_DATA_DICTIONARY_V1.csv` marks the age-band base rows as `NEEDS_CELL_PROVENANCE`: this release does not yet contain a machine-verifiable mapping from every base value to an exact e-Stat table/cell.
Therefore UI must not call these values an official average, prefectural average, or exact government-statistics figure.
