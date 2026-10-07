import React from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {JOB_CHARACTER_ASSETS} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import {moneyTypeIdentity,STYLE_IDENTITY} from './money-type-identity-v1';
import JobCharacterCard from './JobCharacterCard';
import './job-encyclopedia-v1.css';
import './job-encyclopedia-v2.css';

const ORDER:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];

export default function JobEncyclopediaV1({unlocked,primaryStyle,onClose}:{unlocked:JobCode;primaryStyle:StyleId;onClose?:()=>void}){
  const mine=moneyTypeIdentity(unlocked,primaryStyle);
  return <section className="mpp-job-book" aria-label="32TYPE図鑑">
    <header><div><small>8 JOB × 4 価値観 = 32 TYPE</small><h2>32TYPE図鑑</h2></div><span>MY TYPE · 1 / 32</span></header>
    <div className="mpp-job-book-progress" aria-label="1 of 32 types"><i style={{width:'3.125%'}}/></div>

    <div className="mpp-job-book-rule">
      <small>あなたのTYPE</small>
      <b>{mine.full}</b>
      <span>3文字がJOB、最後の1文字が価値観。友だちのコードが分かれば、この図鑑ですぐ違いを探せます。</span>
    </div>

    <div className="mpp-job-book-style-key">
      {STYLES.map(style=><span key={style} className={style===primaryStyle?'is-mine':''}><b>{STYLE_IDENTITY[style].code}</b>{STYLE_IDENTITY[style].label}</span>)}
    </div>

    <p className="mpp-job-book-lead">キャラは8JOB。そこに4つの価値観が掛け合わさって32TYPEになります。自分のTYPEだけSSR点灯中。</p>

    <div className="mpp-job-book-grid">
      {ORDER.map(code=>{
        const asset=JOB_CHARACTER_ASSETS[code];
        const isMyJob=code===unlocked;
        return <article key={code} className={isMyJob?'is-unlocked':'is-visible'} style={{'--job-accent':asset.accent} as React.CSSProperties}>
          <JobCharacterCard jobCode={code} variant="compact"/>
          <small>JOB {String(asset.jobNumber).padStart(2,'0')} · {code}</small>
          <b>{asset.name}</b>
          <span>{asset.animal}</span>
          {isMyJob&&<em>YOUR JOB</em>}
          <div className="mpp-job-book-typechips">
            {STYLES.map(style=>{
              const codeValue=moneyTypeCode(code,style);
              const isMine=code===unlocked&&style===primaryStyle;
              return <div key={style} className={isMine?'is-mine':''}>
                <strong>{codeValue}</strong>
                <small>{STYLE_IDENTITY[style].label}</small>
              </div>;
            })}
          </div>
        </article>;
      })}
    </div>

    <div className="mpp-job-book-gap"><b>友だちのTYPE、どこにいる？</b><span>「IDP-Eだった」だけで、この図鑑からJOBと価値観をすぐ探せます。</span></div>
    <p className="mpp-job-book-social">TYPEコードを見せ合う　#ムダギリ診断</p>
    {onClose&&<button className="mpp-secondary" onClick={onClose}>獲得画面に戻る</button>}
  </section>;
}
