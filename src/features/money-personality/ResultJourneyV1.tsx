import React,{useCallback,useState} from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {moneyTypeCode} from './money-type-code-v1';
import {shareJobTypeImage} from './job-share-image-v1';
import ResultNextRoutesV1 from './ResultNextRoutesV1';
import JobEncyclopediaV1 from './JobEncyclopediaV1';
import JobShareCardV1 from './JobShareCardV1';
import LineBonusPreviewV1 from './LineBonusPreviewV1';

type Step='routes'|'share'|'book'|'line';
type Props={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;householdUrl:string;onBack:()=>void};
const LINE_URL=''; // Set official LINE friend-add URL before production release.
const HANDOFF_KEY='mudagiri_money_personality_handoff_v1';
const CLASS_KEY='mudagiri_adventurer_class_v1';

export default function ResultJourneyV1({jobCode,primaryStyle,styleLabel,householdUrl,onBack}:Props){
 const [step,setStep]=useState<Step>('routes');
 const [shareStatus,setShareStatus]=useState('');
 const typeCode=moneyTypeCode(jobCode,primaryStyle);
 const saveClass=useCallback(()=>{try{localStorage.setItem(CLASS_KEY,jobCode)}catch{}},[jobCode]);
 const goHousehold=useCallback(()=>{saveClass();window.location.href=householdUrl},[saveClass,householdUrl]);
 const share=useCallback(async()=>{
  setShareStatus('SSRカード画像を作成中…');
  const result=await shareJobTypeImage({jobCode,primaryStyle,styleLabel});
  if(result==='shared')setShareStatus('SSRカードを共有しました。');
  else if(result==='downloaded')setShareStatus('この端末では画像共有が使えないため、SSRカード画像を保存しました。');
  else setShareStatus('画像共有が使えないため、TYPE情報を共有しました。');
 },[jobCode,primaryStyle,styleLabel]);
 const addLine=useCallback(()=>{
  saveClass();
  try{localStorage.setItem(HANDOFF_KEY,JSON.stringify({jobCode,typeCode,primaryStyle,createdAt:new Date().toISOString(),next:'household',reward:'class-guide-v1'}))}catch{}
  if(LINE_URL){window.location.href=LINE_URL;return}
  setStep('routes');
 },[jobCode,primaryStyle,saveClass,typeCode]);
 if(step==='share')return <main className="mpp-page mpp-page--guild"><section className="mpp-card"><div className="mpp-result-v4-chapter-label">MY TYPE CARD</div><JobShareCardV1 jobCode={jobCode} primaryStyle={primaryStyle} styleLabel={styleLabel} onShare={share}/>{shareStatus&&<p className="mpp-share-status" role="status" aria-live="polite">{shareStatus}</p>}<button className="mpp-secondary" onClick={()=>setStep('book')}>JOB図鑑を見る</button><button className="mpp-primary" onClick={()=>setStep('routes')}>次のクエストを選ぶ</button><button className="mpp-ghost" onClick={onBack}>診断結果に戻る</button></section></main>;
 if(step==='book')return <main className="mpp-page mpp-page--guild"><JobEncyclopediaV1 unlocked={jobCode} primaryStyle={primaryStyle} onClose={()=>setStep('routes')}/></main>;
 if(step==='line')return <LineBonusPreviewV1 jobCode={jobCode} onAddLine={addLine} onSkip={goHousehold}/>;
 return <main className="mpp-page mpp-page--guild"><section className="mpp-card"><ResultNextRoutesV1 jobCode={jobCode} primaryStyle={primaryStyle} onHousehold={goHousehold} onLine={()=>setStep('line')} onShare={()=>setStep('share')} onOpenBook={()=>setStep('book')}/><button className="mpp-ghost" onClick={onBack}>診断結果に戻る</button></section></main>;
}
