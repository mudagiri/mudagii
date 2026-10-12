import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import ResultScreenChapter2V32 from '../ResultScreenChapter2V32';
import {CATEGORY_IDS} from '../scripts/chapter12-answercheck-experiment-v1.mjs';
import type {Chapter1HandoffV1} from '../chapter2-v2-contract';
import './chapter12-answercheck-preview.css';

type Case='enjoy_good'|'enjoy_question'|'drive_good'|'optimize_question'|'secure_no_link'|'identity_mismatch'|'partial';
const examples:Record<Case,{label:string;desc:string;style:string;job:string;jobName:string}>={
 enjoy_good:{label:'楽しさ × 守る支出',desc:'娯楽費に満足していて守りたいと答えた例',style:'ENJOY',job:'INM',jobName:'直感魔導士'},
 enjoy_question:{label:'楽しさ × 見直したい支出',desc:'娯楽費の使い方に本人が見直し意向を示した例',style:'ENJOY',job:'INP',jobName:'風読み剣士'},
 drive_good:{label:'前進 × 目的のある自己投資',desc:'目的のある自己投資を守ると答えた例',style:'DRIVE',job:'FDM',jobName:'先回り司令官'},
 optimize_question:{label:'納得 × 未使用サブスク',desc:'未使用・解約可能を確認した契約がある例',style:'OPTIMIZE',job:'IDM',jobName:'メリハリ賢者'},
 secure_no_link:{label:'安心 × 根拠が足りない',desc:'安心重視でも保険の額だけから一致と決めない例',style:'SECURE',job:'FNM',jobName:'兆しの占星術師'},
 identity_mismatch:{label:'別人・ID不一致',desc:'本人が同じと証明できなければカード非表示',style:'ENJOY',job:'INM',jobName:'直感魔導士'},
 partial:{label:'カテゴリ未完了',desc:'12カテゴリ未完了の場合はカード非表示',style:'ENJOY',job:'INM',jobName:'直感魔導士'}
};
const row=(category:string)=>({
 category,label:({fun:'娯楽・趣味',sub:'サブスク',selfDevelopment:'自己投資'} as Record<string,string>)[category]||category,
 amount:0,known:true,applicability:'applicable',status:'safe',v5Status:'ok',v5StatusLabel:'今はそのままでOK',
 diagnosisAmount:0,comparisonAmount:null,comparable:null,comparisonQuality:'none',comparisonDifference:null,
 reason:'デモの入力内容です。',nextAction:'今の支出内容を確認する',aAmount:0,cUpper:0,appraisal:{}
});
function makeFixture(example:Case){
 const spec=examples[example],anonymousUserId='chapter12-ui-synthetic-id';
 const chapter1:Chapter1HandoffV1={version:'MUDAGIRI_MONEY_TYPE_HANDOFF_V1',
  anonymousUserId,sessionId:'chapter1-ui-synthetic',completedAt:'2026-10-12T00:00:00Z',
  primaryStyle:spec.style,jobCode:spec.job,jobName:spec.jobName};
 const rows=CATEGORY_IDS.map(category=>row(category));
 const fun=rows.find(r=>r.category==='fun')!,self=rows.find(r=>r.category==='selfDevelopment')!;
 const sub=rows.find(r=>r.category==='sub')!;
 if(example==='enjoy_good'||example==='partial'){fun.v5Status='protect';fun.appraisal={satisfaction:'verySatisfied'};}
 if(example==='enjoy_question'){fun.v5Status='inspect';fun.appraisal={satisfaction:'inertia'};}
 if(example==='drive_good'){self.v5Status='protect';self.appraisal={selfDevelopmentValue:'purpose'};}
 if(example==='optimize_question'){
  sub.v5Status='cut';sub.appraisal={subUnusedAmount:1200,subCancellationConfirmed:true};sub.aAmount=1200;
 }
 const caseRows=example==='partial'?rows.slice(0,11):rows;
 const totals={cut:0,optimize:0,protect:0,inspect:0,ok:0,na:0};
 for(const r of caseRows){const k=r.v5Status as keyof typeof totals;if(k in totals)totals[k]++;}
 return {chapter1,anonymousUserId,
  vm:{
   version:'MUDAGIRI_RESULT_VM_V5_0',diagnosisId:'chapter2-ui-synthetic',
   v5Counts:totals,rows:caseRows,firstQuest:null,consultRoute:null,
   potential:{confirmedA:example==='optimize_question'?1200:0,cUpper:0},
   improvement:{monthly:0},type:{code:'',name:'',axes:{fv:0,pi:0,au:0},axisStrength:{fv:0,pi:0,au:0}}
  }
 };
}
function App(){
 const [selected,setSelected]=useState<Case>('enjoy_good');
 const {chapter1,anonymousUserId,vm}=makeFixture(selected);
 return <div className="c12preview">
   <div className="c12preview-top">
     <div><small>RESEARCH PREVIEW / CHAPTER 1 × 2</small><h1>お金の性格、答え合わせ。</h1></div>
     <p>架空の回答で第2章の実リザルトに試作品を差し込んだ画面です。実ユーザーの性格や家計を診断した結果ではありません。</p>
     <label htmlFor="case-change">確認するケースを切り替える</label>
     <select id="case-change" value={selected} onChange={e=>setSelected(e.target.value as Case)}>
      {(Object.keys(examples) as Case[]).map(key=><option key={key} value={key}>{examples[key].label}</option>)}
     </select>
     <p>{examples[selected].desc}</p>
     <div className="c12preview-disclaimer">同一人物の回答・完了済み12カテゴリの根拠がある時だけ表示。人格の的中率・家計の良し悪しは判定しない。GAS・予約への送信は行わない。</div>
     <button type="button" onClick={()=>document.querySelector('[data-section=CHAPTER12_ANSWER_CHECK]')?.scrollIntoView({behavior:'smooth'})}>答え合わせカードまで移動 ↓</button>
   </div>
   <div className="c12preview-stage">
    <ResultScreenChapter2V32 key={selected} vm={vm} chapter1={chapter1} answerCheckEnabled
     answerCheckAnonymousUserId={selected==='identity_mismatch'?'somebody-else':anonymousUserId}
     answerCheckDemo onLine={()=>{}} onBeforeExternal={()=>{}}/>
   </div>
 </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
