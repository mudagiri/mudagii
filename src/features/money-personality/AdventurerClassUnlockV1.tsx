import React,{useEffect,useState} from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {CLASS_UNLOCK_SEQUENCE} from './mudagiri-personality-visual-v1';
import MoneyPersonalityMudagiri from './MoneyPersonalityMudagiri';
import JobCharacterCard from './JobCharacterCard';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import {STYLE_IDENTITY} from './money-type-identity-v1';
import './job-unlock-premium-v1.css';

type Props={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;onComplete:()=>void};

export default function AdventurerClassUnlockV1({jobCode,primaryStyle,styleLabel,onComplete}:Props){
  const [step,setStep]=useState(0);
  const current=CLASS_UNLOCK_SEQUENCE[Math.min(step,CLASS_UNLOCK_SEQUENCE.length-1)];
  const asset=jobCharacterAsset(jobCode);const typeCode=moneyTypeCode(jobCode,primaryStyle);
  useEffect(()=>{
    if(current.key==='celebrate')return;
    const t=window.setTimeout(()=>setStep(x=>Math.min(x+1,CLASS_UNLOCK_SEQUENCE.length-1)),current.holdMs);
    return ()=>window.clearTimeout(t);
  },[current.key,current.holdMs]);
  const reveal=current.key==='celebrate';
  return <main className={`mpp-transition-scene mpp-class-unlock${reveal?' is-job-revealed':''}`} data-scene="class-unlock" data-job={jobCode} data-money-type={typeCode}>
    <section className="mpp-transition-card">
      <div className="mpp-transition-copy">{current.key==='think'?'YOUR MONEY TYPE → QUEST CLASS':current.key==='unlock'?'CLASS SIGNAL FOUND':'SSR / MONEY TYPE ACQUIRED'}</div>
      {reveal?<>
        <div className="mpp-ssr-rarity">SSR</div>
        <div className="mpp-ssr-type-code">{typeCode}</div>
        <JobCharacterCard jobCode={jobCode} variant="unlock" showName/>
        <div className="mpp-ssr-style">{STYLE_IDENTITY[primaryStyle].label} · {STYLE_IDENTITY[primaryStyle].short}</div>
      </>:<MoneyPersonalityMudagiri visual={current} alt="ムダギリくん"/>}
      {!reveal&&<h2>{current.key==='think'?'どんなお金タイプかな？':'あなたのJOBが見つかった！'}</h2>}
      <div className="mpp-transition-scan"/>
      {reveal?<>
        <p><b>{asset.tagline}</b><br/>32のお金タイプから、あなたのTYPEを獲得しました。</p>
        <button className="mpp-primary mpp-ssr-continue" onClick={()=>{window.scrollTo({top:0,behavior:'auto'});onComplete()}}>結果を見る</button>
      </>:<p>ムダギリくんが、あなたのJOBを探しているぞ。</p>}
    </section>
  </main>;
}
