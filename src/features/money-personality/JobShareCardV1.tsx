import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import JobCharacterCard from './JobCharacterCard';
import './job-share-v1.css';

type Props={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;onShare?:()=>void};

export default function JobShareCardV1({jobCode,primaryStyle,styleLabel,onShare}:Props){
  const asset=jobCharacterAsset(jobCode);const typeCode=moneyTypeCode(jobCode,primaryStyle);
  return <section className="mpp-job-share" data-job={jobCode} data-money-type={typeCode} style={{'--job-accent':asset.accent} as React.CSSProperties}>
    <div className="mpp-job-share-card" aria-label={`${typeCode} ${asset.name} シェアカード`}>
      <header className="mpp-job-share-header"><span>MUDAGIRI / MONEY TYPE</span><b>1 OF 32</b></header>
      <div className="mpp-job-share-code">{typeCode}</div>
      <div className="mpp-job-share-style">{styleLabel} STYLE</div>
      <JobCharacterCard jobCode={jobCode} variant="hero"/>
      <div className="mpp-job-share-copy"><small>私のお金タイプは</small><h2>{asset.name}</h2><p>{asset.tagline}</p></div>
      <div className="mpp-job-share-identity"><span>CLASS {String(asset.jobNumber).padStart(2,'0')} · {jobCode}</span><i/> <span>{styleLabel}</span></div>
      <div className="mpp-job-share-hook"><small>32タイプのうち、あなたは？</small><strong>あなたのTYPEも見せて。</strong></div>
      <footer><b>ムダギリ診断</b><span>#ムダギリ診断　#お金の性格診断</span></footer>
    </div>
    {onShare&&<button className="mpp-primary mpp-job-share-button" onClick={onShare}>「{typeCode}」をシェアする</button>}
  </section>;
}
