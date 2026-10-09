/**
 * Read-only release gate for dedicated Chapter 1 Apps Script Web App.
 * In particular, never mistake the frozen Household GAS for this endpoint.
 * Never print the configured URL, its response body or any identifiers.
 */
import {pathToFileURL} from 'node:url';

export const DEDICATED_GAS_VERSION='MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0';
export function validateMoneyPersonalityGasUrl(raw){
  if(typeof raw!=='string'||!raw.trim())return 'MISSING_ENDPOINT';
  try{
    const u=new URL(raw);
    if(u.protocol!=='https:'||u.hostname!=='script.google.com'||
      u.username||u.password||u.search||u.hash||
      !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname))
      return 'INVALID_ENDPOINT_SHAPE';
    return null;
  }catch{return 'INVALID_ENDPOINT_SHAPE';}
}
export async function moneyPersonalityGasHealth(raw,request=fetch){
  const issue=validateMoneyPersonalityGasUrl(raw);
  if(issue)return {ok:false,code:issue};
  try{
    const response=await request(raw,{method:'GET',redirect:'follow',
      headers:{'Accept':'application/json'},signal:AbortSignal.timeout(12000)});
    if(!response.ok)return {ok:false,code:'HTTP_NOT_OK'};
    const data=await response.json();
    if(data?.backend!=='money_personality'||
       data?.gas_version!==DEDICATED_GAS_VERSION||
       data?.household_backend_separated!==true)
      return {ok:false,code:'WRONG_BACKEND_OR_VERSION'};
    return {ok:true,code:'DEDICATED_GAS_HEALTH_OK'};
  }catch{return {ok:false,code:'HEALTH_UNREACHABLE_OR_INVALID_JSON'};}
}

const runningDirectly=Boolean(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url);
if(runningDirectly){
  const status=await moneyPersonalityGasHealth(process.env.VITE_MONEY_PERSONALITY_GAS_URL);
  console.log(JSON.stringify({suite:'MUDAGIRI_DEDICATED_GAS_RELEASE_HEALTH_V1',...status}));
  if(!status.ok)process.exitCode=1;
}
