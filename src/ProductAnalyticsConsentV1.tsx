import React,{useState} from 'react';
import './product-analytics-consent-v1.css';

/**
 * This optional, non-blocking privacy control is rendered only when analytics
 * are explicitly enabled in this build. A missing choice always means OFF.
 * It intentionally does not send any event about consent itself.
 */
export const PRODUCT_ANALYTICS_CONSENT_KEY='mudagiri_analytics_consent_v1';
type ConsentState='unset'|'granted'|'denied';

export function readProductAnalyticsPreference(storage:Pick<Storage,'getItem'>):ConsentState{
 try{
  const value=storage.getItem(PRODUCT_ANALYTICS_CONSENT_KEY);
  return value==='granted'||value==='denied'?value:'unset';
 }catch{return 'unset';}
}

export function writeProductAnalyticsPreference(
 storage:Pick<Storage,'setItem'>,
 value:'granted'|'denied',
):boolean{
 try{
  storage.setItem(PRODUCT_ANALYTICS_CONSENT_KEY,value);
  return true;
 }catch{return false;}
}

function currentPreference():ConsentState{
 if(typeof window==='undefined')return 'unset';
 try{return readProductAnalyticsPreference(window.localStorage)}catch{return 'unset'}
}

export default function ProductAnalyticsConsentV1(){
 // Unconfigured/disabled builds—including the permanent public root and all
 // current Hidden Previews—must not show an unnecessary opt-in surface.
 const enabled=(import.meta as any).env?.VITE_MUDAGIRI_ANALYTICS_ENABLED==='1';
 const [preference,setPreference]=useState<ConsentState>(currentPreference);
 const [expanded,setExpanded]=useState(()=>currentPreference()==='unset');
 const [error,setError]=useState('');

 if(!enabled)return null;

 function update(value:'granted'|'denied'){
  let persisted=false;
  try{persisted=writeProductAnalyticsPreference(window.localStorage,value)}catch{}
  if(!persisted){
   setError('この端末では設定を保存できません。匿名計測は行われません。');
   setPreference('unset');
   return;
  }
  setPreference(value);setError('');setExpanded(false);
  // Stop linking activity to the previous consent period on withdrawal.
  if(value==='denied'){
   try{window.sessionStorage.removeItem('mudagiri_analytics_session_v1')}catch{}
  }
 }

 return <aside className="mg-privacy" aria-label="匿名の利用状況計測の設定" data-testid="mg-analytics-consent">
  {expanded?<section className="mg-privacy-panel" aria-label="匿名計測について">
   <div className="mg-privacy-title">匿名の利用状況計測について</div>
   <p>診断の開始・完了、共有や相談案内の操作を、サービス改善のためPostHogで分析してもいいですか？</p>
   <p className="mg-privacy-small">診断の回答、支出金額、氏名・連絡先は送りません。画面録画もしません。同意しなくても診断は使えます。許可前の操作を遡って送信しません。</p>
   {preference!=='unset'&&<p className="mg-privacy-status" role="status">{preference==='granted'?'現在：匿名計測に同意中':'現在：匿名計測は停止中'}</p>}
   <div className="mg-privacy-actions">
    <button type="button" className="mg-privacy-allow" onClick={()=>update('granted')}>同意する</button>
    <button type="button" className="mg-privacy-decline" onClick={()=>update('denied')}>{preference==='granted'?'同意を撤回する':'同意しない'}</button>
    <button type="button" className="mg-privacy-later" onClick={()=>{setExpanded(false);setError('')}}>閉じる</button>
   </div>
   {error&&<p className="mg-privacy-error" role="alert">{error}</p>}
   <p className="mg-privacy-fine">同意はいつでも変更できます。撤回後の新たな送信を停止しますが、既に送信した匿名イベントの自動削除は行いません。</p>
  </section>:<button className="mg-privacy-reopen" type="button" onClick={()=>setExpanded(true)} aria-label="匿名計測の設定を開く">
   <span aria-hidden="true">⚙</span> 計測設定
  </button>}
 </aside>;
}
