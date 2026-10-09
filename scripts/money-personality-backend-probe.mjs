/**
 * Internal one-off smoke probe. Never logs endpoint URL, participant IDs or raw payload.
 * Sends only a fixed synthetic DEBUG session to the separately deployed GAS.
 * The GAS returns receipt but the actual destination Sheet MUST be checked afterwards.
 */
const endpoint=process.env.VITE_MONEY_PERSONALITY_GAS_URL||'';
const result={suite:'MUDAGIRI_MONEY_PERSONALITY_LIVE_GAS_PROBE_V1',endpointConfigured:Boolean(endpoint),health:false,post1:false,post2:false,serverReportedBackend:null,receivedByExpectedSheet:'NOT_CHECKED'};
if(!endpoint){
  console.log(JSON.stringify({...result,blocker:'SECRET_NOT_CONFIGURED'}));
  process.exitCode=2;
}else{
  try{
    const u=new URL(endpoint);
    if(u.protocol!=='https:'||u.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(u.pathname)){
      throw new Error('ENDPOINT_SHAPE_UNEXPECTED');
    }
    const get=await fetch(endpoint,{redirect:'follow',signal:AbortSignal.timeout(15000)});
    let health=null;
    try{health=await get.json()}catch{}
    if(!get.ok||health?.backend!=='money_personality'||health?.household_backend_separated!==true||health?.gas_version!=='MUDAGIRI_MONEY_PERSONALITY_GAS_V1_0'){
      throw new Error('DEDICATED_BACKEND_HEALTH_MISMATCH');
    }
    result.health=true;
    result.serverReportedBackend='money_personality';
    const completedAt='2026-10-09T00:00:00.000Z';
    const payload={
      kind:'money_personality_pilot_v1',
      schemaVersion:'MUDAGIRI_MONEY_PERSONALITY_PUBLIC_V1',
      pilotVersion:'BACKEND_PROBE_ONLY',
      sessionId:'qa_test_money_type_backend_probe_20261009',
      anonymousUserId:'qa_test_money_type_browser_probe_20261009',
      participantId:'qa_test_money_type_participant_probe_20261009',
      formId:'PUBLIC_ADAPTIVE',
      startedAt:completedAt,
      completedAt, durationMs:0,responseCount:0,answerCount:0,item_responses:[],
      quality:{
        cognitiveMode:false,debugMode:true,variant:'PUBLIC_ADAPTIVE_QA',
        sourceUrl:'https://mudagiri.github.io/mudagii/pilot/money-type/',
        resultContentVersion:'BACKEND_PROBE_ONLY',coreCount:0,
        adaptiveAnswerCount:0,separatorCount:0,
        jobCode:'FDM',jobName:'先回り司令官',primaryStyle:'DRIVE',secondaryStyle:'ENJOY',
        axisStates:{TIME:'CLEAR',DECISION:'CLEAR',AWARENESS:'CLEAR'}
      }
    };
    async function postOnce(){
      const response=await fetch(endpoint,{
        method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)
      });
      let value=null;
      try{value=await response.json()}catch{}
      return response.ok&&value?.ok===true&&value?.backend==='money_personality'&&value?.session_id===payload.sessionId;
    }
    result.post1=await postOnce();
    if(!result.post1)throw new Error('FIRST_POST_NO_SERVER_ACK');
    result.post2=await postOnce();
    if(!result.post2)throw new Error('SECOND_POST_NO_SERVER_ACK');
    console.log(JSON.stringify(result));
  }catch(e){
    console.log(JSON.stringify({...result,errorCode:e?.message==='ENDPOINT_SHAPE_UNEXPECTED'||e?.message==='DEDICATED_BACKEND_HEALTH_MISMATCH'||e?.message==='FIRST_POST_NO_SERVER_ACK'||e?.message==='SECOND_POST_NO_SERVER_ACK'?e.message:'NETWORK_OR_TRANSPORT_ERROR'}));
    process.exitCode=1;
  }
}
