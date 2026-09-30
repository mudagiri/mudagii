import type {TypeCodeV31} from './type-questionnaire-v3.1';
export const TYPE_CONTENT_V31:Record<TypeCodeV31,{name:string;catchphrase:string;summary:string;strength:string;blindSpot:string;shareHook:string}>={
FPA:{name:'鉄壁マネー要塞',catchphrase:'財布の守備力、ほぼラスボス。',summary:'先を見て、計画して、普段からお金の流れもつかみやすいタイプ。',strength:'将来を見据えた計画と把握',blindSpot:'守りが固すぎて「今しかできない体験」を後回しにすることも',shareHook:'財布の守備力「ほぼラスボス」だった。鉄壁マネー要塞、同じ人いる？'},
FPU:{name:'穴あき家計の番人',catchphrase:'未来は守る。足元だけ、たまにノーガード。',summary:'先を見て計画する一方、お金の流れは必要なときに確認するタイプ。',strength:'将来を見据えて計画する力',blindSpot:'小さな固定費や値上がりは、後から気づくことも',shareHook:'未来は守るのに足元だけノーガード。「穴あき家計の番人」だったw'},
FIA:{name:'未来キープストッカー',catchphrase:'未来は大事。でも決めるときは直感も大事。',summary:'先のことを意識しながら、使う場面では自分の感覚も大切にするタイプ。',strength:'将来を意識しつつ動けること',blindSpot:'将来優先と今の直感がぶつかることも',shareHook:'未来は気になる。でも最後は直感。わかる人いる？'},
FIU:{name:'未来直感ゾンビ',catchphrase:'未来は見る。決めるのは直感。確認は必要なとき。',summary:'先のことは意識する一方、選択は直感寄りで、お金の確認は必要なときにするタイプ。',strength:'先を意識しながら素早く選べること',blindSpot:'決めた後の振り返りが後回しになることも',shareHook:'先のこと考えるのに、決める瞬間だけフィーリング派だった。'},
VPA:{name:'メリハリ消費の賢者',catchphrase:'使うところは使う。ムダには1円も渡したくない。',summary:'今の満足を大切にしながら、計画してお金の流れも把握しやすいタイプ。',strength:'今を楽しむ計画性と把握力',blindSpot:'「これは価値ある」が重なると、合計額は膨らむことも',shareHook:'「使うところは使う、ムダには1円も渡したくない」タイプだった。'},
VPU:{name:'ご褒美予算ブレイカー',catchphrase:'予算は組む。でも人生のご褒美枠は削らない。',summary:'今の満足を大切にしつつ、使う範囲は計画する。お金の確認は必要なときにするタイプ。',strength:'楽しみと予算を両立する力',blindSpot:'予算内のつもりでも、小さな変化の確認は後回しになることも',shareHook:'予算は組む。でもご褒美枠は削らない。「ご褒美予算ブレイカー」だった。'},
VIA:{name:'直感消費エンターテイナー',catchphrase:'今を楽しむ。直感で動く。でも流れは見えてる。',summary:'今の体験や満足を優先し、直感で選びながら、お金の流れは普段からつかみやすいタイプ。',strength:'行動の速さとお金の把握',blindSpot:'分かっていても勢いで使う場面は増えやすい',shareHook:'使ってる自覚はある。でも楽しいからOK派。仲間いる？'},
VIU:{name:'感情課金バーサーカー',catchphrase:'今を楽しむ。直感で動く。確認は必要なとき。',summary:'今の満足と直感を大切にし、お金の流れは必要なときに確認するタイプ。',strength:'迷いすぎず体験へ動けること',blindSpot:'勢いのある支出を後から確認することも',shareHook:'「気づいたら使ってた」側だった。感情課金バーサーカー、名前強すぎw'}};
export const getTypeContentV31=(code:TypeCodeV31)=>TYPE_CONTENT_V31[code];
