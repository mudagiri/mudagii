import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import {moneyTypeIdentity} from './money-type-identity-v1';
import {resultV9For} from './resultV9Content';
import JobCharacterCard from './JobCharacterCard';
import './job-share-v1.css';

type Props={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;onShare?:()=>void};

export default function JobShareCardV1({jobCode,primaryStyle,onShare}:Props){
  const asset=jobCharacterAsset(jobCode);
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const identity=moneyTypeIdentity(jobCode,primaryStyle);
  const result=resultV9For(jobCode,primaryStyle);
  const tags=result.scenes.slice(0,3).map(scene=>'#'+scene.label.replace(/\p{Extended_Pictographic}/gu,'').replace(/[\s　]/g,'').replace(/[・/]/g,'').replace(/^[#]+/,''));
  return <section className="mpp-job-share" data-job={jobCode} data-money-type={typeCode} style={{'--job-accent':asset.accent} as React.CSSProperties}>
    <div className="mpp-job-share-card" aria-label={`${typeCode} ${asset.name} シェアカード`}>
      <div className="mpp-job-share-jobbg" aria-hidden="true"/>
      <div className="mpp-job-share-diamond" aria-hidden="true"/>
      <div className="mpp-job-share-edge" aria-hidden="true"/>
      <header className="mpp-job-share-header"><span>MUDAGIRI / MONEY TYPE</span><b>1 / 32</b></header>
      <div className="mpp-job-share-code">{typeCode}</div>
      <div className="mpp-job-share-style">{identity.styleTypeLabel}</div>
      <div className="mpp-job-share-portrait"><div className="mpp-job-share-reticle" aria-hidden="true"/><JobCharacterCard jobCode={jobCode} variant="hero"/></div>
      <div className="mpp-job-share-copy"><small>あなたのお金タイプ</small><h2>{identity.compact}</h2><p>{result.hero}</p></div>
      <div className="mpp-job-share-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>
      <footer><b>ムダギリ｜お金の性格診断</b><span>{asset.animal}</span></footer>
    </div>
    {onShare&&<button className="mpp-primary mpp-job-share-button" onClick={onShare}>「{typeCode}」をシェアする</button>}
  </section>;
}
