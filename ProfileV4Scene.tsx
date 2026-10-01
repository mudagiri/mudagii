import React, { useMemo } from 'react';
import {
  type ProfileDraftV4,
  type ProfileStepV4,
  type RelationshipV4,
  type HouseholdContributionModeV4,
  type HousingTenureV4,
  type HousingSubtypeV4,
  profileStepsV4,
  profileStepValidV4,
} from './mudagiri-profile-v4';

const ASSET='./assets/prebattle';
const PREFECTURES=[
 '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県',
 '埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県',
 '岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
 '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県',
 '佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
];

type Props={
 draft:ProfileDraftV4;
 index:number;
 setDraft:React.Dispatch<React.SetStateAction<ProfileDraftV4>>;
 onNext:(draftOverride?:ProfileDraftV4)=>void;
 onBack:()=>void;
};

const META:Record<ProfileStepV4,{dialogue:string;question:string;helper:string;sprite:string}>={
 scope:{dialogue:'まずは、見る財布を決めよう。',question:'今回チェックするのは？',helper:'同じ金額でも、1人分と家全体では「普通」が変わるよ。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q1.png`},
 householdSize:{dialogue:'次は生活パーティーだ！',question:'一緒に暮らしている人数は？',helper:'あなたを含めた人数。比較する家計サイズに使います。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q2.png`},
 composition:{dialogue:'診断に必要なところだけ確認するぞ。',question:'子ども・親と一緒に暮らしてる？',helper:'夫婦・パートナーかどうかは聞きません。比較に必要な条件だけ使います。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q3.png`},
 childCount:{dialogue:'子どもの人数だけ確認！',question:'そのうち、子どもは何人？',helper:'教育費と世帯人数の比較に使います。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q3.png`},
 contribution:{dialogue:'実家・家族同居はここだけ追加確認。',question:'家にお金を入れるときは？',helper:'まとめ払いを家賃や食費に勝手に分解しないために使います。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q4.png`},
 contributionAmount:{dialogue:'まとめ払いは、そのまま1つの金額で見るぞ。',question:'毎月、家にいくら入れてる？',helper:'家賃・食費・光熱費へ勝手に分けません。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q4.png`},
 prefecture:{dialogue:'比較相手をもう少し絞るぞ。',question:'今住んでる都道府県は？',helper:'地域差が出る支出だけ、比較に使います。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q1.png`},
 age:{dialogue:'あと少し。',question:'年齢は？',helper:'年齢で差が出る支出を、近い基準で比べます。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q2.png`},
 housing:{dialogue:'住まいの条件を合わせよう。',question:'今の住まいは？',helper:'民営賃貸と持ち家・実家などを混ぜて比べません。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q5.png`},
 income:{dialogue:'最後だ。家計のものさしを合わせるぞ！',question:'毎月の手取りは？',helper:'税金などが引かれた後。だいたいでOK。分からなくても診断できます。',sprite:`${ASSET}/MUDAGIRI_PROFILE_Q1.png`},
};

function Choice({active,children,onClick}:{active:boolean;children:React.ReactNode;onClick:()=>void}){
 return <button type="button" className={`mode-option ${active?'is-picked':''}`} onClick={onClick}>{children}</button>;
}

export default function ProfileV4Scene({draft,index,setDraft,onNext,onBack}:Props){
 const steps=useMemo(()=>profileStepsV4(draft),[draft]);
 const safeIndex=Math.max(0,Math.min(index,steps.length-1));
 const step=steps[safeIndex];
 const meta=META[step];
 const progress=((safeIndex+1)/Math.max(steps.length,1))*100;
 const valid=profileStepValidV4(step,draft);
 const patch=(x:Partial<ProfileDraftV4>)=>setDraft(v=>({...v,...x}));
 const setHouseholdSize=(n:number)=>setDraft(v=>{
  const householdSize=Math.max(1,Math.min(10,n));
  if(householdSize===1)return {...v,householdSize,relationships:[],childCount:null,expenseSharing:null,householdContributionMode:null,bundledContributionAmount:null,compositionConfirmed:false};
  const childCount=v.childCount===null?null:Math.min(v.childCount,householdSize-1);
  return {...v,householdSize,childCount};
 });
 const auto=(x:Partial<ProfileDraftV4>)=>{
  setDraft(v=>{
   const next={...v,...x};
   window.requestAnimationFrame(()=>onNext(next));
   return next;
  });
 };
 const selectComposition=(kind:'none'|'children'|'parents'|'both')=>{
  const relationships:RelationshipV4[]=kind==='both'?['children','parents']:kind==='children'?['children']:kind==='parents'?['parents']:[];
  auto({
    relationships,
    compositionConfirmed:true,
    childCount:relationships.includes('children')?(draft.childCount??1):null,
    householdContributionMode:relationships.includes('parents')?draft.householdContributionMode:null,
    bundledContributionAmount:relationships.includes('parents')?draft.bundledContributionAmount:null,
  });
 };

 return <div className={`pre-profile pre-profile-v4 pre-step-${step}`}>
  <img className="pre-bg pre-bg-profile" src={`${ASSET}/BG-002_PROFILE_FIXED.png`} alt="" aria-hidden="true"/>
  <div className="pre-profile-overlay" aria-hidden="true"/>
  <header className="pre-profile-hud">
   <div className="pre-profile-hud-row"><span>冒険の準備</span><b>家計設定</b></div>
   <div className="pre-progress-track" aria-hidden="true"><span style={{width:`${progress}%`}}/></div>
  </header>
  <img className="pre-profile-mudagiri" src={meta.sprite} alt="ムダギリくん"/>
  <section className="pre-panel">
   <div className="pre-dialogue">{meta.dialogue}</div>
   <div className="pre-question-no">QUEST SETTING</div>
   <h2>{step==='income'
     ?(draft.diagnosisScope==='household'?'家全体の毎月の手取りは？':'あなた自身の毎月の手取りは？')
     :step==='composition'&&draft.diagnosisScope==='household'
       ?'子どもと暮らしてる？'
       :meta.question}</h2>
   <p className="pre-helper">{meta.helper}</p>

   {step==='scope'&&<div className="mode-options">
    <Choice active={draft.diagnosisScope==='personal'} onClick={()=>auto({diagnosisScope:'personal',expenseSharing:null})}><strong>👤 自分が払っている分</strong><span>自分の財布だけをチェック</span></Choice>
    <Choice active={draft.diagnosisScope==='household'} onClick={()=>auto({diagnosisScope:'household',expenseSharing:null,householdContributionMode:null,bundledContributionAmount:null})}><strong>🏠 家全体で払っている分</strong><span>夫婦・家族など生活単位の合計</span></Choice>
   </div>}

   {step==='householdSize'&&<div className="pre-age-input" style={{justifyContent:'center'}}>
    <button type="button" className="pre-back" onClick={()=>setHouseholdSize((draft.householdSize??1)-1)}>−</button>
    <strong style={{minWidth:80,textAlign:'center',fontSize:24}}>{draft.householdSize??1}人</strong>
    <button type="button" className="pre-back" onClick={()=>setHouseholdSize((draft.householdSize??1)+1)}>＋</button>
   </div>}

   {step==='composition'&&<div className="mode-options composition-options">
    {draft.diagnosisScope==='household' ? <>
      <Choice active={draft.compositionConfirmed&&draft.relationships.includes('children')} onClick={()=>selectComposition('children')}><strong>👧 子どもと暮らしてる</strong></Choice>
      <Choice active={draft.compositionConfirmed&&!draft.relationships.includes('children')} onClick={()=>selectComposition('none')}><strong>✓ 子どもはいない</strong></Choice>
    </> : <>
      <Choice active={draft.compositionConfirmed&&draft.relationships.length===0} onClick={()=>selectComposition('none')}><strong>✓ どちらもない</strong><span>パートナー・友人などとの同居はこちら</span></Choice>
      <Choice active={draft.compositionConfirmed&&draft.relationships.length===1&&draft.relationships[0]==='children'} onClick={()=>selectComposition('children')}><strong>👧 子どもと暮らしてる</strong></Choice>
      <Choice active={draft.compositionConfirmed&&draft.relationships.length===1&&draft.relationships[0]==='parents'} onClick={()=>selectComposition('parents')}><strong>🏠 親・家族と同居</strong></Choice>
      <Choice active={draft.compositionConfirmed&&draft.relationships.includes('children')&&draft.relationships.includes('parents')} onClick={()=>selectComposition('both')}><strong>👨‍👩‍👧 子ども＋親・家族と同居</strong></Choice>
    </>}
   </div>}

   {step==='childCount'&&<div className="pre-age-input" style={{justifyContent:'center'}}>
    <button type="button" className="pre-back" onClick={()=>patch({childCount:Math.max(1,(draft.childCount??1)-1)})}>−</button>
    <strong style={{minWidth:80,textAlign:'center',fontSize:24}}>{draft.childCount??1}人</strong>
    <button type="button" className="pre-back" onClick={()=>patch({childCount:Math.min(Math.max(1,(draft.householdSize??2)-1),(draft.childCount??1)+1)})}>＋</button>
   </div>}

   {step==='contribution'&&<div className="mode-options">
    {([['bundled','💴 毎月まとめて払ってる'],['itemized','🧾 家賃・食費など項目ごと'],['little_or_none','🌱 ほとんど払ってない']] as [Exclude<HouseholdContributionModeV4,null>,string][]).map(([v,l])=><Choice key={v} active={draft.householdContributionMode===v} onClick={()=>{if(v==='bundled')auto({householdContributionMode:v,bundledContributionAmount:null});else auto({householdContributionMode:v,bundledContributionAmount:null})}}><strong>{l}</strong></Choice>)}
   </div>}

   {step==='contributionAmount'&&<label className="pre-input-wrap"><span className="pre-sr-only">家に入れている生活費</span><div className="pre-money-input"><span>¥</span><input inputMode="numeric" pattern="[0-9]*" maxLength={9} value={draft.bundledContributionAmount===null?'':draft.bundledContributionAmount.toLocaleString('ja-JP')} onChange={e=>{const x=e.target.value.replace(/\D/g,'').slice(0,8);patch({bundledContributionAmount:x===''?null:Number(x)})}} placeholder="50,000" aria-label="家に入れている生活費"/><span>/ 月</span></div></label>}

   {step==='prefecture'&&<label className="pre-input-wrap"><span className="pre-sr-only">都道府県</span><select className="pre-select" value={draft.prefecture} onChange={e=>patch({prefecture:e.target.value})}><option value="">選択してください</option>{PREFECTURES.map(p=><option key={p} value={p}>{p}</option>)}</select></label>}

   {step==='age'&&<label className="pre-input-wrap pre-age-wrap"><span className="pre-sr-only">年齢</span><div className="pre-age-input"><input inputMode="numeric" pattern="[0-9]*" maxLength={3} value={draft.age??''} onChange={e=>{const x=e.target.value.replace(/\D/g,'').slice(0,3);patch({age:x===''?null:Number(x)})}} aria-label="年齢"/><span>歳</span></div></label>}

   {step==='housing'&&<div className="housing-choice-wrap">
    {draft.housingTenure==='rental' ? <>
      <div className="mode-options housing-subtype-options">
        {([['private_rental','民間賃貸'],['public_rental','公営住宅'],['unknown_rental','わからない']] as [HousingSubtypeV4,string][]).map(([v,l])=><Choice key={String(v)} active={draft.housingSubtype===v} onClick={()=>auto({housingSubtype:v})}><strong>{l}</strong></Choice>)}
      </div>
      <button type="button" className="housing-reset" onClick={()=>patch({housingTenure:null,housingSubtype:null})}>← 住まいタイプを選び直す</button>
    </> : draft.housingTenure==='owned' ? <>
      <div className="mode-options housing-subtype-options housing-owner-options">
        {([['mortgage','住宅ローンあり'],['no_mortgage','ローンなし']] as [HousingSubtypeV4,string][]).map(([v,l])=><Choice key={String(v)} active={draft.housingSubtype===v} onClick={()=>auto({housingSubtype:v})}><strong>{l}</strong></Choice>)}
      </div>
      <button type="button" className="housing-reset" onClick={()=>patch({housingTenure:null,housingSubtype:null})}>← 住まいタイプを選び直す</button>
    </> : <div className="mode-options housing-main-options">
      {([['rental','🏢 賃貸'],['owned','🏠 持ち家'],['family_home','👪 実家・親族宅'],['company_housing','🏢 社宅・寮'],['other','その他']] as [HousingTenureV4,string][]).map(([v,l])=><Choice key={v} active={draft.housingTenure===v} onClick={()=>{if(v==='rental'||v==='owned')patch({housingTenure:v,housingSubtype:null});else auto({housingTenure:v,housingSubtype:null})}}><strong>{l}</strong></Choice>)}
    </div>}
   </div>}

   {step==='income'&&<div>
    <label className="pre-input-wrap"><span className="pre-sr-only">毎月の手取り</span><div className="pre-money-input"><span>¥</span><input inputMode="numeric" pattern="[0-9]*" maxLength={9} value={draft.monthlyTakeHome===null?'':draft.monthlyTakeHome.toLocaleString('ja-JP')} onChange={e=>{const x=e.target.value.replace(/\D/g,'').slice(0,8);patch({monthlyTakeHome:x===''?null:Number(x),monthlyTakeHomeAnswered:x!==''})}} placeholder="350,000" aria-label="毎月の手取り"/><span>/ 月</span></div></label>
    <button type="button" className="pre-back" onClick={()=>patch({monthlyTakeHome:null,monthlyTakeHomeAnswered:true})}>わからない</button>
   </div>}

   {!['scope','composition','contribution','housing'].includes(step)&&<button type="button" className="pre-primary pre-next profile-primary-cta" onClick={()=>onNext()} disabled={!valid}>次へ ▶</button>}
   <button type="button" className="pre-back" onClick={onBack}>← 戻る</button>
  </section>
 </div>;
}
