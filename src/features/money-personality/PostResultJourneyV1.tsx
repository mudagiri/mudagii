import React,{useState} from 'react';
import type {JobCode,StyleId} from './classifierV1';
import AdventurerClassUnlockV1 from './AdventurerClassUnlockV1';
import ResultNextRoutesV1 from './ResultNextRoutesV1';
import LineBonusPreviewV1 from './LineBonusPreviewV1';
import JobEncyclopediaV1 from './JobEncyclopediaV1';
import JobShareCardV1 from './JobShareCardV1';

type Stage='unlock'|'routes'|'line'|'book'|'share';
type Props={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;onHousehold:()=>void;onLine:()=>void;onShare:()=>void};

export default function PostResultJourneyV1({jobCode,primaryStyle,styleLabel,onHousehold,onLine,onShare}:Props){
 const [stage,setStage]=useState<Stage>('unlock');
 if(stage==='unlock')return <AdventurerClassUnlockV1 jobCode={jobCode} primaryStyle={primaryStyle} styleLabel={styleLabel} onComplete={()=>setStage('routes')}/>;
 if(stage==='line')return <LineBonusPreviewV1 jobCode={jobCode} onAddLine={onLine} onSkip={onHousehold}/>;
 if(stage==='book')return <main className="mpp-page mpp-page--guild"><JobEncyclopediaV1 unlocked={jobCode} primaryStyle={primaryStyle} onClose={()=>setStage('routes')}/></main>;
 if(stage==='share')return <main className="mpp-page mpp-page--guild"><JobShareCardV1 jobCode={jobCode} primaryStyle={primaryStyle} styleLabel={styleLabel} onShare={onShare}/><button className="mpp-ghost" onClick={()=>setStage('routes')}>結果に戻る</button></main>;
 return <main className="mpp-page mpp-page--guild"><section className="mpp-card"><ResultNextRoutesV1 jobCode={jobCode} primaryStyle={primaryStyle} onHousehold={onHousehold} onLine={()=>setStage('line')} onShare={()=>setStage('share')} onOpenBook={()=>setStage('book')}/></section></main>;
}
