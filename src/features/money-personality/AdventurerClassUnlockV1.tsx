import React,{useEffect,useState} from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {CLASS_UNLOCK_SEQUENCE} from './mudagiri-personality-visual-v1';
import MoneyPersonalityMudagiri from './MoneyPersonalityMudagiri';
import JobCharacterCard from './JobCharacterCard';
import JobShareCardV1 from './JobShareCardV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
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
  const share=async()=>{
    const text=`私のお金タイプは「${typeCode}｜${asset.name}」だった！ ${styleLabel} STYLE｜あなたはどのタイプ？ #ムダギリ診断 #お金の性格診断`;
    try{if(navigator.share){await navigator.share({title:'ムダギリ｜お金の性格診断',text,url:window.location.href});return}await navigator.clipboard.writeText(`${text} ${window.location.href}`)}catch{}
  };
  return <main className={`mpp-transition-scene mpp-class-unlock${reveal?' is-job-revealed':''}`} data-scene="class-unlock" data-job={jobCode} data-money-type={typeCode}>
    <section className="mpp-transition-card">
      <div className="mpp-transition-copy">{current.key==='think'?'YOUR MONEY TYPE → QUEST CLASS':current.key==='unlock'?'CLASS SIGNAL FOUND':'SSR / MONEY TYPE ACQUIRED'}</div>
      {reveal?<>
        <div className="mpp-ssr-rarity">SSR</div>
        <div className="mpp-ssr-type-code">{typeCode}</div>
        <JobCharacterCard jobCode={jobCode} variant="unlock" showName/>
        <div className="mpp-ssr-style">{styleLabel} STYLE</div>
      </>:<MoneyPersonalityMudagiri visual={current} alt="ムダギリくん"/>}
      {!reveal&&<h2>{current.key==='think'?'あなたの冒険スタイルを解析中…':'あなた専用のCLASSを発見！'}</h2>}
      <div className="mpp-transition-scan"/>
      {reveal?<>
        <p><b>{asset.tagline}</b><br/>32のお金タイプから、あなたのTYPEを獲得しました。</p>
        <JobShareCardV1 jobCode={jobCode} primaryStyle={primaryStyle} styleLabel={styleLabel} onShare={share}/>
        <button className="mpp-primary mpp-ssr-continue" onClick={()=>{window.scrollTo({top:0,behavior:'auto'});onComplete()}}>次へ進む</button>
      </>:<p>あなたのお金タイプから、冒険者CLASSを生成しています。</p>}
    </section>
  </main>;
}
