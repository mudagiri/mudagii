/**
 * Guard against silent Vite tree-shaking of personality telemetry when the
 * dedicated GAS env variable is absent at build time.
 * These URLs are PUBLIC in a client bundle. Never use them as credentials.
 * Do not print their values in CI logs.
 */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export function inspectMoneyPersonalityBuild({distDir,moneyUrl,householdUrl}){
  if(!moneyUrl)return {ok:false,code:'MONEY_GAS_ENV_MISSING'};
  if(householdUrl&&moneyUrl===householdUrl)return {ok:false,code:'MONEY_URL_EQUALS_HOUSEHOLD_URL'};
  const dir=path.join(distDir,'assets');
  if(!fs.existsSync(dir))return {ok:false,code:'DIST_ASSETS_MISSING'};
  const scripts=fs.readdirSync(dir).filter(f=>f.endsWith('.js'));
  if(!scripts.length)return {ok:false,code:'BUNDLE_MISSING'};
  let containsEndpoint=false,containsTelemetry=false,containsPayload=false;
  for(const file of scripts){
    const bundle=fs.readFileSync(path.join(dir,file),'utf8');
    if(bundle.includes(moneyUrl))containsEndpoint=true;
    if(bundle.includes('mudagiri_money_type_submission_health_v1'))containsTelemetry=true;
    if(bundle.includes('money_personality_pilot_v1'))containsPayload=true;
  }
  if(!containsEndpoint)return {ok:false,code:'MONEY_GAS_OPTIMIZED_OUT_OF_BUNDLE'};
  if(!containsTelemetry)return {ok:false,code:'RETRY_TELEMETRY_NOT_IN_BUNDLE'};
  if(!containsPayload)return {ok:false,code:'PERSONALITY_PAYLOAD_MISSING'};
  return {ok:true,code:'PERSONALITY_GAS_BUILD_BOUND'};
}

const direct=Boolean(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url);
if(direct){
  const status=inspectMoneyPersonalityBuild({
    distDir:process.argv[2]||'dist',
    moneyUrl:process.env.VITE_MONEY_PERSONALITY_GAS_URL,
    householdUrl:process.env.VITE_MUDAGIRI_GAS_URL,
  });
  console.log(JSON.stringify({suite:'MUDAGIRI_MONEY_PERSONALITY_BUNDLE_BINDING_V1',...status}));
  if(!status.ok)process.exitCode=1;
}
