import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';
import {moneyTypeIdentity} from './money-type-identity-v1';
import {resultV9For} from './resultV9Content';

type ShareResult='shared'|'downloaded'|'text';
type SharePayload={title?:string;text?:string;url?:string;files?:File[]};
type FileShareNavigator=Navigator&{
  share?:(data?:SharePayload)=>Promise<void>;
  canShare?:(data?:SharePayload)=>boolean;
};

type ShareTarget='x'|'instagram'|'threads'|'line';
type Args={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string;features?:readonly string[];target?:ShareTarget};

const WIDTH=1080;
const HEIGHT=1350;
const SECONDARY:Record<JobCode,string>={
  FDM:'#ff6b4a',FDP:'#ffd166',FNM:'#a98cff',FNP:'#3c9fff',
  IDM:'#ffd071',IDP:'#ff7858',INM:'#39e7ff',INP:'#ff5f72',
};
const DEEP:Record<JobCode,string>={
  FDM:'#281409',FDP:'#0b2619',FNM:'#081a38',FNP:'#052a32',
  IDM:'#32140f',IDP:'#261b11',INM:'#190b3c',INP:'#0b1e38',
};

function roundedRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}

function text(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,size:number,weight:number|string='700',align:CanvasTextAlign='center',color='#fff'){
  ctx.save();
  ctx.fillStyle=color;
  ctx.textAlign=align;
  ctx.textBaseline='middle';
  ctx.font=`${weight} ${size}px system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif`;
  ctx.fillText(value,x,y);
  ctx.restore();
}

function shorten(value:string,max=27){
  const clean=value.replace(/\s+/g,'').trim();
  return clean.length>max?`${clean.slice(0,max)}…`:clean;
}

function loadImage(src:string){
  return new Promise<HTMLImageElement>((resolve,reject)=>{
    const img=new Image();
    img.decoding='async';
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error(`share image load failed: ${src}`));
    img.src=new URL(src,window.location.href).href;
  });
}

async function canvasBlob(canvas:HTMLCanvasElement){
  return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('share image export failed')),'image/png'));
}

function drawStar(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,alpha=.8){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(Math.PI/4);
  ctx.globalAlpha=alpha;
  ctx.fillStyle=color;
  ctx.fillRect(-r/2,-r/2,r,r);
  ctx.shadowColor=color;
  ctx.shadowBlur=r*2.4;
  ctx.fillRect(-r/3,-r/3,r*.66,r*.66);
  ctx.restore();
}

export async function createJobShareImage({jobCode,primaryStyle,styleLabel,features=[]}:Args){
  const asset=jobCharacterAsset(jobCode);
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const identity=moneyTypeIdentity(jobCode,primaryStyle);
  const result=resultV9For(jobCode,primaryStyle);
  const accent=asset.accent;
  const secondary=SECONDARY[jobCode];
  const deep=DEEP[jobCode];
  const canvas=document.createElement('canvas');
  canvas.width=WIDTH;
  canvas.height=HEIGHT;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('canvas unavailable');

  const bg=ctx.createLinearGradient(0,0,WIDTH,HEIGHT);
  bg.addColorStop(0,deep);
  bg.addColorStop(.42,'#07121f');
  bg.addColorStop(.72,'#080a18');
  bg.addColorStop(1,'#01030a');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,WIDTH,HEIGHT);

  const glowA=ctx.createRadialGradient(220,190,10,220,190,520);
  glowA.addColorStop(0,`${accent}7d`);
  glowA.addColorStop(.36,`${accent}2d`);
  glowA.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glowA;
  ctx.fillRect(0,0,WIDTH,820);

  const glowB=ctx.createRadialGradient(850,510,10,850,510,520);
  glowB.addColorStop(0,`${secondary}66`);
  glowB.addColorStop(.42,`${secondary}22`);
  glowB.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glowB;
  ctx.fillRect(300,0,780,1000);

  ctx.save();
  ctx.translate(WIDTH/2,505);
  ctx.globalAlpha=.13;
  for(let i=0;i<18;i++){
    ctx.rotate(Math.PI/9);
    const ray=ctx.createLinearGradient(60,0,520,0);
    ray.addColorStop(0,'rgba(255,255,255,.36)');
    ray.addColorStop(.35,`${i%2?accent:secondary}66`);
    ray.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=ray;
    ctx.fillRect(70,-2,470,4);
  }
  ctx.restore();

  roundedRect(ctx,46,46,WIDTH-92,HEIGHT-92,46);
  const panel=ctx.createLinearGradient(0,46,WIDTH,HEIGHT-46);
  panel.addColorStop(0,'rgba(10,16,32,.54)');
  panel.addColorStop(.5,'rgba(3,8,20,.72)');
  panel.addColorStop(1,'rgba(0,2,10,.88)');
  ctx.fillStyle=panel;
  ctx.fill();
  ctx.lineWidth=6;
  ctx.strokeStyle='#f2d56f';
  ctx.shadowColor='#f2d56f';
  ctx.shadowBlur=18;
  ctx.stroke();
  ctx.shadowBlur=0;

  roundedRect(ctx,62,62,WIDTH-124,HEIGHT-124,38);
  ctx.lineWidth=2;
  ctx.strokeStyle=`${secondary}bb`;
  ctx.stroke();

  for(const [x,y,r,c,a] of [
    [124,190,11,accent,.95],[942,226,8,secondary,.9],[168,650,7,secondary,.75],
    [920,724,10,accent,.8],[126,1110,7,accent,.75],[948,1040,8,secondary,.72],
  ] as const)drawStar(ctx,x,y,r,c,a);

  text(ctx,'ムダギリ｜お金の性格診断',92,105,25,900,'left','#f4f7fb');
  text(ctx,'1 / 32',WIDTH-92,105,22,900,'right','#b8c4d1');

  text(ctx,'わたしのお金タイプ',WIDTH/2,162,26,850,'center','#cbd5e1');

  text(ctx,typeCode,WIDTH/2,252,108,1000,'center','#ffffff');
  ctx.save();
  ctx.shadowColor=secondary;
  ctx.shadowBlur=28;
  text(ctx,typeCode,WIDTH/2,252,108,1000,'center','#ffffff');
  ctx.restore();
  text(ctx,identity.compact,WIDTH/2,334,46,1000,'center','#f7f4ff');

  const img=await loadImage(asset.file);
  const boxW=620,boxH=430;
  const scale=Math.min(boxW/img.naturalWidth,boxH/img.naturalHeight);
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  ctx.save();
  ctx.shadowColor=secondary;
  ctx.shadowBlur=48;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,(WIDTH-w)/2,380+(boxH-h)/2,w,h);
  ctx.restore();

  text(ctx,shorten(result.hero,34),WIDTH/2,850,30,850,'center','#f1f4f8');
  text(ctx,'こんなタイプらしい',WIDTH/2,903,21,850,'center','#f0d477');

  const cardFeatures=(features.length?features:[result.scenes[0].voice]).slice(0,2);
  if(cardFeatures.length){
    roundedRect(ctx,100,970,WIDTH-200,172,28);
    const traits=ctx.createLinearGradient(100,970,980,1142);
    traits.addColorStop(0,`${accent}20`);
    traits.addColorStop(.45,'rgba(3,10,24,.88)');
    traits.addColorStop(1,`${secondary}18`);
    ctx.fillStyle=traits;
    ctx.fill();
    ctx.lineWidth=2;
    ctx.strokeStyle='#e8cb67';
    ctx.stroke();
    text(ctx,'あるある',136,1002,21,1000,'left','#f5dc82');
    cardFeatures.forEach((feature,index)=>{
      text(ctx,'◆',138,1042+index*36,18,950,'left',index%2?secondary:accent);
      text(ctx,shorten(feature),178,1042+index*36,23,780,'left','#f5f7fb');
    });
  }

  const divider=ctx.createLinearGradient(110,0,WIDTH-110,0);
  divider.addColorStop(0,'rgba(242,213,111,0)');
  divider.addColorStop(.18,'rgba(242,213,111,.8)');
  divider.addColorStop(.5,'rgba(255,255,255,.85)');
  divider.addColorStop(.82,'rgba(242,213,111,.8)');
  divider.addColorStop(1,'rgba(242,213,111,0)');
  ctx.fillStyle=divider;
  ctx.fillRect(110,1173,WIDTH-220,2);
  text(ctx,`JOB ${String(asset.jobNumber).padStart(2,'0')} · ${asset.animal}`,110,1215,22,850,'left','#c8d2dd');
  text(ctx,'友だちは何タイプ？',WIDTH-110,1215,26,950,'right','#ffffff');
  text(ctx,'#ムダギリ診断  #お金の性格診断',WIDTH/2,1267,22,780,'center','#c7d1dd');
  text(ctx,'ムダギリ診断',WIDTH/2,1307,29,1000,'center','#f4dd82');

  const blob=await canvasBlob(canvas);
  return new File([blob],`mudagiri-${typeCode}.png`,{type:'image/png'});
}

function downloadFile(file:File){
  const href=URL.createObjectURL(file);
  const a=document.createElement('a');
  a.href=href;
  a.download=file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(href),1500);
}

export async function shareJobTypeImage({jobCode,primaryStyle,styleLabel,features=[],target}:Args):Promise<ShareResult>{
  const asset=jobCharacterAsset(jobCode);
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const identity=moneyTypeIdentity(jobCode,primaryStyle);
  const result=resultV9For(jobCode,primaryStyle);
  const message=`お金の性格診断、私は「${identity.full}」だった。\n${shorten(result.hero,40)}\nあなたは何タイプ？ #ムダギリ診断 #お金の性格診断`;
  const nav=navigator as FileShareNavigator;
  try{
    const file=await createJobShareImage({jobCode,primaryStyle,styleLabel,features});
    const url=window.location.href;
    if(target==='x'){
      window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(message+'\n'+url),'_blank','noopener,noreferrer');
      return 'text';
    }
    if(target==='line'){
      window.location.href='https://line.me/R/share?text='+encodeURIComponent(message+'\n'+url);
      return 'text';
    }
    if(nav.share&&nav.canShare?.({files:[file]})){
      await nav.share({title:'ムダギリ｜お金の性格診断',text:message,files:[file]});
      return 'shared';
    }
    downloadFile(file);
    try{await navigator.clipboard?.writeText(`${message} ${url}`)}catch{}
    return 'downloaded';
  }catch{
    try{
      if(nav.share){await nav.share({title:'ムダギリ｜お金の性格診断',text:message,url:window.location.href});return 'text'}
      await navigator.clipboard?.writeText(`${message} ${window.location.href}`);
    }catch{}
    return 'text';
  }
}
