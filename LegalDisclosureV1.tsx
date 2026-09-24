import React,{useState} from 'react';
export default function LegalDisclosureV1(){
 const [view,setView]=useState<'privacy'|'terms'|null>(null);
 const operator=(import.meta as any).env?.VITE_MUDAGIRI_OPERATOR_NAME||'';
 const contact=(import.meta as any).env?.VITE_MUDAGIRI_CONTACT||'';
 return <div className="mt-8 text-center text-[10px] text-zinc-600">
  <button onClick={()=>setView('privacy')} className="underline">プライバシー</button><span className="mx-2">/</span><button onClick={()=>setView('terms')} className="underline">利用上の注意</button>
  {view&&<div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/95 p-5 text-left text-xs leading-6 text-zinc-300">
   <div className="mx-auto max-w-md border border-zinc-700 bg-zinc-950 p-5">
    <h2 className="text-lg font-black text-white">{view==='privacy'?'プライバシーポリシー':'利用上の注意・免責'}</h2>
    {view==='privacy'?<div className="mt-4 space-y-3">
     <p>運営者：{operator}<br/>連絡先：{contact}</p>
     <p>診断の提供・改善・不正防止・利用状況の分析のため、診断ID、入力した世帯属性・収支・支出・診断回答・診断結果・操作イベント等を取り扱います。</p>
     <p>診断データはGoogle Apps Scriptを通じて運営者管理のGoogle Sheetsに保存する場合があります。また送信障害に備え、ブラウザのLocalStorageに保存する場合があります。</p>
     <p>法令に基づく場合を除き、取得情報を上記目的を超えて利用・提供しません。委託先を利用する場合は必要な範囲で取り扱います。</p>
     <p>ブラウザ内データはサイトデータ削除により消去できます。運営者側データに関する問い合わせは上記連絡先へお願いします。</p>
    </div>:<div className="mt-4 space-y-3">
     <p>本サービスは家計の振り返りを支援する参考情報・シミュレーションです。税務・法務・投資・保険その他の個別助言を提供するものではありません。</p>
     <p>比較目安や推定改善余地は一定の前提による参考値であり、正確性・完全性、実際の削減額、投資成果等を保証しません。</p>
     <p>保険・教育・自己投資等は金額のみで適否を判定せず、必要に応じて契約内容・目的等を個別に確認してください。</p>
     <p>最終的な契約・投資・家計判断は、内容・費用・リスクを確認したうえで利用者自身が行ってください。</p>
    </div>}
    <button onClick={()=>setView(null)} className="mt-6 w-full border border-zinc-600 p-3 font-bold text-white">閉じる</button>
   </div>
  </div>}
 </div>;
}
