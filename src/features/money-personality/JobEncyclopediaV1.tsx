import React,{useEffect,useMemo,useRef,useState} from 'react';
import type {JobCode,StyleId} from './classifierV1';
import {JOB_CHARACTER_ASSETS} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import {moneyTypeIdentity,STYLE_IDENTITY} from './money-type-identity-v1';
import {resultV9For} from './resultV9Content';
import JobCharacterCard from './JobCharacterCard';
import './job-encyclopedia-v1.css';
import './job-encyclopedia-v2.css';

const ORDER:JobCode[]=['FDM','FDP','FNM','FNP','IDM','IDP','INM','INP'];
const STYLES:StyleId[]=['DRIVE','ENJOY','SECURE','OPTIMIZE'];

type SelectedType={jobCode:JobCode;style:StyleId};

export default function JobEncyclopediaV1({unlocked,primaryStyle,onClose}:{unlocked:JobCode;primaryStyle:StyleId;onClose?:()=>void}){
  const mine=moneyTypeIdentity(unlocked,primaryStyle);
  const [selected,setSelected]=useState<SelectedType|null>(null);
  const [activeStyle,setActiveStyle]=useState<StyleId>(primaryStyle);
  const topRef=useRef<HTMLElement|null>(null);
  const surfaceRef=useRef<HTMLDivElement|null>(null);
  const touchYRef=useRef<number|null>(null);

  useEffect(()=>{
    const el=surfaceRef.current;
    if(!el)return;

    const onTouchStart=(event:TouchEvent)=>{
      if(event.touches.length!==1)return;
      touchYRef.current=event.touches[0].clientY;
    };
    const onTouchMove=(event:TouchEvent)=>{
      if(event.touches.length!==1||touchYRef.current===null)return;
      const y=event.touches[0].clientY;
      const delta=touchYRef.current-y;
      if(Math.abs(delta)<1)return;
      const max=Math.max(0,el.scrollHeight-el.clientHeight);
      const next=Math.max(0,Math.min(max,el.scrollTop+delta));
      if(next!==el.scrollTop){
        el.scrollTop=next;
        event.preventDefault();
      }
      touchYRef.current=y;
    };
    const onTouchEnd=()=>{touchYRef.current=null};

    el.addEventListener('touchstart',onTouchStart,{passive:true});
    el.addEventListener('touchmove',onTouchMove,{passive:false});
    el.addEventListener('touchend',onTouchEnd,{passive:true});
    el.addEventListener('touchcancel',onTouchEnd,{passive:true});

    return ()=>{
      el.removeEventListener('touchstart',onTouchStart);
      el.removeEventListener('touchmove',onTouchMove);
      el.removeEventListener('touchend',onTouchEnd);
      el.removeEventListener('touchcancel',onTouchEnd);
    };
  },[]);

  const detail=useMemo(()=>{
    if(!selected)return null;
    const identity=moneyTypeIdentity(selected.jobCode,selected.style);
    const result=resultV9For(selected.jobCode,selected.style);
    const asset=JOB_CHARACTER_ASSETS[selected.jobCode];
    return {identity,result,asset};
  },[selected]);

  const openType=(jobCode:JobCode,style:StyleId)=>setSelected({jobCode,style});

  const book=<section ref={topRef} className="mpp-job-book" aria-label="32TYPE図鑑">
    <header className="mpp-job-book-hero">
      <div>
        <small>COLLECTION / 8 JOB × 4 STYLE</small>
        <h2>32TYPE図鑑</h2>
        <p>気になるカードをタップすると、そのTYPEの特徴を見られます。</p>
      </div>
      <div className="mpp-job-book-count"><strong>32</strong><span>TYPES</span></div>
    </header>

    <div className="mpp-job-book-mycard">
      <div><small>YOUR TYPE</small><b>{mine.code}</b></div>
      <span>{mine.jobName} × {mine.styleLabel}</span>
    </div>

    <div className="mpp-job-book-style-key" aria-label="価値観コード">
      {STYLES.map(style=><button key={style} type="button" className={style===activeStyle?'is-active':''} onClick={()=>setActiveStyle(style)} aria-pressed={style===activeStyle}>
        <b>{STYLE_IDENTITY[style].code}</b>{STYLE_IDENTITY[style].label}
      </button>)}
    </div>
    <p className="mpp-job-book-style-hint"><b>{STYLE_IDENTITY[activeStyle].label}</b> の32TYPEを見ています。JOBカードをタップすると詳細が開きます。</p>

    <div className="mpp-job-book-grid">
      {ORDER.map(code=>{
        const asset=JOB_CHARACTER_ASSETS[code];
        const isMyJob=code===unlocked;
        return <article key={code} className={isMyJob?'is-unlocked':'is-visible'} style={{'--job-accent':asset.accent} as React.CSSProperties}>
          <button className="mpp-job-book-jobhead" type="button" onClick={()=>openType(code,activeStyle)} aria-label={asset.name+'のタイプを見る'}>
            <div className="mpp-job-book-art"><JobCharacterCard jobCode={code} variant="compact"/></div>
            <div className="mpp-job-book-jobcopy">
              <small>JOB {String(asset.jobNumber).padStart(2,'0')} · {code}</small>
              <b>{asset.name}</b>
              <span>{asset.animal}</span>
              <p className="mpp-job-book-motif">{asset.motifReason}</p>
            </div>
            <i aria-hidden="true">›</i>
          </button>

          {isMyJob&&<em>YOUR JOB</em>}

          <div className="mpp-job-book-typechips" aria-label={asset.name+'の4タイプ'}>
            {STYLES.map(style=>{
              const codeValue=moneyTypeCode(code,style);
              const isMine=code===unlocked&&style===primaryStyle;
              return <button key={style} type="button" className={[isMine?'is-mine':'',style===activeStyle?'is-active':''].filter(Boolean).join(' ')} onClick={()=>{setActiveStyle(style);openType(code,style)}} aria-label={codeValue+' '+STYLE_IDENTITY[style].label+'の詳細を見る'}>
                <strong>{codeValue}</strong>
                <small>{STYLE_IDENTITY[style].label}</small>
              </button>;
            })}
          </div>
        </article>;
      })}
    </div>

    <div className="mpp-job-book-howto">
      <b>コードの見方</b>
      <p>最初の3文字がJOB、最後の1文字が価値観。友だちのTYPEコードを見せ合って、その場で比較できます。</p>
    </div>

    <p className="mpp-job-book-social">#ムダギリ診断　#お金の性格診断</p>
    {onClose&&<button className="mpp-secondary mpp-job-book-close" onClick={onClose}>獲得画面に戻る</button>}

    {detail&&<div className="mpp-job-book-detail-backdrop" role="presentation" onClick={()=>setSelected(null)}>
      <article className="mpp-job-book-detail" role="dialog" aria-modal="true" aria-label={detail.identity.full} onClick={e=>e.stopPropagation()} style={{'--job-accent':detail.asset.accent} as React.CSSProperties}>
        <button className="mpp-job-book-detail-close" type="button" onClick={()=>setSelected(null)} aria-label="詳細を閉じる">×</button>
        <div className="mpp-job-book-detail-top">
          <span>MUDAGIRI / MONEY TYPE</span>
          <b>{detail.identity.code}</b>
        </div>

        <div className="mpp-job-book-detail-art"><JobCharacterCard jobCode={selected!.jobCode} variant="hero"/></div>

        <small className="mpp-job-book-detail-label">お金の性格TYPE</small>
        <h3>{detail.identity.jobName}</h3>
        <div className="mpp-job-book-detail-style"><b>{detail.identity.styleLabel}</b>を大事にするタイプ</div>
        <p className="mpp-job-book-detail-hero">{detail.result.hero}</p>

        <div className="mpp-job-book-detail-scenes">
          {detail.result.scenes.slice(0,3).map(scene=><span key={scene.label}>{scene.label.replace(/\p{Extended_Pictographic}/gu,'').trim()}</span>)}
        </div>

        <div className="mpp-job-book-detail-note">
          <small>こんな場面で出やすい</small>
          <p>{detail.result.scenes[0]?.hit}</p>
        </div>

        <div className="mpp-job-book-detail-motif"><small>WHY THIS ANIMAL?</small><p>{detail.asset.motifReason}</p></div>
        <footer><span>JOB {String(detail.asset.jobNumber).padStart(2,'0')}</span><b>{detail.asset.animal}</b></footer>
      </article>
    </div>}
  </section>;

  return <div ref={surfaceRef} className="mpp-job-book-standalone-surface">{book}</div>;
}
