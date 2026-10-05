import React,{useCallback,useState} from 'react';
import type {JobCode} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import AdventurerClassUnlockV1 from './AdventurerClassUnlockV1';
import ResultNextRoutesV1 from './ResultNextRoutesV1';
import JobEncyclopediaV1 from './JobEncyclopediaV1';
import JobShareCardV1 from './JobShareCardV1';
import LineBonusPreviewV1 from './LineBonusPreviewV1';

type Step='unlock'|'routes'|'share'|'book'|'line';
type Props={jobCode:JobCode;styleLabel:string;secondaryStyleLabel:string;householdUrl:string;onBack:()=>void};
const LINE_URL=''; // Set official LINE friend-add URL before production release.
const HANDOFF_KEY='mudagiri_money_personality_handoff_v1';
const CLASS_KEY='mudagiri_adventurer_class_v1';

export default function ResultJourneyV1({jobCode,styleLabel,secondaryStyleLabel,householdUrl,onBack}:Props){
 const [step,setStep]=useState<Step>('unlock');
 const asset=jobCharacterAsset(jobCode);
 const saveClass=useCallback(()=>{try{localStorage.setItem(CLASS_KEY,jobCode)}catch{}},[jobCode]);
 const goHousehold=useCallback(()=>{saveClass();window.location.href=householdUrl},[saveClass,householdUrl]);
 const share=useCallback(async()=>{
  const text=`私の冒険者CLASSは「${asset.name}」だった！ ${styleLabel} STYLE｜あなたはどのCLASS？ #ムダギリ診断 #お金の性格診断`;
  try{if(navigator.share){await navigator.share({title:'ムダギリ｜お金の性格診断',text,url:window.location.href});return}await navigator.clipboard.writeText(`${text} ${window.location.href}`)}catch{}
 },[asset.name,styleLabel]);
 const addLine=useCallback(()=>{
  saveClass();
  try{localStorage.setItem(HANDOFF_KEY,JSON.stringify({jobCode,createdAt:new Date().toISOString(),next:'household',reward:'class-guide-v1'}))}catch{}
  if(LINE_URL){window.location.href=LINE_URL;return}
  setStep('routes');
 },[jobCode,saveClass]);
 if(step==='unlock')return <AdventurerClassUnlockV1 jobCode={jobCode} onComplete={()=>{saveClass();setStep('routes')}}/>;
 if(step==='share')return <main className="mpp-page mpp-page--guild"><section className="mpp-card"><JobShareCardV1 jobCode={jobCode} styleLabel={styleLabel} secondaryStyleLabel={secondaryStyleLabel} onShare={share}/><button className="mpp-ghost" onClick={()=>setStep('routes')}>戻る</button></section></main>;
 if(step==='book')return <main className="mpp-page mpp-page--guild"><JobEncyclopediaV1 unlocked={jobCode} onClose={()=>setStep('routes')}/></main>;
 if(step==='line')return <LineBonusPreviewV1 jobCode={jobCode} onAddLine={addLine} onSkip={goHousehold}/>;
 return <main className="mpp-page mpp-page--guild"><section className="mpp-card"><ResultNextRoutesV1 jobCode={jobCode} onHousehold={goHousehold} onLine={()=>setStep('line')} onShare={()=>setStep('share')} onOpenBook={()=>setStep('book')}/><button className="mpp-ghost" onClick={onBack}>診断結果に戻る</button></section></main>;
}
