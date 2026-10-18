import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import ResultScreenChapter2V32 from './ResultScreenChapter2V32';
import './src/style.css';

const rows=[
 {category:'food',label:'食費',known:true,amount:160000,diagnosisAmount:160000,
  comparisonAmount:160000,comparable:120000,comparisonQuality:'exact',
  v5Status:'inspect',applicability:'applicable',aAmount:0,cUpper:0},
 {category:'energy',label:'光熱・水道費',known:true,amount:30000,diagnosisAmount:30000,
  comparisonAmount:30000,comparable:28000,comparisonQuality:'exact',
  v5Status:'inspect',applicability:'applicable',aAmount:0,cUpper:0},
 {category:'daily',label:'日用品費',known:true,amount:9000,diagnosisAmount:9000,
  comparisonAmount:9000,comparable:7000,comparisonQuality:'exact',
  v5Status:'inspect',applicability:'applicable',aAmount:0,cUpper:0},
];
// Strictly synthetic profile. The only real data loaded is the public
// age×gross-income source. This harness is NOT included in the Vite dist build.
function App(){
 const [age,setAge]=useState(45);
 const vm={
  version:'MUDAGIRI_RESULT_VM_V5_0',
  diagnosisId:'qa-high-income-synthetic-only',
  profile:{diagnosisScope:'household',householdSize:4,age,annualIncomeBand:'1000plus',
    monthlyTakeHome:1000000,prefecture:'東京都'},
  potential:{confirmedA:0,cUpper:0},v5Counts:{cut:0,optimize:0,protect:0,inspect:3,ok:0,na:0},
  rows,firstQuest:null,consultRoute:null,
 };
 return <>
  <section aria-label="高所得比較QA操作パネル" data-qa-only="true"
   style={{position:'relative',zIndex:40,background:'#fff',color:'#000',padding:12}}>
   <label htmlFor="qa-head-age">テスト専用・世帯主の年齢</label>
   <select id="qa-head-age" value={age} onChange={e=>setAge(Number(e.target.value))}>
    {[25,35,45,55,65,75].map(a=><option key={a} value={a}>{a}歳</option>)}
   </select>
   <small>合成入力：4人世帯・額面1,000万円以上・月手取り100万円。
    第1章、診断本体、GAS、LINEには接続しません。</small>
  </section>
  <ResultScreenChapter2V32 vm={vm} pilotNoExternalActions={true} coverageDryRun={true} />
 </>;
}
createRoot(document.getElementById('root')!).render(<App/>);
