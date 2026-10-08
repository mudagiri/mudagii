/**
 * Session-level UX funnel audit for the Money Personality pilot.
 * Local-only, no server transmission and no money, answer, or contact data.
 * This is a pilot observation layer, NOT a verified social conversion count.
 */
export const MONEY_TYPE_FUNNEL_KEY='mudagiri_money_type_funnel_v1';
export const MONEY_TYPE_FUNNEL_VERSION='MUDAGIRI_MONEY_TYPE_FUNNEL_V1';
export type MoneyTypeFunnelEvent=
  |'intro_started'
  |'intro_resumed'
  |'ssr_claimed'
  |'result_seen'
  |'scenes_expanded'
  |'style_expanded'
  |'share_attempt'
  |'share_native_sheet_resolved'
  |'share_image_downloaded'
  |'share_text_handoff'
  |'type_book_opened'
  |'household_cta_clicked';

export type MoneyTypeFunnelEntry={
  version:typeof MONEY_TYPE_FUNNEL_VERSION;
  sessionId:string;
  event:MoneyTypeFunnelEvent;
  at:string;
  target?:'native'|'x'|'line';
};

const VALID_EVENTS:readonly MoneyTypeFunnelEvent[]=[
  'intro_started','intro_resumed','ssr_claimed','result_seen',
  'scenes_expanded','style_expanded','share_attempt',
  'share_native_sheet_resolved','share_image_downloaded','share_text_handoff',
  'type_book_opened','household_cta_clicked',
];

export function recordMoneyTypeFunnel(event:MoneyTypeFunnelEvent,sessionId:string,target?:'native'|'x'|'line'){
  if(!sessionId||!VALID_EVENTS.includes(event))return;
  try{
    const parsed=JSON.parse(localStorage.getItem(MONEY_TYPE_FUNNEL_KEY)||'[]') as unknown;
    const list=Array.isArray(parsed)?parsed.filter(x=>x&&typeof x==='object'&&x.version===MONEY_TYPE_FUNNEL_VERSION&&typeof x.sessionId==='string'&&VALID_EVENTS.includes(x.event)):[] as MoneyTypeFunnelEntry[];
    const entry:MoneyTypeFunnelEntry={
      version:MONEY_TYPE_FUNNEL_VERSION,sessionId,event,at:new Date().toISOString(),
      ...(target?{target}:{}),
    };
    list.push(entry);
    localStorage.setItem(MONEY_TYPE_FUNNEL_KEY,JSON.stringify(list.slice(-120)));
  }catch{
    // No storage access must never prevent the user from taking an action.
  }
}
