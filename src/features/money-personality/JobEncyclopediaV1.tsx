import React from 'react';
import type {JobCode} from './classifierV1';
import {JOB_CHARACTER_ASSETS} from './job-character-assets-v1';
import JobCharacterCard from './JobCharacterCard';

const ORDER:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];

export default function JobEncyclopediaV1({unlocked,onClose}:{unlocked:JobCode;onClose?:()=>void}){
  return <section className="mpp-job-book" aria-label="冒険者CLASS図鑑">
    <header><div><small>ADVENTURER CLASS</small><h2>冒険者CLASS図鑑</h2></div><span>1 / 8 UNLOCKED</span></header>
    <p className="mpp-job-book-lead">診断で見つかったCLASSだけが先に解放されます。ほかのCLASSは、シェアした友だちの結果でも発見できます。</p>
    <div className="mpp-job-book-grid">{ORDER.map(code=>{const asset=JOB_CHARACTER_ASSETS[code];const isUnlocked=code===unlocked;return <article key={code} className={isUnlocked?'is-unlocked':'is-locked'}>
      {isUnlocked?<JobCharacterCard jobCode={code} variant="compact"/>:<div className="mpp-job-book-lock">?</div>}
      <small>JOB {String(asset.jobNumber).padStart(2,'0')}</small><b>{isUnlocked?asset.name:'？？？？？？'}</b><span>{isUnlocked?asset.animal:'未発見'}</span>
    </article>})}</div>
    {onClose&&<button className="mpp-secondary" onClick={onClose}>結果に戻る</button>}
  </section>;
}
