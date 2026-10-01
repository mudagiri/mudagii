import React from 'react';
import type { Category } from './mudagiri-diagnosis-v2';
import { householdTotalPromptV4 } from './scope-flow-v4';
import { ENEMY_ASSETS } from './enemy-assets-v1';

export default function HouseholdTotalV4Scene({category,value,unknown,onChange,onUnknown,onDone,onBack}:{category:Category;value:string;unknown:boolean;onChange:(v:string)=>void;onUnknown:()=>void;onDone:()=>void;onBack:()=>void}){
 const copy=householdTotalPromptV4(category);
 const enemy=(ENEMY_ASSETS as any)[category];
 const digits=value.replace(/\D/g,'').slice(0,8);
 const display=value===''?'':Number(digits||'0').toLocaleString('ja-JP');
 const canDone=value!==''||unknown;
 return <div className="scan-scene scan-phase-input">
  <button type="button" className="mode-back" onClick={onBack}>← 戻る</button>
  <img className="battle-bg" src="./assets/battle1/BG-003_SCAN_BATTLE.png" alt="" aria-hidden="true"/>
  <header className="scan-hud"><div><small>追加鑑定</small><strong>比較単位を合わせる</strong></div></header>
  <div className="scan-enemy-stage">{enemy?.encounter&&<img className="scan-enemy" src={enemy.encounter} alt=""/>}</div>
  <section className="scan-panel">
   <div className="scan-kicker">SCOPE CHECK</div>
   <h2>{copy.question}</h2>
   <p>{copy.helper}</p>
   {!unknown&&<label className="scan-money"><span>¥</span><input inputMode="numeric" pattern="[0-9]*" value={display} onChange={e=>onChange(e.target.value.replace(/\D/g,''))} placeholder="0" aria-label={copy.question}/><span>/月</span></label>}
   <button type="button" className="pre-back" onClick={onUnknown}>{unknown?'金額を入力する':'分からない'}</button>
   <button type="button" className="pre-primary pre-next" disabled={!canDone} onClick={onDone}>この条件で鑑定 ▶</button>
  </section>
 </div>;
}
