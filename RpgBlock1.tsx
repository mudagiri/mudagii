import React, { useEffect, useMemo, useState } from 'react';
import { TONE_MODES, type ToneMode } from './tone-mode-v3';
import { emptyRawExpenses, normalizeApplicability, buildComparableV3, runDiagnosisAdapterV3, buildFinalJudgementsV3,housingScreenV3, type AnnualIncomeBand, type RawExpenses, type FinalCategoryV3 } from './mudagiri-integration-v3';
import { preloadOpening, preloadProfile, preloadScan, preloadAppraisal, preloadBattle } from './asset-loading-v2';
import { ENEMY_ASSETS, type EnemyAssetCategory } from './enemy-assets-v1';
import { TYPE_QUESTIONS_V31, scoreTypeAnswersV31, type RawAnswerV31, type TypeAnswersV31 } from './type-questionnaire-v3.1';
import { runDiagnosisV2, type Category, type Satisfaction } from './mudagiri-diagnosis-v2';
import { resolveComparableV1, type EducationStage } from './comparable-resolver-v1';
import type { EducationStageV2 } from './comparable-resolver-v2';

export type FamilyProfile = 'single' | 'couple' | 'children' | 'other';

type Props = {
  step: 'intro' | 'profile';
  toneMode: ToneMode;
  onBegin: (mode: ToneMode) => void;
  onFamilySelect: (profile: FamilyProfile) => void;
  onCompleteV3?: (v: {profile:{prefecture:string;age:number;household:FamilyProfile;householdSize:number;workStyle:string;housingType:string;monthlyTakeHome:number};annualIncomeBand:AnnualIncomeBand;annualIncomeResolverInput:number|null;rawExpenses:RawExpenses;typeAnswers:TypeAnswersV31;appraisal:AppraisalMap;finalJudgements:FinalCategoryV3[];methodologyVersion:string;resolverVersion:string}) => void;
  onEvent?: (name:string,data?:Record<string,unknown>)=>void;
};

type Scene = 'opening' | 'mode' | 'profile' | 'incomeCalibration' | 'scan' | 'scanComplete' | 'typeQuiz' | 'typeComplete' | 'appraisal' | 'appraisalComplete' | 'battleIntro' | 'battle' | 'battleComplete';

type ScanPhase = 'input' | 'trace' | 'reveal' | 'detected' | 'noSpend';

type AppraisalStatus = 'battle' | 'protect' | 'safe' | 'review' | 'na';
type AppraisalAnswer = {
  satisfaction?: Satisfaction;
  beautySex?: 'male'|'female'|'preferNot';
  rentPreference?: 'burdenHigh'|'burdenSome'|'reasonable'|'protect';
  insurancePurpose?: 'clear'|'mostly'|'unclear';
  insuranceLastReview?: 'within1y'|'1to3y'|'over3y'|'never'|'unknown';
  insuranceLifeChange?: 'none'|'reviewed'|'notReviewed'|'unknown';
  insurancePublicBenefits?: 'considered'|'maybe'|'not'|'unknown';
  insuranceDuplicate?: 'none'|'intentional'|'possible'|'unknown';
  educationPreference?: 'reviewHigh'|'reviewSome'|'necessary'|'protect';
  selfDevelopmentValue?: 'inertia'|'unclear'|'purpose'|'results';
  subUnusedAmount?: number;
  subUsage?: 'none'|'one'|'several'|'unknown';
  subCancellationConfirmed?: boolean;
  educationStage?: EducationStage;
  educationChildren?: {stage:EducationStageV2}[];
  educationChildCount?: number;
  carNeed?: 'essential'|'useful'|'burden'|'notNeeded';
  mobileCarrier?: 'major'|'mvno'|'unknown';
  energyPersistence?: 'persistent'|'temporary'|'unknown';
  dailyPersistence?: 'persistent'|'temporary'|'unknown';
};
type AppraisalMap = Partial<Record<EnemyAssetCategory, AppraisalAnswer>>;
type AppraisalQuestion = {
  category: EnemyAssetCategory;
  reason: string;
  question: string;
  maxAmount?: number;
  educationCount?: number;
  educationMaxCount?: number;
  kind: 'satisfaction'|'rent'|'insuranceOverview'|'insuranceReview'|'education'|'selfDevelopment'|'subUsage'|'subUnusedAmount'|'subCancellation'|'educationChildCount'|'educationChildren'|'carNeed'|'mobileCarrier'|'energyPersistence'|'dailyPersistence'|'beautySex';
};
type FinalEnemyJudgement = {
  category: EnemyAssetCategory;
  status: AppraisalStatus;
  attentionFlag: boolean;
  reducible: number;
  priority: number;
  actual: number;
  reviewPriority?: 'high'|'medium'|'low';
};


type ProfileFlow = {
  prefecture: string;
  age: string;
  household: FamilyProfile;
  householdSize: string;
  workStyle: string;
  housingType: string;
  monthlyTakeHome: string;
};

type QuestionConfig = {
  no: 1 | 2 | 3 | 4 | 5 | 6;
  dialogue: string;
  question: string;
  helper: string;
  sprite: string;
  footer: string;
};

type ScanCategoryConfig = {
  category: EnemyAssetCategory;
  question: string;
  helper: string;
};

const SCAN_CATEGORIES: ScanCategoryConfig[] = [
  { category: 'mobile', question: '毎月の通信費はいくら？', helper: 'スマホ ＋ 自宅インターネット' },
  { category: 'energy', question: '毎月の光熱費はいくら？', helper: '電気・ガス・水道' },
  { category: 'sub', question: '毎月のサブスク費はいくら？', helper: '動画・音楽・アプリなど' },
  { category: 'food', question: '毎月の食費はいくら？', helper: '外食・自炊をあわせた目安' },
  { category: 'daily', question: '普段の月の日用品費はいくら？', helper: '消耗品・雑貨。家具・家電など一時的な購入は除く' },
  { category: 'fun', question: '普段の月の娯楽・交際費はいくら？', helper: '旅行・宿泊など一時的な大きな出費は除く' },
  { category: 'beautyFashion', question: '普段の月の美容・服飾費はいくら？', helper: '美容院・服・コスメ。特別な一時購入は除く' },
  { category: 'car', question: '毎月の車関連費はいくら？', helper: 'ローン・ガソリン・保険・駐車場など' },
  { category: 'rent', question: '毎月の家賃・住宅ローンはいくら？', helper: '住居費の月額' },
  { category: 'insurance', question: '毎月の保険料はいくら？', helper: '生命保険・医療保険など' },
  { category: 'childEducation', question: '毎月の子どもの教育費はいくら？', helper: '子どもあり世帯のみ出現' },
  { category: 'selfDevelopment', question: '毎月の自己投資費はいくら？', helper: '学び・資格・トレーニング等' },
];


type ScanEnemyLayout = {
  scale: number;
  x: number;
  y: number;
  fxScale: number;
  fxY: number;
};

// SCAN V2.1 共通レイアウト。
// まずは承認済みの通信ザウルス基準を全敵へ展開し、
// 実機一周後にズレる敵だけこの数値を個別調整する。
const SCAN_ENEMY_LAYOUT: Record<EnemyAssetCategory, ScanEnemyLayout> = {
  mobile:          { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  energy:          { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  sub:             { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  food:            { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  daily:           { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  fun:             { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  beautyFashion:   { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  car:             { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  rent:            { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  insurance:       { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  childEducation:  { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
  selfDevelopment: { scale: 1.00, x: 0, y: 0, fxScale: 1.10, fxY: -13 },
};

const ASSET = './assets/prebattle';

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県',
  '埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県',
  '佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
];

const HOUSEHOLDS: { value: FamilyProfile; label: string }[] = [
  { value: 'single', label: 'ひとり暮らし' },
  { value: 'couple', label: '夫婦・パートナー' },
  { value: 'children', label: '子どもあり' },
  { value: 'other', label: 'その他' },
];

const WORK_STYLES = [
  '会社員',
  '公務員',
  '経営者・役員',
  '自営業・フリーランス',
  'パート・アルバイト',
  '学生',
  'その他',
];

const HOUSING_TYPES = [
  '賃貸',
  '持ち家（ローンあり）',
  '持ち家（ローンなし）',
  '実家・社宅など',
  'その他',
];

const QUESTIONS: QuestionConfig[] = [
  {
    no: 1,
    dialogue: 'まずはここから！',
    question: 'どこに住んでる？',
    helper: '地域差がある支出を、近い条件で比べるぞ',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q1.png`,
    footer: '冒険準備 1 / 7',
  },
  {
    no: 2,
    dialogue: 'よし、その調子！',
    question: '年齢は？',
    helper: '年齢で差が出る支出を、近い基準で比べるぞ',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q2.png`,
    footer: '冒険準備 2 / 7',
  },
  {
    no: 3,
    dialogue: '次はパーティ編成だ！',
    question: '誰と暮らしてる？',
    helper: 'ひとり暮らしか、複数世帯かで基準が変わるぞ',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q3.png`,
    footer: '冒険準備 3 / 7',
  },
  {
    no: 4,
    dialogue: 'ちょっと君のことも教えてくれ。',
    question: '今の働き方は？',
    helper: '診断結果をあなたに合った形で整理するために使うぞ',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q4.png`,
    footer: '冒険準備 4 / 7',
  },
  {
    no: 5,
    dialogue: '敵の気配が近い……',
    question: '今の住まいは？',
    helper: '住居費の見方を正しく切り替えるぞ',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q5.png`,
    footer: '冒険準備 5 / 7',
  },
  {
    no: 6,
    dialogue: 'あと少し。家計全体のバランスを見るぞ！',
    question: '毎月の手取りは？',
    helper: '税金などが引かれた後。だいたいの平均でOK',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q1.png`,
    footer: '冒険準備 6 / 7',
  },
];

const INITIAL_FLOW: ProfileFlow = {
  prefecture: '東京都',
  age: '30',
  household: 'single',
  householdSize: '1',
  workStyle: '会社員',
  housingType: '賃貸',
  monthlyTakeHome: '',
};

export default function RpgBlock1({
  step,
  toneMode,
  onBegin,
  onFamilySelect,
  onCompleteV3,
  onEvent,
}: Props) {
  const [scene, setScene] = useState<Scene>(() => (step === 'profile' ? 'profile' : 'opening'));
  const [selectedToneMode,setSelectedToneMode]=useState<ToneMode>(toneMode);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [flow, setFlow] = useState<ProfileFlow>(INITIAL_FLOW);
  const [householdSizePending,setHouseholdSizePending]=useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [rawExpenses, setRawExpenses] = useState<RawExpenses>(()=>emptyRawExpenses());
  const [scanTouched, setScanTouched] = useState<Partial<Record<EnemyAssetCategory, boolean>>>({});
  const [annualIncomeBand,setAnnualIncomeBand]=useState<AnnualIncomeBand>('unknown');
  const [typeIndex, setTypeIndex] = useState(0);
  const [typeAnswers, setTypeAnswers] = useState<TypeAnswersV31>({});
  const [appraisalAnswers, setAppraisalAnswers] = useState<AppraisalMap>({});
  const [appraisalIndex, setAppraisalIndex] = useState(0);
  const educationStage=appraisalAnswers.childEducation?.educationStage;
  const [battleIndex, setBattleIndex] = useState(0);

  const question = QUESTIONS[questionIndex];
  const applicableScanCategories = useMemo(
    () => SCAN_CATEGORIES.filter((item) => item.category !== 'childEducation' || flow.household === 'children'),
    [flow.household],
  );
  const currentScan = applicableScanCategories[scanIndex];
  const normalizedRaw=useMemo(()=>normalizeApplicability(rawExpenses,flow.household),[rawExpenses,flow.household]);
  const discoveredCount = applicableScanCategories.filter((item)=>{const r=normalizedRaw[item.category];return r?.applicability==='applicable'&&r.known&&Number(r.amount)>0}).length;
  const currentTypeQuestion = TYPE_QUESTIONS_V31[typeIndex];
  const incomeNumber = Number(flow.monthlyTakeHome || '0') || 0;
  const comparisonBundle = useMemo(()=>buildComparableV3({
    raw:normalizedRaw,household:flow.household==='single'?'single':'multi',
    householdSize:flow.household==='single'?1:Math.max(2,Number(flow.householdSize)||2),
    age:Math.max(18,Number(flow.age||'30')||30),prefecture:flow.prefecture,annualIncomeBand,
    month:new Date().getMonth()+1,housingType:flow.housingType,
    educationStage,educationChildren:appraisalAnswers.childEducation?.educationChildren,
    beautySex:appraisalAnswers.beautyFashion?.beautySex
  }),[normalizedRaw,flow.household,flow.householdSize,flow.age,flow.prefecture,flow.housingType,annualIncomeBand,educationStage,appraisalAnswers.childEducation?.educationChildren,appraisalAnswers.beautyFashion?.beautySex]);
  const comparable=comparisonBundle.comparable;

  const actual=(c:EnemyAssetCategory)=>{const r=normalizedRaw[c];return r.known&&r.amount!==null?r.amount:0};
  const comp=(c:EnemyAssetCategory)=>comparable[c as Category]??null;
  const appraisalQuestions=useMemo<AppraisalQuestion[]>(()=>{
    if(incomeNumber<=0)return [];
    const qs:AppraisalQuestion[]=[];
    if(actual('mobile')>0){
      qs.push({category:'mobile',kind:'mobileCarrier',reason:'通信費は、大手キャリアと格安SIMで基準帯が違います。平均額には変換せず、まず回線タイプだけ確認します。',question:'スマホ回線はどのタイプ？'});
    }
    if(actual('energy')>0&&comp('energy')!==null&&actual('energy')>(comp('energy')??0)){
      qs.push({category:'energy',kind:'energyPersistence',reason:'光熱費は季節や水道の隔月請求で一時的に上がるため、1か月だけでは見直し判定しません。',question:'この金額、最近2〜3か月くらい続いてる？'});
    }
    if(actual('daily')>0&&comp('daily')!==null&&actual('daily')>(comp('daily')??0)){
      qs.push({category:'daily',kind:'dailyPersistence',reason:'日用品はまとめ買いなどで月ごとのブレがあるため、1か月の比較超過だけでは見直し判定しません。',question:'この日用品費、最近2〜3か月くらい続いてる？'});
    }
    if(actual('sub')>0){qs.push({category:'sub',kind:'subUsage',reason:'使っていない契約ほど、金額まで覚えていないことがあります。',question:'使ってない・ほぼ使ってないサブスク、ありそう？'});if(appraisalAnswers.sub?.subUsage==='one'||appraisalAnswers.sub?.subUsage==='several')qs.push({category:'sub',kind:'subUnusedAmount',maxAmount:actual('sub'),reason:'まず未使用額を確認します。改善額の確定は、次の解約・停止確認まで終わってからです。',question:'使っていない分は、月いくらくらい？'});if((appraisalAnswers.sub?.subUnusedAmount??0)>0)qs.push({category:'sub',kind:'subCancellation',reason:'未使用でも、停止できると確認できるまでは改善額に含めません。',question:'その未使用分、解約・停止できる？'});}
    (['food','fun','beautyFashion'] as EnemyAssetCategory[]).forEach(category=>{
      const c=comp(category);
      const isBeautyAudit=category==='beautyFashion'&&comparisonBundle.benchmarkMeta.beautyFashion?.confidence==='AUDIT';
      const beautyNeedsSex=category==='beautyFashion'&&flow.household==='single'&&actual(category)>0&&c!==null&&actual(category)>c&&!appraisalAnswers.beautyFashion?.beautySex;
      if(beautyNeedsSex){
        qs.push({category:'beautyFashion',kind:'beautySex',reason:'美容・服飾費は男女差が大きいため、基準を超えた人だけ、より近い比較値に補正します。',question:'より近い基準で見るために教えてね'});
        return;
      }
      if(actual(category)>0&&((c!==null&&actual(category)>c)||isBeautyAudit)){
        const copy=category==='food'?['食費は、高いだけではムダと判断できません。','今の食費について、一番近いのは？']:category==='fun'?['遊びに使うお金は、人によって価値が違います。','今の娯楽費について、一番近いのは？']:isBeautyAudit?['複数世帯の美容・服飾費は、根拠のない平均値を作らず価値判断で確認します。','今の美容・服飾費について、一番近いのは？']:['美容や服も、金額だけではムダと決められません。','今の美容・服飾費について、一番近いのは？'];
        qs.push({category,kind:'satisfaction',reason:copy[0],question:copy[1]});
      }
    });
    if(actual('car')>0)qs.push({category:'car',kind:'carNeed',reason:'車は金額だけではムダ判定できません。生活上の必要性を確認します。',question:'今の車、生活にどれくらい必要？'});
    const rent=actual('rent');
    const rentScreen=housingScreenV3(rent,comparisonBundle.benchmarkMeta.rent);
    if(rent>0&&(rentScreen.band==='check'||rentScreen.band==='detail'||rentScreen.band==='audit'))qs.push({category:'rent',kind:'rent',reason:'住まいは、金額だけでなく「守りたい価値」と家計負担を分けて見ます。',question:'今の住居費について、一番近いのは？'});
    if(actual('insurance')>0){
      qs.push({category:'insurance',kind:'insuranceOverview',reason:'保険料の高さだけではムダ判定しません。まず、今の保障をどれくらい把握しているかだけ確認します。',question:'今入ってる保険、内容ちゃんと把握してる？'});
      const purpose=appraisalAnswers.insurance?.insurancePurpose;
      if(purpose==='unclear'||purpose==='mostly')qs.push({category:'insurance',kind:'insuranceReview',reason:'内容が曖昧な場合だけ、見直し時期をもう1つ確認します。',question:'最後にちゃんと見直したのは？'});
    }
    if(flow.household==='children'&&actual('childEducation')>0){qs.push({category:'childEducation',kind:'educationChildCount',educationMaxCount:(Number(flow.householdSize)>=6?6:Math.max(1,(Number(flow.householdSize)||2)-1)),reason:'教育費を正しく比較するため、実際に教育費がかかっているお子さんの人数だけ確認します。',question:'教育費がかかっているお子さんは何人？'});if((appraisalAnswers.childEducation?.educationChildCount??0)>0)qs.push({category:'childEducation',kind:'educationChildren',educationCount:appraisalAnswers.childEducation?.educationChildCount,reason:'一人ずつ学校段階と公立・私立を合わせて、対応する文科省基準を合算します。',question:'お子さんごとの学校段階を教えて'});qs.push({category:'childEducation',kind:'education',reason:'教育費は、家庭によって「守りたい支出」の優先順位が違います。',question:'今の教育費について、一番近いのは？'});}
    if(actual('selfDevelopment')>0)qs.push({category:'selfDevelopment',kind:'selfDevelopment',reason:'自己投資は、金額より「何につながっているか」が重要です。',question:'その自己投資、目的や成果は見えてる？'});
    return qs;
  },[incomeNumber,normalizedRaw,comparable,comparisonBundle.benchmarkMeta,flow.household]);

  const diagnosisBundle=useMemo(()=>incomeNumber>0?runDiagnosisAdapterV3({
    raw:normalizedRaw,comparable,monthlyTakeHome:incomeNumber,appraisal:appraisalAnswers
  }):null,[normalizedRaw,comparable,incomeNumber,appraisalAnswers]);
  const finalBundle=useMemo(()=>diagnosisBundle?buildFinalJudgementsV3({
    raw:normalizedRaw,diagnosis:diagnosisBundle.diagnosis,comparable,benchmarkMeta:comparisonBundle.benchmarkMeta,appraisal:appraisalAnswers
  }):{categories:[] as FinalCategoryV3[],battleTargets:[] as FinalCategoryV3[]},[normalizedRaw,diagnosisBundle,comparable,comparisonBundle.benchmarkMeta,appraisalAnswers]);
  const finalJudgements=finalBundle.categories;
  const battleTargets=finalBundle.battleTargets;


  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const oldBodyOverflow = body.style.overflow;
    const oldHtmlOverflow = html.style.overflow;
    const oldBodyOverscroll = body.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = oldBodyOverflow;
      html.style.overflow = oldHtmlOverflow;
      body.style.overscrollBehavior = oldBodyOverscroll;
    };
  }, []);

  useEffect(() => {
    if (step === 'profile' && scene === 'opening') {
      setScene('profile');
    }
  }, [step, scene]);

  useEffect(()=>{preloadOpening()},[]);
  useEffect(()=>{if(scene==='profile')preloadProfile(question?.sprite,QUESTIONS[questionIndex+1]?.sprite)},[scene,questionIndex,question]);
  useEffect(()=>{if(scene==='scan')preloadScan(currentScan?.category)},[scene,scanIndex,currentScan,applicableScanCategories]);
  useEffect(()=>{if(scene==='appraisal')preloadAppraisal(appraisalQuestions.slice(appraisalIndex,appraisalIndex+2).map(x=>x.category))},[scene,appraisalQuestions,appraisalIndex]);
  useEffect(()=>{if(scene==='battleIntro'||scene==='battle')preloadBattle(battleTargets.map(x=>x.category))},[scene,battleTargets]);

  // Funnel observability only: no answers, amounts, or profile values are emitted here.
  useEffect(()=>{
    if(scene==='profile'){
      onEvent?.('profile_step_viewed',{
        step:householdSizePending?'3+':String(question?.no??questionIndex+1),
        index:questionIndex+1,
        total:QUESTIONS.length,
      });
    }
  },[scene,questionIndex,householdSizePending,question?.no,onEvent]);

  useEffect(()=>{
    if(scene==='scan'&&currentScan){
      onEvent?.('scan_step_viewed',{
        category:currentScan.category,
        index:scanIndex+1,
        total:applicableScanCategories.length,
      });
    }
  },[scene,scanIndex,currentScan?.category,applicableScanCategories.length,onEvent]);

  useEffect(()=>{
    if(scene==='typeQuiz'&&currentTypeQuestion){
      onEvent?.('type_question_viewed',{
        questionId:currentTypeQuestion.id,
        index:typeIndex+1,
        total:TYPE_QUESTIONS_V31.length,
      });
    }
  },[scene,typeIndex,currentTypeQuestion?.id,onEvent]);

  useEffect(()=>{
    const current=appraisalQuestions[appraisalIndex];
    if(scene==='appraisal'&&current){
      onEvent?.('appraisal_step_viewed',{
        category:current.category,
        kind:current.kind,
        index:appraisalIndex+1,
        total:appraisalQuestions.length,
      });
    }
  },[scene,appraisalIndex,appraisalQuestions,onEvent]);

  const beginAdventure = () => setScene('mode');
  const chooseMode = (mode:ToneMode) => {
    setSelectedToneMode(mode);
    setQuestionIndex(0);
    onBegin(mode);
    window.setTimeout(()=>setScene('profile'),600);
  };

  const nextQuestion = (householdOverride?:FamilyProfile) => {
    const effectiveHousehold=householdOverride??flow.household;
    if(question?.no===3 && effectiveHousehold!=='single' && !householdSizePending){
      setHouseholdSizePending(true);
      return;
    }
    if(householdSizePending){
      setHouseholdSizePending(false);
      setQuestionIndex((value)=>value+1);
      return;
    }
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((value) => value + 1);
      return;
    }

    setScene('incomeCalibration');
  };

  const previousQuestion = () => {
    if(householdSizePending){setHouseholdSizePending(false);return;}
    if (questionIndex === 0) return;
    if(question?.no===4 && flow.household!=='single'){setQuestionIndex((value)=>value-1);setHouseholdSizePending(true);return;}
    setQuestionIndex((value) => value - 1);
  };

  const finishDiagnosis=()=>{
    if(!onCompleteV3)return;
    onEvent?.('battle_completed',{count:battleTargets.length});
    onCompleteV3({
      profile:{prefecture:flow.prefecture,age:Math.max(18,Number(flow.age)||30),household:flow.household,householdSize:flow.household==='single'?1:Math.max(2,Number(flow.householdSize)||2),workStyle:flow.workStyle,housingType:flow.housingType,monthlyTakeHome:incomeNumber},
      annualIncomeBand,annualIncomeResolverInput:comparisonBundle.annualIncomeResolverInput,rawExpenses:normalizedRaw,typeAnswers,appraisal:appraisalAnswers,finalJudgements,
      methodologyVersion:diagnosisBundle?.diagnosis.methodologyVersion??'MUDAGIRI_DIAGNOSIS_V2',resolverVersion:'MUDAGIRI_COMPARABLE_RESOLVER_V2_0'
    });
  };
  return (
    <>
      <style>{CSS}</style>

      <main className="pre-root">
        <section className={`pre-stage pre-scene-${scene}`}>
          {scene === 'opening' ? (
            <OpeningScene onStart={beginAdventure} />
          ) : scene === 'mode' ? (
            <ModeSelectScene value={selectedToneMode} onChange={chooseMode} onBack={()=>setScene('opening')} />
          ) : scene === 'profile' ? (
            <ProfileScene
              question={question}
              index={questionIndex}
              householdSizePending={householdSizePending}
              flow={flow}
              setFlow={setFlow}
              onNext={nextQuestion}
              onBack={previousQuestion}
            />
          ) : scene === 'incomeCalibration' ? (
            <IncomeCalibrationScene value={annualIncomeBand} onBack={()=>{setQuestionIndex(QUESTIONS.length-1);setScene('profile')}} onPick={(band)=>{setAnnualIncomeBand(band);onFamilySelect(flow.household);onEvent?.('income_calibration_completed',{band});onEvent?.('profile_completed',{household:flow.household,householdSize:flow.household==='single'?1:Math.max(2,Number(flow.householdSize)||2),annualIncomeBand:band});setScanIndex(0);setScene('scan')}} />
          ) : scene === 'scan' && currentScan ? (
            <ScanScene
              key={currentScan.category}
              config={currentScan}
              current={scanIndex + 1}
              total={applicableScanCategories.length}
              discoveredBefore={applicableScanCategories
                .slice(0, scanIndex)
                .filter((item) => {const r=normalizedRaw[item.category];return r?.known&&Number(r.amount)>0}).length}
              value={rawExpenses[currentScan.category]?.known&&rawExpenses[currentScan.category]?.amount!==null?String(rawExpenses[currentScan.category].amount):''}
              unknown={!!scanTouched[currentScan.category]&&rawExpenses[currentScan.category]?.applicability==='applicable'&&!rawExpenses[currentScan.category]?.known}
              onChange={(value) => {setScanTouched(prev=>({...prev,[currentScan.category]:true}));setRawExpenses(prev=>({...prev,[currentScan.category]:{amount:Number(value||0),known:true,applicability:'applicable'}}))}}
              onUnknown={()=>{setScanTouched(prev=>({...prev,[currentScan.category]:true}));setRawExpenses(prev=>({...prev,[currentScan.category]:{amount:null,known:false,applicability:'applicable'}}))}}
              onNA={currentScan.category==='car'?()=>{setScanTouched(prev=>({...prev,car:true}));setRawExpenses(prev=>({...prev,car:{amount:null,known:false,applicability:'na'}}))}:undefined}
              onDone={() => {
                if (scanIndex >= applicableScanCategories.length - 1) {
                  if(flow.household!=='children')setRawExpenses(prev=>({...prev,childEducation:{amount:null,known:false,applicability:'na'}}));
                  onEvent?.('scan_completed',{scanned:applicableScanCategories.length});
                  setScene('scanComplete');
                  return;
                }
                setScanIndex((index) => index + 1);
              }}
            />
          ) : scene === 'scanComplete' ? (
            <ScanCompleteScene
              scanned={applicableScanCategories.length}
              discovered={discoveredCount}
              onStartAppraisal={() => {
                setAppraisalIndex(0);
                setAppraisalAnswers({});
                if(!appraisalQuestions.length)onEvent?.('appraisal_completed',{count:0});
                setScene(appraisalQuestions.length ? 'appraisal' : 'appraisalComplete');
              }}
            />
          ) : scene === 'appraisal' && appraisalQuestions[appraisalIndex] ? (
            <AdditionalAppraisalScene
              key={`${appraisalQuestions[appraisalIndex].category}-${appraisalIndex}`}
              item={appraisalQuestions[appraisalIndex]}
              current={appraisalIndex + 1}
              total={appraisalQuestions.length}
              onAnswer={(answer) => {
                const currentItem=appraisalQuestions[appraisalIndex];
                setAppraisalAnswers((prev) => ({
                  ...prev,
                  [currentItem.category]: {
                    ...prev[currentItem.category],
                    ...answer,
                  },
                }));
                if(currentItem.kind==='educationChildCount'){return;}
                if (appraisalIndex >= appraisalQuestions.length - 1) {onEvent?.('appraisal_completed',{count:appraisalQuestions.length});setScene('appraisalComplete');}
                else setAppraisalIndex((i) => i + 1);
              }}
            />
          ) : scene === 'appraisalComplete' ? (
            <AppraisalCompleteScene
              judgements={finalJudgements}
              onContinue={() => {
                setTypeIndex(0);
                setTypeAnswers({});
                setScene('typeQuiz');
              }}
            />
          ) : scene === 'typeQuiz' && currentTypeQuestion ? (
            <TypeQuizScene
              key={currentTypeQuestion.id}
              question={currentTypeQuestion}
              current={typeIndex + 1}
              total={TYPE_QUESTIONS_V31.length}
              onAnswer={(answer) => {
                setTypeAnswers((prev) => ({ ...prev, [currentTypeQuestion.id]: answer }));
                if (typeIndex >= TYPE_QUESTIONS_V31.length - 1) {
                  onEvent?.('type_completed',{answers:TYPE_QUESTIONS_V31.length});
                  setScene('typeComplete');
                  return;
                }
                setTypeIndex((index) => index + 1);
              }}
            />
          ) : scene === 'typeComplete' ? (
            <TypeCompleteScene
              answers={typeAnswers}
              onContinue={() => setScene('battleIntro')}
            />
          ) : scene === 'battleIntro' ? (
            <BattleIntroScene
              targets={battleTargets}
              reviewCount={finalJudgements.filter((x) => x.status === 'review').length}
              onStart={() => {
                setBattleIndex(0);
                onEvent?.('battle_started',{count:battleTargets.length});
                setScene(battleTargets.length ? 'battle' : 'battleComplete');
              }}
            />
          ) : scene === 'battle' && battleTargets.length ? (
            <ComboBattleScene
              targets={battleTargets}
              onDone={() => setScene('battleComplete')}
            />
          ) : (
            <BattleCompleteScene
              battleCount={battleTargets.length}
              reviewCount={finalJudgements.filter((x) => x.status === 'review').length}
              onResult={finishDiagnosis}
            />
          )}
        </section>
      </main>
    </>
  );
}

function OpeningScene({ onStart }: { onStart: () => void }) {
  return (
    <div className="pre-opening">
      <img
        className="pre-bg pre-bg-opening"
        src={`${ASSET}/BG-001_OP_FIXED.png`}
        alt=""
        aria-hidden="true"
      />

      <img
        className="pre-op-horde"
        src={`${ASSET}/MONSTER_HORDE_OP_MASTER.png`}
        alt=""
        aria-hidden="true"
      />

      <img
        className="pre-op-mudagiri"
        src={`${ASSET}/MUDAGIRI_PROFILE_Q5.png`}
        alt="斧を持つムダギリくん"
      />

      <div className="pre-op-shade" aria-hidden="true" />

      <div className="pre-op-copy">
        <div className="pre-op-eyebrow">＼ 約3分で家計診断 ／</div>

        <h1 className="pre-op-title">
          君の家計、<br />
          <strong>モンスターに喰われてない？</strong>
        </h1>

        <div className="pre-op-brand">ムダギリ伝説</div>
      </div>

      <div className="pre-op-bottom">
        <div className="pre-op-value">
          <span>地域・世帯データと比べて</span>
          <strong>あなたの家計に潜むムダを診断</strong>
        </div>

        <button type="button" className="pre-primary pre-op-cta" onClick={onStart}>
          ▶ 無料で冒険をはじめる
        </button>

        <div className="pre-reassure">登録不要 ・ 約3分</div>
      </div>
    </div>
  );
}


function ModeSelectScene({value,onChange,onBack}:{value:ToneMode;onChange:(v:ToneMode)=>void;onBack:()=>void}){
  const [picked,setPicked]=useState<ToneMode|null>(null);
  const choose=(m:ToneMode)=>{if(picked)return;setPicked(m);onChange(m)};
  const entries=(Object.keys(TONE_MODES) as ToneMode[]);
  return <div className="pre-profile mode-select-scene">
    <img className="pre-bg pre-bg-profile" src={`${ASSET}/BG-002_PROFILE_FIXED.png`} alt="" aria-hidden="true"/>
    <div className="pre-profile-overlay"/>
    <button type="button" className="mode-back" onClick={onBack}>← 戻る</button>
    <section className="mode-card">
      <div className="pre-question-no">PARTNER SELECT</div>
      <h2>どのムダギリに斬られる？</h2>
      <p>診断結果は同じ。言い方だけが変わります。</p>
      <div className="mode-list">{entries.map(m=>{const x=TONE_MODES[m];return <button key={m} type="button" className={`mode-option ${m==='serious'?'is-recommended':''} ${picked===m?'is-picked':''} ${picked&&picked!==m?'is-dim':''}`} onClick={()=>choose(m)}>
        {m==='serious'&&<small>おすすめ</small>}<strong>{x.icon} {x.name}</strong><span>{x.choice}</span>
      </button>})}</div>
      {picked&&<div className="mode-reaction">{picked==='gentle'?'大丈夫。一緒にムダだけ探そう！':picked==='serious'?'良いものは守る。ムダだけ斬るぞ。':'選んだな？ 後悔しても知らんぞ。'}</div>}
    </section>
  </div>
}

function ProfileScene({
  question,
  index,
  householdSizePending,
  flow,
  setFlow,
  onNext,
  onBack,
}: {
  question: QuestionConfig;
  index: number;
  householdSizePending: boolean;
  flow: ProfileFlow;
  setFlow: React.Dispatch<React.SetStateAction<ProfileFlow>>;
  onNext: (householdOverride?:FamilyProfile) => void;
  onBack: () => void;
}) {
  const progress = householdSizePending ? (3 / 7) * 100 : (question.no / 7) * 100;
  const isWarning = question.no === 4;
  const isEncounter = question.no >= 5;
  const [partyChoiceLocked,setPartyChoiceLocked]=useState(false);
  useEffect(()=>{if(householdSizePending)setPartyChoiceLocked(false)},[householdSizePending]);
  const choosePartySize=(n:string)=>{if(partyChoiceLocked)return;setPartyChoiceLocked(true);setFlow(v=>({...v,householdSize:n}));window.setTimeout(()=>onNext(),140)};

  return (
    <div className={`pre-profile pre-q${question.no}`}>
      <img
        className="pre-bg pre-bg-profile"
        src={`${ASSET}/BG-002_PROFILE_FIXED.png`}
        alt=""
        aria-hidden="true"
      />

      <div className="pre-profile-overlay" aria-hidden="true" />

      {isWarning && (
        <div className="pre-enemy-eyes" aria-hidden="true">
          <i />
          <i />
        </div>
      )}

      <header className="pre-profile-hud">
        <div className="pre-profile-hud-row">
          <span>冒険準備</span>
          <b>{householdSizePending?'3 / 7':`${question.no} / 7`}</b>
        </div>
        <div className="pre-progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      {question.no === 3 && (
        <div className="pre-checkpoint" aria-hidden="true">
          PARTY CHECK
        </div>
      )}

      {isEncounter && <div className="pre-encounter-shadow" aria-hidden="true" />}

      <img
        className="pre-profile-mudagiri"
        src={question.sprite}
        alt="ムダギリくん"
      />

      <section className="pre-panel">
        <div className="pre-dialogue">{question.dialogue}</div>

        <div className="pre-question-no">{householdSizePending?'CHECK':`Q${question.no}`}</div>
        <h2>{householdSizePending?'あなたを含めて何人暮らし？':question.question}</h2>
        <p className="pre-helper">{householdSizePending?'世帯人数に合った家計データと比較するために使います':question.helper}</p>

        {householdSizePending ? <div className="profile-choice-grid profile-choice-grid-5">{['2','3','4','5','6'].map(n=><button key={n} type="button" className={`profile-choice ${flow.householdSize===n?'is-selected':''}`} disabled={partyChoiceLocked} onClick={()=>choosePartySize(n)}>{n==='6'?'6人以上':`${n}人`}</button>)}</div> : <ProfileInput
          no={question.no}
          flow={flow}
          setFlow={setFlow}
          onChoiceNext={onNext}
        />}

        {!householdSizePending && [1,2,6].includes(question.no) && <button
          type="button"
          className="pre-primary pre-next profile-primary-cta"
          onClick={()=>onNext()}
          disabled={(question.no === 2 && (Number(flow.age) < 18 || Number(flow.age) > 99)) || (question.no === 6 && Number(flow.monthlyTakeHome) <= 0)}
        >
          次へ ▶
        </button>}

        {index > 0 && (
          <button type="button" className="pre-back" onClick={onBack}>
            ← 戻る
          </button>
        )}
      </section>

      <div className="pre-profile-footer">{question.footer}</div>
    </div>
  );
}

function ProfileInput({
  no,
  flow,
  setFlow,
  onChoiceNext,
}: {
  no: 1 | 2 | 3 | 4 | 5 | 6;
  flow: ProfileFlow;
  setFlow: React.Dispatch<React.SetStateAction<ProfileFlow>>;
  onChoiceNext: (householdOverride?:FamilyProfile) => void;
}) {
  const selectClass = 'pre-select';
  const [choiceLocked,setChoiceLocked]=useState(false);
  const chooseOnce=(apply:()=>void,next:()=>void)=>{if(choiceLocked)return;setChoiceLocked(true);apply();window.setTimeout(next,140)};

  if (no === 1) {
    return (
      <label className="pre-input-wrap">
        <span className="pre-sr-only">都道府県</span>
        <select
          className={selectClass}
          value={flow.prefecture}
          onChange={(e) => setFlow((v) => ({ ...v, prefecture: e.target.value }))}
        >
          {PREFECTURES.map((prefecture) => (
            <option key={prefecture} value={prefecture}>{prefecture}</option>
          ))}
        </select>
      </label>
    );
  }

  if (no === 2) {
    return (
      <label className="pre-input-wrap pre-age-wrap">
        <span className="pre-sr-only">年齢</span>
        <div className="pre-age-input">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            value={flow.age}
            onChange={(e) => {
              const age = e.target.value.replace(/\D/g, '').slice(0, 3);
              setFlow((v) => ({ ...v, age }));
            }}
            aria-label="年齢"
          />
          <span>歳</span>
        </div>
      </label>
    );
  }

  if (no === 3) {
    return <div className="profile-choice-grid profile-choice-grid-2">{HOUSEHOLDS.map(item=><button key={item.value} type="button" className={`profile-choice ${flow.household===item.value?'is-selected':''}`} disabled={choiceLocked} onClick={()=>chooseOnce(()=>setFlow(v=>({...v,household:item.value,householdSize:item.value==='single'?'1':(v.householdSize==='1'?'2':v.householdSize)})),()=>onChoiceNext(item.value))}>{item.label}</button>)}</div>;
  }

  if (no === 4) {
    return <div className="profile-choice-grid profile-choice-grid-2">{WORK_STYLES.map(workStyle=><button key={workStyle} type="button" className={`profile-choice ${flow.workStyle===workStyle?'is-selected':''}`} disabled={choiceLocked} onClick={()=>chooseOnce(()=>setFlow(v=>({...v,workStyle})),()=>onChoiceNext())}>{workStyle}</button>)}</div>;
  }

  if (no === 5) {
    return <div className="profile-choice-grid profile-choice-grid-2">{HOUSING_TYPES.map(housingType=><button key={housingType} type="button" className={`profile-choice ${flow.housingType===housingType?'is-selected':''}`} disabled={choiceLocked} onClick={()=>chooseOnce(()=>setFlow(v=>({...v,housingType})),()=>onChoiceNext())}>{housingType}</button>)}</div>;
  }

  return (
    <label className="pre-input-wrap pre-income-wrap">
      <span className="pre-sr-only">毎月の手取り</span>
      <div className="pre-age-input pre-income-input">
        <span className="pre-income-yen">¥</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={9}
          value={flow.monthlyTakeHome === '' ? '' : Number(flow.monthlyTakeHome).toLocaleString('ja-JP')}
          onChange={(e) => {
            const monthlyTakeHome = e.target.value.replace(/\D/g, '').slice(0, 8);
            setFlow((v) => ({ ...v, monthlyTakeHome }));
          }}
          placeholder="350,000"
          aria-label="毎月の手取り"
        />
        <span>/ 月</span>
      </div>
    </label>
  );
}

function IncomeCalibrationScene({value,onPick,onBack}:{value:AnnualIncomeBand;onPick:(v:AnnualIncomeBand)=>void;onBack:()=>void}){
 const opts:[AnnualIncomeBand,string][]=[['under500','〜499万円'],['500_599','500〜599万円'],['600_699','600〜699万円'],['700_799','700〜799万円'],['800_999','800〜999万円'],['1000plus','1,000万円〜'],['unknown','わからない']];
 return <div className="pre-profile pre-complete"><img className="pre-bg pre-bg-profile" src={`${ASSET}/BG-002_PROFILE_FIXED.png`} alt="" aria-hidden="true"/><div className="pre-profile-overlay pre-complete-overlay"/>
  <header className="pre-profile-hud"><div className="pre-profile-hud-row"><span>冒険準備</span><b>7 / 7</b></div><div className="pre-progress-track" aria-hidden="true"><span style={{width:'100%'}}/></div></header>
  <section className="pre-panel pre-complete-panel" style={{paddingTop:22}}>
  <div className="pre-complete-label">最後の調整だ！</div><h2 className="pre-complete-title">だいたいの年収は？</h2>
  <p style={{fontSize:12,opacity:.7,lineHeight:1.6}}>税引前のおおよその年収でOK。家計全体のバランスや、あなたに近い条件で結果を見るために使うぞ。</p>
  <div className="profile-choice-grid profile-choice-grid-2 income-band-grid">{opts.map(([v,l],i)=><button key={v} type="button" className={`profile-choice ${value===v?'is-selected':''} ${i===opts.length-1?'income-band-last':''}`} onClick={()=>onPick(v)}>{l}</button>)}</div>
  <button type="button" className="pre-back" onClick={onBack}>← 戻る</button>
 </section></div>
}

const BATTLE_ASSET = './assets/battle1';
const SCAN_MUDAGIRI_GUIDE = `${ASSET}/MUDAGIRI_PROFILE_Q1.png`;
const SCAN_MUDAGIRI_RUN = `${ASSET}/MUDAGIRI_PROFILE_Q2.png`;
const SCAN_MUDAGIRI_BATTLE = `${BATTLE_ASSET}/MUDAGIRI_BATTLE.png`;
const MUDAGIRI_BATTLE_READY = `${BATTLE_ASSET}/MUDAGIRI_BATTLE_READY.png`;
const MUDAGIRI_BATTLE_SWING = `${BATTLE_ASSET}/MUDAGIRI_BATTLE_SWING.png`;
const MUDAGIRI_BATTLE_FOLLOW = `${BATTLE_ASSET}/MUDAGIRI_BATTLE_FOLLOW.png`;

function ScanScene({
  config,
  current,
  total,
  discoveredBefore,
  value,
  unknown,
  onChange,
  onUnknown,
  onNA,
  onDone,
}: {
  config: ScanCategoryConfig;
  current: number;
  total: number;
  discoveredBefore: number;
  value: string;
  unknown: boolean;
  onChange: (value: string) => void;
  onUnknown: () => void;
  onNA?: () => void;
  onDone: () => void;
}) {
  const enemy = ENEMY_ASSETS[config.category];
  const layout = SCAN_ENEMY_LAYOUT[config.category];
  const enemyStageStyle = {
    '--enemy-scale': layout.scale,
    '--enemy-x': `${layout.x}px`,
    '--enemy-y': `${layout.y}px`,
    '--fx-scale': layout.fxScale,
    '--fx-y': `${layout.fxY}%`,
  } as React.CSSProperties;
  const [phase, setPhase] = useState<ScanPhase>('input');
  const timers = React.useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const digits = value.replace(/\D/g, '').slice(0, 7);
  const display = value === '' ? '' : Number(digits || '0').toLocaleString('ja-JP');
  const canStart = value !== '' || unknown;
  const amount = Number(digits || '0');

  const startScan = () => {
    if (!canStart) return;
    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    if (unknown) {
      setPhase('noSpend');
      return;
    }
    if (amount === 0) {
      setPhase('noSpend');
      return;
    }

    setPhase('trace');

    // 序盤はしっかり見せ、中盤はテンポアップ、終盤は少し溜める。
    // 「発見」後は自動遷移せず、ユーザーが敵を確認してから次へ進む。
    const isOpeningScan = current <= 2;
    const isEndingScan = current >= Math.max(total - 1, 1);
    const revealAt = isOpeningScan ? 550 : isEndingScan ? 470 : 330;
    const detectedAt = isOpeningScan ? 1100 : isEndingScan ? 930 : 690;

    timers.current.push(window.setTimeout(() => setPhase('reveal'), revealAt));
    timers.current.push(window.setTimeout(() => setPhase('detected'), detectedAt));
  };

  const continueScan = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    onDone();
  };

  const progress = ((current - 1 + (phase === 'input' ? 0 : 1)) / total) * 100;
  const isInput = phase === 'input';
  const isTrace = phase === 'trace';
  const isReveal = phase === 'reveal';
  const isDetected = phase === 'detected';
  const isNoSpend = phase === 'noSpend';
  const completedAreas = current - 1 + (isInput ? 0 : 1);
  const remainingAreas = Math.max(total - completedAreas, 0);
  const discoveredNow = discoveredBefore + (isDetected && amount > 0 ? 1 : 0);
  const progressPercent = Math.round((completedAreas / total) * 100);
  const hudMode = isTrace ? '気配を追跡' : isReveal ? '反応あり' : isDetected ? '敵影発見' : isNoSpend ? (unknown ? '要鑑定' : '気配なし') : '探索中';
  const mudagiriSprite = isInput || isNoSpend
    ? SCAN_MUDAGIRI_GUIDE
    : isTrace
      ? SCAN_MUDAGIRI_RUN
      : SCAN_MUDAGIRI_BATTLE;

  return (
    <div className={`scan-scene scan-phase-${phase}`}>
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="scan-shade" aria-hidden="true" />

      <header className="scan-hud">
        <div className="scan-hud-top">
          <span>ムダ探索</span>
          <b>{progressPercent}%</b>
        </div>
        <div className="scan-progress"><span style={{ width: `${progress}%` }} /></div>
      </header>

      <div className={`scan-world-hud scan-world-${phase}`} aria-live="polite">
        <div className="scan-world-mode">{hudMode}</div>
        <div className="scan-world-count">
          <span>敵影</span>
          <strong>{discoveredNow}</strong>
          <span>体 確認</span>
        </div>
        <div className="scan-world-remaining">
          {remainingAreas > 0 ? `あと ${remainingAreas} エリア` : '全エリア探索完了'}
        </div>
      </div>

      {isDetected && (
        <div className="scan-encounter-pop" role="status" aria-live="polite">
          <span>ENCOUNTER!</span>
          <strong>{enemy.name}が現れた！</strong>
        </div>
      )}

      {!isInput && !isNoSpend && (
        <>
          <div className="battle-contact" aria-hidden="true" />

          <div className="scan-enemy-stage" style={enemyStageStyle}>
            <img
              className={`scan-v21-enemy ${isTrace ? 'scan-v21-trace' : 'scan-v21-normal'}`}
              src={isTrace ? enemy.trace : enemy.normal}
              alt={isTrace ? '' : enemy.name}
              aria-hidden={isTrace ? 'true' : undefined}
            />
            {isReveal && (
              <img
                className="scan-v21-reveal"
                src={`${BATTLE_ASSET}/FX-01_REVEAL.png`}
                alt=""
                aria-hidden="true"
              />
            )}
          </div>
        </>
      )}

      <img
        className={`scan-mudagiri scan-mudagiri-${phase}`}
        src={mudagiriSprite}
        alt="ムダギリくん"
      />

      {isInput ? (
        <section className="scan-panel">
          <div className="scan-dialogue">
            {current === 1 ? '……いるな。まずは近くの気配から探るぞ！' : '次の気配だ。まだいるぞ！'}
          </div>
          <div className="scan-number">探索 {String(current).padStart(2, '0')}</div>
          <h2>{config.question}</h2>
          <p>{config.helper}</p>
          <label className="scan-money">
            <span className="pre-sr-only">{config.question}</span>
            <span className="scan-yen">¥</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={display}
              onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              aria-label={config.question}
            />
            <span className="scan-month">/ 月</span>
          </label>
          <button type="button" className="pre-primary scan-start" disabled={!canStart} onClick={startScan}>
            気配を探る ▶
          </button>
          <div className="scan-input-actions">
            <button type="button" className="scan-sub-action" onClick={onUnknown}>{unknown?'✓ 金額未把握':'金額が分からない'}</button>
            {onNA&&<button type="button" className="scan-sub-action" onClick={()=>{onNA();setPhase('noSpend')}}>車は持ってない</button>}
          </div>
          <div className="scan-zero-hint">実際に0円の月だけ 0 円を入力</div>
        </section>
      ) : (
        <section className="battle-panel scan-result-panel">
          <div className="battle-dialogue">
            {isTrace && '……気配を捕捉した。'}
            {isReveal && '来るぞ……！'}
            {isDetected && '見つけた。こいつはあとで判定するぞ。'}
            {isNoSpend && (unknown ? '金額未把握。ムダとは決めず、要鑑定に回すぞ。' : 'ここには敵の気配なし。次を探すぞ！')}
          </div>
          <div className="battle-status">
            <span>{config.question.replace('毎月の', '').replace('はいくら？', '')}</span>
            <strong>{unknown?'金額未把握':`¥${amount.toLocaleString('ja-JP')} / 月`}</strong>
          </div>
          {(isTrace || isReveal) && (
            <div className="battle-loading">
              <span className="battle-loading-dot" />
              <span>探索中</span>
            </div>
          )}
          {(isDetected || isNoSpend) && (
            <button type="button" className="pre-primary scan-next-search" onClick={continueScan}>
              {current === total ? '探索結果へ ▶' : '次を探す ▶'}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

function ScanCompleteScene({
  scanned,
  discovered,
  onStartAppraisal,
}: {
  scanned: number;
  discovered: number;
  onStartAppraisal: () => void;
}) {
  return (
    <div className="scan-scene scan-complete-scene appraisal-intro-scene">
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="appraisal-intro-shade" aria-hidden="true" />

      <header className="appraisal-intro-hud">
        <span>ムダ探索</span>
        <b>100%</b>
      </header>

      <div className="appraisal-intro-summary" aria-hidden="true">
        <span>{scanned}エリア探索完了</span>
        <strong>敵影 {discovered}体</strong>
      </div>

      <img
        className="appraisal-intro-mudagiri"
        src={SCAN_MUDAGIRI_GUIDE}
        alt="ムダギリくん"
      />

      <section className="appraisal-intro-card">
        <div className="appraisal-intro-kicker">FINAL CHECK</div>
        <h2>……まだ斬るな。</h2>
        <p>
          <strong>敵がいる＝ムダとは限らない。</strong><br />
          同じ1万円でも、納得して使う金と<br />
          なんとなく消える金は違う。
        </p>
        <div className="appraisal-intro-rule">
          <span>次の目的</span>
          <b>本当に倒すべき敵を選別する</b>
        </div>
        <div className="appraisal-intro-note">
          見つかった敵だけ、必要な分だけ正体を見極めるぞ。
        </div>
        <button type="button" className="pre-primary appraisal-intro-cta" onClick={onStartAppraisal}>
          ムダ鑑定を始める ▶
        </button>
      </section>
    </div>
  );
}

type TypeQuestion = (typeof TYPE_QUESTIONS_V31)[number];

function TypeQuizScene({
  question,
  current,
  total,
  onAnswer,
}: {
  question: TypeQuestion;
  current: number;
  total: number;
  onAnswer: (answer: RawAnswerV31) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (choice: 'a' | 'b', strength: 1 | 2) => {
    if (picked) return;
    const id = `${choice}-${strength}`;
    setPicked(id);
    window.setTimeout(() => onAnswer({ choice, strength }), 260);
  };

  const progress = (current / total) * 100;

  const guideSprite =
    current <= 2
      ? `${ASSET}/MUDAGIRI_PROFILE_Q1.png`
      : current <= 5
        ? `${ASSET}/MUDAGIRI_PROFILE_Q3.png`
        : `${ASSET}/MUDAGIRI_PROFILE_Q4.png`;

  const guideLine =
    current === 1 ? 'まずは直感で答えろ。正解探しはナシだ。'
      : current === 2 ? 'いいぞ。そのまま普段の自分で選べ。'
      : current === 3 ? 'なるほど……少し傾向が見えてきた。'
      : current === 4 ? 'ここは迷った方じゃなく、普段に近い方だ。'
      : current === 5 ? '半分突破。ここからさらに絞るぞ。'
      : current === 6 ? '金の使い方には、けっこうクセが出る。'
      : current === 7 ? 'あと2つ。だいぶ見えてきたぞ。'
      : '最後だ。これでお前のクセが読める。';

  const options: {
    id: string;
    label: string;
    sub: string;
    choice: 'a' | 'b';
    strength: 1 | 2;
  }[] = [
    { id: 'a-2', label: 'かなり A 寄り', sub: 'Aにかなり近い', choice: 'a', strength: 2 },
    { id: 'a-1', label: 'やや A 寄り', sub: 'Aに少し近い', choice: 'a', strength: 1 },
    { id: 'b-1', label: 'やや B 寄り', sub: 'Bに少し近い', choice: 'b', strength: 1 },
    { id: 'b-2', label: 'かなり B 寄り', sub: 'Bにかなり近い', choice: 'b', strength: 2 },
  ];

  return (
    <div className={`scan-scene type-quiz-scene type-quiz-q${current}`}>
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="type-quiz-shade" aria-hidden="true" />

      <header className="type-quiz-hud">
        <div className="type-quiz-hud-row">
          <span>MONEY STYLE ANALYSIS</span>
          <b>{current} / {total}</b>
        </div>
        <div className="type-quiz-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="type-quiz-guide">
        <img className="type-quiz-mudagiri" src={guideSprite} alt="ムダギリくん" />
        <div className="type-quiz-dialogue">{guideLine}</div>
      </div>

      <section className="type-quiz-card">
        <div className="type-quiz-number">解析 {String(current).padStart(2, '0')}</div>
        <h2>{question.prompt}</h2>

        <div className="type-pair" aria-label="比較する2つの考え方">
          <div className="type-side type-side-a">
            <span className="type-side-badge">A</span>
            <strong>{question.a.text}</strong>
          </div>
          <div className="type-pair-vs">VS</div>
          <div className="type-side type-side-b">
            <span className="type-side-badge">B</span>
            <strong>{question.b.text}</strong>
          </div>
        </div>

        <p className="type-quiz-helper">
          <strong>4つのうち、一番近いものを1つ選んで</strong>
        </p>

        <div className="type-scale" role="radiogroup" aria-label="AとBのどちらにどのくらい近いか">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={picked === option.id}
              className={`type-scale-option ${option.id.startsWith('a') ? 'is-a' : 'is-b'} ${picked === option.id ? 'is-picked' : ''}`}
              disabled={!!picked}
              onClick={() => choose(option.choice, option.strength)}
            >
              <span>{option.label}</span>
              <small>{option.sub}</small>
            </button>
          ))}
        </div>

        <div className="type-quiz-foot">
          {current < total ? `あと ${total - current} 問` : 'これで最後だ'}
        </div>
      </section>
    </div>
  );
}

function TypeCompleteScene({ answers, onContinue }: { answers: TypeAnswersV31; onContinue: () => void }) {
  const answered = Object.keys(answers).length;
  const scored = scoreTypeAnswersV31(answers);
  const axisLabel = (axis:'fv'|'pi'|'au') => {
    if(scored.nearMiddle[axis]) return 'バランス型';
    const positive = scored.axes[axis] > 0;
    if(axis==='fv') return positive ? '未来寄り' : '今寄り';
    if(axis==='pi') return positive ? '計画寄り' : '直感寄り';
    return positive ? '普段から把握' : '必要時に確認';
  };

  return (
    <div className="scan-scene type-complete-scene">
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="type-complete-shade" aria-hidden="true" />
      <img className="type-complete-mudagiri" src={SCAN_MUDAGIRI_GUIDE} alt="ムダギリくん" />

      <section className="type-complete-card">
        <div className="type-complete-kicker">TYPE ANALYSIS COMPLETE ・ {answered} / 8</div>
        <h2>行動パターン<br />解析完了。</h2>
        <p>
          お前の「お金の使い方のクセ」は見えた。<br />
          <strong>まずは3つの傾向だけ先に開示する。</strong>
        </p>
        <div className="type-axis-preview" aria-label="お金タイプの3つの傾向">
          <div><span>時間軸</span><strong>{axisLabel('fv')}</strong></div>
          <div><span>決め方</span><strong>{axisLabel('pi')}</strong></div>
          <div><span>把握</span><strong>{axisLabel('au')}</strong></div>
        </div>
        <p className="type-complete-secret"><strong>称号はまだ秘密だ。最後のクエストの先で解放する。</strong></p>
        <div className="type-complete-next-label">
          NEXT：FINAL QUEST
        </div>
        <button
          type="button"
          className="pre-primary type-complete-cta"
          onClick={onContinue}
        >
          最後のクエストへ ▶
        </button>
      </section>
    </div>
  );
}


const SAT_OPTIONS: { label:string; sub:string; value:Satisfaction }[] = [
  { label:'かなり見直したい', sub:'減らせるなら減らしたい', value:'waste' },
  { label:'少し見直したい', sub:'ちょっと使いすぎかも', value:'inertia' },
  { label:'今くらいでいい', sub:'このくらいなら納得', value:'satisfied' },
  { label:'大切なので守りたい', sub:'ここは削りたくない', value:'verySatisfied' },
];

function AdditionalAppraisalScene({
  item,current,total,onAnswer,
}:{
  item:AppraisalQuestion; current:number; total:number;
  onAnswer:(answer:AppraisalAnswer)=>void;
}) {
  const enemy = ENEMY_ASSETS[item.category];
  const [feedback,setFeedback] = useState<{label:string;detail:string;kind:AppraisalStatus}|null>(null);
  const remaining = total-current+1;
  const commit = (answer:AppraisalAnswer, kind:AppraisalStatus, label:string, detail:string) => {
    setFeedback({kind,label,detail});
    window.setTimeout(() => onAnswer(answer), 650);
  };

  const choiceSets: Record<string,{label:string;sub:string;patch:AppraisalAnswer;kind?:AppraisalStatus;feedback?:string}[]> = {
    subUsage:[
      {label:'ないと思う',sub:'ほぼ全部使っている',patch:{subUsage:'none',subUnusedAmount:0},kind:'safe',feedback:'問題なし'},
      {label:'1つくらいありそう',sub:'使ってない契約があるかも',patch:{subUsage:'one'},kind:'review',feedback:'要確認'},
      {label:'2〜3個ありそう',sub:'整理すると見つかりそう',patch:{subUsage:'several'},kind:'review',feedback:'要確認'},
      {label:'把握できてない',sub:'何に払ってるか曖昧',patch:{subUsage:'unknown'},kind:'review',feedback:'確認優先度 高'},
    ],
    beautySex:[
      {label:'男性',sub:'男性×年齢の基準がある場合に使用',patch:{beautySex:'male'},kind:'review',feedback:'基準を更新'},
      {label:'女性',sub:'女性×年齢の基準がある場合に使用',patch:{beautySex:'female'},kind:'review',feedback:'基準を更新'},
      {label:'回答しない',sub:'男女計×年齢の基準で続ける',patch:{beautySex:'preferNot'},kind:'review',feedback:'男女計で診断'},
    ],
    carNeed:[
      {label:'生活・仕事に必須',sub:'ないと日常に支障がある',patch:{carNeed:'essential'},kind:'protect',feedback:'守る支出'},
      {label:'あるとかなり便利',sub:'利用頻度も高い',patch:{carNeed:'useful'},kind:'protect',feedback:'守る支出'},
      {label:'負担が気になってる',sub:'維持費を軽くしたい',patch:{carNeed:'burden'},kind:'review',feedback:'要確認'},
      {label:'なくても困らないかも',sub:'手放す・減らす余地がある',patch:{carNeed:'notNeeded'},kind:'review',feedback:'要確認'},
    ],
    rent:[
      {label:'かなり負担を感じる',sub:'家計を圧迫している',patch:{rentPreference:'burdenHigh'}},
      {label:'少し負担を感じる',sub:'できれば軽くしたい',patch:{rentPreference:'burdenSome'}},
      {label:'今の家なら妥当',sub:'金額には納得している',patch:{rentPreference:'reasonable'}},
      {label:'今の住環境を優先',sub:'高くてもここは守りたい',patch:{rentPreference:'protect'}},
    ],
    insuranceOverview:[
      {label:'目的も保障内容も把握してる',sub:'何のための保障か説明できる',patch:{insurancePurpose:'clear'},kind:'protect',feedback:'守る候補'},
      {label:'だいたい分かる',sub:'大枠は分かるが細部は曖昧',patch:{insurancePurpose:'mostly'},kind:'review',feedback:'もう1問だけ確認'},
      {label:'正直よく分からない',sub:'何に備えているか曖昧',patch:{insurancePurpose:'unclear'},kind:'review',feedback:'もう1問だけ確認'},
    ],
    insuranceReview:[
      {label:'1年以内',sub:'最近見直している',patch:{insuranceLastReview:'within1y'},kind:'review',feedback:'簡易診断では要確認'},
      {label:'1〜3年前',sub:'少し時間が経っている',patch:{insuranceLastReview:'1to3y'},kind:'review',feedback:'要確認'},
      {label:'3年以上前',sub:'保障と現状がズレている可能性',patch:{insuranceLastReview:'over3y'},kind:'review',feedback:'見直し候補'},
      {label:'一度も見直してない',sub:'加入時のまま',patch:{insuranceLastReview:'never'},kind:'review',feedback:'見直し候補'},
      {label:'覚えてない',sub:'契約内容から確認がおすすめ',patch:{insuranceLastReview:'unknown'},kind:'review',feedback:'見直し候補'},
    ],
    education:[
      {label:'かなり見直したい',sub:'負担が大きい',patch:{educationPreference:'reviewHigh'}},
      {label:'少し負担を感じる',sub:'家計とのバランスが気になる',patch:{educationPreference:'reviewSome'}},
      {label:'必要な教育費',sub:'今の内容は維持したい',patch:{educationPreference:'necessary'}},
      {label:'優先して守りたい',sub:'他を削ってでも大切',patch:{educationPreference:'protect'}},
    ],
    dailyPersistence:[
      {label:'2〜3か月くらい続いてる',sub:'普段から同じくらいかかっている',patch:{dailyPersistence:'persistent'},kind:'review',feedback:'継続しているため要確認'},
      {label:'今月だけ高い',sub:'まとめ買いなど一時的な増加',patch:{dailyPersistence:'temporary'},kind:'safe',feedback:'単月だけではムダ判定しません'},
      {label:'分からない',sub:'無理に推測しない',patch:{dailyPersistence:'unknown'},kind:'review',feedback:'まだ判定保留'},
    ],
    energyPersistence:[
      {label:'2〜3か月くらい続いてる',sub:'一時的ではなく高めの状態が続いている',patch:{energyPersistence:'persistent'},kind:'review',feedback:'継続しているため要確認'},
      {label:'今月だけ高い',sub:'季節要因・水道の隔月請求など',patch:{energyPersistence:'temporary'},kind:'safe',feedback:'単月だけではムダ判定しません'},
      {label:'分からない',sub:'無理に推測しない',patch:{energyPersistence:'unknown'},kind:'review',feedback:'まだ判定保留'},
    ],
    mobileCarrier:[
      {label:'大手キャリア系',sub:'docomo・au・SoftBankなど',patch:{mobileCarrier:'major'},kind:'review',feedback:'価格帯を照合'},
      {label:'格安SIM系',sub:'MVNOなど',patch:{mobileCarrier:'mvno'},kind:'review',feedback:'価格帯を照合'},
      {label:'分からない',sub:'無理に推測しない',patch:{mobileCarrier:'unknown'},kind:'review',feedback:'要確認'},
    ],
    subCancellation:[
      {label:'解約・停止できる',sub:'次回以降の支払いを止められる',patch:{subCancellationConfirmed:true},kind:'battle',feedback:'ここで初めて改善額として確定します'},
      {label:'まだ確認できていない',sub:'契約条件を確認してから判断',patch:{subCancellationConfirmed:false},kind:'review',feedback:'未確定なので改善額には含めません'},
    ],
    selfDevelopment:[
      {label:'惰性になってる',sub:'続ける理由が弱い',patch:{selfDevelopmentValue:'inertia'}},
      {label:'効果がよく分からない',sub:'成果とのつながりが曖昧',patch:{selfDevelopmentValue:'unclear'}},
      {label:'目的は明確',sub:'何のためか説明できる',patch:{selfDevelopmentValue:'purpose'}},
      {label:'成果につながってる',sub:'続ける価値を感じている',patch:{selfDevelopmentValue:'results'}},
    ],
  };

  const [amountText,setAmountText]=useState('');
  const educationCount=Math.max(1,Math.min(6,item.educationCount??1));
  const [educationChildren,setEducationChildren]=useState<{stage:EducationStageV2}[]>(()=>Array.from({length:educationCount},()=>({stage:'publicElementary' as EducationStageV2})));
  const amountNumber=Number(amountText||0);
  const amountTooHigh=item.kind==='subUnusedAmount'&&typeof item.maxAmount==='number'&&amountNumber>item.maxAmount;
  const options: {label:string;sub:string;patch:AppraisalAnswer;kind?:AppraisalStatus;feedback?:string}[] =
    item.kind === 'satisfaction'
      ? SAT_OPTIONS.map(x=>({label:x.label,sub:x.sub,patch:{satisfaction:x.value} as AppraisalAnswer}))
      : choiceSets[item.kind] ?? [];

  return (
    <div className="scan-scene appraisal-scene">
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="scan-shade" aria-hidden="true" />
      <header className="appraisal-hud">
        <span>追加鑑定</span>
        <b>{current} / {total}</b>
      </header>
      <img className="appraisal-enemy" src={enemy.normal} alt={enemy.name} />
      <img className="appraisal-mudagiri is-small" src={SCAN_MUDAGIRI_GUIDE} alt="ムダギリくん" />
      <section className="appraisal-card appraisal-question-card">
        <div className="appraisal-kicker">{enemy.name} を鑑定中</div>
        <p className="appraisal-reason">{item.reason}</p>
        <h3>{item.question}</h3>
        {feedback ? (
          <div className={`appraisal-feedback is-${feedback.kind}`}>
            <strong>{feedback.label}</strong>
            <span>{feedback.detail}</span>
          </div>
        ) : item.kind==='educationChildCount' ? (
          <div className="appraisal-options">
            {Array.from({length:item.educationMaxCount??1},(_,i)=>i+1).map(n=><button key={n} type="button" className="appraisal-option" onClick={()=>commit({educationChildCount:n},'review','人数を確認',`${n}人分の基準を合わせます`)}><strong>{n===6?'6人':`${n}人`}</strong><span>教育費がかかっている子</span></button>)}
          </div>
        ) : item.kind==='educationChildren' ? (
          <div className="appraisal-options">
            {Array.from({length:educationCount},(_,i)=><label key={i} className="appraisal-amount-input"><span>{i+1}人目</span><select value={educationChildren[i]?.stage??'publicElementary'} onChange={e=>{const stage=e.target.value as EducationStageV2;setEducationChildren(v=>{const next=[...v];next[i]={stage};return next})}}><option value="publicKindergarten">幼稚園（公立）</option><option value="privateKindergarten">幼稚園（私立）</option><option value="publicElementary">小学校（公立）</option><option value="privateElementary">小学校（私立）</option><option value="publicJuniorHigh">中学校（公立）</option><option value="privateJuniorHigh">中学校（私立）</option><option value="publicHigh">高校（公立）</option><option value="privateHigh">高校（私立）</option></select></label>)}
            <button type="button" className="appraisal-option" onClick={()=>commit({educationChildren:educationChildren.slice(0,educationCount)},'review','基準を照合',`${educationCount}人分を合算します`)}><strong>この内容で比較する</strong><span>子ども別の基準を合算</span></button>
          </div>
        ) : item.kind==='subUnusedAmount' ? (
          <div className="appraisal-options">
            <label className="appraisal-amount-input"><span>月額</span><input inputMode="numeric" pattern="[0-9]*" value={amountText} onChange={e=>setAmountText(e.target.value.replace(/[^0-9]/g,''))} placeholder="例 1200" /><b>円</b></label>
            {typeof item.maxAmount==='number'&&<div className={`appraisal-amount-limit ${amountTooHigh?'is-error':''}`}>{amountTooHigh?`サブスク総額 ¥${item.maxAmount.toLocaleString()} を超えています`:`サブスク総額 ¥${item.maxAmount.toLocaleString()} 以下で入力`}</div>}
            <button type="button" className="appraisal-option" disabled={!amountText||amountNumber<=0||amountTooHigh} onClick={()=>commit({subUnusedAmount:amountNumber,subCancellationConfirmed:undefined},'review','未使用額を確認',`月¥${amountNumber.toLocaleString()}。停止可否を確認してから改善額を確定します`)}><strong>この金額で次へ</strong><span>次に解約・停止できるか確認</span></button>
            <button type="button" className="appraisal-option" onClick={()=>commit({subUnusedAmount:undefined},'review','金額は未確定','推測額は改善額に含めません')}><strong>金額は分からない</strong><span>あとで明細を確認する</span></button>
          </div>
        ) : (
          <div className="appraisal-options">
            {options.map((o,i)=>{
              const inferredKind: AppraisalStatus =
                o.kind ?? (
                  item.kind === 'satisfaction'
                    ? (o.patch.satisfaction === 'verySatisfied' || o.patch.satisfaction === 'satisfied' ? 'protect' : 'review')
                    : item.kind === 'rent'
                      ? (o.patch.rentPreference === 'protect' || o.patch.rentPreference === 'reasonable' ? 'protect' : 'review')
                      : (item.kind === 'insuranceOverview' || item.kind === 'insuranceReview')
                        ? (o.kind ?? 'review')
                        : item.kind === 'education'
                          ? (o.patch.educationPreference === 'necessary' || o.patch.educationPreference === 'protect' ? 'protect' : 'review')
                          : item.kind === 'selfDevelopment'
                            ? (o.patch.selfDevelopmentValue === 'purpose' || o.patch.selfDevelopmentValue === 'results' ? 'protect' : 'review')
                            : 'review'
                );
              const label = o.feedback ?? (inferredKind==='protect'?'守る支出':inferredKind==='safe'?'問題なし':inferredKind==='battle'?'見直しクエスト':'要確認');
              const detail = inferredKind==='protect'?(item.kind==='insuranceOverview'?'内容を把握している支出':'ここは本人の価値を優先'):inferredKind==='safe'?'無理に斬る必要なし':inferredKind==='battle'?'見直し余地あり。改善額はまだ未確定':'金額だけでは断定しない';
              return (
                <button type="button" key={i} className="appraisal-option" onClick={()=>commit(o.patch,inferredKind,label,detail)}>
                  <strong>{o.label}</strong><span>{o.sub}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function AppraisalCompleteScene({
  judgements,onContinue,
}:{
  judgements:FinalCategoryV3[]; onContinue:()=>void;
}) {
  const counts = {
    battle:judgements.filter(x=>x.status==='battle').length,
    protect:judgements.filter(x=>x.status==='protect').length,
    safe:judgements.filter(x=>x.status==='safe').length,
    review:judgements.filter(x=>x.status==='review').length,
    na:judgements.filter(x=>x.status==='na').length,
  };
  return (
    <div className="scan-scene appraisal-scene appraisal-complete-scene">
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="type-complete-shade" aria-hidden="true" />
      <img className="appraisal-mudagiri" src={SCAN_MUDAGIRI_BATTLE} alt="ムダギリくん" />
      <section className="appraisal-card">
        <div className="appraisal-kicker">APPRAISAL COMPLETE</div>
        <h2>鑑定完了。</h2>
        <p className="appraisal-reason">
          高いからって、全部ムダとは限らない。<br />
          <strong>守る支出と、見直す候補を分けた。次は君自身のお金のクセを解析するぞ。</strong>
        </p>
        <div className="judgement-grid">
          <div><b>{counts.battle}</b><span>見直しクエスト</span></div>
          <div><b>{counts.protect}</b><span>守る支出</span></div>
          <div><b>{counts.safe}</b><span>問題なし</span></div>
          <div><b>{counts.review}</b><span>要鑑定</span></div>
          <div><b>{counts.na}</b><span>対象外</span></div>
        </div>
        <button type="button" className="pre-primary appraisal-next" onClick={onContinue}>
          お金タイプを解析する ▶
        </button>
      </section>
    </div>
  );
}

function BattleIntroScene({
  targets,reviewCount,onStart,
}:{
  targets:FinalCategoryV3[]; reviewCount:number; onStart:()=>void;
}) {
  return (
    <div className="scan-scene battle-intro-scene">
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="type-complete-shade" aria-hidden="true" />
      <section className="battle-intro-card">
        <div className="appraisal-kicker">{targets.length ? 'TARGET LOCK' : 'HOUSEHOLD DEFENSE'}</div>
        <h2>{targets.length ? '見直しクエストを特定！' : '家計防衛成功！'}</h2>
        {targets.length ? (
          <div className="battle-targets">
            {targets.map((t,i)=>{
              const e=ENEMY_ASSETS[t.category];
              return <div key={t.category}><img src={e.normal} alt="" /><span>#{i+1}</span><strong>{e.name}</strong></div>;
            })}
          </div>
        ) : (
          <p className="appraisal-reason">無理に斬る敵はいなかった。<br /><strong>かなり上手くお金を使えてるぞ。</strong></p>
        )}
        {reviewCount>0 && <div className="battle-review-note">🔍 金額だけでは断定できない敵が {reviewCount} 体残っています</div>}
        <button type="button" className="pre-primary appraisal-next" onClick={onStart}>
          {targets.length ? `クエストを開始する ▶` : '結果へ進む ▶'}
        </button>
      </section>
    </div>
  );
}

function ComboBattleScene({ targets,onDone }:{ targets:FinalCategoryV3[]; onDone:()=>void }) {
  const [phase,setPhase]=useState<'ready'|'action'|'defeated'>('ready');
  const [pose,setPose]=useState<'ready'|'swing'|'follow'>('ready');
  const [hitIndex,setHitIndex]=useState(-1);
  const timers=React.useRef<number[]>([]);
  useEffect(()=>()=>timers.current.forEach(window.clearTimeout),[]);

  const poseSrc =
    pose==='swing' ? MUDAGIRI_BATTLE_SWING :
    pose==='follow' ? MUDAGIRI_BATTLE_FOLLOW :
    MUDAGIRI_BATTLE_READY;

  const attack=()=>{
    timers.current.forEach(window.clearTimeout); timers.current=[];
    setPhase('action'); setPose('ready'); setHitIndex(-1);

    // One readable combo beat per enemy:
    // wind-up/step -> SWING -> SLASH/HIT -> FOLLOW -> next target.
    targets.forEach((_,i)=>{
      const t=i*620;
      timers.current.push(window.setTimeout(()=>setPose('swing'),t+120));
      timers.current.push(window.setTimeout(()=>setHitIndex(i),t+205));
      timers.current.push(window.setTimeout(()=>setPose('follow'),t+335));
      if(i<targets.length-1){
        timers.current.push(window.setTimeout(()=>setPose('ready'),t+500));
      }
    });

    const finish=targets.length*620+120;
    timers.current.push(window.setTimeout(()=>{
      setHitIndex(targets.length);
      setPose('follow');
      setPhase('defeated');
    },finish));
  };

  return (
    <div className={`scan-scene combo-battle-scene combo-count-${targets.length} combo-phase-${phase} combo-pose-${pose}`}>
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="scan-shade" aria-hidden="true" />
      <header className="combo-hud"><span>FINAL QUEST</span><b>見直し対象 {targets.length}件</b></header>
      <div className="combo-ground" aria-hidden="true" />
      <div className="combo-enemies">
        {targets.map((target,i)=>{
          const enemy=ENEMY_ASSETS[target.category];
          const defeated=phase==='defeated'||(phase==='action'&&i<hitIndex);
          const hitting=phase==='action'&&i===hitIndex;
          return <div key={target.category} className={`combo-enemy-slot slot-${i} ${hitting?'is-hit':''} ${defeated?'is-defeated':''}`}>
            <img src={defeated?enemy.defeated:enemy.normal} alt={enemy.name}/>
            {phase==='ready'&&<strong>{enemy.name}</strong>}
            {hitting&&<><img className="combo-slash" src={`${BATTLE_ASSET}/FX-02_SLASH.png`} alt=""/><img className="combo-hit" src={`${BATTLE_ASSET}/FX-03_HIT.png`} alt=""/></>}
          </div>
        })}
      </div>

      <img
        className={`combo-mudagiri ${phase==='action'?'is-attacking':''}`}
        src={poseSrc}
        alt="ムダギリくん"
      />
      {phase==='action'&&hitIndex>=0&&<div className="combo-white-flash" key={`flash-${hitIndex}`} />}

      <section className="combo-panel">
        <div className="battle-result-kicker">{phase==='ready'?'TARGETS LOCKED':phase==='action'?'MUDAGIRI COMBO':'QUEST CLEAR'}</div>
        <h2>{phase==='ready'?'見直すべき相手は見えた。':phase==='action'?'一気にいくぞ！':`${targets.length}体、見直しクエスト完了！`}</h2>
        {phase==='ready'&&<p>判定理由と、確定できた改善額だけをRESULTで開示する。</p>}
        {phase==='ready'?<button type="button" className="pre-primary combo-attack" onClick={attack}>ムダギリ発動！ ▶</button>
          :phase==='defeated'?<button type="button" className="pre-primary combo-attack" onClick={onDone}>診断結果へ ▶</button>
          :<div className="combo-slash-label">SLASH × {Math.min(Math.max(hitIndex+1,1),targets.length)}</div>}
      </section>
    </div>
  );
}

function BattleCompleteScene({battleCount,reviewCount,onResult}:{battleCount:number;reviewCount:number;onResult:()=>void}) {
  return (
    <div className="scan-scene battle-intro-scene">
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="type-complete-shade" aria-hidden="true" />
      <img className="appraisal-mudagiri" src={SCAN_MUDAGIRI_BATTLE} alt="ムダギリくん" />
      <section className="battle-intro-card">
        <div className="appraisal-kicker">QUEST CLEAR</div>
        <h2>{battleCount ? `${battleCount}件の見直しクエスト完了！` : '家計防衛成功！'}</h2>
        <p className="appraisal-reason">
          {reviewCount ? `まだ ${reviewCount} 件は金額だけでは断定できない。` : '今回の判定はすべて出そろった。'}
          <br /><strong>次は、称号と家計の全結果を開示する。</strong>
        </p>
        <div className="result-next-lock">NEXT：RESULT / 称号・改善余地・守る支出</div>
        <button type="button" className="pre-primary appraisal-next" onClick={onResult}>診断結果を見る ▶</button>
      </section>
    </div>
  );
}


const CSS = String.raw`
/* PROFILE V4 interaction anchor: canonical CTA + compact one-tap choices. */
.pre-panel .profile-primary-cta{position:absolute;z-index:40;left:16px;right:16px;bottom:max(14px,calc(env(safe-area-inset-bottom) + 8px));width:auto;min-height:56px;margin:0;touch-action:manipulation}
.pre-panel .pre-input-wrap,.pre-panel .pre-select,.pre-panel .pre-age-input{position:relative;z-index:41;pointer-events:auto}
.profile-choice-grid{position:relative;z-index:41;display:grid;gap:8px;margin-top:12px}.profile-choice-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.profile-choice-grid-5{grid-template-columns:repeat(3,minmax(0,1fr))}.profile-choice{min-height:48px;padding:8px 7px;border:1px solid rgba(255,255,255,.24);border-radius:11px;background:rgba(3,25,39,.84);color:#fff;font:inherit;font-size:13px;font-weight:900;line-height:1.18;touch-action:manipulation}.profile-choice.is-selected{border-color:#ffd62f;box-shadow:0 0 0 1px rgba(255,214,47,.34) inset;background:rgba(48,55,25,.92)}.income-band-grid{margin-top:14px}.income-band-last{grid-column:1/-1}

:root { color-scheme: dark; }

.pre-root,
.pre-root * {
  box-sizing: border-box;
}

.pre-root {
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  overflow: hidden;
  background: #020609;
  color: #fff;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif;
}

.pre-stage {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
  isolation: isolate;
  background: #0c6fd2;
}

.pre-opening,
.pre-profile {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.pre-bg {
  position: absolute;
  inset: 0;
  z-index: -10;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
  user-select: none;
  pointer-events: none;
}

.pre-bg-opening {
  object-position: center center;
}

.pre-bg-profile {
  object-position: 50% 52%;
  transform: scale(1.02);
  transition: transform .55s ease, object-position .55s ease;
}

.pre-q1 .pre-bg-profile { object-position: 47% 50%; transform: scale(1.015); }
.pre-q2 .pre-bg-profile { object-position: 49% 51%; transform: scale(1.025); }
.pre-q3 .pre-bg-profile { object-position: 51% 52%; transform: scale(1.035); }
.pre-q4 .pre-bg-profile { object-position: 53% 53%; transform: scale(1.045); filter: brightness(.94) saturate(.95); }
.pre-q5 .pre-bg-profile { object-position: 55% 54%; transform: scale(1.055); filter: brightness(.91) saturate(.92); }

.pre-op-shade,
.pre-profile-overlay,
.pre-placeholder-shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pre-op-shade {
  z-index: -3;
  background:
    linear-gradient(180deg, rgba(0,39,90,.05) 0%, rgba(0,0,0,0) 48%),
    linear-gradient(0deg, rgba(0,8,13,.92) 0%, rgba(0,8,13,.28) 25%, rgba(0,0,0,0) 48%);
}

.pre-op-horde {
  position: absolute;
  z-index: -6;
  left: 50%;
  top: 29%;
  width: min(112%, 560px);
  transform: translateX(-50%);
  opacity: .72;
  filter: drop-shadow(0 12px 20px rgba(0,0,0,.18));
  animation: pre-horde 4.8s ease-in-out infinite;
  pointer-events: none;
}

.pre-op-mudagiri {
  position: absolute;
  z-index: 8;
  left: 50%;
  bottom: 36.5%;
  width: min(58vw, 245px);
  height: auto;
  transform: translateX(-50%);
  image-rendering: pixelated;
  filter:
    drop-shadow(0 5px 0 rgba(0,0,0,.28))
    drop-shadow(0 14px 18px rgba(0,0,0,.42));
  animation: pre-idle 2.4s ease-in-out infinite;
  pointer-events: none;
}

.pre-op-copy {
  position: absolute;
  z-index: 5;
  top: max(31px, calc(env(safe-area-inset-top) + 18px));
  left: 18px;
  right: 18px;
  text-align: center;
  text-shadow: 0 2px 0 rgba(0,0,0,.72), 0 6px 18px rgba(0,0,0,.22);
}

.pre-op-eyebrow {
  font-size: clamp(11px, 3.1vw, 13px);
  font-weight: 900;
}

.pre-op-title {
  margin: 14px 0 0;
  font-size: clamp(25px, 7.1vw, 32px);
  line-height: 1.35;
  font-weight: 1000;
  letter-spacing: -.035em;
}

.pre-op-title strong {
  color: #ffd629;
  font-weight: 1000;
}

.pre-op-brand {
  display: inline-block;
  margin-top: 9px;
  min-width: 153px;
  padding: 8px 18px 9px;
  border: 1.5px solid #ffd629;
  border-radius: 9px;
  background: rgba(0,15,22,.92);
  color: #ffd629;
  font-size: clamp(17px, 4.9vw, 21px);
  font-weight: 1000;
  line-height: 1;
}

.pre-op-bottom {
  position: absolute;
  z-index: 10;
  left: 20px;
  right: 20px;
  bottom: max(22px, calc(env(safe-area-inset-bottom) + 12px));
  text-align: center;
}

.pre-op-value {
  margin-bottom: 19px;
  text-shadow: 0 2px 5px rgba(0,0,0,.88);
}

.pre-op-value span,
.pre-op-value strong {
  display: block;
}

.pre-op-value span {
  font-size: clamp(11px, 3.1vw, 13px);
  font-weight: 800;
}

.pre-op-value strong {
  margin-top: 4px;
  font-size: clamp(14px, 4vw, 17px);
  font-weight: 1000;
}

.pre-primary {
  width: 100%;
  min-height: 58px;
  border: 0;
  border-radius: 12px;
  background: #ffc12f;
  color: #161616;
  box-shadow: 0 4px 0 rgba(137,78,0,.55), 0 12px 26px rgba(0,0,0,.22);
  font: inherit;
  font-size: 16px;
  font-weight: 1000;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform .12s ease, filter .12s ease;
}

.pre-primary:active {
  transform: translateY(2px);
  filter: brightness(.96);
}

.pre-primary:focus-visible,
.pre-select:focus-visible,
.pre-back:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

.pre-op-cta {
  animation: pre-cta 2.2s ease-in-out infinite;
}

.pre-reassure {
  margin-top: 14px;
  color: rgba(255,255,255,.92);
  font-size: 11px;
  font-weight: 800;
  text-shadow: 0 2px 5px #000;
}

.pre-profile-overlay {
  z-index: -5;
  background:
    linear-gradient(180deg, rgba(0,50,105,.02) 0%, rgba(0,0,0,0) 58%, rgba(0,7,12,.36) 100%);
}

.pre-profile-hud {
  position: absolute;
  z-index: 30;
  top: max(17px, calc(env(safe-area-inset-top) + 9px));
  left: 20px;
  right: 20px;
}

.pre-profile-hud-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 11px;
  font-weight: 1000;
  text-shadow: 0 2px 5px rgba(0,0,0,.85);
}

.pre-profile-hud-row span {
  color: #ffe12f;
}

.pre-progress-track {
  height: 8px;
  margin-top: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(0,24,46,.88);
  box-shadow: 0 1px 0 rgba(255,255,255,.18);
}

.pre-progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #ffd429;
  box-shadow: 0 0 8px rgba(255,212,41,.42);
  transition: width .35s ease;
}

.pre-profile-mudagiri {
  position: absolute;
  z-index: 24;
  left: 5px;
  bottom: 41.5%;
  width: min(36vw, 158px);
  max-height: 29dvh;
  object-fit: contain;
  object-position: left bottom;
  image-rendering: pixelated;
  filter: drop-shadow(0 9px 12px rgba(0,0,0,.34));
  pointer-events: none;
  transform-origin: 50% 100%;
}

.pre-q1 .pre-profile-mudagiri { width: min(35vw, 154px); left: 7px; bottom: 40.8%; }
.pre-q2 .pre-profile-mudagiri { width: min(35vw, 154px); left: 5px; bottom: 41.2%; transform: rotate(-2deg); }
.pre-q3 .pre-profile-mudagiri { width: min(35vw, 154px); left: 5px; bottom: 41.2%; }
.pre-q4 .pre-profile-mudagiri { width: min(37vw, 162px); left: 0; bottom: 41.2%; }
.pre-q5 .pre-profile-mudagiri { width: min(38vw, 166px); left: 4px; bottom: 41.4%; }

.pre-panel {
  position: absolute;
  z-index: 20;
  left: 20px;
  right: 20px;
  bottom: max(70px, calc(env(safe-area-inset-bottom) + 58px));
  min-height: 288px;
  padding: 19px 19px 15px;
  border: 1.5px solid #ffc92c;
  border-radius: 20px;
  background: rgba(0,28,35,.96);
  box-shadow: 0 16px 36px rgba(0,0,0,.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.pre-dialogue {
  width: 72%;
  min-height: 54px;
  margin: -6px 0 17px auto;
  display: flex;
  align-items: center;
  padding: 11px 13px;
  border-radius: 12px;
  background: rgba(5,47,56,.92);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.55;
}

.pre-question-no {
  color: #ffd42b;
  font-size: 10px;
  font-weight: 1000;
}

.pre-panel h2 {
  margin: 7px 0 0;
  color: #fff;
  font-size: clamp(22px, 6.1vw, 27px);
  line-height: 1.25;
  font-weight: 1000;
  letter-spacing: -.035em;
}

.pre-helper {
  margin: 5px 0 0;
  color: rgba(255,255,255,.6);
  font-size: 10px;
  font-weight: 650;
}

.pre-input-wrap {
  display: block;
  margin-top: 15px;
}

.pre-select {
  width: 100%;
  min-height: 51px;
  padding: 0 14px;
  border: 0;
  border-radius: 11px;
  background: #fff;
  color: #172027;
  font: inherit;
  font-size: 14px;
  font-weight: 900;
  appearance: auto;
}

.pre-age-input {
  width: 100%;
  min-height: 51px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 11px;
  background: #fff;
  color: #172027;
}
.pre-age-input input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #172027;
  font: inherit;
  font-size: 22px;
  font-weight: 1000;
  text-align: right;
}
.pre-age-input span {
  margin-left: 8px;
  color: #5c6871;
  font-size: 13px;
  font-weight: 900;
}

.pre-next {
  min-height: 50px;
  margin-top: 12px;
  border-radius: 10px;
  font-size: 14px;
}

.pre-back {
  position: absolute;
  z-index: 32;
  left: 50%;
  bottom: -34px;
  transform: translateX(-50%);
  display: block;
  margin: 0;
  min-height: 44px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,.72);
  font: inherit;
  font-size: 11px;
  font-weight: 850;
  white-space: nowrap;
  cursor: pointer;
}

.pre-profile-footer {
  position: absolute;
  z-index: 25;
  left: 0;
  right: 0;
  bottom: max(20px, calc(env(safe-area-inset-bottom) + 10px));
  color: rgba(255,255,255,.9);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .02em;
  text-align: center;
  text-shadow: 0 2px 4px #000;
}

.pre-checkpoint {
  position: absolute;
  z-index: 13;
  top: 23.5%;
  left: 50%;
  transform: translateX(-50%);
  padding: 7px 15px;
  border: 1px solid #ffd42a;
  border-radius: 8px;
  background: rgba(0,24,32,.9);
  color: #ffd42a;
  font-size: 8px;
  font-weight: 1000;
  letter-spacing: .06em;
  box-shadow: 0 5px 15px rgba(0,0,0,.2);
}

.pre-enemy-eyes {
  position: absolute;
  z-index: 8;
  top: 29%;
  right: 16%;
  width: 76px;
  height: 42px;
  opacity: .42;
  filter: drop-shadow(0 0 8px rgba(255,85,30,.24));
  animation: pre-eyes 2.8s ease-in-out infinite;
}

.pre-enemy-eyes i {
  position: absolute;
  top: 13px;
  width: 19px;
  height: 9px;
  border-radius: 70% 30% 70% 30%;
  background: #ff712d;
  box-shadow: 0 0 10px rgba(255,113,45,.45);
}

.pre-enemy-eyes i:first-child {
  left: 11px;
  transform: rotate(12deg);
}

.pre-enemy-eyes i:last-child {
  right: 11px;
  transform: scaleX(-1) rotate(12deg);
}

.pre-encounter-shadow {
  position: absolute;
  z-index: 8;
  top: 22%;
  right: 12%;
  width: 88px;
  height: 112px;
  border-radius: 50% 50% 43% 43%;
  background:
    radial-gradient(circle at 37% 43%, rgba(255,90,50,.7) 0 3px, transparent 4px),
    radial-gradient(circle at 63% 43%, rgba(255,90,50,.7) 0 3px, transparent 4px),
    radial-gradient(ellipse at center, rgba(0,8,18,.86) 0 48%, rgba(0,8,18,.22) 70%, transparent 72%);
  opacity: .58;
  filter: blur(.2px);
  animation: pre-shadow 2.6s ease-in-out infinite;
}

.pre-complete .pre-bg-profile {
  object-position: 55% 54%;
  transform: scale(1.06);
  filter: brightness(.9) saturate(.94);
}

.pre-complete-overlay {
  background:
    radial-gradient(circle at 50% 45%, rgba(255,211,59,.12), transparent 34%),
    linear-gradient(180deg, rgba(0,42,86,.02), rgba(0,0,0,.4));
}

.pre-complete-mudagiri {
  left: 50%;
  bottom: 46%;
  width: min(49vw, 210px);
  transform: translateX(-50%);
}

.pre-complete-panel {
  min-height: 245px;
  text-align: center;
  padding-top: 32px;
}

.pre-complete-label {
  display: inline-block;
  padding: 6px 10px;
  border: 1px solid rgba(255,214,44,.75);
  border-radius: 999px;
  color: #ffd62c;
  font-size: 10px;
  font-weight: 1000;
  letter-spacing: .05em;
}

.pre-complete-title {
  margin: 18px 0 0 !important;
  font-size: clamp(25px, 7vw, 31px) !important;
  line-height: 1.35 !important;
}

.pre-placeholder-shade {
  background: rgba(0,8,14,.58);
  backdrop-filter: blur(3px);
}

.pre-placeholder-card {
  position: absolute;
  z-index: 10;
  top: 50%;
  left: 20px;
  right: 20px;
  transform: translateY(-50%);
  padding: 28px 22px;
  border: 1.5px solid #ffd12b;
  border-radius: 20px;
  background: rgba(0,25,33,.96);
  text-align: center;
  box-shadow: 0 16px 38px rgba(0,0,0,.44);
}

.pre-placeholder-kicker {
  color: #ffd52b;
  font-size: 10px;
  font-weight: 1000;
  letter-spacing: .14em;
}

.pre-placeholder-card h2 {
  margin: 9px 0 0;
  font-size: 30px;
  font-weight: 1000;
}

.pre-placeholder-card p {
  margin: 12px 0 0;
  font-size: 14px;
  font-weight: 800;
}

.pre-placeholder-card small {
  display: block;
  margin-top: 8px;
  color: rgba(255,255,255,.6);
  font-size: 10px;
  line-height: 1.6;
}

.pre-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes pre-idle {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}

@keyframes pre-horde {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: .66; }
  50% { transform: translateX(-50%) translateY(4px); opacity: .76; }
}

@keyframes pre-cta {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.035); }
}

@keyframes pre-eyes {
  0%, 46%, 100% { opacity: .32; }
  47%, 55% { opacity: .55; }
}

@keyframes pre-shadow {
  0%, 100% { transform: translateY(0) scale(.98); opacity: .5; }
  50% { transform: translateY(-3px) scale(1.02); opacity: .62; }
}

@media (max-height: 720px) {
  .pre-op-copy {
    top: max(20px, calc(env(safe-area-inset-top) + 8px));
  }

  .pre-op-title {
    margin-top: 8px;
    font-size: clamp(23px, 6.6vw, 28px);
  }

  .pre-op-brand {
    margin-top: 7px;
    padding-top: 6px;
    padding-bottom: 7px;
    font-size: 17px;
  }

  .pre-op-horde {
    top: 30%;
    width: 104%;
  }

  .pre-op-mudagiri {
    bottom: 37.5%;
    width: min(52vw, 196px);
  }

  .pre-op-bottom {
    bottom: max(11px, calc(env(safe-area-inset-bottom) + 5px));
  }

  .pre-op-value {
    margin-bottom: 12px;
  }

  .pre-op-value strong {
    margin-top: 1px;
  }

  .pre-primary {
    min-height: 56px;
  }

  .pre-reassure {
    margin-top: 9px;
  }

  .pre-profile-hud {
    top: max(10px, calc(env(safe-area-inset-top) + 5px));
  }

  .pre-profile-mudagiri {
    bottom: 36.1%;
    width: min(34vw, 148px);
    max-height: 24dvh;
  }

  .pre-panel {
    bottom: max(43px, calc(env(safe-area-inset-bottom) + 34px));
    min-height: 257px;
    padding: 14px 16px 11px;
  }

  .pre-dialogue {
    min-height: 43px;
    margin-bottom: 11px;
    padding: 8px 10px;
    font-size: 10px;
  }

  .pre-panel h2 {
    margin-top: 4px;
    font-size: clamp(20px, 5.7vw, 24px);
  }

  .pre-helper {
    margin-top: 3px;
    font-size: 9px;
  }

  .pre-input-wrap {
    margin-top: 10px;
  }

  .pre-select,
  .pre-next {
    min-height: 44px;
  }

  .pre-next {
    margin-top: 9px;
  }

  .pre-back {
    bottom: -31px;
  }

  .pre-profile-footer {
    bottom: max(10px, calc(env(safe-area-inset-bottom) + 4px));
    font-size: 8px;
  }

  .pre-checkpoint {
    top: 22%;
  }

  .pre-complete-mudagiri {
    width: min(42vw, 177px);
  }

  .pre-complete-panel {
    min-height: 220px;
  }
}

@media (min-width: 431px) {
  .pre-panel {
    left: 24px;
    right: 24px;
  }
}

@media (min-width: 481px) {
  .pre-root {
    display: grid;
    place-items: center;
    background: radial-gradient(circle at center, #133f58 0%, #061015 52%, #010203 100%);
  }

  .pre-stage {
    border-left: 1px solid rgba(255,255,255,.08);
    border-right: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 0 80px rgba(0,0,0,.7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pre-op-mudagiri,
  .pre-op-horde,
  .pre-op-cta,
  .pre-enemy-eyes,
  .pre-encounter-shadow {
    animation: none;
  }

  .pre-bg-profile,
  .pre-progress-track span {
    transition: none;
  }
}

/* ===== SCAN / BATTLE 01 : 通信ザウルス ===== */
.scan-scene,.battle-scene{position:absolute;inset:0;overflow:hidden;background:#0d6ec5}
.battle-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;image-rendering:pixelated;user-select:none;pointer-events:none}
.scan-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,34,79,.05) 0%,rgba(0,0,0,0) 52%),linear-gradient(0deg,rgba(0,10,15,.5) 0%,rgba(0,0,0,0) 47%);pointer-events:none}
.scan-hud{position:absolute;z-index:30;top:max(30px,calc(env(safe-area-inset-top) + 20px));left:20px;right:20px}
.scan-hud-top{display:flex;justify-content:space-between;align-items:center;color:#fff;font-size:17px;font-weight:1000;text-shadow:0 2px 5px rgba(0,0,0,.82)}
.scan-hud-top span{color:#ffe12f;letter-spacing:.02em}
.scan-hud-top b{font-size:18px}
.scan-progress{height:16px;margin-top:8px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(0,20,42,.94);overflow:hidden;box-shadow:0 3px 9px rgba(0,0,0,.28)}
.scan-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#f6bd22,#ffe65a);box-shadow:0 0 12px rgba(255,218,44,.46);transition:width .28s ease}

/* SCAN V2.2 upper-half exploration HUD.
   Background remains visible; only a light, game-like information layer is added. */
.scan-world-hud{
  position:absolute;
  z-index:12;
  top:max(122px,calc(env(safe-area-inset-top) + 108px));
  left:50%;
  width:min(82%,320px);
  transform:translateX(-50%);
  padding:16px 20px 17px;
  border:1.5px solid rgba(255,220,62,.42);
  border-radius:16px;
  background:linear-gradient(180deg,rgba(3,25,42,.56),rgba(3,23,35,.34));
  box-shadow:0 8px 24px rgba(0,0,0,.16),inset 0 0 0 1px rgba(255,255,255,.035);
  backdrop-filter:blur(2px);
  -webkit-backdrop-filter:blur(2px);
  text-align:center;
  pointer-events:none;
  transition:opacity .2s ease,transform .2s ease,background .2s ease;
}
.scan-world-mode{
  color:#ffd62f;
  font-size:14px;
  font-weight:1000;
  letter-spacing:.16em;
  text-shadow:0 2px 4px rgba(0,0,0,.65);
}
.scan-world-count{
  display:flex;
  justify-content:center;
  align-items:baseline;
  gap:6px;
  margin-top:2px;
  color:rgba(255,255,255,.92);
  font-size:17px;
  font-weight:900;
  text-shadow:0 2px 5px rgba(0,0,0,.72);
}
.scan-world-count strong{
  color:#fff;
  font-size:42px;
  line-height:1;
  font-weight:1000;
  letter-spacing:-.04em;
}
.scan-world-remaining{
  margin-top:3px;
  color:rgba(255,255,255,.64);
  font-size:15px;
  font-weight:850;
  letter-spacing:.04em;
}
.scan-world-trace,.scan-world-reveal{
  opacity:.72;
  transform:translateX(-50%) scale(.985);
}
.scan-world-detected{
  background:linear-gradient(180deg,rgba(19,48,48,.68),rgba(5,29,38,.42));
  box-shadow:0 8px 24px rgba(0,0,0,.18),0 0 22px rgba(255,213,45,.08);
}
.scan-world-noSpend .scan-world-mode{color:#a7e8c0}
.scan-encounter-pop{
  position:absolute;
  z-index:32;
  top:max(290px,calc(env(safe-area-inset-top) + 276px));
  left:50%;
  width:min(84%,328px);
  transform:translateX(-50%);
  padding:10px 14px 11px;
  border:1.5px solid rgba(255,217,47,.92);
  border-radius:13px;
  background:linear-gradient(180deg,rgba(5,20,34,.97),rgba(3,16,29,.96));
  box-shadow:0 10px 28px rgba(0,0,0,.34),0 0 20px rgba(255,211,42,.12);
  text-align:center;
  pointer-events:none;
  animation:scan-encounter-pop-in .24s cubic-bezier(.2,.9,.24,1.18) both;
}
.scan-encounter-pop span{display:block;color:#ffd62f;font-size:10px;font-weight:1000;letter-spacing:.16em;line-height:1.1}
.scan-encounter-pop strong{display:block;margin-top:4px;color:#fff;font-size:clamp(18px,5vw,22px);font-weight:1000;line-height:1.25;text-shadow:0 2px 5px rgba(0,0,0,.5)}
@keyframes scan-encounter-pop-in{
  from{opacity:0;transform:translateX(-50%) translateY(-6px) scale(.94)}
  to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}
}
.scan-mudagiri{
  position:absolute;
  z-index:24;
  left:3%;
  bottom:39.8%;
  width:min(40vw,170px);
  max-height:28dvh;
  object-fit:contain;
  object-position:left bottom;
  image-rendering:pixelated;
  filter:drop-shadow(0 10px 13px rgba(0,0,0,.34));
  pointer-events:none;
  transform-origin:48% 100%;
  transition:left .42s cubic-bezier(.2,.8,.2,1),bottom .42s cubic-bezier(.2,.8,.2,1),width .42s cubic-bezier(.2,.8,.2,1),transform .42s ease,opacity .2s ease;
}
.scan-mudagiri-input{left:2.4%;bottom:39.2%;width:min(39vw,166px);transform:translate3d(0,0,0) rotate(0deg)}
.scan-mudagiri-trace{left:11.8%;bottom:34.2%;width:min(35vw,150px);transform:translate3d(0,0,0) rotate(-4deg);animation:scan-search-step .55s ease-in-out infinite alternate}
.scan-mudagiri-reveal{left:14%;bottom:33.2%;width:min(35vw,148px);transform:translate3d(4px,-2px,0) rotate(-4deg)}
.scan-mudagiri-detected{left:8%;bottom:32.4%;width:min(37vw,156px);transform:translate3d(0,0,0) rotate(-1deg)}
.scan-mudagiri-noSpend{left:4.5%;bottom:37.2%;width:min(38vw,162px);transform:translate3d(0,0,0) rotate(0deg)}
@keyframes scan-search-step{
  from{transform:translate3d(0,0,0) rotate(-3deg)}
  to{transform:translate3d(7px,-3px,0) rotate(-1deg)}
}
.scan-panel{position:absolute;z-index:20;left:20px;right:20px;bottom:max(34px,calc(env(safe-area-inset-bottom) + 24px));min-height:320px;padding:20px 19px 18px;border:1.5px solid #ffc92c;border-radius:20px;background:rgba(0,28,35,.965);box-shadow:0 16px 36px rgba(0,0,0,.4);backdrop-filter:blur(4px)}
.scan-dialogue{width:70%;min-height:72px;margin:-7px 0 17px auto;display:flex;align-items:center;padding:14px 16px;border-radius:12px;background:rgba(5,47,56,.94);font-size:17px;font-weight:850;line-height:1.5}
.scan-number{color:#ffd42b;font-size:14px;font-weight:1000;letter-spacing:.03em}
.scan-panel h2{margin:7px 0 0;font-size:clamp(22px,6.1vw,27px);line-height:1.25;font-weight:1000;letter-spacing:-.035em}
.scan-panel p{margin:6px 0 0;color:rgba(255,255,255,.82);font-size:14px;font-weight:800;line-height:1.45}
.scan-money{display:flex;align-items:center;margin-top:16px;min-height:58px;padding:0 14px;border-radius:11px;background:#fff;color:#16212a}
.scan-yen{font-size:18px;font-weight:1000}
.scan-money input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#16212a;font:inherit;font-size:24px;font-weight:1000;text-align:right}
.scan-money input::placeholder{color:#aab2b8}
.scan-month{margin-left:7px;color:#5d6870;font-size:14px;font-weight:900}
.scan-start{margin-top:13px;min-height:54px}
.scan-start:disabled{opacity:.45;cursor:not-allowed;animation:none}
.scan-next-search{margin-top:13px;min-height:52px;font-size:15px}
.battle-hud{position:absolute;z-index:30;top:max(17px,calc(env(safe-area-inset-top) + 9px));left:18px;right:18px;display:flex;justify-content:space-between;align-items:center;text-shadow:0 2px 5px rgba(0,0,0,.8)}
.battle-hud span{color:rgba(255,255,255,.9);font-size:9px;font-weight:900}
.battle-hud b{color:#ffe12f;font-size:11px;font-weight:1000}
.battle-contact{position:absolute;z-index:4;left:14%;right:7%;bottom:32.5%;height:7%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(17,35,21,.23),transparent 70%);filter:blur(4px);pointer-events:none}
.battle-trace,.battle-enemy{position:absolute;z-index:10;right:-1%;bottom:31%;object-fit:contain;image-rendering:pixelated;pointer-events:none;transform-origin:55% 90%}
.battle-trace{width:49%;opacity:.82;filter:drop-shadow(0 10px 14px rgba(0,0,0,.26));animation:battle-trace-pulse .65s ease-in-out infinite alternate}
.battle-enemy{width:57%;filter:drop-shadow(0 11px 14px rgba(0,0,0,.26));animation:battle-enemy-in .22s ease-out both}
.battle-defeat.battle-phase-action .battle-enemy,.battle-defeat.battle-phase-result .battle-enemy{width:62%;right:-3%;bottom:30.8%}
.battle-spare.battle-phase-action .battle-enemy,.battle-spare.battle-phase-result .battle-enemy{animation:battle-escape 1.05s ease-in forwards}
.battle-unknown.battle-phase-action .battle-enemy,.battle-unknown.battle-phase-result .battle-enemy{filter:brightness(.58) saturate(.7) drop-shadow(0 11px 14px rgba(0,0,0,.28));opacity:.72;transform:scale(.96)}
.battle-mudagiri{position:absolute;z-index:15;left:-8%;bottom:27.5%;width:41%;max-height:31dvh;object-fit:contain;object-position:left bottom;image-rendering:pixelated;filter:drop-shadow(0 10px 14px rgba(0,0,0,.3));pointer-events:none}
.battle-phase-action.battle-defeat .battle-mudagiri{animation:battle-lunge .34s ease-out both}
.battle-fx{position:absolute;z-index:18;object-fit:contain;image-rendering:pixelated;pointer-events:none}
.battle-fx-reveal{right:7%;bottom:31%;width:61%;animation:battle-reveal .82s ease-out both}
.battle-fx-fade{opacity:.28}
.battle-fx-slash{right:7%;bottom:35%;width:48%;animation:battle-slash .22s ease-out both}
.battle-fx-hit{right:16%;bottom:41%;width:16%;animation:battle-hit .12s ease-out both}
.battle-fx-particles{right:-1%;bottom:29%;width:67%;opacity:.9;animation:battle-particles .7s ease-out both}
.battle-fx-dust{right:4%;bottom:31%;width:49%;animation:battle-dust .85s ease-out both}
.battle-fx-unknown{right:2%;bottom:29%;width:61%;opacity:.82;animation:battle-unknown-fx .7s ease-out both}
.battle-white-flash{position:absolute;inset:0;z-index:22;background:rgba(255,255,255,.9);pointer-events:none;animation:battle-flash .12s linear both}
.battle-panel{position:absolute;z-index:25;left:12px;right:12px;bottom:max(12px,calc(env(safe-area-inset-bottom) + 7px));min-height:166px;padding:15px 16px 14px;border:1.5px solid #f0c92f;border-radius:15px;background:rgba(5,20,34,.96);box-shadow:0 13px 30px rgba(0,0,0,.42)}
.battle-dialogue{color:#fff;font-size:17px;font-weight:1000;line-height:1.4}
.battle-status{display:flex;justify-content:space-between;align-items:center;margin-top:13px;padding:10px 12px;border-radius:10px;background:rgba(19,49,70,.72);color:rgba(255,255,255,.72);font-size:10px;font-weight:800}
.battle-status strong{color:#fff;font-size:12px;font-weight:1000}
.battle-loading{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:13px;color:#f6d93b;font-size:10px;font-weight:900}
.battle-loading-dot{width:7px;height:7px;border-radius:50%;background:#f6d93b;box-shadow:0 0 9px rgba(246,217,59,.7);animation:battle-dot .6s ease-in-out infinite alternate}
.battle-panel-result{min-height:176px}
.battle-result-kicker{color:#ffd42b;font-size:10px;font-weight:1000}
.battle-panel-result h2{margin:7px 0 0;color:#fff;font-size:clamp(20px,5.4vw,24px);line-height:1.3;font-weight:1000}
.battle-panel-result p{margin:11px 0 0;padding:9px 11px;border-radius:9px;background:rgba(19,49,70,.72);color:rgba(255,255,255,.72);font-size:10px;font-weight:750}
.battle-next{min-height:48px;margin-top:11px;border-radius:10px;font-size:13px}
.battle-phase-action.battle-defeat{animation:battle-shake .14s linear 2}

@keyframes battle-trace-pulse{from{transform:scale(.96);opacity:.58}to{transform:scale(1.03);opacity:.88}}
@keyframes battle-enemy-in{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes battle-reveal{0%{transform:scale(.78);opacity:0}42%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:.75}}
@keyframes battle-lunge{0%{transform:translate(0,0) scale(1)}58%{transform:translate(24px,-6px) scale(1.06)}100%{transform:translate(8px,0) scale(1.01)}}
@keyframes battle-slash{0%{transform:translate(-16px,12px) scale(.82);opacity:0}35%{opacity:1}100%{transform:translate(6px,-6px) scale(1.08);opacity:.1}}
@keyframes battle-hit{0%{transform:scale(.5);opacity:0}55%{transform:scale(1.15);opacity:1}100%{transform:scale(.9);opacity:.15}}
@keyframes battle-particles{from{transform:scale(.94);opacity:0}28%{opacity:1}to{transform:scale(1.05);opacity:.2}}
@keyframes battle-dust{0%{transform:scale(.85);opacity:0}35%{opacity:.95}100%{transform:scale(1.08);opacity:.15}}
@keyframes battle-unknown-fx{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:.82}}
@keyframes battle-escape{0%{transform:translate(0,0) scale(1);opacity:1}35%{transform:translate(24px,-7px) scale(.86);opacity:1}70%{transform:translate(49px,-20px) scale(.64);opacity:.72}100%{transform:translate(88px,-39px) scale(.4);opacity:0}}
@keyframes battle-flash{0%{opacity:0}32%{opacity:.96}100%{opacity:0}}
@keyframes battle-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes battle-dot{from{transform:scale(.78);opacity:.55}to{transform:scale(1.15);opacity:1}}

@media(max-height:720px){
  .scan-panel{bottom:max(13px,calc(env(safe-area-inset-bottom) + 8px));min-height:270px;padding-top:14px}
  .scan-world-hud{top:max(96px,calc(env(safe-area-inset-top) + 82px));padding:12px 16px 13px;width:min(80%,292px)}
  .scan-encounter-pop{top:max(245px,calc(env(safe-area-inset-top) + 231px));width:min(82%,304px);padding:8px 12px 9px}
  .scan-encounter-pop strong{font-size:17px}
  .scan-world-count strong{font-size:34px}
  .scan-world-mode{font-size:12px}
  .scan-world-count{font-size:15px}
  .scan-world-remaining{font-size:13px}
  .scan-mudagiri-input{left:2.2%;bottom:39.5%;width:min(34vw,144px)}
  .scan-mudagiri-trace{left:11.5%;bottom:34.2%;width:min(31vw,134px)}
  .scan-mudagiri-reveal{left:14%;bottom:33.5%;width:min(31vw,132px)}
  .scan-mudagiri-detected{left:8%;bottom:32.5%;width:min(33vw,140px)}
  .scan-mudagiri-noSpend{left:4.2%;bottom:37%;width:min(33vw,140px)}
  .scan-dialogue{min-height:56px;margin-bottom:11px;padding:11px 13px;font-size:14px}
  .scan-money{min-height:48px;margin-top:11px}
  .scan-money input{font-size:21px}
  .scan-start{min-height:46px;margin-top:9px}
  .scan-next-search{min-height:44px;margin-top:10px;font-size:14px}
  .battle-trace,.battle-enemy{bottom:28.5%}
  .battle-mudagiri{bottom:27%;width:38%}
  .battle-panel{min-height:145px;padding-top:12px}
}

@media(prefers-reduced-motion:reduce){
  .battle-trace,.battle-enemy,.battle-mudagiri,.battle-fx,.battle-white-flash,.battle-loading-dot,.battle-phase-action.battle-defeat,.scan-mudagiri,.scan-encounter-pop{animation:none!important;transition:none!important}
}

/* ===== SCAN V2.1 COMMON : 全12敵 =====
   NORMAL画像を黒シルエット化してTRACEを生成。
   TRACE→NORMALで輪郭・位置・サイズを固定。
   REVEAL FXも同じenemy-stage基準で足元へ配置する。 */
.scan-enemy-stage{
  position:absolute;
  z-index:10;
  right:-1%;
  bottom:31%;
  width:57%;
  aspect-ratio:1 / 1;
  pointer-events:none;
  --enemy-scale:1;
  --enemy-x:0px;
  --enemy-y:0px;
  --fx-scale:1.10;
  --fx-y:-13%;
}
.scan-v21-enemy,
.scan-v21-reveal{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:contain;
  image-rendering:pixelated;
  pointer-events:none;
}
.scan-v21-enemy{
  transform:translate(var(--enemy-x),var(--enemy-y)) scale(var(--enemy-scale));
  transform-origin:55% 90%;
  filter:drop-shadow(0 11px 14px rgba(0,0,0,.26));
}
.scan-v21-trace{
  opacity:.72;
  filter:brightness(0) saturate(0) drop-shadow(0 0 9px rgba(125,80,255,.48)) drop-shadow(0 11px 14px rgba(0,0,0,.34));
  animation:scan-v21-trace-pulse .42s ease-in-out infinite alternate;
}
.scan-v21-normal{
  opacity:1;
  animation:scan-v21-enemy-in .18s ease-out both;
}
.scan-v21-reveal{
  z-index:2;
  inset:auto;
  left:50%;
  bottom:var(--fx-y);
  width:118%;
  height:118%;
  object-position:center bottom;
  transform:translateX(-50%) scale(var(--fx-scale));
  transform-origin:50% 82%;
  mix-blend-mode:screen;
  animation:scan-v21-reveal .48s ease-out both;
}
@keyframes scan-v21-trace-pulse{
  from{transform:translate(var(--enemy-x),var(--enemy-y)) scale(calc(var(--enemy-scale) * .97));opacity:.58}
  to{transform:translate(var(--enemy-x),var(--enemy-y)) scale(calc(var(--enemy-scale) * 1.015));opacity:.78}
}
@keyframes scan-v21-enemy-in{
  from{transform:translate(var(--enemy-x),var(--enemy-y)) scale(calc(var(--enemy-scale) * .96));opacity:.25}
  to{transform:translate(var(--enemy-x),var(--enemy-y)) scale(var(--enemy-scale));opacity:1}
}
@keyframes scan-v21-reveal{
  0%{transform:translateX(-50%) scale(calc(var(--fx-scale) * .82));opacity:0}
  45%{transform:translateX(-50%) scale(calc(var(--fx-scale) * 1.04));opacity:.95}
  100%{transform:translateX(-50%) scale(var(--fx-scale));opacity:.18}
}
@media(max-height:720px){
  .scan-enemy-stage{bottom:28.5%}
}
@media(prefers-reduced-motion:reduce){
  .scan-v21-enemy,.scan-v21-reveal{animation:none!important}
}

/* ===== CATEGORY-DRIVEN SCAN V2 ===== */
.scan-detected-enemy{animation:battle-enemy-in .22s ease-out both}
.scan-result-panel{min-height:166px}
.scan-zero-hint{margin-top:10px;text-align:center;color:rgba(255,255,255,.74);font-size:13px;font-weight:800}
.scan-complete-scene{position:absolute;inset:0;overflow:hidden;background:#0d6ec5}
.scan-complete-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,34,79,.12),rgba(0,8,14,.7));backdrop-filter:blur(1px)}
.scan-complete-mudagiri{position:absolute;z-index:10;left:50%;top:14%;width:min(48vw,205px);transform:translateX(-50%);object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 12px 16px rgba(0,0,0,.35))}
.scan-complete-card{position:absolute;z-index:20;left:20px;right:20px;bottom:max(30px,calc(env(safe-area-inset-bottom) + 18px));padding:26px 20px 20px;border:1.5px solid #ffc92c;border-radius:20px;background:rgba(0,28,35,.965);text-align:center;box-shadow:0 16px 36px rgba(0,0,0,.42)}
.scan-complete-kicker{color:#ffd42b;font-size:10px;font-weight:1000;letter-spacing:.08em}
.scan-complete-card h2{margin:10px 0 0;color:#fff;font-size:clamp(24px,6.5vw,30px);line-height:1.3;font-weight:1000}
.scan-complete-card p{margin:14px 0 0;color:rgba(255,255,255,.72);font-size:12px;line-height:1.7;font-weight:750}
.scan-complete-card p strong{color:#fff}
.scan-complete-count{margin-top:14px;padding:9px 12px;border-radius:9px;background:rgba(19,49,70,.72);color:#ffd42b;font-size:11px;font-weight:900}
.scan-complete-next{margin-top:14px;min-height:54px}

/* ===== APPRAISAL INTRO / TYPE QUIZ V2 : GUIDE + SINGLE 4-CHOICE ===== */
.appraisal-intro-scene,
.type-quiz-scene,
.type-complete-scene{
  position:absolute;
  inset:0;
  overflow:hidden;
  background:#0d6ec5;
}
.appraisal-intro-shade,
.type-quiz-shade,
.type-complete-shade{
  position:absolute;
  inset:0;
  background:
    linear-gradient(180deg,rgba(2,17,35,.30) 0%,rgba(4,17,30,.20) 35%,rgba(0,8,14,.76) 100%);
  pointer-events:none;
}

/* --- scan -> appraisal bridge --- */
.appraisal-intro-hud{
  position:absolute;
  z-index:30;
  top:max(30px,calc(env(safe-area-inset-top) + 20px));
  left:22px;
  right:22px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  color:#fff;
  font-size:18px;
  font-weight:1000;
  text-shadow:0 2px 5px rgba(0,0,0,.72);
}
.appraisal-intro-hud span{color:#ffe12f}
.appraisal-intro-hud b{font-size:20px}
.appraisal-intro-summary{
  position:absolute;
  z-index:12;
  top:max(88px,calc(env(safe-area-inset-top) + 76px));
  left:50%;
  transform:translateX(-50%);
  width:min(80%,315px);
  padding:13px 17px;
  border:1px solid rgba(255,218,47,.34);
  border-radius:14px;
  background:rgba(3,24,39,.54);
  text-align:center;
  box-shadow:0 10px 24px rgba(0,0,0,.16);
}
.appraisal-intro-summary span{
  display:block;
  color:rgba(255,255,255,.76);
  font-size:14px;
  font-weight:850;
}
.appraisal-intro-summary strong{
  display:block;
  margin-top:3px;
  color:#fff;
  font-size:24px;
  font-weight:1000;
}
.appraisal-intro-mudagiri{
  position:absolute;
  z-index:14;
  left:4%;
  bottom:48.5%;
  width:min(41vw,174px);
  max-height:28dvh;
  object-fit:contain;
  object-position:left bottom;
  image-rendering:pixelated;
  filter:drop-shadow(0 12px 16px rgba(0,0,0,.32));
}
.appraisal-intro-card{
  position:absolute;
  z-index:22;
  left:18px;
  right:18px;
  bottom:max(24px,calc(env(safe-area-inset-bottom) + 14px));
  padding:23px 19px 18px;
  border:1.5px solid #f1c92f;
  border-radius:20px;
  background:rgba(0,27,35,.97);
  box-shadow:0 18px 38px rgba(0,0,0,.42);
  text-align:center;
}
.appraisal-intro-kicker{
  color:#ffd42b;
  font-size:14px;
  font-weight:1000;
  letter-spacing:.12em;
}
.appraisal-intro-card h2{
  margin:8px 0 0;
  color:#fff;
  font-size:clamp(31px,8.4vw,38px);
  line-height:1.08;
  font-weight:1000;
  letter-spacing:-.04em;
}
.appraisal-intro-card p{
  margin:14px 0 0;
  color:rgba(255,255,255,.82);
  font-size:15px;
  line-height:1.72;
  font-weight:780;
}
.appraisal-intro-card p strong{color:#fff;font-size:16px}
.appraisal-intro-rule{
  margin-top:14px;
  padding:11px 12px;
  border-radius:11px;
  background:rgba(21,54,72,.76);
}
.appraisal-intro-rule span{
  display:block;
  color:#ffd42b;
  font-size:12px;
  font-weight:1000;
}
.appraisal-intro-rule b{
  display:block;
  margin-top:3px;
  color:#fff;
  font-size:17px;
  font-weight:1000;
}
.appraisal-intro-note{
  margin-top:11px;
  color:rgba(255,255,255,.76);
  font-size:14px;
  line-height:1.55;
  font-weight:850;
}
.appraisal-intro-cta{margin-top:14px;min-height:58px;font-size:16px}

/* --- type appraisal --- */
.type-quiz-hud{
  position:absolute;
  z-index:30;
  top:max(28px,calc(env(safe-area-inset-top) + 18px));
  left:20px;
  right:20px;
}
.type-quiz-hud-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  color:#fff;
  font-size:18px;
  font-weight:1000;
  text-shadow:0 2px 5px rgba(0,0,0,.78);
}
.type-quiz-hud-row span{color:#ffe12f}
.type-quiz-hud-row b{font-size:20px}
.type-quiz-progress{
  height:16px;
  margin-top:8px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.15);
  border-radius:999px;
  background:rgba(0,20,42,.94);
}
.type-quiz-progress span{
  display:block;
  height:100%;
  border-radius:inherit;
  background:linear-gradient(90deg,#f6bd22,#ffe65a);
  box-shadow:0 0 12px rgba(255,218,44,.4);
  transition:width .24s ease;
}

/* Mudagiri is not the protagonist here: he sits beside the question as guide/appraiser. */
.type-quiz-guide{
  position:absolute;
  z-index:18;
  left:0;
  right:0;
  bottom:50.8%;
  height:158px;
  pointer-events:none;
}
.type-quiz-mudagiri{
  position:absolute;
  z-index:2;
  left:2%;
  bottom:-10px;
  width:min(38vw,160px);
  max-height:23dvh;
  object-fit:contain;
  object-position:left bottom;
  image-rendering:pixelated;
  filter:drop-shadow(0 10px 14px rgba(0,0,0,.32));
  transform-origin:50% 100%;
  animation:type-guide-enter .22s ease-out both;
}
.type-quiz-dialogue{
  position:absolute;
  z-index:3;
  right:4%;
  bottom:24px;
  width:61%;
  min-height:72px;
  display:flex;
  align-items:center;
  padding:13px 15px;
  border:1px solid rgba(255,255,255,.07);
  border-radius:13px;
  background:rgba(5,47,56,.95);
  color:#fff;
  font-size:17px;
  line-height:1.45;
  font-weight:900;
  box-shadow:0 8px 18px rgba(0,0,0,.18);
}
@keyframes type-guide-enter{
  from{opacity:.3;transform:translateY(5px) scale(.98)}
  to{opacity:1;transform:translateY(0) scale(1)}
}

.type-quiz-card{
  position:absolute;
  z-index:22;
  left:16px;
  right:16px;
  bottom:max(16px,calc(env(safe-area-inset-bottom) + 8px));
  padding:17px 16px 13px;
  border:1.5px solid #f1c92f;
  border-radius:19px;
  background:rgba(0,27,35,.978);
  box-shadow:0 18px 38px rgba(0,0,0,.42);
}
.type-quiz-number{
  color:#ffd42b;
  font-size:14px;
  font-weight:1000;
  letter-spacing:.08em;
}
.type-quiz-card h2{
  margin:7px 0 0;
  color:#fff;
  font-size:clamp(24px,6.7vw,29px);
  line-height:1.22;
  font-weight:1000;
  letter-spacing:-.035em;
}
.type-pair{
  position:relative;
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:10px;
  margin-top:14px;
}
.type-side{
  position:relative;
  min-width:0;
  min-height:78px;
  display:flex;
  align-items:center;
  padding:12px 10px 12px 43px;
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;
  background:rgba(18,53,68,.72);
}
.type-side-a{grid-column:1}.type-side-b{grid-column:2}
.type-side-badge{
  position:absolute;
  left:9px;
  top:50%;
  width:29px;
  height:29px;
  display:grid;
  place-items:center;
  transform:translateY(-50%);
  border-radius:8px;
  background:#f2ca2f;
  color:#10232d;
  font-size:16px;
  font-weight:1000;
}
.type-side strong{
  color:#fff;
  font-size:17px;
  line-height:1.32;
  font-weight:950;
}
.type-pair-vs{
  position:absolute;
  z-index:3;
  left:50%;
  top:50%;
  display:grid;
  place-items:center;
  transform:translate(-50%,-50%);
  min-width:38px;
  padding:5px 7px;
  border-radius:999px;
  background:#071d28;
  color:rgba(255,255,255,.55);
  font-size:12px;
  font-weight:1000;
  text-align:center;
  letter-spacing:.08em;
}
.type-quiz-helper{
  margin:11px 0 0;
  color:#fff;
  font-size:14px;
  line-height:1.4;
  text-align:center;
  font-weight:850;
}
.type-quiz-helper strong{
  color:#ffe04a;
  font-size:15px;
  font-weight:1000;
}
.type-scale{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
  margin-top:9px;
  padding:9px;
  border:1px solid rgba(255,218,47,.22);
  border-radius:13px;
  background:rgba(5,25,35,.66);
}
.type-scale-option{
  min-height:66px;
  padding:10px 8px;
  border:1px solid rgba(255,255,255,.14);
  border-radius:10px;
  background:rgba(18,53,68,.78);
  color:#fff;
  font:inherit;
  cursor:pointer;
  transition:transform .12s ease,background .12s ease,border-color .12s ease,box-shadow .12s ease;
}
.type-scale-option span{
  display:block;
  font-size:15px;
  line-height:1.2;
  font-weight:1000;
}
.type-scale-option small{
  display:block;
  margin-top:3px;
  color:rgba(255,255,255,.64);
  font-size:11px;
  line-height:1.15;
  font-weight:800;
}
.type-scale-option:active{transform:scale(.98)}
.type-scale-option.is-a{border-color:rgba(255,214,47,.28)}
.type-scale-option.is-b{border-color:rgba(107,206,255,.30)}
.type-scale-option.is-picked{
  border-color:#ffe04a;
  background:rgba(120,92,0,.78);
  box-shadow:0 0 0 2px rgba(255,224,74,.14) inset,0 0 18px rgba(255,218,47,.12);
}
.type-scale-option:disabled{cursor:default}
.type-scale-option:disabled:not(.is-picked){opacity:.58}
.type-quiz-foot{
  margin-top:9px;
  text-align:center;
  color:rgba(255,255,255,.68);
  font-size:13px;
  font-weight:900;
}

/* --- after 8 questions --- */
.type-complete-shade{
  background:linear-gradient(180deg,rgba(3,20,38,.25),rgba(0,8,14,.78));
}
.type-complete-mudagiri{
  position:absolute;
  z-index:14;
  left:50%;
  bottom:49%;
  width:min(44vw,188px);
  transform:translateX(-50%);
  object-fit:contain;
  image-rendering:pixelated;
  filter:drop-shadow(0 12px 16px rgba(0,0,0,.34));
}
.type-complete-card{
  position:absolute;
  z-index:22;
  left:18px;
  right:18px;
  bottom:max(28px,calc(env(safe-area-inset-bottom) + 16px));
  padding:25px 19px 18px;
  border:1.5px solid #f1c92f;
  border-radius:20px;
  background:rgba(0,27,35,.97);
  text-align:center;
  box-shadow:0 18px 38px rgba(0,0,0,.42);
}
.type-complete-kicker{
  color:#ffd42b;
  font-size:14px;
  font-weight:1000;
  letter-spacing:.08em;
}
.type-complete-card h2{
  margin:9px 0 0;
  color:#fff;
  font-size:clamp(30px,8vw,36px);
  line-height:1.12;
  font-weight:1000;
}
.type-complete-card p{
  margin:14px 0 0;
  color:rgba(255,255,255,.80);
  font-size:15px;
  line-height:1.68;
  font-weight:780;
}
.type-complete-card p strong{color:#fff;font-size:16px}
.type-axis-preview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0 9px}.type-axis-preview div{min-width:0;padding:9px 5px;border:1px solid rgba(255,214,47,.38);border-radius:10px;background:rgba(20,53,73,.78);text-align:center}.type-axis-preview span{display:block;color:rgba(255,255,255,.62);font-size:9px;font-weight:900}.type-axis-preview strong{display:block;margin-top:3px;color:#ffd62f;font-size:12px;font-weight:1000;line-height:1.2}.type-complete-secret{margin-top:7px!important;font-size:12px!important}
.type-complete-next-label{
  margin-top:14px;
  padding:11px 12px;
  border-radius:10px;
  background:rgba(20,53,71,.76);
  color:#ffd42b;
  font-size:13px;
  font-weight:1000;
}
.type-complete-cta{margin-top:13px;min-height:56px;font-size:16px}

/* Compact phones: keep the larger hierarchy, only compress spacing. */
@media(max-height:720px){
  .appraisal-intro-summary{top:max(80px,calc(env(safe-area-inset-top) + 68px));padding:10px 14px}
  .appraisal-intro-summary span{font-size:12px}
  .appraisal-intro-summary strong{font-size:20px}
  .appraisal-intro-mudagiri{bottom:50%;width:min(34vw,142px)}
  .appraisal-intro-card{padding:17px 16px 13px}
  .appraisal-intro-kicker{font-size:12px}
  .appraisal-intro-card h2{font-size:28px}
  .appraisal-intro-card p{margin-top:9px;font-size:13px;line-height:1.52}
  .appraisal-intro-card p strong{font-size:14px}
  .appraisal-intro-rule{margin-top:9px;padding:8px 10px}
  .appraisal-intro-rule b{font-size:15px}
  .appraisal-intro-note{margin-top:7px;font-size:12px}
  .appraisal-intro-cta{margin-top:9px;min-height:50px;font-size:15px}

  .type-quiz-hud-row{font-size:17px}
  .type-quiz-hud-row b{font-size:18px}
  .type-quiz-progress{height:14px}

  .type-quiz-guide{bottom:54.5%;height:124px}
  .type-quiz-mudagiri{left:1%;bottom:-8px;width:min(29vw,122px);max-height:19dvh}
  .type-quiz-dialogue{right:3%;bottom:18px;width:68%;min-height:55px;padding:9px 11px;font-size:14px;line-height:1.38}

  .type-quiz-card{left:12px;right:12px;bottom:max(8px,calc(env(safe-area-inset-bottom) + 4px));padding:11px 12px 9px}
  .type-quiz-number{font-size:12px}
  .type-quiz-card h2{margin-top:5px;font-size:20px;line-height:1.18}
  .type-pair{gap:5px;margin-top:8px}
  .type-side{min-height:47px;padding:7px 9px 7px 42px}
  .type-side-badge{left:9px;width:25px;height:25px;font-size:14px}
  .type-side strong{font-size:13px;line-height:1.25}
  .type-quiz-helper{margin-top:7px;font-size:12px}
  .type-quiz-helper strong{font-size:13px}
  .type-scale{gap:6px;margin-top:6px;padding:6px}
  .type-scale-option{min-height:44px;padding:6px 5px}
  .type-scale-option span{font-size:12px}
  .type-scale-option small{font-size:9.5px}
  .type-quiz-foot{margin-top:5px;font-size:11px}

  .type-complete-mudagiri{bottom:51%;width:min(37vw,156px)}
  .type-complete-card{padding:18px 16px 14px}
  .type-complete-kicker{font-size:12px}
  .type-complete-card h2{font-size:28px}
  .type-complete-card p{font-size:13px}
  .type-complete-card p strong{font-size:14px}
  .type-complete-next-label{font-size:12px}
  .type-complete-cta{min-height:50px;font-size:15px}
}

@media(prefers-reduced-motion:reduce){
  .type-quiz-progress span,
  .type-scale-option,
  .type-quiz-mudagiri{transition:none!important;animation:none!important}
}



/* ===== V2.9 ADDITIONAL APPRAISAL / PRIORITY BATTLE ===== */
.appraisal-scene,.battle-intro-scene{position:absolute;inset:0;overflow:hidden}
.appraisal-hud{position:absolute;z-index:30;top:max(28px,calc(env(safe-area-inset-top) + 18px));left:20px;right:20px;display:flex;justify-content:space-between;align-items:center;color:#fff;font-weight:1000;text-shadow:0 2px 5px rgba(0,0,0,.8)}
.appraisal-hud span{color:#ffd62f;font-size:14px;letter-spacing:.08em}.appraisal-hud b{font-size:14px}
.appraisal-enemy{position:absolute;z-index:8;right:3%;top:13%;width:min(43vw,180px);max-height:29dvh;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 10px 14px rgba(0,0,0,.32))}
.appraisal-mudagiri{position:absolute;z-index:10;left:4%;top:13%;width:min(39vw,164px);max-height:28dvh;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 10px 14px rgba(0,0,0,.3))}
.appraisal-mudagiri.is-small{width:min(32vw,136px);top:18%}
.appraisal-card,.battle-intro-card{position:absolute;z-index:25;left:18px;right:18px;bottom:max(24px,calc(env(safe-area-inset-bottom) + 16px));padding:20px 18px 18px;border:1.5px solid #f0c92f;border-radius:18px;background:rgba(5,20,34,.965);box-shadow:0 15px 34px rgba(0,0,0,.44)}
.appraisal-question-card{padding-top:17px}
.appraisal-kicker{color:#ffd42b;font-size:14px;font-weight:1000;letter-spacing:.08em}
.appraisal-card h2,.battle-intro-card h2{margin:8px 0 0;color:#fff;font-size:clamp(25px,7vw,31px);line-height:1.18;font-weight:1000;letter-spacing:-.035em}
.appraisal-card h3{margin:12px 0 0;color:#fff;font-size:clamp(23px,6.2vw,28px);line-height:1.32;font-weight:1000}
.appraisal-reason{margin:10px 0 0;padding:11px 12px;border-radius:11px;background:rgba(20,53,73,.78);color:rgba(255,255,255,.83);font-size:15px;font-weight:800;line-height:1.5}
.appraisal-reason strong{color:#fff}
.appraisal-money{margin-top:13px}
.appraisal-next{margin-top:14px;min-height:54px}.appraisal-next:disabled{opacity:.45;cursor:not-allowed}
.appraisal-amount-limit{margin:-4px 0 4px;color:#aeb8c2;font-size:11px;text-align:left}.appraisal-amount-limit.is-error{color:#ffb0a8;font-weight:900}
.appraisal-amount-input{display:flex;align-items:center;gap:8px;width:100%;padding:12px 14px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.28);box-sizing:border-box}.appraisal-amount-input span,.appraisal-amount-input b{white-space:nowrap}.appraisal-amount-input input{min-width:0;flex:1;font:inherit;font-size:20px;font-weight:800;padding:10px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.94);color:#171717;text-align:right}.appraisal-option:disabled{opacity:.45;pointer-events:none}
.appraisal-options{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}
.appraisal-option{min-height:82px;padding:13px 11px;border:1px solid rgba(255,214,47,.45);border-radius:11px;background:rgba(15,48,66,.92);color:#fff;text-align:left;cursor:pointer}
.appraisal-option strong{display:block;font-size:16px;font-weight:1000;line-height:1.25}.appraisal-option span{display:block;margin-top:4px;color:rgba(255,255,255,.66);font-size:12px;font-weight:800;line-height:1.3}
.appraisal-option:active{transform:translateY(1px);background:rgba(28,70,89,.98)}
.judgement-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
.judgement-grid div{display:flex;align-items:baseline;justify-content:space-between;padding:10px 11px;border-radius:10px;background:rgba(20,53,73,.78)}
.judgement-grid b{color:#ffd62f;font-size:22px;font-weight:1000}.judgement-grid span{color:#fff;font-size:11px;font-weight:900}
.battle-intro-card{top:50%;bottom:auto;transform:translateY(-37%)}
.battle-targets{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:14px}
.battle-targets div{position:relative;min-width:0;padding:8px 5px 9px;border:1px solid rgba(255,214,47,.42);border-radius:11px;background:rgba(20,53,73,.78);text-align:center}
.battle-targets img{width:100%;height:82px;object-fit:contain;image-rendering:pixelated}.battle-targets span{position:absolute;left:6px;top:6px;color:#ffd62f;font-size:9px;font-weight:1000}.battle-targets strong{display:block;overflow:hidden;color:#fff;font-size:10px;font-weight:1000;white-space:nowrap;text-overflow:ellipsis}
.battle-review-note,.result-next-lock{margin-top:12px;padding:10px 11px;border-radius:10px;background:rgba(20,53,73,.78);color:rgba(255,255,255,.78);font-size:11px;font-weight:900;line-height:1.45}
.money-calibrate-scene .appraisal-card{min-height:330px}
.money-calibrate-scene .appraisal-mudagiri{top:10%}
@media(max-height:720px){
  .appraisal-enemy{top:11%;width:min(36vw,150px);max-height:23dvh}
  .appraisal-mudagiri{top:11%;width:min(34vw,145px);max-height:23dvh}
  .appraisal-mudagiri.is-small{top:14%;width:min(28vw,120px)}
  .appraisal-card{bottom:max(10px,calc(env(safe-area-inset-bottom) + 7px));padding:14px 15px 13px}
  .appraisal-card h2,.battle-intro-card h2{font-size:23px}.appraisal-card h3{font-size:18px}
  .appraisal-reason{margin-top:7px;padding:8px 10px;font-size:12px}
  .appraisal-options{gap:6px;margin-top:9px}.appraisal-option{min-height:55px;padding:7px 8px}.appraisal-option strong{font-size:12px}.appraisal-option span{font-size:9px}
  .appraisal-next{min-height:46px;margin-top:9px}
  .battle-targets img{height:62px}
  .battle-intro-card{transform:translateY(-40%)}
}

.pre-income-input{grid-template-columns:auto 1fr auto}.pre-income-yen{color:#ffd62f;font-weight:1000}
.pre-next:disabled{opacity:.45;cursor:not-allowed}
.appraisal-feedback{margin-top:13px;min-height:142px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1.5px solid rgba(255,214,47,.5);border-radius:13px;background:rgba(12,39,56,.96);text-align:center;animation:appraisal-pop .18s ease-out}
.appraisal-feedback strong{font-size:25px;font-weight:1000;color:#ffd62f}.appraisal-feedback span{margin-top:7px;font-size:13px;font-weight:900;color:rgba(255,255,255,.8)}
.appraisal-feedback.is-review strong{color:#ffca3a}.appraisal-feedback.is-protect strong{color:#8ce6b0}.appraisal-feedback.is-safe strong{color:#8ed7ff}
@keyframes appraisal-pop{from{transform:scale(.96);opacity:.25}to{transform:scale(1);opacity:1}}
.judgement-grid{grid-template-columns:repeat(5,1fr)}
.judgement-grid div{display:block;text-align:center}.judgement-grid b,.judgement-grid span{display:block}.judgement-grid span{margin-top:2px;font-size:9px}
@media(max-width:380px){.judgement-grid{gap:4px}.judgement-grid div{padding:8px 4px}.judgement-grid b{font-size:19px}.judgement-grid span{font-size:8px}}

/* V2.9 reviewed mobile typography */
.pre-question,.appraisal-question{font-size:clamp(20px,5.6vw,24px);line-height:1.32;font-weight:1000}
.pre-helper,.appraisal-reason{font-size:clamp(13px,3.55vw,15px);line-height:1.55}
.pre-dialogue{font-size:clamp(14px,3.85vw,16px);line-height:1.5}
.pre-age-input input,.pre-income-input input{font-size:clamp(24px,7.2vw,31px);line-height:1.15;font-weight:1000}
.pre-income-input span{font-size:clamp(14px,3.8vw,16px)}
.appraisal-option strong{font-size:clamp(15px,4.15vw,17px);line-height:1.35}
.appraisal-option span{font-size:clamp(12px,3.3vw,14px);line-height:1.4}
.pre-primary,.pre-next,.appraisal-option{min-height:56px}
.pre-primary,.pre-next{font-size:clamp(16px,4.45vw,18px);font-weight:1000}
@media(max-height:700px){
  .pre-character{transform:scale(.93);transform-origin:bottom left}
  .pre-card{padding-top:12px;padding-bottom:10px}
  .pre-question{margin-top:3px}
  .pre-helper{margin-top:3px}
  .appraisal-enemy{transform:scale(.92);transform-origin:center bottom}
  .appraisal-card{padding-top:11px;padding-bottom:10px}
  .appraisal-options{gap:7px}
}
@media(min-width:421px) and (min-height:850px){
  .pre-question,.appraisal-question{font-size:24px}
  .pre-dialogue{font-size:16px}
}

/* FINAL AUDIT: never shrink primary tap targets below 56px */
.scan-start,.scan-next-search,.battle-next,.appraisal-next,.type-complete-cta,.appraisal-intro-cta{min-height:56px!important}
.scan-start,.scan-next-search,.battle-next{font-size:clamp(15px,4.1vw,17px)}
@media(max-height:700px){
  .scan-start,.scan-next-search,.battle-next,.appraisal-next,.type-complete-cta,.appraisal-intro-cta{min-height:56px!important}
}

/* ===== V3.0 REAL-DEVICE UI + ACTION FIX ===== */
.scan-panel{left:16px;right:16px;bottom:max(14px,calc(env(safe-area-inset-bottom) + 8px));min-height:0;padding:14px 15px 13px;border-radius:16px}
.scan-dialogue{width:73%;min-height:52px;margin:-2px 0 10px auto;padding:9px 11px;font-size:14px;line-height:1.35}
.scan-number{font-size:12px}.scan-panel h2{margin-top:5px;font-size:clamp(20px,5.4vw,23px);line-height:1.2}
.scan-panel p{margin-top:4px;font-size:12px;line-height:1.35}.scan-money{margin-top:10px;min-height:52px}.scan-money input{font-size:22px}
.scan-start{margin-top:9px;min-height:56px}.scan-zero-hint{margin-top:5px;font-size:10px}
.scan-mudagiri-input{left:1.5%;bottom:38.5%;width:min(30vw,128px)}

.type-quiz-guide{bottom:52%;height:112px}.type-quiz-mudagiri{width:min(27vw,112px);max-height:18dvh}
.type-quiz-dialogue{right:3%;bottom:13px;width:68%;min-height:48px;padding:8px 10px;font-size:13px;line-height:1.32}
.type-quiz-card{left:12px;right:12px;bottom:max(8px,calc(env(safe-area-inset-bottom) + 4px));padding:11px 12px 9px;border-radius:15px}
.type-quiz-number{font-size:11px}.type-quiz-card h2{margin-top:4px;font-size:clamp(18px,5vw,21px);line-height:1.17}
.type-pair{grid-template-columns:minmax(0,1fr) 34px minmax(0,1fr);gap:4px;margin-top:7px}.type-side{min-height:48px;padding:7px 7px 7px 34px;border-radius:9px}
.type-side-a{grid-column:1}.type-side-b{grid-column:3}.type-side-badge{left:6px;width:23px;height:23px;font-size:12px;border-radius:6px}.type-side strong{font-size:11.5px;line-height:1.22}
.type-pair-vs{position:static;grid-column:2;grid-row:1;align-self:center;min-width:0;padding:4px 3px;transform:none;font-size:9px}
.type-quiz-helper{margin-top:6px;font-size:10.5px;line-height:1.25}.type-quiz-helper strong{font-size:11px}
.type-scale{grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;padding:0;background:transparent}
.type-scale-option{min-height:52px;padding:6px 5px;border-radius:9px}.type-scale-option span{font-size:12px}.type-scale-option small{margin-top:2px;font-size:9px}
.type-quiz-foot{margin-top:4px;font-size:10px}

.appraisal-mudagiri{left:3%;top:auto;bottom:43%;width:min(30vw,126px);max-height:22dvh;object-position:left bottom}
.appraisal-mudagiri.is-small{left:4%;top:auto;bottom:43%;width:min(26vw,108px)}
.appraisal-enemy{right:4%;top:auto;bottom:43%;width:min(37vw,154px);max-height:24dvh;object-position:center bottom}
.appraisal-card{left:14px;right:14px;bottom:max(10px,calc(env(safe-area-inset-bottom) + 6px));padding:12px 13px 11px;border-radius:15px}
.appraisal-card h3{margin-top:6px;font-size:clamp(18px,4.9vw,21px);line-height:1.22}
.appraisal-reason{margin-top:6px;padding:7px 9px;font-size:11.5px!important;line-height:1.35!important}
.appraisal-options{gap:6px;margin-top:7px}.appraisal-option{min-height:56px!important;padding:7px 8px}
.appraisal-option strong{font-size:13px!important;line-height:1.2!important}.appraisal-option span{margin-top:2px;font-size:10px!important;line-height:1.22!important}
.appraisal-feedback{margin-top:7px;min-height:118px}.appraisal-feedback strong{font-size:21px}.appraisal-feedback span{font-size:11px}

.combo-battle-scene{position:absolute;inset:0;overflow:hidden}.combo-hud{position:absolute;z-index:35;top:max(28px,calc(env(safe-area-inset-top) + 18px));left:18px;right:18px;display:flex;justify-content:space-between;color:#fff;font-weight:1000;text-shadow:0 2px 5px #000}
.combo-hud span{color:#ffd62f;font-size:11px;letter-spacing:.12em}.combo-hud b{font-size:13px}
.combo-ground{position:absolute;z-index:3;left:8%;right:7%;bottom:34%;height:8%;border-radius:50%;background:radial-gradient(ellipse,rgba(10,28,17,.28),transparent 70%);filter:blur(4px)}
.combo-enemies{position:absolute;z-index:10;left:18%;right:3%;top:16%;height:43%}
.combo-enemy-slot{position:absolute;bottom:0;width:38%;height:72%;display:flex;align-items:flex-end;justify-content:center;transform-origin:50% 90%;transition:transform .16s ease,filter .16s ease}
.combo-enemy-slot img:first-child{width:100%;height:100%;object-fit:contain;object-position:center bottom;image-rendering:pixelated;filter:drop-shadow(0 10px 12px rgba(0,0,0,.3))}
.combo-enemy-slot strong{position:absolute;bottom:-20px;left:0;right:0;text-align:center;color:#fff;font-size:10px;font-weight:1000;text-shadow:0 2px 4px #000}
.combo-count-1 .slot-0{left:34%;width:48%;height:88%}.combo-count-2 .slot-0{left:8%;width:42%;height:80%}.combo-count-2 .slot-1{right:4%;width:42%;height:80%}
.combo-count-3 .slot-0{left:0;width:35%;height:68%}.combo-count-3 .slot-1{left:32%;width:40%;height:84%;z-index:2}.combo-count-3 .slot-2{right:-1%;width:35%;height:68%}
.combo-enemy-slot.is-hit{animation:combo-hit-shake .28s ease both;filter:brightness(1.45)}.combo-enemy-slot.is-defeated{transform:translateY(5px) scale(.97)}
.combo-slash,.combo-hit{position:absolute!important;z-index:20!important;left:50%!important;top:50%!important;width:185%!important;height:185%!important;object-fit:contain!important;transform:translate(-50%,-50%) rotate(-8deg)!important;filter:brightness(1.45) contrast(1.25) drop-shadow(0 0 14px rgba(255,245,170,.9))!important;opacity:1!important}
.combo-hit{width:125%!important;height:125%!important;mix-blend-mode:screen}
.combo-mudagiri{position:absolute;z-index:18;left:1%;bottom:34%;width:min(35vw,148px);max-height:27dvh;object-fit:contain;object-position:left bottom;image-rendering:pixelated;filter:drop-shadow(0 10px 13px rgba(0,0,0,.35))}
.combo-mudagiri{transition:transform .11s cubic-bezier(.2,.8,.2,1)}.combo-pose-ready .combo-mudagiri{transform:translate3d(0,0,0)}.combo-pose-swing .combo-mudagiri{transform:translate3d(34px,-7px,0) scale(1.035) rotate(-3deg)}.combo-pose-follow .combo-mudagiri{transform:translate3d(46px,1px,0) scale(1.01) rotate(1deg)}.combo-white-flash{position:absolute;z-index:40;inset:0;background:#fff;pointer-events:none;animation:combo-flash .16s ease-out 3;opacity:0}
.combo-panel{position:absolute;z-index:30;left:14px;right:14px;bottom:max(10px,calc(env(safe-area-inset-bottom) + 6px));padding:12px 13px 11px;border:1.5px solid #f0c92f;border-radius:15px;background:rgba(5,20,34,.965);box-shadow:0 15px 34px rgba(0,0,0,.44);text-align:center}
.combo-panel h2{margin:5px 0 0;font-size:clamp(21px,5.8vw,25px);line-height:1.18}.combo-panel p{margin:6px 0 0;font-size:11px;line-height:1.35;color:rgba(255,255,255,.76)}
.combo-attack{margin-top:9px;min-height:56px!important;font-size:16px;font-weight:1000}.combo-slash-label{margin-top:9px;min-height:56px;display:grid;place-items:center;color:#ffd62f;font-size:18px;font-weight:1000;letter-spacing:.12em}
@keyframes combo-dash{from{transform:translate3d(0,0,0) rotate(-2deg)}to{transform:translate3d(36px,-8px,0) rotate(-8deg)}}@keyframes combo-hit-shake{0%{transform:translateX(0)}25%{transform:translateX(10px) rotate(2deg)}55%{transform:translateX(-6px) rotate(-2deg)}100%{transform:translateX(5px)}}@keyframes combo-flash{0%,100%{opacity:0}35%{opacity:.32}}

@media(max-height:700px){
 .scan-panel{padding:11px 13px 10px}.scan-dialogue{width:75%;min-height:44px;margin-bottom:7px;padding:7px 9px;font-size:12.5px}.scan-mudagiri-input{width:min(27vw,112px);bottom:37%}
 .type-quiz-guide{bottom:54%;height:88px}.type-quiz-mudagiri{width:min(23vw,96px)}.type-quiz-dialogue{min-height:39px;bottom:8px;padding:6px 8px;font-size:11.5px}.type-quiz-card{padding:8px 9px 6px}.type-quiz-card h2{font-size:17px}.type-side{min-height:42px}.type-side strong{font-size:10.5px}.type-scale-option{min-height:48px}
 .appraisal-mudagiri{bottom:44%;width:min(26vw,108px)}.appraisal-mudagiri.is-small{bottom:44%;width:min(23vw,96px)}.appraisal-enemy{bottom:44%;width:min(32vw,132px);max-height:20dvh}.appraisal-card{padding:9px 10px 8px}.appraisal-card h3{font-size:17px}.appraisal-option{min-height:50px!important}
 .combo-enemies{top:14%;height:40%}.combo-mudagiri{bottom:35%;width:min(29vw,120px)}.combo-panel{padding:9px 10px 8px}.combo-panel h2{font-size:19px}
}
@media(prefers-reduced-motion:reduce){.combo-mudagiri.is-attacking,.combo-enemy-slot.is-hit,.combo-white-flash{animation:none!important}}

.mode-back{position:absolute;z-index:30;left:14px;top:max(16px,env(safe-area-inset-top));min-height:40px;padding:0 12px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(0,20,30,.72);color:#fff;font-weight:900}.mode-card{position:absolute;z-index:20;left:16px;right:16px;top:50%;transform:translateY(-48%);padding:20px 16px;border:1.5px solid #f1c92f;border-radius:18px;background:rgba(0,27,35,.965);box-shadow:0 18px 38px rgba(0,0,0,.42);text-align:center}.mode-card h2{margin:6px 0;font-size:clamp(24px,6.8vw,30px)}.mode-card>p{margin:0 0 14px;color:rgba(255,255,255,.72);font-size:12px}.mode-list{display:grid;gap:9px}.mode-option{position:relative;min-height:76px;padding:12px;border:1px solid rgba(255,214,47,.42);border-radius:12px;background:rgba(15,48,66,.94);color:#fff;text-align:left;transition:.16s}.mode-option>small{position:absolute;right:9px;top:7px;color:#ffd42b;font-size:9px}.mode-option strong{display:block;font-size:16px}.mode-option span{display:block;margin-top:5px;color:rgba(255,255,255,.7);font-size:11px}.mode-option.is-picked{transform:scale(1.02);border-color:#ffd42b}.mode-option.is-dim{opacity:.35}.mode-reaction{margin-top:12px;padding:10px;border-radius:9px;background:rgba(20,53,73,.78);font-size:12px;font-weight:900}

/* ===== MOBILE QA V1: real-device readability overrides ===== */
@media(max-height:760px){
  .type-quiz-card{left:14px;right:14px;padding:13px 13px 10px}
  .type-quiz-card h2{font-size:clamp(21px,5.8vw,25px)}
  .type-pair{grid-template-columns:minmax(0,1fr) 36px minmax(0,1fr);gap:5px;margin-top:10px}
  .type-side-a{grid-column:1}.type-side-b{grid-column:3}
  .type-side{min-height:68px;padding:9px 8px 9px 39px}
  .type-side-badge{left:7px;width:27px;height:27px;font-size:14px}
  .type-side strong{font-size:14px;line-height:1.28}
  .type-pair-vs{font-size:10px;min-width:36px;padding:4px 5px}
  .type-quiz-helper{margin-top:8px;font-size:12px}
  .type-quiz-helper strong{font-size:13px}
  .type-scale{gap:7px;margin-top:7px;padding:6px}
  .type-scale-option{min-height:58px;padding:7px 6px}
  .type-scale-option span{font-size:13px}
  .type-scale-option small{font-size:10px}
  .type-quiz-foot{font-size:11px}

  .appraisal-card{left:14px;right:14px;padding:16px 15px 14px}
  .appraisal-kicker{font-size:13px}
  .appraisal-card h3{font-size:clamp(21px,5.8vw,25px)}
  .appraisal-reason{font-size:14px;padding:9px 10px}
  .appraisal-options{gap:8px;margin-top:11px}
  .appraisal-option{min-height:70px!important;padding:9px 9px}
  .appraisal-option strong{font-size:14px!important;line-height:1.3}
  .appraisal-option span{font-size:11px!important;line-height:1.3}
}

`;

