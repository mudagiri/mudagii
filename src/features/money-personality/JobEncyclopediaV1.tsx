import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {JOB_CHARACTER_ASSETS} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import JobCharacterCard from './JobCharacterCard';
import './job-encyclopedia-v1.css';

const ORDER:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:{id:StyleId;code:string;label:string}[]=[
  {id:'DRIVE',code:'D',label:'DRIVE'},{id:'ENJOY',code:'E',label:'ENJOY'},{id:'SECURE',code:'S',label:'SECURE'},{id:'OPTIMIZE',code:'O',label:'OPTIMIZE'},
];

export default function JobEncyclopediaV1({unlocked,primaryStyle,onClose}:{unlocked:JobCode;primaryStyle:StyleId;onClose?:()=>void}){
  const myType=moneyTypeCode(unlocked,primaryStyle);
  return <section className="mpp-job-book" aria-label="冒険者CLASS図鑑">
    <header><div><small>8 CLASSES × 4 STYLES = 32 TYPES</small><h2>冒険者CLASS図鑑</h2></div><span>1 / 8 CLASS</span></header>
    <div className="mpp-job-book-progress" aria-label="1 of 8 classes discovered"><i style={{width:'12.5%'}}/></div>
    <div className="mpp-job-book-rule"><b>あなたは {myType}</b><span>3文字が冒険者CLASS、最後の1文字がSTYLE。同じCLASSでもSTYLEが違えば、別のお金タイプになります。</span></div>
    <div className="mpp-job-book-style-key">{STYLES.map(s=><span key={s.id} className={s.id===primaryStyle?'is-mine':''}><b>{s.code}</b>{s.label}</span>)}</div>
    <p className="mpp-job-book-lead">あなたが発見したCLASSは1体。残り7体はまだ未発見です。友だちが診断すると、あなたとは違うCLASSやSTYLEが出るかも。</p>
    <div className="mpp-job-book-grid">{ORDER.map(code=>{const asset=JOB_CHARACTER_ASSETS[code];const isUnlocked=code===unlocked;return <article key={code} className={isUnlocked?'is-unlocked':'is-locked'} style={isUnlocked?{'--job-accent':asset.accent} as React.CSSProperties:undefined}>
      {isUnlocked?<JobCharacterCard jobCode={code} variant="compact"/>:<div className="mpp-job-book-lock" aria-hidden="true"><span>?</span></div>}
      <small>CLASS {String(asset.jobNumber).padStart(2,'0')} · {code}</small><b>{isUnlocked?asset.name:'？？？？？？'}</b><span>{isUnlocked?asset.animal:'未発見'}</span>
      {isUnlocked&&<><em>YOUR CLASS</em><div className="mpp-job-book-mytype">{myType}</div></>}
    </article>})}</div>
    <div className="mpp-job-book-gap"><b>まだ31タイプ。</b><span>あなたの周りには、どのTYPEがいる？</span></div>
    <p className="mpp-job-book-social">友だちの結果と比べてみよう　#ムダギリ診断</p>
    {onClose&&<button className="mpp-secondary" onClick={onClose}>獲得画面に戻る</button>}
  </section>;
}
