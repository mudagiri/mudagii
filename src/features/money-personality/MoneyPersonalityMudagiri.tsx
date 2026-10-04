import React from 'react';
import {MUDAGIRI_BACKGROUND_ASSET,MUDAGIRI_POSE_ASSET} from './mudagiri-pose-assets-v1';
import type {MudagiriVisualSpec} from './mudagiri-personality-visual-v1';
import './mudagiri-background-runtime.css';

if(typeof document!=='undefined'){
  const style=document.documentElement.style;
  style.setProperty('--mpp-bg-guild',`url("${MUDAGIRI_BACKGROUND_ASSET.guildHall}")`);
  style.setProperty('--mpp-bg-class-unlock',`url("${MUDAGIRI_BACKGROUND_ASSET.classUnlock}")`);
  style.setProperty('--mpp-bg-next-quest',`url("${MUDAGIRI_BACKGROUND_ASSET.nextQuest}")`);
}

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
      onError={(e)=>{e.currentTarget.dataset.loadError='1'}}
    />
  </div>;
}
