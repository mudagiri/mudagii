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

function tagLabel(value:string){return '#'+value.replace(/\p{Extended_Pictographic}/gu,'').replace(/[\s　]/g,'').replace(/[・/]/g,'').replace(/^[#]+/,'');}

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


function drawJobMotif(ctx:CanvasRenderingContext2D,jobCode:JobCode,accent:string){
  const cx=WIDTH/2,cy=505;
  ctx.save();
  ctx.strokeStyle=accent;
  ctx.fillStyle=accent;
  ctx.globalCompositeOperation='screen';
  ctx.lineWidth=1.5;

  if(jobCode==='IDP'){
    ctx.globalAlpha=.30;
    for(let r=92;r<=300;r+=42){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}
    for(let i=0;i<16;i++){const a=(Math.PI*2*i)/16;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*78,cy+Math.sin(a)*78);ctx.lineTo(cx+Math.cos(a)*318,cy+Math.sin(a)*318);ctx.stroke()}
    ctx.globalAlpha=.42;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,208,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx-250,cy);ctx.lineTo(cx+250,cy);ctx.moveTo(cx,cy-250);ctx.lineTo(cx,cy+250);ctx.stroke();
  }else if(jobCode==='FDM'){
    ctx.globalAlpha=.22;
    for(let i=0;i<18;i++){const a=(Math.PI*2*i)/18;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*90,cy+Math.sin(a)*90);ctx.lineTo(cx+Math.cos(a)*330,cy+Math.sin(a)*330);ctx.stroke()}
  }else if(jobCode==='FDP'){
    ctx.globalAlpha=.18;ctx.lineWidth=1;
    for(let x=150;x<930;x+=64){ctx.beginPath();ctx.moveTo(x,160);ctx.lineTo(x,790);ctx.stroke()}
    for(let y=180;y<800;y+=64){ctx.beginPath();ctx.moveTo(150,y);ctx.lineTo(930,y);ctx.stroke()}
    ctx.globalAlpha=.62;for(const [x,y] of [[250,280],[390,410],[560,300],[730,430],[835,265]]){ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill()}
  }else if(jobCode==='FNM'){
    ctx.globalAlpha=.62;
    const pts=[[170,230],[285,360],[410,255],[565,400],[710,245],[860,390]] as const;
    for(const [x,y] of pts){ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill()}
    ctx.globalAlpha=.24;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
  }else if(jobCode==='FNP'){
    ctx.globalAlpha=.22;
    for(let i=0;i<6;i++){const y=300+i*72;ctx.beginPath();ctx.moveTo(90,y);ctx.bezierCurveTo(300,y-55,450,y+55,650,y);ctx.bezierCurveTo(810,y-45,900,y+25,1010,y-10);ctx.stroke()}
  }else if(jobCode==='IDM'){
    ctx.globalAlpha=.24;
    for(let r=90;r<=310;r+=44){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}
  }else if(jobCode==='INM'){
    ctx.globalAlpha=.25;
    for(let r=105;r<=305;r+=50){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}
    for(let i=0;i<12;i++){const a=(Math.PI*2*i)/12;ctx.save();ctx.translate(cx+Math.cos(a)*260,cy+Math.sin(a)*260);ctx.rotate(a);ctx.strokeRect(-7,-7,14,14);ctx.restore()}
  }else{
    ctx.globalAlpha=.20;ctx.lineWidth=3;
    for(let i=0;i<7;i++){const y=250+i*70;ctx.beginPath();ctx.moveTo(80,y+75);ctx.quadraticCurveTo(480,y-75,1000,y);ctx.stroke()}
  }
  ctx.restore();
}

function drawDiamondFoil(ctx:CanvasRenderingContext2D){
  const colors=['#35d7ff','#6978ff','#d44dff','#ff6fae','#ff9b3d','#ffe35a','#55edaa'];
  ctx.save();
  roundedRect(ctx,46,46,WIDTH-92,HEIGHT-92,46);
  ctx.clip();
  ctx.globalCompositeOperation='screen';
  const cell=58;
  for(let row=-1,y=46-cell;y<HEIGHT-46+cell;row++,y+=cell){
    for(let col=-1,x=46-cell;x<WIDTH-46+cell;col++,x+=cell){
      const phase=Math.abs((row*7+col*11)%colors.length);
      const strong=((row*3+col*5)%7===0);
      ctx.fillStyle=colors[phase];
      ctx.globalAlpha=strong?.34:.095+(((row+col)&1)?.03:0);
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+cell,y);ctx.lineTo(x+cell/2,y+cell/2);ctx.closePath();ctx.fill();
      ctx.fillStyle=colors[(phase+2)%colors.length];
      ctx.globalAlpha=strong?.26:.068;
      ctx.beginPath();ctx.moveTo(x+cell,y);ctx.lineTo(x+cell,y+cell);ctx.lineTo(x+cell/2,y+cell/2);ctx.closePath();ctx.fill();
      ctx.fillStyle=colors[(phase+4)%colors.length];
      ctx.globalAlpha=strong?.24:.055;
      ctx.beginPath();ctx.moveTo(x+cell,y+cell);ctx.lineTo(x,y+cell);ctx.lineTo(x+cell/2,y+cell/2);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.055)';ctx.globalAlpha=.52;ctx.lineWidth=.7;ctx.strokeRect(x,y,cell,cell);
    }
  }
  const sheen=ctx.createLinearGradient(0,180,WIDTH,900);
  sheen.addColorStop(0,'rgba(255,255,255,0)');
  sheen.addColorStop(.42,'rgba(120,225,255,.035)');
  sheen.addColorStop(.5,'rgba(255,255,255,.20)');
  sheen.addColorStop(.57,'rgba(255,224,135,.065)');
  sheen.addColorStop(.68,'rgba(190,110,255,.04)');
  sheen.addColorStop(1,'rgba(255,255,255,0)');
  ctx.globalAlpha=1;ctx.fillStyle=sheen;ctx.fillRect(46,46,WIDTH-92,HEIGHT-92);
  ctx.restore();
}

export async function createJobShareImage({jobCode,primaryStyle}:Args){
  const asset=jobCharacterAsset(jobCode);
  const typeCode=moneyTypeCode(jobCode,primaryStyle);
  const identity=moneyTypeIdentity(jobCode,primaryStyle);
  const result=resultV9For(jobCode,primaryStyle);
  const tags=result.scenes.slice(0,3).map(scene=>tagLabel(scene.label));
  const accent=asset.accent;
  const deep=DEEP[jobCode];

  const canvas=document.createElement('canvas');
  canvas.width=WIDTH;
  canvas.height=HEIGHT;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('canvas unavailable');

  const [foil,img]=await Promise.all([
    loadImage('./assets/foils/v3/MUDAGIRI_DIAMOND_HOLO_V3.svg'),
    loadImage(asset.file),
  ]);

  ctx.fillStyle='#07080b';
  ctx.fillRect(0,0,WIDTH,HEIGHT);

  roundedRect(ctx,42,42,WIDTH-84,HEIGHT-84,48);
  const stock=ctx.createLinearGradient(0,42,0,HEIGHT-42);
  stock.addColorStop(0,deep);
  stock.addColorStop(.34,'#211d19');
  stock.addColorStop(.68,'#111216');
  stock.addColorStop(1,'#08090c');
  ctx.fillStyle=stock;
  ctx.fill();

  const jobGlow=ctx.createRadialGradient(WIDTH/2,455,20,WIDTH/2,455,560);
  jobGlow.addColorStop(0,accent+'36');
  jobGlow.addColorStop(.42,accent+'12');
  jobGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=jobGlow;
  ctx.fillRect(42,42,WIDTH-84,900);

  drawJobMotif(ctx,jobCode,accent);

  ctx.save();
  roundedRect(ctx,42,42,WIDTH-84,HEIGHT-84,48);
  ctx.clip();
  ctx.globalCompositeOperation='screen';
  ctx.globalAlpha=.82;
  ctx.drawImage(foil,42,42,WIDTH-84,HEIGHT-84);

  const glint=ctx.createLinearGradient(-120,920,1120,180);
  glint.addColorStop(0,'rgba(255,255,255,0)');
  glint.addColorStop(.43,'rgba(110,220,255,.02)');
  glint.addColorStop(.50,'rgba(255,255,255,.18)');
  glint.addColorStop(.54,'rgba(255,222,135,.06)');
  glint.addColorStop(.60,'rgba(180,120,255,.03)');
  glint.addColorStop(1,'rgba(255,255,255,0)');
  ctx.globalAlpha=1;
  ctx.fillStyle=glint;
  ctx.fillRect(42,42,WIDTH-84,HEIGHT-84);
  ctx.restore();

  roundedRect(ctx,42,42,WIDTH-84,HEIGHT-84,48);
  ctx.lineWidth=5;
  ctx.strokeStyle='#d3aa5e';
  ctx.shadowColor=accent;
  ctx.shadowBlur=14;
  ctx.stroke();
  ctx.shadowBlur=0;

  roundedRect(ctx,58,58,WIDTH-116,HEIGHT-116,38);
  ctx.lineWidth=1.6;
  ctx.strokeStyle='rgba(244,216,157,.62)';
  ctx.stroke();

  text(ctx,'MUDAGIRI / MONEY TYPE',84,102,21,900,'left','#d8c89e');
  text(ctx,'1 / 32',WIDTH-84,102,21,900,'right','#e4e0d7');

  text(ctx,typeCode,86,171,43,1000,'left','#ffffff');

  roundedRect(ctx,270,142,238,50,25);
  ctx.fillStyle='rgba(30,22,24,.54)';
  ctx.fill();
  ctx.lineWidth=1.8;
  ctx.strokeStyle=accent+'99';
  ctx.stroke();
  text(ctx,'✦ CARD ACQUIRED',389,168,18,900,'center','#f7dfc2');

  const cx=WIDTH/2,cy=480;
  ctx.save();
  ctx.strokeStyle=accent+'82';
  ctx.lineWidth=2;
  ctx.globalAlpha=.62;
  for(let r=116;r<=260;r+=48){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke()}
  for(let i=0;i<12;i++){
    const a=(Math.PI*2*i)/12;
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*102,cy+Math.sin(a)*102);
    ctx.lineTo(cx+Math.cos(a)*274,cy+Math.sin(a)*274);
    ctx.stroke();
  }
  ctx.restore();

  const boxW=740,boxH=500;
  const scale=Math.min(boxW/img.naturalWidth,boxH/img.naturalHeight);
  const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
  ctx.save();
  ctx.imageSmoothingEnabled=false;
  ctx.shadowColor=accent;
  ctx.shadowBlur=34;
  ctx.drawImage(img,(WIDTH-w)/2,250+(boxH-h)/2,w,h);
  ctx.restore();

  text(ctx,'あなたのお金タイプ',84,790,20,800,'left','#b8b2aa');
  text(ctx,identity.jobName,84,848,60,1000,'left','#ffffff');

  roundedRect(ctx,84,888,112,44,22);
  ctx.fillStyle='rgba(193,151,70,.22)';
  ctx.fill();
  ctx.lineWidth=1.4;
  ctx.strokeStyle=accent+'88';
  ctx.stroke();
  text(ctx,identity.styleLabel,140,910,20,900,'center','#f8ead0');
  text(ctx,'を大事にするタイプ',214,910,22,850,'left','#e7e3db');

  text(ctx,shorten(result.hero,31),84,975,28,850,'left','#f5f3ef');

  let chipX=84;
  for(const tag of tags){
    const label=shorten(tag,11);
    ctx.font='850 19px system-ui,-apple-system,"Segoe UI","Noto Sans JP",sans-serif';
    const chipW=Math.min(244,ctx.measureText(label).width+34);
    roundedRect(ctx,chipX,1018,chipW,43,21);
    ctx.fillStyle='rgba(255,255,255,.055)';
    ctx.fill();
    ctx.lineWidth=1.2;
    ctx.strokeStyle='rgba(255,255,255,.16)';
    ctx.stroke();
    text(ctx,label,chipX+chipW/2,1040,18,850,'center','#f7f5f1');
    chipX+=chipW+12;
  }

  const divider=ctx.createLinearGradient(80,0,WIDTH-80,0);
  divider.addColorStop(0,'rgba(220,190,120,0)');
  divider.addColorStop(.16,'rgba(220,190,120,.38)');
  divider.addColorStop(.5,'rgba(255,255,255,.24)');
  divider.addColorStop(.84,'rgba(220,190,120,.38)');
  divider.addColorStop(1,'rgba(220,190,120,0)');
  ctx.fillStyle=divider;
  ctx.fillRect(78,1178,WIDTH-156,1.5);

  text(ctx,'ムダギリ｜お金の性格診断',84,1220,19,850,'left','#d2cbc0');
  text(ctx,asset.animal,WIDTH-84,1220,19,850,'right','#d2cbc0');

  const blob=await canvasBlob(canvas);
  return new File([blob],'mudagiri-'+typeCode+'.png',{type:'image/png'});
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
  const shareTags=result.scenes.slice(0,3).map(scene=>tagLabel(scene.label)).join(' ');
  const message=`お金の性格診断、私は「${identity.full}」だった。\n${shorten(result.hero,40)}\n${shareTags}\nあなたは何タイプ？ #ムダギリ診断 #お金の性格診断`;
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
