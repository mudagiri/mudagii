import type {JobCode,StyleId} from './classifierV1';

/**
 * Public identity system: 8 JOB codes × 4 value STYLE suffixes = 32 MONEY TYPES.
 * JOB keeps the diagnostic 3-letter code. STYLE gets a memorable 2-letter suffix.
 */
export type StyleCode='DR'|'EN'|'SE'|'OP';
export type MoneyTypeCode=`${JobCode}-${StyleCode}`;

export const STYLE_CODE:Record<StyleId,StyleCode>={
  DRIVE:'DR',
  ENJOY:'EN',
  SECURE:'SE',
  OPTIMIZE:'OP',
};

export const STYLE_PUBLIC_NAME:Record<StyleId,string>={
  DRIVE:'DRIVE',
  ENJOY:'ENJOY',
  SECURE:'SECURE',
  OPTIMIZE:'OPTIMIZE',
};

export function moneyTypeCode(job:JobCode,style:StyleId):MoneyTypeCode{
  return `${job}-${STYLE_CODE[style]}` as MoneyTypeCode;
}

export const ALL_MONEY_TYPE_CODES=(['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'] as const)
  .flatMap(job=>(['DRIVE','ENJOY','SECURE','OPTIMIZE'] as const).map(style=>moneyTypeCode(job,style)));
