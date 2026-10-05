import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import JobCharacterCard from './JobCharacterCard';
import './job-share-v1.css';

type Props={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;secondaryStyleLabel?:string;onShare?:()=>void};

export default function JobShareCardV1({jobCode,primaryStyle,styleLabel,secondaryStyleLabel,onShare}:Props){
  const asset=jobCharacterAsset(jobCode);const typeCode=moneyTypeCode(jobCode,primaryStyle);
  return <section className="mpp-job-share" data-job={jobCode} data-money-type={typeCode} style={{'--job-accent':asset.accent} as React.CSSProperties}>
    <div className="mpp-job-share-eyebrow">MY MONEY TYPE / 32 TYPES</div>
    <div className="mpp-job-share-no">{typeCode} · JOB {String(asset.jobNumber).padStart(2,'0')}</div>
    <JobCharacterCard jobCode={jobCode} variant="hero"/>
    <div className="mpp-job-share-copy"><span>私のお金タイプは</span><h2>{asset.name}</h2><p>{asset.tagline}</p></div>
    <div className="mpp-job-share-traits"><span>PRIMARY · {styleLabel}</span>{secondaryStyleLabel&&<span>SECONDARY · {secondaryStyleLabel}</span>}</div>
    <div className="mpp-job-share-hook">あなたはどのタイプ？</div>
    <footer><b>ムダギリ診断</b><span>#ムダギリ診断　#お金の性格診断</span></footer>
    {onShare&&<button className="mpp-primary mpp-job-share-button" onClick={onShare}>このタイプをシェアする</button>}
  </section>;
}
