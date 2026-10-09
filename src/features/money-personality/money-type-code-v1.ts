import type {JobCode,StyleId} from './classifierV1';

/**
 * Canonical public identity system.
 * 8 JOBs × 4 PRIMARY STYLEs = 32 MONEY TYPES.
 * Secondary STYLE remains descriptive context and never changes the type code.
 */
export type StyleCode='D'|'E'|'S'|'O';
export type MoneyTypeCode=`${JobCode}-${StyleCode}`;

export const STYLE_CODE:Record<StyleId,StyleCode>={
  DRIVE:'D',
  ENJOY:'E',
  SECURE:'S',
  OPTIMIZE:'O',
};

export const STYLE_PUBLIC_NAME:Record<StyleId,string>={
  DRIVE:'DRIVE',
  ENJOY:'ENJOY',
  SECURE:'SECURE',
  OPTIMIZE:'OPTIMIZE',
};

export function moneyTypeCode(job:JobCode,primaryStyle:StyleId):MoneyTypeCode{
  return `${job}-${STYLE_CODE[primaryStyle]}` as MoneyTypeCode;
}

export const ALL_MONEY_TYPE_CODES=(['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'] as const)
  .flatMap(job=>(['DRIVE','ENJOY','SECURE','OPTIMIZE'] as const).map(style=>moneyTypeCode(job,style)));
