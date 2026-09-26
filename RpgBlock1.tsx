import React, { useEffect, useMemo, useState } from 'react';
import type { ToneMode } from './tone-mode-v3';
import { ENEMY_ASSETS, type EnemyAssetCategory } from './enemy-assets-v1';

export type FamilyProfile = 'single' | 'couple' | 'children' | 'other';

type Props = {
  step: 'intro' | 'profile';
  toneMode: ToneMode;
  onBegin: (mode: ToneMode) => void;
  onFamilySelect: (profile: FamilyProfile) => void;
};

type Scene = 'opening' | 'profile' | 'complete' | 'scan' | 'scanComplete';

type ScanPhase = 'input' | 'trace' | 'reveal' | 'detected' | 'noSpend';

type ProfileFlow = {
  prefecture: string;
  age: string;
  household: FamilyProfile;
  workStyle: string;
  housingType: string;
};

type QuestionConfig = {
  no: 1 | 2 | 3 | 4 | 5;
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
  { category: 'daily', question: '毎月の日用品・雑費はいくら？', helper: '消耗品・雑貨など' },
  { category: 'fun', question: '毎月の娯楽費はいくら？', helper: '遊び・交際費など' },
  { category: 'beautyFashion', question: '毎月の美容・服飾費はいくら？', helper: '美容院・服・コスメなど' },
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
    dialogue: 'よし、冒険の準備を始めるぞ！',
    question: 'どこに住んでる？',
    helper: '地域ごとの家計データと比較',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q1.png`,
    footer: 'あと4問で冒険開始',
  },
  {
    no: 2,
    dialogue: 'よし、その調子！次いくぞ！',
    question: '年齢は？',
    helper: '年齢に近い家計データと比較',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q2.png`,
    footer: '冒険準備 40%',
  },
  {
    no: 3,
    dialogue: 'いいぞ！もう半分以上きた！',
    question: '誰と暮らしてる？',
    helper: '世帯人数に合わせて比較',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q3.png`,
    footer: 'CHECK POINT 60%',
  },
  {
    no: 4,
    dialogue: '……待て。ムダの気配がする。',
    question: '働き方は？',
    helper: '暮らし方に合わせて診断',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q4.png`,
    footer: '敵はすぐそこだ',
  },
  {
    no: 5,
    dialogue: 'いたぞ……！あと一つだ！',
    question: '今の住まいは？',
    helper: '住宅費の基準を調整',
    sprite: `${ASSET}/MUDAGIRI_PROFILE_Q5.png`,
    footer: '冒険者データ100%',
  },
];

const INITIAL_FLOW: ProfileFlow = {
  prefecture: '東京都',
  age: '30',
  household: 'single',
  workStyle: '会社員',
  housingType: '賃貸',
};

export default function RpgBlock1({
  step,
  toneMode,
  onBegin,
  onFamilySelect,
}: Props) {
  const [scene, setScene] = useState<Scene>(() => (step === 'profile' ? 'profile' : 'opening'));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [flow, setFlow] = useState<ProfileFlow>(INITIAL_FLOW);
  const [scanIndex, setScanIndex] = useState(0);
  const [scanValues, setScanValues] = useState<Partial<Record<EnemyAssetCategory, string>>>({});

  const question = QUESTIONS[questionIndex];
  const applicableScanCategories = useMemo(
    () => SCAN_CATEGORIES.filter((item) => item.category !== 'childEducation' || flow.household === 'children'),
    [flow.household],
  );
  const currentScan = applicableScanCategories[scanIndex];

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

  useEffect(() => {
    const preload = (src: string) => {
      const img = new Image();
      img.src = src;
    };

    preload(`${ASSET}/BG-001_OP_FIXED.png`);
    preload(`${ASSET}/BG-002_PROFILE_FIXED.png`);
    preload(`${ASSET}/MONSTER_HORDE_OP_MASTER.png`);
    QUESTIONS.forEach((item) => preload(item.sprite));
    [
      'BG-003_SCAN_BATTLE.png',
      'MUDAGIRI_BATTLE.png',
      'FX-01_REVEAL.png',
      'FX-02_SLASH.png',
      'FX-03_HIT.png',
      'FX-04_DEFEAT_PARTICLES.png',
      'FX-05_ESCAPE_DUST.png',
      'FX-06_UNKNOWN.png',
    ].forEach((name) => preload(`./assets/battle1/${name}`));
    preload(SCAN_MUDAGIRI_GUIDE);
    preload(SCAN_MUDAGIRI_RUN);
    preload(SCAN_MUDAGIRI_BATTLE);

    Object.values(ENEMY_ASSETS).forEach((enemy) => {
      preload(enemy.trace);
      preload(enemy.normal);
      preload(enemy.defeated);
      preload(enemy.escape);
    });
  }, []);

  const beginAdventure = () => {
    setQuestionIndex(0);
    setScene('profile');
    onBegin(toneMode);
  };

  const nextQuestion = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((value) => value + 1);
      return;
    }

    onFamilySelect(flow.household);
    setScene('complete');
  };

  const previousQuestion = () => {
    if (questionIndex === 0) return;
    setQuestionIndex((value) => value - 1);
  };

  return (
    <>
      <style>{CSS}</style>

      <main className="pre-root">
        <section className={`pre-stage pre-scene-${scene}`}>
          {scene === 'opening' ? (
            <OpeningScene onStart={beginAdventure} />
          ) : scene === 'profile' ? (
            <ProfileScene
              question={question}
              index={questionIndex}
              flow={flow}
              setFlow={setFlow}
              onNext={nextQuestion}
              onBack={previousQuestion}
            />
          ) : scene === 'complete' ? (
            <CompleteScene onStartScan={() => { setScanIndex(0); setScene('scan'); }} />
          ) : scene === 'scan' && currentScan ? (
            <ScanScene
              key={currentScan.category}
              config={currentScan}
              current={scanIndex + 1}
              total={applicableScanCategories.length}
              discoveredBefore={applicableScanCategories
                .slice(0, scanIndex)
                .filter((item) => Number(scanValues[item.category] ?? '0') > 0).length}
              value={scanValues[currentScan.category] ?? ''}
              onChange={(value) => setScanValues((prev) => ({ ...prev, [currentScan.category]: value }))}
              onDone={() => {
                if (scanIndex >= applicableScanCategories.length - 1) {
                  setScene('scanComplete');
                  return;
                }
                setScanIndex((index) => index + 1);
              }}
            />
          ) : (
            <ScanCompleteScene scanned={applicableScanCategories.length} />
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

function ProfileScene({
  question,
  index,
  flow,
  setFlow,
  onNext,
  onBack,
}: {
  question: QuestionConfig;
  index: number;
  flow: ProfileFlow;
  setFlow: React.Dispatch<React.SetStateAction<ProfileFlow>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const progress = (question.no / 5) * 100;
  const isWarning = question.no === 4;
  const isEncounter = question.no === 5;

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
          <b>{question.no} / 5</b>
        </div>
        <div className="pre-progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      {question.no === 3 && (
        <div className="pre-checkpoint" aria-hidden="true">
          CHECK POINT 60%
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

        <div className="pre-question-no">Q{question.no}</div>
        <h2>{question.question}</h2>
        <p className="pre-helper">{question.helper}</p>

        <ProfileInput
          no={question.no}
          flow={flow}
          setFlow={setFlow}
        />

        <button type="button" className="pre-primary pre-next pre-fixed-profile-cta" onClick={onNext}>
          {question.no === 5 ? 'ムダ討伐へ ▶' : '次へ ▶'}
        </button>

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
}: {
  no: 1 | 2 | 3 | 4 | 5;
  flow: ProfileFlow;
  setFlow: React.Dispatch<React.SetStateAction<ProfileFlow>>;
}) {
  const selectClass = 'pre-select';

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
    return (
      <label className="pre-input-wrap">
        <span className="pre-sr-only">世帯</span>
        <select
          className={selectClass}
          value={flow.household}
          onChange={(e) => setFlow((v) => ({ ...v, household: e.target.value as FamilyProfile }))}
        >
          {HOUSEHOLDS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
    );
  }

  if (no === 4) {
    return (
      <label className="pre-input-wrap">
        <span className="pre-sr-only">働き方</span>
        <select
          className={selectClass}
          value={flow.workStyle}
          onChange={(e) => setFlow((v) => ({ ...v, workStyle: e.target.value }))}
        >
          {WORK_STYLES.map((workStyle) => (
            <option key={workStyle} value={workStyle}>{workStyle}</option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="pre-input-wrap">
      <span className="pre-sr-only">住まい</span>
      <select
        className={selectClass}
        value={flow.housingType}
        onChange={(e) => setFlow((v) => ({ ...v, housingType: e.target.value }))}
      >
        {HOUSING_TYPES.map((housingType) => (
          <option key={housingType} value={housingType}>{housingType}</option>
        ))}
      </select>
    </label>
  );
}

function CompleteScene({ onStartScan }: { onStartScan: () => void }) {
  return (
    <div className="pre-profile pre-complete">
      <img
        className="pre-bg pre-bg-profile"
        src={`${ASSET}/BG-002_PROFILE_FIXED.png`}
        alt=""
        aria-hidden="true"
      />
      <div className="pre-profile-overlay pre-complete-overlay" aria-hidden="true" />

      <header className="pre-profile-hud">
        <div className="pre-profile-hud-row">
          <span>冒険準備</span>
          <b>5 / 5</b>
        </div>
        <div className="pre-progress-track" aria-hidden="true">
          <span style={{ width: '100%' }} />
        </div>
      </header>

      <img
        className="pre-profile-mudagiri pre-complete-mudagiri"
        src={`${ASSET}/MUDAGIRI_PROFILE_Q5.png`}
        alt="戦闘準備を整えたムダギリくん"
      />

      <section className="pre-panel pre-complete-panel">
        <div className="pre-complete-label">冒険者データ 100%</div>
        <h2 className="pre-complete-title">準備完了！<br />ムダの正体を暴くぞ！</h2>

        <button type="button" className="pre-primary pre-next pre-fixed-profile-cta" onClick={onStartScan}>
          家計スキャンを開始 ▶
        </button>
      </section>
    </div>
  );
}

const BATTLE_ASSET = './assets/battle1';
const SCAN_MUDAGIRI_GUIDE = `${ASSET}/MUDAGIRI_PROFILE_Q1.png`;
const SCAN_MUDAGIRI_RUN = `${ASSET}/MUDAGIRI_PROFILE_Q2.png`;
const SCAN_MUDAGIRI_BATTLE = `${BATTLE_ASSET}/MUDAGIRI_BATTLE.png`;

function ScanScene({
  config,
  current,
  total,
  discoveredBefore,
  value,
  onChange,
  onDone,
}: {
  config: ScanCategoryConfig;
  current: number;
  total: number;
  discoveredBefore: number;
  value: string;
  onChange: (value: string) => void;
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
  const canStart = value !== '';
  const amount = Number(digits || '0');

  const startScan = () => {
    if (!canStart) return;
    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    if (amount === 0) {
      setPhase('noSpend');
      timers.current.push(window.setTimeout(onDone, 1050));
      return;
    }

    setPhase('trace');

    // SCAN V2.2: 序盤は見せる、中盤は加速、終盤は少し溜める。
    // 同じ1.95秒を12回繰り返さず、探索のリズムに波を作る。
    const isOpeningScan = current <= 2;
    const isEndingScan = current >= Math.max(total - 1, 1);
    const revealAt = isOpeningScan ? 550 : isEndingScan ? 470 : 330;
    const detectedAt = isOpeningScan ? 1100 : isEndingScan ? 930 : 690;
    const doneAt = isOpeningScan ? 1950 : isEndingScan ? 1650 : 1250;

    timers.current.push(window.setTimeout(() => setPhase('reveal'), revealAt));
    timers.current.push(window.setTimeout(() => setPhase('detected'), detectedAt));
    timers.current.push(window.setTimeout(onDone, doneAt));
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
  const hudMode = isTrace ? '気配を追跡' : isReveal ? '反応あり' : isDetected ? '敵影発見' : isNoSpend ? '気配なし' : '探索中';
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

      {!isInput && !isNoSpend && (
        <>
          <div className="battle-contact" aria-hidden="true" />

          <div className="scan-enemy-stage" style={enemyStageStyle}>
            <img
              className={`scan-v21-enemy ${isTrace ? 'scan-v21-trace' : 'scan-v21-normal'}`}
              src={enemy.normal}
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
          <div className="scan-zero-hint">ない場合は 0 円でOK</div>
        </section>
      ) : (
        <section className="battle-panel scan-result-panel">
          <div className="battle-dialogue">
            {isTrace && '……気配を捕捉した。'}
            {isReveal && '来るぞ……！'}
            {isDetected && `${enemy.name}、発見！`}
            {isNoSpend && 'ここには敵の気配なし。次へ進むぞ！'}
          </div>
          <div className="battle-status">
            <span>{config.question.replace('毎月の', '').replace('はいくら？', '')}</span>
            <strong>¥{amount.toLocaleString('ja-JP')} / 月</strong>
          </div>
          {!isNoSpend && (
            <div className="battle-loading">
              <span className="battle-loading-dot" />
              <span>{isDetected ? '敵影を記録' : '探索中'}</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ScanCompleteScene({ scanned }: { scanned: number }) {
  return (
    <div className="scan-scene scan-complete-scene">
      <img className="battle-bg" src={`${BATTLE_ASSET}/BG-003_SCAN_BATTLE.png`} alt="" aria-hidden="true" />
      <div className="scan-complete-shade" aria-hidden="true" />
      <img className="scan-complete-mudagiri" src={SCAN_MUDAGIRI_BATTLE} alt="ムダギリくん" />
      <section className="scan-complete-card">
        <div className="scan-complete-kicker">ムダ探索 100%</div>
        <h2>対象カテゴリのスキャン完了</h2>
        <p>敵影を記録した。<br /><strong>だが――斬るべきヤツは、全部じゃない。</strong></p>
        <div className="scan-complete-count">{scanned}カテゴリを確認</div>
        <button
          type="button"
          className="pre-primary scan-complete-next"
          onClick={() => window.alert('次は既存の8タイプ診断 V3.1 へ接続します')}
        >
          属性診断へ ▶
        </button>
      </section>
    </div>
  );
}

const CSS = String.raw`
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
  bottom: 35.8%;
  width: min(41vw, 180px);
  max-height: 29dvh;
  object-fit: contain;
  object-position: left bottom;
  image-rendering: pixelated;
  filter: drop-shadow(0 9px 12px rgba(0,0,0,.34));
  pointer-events: none;
  transform-origin: 50% 100%;
}

.pre-q1 .pre-profile-mudagiri { width: min(39vw, 170px); left: 7px; bottom: 34.9%; }
.pre-q2 .pre-profile-mudagiri { width: min(40vw, 174px); left: 5px; bottom: 35.9%; transform: rotate(-2deg); }
.pre-q3 .pre-profile-mudagiri { width: min(40vw, 174px); left: 5px; bottom: 35.9%; }
.pre-q4 .pre-profile-mudagiri { width: min(42vw, 182px); left: 0; bottom: 36.0%; }
.pre-q5 .pre-profile-mudagiri { width: min(43vw, 186px); left: 4px; bottom: 36.2%; }

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
  min-height: 30px;
  padding: 3px 12px;
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
.battle-mudagiri{position:absolute;z-index:15;left:-2%;bottom:29.5%;width:43%;max-height:31dvh;object-fit:contain;object-position:left bottom;image-rendering:pixelated;filter:drop-shadow(0 10px 14px rgba(0,0,0,.3));pointer-events:none}
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
  .battle-trace,.battle-enemy{bottom:28.5%}
  .battle-mudagiri{bottom:27%;width:38%}
  .battle-panel{min-height:145px;padding-top:12px}
}

@media(prefers-reduced-motion:reduce){
  .battle-trace,.battle-enemy,.battle-mudagiri,.battle-fx,.battle-white-flash,.battle-loading-dot,.battle-phase-action.battle-defeat,.scan-mudagiri{animation:none!important;transition:none!important}
}

/* === PROFILE CTA TAP-ANCHOR PATCH 2026-09-25 === */
.pre-profile .pre-panel,
.pre-complete .pre-panel {
  --profile-cta-bottom: max(14px, calc(env(safe-area-inset-bottom) + 8px));
  padding-bottom: 82px !important;
}

.pre-profile .pre-fixed-profile-cta,
.pre-complete .pre-fixed-profile-cta {
  position: absolute !important;
  left: 16px !important;
  right: 16px !important;
  bottom: var(--profile-cta-bottom) !important;
  width: auto !important;
  min-height: 56px !important;
  margin: 0 !important;
}

.pre-profile .pre-input-wrap {
  margin-bottom: 0 !important;
}

@media (max-height: 720px) {
  .pre-profile .pre-panel,
  .pre-complete .pre-panel {
    padding-bottom: 76px !important;
  }

  .pre-profile .pre-fixed-profile-cta,
  .pre-complete .pre-fixed-profile-cta {
    min-height: 56px !important;
    bottom: max(10px, calc(env(safe-area-inset-bottom) + 6px)) !important;
  }
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

/* keep PROFILE primary actions on the approved thumb anchor */
.pre-profile .pre-fixed-profile-cta,
.pre-complete .pre-fixed-profile-cta {
  position:absolute!important;
  left:16px!important;
  right:16px!important;
  bottom:max(14px,calc(env(safe-area-inset-bottom) + 8px))!important;
  width:auto!important;
  min-height:56px!important;
  margin:0!important;
}

`;

