import React,{useState} from 'react';
export default function MethodologyDisclosureV1(){
 const [open,setOpen]=useState(false);
 return <section className="mt-8 border-t border-zinc-800 pt-4 text-[10px] leading-5 text-zinc-500">
  <button onClick={()=>setOpen(v=>!v)} className="font-bold text-zinc-400 underline underline-offset-2">{open?'比較基準について閉じる':'比較基準・推定値について'}</button>
  {open&&<div className="mt-3 space-y-2">
   <p>本診断の「比較目安」は、公的統計・公開調査を参考にムダギリ独自の分類・調整を加えた参考値です。総務省等が公表する平均値そのものではありません。</p>
   <p>「推定改善余地」は、入力値と比較目安、支出満足度などから機械的に算定したシミュレーションです。実際に削減できる金額や将来の成果を保証するものではありません。</p>
   <p>保険・教育費・自己投資など、金額だけで適否を判断できない項目は自動でムダ判定しません。個別の金融商品・保険商品・投資判断を推奨する診断ではありません。</p>
  </div>}
 </section>;
}
