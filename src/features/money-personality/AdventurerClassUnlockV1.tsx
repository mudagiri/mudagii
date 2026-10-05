import React,{useEffect,useState} from 'react';
import type {JobCode} from './classifierV1';
import {CLASS_UNLOCK_SEQUENCE} from './mudagiri-personality-visual-v1';
import MoneyPersonalityMudagiri from './MoneyPersonalityMudagiri';
import JobCharacterCard from './JobCharacterCard';
import {jobCharacterAsset} from './job-character-assets-v1';

export default function AdventurerClassUnlockV1({jobCode,onComplete}:{jobCode:JobCode;onComplete:()=>void}){
  const [step,setStep]=useState(0);
  const current=CLASS_UNLOCK_SEQUENCE[Math.min(step,CLASS_UNLOCK_SEQUENCE.length-1)];
  const asset=jobCharacterAsset(jobCode);
  useEffect(()=>{
    const t=window.setTimeout(()=>{
      if(step<CLASS_UNLOCK_SEQUENCE.length-1)setStep(x=>x+1);
      else{window.scrollTo({top:0,behavior:'auto'});onComplete()}
    },current.holdMs);
    return ()=>window.clearTimeout(t);
  },[step,current.holdMs,onComplete]);
  const reveal=current.key==='result';
  return <main className={`mpp-transition-scene mpp-class-unlock${reveal?' is-job-revealed':''}`} data-scene="class-unlock" data-job={jobCode}>
    <section className="mpp-transition-card">
      <div className="mpp-transition-copy">{current.key==='think'?'お金タイプの特性をクエスト用に変換しています…':current.key==='unlock'?'CLASS SIGNAL FOUND':'ADVENTURER CLASS UNLOCKED'}</div>
      {reveal?<JobCharacterCard jobCode={jobCode} variant="unlock" showName/>:<MoneyPersonalityMudagiri visual={current} alt="ムダギリくん"/>}
      {!reveal&&<h2>{current.key==='think'?'冒険者CLASSを編成中':'家計クエストでの役割を発見！'}</h2>}
      <div className="mpp-transition-scan"/>
      {reveal?<p>{asset.tagline}<br/>このCLASSで第2章へ進みます。</p>:<p>あなたの回答から冒険者CLASSを探しています。</p>}
    </section>
  </main>;
}
