import React,{useMemo,useState} from 'react';
import {workFreedomAha,travelAha} from '../../../scripts/chapter3-aha-experiment-v1.mjs';

type Kind='travel'|'work';
type Props={kind:Kind;mockCandidateYen:number;protectedMeaning?:string};
const jp=(n:number)=>new Intl.NumberFormat('ja-JP').format(n)+'円';
const valid=(s:string)=>s.trim()!==''&&/^(?:0|[1-9]\d*)$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):NaN;
function NumberField({id,title,value,onChange,hint,min,max}:{id:string;title:string;value:string;onChange:(x:string)=>void;hint:string;min?:number;max?:number}){
 return <label htmlFor={id} className="c3a-field"><strong>{title}</strong><span>{hint}</span>
  <input id={id} type="number" inputMode="numeric" min={min??0} max={max??1000000000000} step="1" value={value} onChange={e=>onChange(e.target.value)} placeholder="まだ分からない"/>
 </label>;
}
export default function Chapter3AhaLab({kind,mockCandidateYen,protectedMeaning}:Props){
 const [age,setAge]=useState('');const [change,setChange]=useState('');const [until,setUntil]=useState('');
 const [gap,setGap]=useState('');const [investment,setInvestment]=useState('');
 const [times,setTimes]=useState('');const [cost,setCost]=useState('');
 const [example,setExample]=useState(false);const [expanded,setExpanded]=useState(true);
 const [consent,setConsent]=useState(false);
 const useSample=()=>{
  if(kind==='work'){setAge('35');setChange('55');setUntil('65');setGap('150000');setInvestment('50000');}
  else {setTimes('2');setCost('200000');}
  setExample(true);setExpanded(true);
 };
 const isWork=kind==='work';
 const result=useMemo(()=>isWork?workFreedomAha({
  currentAge:valid(age),changeAtAge:valid(change),bridgeUntilAge:valid(until),
  monthlyIncomeGapYen:valid(gap),monthlyInvestmentYen:valid(investment)
 }):travelAha({tripsPerYear:valid(times),costPerTripYen:valid(cost),chapter2CandidateUpperMonthlyYen:mockCandidateYen}),
 [isWork,age,change,until,gap,investment,times,cost,mockCandidateYen]);
 const ready=result.status==='conditional_insight';
 const money=ready?result:null;
 const onTryChange=()=>{
  if(isWork){
   if(!Number.isNaN(valid(gap))&&valid(gap)>=50000)setGap(String(valid(gap)-50000));
  }else if(!Number.isNaN(valid(times))&&valid(times)<20)setTimes(String(valid(times)+1));
  setExample(false);
 };
 return <section className="c3a" aria-label="未来の発見クエスト" data-chapter3-aha="true">
   <div className="c3a-heading">
    <span>✧ QUEST DISCOVERY / 本当の発見</span>
    <h3>{isWork?'増やしたお金で、いつ自由になれる？':'楽しみを叶えるには、何が足りない？'}</h3>
    <p>{isWork?'毎月の積立だけ見ていると、働く時間を減らした後の「収入の差」が見えないんだ。':
     '「家計を斬る」ことがゴールじゃない。まず、楽しみの値段と第2章の宝箱を比べてみよう。'}</p>
   </div>
   {!ready&&<div className="c3a-teaser">
      <strong>{isWork?'積立額と「55歳からの自由」は、別々の数字。':'見直し候補があっても、旅行の資金が準備できたとは限らない。'}</strong>
      <p>確かめたい条件を入力すると、その違いが数字で見える。</p>
   </div>}
   <div className="c3a-actions">
    <button className="c3a-example" onClick={useSample} type="button">仮の数字を入れて体験する →</button>
    <button className="c3a-disclosure" type="button" onClick={()=>setExpanded(x=>!x)} aria-expanded={expanded}>{expanded?'入力欄を閉じる −':'自分の条件を変える ＋'}</button>
   </div>
   {expanded&&<div className="c3a-inputs">
    {isWork?<div className="c3a-two">
      <NumberField id="c3a-current" title="現在の年齢" hint="歳" value={age} onChange={v=>{setAge(v);setExample(false);}} max={110}/>
      <NumberField id="c3a-change" title="仕事を減らす年齢" hint="歳" value={change} onChange={v=>{setChange(v);setExample(false);}} max={110}/>
      <NumberField id="c3a-until" title="何歳まで比べる？" hint="歳（試算の終点）" value={until} onChange={v=>{setUntil(v);setExample(false);}} max={110}/>
      <NumberField id="c3a-gap" title="減る手取り収入" hint="円 / 月（同じ基準で比較）" value={gap} onChange={v=>{setGap(v);setExample(false);}}/>
      <div className="c3a-wide"><NumberField id="c3a-invest" title="積立している金額（任意）" hint="円 / 月。収入差と自動で差し引きしない" value={investment} onChange={v=>{setInvestment(v);setExample(false);}}/></div>
     </div>:
     <div className="c3a-two">
      <NumberField id="c3a-times" title="旅行の回数" hint="回 / 年" value={times} onChange={v=>{setTimes(v);setExample(false);}} max={20}/>
      <NumberField id="c3a-cost" title="1回の旅行予算" hint="円 / 回" value={cost} onChange={v=>{setCost(v);setExample(false);}}/>
     </div>}
    <p className="c3a-no-data">分からない数字は空欄でOK。ここで入力した内容は、この隔離デモでは保存・送信されない。</p>
   </div>}
   {ready&&money&&<div className="c3a-result" aria-live="polite">
     {example&&<span className="c3a-example-flag">例示の仮定で計算中（あなたの実データではありません）</span>}
     {isWork&&money.kind==='work_bridge'?<>
       <span className="c3a-result-label">働き方を変えた後の月々の収入差が続くと仮定したら</span>
       <strong className="c3a-hero-number">{jp(money.calculated.bridgeYen)}</strong>
       <p>{money.keyFinding}</p>
       <div className="c3a-split">
        <div><small>収入差の期間</small><b>{money.calculated.months}か月</b></div>
        <div><small>今からの積立元本</small><b>{money.calculated.contributedPrincipal===null?'未入力':jp(money.calculated.contributedPrincipal)}</b></div>
       </div>
       <p className="c3a-clarify">※収入差の累計と積立元本は別の概念。差し引いて資金不足を求めることはできない。</p>
       <div className="c3a-realization"><b>ムダギリくん「なるほど！」</b><p>「積立が5万円だから大丈夫」でも「足りない」でもない。君が叶えたいのは、積立額じゃなくて働き方だろ？ だったらまず、この収入差がいくらか考えよう。</p></div>
       <button className="c3a-variation" type="button" disabled={Number.isNaN(valid(gap))||valid(gap)<50000} onClick={onTryChange}>もし収入差が月5万円少なかったら？ →</button>
       <p className="c3a-caveat">{money.caveat}</p>
     </>:!isWork&&money.kind==='travel_reframe'?<>
       <span className="c3a-result-label">叶えたい楽しみの予算を年単位にすると</span>
       <strong className="c3a-hero-number">{jp(money.calculated.annual)}</strong>
       <p>{money.keyFinding}</p>
       <div className="c3a-split">
        <div><small>月々の目安（均等準備）</small><b>{jp(money.calculated.monthly)}</b></div>
        <div><small>第2章の未鑑定宝箱</small><b>月最大 {jp(mockCandidateYen)}</b></div>
       </div>
       {money.calculated.scenario&&<div className="c3a-condition">
        <strong>仮に宝箱の候補を全額・毎月改善できた場合のみ</strong>
        <div className="c3a-meter" role="img" aria-label={'年間旅行予算の'+money.calculated.scenario.hypotheticalPortionPercent+'%相当（未確定）'}>
          <span style={{width:money.calculated.scenario.hypotheticalPortionPercent+'%'}}/>
        </div>
        <strong className="c3a-conditional-number">{money.calculated.scenario.hypotheticalPortionPercent}%相当</strong>
        <p>残る年間予算の条件付き計算：{jp(money.calculated.scenario.hypotheticalRemainingYen)}。<b>足りない資金や改善済み資金を意味しない。</b></p>
       </div>}
       <div className="c3a-realization"><b>ムダギリくん「なるほど！」</b><p>宝箱を開けたら旅行が叶う……とは限らないんだな。普段の楽しみ{protectedMeaning?'も大事にしているんだろ？':''}。じゃあ旅行の回数を変えたら、準備額はどう変わる？</p></div>
       <button className="c3a-variation" type="button" onClick={onTryChange} disabled={Number.isNaN(valid(times))||valid(times)>=20}>旅行を年1回増やしたら？ →</button>
       <p className="c3a-caveat">※未鑑定宝箱は未確定の上限。第2章で確定した改善額とも合算しません。{money.caveat}</p>
     </>:null}
     <div className="c3a-next"><small>NEXT QUEST / 最初の一歩</small><strong>{money.oneNextStep}</strong></div>
     <div className="c3a-personal"><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> この気づきは、自分にとって新しかった</label><p>{consent?'本人の感想（このデモでは送信・記録しません）':'すでに知っていたなら、無理に「ハッとした」を選ぶ必要はありません。'}</p></div>
   </div>}
   {!ready&&<div className="c3a-pending" aria-live="polite">まだ計算していません。{result.status==='need_data'?result.ask:'入力条件を確認してください。'}<br/><strong>新しい発見ができたと決めつけない。</strong></div>}
  </section>;
}
