import React,{useState} from 'react';
import type {JobCode} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import './job-character-v1.css';

type Props={
  jobCode:JobCode;
  variant?:'hero'|'unlock'|'compact';
  showName?:boolean;
  className?:string;
};

export default function JobCharacterCard({jobCode,variant='hero',showName=false,className=''}:Props){
  const asset=jobCharacterAsset(jobCode);
  const [missing,setMissing]=useState(false);
  return <div className={`mpp-job-character mpp-job-character--${variant} mpp-job-effect--${asset.effect} ${className}`} style={{'--job-accent':asset.accent} as React.CSSProperties} data-job={jobCode}>
    <div className="mpp-job-aura" aria-hidden="true"><i/><i/><i/><i/></div>
    {!missing?<img src={asset.file} alt={`${asset.name}（${asset.animal}）`} onError={()=>setMissing(true)}/>:<div className="mpp-job-placeholder" aria-label={`${asset.name}画像は後から追加`}><span>JOB</span><b>{String(asset.jobNumber).padStart(2,'0')}</b><small>ART READY</small></div>}
    {showName&&<div className="mpp-job-character-caption"><small>ADVENTURER CLASS</small><b>{asset.name}</b><span>{asset.tagline}</span></div>}
  </div>;
}
