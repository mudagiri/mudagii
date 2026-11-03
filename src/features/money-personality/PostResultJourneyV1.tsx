import React,{useState} from 'react';
import type {JobCode,StyleId} from './classifierV1';
import AdventurerClassUnlockV1 from './AdventurerClassUnlockV1';
import ResultNextRoutesV1 from './ResultNextRoutesV1';
import LineBonusPreviewV1 from './LineBonusPreviewV1';
import JobShareCardV1 from './JobShareCardV1';

type Stage='unlock'|'routes'|'line'|'share';
type Props={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;onHousehold:()=>void;onLine:()=>void;onShare:()=>void};

export default function PostResultJourneyV1({jobCode,primaryStyle,styleLabel,onHousehold,onLine,onShare}:Props){
 const [stage,setStage]=useState<Stage>('unlock');
 const openBook=()=>{const url=new URL(window.location.href);url.searchParams.set('book','1');url.searchParams.set('job',jobCode);url.searchParams.set('style',primaryStyle);url.searchParams.delete('resumeResult');window.location.href=url.pathname+'?'+url.searchParams.toString()};
 if(stage==='unlock')return <AdventurerClassUnlockV1 jobCode={jobCode} primaryStyle={primaryStyle} onComplete={()=>setStage('routes')}/>;
 if(stage==='line')return <LineBonusPreviewV1 jobCode={jobCode} onAddLine={onLine} onSkip={onHousehold}/>;
 if(stage==='share')return <main className="mpp-page mpp-page--guild"><JobShareCardV1 jobCode={jobCode} primaryStyle={primaryStyle} styleLabel={styleLabel} onShare={onShare}/><button className="mpp-ghost" onClick={()=>setStage('routes')}>結果に戻る</button></main>;
 return <main className="mpp-page mpp-page--guild"><section className="mpp-card"><ResultNextRoutesV1 jobCode={jobCode} primaryStyle={primaryStyle} onHousehold={onHousehold} onLine={()=>setStage('line')} onShare={()=>setStage('share')} onOpenBook={openBook}/></section></main>;
}
