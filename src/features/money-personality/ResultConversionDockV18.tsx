import React,{useEffect,useRef,useState} from 'react';

type Mark='result_mid_reached'|'result_deep_reached'|'household_sticky_shown';
type Props={onHousehold:()=>void;onMilestone:(value:Mark)=>void};

export default function ResultConversionDockV18({onHousehold,onMilestone}:Props){
 const [visible,setVisible]=useState(false);
 const reached=useRef(new Set<Mark>());
 const milestone=useRef(onMilestone);
 milestone.current=onMilestone;
 useEffect(()=>{
  let frame=0;
  const mark=(event:Mark)=>{
   if(reached.current.has(event))return;
   reached.current.add(event);
   milestone.current(event);
  };
  const update=()=>{
   frame=0;
   const total=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
   const depth=Math.max(0,window.scrollY/total);
   if(depth>=.5)mark('result_mid_reached');
   if(depth>=.75)mark('result_deep_reached');
   const share=document.getElementById('mpp17-share');
   const next=document.getElementById('mpp17-next');
   const afterShare=Boolean(share&&share.getBoundingClientRect().bottom<window.innerHeight*.28);
   const beforeNext=Boolean(next&&next.getBoundingClientRect().top>=window.innerHeight*.88);
   const show=window.matchMedia('(max-width: 768px)').matches&&afterShare&&beforeNext;
   setVisible(current=>current===show?current:show);
   if(show)mark('household_sticky_shown');
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  schedule();
  return ()=>{
   removeEventListener('scroll',schedule);
   removeEventListener('resize',schedule);
   if(frame)cancelAnimationFrame(frame);
  };
 },[]);
 return <aside className={'mpp18-dock'+(visible?' is-visible':'')} aria-hidden={!visible}>
  <span className="mpp18-dock-copy">次は、家計のクセもチェック</span>
  <button type="button" tabIndex={visible?0:-1} onClick={onHousehold}>家計クエストに進む <span aria-hidden="true">→</span></button>
 </aside>;
}
