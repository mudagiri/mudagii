/**
 * Public 2024 Survey of Household Economy, e-Stat table 1-29-1,
 * https://www.e-stat.go.jp/dbview?sid=0004039867
 * 二人以上の世帯 × 勤労者世帯 × 世帯主の年齢10歳階級2 ×
 * 年間収入階級50万円刻み × 全国 × 2024年.
 * Values read from the official public grid, NOT modelled or interpolated.
 * Every row: [age class, gross annual class, approximate sample households,
 * average monthly disposable income, food, utilities, household goods,
 * household consumables] in JPY.
 * Suppressed X and '-' and n<50 excluded; low-n / X / '-' rows excluded by the original 2024 verification gate.\n * Important: age is age of HOUSEHOLD HEAD, not every co-resident.
 */
/** 2024 e-Stat a010292 official original 50万円 columns U..AF. This
 * export retains the historic eight-value API, but class labels and values
 * now come from source-SHA-verified row/column pairs. Previous hand-entered
 * values were shifted by one 50万円 class and MUST NOT be restored.
 */
import {OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2} from './official-2024-50man-aligned-worker-v2';
export const OBSERVED_2024_MULTI_WORKER_CELLS:readonly (readonly [string,string,number,number,number,number,number,number])[]=
 OFFICIAL_2024_ORIGINAL_50MAN_WORKER_CELLS_V2
  .filter(row=>row[0]==='multi')
  .map(row=>[row[1],row[2],row[3],row[4],row[5],row[6],row[7],row[8]] as const);
