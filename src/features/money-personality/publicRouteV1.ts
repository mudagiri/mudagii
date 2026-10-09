/**
 * The default public Chapter 1 entry must be the 30-core adaptive assessment.
 * The original 54-screen form remains accessible ONLY by explicit pilot query
 * for item research; it must not be the default user-facing result path.
 */
export type MoneyPersonalityEntryRoute='adaptive'|'legacy-pilot'|'household';
export function resolveMoneyPersonalityEntryRoute(pathname:string,search:string):MoneyPersonalityEntryRoute{
  const params=new URLSearchParams(search);
  const path=pathname.replace(/\/+$/,'');
  const explicitLegacy=params.get('mode')==='legacy-pilot';
  if(explicitLegacy&&(path.endsWith('/pilot/money-type')||params.get('pilot')==='money-type'))return 'legacy-pilot';
  if(path.endsWith('/pilot/money-type/adaptive')||
     path.endsWith('/pilot/money-type')||
     params.get('adaptive')==='money-type'||params.get('mode')==='adaptive')
    return 'adaptive';
  if(params.get('pilot')==='money-type')return 'legacy-pilot';
  return 'household';
}
