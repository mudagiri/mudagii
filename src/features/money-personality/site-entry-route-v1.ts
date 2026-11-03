import {resolveMoneyPersonalityEntryRoute} from './publicRouteV1';

/** Chapter 1 is the public first chapter. Existing V5 results/drafts resume unchanged.
 * This only selects presentation routes; it never changes the frozen diagnosis engine.
 */
export function resolveMudagiriPublicEntryV1(pathname:string,search:string,hasSavedHouseholdJourney:boolean){
 const params=new URLSearchParams(search);
 const explicit=resolveMoneyPersonalityEntryRoute(pathname,search);
 if(explicit==='adaptive'||explicit==='legacy-pilot')return explicit;
 const path=pathname.replace(/\/+$/,'');
 const publicRoot=path===''||path==='/'||path==='/mudagii';
 const householdRequested=params.get('mode')==='household'
   ||params.get('legacy')==='1'
   ||['chapter2v2','chapter2v3','chapter2v31','chapter2v32'].some(k=>params.get(k)==='1');
 if(publicRoot&&!householdRequested&&!hasSavedHouseholdJourney)return 'adaptive';
 return 'household';
}
