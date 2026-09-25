import React, { useEffect, useMemo, useState } from 'react';
import type { ToneMode } from './tone-mode-v3';

export type FamilyProfile = 'single' | 'couple' | 'children' | 'other';

type Props = {
  step: 'intro' | 'profile';
  toneMode: ToneMode;
  onBegin: (mode: ToneMode) => void;
  onFamilySelect: (profile: FamilyProfile) => void;
};

type Scene = 'opening' | 'profile' | 'complete' | 'scanPlaceholder';

type ProfileFlow = {
  prefecture: string;
  ageBand: string;
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

const ASSET = './assets/prebattle';

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県',
  '埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県',
  '佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
];

const AGE_BANDS = ['20代', '30代', '40代', '50代', '60代以上', '19歳以下'];

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
    question: '年代は？',
    helper: '同世代の家計と比較',
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
  ageBand: '30代',
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

  const question = QUESTIONS[questionIndex];

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
            <CompleteScene onStartScan={() => setScene('scanPlaceholder')} />
          ) : (
            <ScanPlaceholder />
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

        <button type="button" className="pre-primary pre-next" onClick={onNext}>
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
      <label className="pre-input-wrap">
        <span className="pre-sr-only">年代</span>
        <select
          className={selectClass}
          value={flow.ageBand}
          onChange={(e) => setFlow((v) => ({ ...v, ageBand: e.target.value }))}
        >
          {AGE_BANDS.map((ageBand) => (
            <option key={ageBand} value={ageBand}>{ageBand}</option>
          ))}
        </select>
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

        <button type="button" className="pre-primary pre-next" onClick={onStartScan}>
          家計スキャンを開始 ▶
        </button>
      </section>
    </div>
  );
}

function ScanPlaceholder() {
  return (
    <div className="pre-profile pre-placeholder">
      <img
        className="pre-bg pre-bg-profile"
        src={`${ASSET}/BG-002_PROFILE_FIXED.png`}
        alt=""
        aria-hidden="true"
      />
      <div className="pre-placeholder-shade" aria-hidden="true" />

      <section className="pre-placeholder-card">
        <div className="pre-placeholder-kicker">NEXT QUEST</div>
        <h2>家計スキャン</h2>
        <p>ここから先は次の実装フェーズ。</p>
        <small>12カテゴリSCAN / BATTLE はまだ開始しません。</small>
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

.pre-next {
  min-height: 50px;
  margin-top: 12px;
  border-radius: 10px;
  font-size: 14px;
}

.pre-back {
  display: block;
  margin: 9px auto -3px;
  min-height: 32px;
  padding: 3px 10px;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,.55);
  font: inherit;
  font-size: 10px;
  font-weight: 800;
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
    margin-top: 5px;
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
`;

