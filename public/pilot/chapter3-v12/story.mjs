/**
 * Chapter 3 V1.4 story bridge. Pure, CH3-only presentation contract.
 * DOES NOT read from Chapter 1/2, cookies, storage, URL, GAS or network.
 * An actual data handoff must be designed and verified with the C1/C2 owners.
 * This preview only offers an explicitly marked sample.
 */
export const JOBS=Object.freeze({
 FDM:{name:"先回り司令官",file:"JOB_01_FDM_elephant.webp"},
 FDP:{name:"節目軍師",file:"JOB_02_FDP_squirrel.webp"},
 FNM:{name:"兆しの占星術師",file:"JOB_03_FNM_blue_bird.webp"},
 FNP:{name:"ひらめき航海士",file:"JOB_04_FNP_turtle.webp"},
 IDM:{name:"メリハリ賢者",file:"JOB_05_IDM_octopus.webp"},
 IDP:{name:"戦術ハンター",file:"JOB_06_IDP_spider.webp"},
 INM:{name:"直感魔導士",file:"JOB_07_INM_cuttlefish.webp"},
 INP:{name:"風読み剣士",file:"JOB_08_INP_peregrine.webp"}
});
export const STYLES=Object.freeze({DRIVE:"前進",ENJOY:"楽しさ",SECURE:"安心",OPTIMIZE:"納得"});
export const DEMO_JOURNEY=Object.freeze({
 kind:"sample",label:"これは架空の継承デモ",
 chapter1:{job:"FDM",style:"DRIVE"},
 chapter2:{confirmedSavingMonthlyJPY:null,reviewCandidateUpperMonthlyJPY:null,
  illustrationOnly:true,confirmedSavingExists:true,reviewCandidateExists:true}
});
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const validMoney=v=>v===null||(Number.isSafeInteger(v)&&v>=0&&v<=1000000000000);
/** Validation prepares a future contract, NOT proof the user's past chapters were completed. */
export function validateStoryHandoff(input){
 if(!input||typeof input!=="object"||input.version!=="CH3_STORY_HANDOFF_V1")return {ok:false,reason:"version"};
 const c1=input.chapter1,c2=input.chapter2;
 if(!c1||!own(JOBS,c1.job)||!own(STYLES,c1.style))return {ok:false,reason:"chapter1"};
 if(!c2||!own(c2,"confirmedSavingMonthlyJPY")||!own(c2,"reviewCandidateUpperMonthlyJPY")||
    !validMoney(c2.confirmedSavingMonthlyJPY)||!validMoney(c2.reviewCandidateUpperMonthlyJPY))return {ok:false,reason:"chapter2"};
 if(c2.confirmedSavingMonthlyJPY!==null&&c2.reviewCandidateUpperMonthlyJPY!==null&&
    c2.reviewCandidateUpperMonthlyJPY<0)return {ok:false,reason:"amount"};
 // Validation is syntactic, not source authentication. Caller must do so before displaying anything as verified.
 return {ok:true,reason:null,data:{
  chapter1:{job:c1.job,style:c1.style},
  chapter2:{confirmedSavingMonthlyJPY:c2.confirmedSavingMonthlyJPY,reviewCandidateUpperMonthlyJPY:c2.reviewCandidateUpperMonthlyJPY}
 }};
}
export function journeyView(sampleEnabled=false){
 if(!sampleEnabled)return {
  kind:"standalone",chapter1:null,chapter2:null,ready:false,
  label:"前章の結果はこのプレビューに接続されていません"
 };
 return {kind:"sample",chapter1:{...DEMO_JOURNEY.chapter1},chapter2:{...DEMO_JOURNEY.chapter2},
  ready:true,label:"架空のサンプル：あなたの診断結果ではありません"};
}
export function chapter2StoryDescription(chapter2){
 if(!chapter2)return "家計の戦果は未連携。確定改善額と見直し候補額は、ここでは表示しません。";
 if(chapter2.illustrationOnly)return "確定した改善と、まだ確認が必要な見直し候補。別々に扱うのがこの冒険のルール。金額はサンプルでも作りません。";
 const hasConfirmed=chapter2.confirmedSavingMonthlyJPY!==null;
 const hasReview=chapter2.reviewCandidateUpperMonthlyJPY!==null;
 return hasConfirmed||hasReview?"確定改善額と未確定候補額は区別し、投資できるお金とは扱いません。":"数値は未確認です。改善額を推定しません。";
}
export function journeyDialogue(sample=false){
 return sample
 ? "君が獲得したJOBも、家計の戦果も、その先に叶えたいことがあってこそ意味がある。さあ、未来の目的地を探しに行こう！"
 : "第1章で自分の戦い方を知り、第2章で家計の魔物に挑む。その先にあるのは「何のためにお金を守る？」という問いだ。";
}
export const FOG_STAGES=Object.freeze([
 {name:"目的地を見つける",quest:"叶えたい未来",fog:"目標がぼんやりしている"},
 {name:"道のりを測る",quest:"いつまでに",fog:"必要な時期が見えない"},
 {name:"手持ちの力を知る",quest:"今使っている手段",fog:"選択肢が整理されていない"},
 {name:"障害を確かめる",quest:"今の気がかり",fog:"先に確認すべきことが見えない"},
 {name:"航路を選ぶ",quest:"次に知りたいこと",fog:"次の一歩が決められない"}
]);
export const MAP_REWARD=Object.freeze({
 earned:"未来の地図・第一片",unlocked:"叶えたいことと、まず確かめたいこと",
 lockedMoney:"その未来に必要な金額",lockedGap:"現在地からのギャップと比較ルート",
 disclaimer:"必要額・現在地・差額は、この5問だけでは確定しません。"
});
