import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import ResultScreenChapter2V32 from '../ResultScreenChapter2V32';
import {CATEGORY_IDS} from '../scripts/chapter12-answercheck-experiment-v1.mjs';
import {resolveComparableV2} from '../comparable-resolver-v2';
import type {Chapter1HandoffV1} from '../chapter2-v2-contract';
import './chapter12-answercheck-preview.css';
import '../chapter12-answercheck-card.css';

type Case='no_uncertain'|'v32_scale'|'v32_scale_uncertain'|'uncertain_only'|'enjoy_dual'|'enjoy_good'|'enjoy_question'|'drive_dual'|'drive_good'|'drive_inertia'|'optimize_dual'|'optimize_question'|'secure_check'|'secure_recent'|'coverage_zero'|'secure_no_link'|'identity_mismatch'|'partial';
const examples:Record<Case,{label:string;desc:string;style:string;job:string;jobName:string}>={
 no_uncertain:{label:'未確定候補0円｜金額を作らない',desc:'未確定候補が0円なら架空の内訳・累計を出さない確認用',style:'OPTIMIZE',job:'IDM',jobName:'メリハリ賢者'},
 v32_scale:{label:'旧V3.2の戦果スケール｜月17,854円',desc:'V3.2既存QAの未確定候補（月17,854円）を再現する画面検証用の架空ケース。確定改善機会とは別です。',style:'ENJOY',job:'INM',jobName:'直感魔導士'},
 v32_scale_uncertain:{label:'旧V3.2の未確定だけ｜月17,854円',desc:'確認済み改善機会0円・未確定の参考上限だけ月17,854円の架空ケース。節約できると確定した額ではありません。',style:'SECURE',job:'FNM',jobName:'兆しの占星術師'},
 uncertain_only:{label:'未確定だけ｜1年・5年・10年',desc:'確認済み改善機会0円・未確定の見直し候補のみ月1,800円の架空例。未来の戦利品を確認する。',style:'SECURE',job:'FNM',jobName:'兆しの占星術師'},
 enjoy_dual:{label:'楽しさ×守る支出＆未使用契約',desc:'娯楽を守りながら、未使用契約を確認できた架空の例',style:'ENJOY',job:'INM',jobName:'直感魔導士'},
 enjoy_good:{label:'楽しさ × 守る支出',desc:'娯楽費に満足していて守りたいと答えた例',style:'ENJOY',job:'INM',jobName:'直感魔導士'},
 enjoy_question:{label:'楽しさ × 見直したい支出',desc:'娯楽費の使い方に本人が見直し意向を示した例',style:'ENJOY',job:'INP',jobName:'風読み剣士'},
 drive_dual:{label:'前進 × 守る自己投資＆見直し契約',desc:'自己投資に目的があり、別の未使用契約も明確な架空例',style:'DRIVE',job:'FDM',jobName:'先回り司令官'},
 drive_inertia:{label:'前進 × 惰性の自己投資',desc:'自己投資を本人が惰性と答えた場合。性格の矛盾とは断定しない',style:'DRIVE',job:'FDM',jobName:'先回り司令官'},
 drive_good:{label:'前進 × 目的のある自己投資',desc:'目的のある自己投資を守ると答えた例',style:'DRIVE',job:'FDM',jobName:'先回り司令官'},
 optimize_dual:{label:'納得 × 守る娯楽＆見直し契約',desc:'守りたい支出と不要契約を分ける行動のヒント。性格一致率ではない',style:'OPTIMIZE',job:'IDM',jobName:'メリハリ賢者'},
 optimize_question:{label:'納得 × 未使用サブスク',desc:'未使用・解約可能を確認した契約がある例',style:'OPTIMIZE',job:'IDM',jobName:'メリハリ賢者'},
 secure_check:{label:'安心 × 保障目的の確認',desc:'保険の目的が不明確と本人が回答。商品を勧める判定ではない',style:'SECURE',job:'FNM',jobName:'兆しの占星術師'},
 secure_recent:{label:'保障｜1年以内に見直し済み',desc:'性格に関係なく、最近見直した人には再点検の案内を出さない',style:'DRIVE',job:'FDM',jobName:'先回り司令官'},
 coverage_zero:{label:'保障｜保険料0円の方',desc:'保険料0円は保障の不足・必要性を証明しない。公的保障を含めた中立の棚卸し',style:'OPTIMIZE',job:'IDM',jobName:'メリハリ賢者'},
 secure_no_link:{label:'安心 × 根拠が足りない',desc:'安心重視でも保険の額だけから一致と決めない例',style:'SECURE',job:'FNM',jobName:'兆しの占星術師'},
 identity_mismatch:{label:'別人・ID不一致',desc:'本人が同じと証明できなければカード非表示',style:'ENJOY',job:'INM',jobName:'直感魔導士'},
 partial:{label:'カテゴリ未完了',desc:'12カテゴリ未完了の場合はカード非表示',style:'ENJOY',job:'INM',jobName:'直感魔導士'}
};
const FIXTURE_AMOUNTS:Record<string,number>={mobile:7800,energy:15500,sub:4200,car:0,food:54000,daily:14000,fun:24000,beautyFashion:6000,rent:92000,insurance:11000,childEducation:0,selfDevelopment:9600};
const FIXTURE_NEXT_ACTION:Record<string,string>={mobile:'スマホ1回線の料金プランと端末代を確認する',food:'食費の内訳と必要な支出を確認する',energy:'直近2〜3か月の明細と契約プランを確認する',daily:'日用品の購入頻度と買い置きを確認する',fun:'満足度の高い支出は守り、使い道を確認する',beautyFashion:'購入頻度と今の満足度を確認する',sub:'使っていない契約と解約条件を確認する',rent:'住居費の契約内容を確認する',insurance:'保障内容と最後の見直し時期を確認する',selfDevelopment:'自己投資の目的と成果を確認する'};
// Consistent, deliberately synthetic monthly spending: DO NOT treat as participant or FROZEN benchmark data.
const row=(category:string)=>({
 category,label:({mobile:'通信費',energy:'光熱・水道費',food:'食費',daily:'日用品',fun:'娯楽・趣味',beautyFashion:'美容・被服',sub:'サブスク',selfDevelopment:'自己投資',car:'車',rent:'住居費',insurance:'保険',childEducation:'教育費'} as Record<string,string>)[category]||category,
 amount:FIXTURE_AMOUNTS[category]??0,known:true,applicability:'applicable',cMethod:null as string|null,
 diagnosisAmountLabel:'診断で入力した月額',
 status:'review',v5Status:['mobile','sub','insurance','selfDevelopment'].includes(category)?'inspect':'ok',
 v5StatusLabel:'見極める',
 diagnosisAmount:FIXTURE_AMOUNTS[category]??0,comparisonAmount:null as number|null,comparable:null as number|null,comparisonQuality:'none',comparisonDifference:null as number|null,
 comparisonSourceVersion:null as string|null,comparisonContext:{criteria:[] as string[]},evidenceLabel:'金額比較なし',
 reason:'架空の家計データです。実際の診断時は別途判定します。',nextAction:FIXTURE_NEXT_ACTION[category]||'今の支出内容を確認する',aAmount:0,cUpper:0,appraisal:{} as Record<string,string|number|boolean>
});
function makeFixture(example:Case){
 const spec=examples[example],anonymousUserId='chapter12-ui-synthetic-id';
 const chapter1:Chapter1HandoffV1={version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',
  anonymousUserId,sessionId:'chapter1-ui-synthetic',completedAt:'2026-10-12T00:00:00Z',
  primaryStyle:spec.style,jobCode:spec.job,jobName:spec.jobName};
 const rows=CATEGORY_IDS.map(category=>row(category));
 // Reproduce the REAL V5 mobile candidate rule: major-carrier single line
 // with monthly input ¥7,800 has review-only upper bound 7,800 − 6,000 = ¥1,800.
 // Demo values are invented for visual testing, not statistical averages or savings.
 const mobile=rows.find(r=>r.category==='mobile')!;
 mobile.appraisal={mobileScope:'mobileOnly',mobileCarrier:'major'};
 mobile.v5Status='optimize';
 mobile.cUpper=example==='no_uncertain'?0:1800;
 mobile.cMethod=example==='no_uncertain'?null:'mobile';
 // The original V3.2 regression fixture uses monthly cUpper=17,854
 // (mobile: ¥5,500 + food: ¥12,354). These are PRESENTATION QA values,
 // not invented official benchmark averages or a user's verified savings.
 // See qa-chapter2-v32.ts. Real diagnostics must use buildResultViewModelV5.
 const useV32DisplayScale=example==='v32_scale'||example==='v32_scale_uncertain';
 if(useV32DisplayScale){
  // Presentation QA with a SYNTHETIC 35-year-old / 2-person / Tokyo rental profile.
  // Recover realistic contrast by using the *existing frozen* comparable resolver,
  // rather than leaving almost every category at 'none'. The food QA amount below
  // is deliberately retained as a visibly marked synthetic V3.2 regression value.
  const sample=resolveComparableV2({
   household:'multi',householdSize:2,age:35,prefecture:'東京都',
   month:10,housingType:'賃貸',insuranceScope:'household'
  });
  const criteria:Record<string,string[]>={
   energy:['2人世帯','東京都','10月'],
   daily:['2人世帯'],fun:['2人世帯'],
   beautyFashion:['30〜39歳（参考モデル）'],
   rent:['東京都','民営賃貸']
  };
  for(const category of Object.keys(criteria)){
   const rowData=rows.find(r=>r.category===category)!;
   const reference=sample[category as keyof typeof sample];
   if(reference?.value===null||reference?.value===undefined||reference.confidence==='AUDIT')continue;
   rowData.comparisonAmount=rowData.amount;
   rowData.comparable=reference.value;
   rowData.comparisonDifference=rowData.amount-reference.value;
   rowData.comparisonQuality=reference.confidence==='MODEL'?'reference':'exact';
   rowData.comparisonSourceVersion=reference.sourceVersion;
   rowData.comparisonContext={criteria:criteria[category]};
   rowData.evidenceLabel='仮のプロフィールに対する正本比較ルールの表示見本';
  }

  mobile.amount=11500;
  mobile.diagnosisAmount=11500;
  mobile.cUpper=5500;
  const foodCandidate=rows.find(r=>r.category==='food')!;
  foodCandidate.cUpper=12354;
  foodCandidate.cMethod='standard';
  // 54,000 - 1.10 * 37,860 = 12,354; explicitly synthetic comparator,
  // not an official average nor a guaranteed saving.
  foodCandidate.comparable=37860;
  foodCandidate.comparisonDifference=16140;
  // Display QA ONLY: synthetic comparable. Never label this amount as an official survey average.
  foodCandidate.comparisonAmount=54000;
  foodCandidate.comparisonQuality='exact';
  foodCandidate.comparisonSourceVersion='SYNTHETIC_PILOT_COMPARATOR';
  foodCandidate.comparisonContext={criteria:['架空デモの比較条件']};
  foodCandidate.evidenceLabel='画面確認用の架空の比較基準';
  foodCandidate.v5Status='inspect';
  foodCandidate.v5StatusLabel='見極める';
 }

 const fun=rows.find(r=>r.category==='fun')!,self=rows.find(r=>r.category==='selfDevelopment')!;
 const sub=rows.find(r=>r.category==='sub')!;
 if(example==='enjoy_good'||example==='enjoy_dual'||example==='v32_scale'||example==='optimize_dual'||example==='partial'){fun.v5Status='protect';fun.appraisal={satisfaction:'verySatisfied'};}
 if(example==='enjoy_question'){fun.v5Status='optimize';fun.appraisal={satisfaction:'inertia'};}
 if(example==='drive_good'||example==='drive_dual'){self.v5Status='protect';self.appraisal={selfDevelopmentValue:'purpose'};}
 if(example==='drive_inertia'){self.v5Status='cut';self.appraisal={selfDevelopmentValue:'inertia'};}
 if(example==='secure_check'){const insurance=rows.find(r=>r.category==='insurance')!;insurance.v5Status='optimize';insurance.appraisal={insurancePurpose:'unclear',insuranceLastReview:'unknown'};}
 if(example==='secure_recent'){const insurance=rows.find(r=>r.category==='insurance')!;insurance.v5Status='inspect';insurance.appraisal={insurancePurpose:'mostly',insuranceLastReview:'within1y'};}
 if(example==='coverage_zero'){const insurance=rows.find(r=>r.category==='insurance')!;insurance.amount=0;insurance.diagnosisAmount=0;insurance.v5Status='ok';insurance.appraisal={};}
 if(example==='secure_no_link'){const insurance=rows.find(r=>r.category==='insurance')!;insurance.v5Status='protect';insurance.appraisal={insurancePurpose:'clear',insuranceLastReview:'within1y'};}
 if(['optimize_question','enjoy_dual','v32_scale','drive_dual','optimize_dual'].includes(example)){
  sub.v5Status='cut';sub.appraisal={subUnusedAmount:1200,subCancellationConfirmed:true};sub.aAmount=1200;
 }
 const caseRows=example==='partial'?rows.slice(0,11):rows;
 const reviewUpper=caseRows.reduce((sum,x)=>sum+x.cUpper,0);
 const confirmedA=caseRows.reduce((sum,x)=>sum+x.aAmount,0);
 const totals={cut:0,optimize:0,protect:0,inspect:0,ok:0,na:0};
 for(const r of caseRows){const k=r.v5Status as keyof typeof totals;if(k in totals)totals[k]++;}
 return {chapter1,anonymousUserId,
  vm:{
   version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'chapter2-ui-synthetic',
   v5Counts:totals,rows:caseRows,firstQuest:null,consultRoute:null,
   // Anonymous, fictitious Chapter 1 lineage for displaying continuity in
   // the isolated pilot. No income, spend or participant data is copied.
   chapter1Link:{schemaVersion:'MUDAGIRI_CHAPTER1_LINKAGE_V1',
    chapter1SessionId:chapter1.sessionId,chapter1JobCode:chapter1.jobCode,
    chapter1JobName:chapter1.jobName,chapter1StyleCode:chapter1.primaryStyle,
    chapter1CompletedAt:chapter1.completedAt},
   potential:{confirmedA,cUpper:reviewUpper,lower:confirmedA,upper:confirmedA+reviewUpper,
    oneYear:{lower:confirmedA*12,upper:(confirmedA+reviewUpper)*12},
    fiveYear:{lower:confirmedA*60,upper:(confirmedA+reviewUpper)*60},
    tenYear:{lower:confirmedA*120,upper:(confirmedA+reviewUpper)*120}},
   improvement:{monthly:0},type:{code:'',name:'',axes:{fv:0,pi:0,au:0},axisStrength:{fv:0,pi:0,au:0}}
  }
 };
}
function App(){
 // A neutral participant-facing link: no developer case chooser or leading hints.
 // The entire test is synthetic and does not collect or submit participant input.
 const pilotMode=new URLSearchParams(window.location.search).get('pilot')==='1';
 // QA-only dry run: keeps all regular preview actions disabled; it captures
 // only the insurance intent callback without opening LINE or sending to GAS.
 const coverageDryRun=!pilotMode&&new URLSearchParams(window.location.search).get('qaCoverageHandoff')==='1';
 const requestedCase=new URLSearchParams(window.location.search).get('case');
 const initialCase:Case=requestedCase&&Object.prototype.hasOwnProperty.call(examples,requestedCase)
  ?requestedCase as Case:'v32_scale';
 const [selected,setSelected]=useState<Case>(initialCase);
 const {chapter1,anonymousUserId,vm}=makeFixture(selected);
 return <div className={'c12preview'+(pilotMode?' c12preview--participant':'')}>
   {pilotMode?<header className="c12preview-participant-banner" data-pilot-role="participant">
     <strong>家計クエスト｜調査用の画面見本</strong>
     <p>架空の回答を使った結果です。実際の家計や個人情報は入力しません。スクロールして、普段どおりにご覧ください。</p>
     <small>※表示される相談・共有は見本です。予約・SNS投稿・個人情報送信は行いません。架空プロフィールに正本の比較ルールを適用した目安を表示しています。食費の¥37,860だけは旧表示QA用の架空額です。実際の家計データではありません。</small>
    </header>:<div className="c12preview-top">
     <div><small>RESEARCH PREVIEW / CHAPTER 1 × 2</small><h1>お金の性格、答え合わせ。</h1></div>
     <p>架空の回答で第2章V3.2のリザルトを使った架空デモ。金額・JOBはすべて見本で、実際の診断結果ではありません。</p>
     <label htmlFor="case-change">確認するケースを切り替える</label>
     <select id="case-change" value={selected} onChange={e=>setSelected(e.target.value as Case)}>
      {(Object.keys(examples) as Case[]).map(key=><option key={key} value={key}>{examples[key].label}</option>)}
     </select>
     <p>{examples[selected].desc}</p>
     <div className="c12preview-disclaimer">すべて架空のデータによる表示見本です。一部の目安は架空のプロフィールに正本比較ルールを適用した表示見本です。食費¥37,860のみ旧QA用の架空額です。未設定のカテゴリでも実際の条件によって比較値が出る場合があります。実際の金額は12カテゴリと属性に応じて算出します。未確定候補は節約済みではなく、GAS・予約・SNSへの送信はしません。</div>
     <button type="button" onClick={()=>document.querySelector('[data-section=FUTURE_REWARDS]')?.scrollIntoView({behavior:'smooth'})}>未確定の1年・5年・10年を見る ↓</button>
     <button type="button" onClick={()=>document.querySelector('[data-section=CHAPTER12_ANSWER_CHECK]')?.scrollIntoView({behavior:'smooth'})}>お金の性格の答え合わせを見る ↓</button>
   </div>}
   <div className="c12preview-stage">
    <ResultScreenChapter2V32 key={selected} vm={vm} chapter1={chapter1} answerCheckEnabled
     answerCheckAnonymousUserId={selected==='identity_mismatch'?'somebody-else':anonymousUserId}
     answerCheckDemo pilotNoExternalActions coverageDryRun={coverageDryRun}
     onEvent={(name:string,data?:Record<string,unknown>)=>{if(coverageDryRun){const w=window as any;w.__coverageEvents=[...(w.__coverageEvents||[]),{name,data}];}}}
     onLine={(payload:any)=>{if(coverageDryRun)(window as any).__coverageHandoff=payload;}} onBeforeExternal={()=>{}}/>
   </div>
 </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
