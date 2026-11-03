/**
 * Chapter 2 display-only audit of the 2024 e-Stat survey item codes
 * versus the FROZEN 12-category MUDAGIRI_MASTER_ENGINE contract.
 *
 * Source: 令和6年全国家計構造調査 / 家計総合集計 / 表1-29-1
 * original multi workbook statInfId=000040379261, sheet a010292;
 * workbook sha256=0a73765d1cda9c6c2a0ba8238e2260ee595dfbdbbbb91b67aa1abb55adf82c45
 * original single workbook statInfId=000040379262, sheet a010293;
 * sha256=62648369c8f550afb849575d34bb4a8ed3935c7b8d7dcc8f28bde7ecbdfe16a2
 *
 * Official item codes were read from the original K=収支項目分類 column
 * under the same 2024 head-age x gross-income x worker household table.
 * Finding an official item name NEVER proves equivalence of
 * respondent question, period, expense scope, or cohort population.
 * Do not use this audit for benchmark, CONFIRMED, cUpper or monetary buffer.
 */
export type Category2024PeerCoverageStatus=
 'official_cross_reference_with_scope_warning'|
 'related_official_item_not_comparable'|
 'no_separate_official_item';
export type Category2024PeerAuditV1={
 category:string;
 status:Category2024PeerCoverageStatus;
 officialItems:readonly string[];
 /** Specific difference from the FROZEN diagnosis input contract. */
 scopeCaveat:string;
 /** Consumer-facing reason; no fabricated peer percentage. */
 userNotice:string;
};
export const CHAPTER2_2024_PEER_COVERAGE_AUDIT_V1:readonly Category2024PeerAuditV1[]=[
 {category:'mobile',status:'related_official_item_not_comparable',
  officialItems:['21010703_通信'],
  scopeCaveat:'2024の通信は郵便・固定通信などを含む。一方アプリはスマホ・家族回線・固定ネット・端末分割などを回答により含み得る。費目内訳一致なし。',
  userNotice:'通信の公式費目はあるけれど、端末代や回線数を揃えられないため、同条件の負担率としては表示しないよ。'},
 {category:'energy',status:'official_cross_reference_with_scope_warning',
  officialItems:['210103_光熱・水道'],
  scopeCaveat:'原表は世帯の光熱・水道。本人の請求額の集計範囲・補助・月の季節変動まで統計と一致するとは限らない。',
  userNotice:'光熱・水道の公表費目は対応。世帯主年齢・年収・就労・標本数の条件がそろう場合に限り参考率を表示するよ。'},
 {category:'sub',status:'no_separate_official_item',
  officialItems:[],
  scopeCaveat:'動画・音楽・ゲーム・ジム等のサブスク支払は食費・教養娯楽・サービス等に横断計上され、独立した中分類でない。二重計上の危険。',
  userNotice:'サブスクだけの公式平均はないよ。使っているか・重複がないかを優先して確認しよう。'},
 {category:'car',status:'related_official_item_not_comparable',
  officialItems:['21010702_自動車等関係費','210107023_自動車等維持'],
  scopeCaveat:'原表は自転車購入・車両購入等を含む全世帯平均。アプリのローン・車保険・税・駐車等と合致せず、非保有者も混ざる。',
  userNotice:'車を持たない世帯も入った統計だから、その平均と車の維持費をそのまま比べないよ。'},
 {category:'food',status:'official_cross_reference_with_scope_warning',
  officialItems:['210101_食料'],
  scopeCaveat:'公式食料は外食・酒類等を含む。アプリの食費回答に同じ範囲が含まれるか個別確認できない。',
  userNotice:'食費の公式参考は外食・酒類などを含む総額。入力した食費の範囲が違えば単純比較はできないよ。'},
 {category:'daily',status:'official_cross_reference_with_scope_warning',
  officialItems:['21010404_家事雑貨','21010405_家事用消耗品'],
  scopeCaveat:'2024の家事雑貨＋家事用消耗品は、診断の日用品（シャンプー等の日常衛生用品を含み得る）の全範囲ではない。公表済み2費目の限定的な参考。',
  userNotice:'日用品の参考は公式の「家事雑貨＋家事用消耗品」。シャンプー等を含む診断の日用品全体の平均ではないよ。'},
 {category:'fun',status:'related_official_item_not_comparable',
  officialItems:['210109_教養娯楽','21011003_交際費'],
  scopeCaveat:'統計の教養娯楽にはペット関連・サービス・耐久財等を含み、交際費や外食は別分類。アプリの娯楽/交際費はサブスクを分離し旅行月を異常値扱いしない。',
  userNotice:'「娯楽・交際費」は統計の教養娯楽だけでは網羅できないため、同条件の平均率として表示しないよ。'},
 {category:'beautyFashion',status:'related_official_item_not_comparable',
  officialItems:['210105_被服及び履物','210110011_理美容サービス','210110012_理美容用品'],
  scopeCaveat:'公式の被服＋理美容にはアプリの日用品の衛生用品や美容サブスク等との境界差がある。性別・個人/世帯の入力範囲が未照合。',
  userNotice:'服と理美容には公表費目があるけれど、日用品との境界や本人分／家族分を揃えられないよ。'},
 {category:'rent',status:'related_official_item_not_comparable',
  officialItems:['21010201_家賃地代','210102_住居'],
  scopeCaveat:'勤労者世帯クロス全体には持家が混在。家賃地代は賃借人だけの平均ではなく、住宅ローン返済は消費支出に含まれない。診断は家賃・ローンで分離。',
  userNotice:'この表の住居の平均には持ち家世帯も混ざるよ。家賃と住宅ローンを同列には比べない。'},
 {category:'insurance',status:'related_official_item_not_comparable',
  officialItems:['23000002_保険料','230000021_個人年金保険料','230000023_他の保険料'],
  scopeCaveat:'原表の保険料は実支出外の支払（積立/年金含む）。診断の保障保険と車保険（車に帰属）などの目的別保険料とは一致しない。',
  userNotice:'統計の保険料には積立・年金なども含むため、保障の掛け金の適正比較には使わないよ。'},
 {category:'childEducation',status:'related_official_item_not_comparable',
  officialItems:['210108_教育','21010801_授業料等','21010803_補習教育'],
  scopeCaveat:'統計には子なし世帯・学校段階違い・公私・成人教育等が混在。診断は子1人×学校段階×公私、塾や習い事を用途別に把握。',
  userNotice:'教育費は子どもの人数・学校段階・公私が揃わないと比較できないよ。'},
 {category:'selfDevelopment',status:'no_separate_official_item',
  officialItems:[],
  scopeCaveat:'資格・成人学習・ビジネス勉強等は複数の統計費目に分散し、子どもの教育費等とも混同する。',
  userNotice:'自己投資をまとめた公式平均はないよ。目的・続ける価値を確認する項目として扱うよ。'},
] as const;

export const CHAPTER2_2024_PEER_CROSS_SUPPORTED_CATEGORIES=['food','energy','daily'] as const;

/** Audit is UI information only; it cannot supply a statistic or savings. */
export function chapter2OfficialPeerCoverageV1(category:string):Category2024PeerAuditV1{
 return CHAPTER2_2024_PEER_COVERAGE_AUDIT_V1.find(x=>x.category===category)??{
  category,status:'no_separate_official_item',officialItems:[],
  scopeCaveat:'NO_AUDITED_CATEGORY_CONTRACT',userNotice:'対応する統計の費目範囲が確認できません。',
 };
}
