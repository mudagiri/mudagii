import http from 'node:http';
import { URL } from 'node:url';

const PORT=Number(process.env.PORT||8787);
const DATABASE_URL=process.env.DATABASE_URL;
const ALLOWED_ORIGIN=process.env.ALLOWED_ORIGIN||'*';
if(!DATABASE_URL) console.warn('DATABASE_URL is not set; server will reject writes.');

let pgPool;
async function db(){
  if(!DATABASE_URL) throw new Error('DATABASE_URL_MISSING');
  if(!pgPool){
    const {Pool}=await import('pg');
    pgPool=new Pool({connectionString:DATABASE_URL,ssl:process.env.PGSSL==='disable'?false:{rejectUnauthorized:false}});
  }
  return pgPool;
}
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json','access-control-allow-origin':ALLOWED_ORIGIN,'access-control-allow-headers':'content-type','access-control-allow-methods':'POST,OPTIONS'});res.end(JSON.stringify(body))};
const readJson=req=>new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>1_000_000){reject(new Error('BODY_TOO_LARGE'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch(e){reject(e)}});req.on('error',reject)});
const required=(o,keys)=>keys.every(k=>o?.[k]!==undefined&&o?.[k]!==null&&o?.[k]!=='');

async function saveDiagnosis(v){
  if(!required(v,['diagnosisId','anonymousUserId','createdAt','schemaVersion','methodologyVersion','profile','money','toneMode','typeCode','battleScore','improvement','categories'])) throw new Error('INVALID_DIAGNOSIS');
  const p=await db(); const c=await p.connect();
  try{await c.query('begin');
    const a=v.acquisition||{};
    await c.query(`insert into analytics.diagnoses(diagnosis_id,anonymous_user_id,created_at,schema_version,methodology_version,consent_analytics,consent_benchmark,prefecture,age,age_band,family_profile,household,annual_income,income_band,monthly_take_home_income,monthly_saving_investment,free_cash_flow,emergency_months,saving_rate,tone_mode,future_goal,global_satisfaction,type_code,axis_fv,axis_pi,axis_au,axis_se,battle_score,monthly_improvement,annual_improvement,five_year_improvement,utm_source,utm_medium,utm_campaign,utm_content,utm_term,referrer,landing_path) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38) on conflict(diagnosis_id) do nothing`,[
      v.diagnosisId,v.anonymousUserId,v.createdAt,v.schemaVersion,v.methodologyVersion,!!v.consent?.analytics,!!v.consent?.benchmark,v.profile.prefecture,v.profile.age,v.profile.ageBand,v.profile.familyProfile,v.profile.household,v.money.annualIncome,v.profile.incomeBand,v.money.monthlyTakeHomeIncome,v.money.monthlySavingInvestment,v.money.freeCashFlow,v.money.emergencyMonths,v.money.savingRate??null,v.toneMode,v.futureGoal??null,v.globalSatisfaction,v.typeCode,v.axes.fv,v.axes.pi,v.axes.au,v.axes.se,v.battleScore,v.improvement.monthly,v.improvement.annual,v.improvement.fiveYear,a.source??null,a.medium??null,a.campaign??null,a.content??null,a.term??null,a.referrer??null,a.landingPath??null]);
    for(const x of v.categories) await c.query(`insert into analytics.diagnosis_categories(diagnosis_id,category,amount,amount_state,comparable,difference,satisfaction,outcome,monthly_improvement) values($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict(diagnosis_id,category) do update set amount=excluded.amount,amount_state=excluded.amount_state,comparable=excluded.comparable,difference=excluded.difference,satisfaction=excluded.satisfaction,outcome=excluded.outcome,monthly_improvement=excluded.monthly_improvement`,[v.diagnosisId,x.category,x.amount??null,x.amountState,x.comparable??null,x.difference??null,x.satisfaction??null,x.outcome,x.monthlyImprovement]);
    await c.query('commit');
  }catch(e){await c.query('rollback');throw e}finally{c.release()}
}
async function saveEvent(v){if(!required(v,['eventId','anonymousUserId','diagnosisId','name','createdAt']))throw new Error('INVALID_EVENT');const p=await db();await p.query(`insert into analytics.funnel_events(event_id,anonymous_user_id,diagnosis_id,name,created_at,data) values($1,$2,$3,$4,$5,$6) on conflict(event_id) do nothing`,[v.eventId,v.anonymousUserId,v.diagnosisId,v.name,v.createdAt,v.data||{}])}
async function saveLead(v){if(!required(v,['leadId','diagnosisId','anonymousUserId','createdAt','stage','typeCode','annualIncomeBand','familyProfile','monthlyImprovement']))throw new Error('INVALID_LEAD');const p=await db();await p.query(`insert into crm.leads(lead_id,diagnosis_id,anonymous_user_id,created_at,stage,line_user_id,source,campaign,future_goal,type_code,annual_income_band,family_profile,needs_review,unknown_categories,monthly_improvement,appointment) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) on conflict(diagnosis_id) do update set stage=excluded.stage,line_user_id=coalesce(excluded.line_user_id,crm.leads.line_user_id),appointment=coalesce(excluded.appointment,crm.leads.appointment)`,[v.leadId,v.diagnosisId,v.anonymousUserId,v.createdAt,v.stage,v.lineUserId??null,v.source??null,v.campaign??null,v.futureGoal??null,v.typeCode,v.annualIncomeBand,v.familyProfile,JSON.stringify(v.needsReview||[]),JSON.stringify(v.unknownCategories||[]),v.monthlyImprovement,v.appointment?JSON.stringify(v.appointment):null])}

http.createServer(async(req,res)=>{if(req.method==='OPTIONS')return json(res,204,{});if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});try{const path=new URL(req.url,'http://localhost').pathname;const body=await readJson(req);if(path==='/v1/diagnoses')await saveDiagnosis(body);else if(path==='/v1/events')await saveEvent(body);else if(path==='/v1/leads')await saveLead(body);else return json(res,404,{error:'NOT_FOUND'});return json(res,202,{ok:true})}catch(e){console.error(e);return json(res,400,{error:String(e?.message||e)})}}).listen(PORT,()=>console.log(`Mudagiri API listening on :${PORT}`));
