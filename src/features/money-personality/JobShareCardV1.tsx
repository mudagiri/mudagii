import React from 'react';
import type {JobCode} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import JobCharacterCard from './JobCharacterCard';
import './job-share-v1.css';

type Props={jobCode:JobCode;styleLabel:string;secondaryStyleLabel?:string;onShare?:()=>void};

export default function JobShareCardV1({jobCode,styleLabel,secondaryStyleLabel,onShare}:Props){
  const asset=jobCharacterAsset(jobCode);
  return <section className="mpp-job-share" data-job={jobCode} style={{'--job-accent':asset.accent} as React.CSSProperties}>
    <div className="mpp-job-share-eyebrow">MY ADVENTURER CLASS</div>
    <div className="mpp-job-share-no">JOB {String(asset.jobNumber).padStart(2,'0')} / 08</div>
    <JobCharacterCard jobCode={jobCode} variant="hero"/>
    <div className="mpp-job-share-copy"><span>私の冒険者CLASSは</span><h2>{asset.name}</h2><p>{asset.tagline}</p></div>
    <div className="mpp-job-share-traits"><span>{styleLabel}が最優先</span>{secondaryStyleLabel&&<span>次に {secondaryStyleLabel}</span>}</div>
    <div className="mpp-job-share-hook">あなたはどのCLASS？</div>
    <footer><b>ムダギリ診断</b><span>#ムダギリ診断　#お金の性格診断</span></footer>
    {onShare&&<button className="mpp-primary mpp-job-share-button" onClick={onShare}>このCLASSをシェアする</button>}
  </section>;
}
