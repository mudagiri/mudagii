import type {TypeCodeV31} from './type-questionnaire-v3.1';
export const TYPE_CONTENT_V31:Record<TypeCodeV31,{name:string;catchphrase:string;summary:string;strength:string;blindSpot:string;shareHook:string}>={
FPA:{name:'鉄壁マネー要塞',catchphrase:'未来も家計も、守備力高め。',summary:'先を見て、計画して、普段からお金の流れもつかみやすいタイプ。',strength:'将来を見据えた計画と把握',blindSpot:'計画を守ることを優先しすぎることも',shareHook:'ちゃんと備える派。でも「何のため」まで決まってる？'},
FPU:{name:'穴あき家計の番人',catchphrase:'未来は見る。でも足元は必要なときに確認。',summary:'先を見て計画する一方、お金の流れは必要なときに確認するタイプ。',strength:'将来を見据えて計画する力',blindSpot:'日々の小さな変化は後から気づくことも',shareHook:'未来は守る。足元は必要なときにチェック。'},
FIA:{name:'心配性ストッカー',catchphrase:'未来は大事。でも決めるときは直感も大事。',summary:'先のことを意識しながら、使う場面では自分の感覚も大切にするタイプ。',strength:'将来を意識しつつ動けること',blindSpot:'将来優先と今の直感がぶつかることも',shareHook:'未来も大事。今の「これだ」も捨てられない。'},
FIU:{name:'安心契約ゾンビ',catchphrase:'未来は見る。決めるのは直感。確認は必要なとき。',summary:'先のことは意識する一方、選択は直感寄りで、お金の確認は必要なときにするタイプ。',strength:'先を意識しながら素早く選べること',blindSpot:'決めた後の振り返りが後回しになることも',shareHook:'先は見る。でも決める瞬間はフィーリング派。'},
VPA:{name:'メリハリ消費の賢者',catchphrase:'今を楽しむ。でも使い方はちゃんと見る。',summary:'今の満足を大切にしながら、計画してお金の流れも把握しやすいタイプ。',strength:'今を楽しむ計画性と把握力',blindSpot:'納得できる支出が重なると合計が膨らむことも',shareHook:'好きなものは斬らない。使い方はちゃんと見る。'},
VPU:{name:'ご褒美予算ブレイカー',catchphrase:'今を楽しむ。予算は決める。確認は必要なとき。',summary:'今の満足を大切にしつつ、使う範囲は計画する。お金の確認は必要なときにするタイプ。',strength:'楽しみと予算を両立する力',blindSpot:'細かな変化の確認は後回しになることも',shareHook:'ご褒美は守る。予算も守る。細かい確認はあとで。'},
VIA:{name:'浪費自覚エンターテイナー',catchphrase:'今を楽しむ。直感で動く。でも流れは見えてる。',summary:'今の体験や満足を優先し、直感で選びながら、お金の流れは普段からつかみやすいタイプ。',strength:'行動の速さとお金の把握',blindSpot:'分かっていても勢いで使う場面は増えやすい',shareHook:'使うときは使う。でも何に使ったかは見えてる。'},
VIU:{name:'感情課金バーサーカー',catchphrase:'今を楽しむ。直感で動く。確認は必要なとき。',summary:'今の満足と直感を大切にし、お金の流れは必要なときに確認するタイプ。',strength:'迷いすぎず体験へ動けること',blindSpot:'勢いのある支出を後から確認することも',shareHook:'楽しいは正義。使ったあとはちゃんと確認。'}};
export const getTypeContentV31=(code:TypeCodeV31)=>TYPE_CONTENT_V31[code];
