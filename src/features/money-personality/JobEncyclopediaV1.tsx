import React from 'react';
import type {JobCode} from './classifierV1';
import {JOB_CHARACTER_ASSETS} from './job-character-assets-v1';
import JobCharacterCard from './JobCharacterCard';
import './job-encyclopedia-v1.css';

const ORDER:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];

export default function JobEncyclopediaV1({unlocked,onClose}:{unlocked:JobCode;onClose?:()=>void}){
  return <section className="mpp-job-book" aria-label="冒険者CLASS図鑑">
    <header><div><small>ADVENTURER CLASS COLLECTION</small><h2>冒険者CLASS図鑑</h2></div><span>1 / 8 UNLOCKED</span></header>
    <div className="mpp-job-book-progress" aria-label="1 of 8 classes unlocked"><i style={{width:'12.5%'}}/></div>
    <p className="mpp-job-book-lead">あなたが最初に発見したのは、このCLASS。残り7体はまだ未発見です。友だちの診断結果には、別のCLASSが眠っているかも。</p>
    <div className="mpp-job-book-grid">{ORDER.map(code=>{const asset=JOB_CHARACTER_ASSETS[code];const isUnlocked=code===unlocked;return <article key={code} className={isUnlocked?'is-unlocked':'is-locked'} style={isUnlocked?{'--job-accent':asset.accent} as React.CSSProperties:undefined}>
      {isUnlocked?<JobCharacterCard jobCode={code} variant="compact"/>:<div className="mpp-job-book-lock" aria-hidden="true"><span>?</span></div>}
      <small>JOB {String(asset.jobNumber).padStart(2,'0')}</small><b>{isUnlocked?asset.name:'？？？？？？'}</b><span>{isUnlocked?asset.animal:'未発見'}</span>
      {isUnlocked&&<em>YOUR CLASS</em>}
    </article>})}</div>
    <p className="mpp-job-book-social">8つ全部見つけられる？　#ムダギリ診断</p>
    {onClose&&<button className="mpp-secondary" onClick={onClose}>結果に戻る</button>}
  </section>;
}
