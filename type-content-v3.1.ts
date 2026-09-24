import type {TypeCodeV31} from './type-questionnaire-v3.1';
export const TYPE_CONTENT_V31:Record<TypeCodeV31,{name:string;catchphrase:string;summary:string;strength:string;blindSpot:string;shareHook:string}>={
FPA:{name:'鉄壁マネー要塞',catchphrase:'未来も家計も、守備力高め。',summary:'先を見て、決めて、把握する。守りが強いマネー属性。',strength:'計画・把握・将来準備',blindSpot:'守ること自体が目的になりやすい',shareHook:'ちゃんと貯めてる。でも「何のため」まで決まってる？'},
FPU:{name:'穴あき家計の番人',catchphrase:'未来は見る。でも足元からちょっと漏れる。',summary:'将来意識は高め。ただし小さな固定費や契約の放置が残りやすい。',strength:'将来意識・計画性',blindSpot:'小さな固定費・契約放置',shareHook:'未来は守る。小さな穴だけ、ふさぐ。'},
FIA:{name:'心配性ストッカー',catchphrase:'未来が心配。だから安心には払う。',summary:'備える力は強い一方、不安が意思決定を押すことがある。',strength:'備える意識・危機感知',blindSpot:'安心のための契約を重ねやすい',shareHook:'安心は大事。でも安心料、重なってない？'},
FIU:{name:'安心契約ゾンビ',catchphrase:'不安で入る。そして忘れる。',summary:'リスクには敏感。でも契約後の見直しが止まりやすい。',strength:'リスクへの感度',blindSpot:'契約後の放置',shareHook:'入った理由、今も覚えてる？'},
VPA:{name:'メリハリ消費の賢者',catchphrase:'好きなものには使う。でもムダにはシビア。',summary:'今の満足を大切にしつつ、支出を把握して選べるタイプ。',strength:'価値ある支出を選ぶ力',blindSpot:'満足支出の合計が膨らむことはある',shareHook:'好きなものは斬らない。ムダだけ斬る。'},
VPU:{name:'ご褒美予算ブレイカー',catchphrase:'楽しむ予算はある。細かい漏れは見逃しがち。',summary:'QOLを大切にする計画派。ただし小さな契約の漏れが残りやすい。',strength:'楽しみと予算の両立',blindSpot:'固定費・小額課金の見落とし',shareHook:'ご褒美は守る。使ってない課金だけ斬る。'},
VIA:{name:'浪費自覚エンターテイナー',catchphrase:'使ってる。知ってる。でも楽しい。',summary:'自分の使い方を理解しながら、今の体験や満足を優先しやすい。',strength:'自分の価値観が明確',blindSpot:'勢いのある支出が積み上がりやすい',shareHook:'使ってる。でも満足してるなら、それは即ムダじゃない。'},
VIU:{name:'感情課金バーサーカー',catchphrase:'気づいたら買ってた。請求を見て思い出す。',summary:'直感と今の満足が強いタイプ。小さな惰性支出を見つける余地が大きい。',strength:'行動力・体験への投資',blindSpot:'衝動と放置が重なりやすい',shareHook:'楽しいは正義。忘れてた課金は敵。'}};
export const getTypeContentV31=(code:TypeCodeV31)=>TYPE_CONTENT_V31[code];
