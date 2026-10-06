import type {JobCode,StyleId} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {moneyTypeCode} from './money-type-code-v1';

type ShareResult='shared'|'downloaded'|'text';
type SharePayload={title?:string;text?:string;url?:string;files?:File[]};
type FileShareNavigator=Navigator&{
  share?:(data?:SharePayload)=>Promise<void>;
  canShare?:(data?:SharePayload)=>boolean;
};

type Args={jobCode:JobCode;primaryStyle:StyleId;styleLabel:string};

const WIDTH=1080;
const HEIGHT=1350;

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

export async function createJobShareImage({jobCode,primaryStyle,styleLabel}:Args){
  const asset=jobCharacterAsset(jobCode);
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const canvas=document.createElement('canvas');
  canvas.width=WIDTH;
  canvas.height=HEIGHT;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('canvas unavailable');

  const bg=ctx.createLinearGradient(0,0,0,HEIGHT);
  bg.addColorStop(0,'#062e36');
  bg.addColorStop(.55,'#041f28');
  bg.addColorStop(1,'#02151d');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,WIDTH,HEIGHT);

  const glow=ctx.createRadialGradient(WIDTH/2,510,30,WIDTH/2,510,500);
  glow.addColorStop(0,`${asset.accent}66`);
  glow.addColorStop(.48,`${asset.accent}20`);
  glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow;
  ctx.fillRect(0,0,WIDTH,980);

  roundedRect(ctx,54,54,WIDTH-108,HEIGHT-108,36);
  ctx.fillStyle='rgba(2,24,31,.54)';
  ctx.fill();
  ctx.lineWidth=4;
  ctx.strokeStyle='#e9c85d';
  ctx.stroke();

  text(ctx,'MUDAGIRI / MONEY TYPE',92,112,26,800,'left','#d8e5e3');
  text(ctx,'1 OF 32',WIDTH-92,112,26,900,'right','#f0d97f');
  text(ctx,'SSR',WIDTH/2,188,42,950,'center','#f0d46a');
  text(ctx,typeCode,WIDTH/2,292,122,950,'center','#ffffff');
  text(ctx,`${styleLabel} STYLE`,WIDTH/2,378,34,900,'center','#d9c9ff');

  const img=await loadImage(asset.file);
  const boxW=620,boxH=510;
  const scale=Math.min(boxW/img.naturalWidth,boxH/img.naturalHeight);
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(img,(WIDTH-w)/2,430+(boxH-h)/2,w,h);

  text(ctx,asset.name,WIDTH/2,1000,66,950,'center','#ffffff');
  text(ctx,asset.tagline,WIDTH/2,1062,30,750,'center','#e2eceb');

  ctx.fillStyle='rgba(233,200,93,.55)';
  ctx.fillRect(110,1114,WIDTH-220,2);
  text(ctx,`CLASS ${String(asset.jobNumber).padStart(2,'0')} · ${jobCode}`,110,1160,26,850,'left','#f0d97f');
  text(ctx,'あなたはどのTYPE？',WIDTH-110,1160,28,900,'right','#ffffff');
  text(ctx,'#ムダギリ診断  #お金の性格診断',WIDTH/2,1232,24,750,'center','#b9cfcd');
  text(ctx,'ムダギリ診断',WIDTH/2,1284,30,950,'center','#f2d978');

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

export async function shareJobTypeImage({jobCode,primaryStyle,styleLabel}:Args):Promise<ShareResult>{
  const asset=jobCharacterAsset(jobCode);
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const message=`私のお金タイプは「${typeCode}｜${asset.name}」だった！ ${styleLabel} STYLE｜あなたはどのTYPE？ #ムダギリ診断 #お金の性格診断`;
  const nav=navigator as FileShareNavigator;
  try{
    const file=await createJobShareImage({jobCode,primaryStyle,styleLabel});
    if(nav.share&&nav.canShare?.({files:[file]})){
      await nav.share({title:'ムダギリ｜お金の性格診断',text:message,files:[file]});
      return 'shared';
    }
    downloadFile(file);
    try{await navigator.clipboard?.writeText(`${message} ${window.location.href}`)}catch{}
    return 'downloaded';
  }catch{
    try{
      if(nav.share){await nav.share({title:'ムダギリ｜お金の性格診断',text:message,url:window.location.href});return 'text'}
      await navigator.clipboard?.writeText(`${message} ${window.location.href}`);
    }catch{}
    return 'text';
  }
}
