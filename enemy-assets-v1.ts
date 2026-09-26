export type EnemyAssetState = 'trace' | 'normal' | 'defeated' | 'escape';

export type EnemyAssetCategory =
  | 'mobile'
  | 'energy'
  | 'sub'
  | 'food'
  | 'daily'
  | 'fun'
  | 'beautyFashion'
  | 'car'
  | 'rent'
  | 'insurance'
  | 'childEducation'
  | 'selfDevelopment';

export type EnemyAssetPack = {
  id: string;
  name: string;
  trace: string;
  normal: string;
  defeated: string;
  escape: string;
};

const ROOT = './assets/enemies';

const pack = (id: string, name: string): EnemyAssetPack => ({
  id,
  name,
  trace: `${ROOT}/${id}/trace.png`,
  normal: `${ROOT}/${id}/normal.png`,
  defeated: `${ROOT}/${id}/defeated.png`,
  escape: `${ROOT}/${id}/escape.png`,
});

/**
 * Production enemy assets — 2026-09-26
 *
 * Source of truth:
 * MUDAGIRI_ENEMY_PRODUCTION_48_2026-09-26.zip
 *
 * SCAN:
 *   trace -> normal
 *
 * BATTLE:
 *   normal -> defeated / escape
 *
 * childEducation is conditional and may be N/A/SKIP.
 * Do not substitute historical RAW assets.
 */
export const ENEMY_ASSETS: Record<EnemyAssetCategory, EnemyAssetPack> = {
  mobile: pack('01_tsushinzaurus', '通信ザウルス'),
  energy: pack('02_denki_unagi', '電気ウナギ魔人'),
  sub: pack('03_subsuku_succubus', 'サブスクサキュバス'),
  food: pack('04_kuidaore', 'クイダオーレ'),
  daily: pack('05_chiritsumo_kobito', 'チリツモコビト'),
  fun: pack('06_asobisugii', 'アソビスギー'),
  beautyFashion: pack('07_mieharinu', 'ミエハリーヌ'),
  car: pack('08_mudacar', 'ムダカー'),
  rent: pack('09_yachinda', 'ヤチンダー'),
  insurance: pack('10_hoken_mienaider', 'ホケンミエナイダー'),
  childEducation: pack('11_manabinbo', 'マナビンボー'),
  selfDevelopment: pack('12_jikotoushin', 'ジコトウシン'),
};

export function getEnemyAsset(
  category: EnemyAssetCategory,
  state: EnemyAssetState,
): string {
  return ENEMY_ASSETS[category][state];
}
