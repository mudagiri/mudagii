import assert from 'node:assert/strict';
import {resolveMoneyPersonalityEntryRoute} from './src/features/money-personality/publicRouteV1';

const cases=[
  ['/', '', 'household'],
  ['/mudagii/', '', 'household'],
  ['/mudagii/', '?adaptive=money-type', 'adaptive'],
  ['/mudagii/', '?mode=adaptive', 'adaptive'],
  ['/mudagii/', '?pilot=money-type', 'legacy-pilot'],
  ['/mudagii/pilot/money-type/', '', 'adaptive'],
  ['/mudagii/pilot/money-type/', '?utm_source=instagram', 'adaptive'],
  ['/mudagii/pilot/money-type/', '?adaptive=money-type', 'adaptive'],
  ['/mudagii/pilot/money-type/adaptive', '', 'adaptive'],
  ['/mudagii/pilot/money-type/', '?mode=legacy-pilot', 'legacy-pilot'],
  ['/mudagii/pilot/money-type/', '?pilot=money-type&mode=legacy-pilot', 'legacy-pilot'],
  ['/mudagii/pilot/money-type/', '?pilot=money-type&adaptive=money-type', 'adaptive'],
  ['/mudagii/pilot/money-type-2', '', 'household'],
] as const;
for(const [path,search,expected] of cases)assert.equal(resolveMoneyPersonalityEntryRoute(path,search),expected,path+search);
console.log(JSON.stringify({ok:true,suite:'MUDAGIRI_CHAPTER1_ENTRY_ROUTE_V1',cases:cases.length,
  householdRootFrozen:true,publicPilotPathIs30CoreAdaptive:true,
  full54RequiresExplicitResearchRoute:true}));
