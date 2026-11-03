import React from 'react';

/**
 * UI-only vector ornaments. Financial values are always rendered as live text
 * outside these illustrations; they are not baked into images.
 */
export function CoinPouch({className=''}:{className?:string}){
 return <svg className={className} viewBox="0 0 180 146" role="img" aria-label="ギルドの戦利品を表す金貨袋とコイン">
  <defs>
   <linearGradient id="c31pouch" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f7d089"/><stop offset=".58" stopColor="#b97531"/><stop offset="1" stopColor="#683b20"/></linearGradient>
   <linearGradient id="c31coin" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fff2a6"/><stop offset=".38" stopColor="#f8c848"/><stop offset="1" stopColor="#ae691c"/></linearGradient>
   <filter id="c31glow"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <ellipse cx="88" cy="132" rx="81" ry="12" fill="#593719" opacity=".32"/>
  <g fill="url(#c31coin)" stroke="#a76a1c" strokeWidth="2">
   <rect x="5" y="113" width="49" height="15" rx="6"/><ellipse cx="29" cy="113" rx="24" ry="7"/>
   <rect x="11" y="100" width="42" height="15" rx="6"/><ellipse cx="32" cy="100" rx="21" ry="6"/>
   <rect x="125" y="115" width="49" height="14" rx="6"/><ellipse cx="149" cy="115" rx="24" ry="7"/>
   <rect x="131" y="101" width="41" height="14" rx="6"/><ellipse cx="151" cy="101" rx="21" ry="6"/>
   <rect x="123" y="89" width="46" height="12" rx="6"/><ellipse cx="146" cy="89" rx="22" ry="7"/>
  </g>
  <path d="M66 34L61 17Q88 31 97 8Q108 25 119 17L111 39" fill="#965d2b" stroke="#60331c" strokeWidth="4"/>
  <path d="M73 40Q35 77 56 111Q64 130 100 130Q134 128 137 105Q142 70 108 39Z" fill="url(#c31pouch)" stroke="#613b22" strokeWidth="5"/>
  <path d="M72 42Q95 50 112 41" fill="none" stroke="#f9dfa2" strokeWidth="5" strokeLinecap="round"/>
  <path d="M69 41Q89 53 114 39" fill="none" stroke="#643822" strokeWidth="7" strokeLinecap="round"/>
  <path d="M65 49Q105 63 123 50" fill="none" stroke="#ae6928" strokeWidth="2" opacity=".55"/>
  <text x="96" y="108" textAnchor="middle" fontFamily="system-ui,sans-serif" fontWeight="900" fontSize="48" fill="#623418">¥</text>
  <g fill="#ffe38a" opacity=".8"><path d="M23 37l4 8 8 4-8 4-4 8-4-8-8-4 8-4Z"/><path d="M149 32l3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/></g>
 </svg>;
}

export function TreasureChest({className='',locked=false}:{className?:string;locked?:boolean}){
 return <svg className={className} viewBox="0 0 210 158" role="img" aria-label={locked?'未鑑定の鍵付き宝箱':'報酬の宝箱'}>
  <defs>
   <linearGradient id="c31wood" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#955020"/><stop offset=".5" stopColor="#6a361b"/><stop offset="1" stopColor="#38271c"/></linearGradient>
   <linearGradient id="c31brass" x1="0" y1="0" x2=".4" y2="1"><stop stopColor="#fff4ab"/><stop offset=".42" stopColor="#e5b63e"/><stop offset="1" stopColor="#a96924"/></linearGradient>
   <radialGradient id="c31chestGlow"><stop stopColor="#ffe89b" stopOpacity=".7"/><stop offset="1" stopColor="#ffc94c" stopOpacity="0"/></radialGradient>
  </defs>
  <ellipse cx="103" cy="143" rx="90" ry="10" fill="#040f22" opacity=".55"/>
  <ellipse cx="109" cy="79" rx="101" ry="68" fill="url(#c31chestGlow)" opacity={locked?".38":".64"}/>
  <path d="M23 64Q38 27 100 26Q170 26 188 65L188 91H23Z" fill="url(#c31wood)" stroke="#e1aa43" strokeWidth="6" strokeLinejoin="round"/>
  <path d="M24 70Q111 55 188 70L188 132Q109 146 24 132Z" fill="url(#c31wood)" stroke="#b57727" strokeWidth="6" strokeLinejoin="round"/>
  <path d="M28 72L186 72" stroke="url(#c31brass)" strokeWidth="9"/>
  <path d="M34 39Q99 6 178 40" fill="none" stroke="url(#c31brass)" strokeWidth="12" strokeLinecap="round"/>
  <path d="M62 34L61 138M150 34L151 138" stroke="url(#c31brass)" strokeWidth="12"/>
  <path d="M23 128Q102 140 188 128" fill="none" stroke="#e4aa38" strokeWidth="7"/>
  <path d="M25 85L183 85M27 113L182 113" stroke="#44251b" strokeWidth="2" opacity=".65"/>
  {locked?<g>
    <path d="M47 43L172 121M167 42L44 122" stroke="#b8a58b" strokeWidth="5" opacity=".9"/>
    <rect x="87" y="79" width="40" height="42" rx="8" fill="url(#c31brass)" stroke="#593814" strokeWidth="4"/>
    <path d="M97 83V73Q97 60 107 60Q117 60 117 73V83" stroke="#f6d97e" strokeWidth="7" fill="none"/>
    <text x="107" y="107" textAnchor="middle" fontSize="24" fontWeight="900" fill="#4e3517">?</text>
   </g>:<g>
    <rect x="90" y="69" width="33" height="47" rx="5" fill="url(#c31brass)" stroke="#79501e" strokeWidth="3"/>
    <circle cx="106" cy="89" r="7" fill="#693a1a"/><path d="M106 89l-3 13h6Z" fill="#693a1a"/>
   </g>}
  <g fill="#fff1a7" opacity=".85"><path d="M15 31l4 7 7 4-7 4-4 7-4-7-7-4 7-4Z"/><path d="M191 17l5 9 9 5-9 5-5 9-5-9-9-5 9-5Z"/></g>
 </svg>;
}
