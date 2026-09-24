import type { TypeCode } from './result-payload-v2';
export interface TypeVisual { emblem:string; equipment:string; aura:string; scene:string; }
export const TYPE_VISUAL:Record<TypeCode,TypeVisual>={
 FPAS:{emblem:'🛡️',equipment:'黄金の盾',aura:'鉄壁',scene:'堅牢な城塞'},FPAE:{emblem:'👑',equipment:'貴族のマント',aura:'上質',scene:'光る王宮'},
 FPUS:{emblem:'🗿',equipment:'古代の鍵',aura:'保存',scene:'契約の神殿'},FPUE:{emblem:'♨️',equipment:'定額の湯桶',aura:'快適',scene:'ぬるま湯の宿'},
 FIAS:{emblem:'🔐',equipment:'契約の巻物',aura:'安心',scene:'契約庫'},FIAE:{emblem:'♾️',equipment:'増殖リング',aura:'増殖',scene:'サブスク迷宮'},
 FIUS:{emblem:'🧟',equipment:'古い契約書',aura:'残存',scene:'契約墓地'},FIUE:{emblem:'💧',equipment:'課金ポーチ',aura:'吸収',scene:'おすすめ沼'},
 VPAS:{emblem:'⚔️',equipment:'節約の双剣',aura:'守護',scene:'家計の砦'},VPAE:{emblem:'⚖️',equipment:'メリハリ天秤',aura:'均衡',scene:'賢者の街'},
 VPUS:{emblem:'🕳️',equipment:'補修ハンマー',aura:'警戒',scene:'穴あき城壁'},VPUE:{emblem:'🎁',equipment:'ご褒美バッグ',aura:'祝祭',scene:'特別日の広場'},
 VIAS:{emblem:'📦',equipment:'備蓄バッグ',aura:'備え',scene:'ストック倉庫'},VIAE:{emblem:'🎭',equipment:'宴のマイク',aura:'快楽',scene:'ネオンの街'},
 VIUS:{emblem:'🪙',equipment:'小銭レーダー',aura:'探索',scene:'チリツモ洞窟'},VIUE:{emblem:'🔥',equipment:'感情の大斧',aura:'爆発',scene:'炎の闘技場'}
};
export const getTypeVisual=(code:TypeCode)=>TYPE_VISUAL[code];
