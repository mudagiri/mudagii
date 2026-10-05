import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const OUT='visual-smoke-v5/mudagiri-optical';
await fs.mkdir(OUT,{recursive:true});
const base=process.env.VISUAL_BASE_URL||'http://127.0.0.1:4173/';

const poses=[
  ['IDLE_01','MUDAGIRI_POSE_01_IDLE_01.webp'],
  ['IDLE_02','MUDAGIRI_POSE_02_IDLE_02.webp'],
  ['GUIDE','MUDAGIRI_POSE_03_GUIDE.webp'],
  ['EXPLAIN','MUDAGIRI_POSE_04_EXPLAIN.webp'],
  ['LISTEN','MUDAGIRI_POSE_05_LISTEN.webp'],
  ['THINK','MUDAGIRI_POSE_06_THINK.webp'],
  ['QUESTION','MUDAGIRI_POSE_07_QUESTION.webp'],
  ['SURPRISE','MUDAGIRI_POSE_08_SURPRISE.webp'],
  ['WORRY','MUDAGIRI_POSE_09_WORRY.webp'],
  ['HAPPY','MUDAGIRI_POSE_10_HAPPY.webp'],
  ['CELEBRATE','MUDAGIRI_POSE_11_CELEBRATE.webp'],
  ['PROUD','MUDAGIRI_POSE_12_PROUD.webp'],
  ['RELIEF','MUDAGIRI_POSE_13_RELIEF.webp'],
  ['RUN','MUDAGIRI_POSE_14_RUN.webp'],
  ['POINT_FORWARD','MUDAGIRI_POSE_15_POINT_FORWARD.webp'],
  ['READY','MUDAGIRI_POSE_16_READY.webp'],
  ['ATTACK','MUDAGIRI_POSE_17_ATTACK.webp'],
  ['WIN','MUDAGIRI_POSE_18_WIN.webp'],
  ['COMPLETE','MUDAGIRI_POSE_19_COMPLETE.webp'],
  ['CHECK','MUDAGIRI_POSE_20_CHECK.webp'],
  ['ANALYZE','MUDAGIRI_POSE_21_ANALYZE.webp'],
  ['UNLOCK','MUDAGIRI_POSE_22_UNLOCK.webp'],
  ['RESULT','MUDAGIRI_POSE_23_RESULT.webp'],
  ['SHARE','MUDAGIRI_POSE_24_SHARE.webp'],
  ['CTA','MUDAGIRI_POSE_25_CTA.webp'],
];

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});
await page.goto(base,{waitUntil:'networkidle'});

const report=await page.evaluate(async (poseList)=>{
  async function measure(id,file){
    const src=new URL(`assets/mudagiri/poses/v1/${file}`,location.href).href;
    const img=new Image();
    img.decoding='sync';
    img.src=src;
    await img.decode();
    const canvas=document.createElement('canvas');
    canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)throw new Error('NO_CANVAS_CONTEXT');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1,opaque=0;
    for(let y=0;y<canvas.height;y++){
      for(let x=0;x<canvas.width;x++){
        const a=data[(y*canvas.width+x)*4+3];
        if(a>8){
          opaque++;
          if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
        }
      }
    }
    if(maxX<0)return {id,file,src,natural:{w:canvas.width,h:canvas.height},bbox:null,opaquePixels:0};
    const w=maxX-minX+1,h=maxY-minY+1;
    return {
      id,file,src,
      natural:{w:canvas.width,h:canvas.height},
      bbox:{minX,minY,maxX,maxY,w,h},
      occupancy:{w:w/canvas.width,h:h/canvas.height,area:opaque/(canvas.width*canvas.height)},
      opaquePixels:opaque,
    };
  }
  const rows=[];
  for(const [id,file] of poseList)rows.push(await measure(id,file));
  return rows;
},poses);

const measurementIds=new Set(['IDLE_01','LISTEN','IDLE_02']);
const measurement=report.filter(x=>measurementIds.has(x.id)&&x.bbox);
const visibleHeights=measurement.map(x=>x.bbox.h).sort((a,b)=>a-b);
const target=visibleHeights[Math.floor(visibleHeights.length/2)]||1;
const normalization=measurement.map(x=>({
  id:x.id,
  visibleHeight:x.bbox.h,
  visibleWidth:x.bbox.w,
  occupancyHeight:Number(x.occupancy.h.toFixed(4)),
  recommendedScale:Number((target/x.bbox.h).toFixed(4)),
}));

// Prove the source files really do have materially different transparent padding.
const sourceSpread=Math.max(...visibleHeights)/Math.min(...visibleHeights);
if(sourceSpread<1.15)throw new Error(`MUDAGIRI_OPTICAL_SOURCE_SPREAD_NOT_REPRODUCED:${sourceSpread}`);

// Now verify the rendered question stage compensates for that source-padding difference.
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle'});
await page.getByRole('button',{name:'診断をはじめる'}).click();
await page.locator('.mpp-question-card').waitFor({state:'visible'});

const rendered=[];
for(let i=0;i<3;i++){
  const geometry=await page.evaluate(()=>{
    const wrapper=document.querySelector('.mpp-question-card > .mpp-measurement-companion .mpp-mudagiri');
    const img=wrapper?.querySelector('img');
    const speech=document.querySelector('.mpp-question-card > .mpp-measurement-companion .mpp-progress-talk');
    if(!wrapper||!img)throw new Error('MUDAGIRI_OPTICAL_RENDERED_NODE_MISSING');
    const r=img.getBoundingClientRect();
    const w=wrapper.getBoundingClientRect();
    const s=speech?.getBoundingClientRect();
    return {
      pose:wrapper.getAttribute('data-pose'),
      image:{width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom},
      wrapper:{width:w.width,height:w.height,left:w.left,right:w.right,top:w.top,bottom:w.bottom},
      speech:s?{left:s.left,right:s.right,top:s.top,bottom:s.bottom}:null,
    };
  });
  const source=measurement.find(x=>x.id===geometry.pose);
  if(!source)throw new Error(`MUDAGIRI_OPTICAL_UNEXPECTED_MEASUREMENT_POSE:${geometry.pose}`);
  const effectiveVisibleHeight=geometry.image.height*source.occupancy.h;
  const effectiveVisibleWidth=geometry.image.width*source.occupancy.w;
  rendered.push({...geometry,effectiveVisibleHeight,effectiveVisibleWidth});
  if(geometry.speech&&geometry.image.right>geometry.speech.left+1)throw new Error(`MUDAGIRI_OPTICAL_COLLIDES_WITH_SPEECH:${JSON.stringify(geometry)}`);
  if(i<2){
    const scale=page.locator('.mpp-scale button');
    if(await scale.count())await scale.nth(2).click();
    else await page.locator('.mpp-answer-list button').nth(2).click();
    await page.waitForTimeout(190);
    await page.locator('.mpp-question-card').waitFor({state:'visible'});
  }
}

const renderedIds=rendered.map(x=>x.pose);
for(const id of ['IDLE_01','LISTEN','IDLE_02'])if(!renderedIds.includes(id))throw new Error(`MUDAGIRI_OPTICAL_POSE_CYCLE_MISSING:${id}:${JSON.stringify(renderedIds)}`);
const effectiveHeights=rendered.map(x=>x.effectiveVisibleHeight);
const renderedSpread=Math.max(...effectiveHeights)-Math.min(...effectiveHeights);
if(renderedSpread>2)throw new Error(`MUDAGIRI_OPTICAL_RENDERED_SIZE_DRIFT:${renderedSpread}:${JSON.stringify(rendered)}`);

const summary={
  ok:true,
  targetVisibleHeight:target,
  sourceSpread:Number(sourceSpread.toFixed(4)),
  measurementNormalization:normalization,
  renderedNormalization:{spreadPx:Number(renderedSpread.toFixed(3)),samples:rendered},
  poses:report,
};
await fs.writeFile(`${OUT}/optical-bounds.json`,JSON.stringify(summary,null,2));
await browser.close();
console.log(JSON.stringify({
  ok:true,
  flow:'MUDAGIRI_OPTICAL_BOUNDS_V1',
  targetVisibleHeight:target,
  sourceSpread:Number(sourceSpread.toFixed(4)),
  measurementNormalization:normalization,
  renderedSpreadPx:Number(renderedSpread.toFixed(3)),
  rendered:rendered.map(x=>({pose:x.pose,imageHeight:Number(x.image.height.toFixed(2)),effectiveVisibleHeight:Number(x.effectiveVisibleHeight.toFixed(2))})),
}));