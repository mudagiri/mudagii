/**
 * Official release: 令和6年全国家計構造調査, 全国家計総合集計
 * 1-29-1 (二人以上), e-Stat statsDataId=0004039867
 * source file a010292.xlsx, statInfId=000040379261.
 * Original official workbook bytes SHA-256:
 * 0a73765d1cda9c6c2a0ba8238e2260ee595dfbdbbbb91b67aa1abb55adf82c45
 *
 * Read straight from worksheet a010292, columns BB/BC/BD:
 * R1 （再掲）1000～1250万円, R2 （再掲）1250～1500万円,
 * R3 （再掲）1500万円以上. These are GROUPED ORIGINAL PUBLISHED cells,
 * not sums or reconstructed weighted averages of 50万円 cells.
 * F=1_勤労者世帯; H=世帯主の年齢(10歳階級2);
 * I=集計世帯数（概数）, or 1世帯当たり1か月間の収入と支出.
 * K=210101_食料/210103_光熱・水道/21010404_家事雑貨/
 *   21010405_家事用消耗品/4_可処分所得.
 *
 * Row tuple: [head age, published gross income range, approximate households,
 * mean monthly disposable JPY, food JPY, utilities JPY, housewares JPY,
 * household consumables JPY].
 * Excludes low sample, suppressed X, or missing '-' cells.
 * Source is a 2024 nationwide worker-household comparison; NOT savings.
 * Single-person high-income age×income samples are all below n=50,
 * suppressed or missing: intentionally NO single-person high-income rows.
 */
export const AGE_INCOME_HIGH_2024_SOURCE={
 statsDataId:'0004039867',
 fileId:'000040379261',
 url:'https://www.e-stat.go.jp/dbview?sid=0004039867',
 workbookSha256:'0a73765d1cda9c6c2a0ba8238e2260ee595dfbdbbbb91b67aa1abb55adf82c45',
 sheet:'a010292',
 columns:{'1000_1249':'BB','1250_1499':'BC','1500plus':'BD'},
 sampleThreshold:50,
} as const;

export const OBSERVED_2024_HIGH_MULTI_WORKER_CELLS:readonly (readonly [
 string,string,number,number,number,number,number,number
])[]=[
 ['30～39（10歳階級2）','（再掲）1000～1250万円',280,593662,88255,19533,4705,3385],
 ['30～39（10歳階級2）','（再掲）1250～1500万円',80,734251,95529,18599,5412,2945],
 ['40～49（10歳階級2）','（再掲）1000～1250万円',670,579148,105443,23236,4246,3798],
 ['40～49（10歳階級2）','（再掲）1250～1500万円',300,667844,116635,23752,5340,3921],
 ['40～49（10歳階級2）','（再掲）1500万円以上',200,965121,132463,25508,5715,3162],
 ['50～59（10歳階級2）','（再掲）1000～1250万円',850,583144,99229,24907,3972,3791],
 ['50～59（10歳階級2）','（再掲）1250～1500万円',450,692673,114188,25092,4000,3876],
 ['50～59（10歳階級2）','（再掲）1500万円以上',410,870777,130143,25809,4277,4164],
 ['60～69（10歳階級2）','（再掲）1000～1250万円',330,623748,114803,27199,3181,4262],
 ['60～69（10歳階級2）','（再掲）1250～1500万円',170,685680,112718,27778,3082,4011],
 ['60～69（10歳階級2）','（再掲）1500万円以上',140,1008240,136256,30199,4984,4715],
 ['70～79（10歳階級2）','（再掲）1000～1250万円',50,679327,110191,32590,5349,4155],
] as const;
