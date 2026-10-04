import React from 'react';
import {MUDAGIRI_POSE_ASSET,MUDAGIRI_POSE_FALLBACK} from './mudagiri-pose-assets-v1';
import type {MudagiriVisualSpec} from './mudagiri-personality-visual-v1';

type Props={visual:MudagiriVisualSpec;alt?:string;className?:string};

export default function MoneyPersonalityMudagiri({visual,alt='ムダギリくん',className=''}:Props){
  return <div className={`mpp-mudagiri mpp-mudagiri--${visual.scale} ${className}`} data-pose={visual.pose}>
    <img
      key={`${visual.pose}:${visual.motion??'still'}`}
      className="mdg-motion"
      src={MUDAGIRI_POSE_ASSET[visual.pose]}
      data-motion={visual.motion??undefined}
      alt={alt}
      draggable={false}
      onError={(e)=>{
        const img=e.currentTarget;
        if(img.dataset.fallback==='1')return;
        img.dataset.fallback='1';
        img.src=MUDAGIRI_POSE_FALLBACK[visual.pose];
      }}
    />
  </div>;
}
