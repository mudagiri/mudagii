import React, { useEffect, useState } from 'react';
import { TONE_MODES, type ToneMode } from './tone-mode-v3';

export type FamilyProfile = 'single' | 'couple' | 'children' | 'other';

type Props = {
  step: 'intro' | 'profile';
  toneMode: ToneMode;
  onBegin: (mode: ToneMode) => void;
  onFamilySelect: (profile: FamilyProfile) => void;
};

type Scene = 'title' | 'dialogue' | 'mode' | 'profile' | 'profileDone';

const INTRO_LINES = [
  <>ようこそ。<br />ここは、お前の家計に潜むムダを斬る世界だ。</>,
  <>ただし安心しろ。<br />好きなものまで斬る気はない。<br /><strong>斬るのは、“満足してないのに払い続けてる金”だけだ。</strong></>,
  <>まず聞こう。<br /><strong>どこまで斬られる覚悟がある？</strong></>,
] as const;

const FAMILY_OPTIONS: { value: FamilyProfile; title: string; sub: string; icon: string }[] = [
  { value: 'single', title: 'ひとり暮らし', sub: '単身世帯', icon: '◆' },
  { value: 'couple', title: '夫婦・パートナー', sub: '2人世帯', icon: '◇' },
  { value: 'children', title: '子どもあり', sub: '子育て世帯', icon: '◈' },
  { value: 'other', title: 'その他', sub: 'その他の世帯', icon: '◉' },
];

export default function RpgBlock1({
  step,
  toneMode,
  onBegin,
  onFamilySelect,
}: Props) {
  const [scene, setScene] = useState<Scene>(() => step === 'profile' ? 'profile' : 'title');
  const [lineIndex, setLineIndex] = useState(0);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProfile | null>(null);

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
    if (step === 'profile' && (scene === 'title' || scene === 'dialogue' || scene === 'mode')) {
      setScene('profile');
    }
  }, [step, scene]);

  const startOpening = () => {
    setLineIndex(0);
    setScene('dialogue');
  };

  const advanceDialogue = () => {
    if (lineIndex < INTRO_LINES.length - 1) {
      setLineIndex((v) => v + 1);
      return;
    }
    setScene('mode');
  };

  const chooseMode = (mode: ToneMode) => {
    setScene('profile');
    onBegin(mode);
  };

  const chooseFamily = (value: FamilyProfile) => {
    setSelectedFamily(value);
    onFamilySelect(value);
    setScene('profileDone');
  };

  return (
    <>
      <style>{CSS}</style>

      <main className="mgo-root">
        <section className={`mgo-stage mgo-scene-${scene}`}>
          <img
            className="mgo-world"
            src="./assets/page/opening-world-v2.png"
            alt=""
            aria-hidden="true"
          />

          <div className="mgo-light" aria-hidden="true" />
          <div className="mgo-vignette" aria-hidden="true" />

          {scene === 'title' ? (
            <TitleScene onStart={startOpening} />
          ) : (
            <>
              <GameHud profile={scene === 'profile' || scene === 'profileDone'} />

              {scene === 'dialogue' && (
                <>
                  <MascotSpeaker />
                  <DialogueScene
                    lineIndex={lineIndex}
                    onAdvance={advanceDialogue}
                  />
                </>
              )}

              {scene === 'mode' && (
                <ModeScene toneMode={toneMode} onChoose={chooseMode} />
              )}

              {scene === 'profile' && (
                <ProfileScene onChoose={chooseFamily} />
              )}

              {scene === 'profileDone' && selectedFamily && (
                <ProfileDoneScene selected={selectedFamily} />
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

function TitleScene({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      className="mgo-title-hit"
      onClick={onStart}
      aria-label="ムダギリ診断を開始"
    >
      <div className="mgo-title-area">
        <div className="mgo-title-kicker">2 MIN MONEY QUEST</div>
        <h1 className="mgo-logo">
          <span>ムダギリ</span>
          <strong>診断</strong>
        </h1>
        <p className="mgo-title-copy">
          好きなものは斬らない。<br />
          <b>ムダだけ、斬る。</b>
        </p>
      </div>

      <div className="mgo-start">
        <span className="mgo-start-arrow">▶</span>
        TAP TO START
      </div>

      <div className="mgo-title-foot">
        登録不要 / 約2分 / 12項目スキャン
      </div>
    </button>
  );
}

function GameHud({ profile }: { profile: boolean }) {
  return (
    <header className="mgo-hud">
      <div>
        <div className="mgo-hud-brand">MUDAGIRI / MONEY QUEST</div>
        <div className="mgo-hud-stage">
          {profile ? 'STAGE 1 — 冒険者登録' : 'PROLOGUE'}
        </div>
      </div>
      <div className="mgo-hud-no">{profile ? '01' : '00'}</div>
    </header>
  );
}

function MascotSpeaker() {
  return (
    <div className="mgo-speaker" aria-hidden="true">
      <div className="mgo-speaker-glow" />
      <img
        className="mgo-speaker-img"
        src="./assets/mascot/idle.webp"
        alt=""
      />
    </div>
  );
}

function DialogueScene({
  lineIndex,
  onAdvance,
}: {
  lineIndex: number;
  onAdvance: () => void;
}) {
  return (
    <button
      type="button"
      className="mgo-full-hit"
      onClick={onAdvance}
      aria-label="会話を進める"
    >
      <div className="mgo-bottom">
        <DialogueWindow>
          <div className="mgo-copy">{INTRO_LINES[lineIndex]}</div>
          <div className="mgo-tap"><span>▼</span> TAP</div>
        </DialogueWindow>
      </div>
    </button>
  );
}

function ModeScene({
  toneMode,
  onChoose,
}: {
  toneMode: ToneMode;
  onChoose: (mode: ToneMode) => void;
}) {
  return (
    <div className="mgo-bottom mgo-bottom-mode">
      <DialogueWindow compact>
        <div className="mgo-copy">
          まず聞こう。<br />
          <strong>どこまで斬られる覚悟がある？</strong>
        </div>
      </DialogueWindow>

      <div className="mgo-command-box" aria-label="診断モードを選択">
        {(Object.entries(TONE_MODES) as [ToneMode, (typeof TONE_MODES)[ToneMode]][]).map(([key, mode]) => (
          <button
            type="button"
            key={key}
            className={`mgo-command ${toneMode === key ? 'is-default' : ''}`}
            onClick={() => onChoose(key)}
          >
            <span className="mgo-command-icon">{mode.icon}</span>
            <span className="mgo-command-main">
              <span className="mgo-command-title">
                {mode.name}
                {'recommended' in mode && mode.recommended ? <em>おすすめ</em> : null}
              </span>
              <span className="mgo-command-sub">{mode.tagline}</span>
            </span>
            <span className="mgo-command-arrow">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileScene({
  onChoose,
}: {
  onChoose: (profile: FamilyProfile) => void;
}) {
  return (
    <div className="mgo-bottom mgo-bottom-profile">
      <DialogueWindow compact>
        <div className="mgo-copy">
          冒険者登録を始める。<br />
          まずは、お前の<strong>パーティ構成</strong>を教えろ。
        </div>
      </DialogueWindow>

      <div className="mgo-family-grid">
        {FAMILY_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.value}
            className="mgo-family"
            onClick={() => onChoose(option.value)}
          >
            <span className="mgo-family-icon">{option.icon}</span>
            <span>
              <b>{option.title}</b>
              <small>{option.sub}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="mgo-progress-label">PROFILE 01 / PARTY</div>
    </div>
  );
}

function ProfileDoneScene({
  selected,
}: {
  selected: FamilyProfile;
}) {
  const item = FAMILY_OPTIONS.find((x) => x.value === selected)!;

  return (
    <div className="mgo-bottom mgo-bottom-done">
      <DialogueWindow>
        <div className="mgo-clear">PROFILE 01 CLEAR</div>
        <div className="mgo-copy">
          <strong>{item.title}</strong>だな。了解した。<br />
          比較する世界線は決まった。
        </div>
        <div className="mgo-next-tease">
          次は、住んでいる地域を登録する。
        </div>
      </DialogueWindow>
      <div className="mgo-progress-label">TO BE CONTINUED — PROFILE 02</div>
    </div>
  );
}

function DialogueWindow({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`mgo-dialogue ${compact ? 'is-compact' : ''}`}>
      <div className="mgo-name">ムダギリくん</div>
      {children}
    </div>
  );
}

const CSS = String.raw`
:root {
  color-scheme: dark;
}

.mgo-root,
.mgo-root * {
  box-sizing: border-box;
}

.mgo-root {
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  overflow: hidden;
  background: #050505;
  color: #fff;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif;
}

.mgo-stage {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
  isolation: isolate;
  background: #0b84d8;
  touch-action: manipulation;
}

.mgo-world {
  position: absolute;
  z-index: -5;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 53%;
  image-rendering: pixelated;
  transform: scale(1.01);
}

.mgo-light,
.mgo-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.mgo-light {
  z-index: -4;
  background:
    linear-gradient(180deg, rgba(0,52,95,.08), rgba(0,0,0,0) 42%, rgba(0,0,0,.2) 70%, rgba(0,0,0,.62) 100%);
}

.mgo-vignette {
  z-index: -3;
  box-shadow: inset 0 0 80px rgba(0,0,0,.32);
}

.mgo-title-hit,
.mgo-full-hit {
  position: absolute;
  z-index: 10;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: inherit;
  appearance: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.mgo-title-hit::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(1,27,49,.30) 0%, rgba(0,0,0,0) 40%),
    linear-gradient(0deg, rgba(0,0,0,.56) 0%, rgba(0,0,0,0) 34%);
}

.mgo-title-area {
  position: absolute;
  z-index: 2;
  top: max(7dvh, calc(env(safe-area-inset-top) + 18px));
  left: 20px;
  right: 20px;
  text-align: center;
  text-shadow:
    0 3px 0 rgba(0,0,0,.85),
    0 7px 18px rgba(0,0,0,.5);
}

.mgo-logo {
  margin: 10px 0 0;
  color: #fff;
  font-size: clamp(39px, 12vw, 57px);
  line-height: .95;
  font-weight: 1000;
  letter-spacing: -.055em;
}

.mgo-logo span,
.mgo-logo strong {
  display: inline;
}

.mgo-logo strong {
  margin-left: .07em;
  color: #ffd438;
  font-weight: 1000;
}

.mgo-title-kicker {
  color: #ffe29a;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: .22em;
}

.mgo-title-copy {
  margin: 14px auto 0;
  color: rgba(255,255,255,.94);
  font-size: 14px;
  line-height: 1.55;
  font-weight: 800;
}

.mgo-title-copy b {
  color: #fff1a9;
  font-size: 17px;
}

.mgo-start {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: max(74px, calc(env(safe-area-inset-bottom) + 64px));
  transform: translateX(-50%);
  min-width: 190px;
  padding: 13px 18px;
  border: 1px solid rgba(255,235,159,.95);
  background: rgba(6,14,20,.82);
  box-shadow:
    0 0 0 3px rgba(0,0,0,.36),
    0 12px 34px rgba(0,0,0,.35);
  color: #fff7d1;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: .13em;
  text-align: center;
  animation: mgo-start-pulse 1.25s steps(2, end) infinite;
}

.mgo-start-arrow {
  margin-right: 9px;
  color: #ffd65a;
}

.mgo-title-foot {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: max(27px, calc(env(safe-area-inset-bottom) + 15px));
  color: rgba(255,255,255,.72);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .06em;
  text-align: center;
  text-shadow: 0 2px 5px #000;
}

.mgo-hud {
  position: absolute;
  z-index: 25;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding:
    max(15px, calc(env(safe-area-inset-top) + 8px))
    16px
    0;
  text-shadow: 0 2px 8px rgba(0,0,0,.95);
  pointer-events: none;
}

.mgo-hud-brand {
  color: #ffe08a;
  font-size: 9px;
  font-weight: 950;
  letter-spacing: .18em;
}

.mgo-hud-stage {
  margin-top: 5px;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .025em;
}

.mgo-hud-no {
  min-width: 36px;
  padding: 6px 7px;
  border: 1px solid rgba(255,220,111,.86);
  background: rgba(4,13,17,.58);
  color: #ffe37d;
  font-size: 11px;
  font-weight: 950;
  text-align: center;
}

.mgo-speaker {
  position: absolute;
  z-index: 18;
  left: 50%;
  bottom: 182px;
  width: min(58vw, 244px);
  transform: translateX(-50%);
  pointer-events: none;
}

.mgo-speaker-glow {
  position: absolute;
  left: 50%;
  bottom: 18px;
  width: 68%;
  height: 32px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255,220,95,.30) 0%, rgba(255,220,95,0) 72%);
  filter: blur(8px);
}

.mgo-speaker-img {
  position: relative;
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.45));
}

.mgo-bottom {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  bottom: 0;
  padding:
    0
    max(12px, env(safe-area-inset-right))
    max(13px, calc(env(safe-area-inset-bottom) + 8px))
    max(12px, env(safe-area-inset-left));
}

.mgo-dialogue,
.mgo-command-box,
.mgo-family-grid {
  border: 1px solid rgba(255,255,255,.92);
  background:
    linear-gradient(180deg, rgba(7,11,14,.96), rgba(2,4,5,.95));
  box-shadow:
    0 0 0 1px #000,
    0 0 0 3px rgba(221,181,78,.32),
    0 18px 42px rgba(0,0,0,.48);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mgo-dialogue {
  position: relative;
  min-height: 148px;
  padding: 30px 18px 24px;
}

.mgo-dialogue.is-compact {
  min-height: 0;
  padding: 26px 16px 15px;
}

.mgo-name {
  position: absolute;
  top: -12px;
  left: 16px;
  padding: 5px 10px;
  border: 1px solid #e8c459;
  background: #080b0d;
  color: #ffe79b;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: .05em;
}

.mgo-copy {
  color: #fff;
  font-size: clamp(14px, 4vw, 16px);
  line-height: 1.72;
  font-weight: 720;
  text-shadow: 0 2px 7px rgba(0,0,0,.9);
}

.mgo-copy strong {
  color: #ffe998;
  font-weight: 950;
}

.mgo-tap {
  position: absolute;
  right: 14px;
  bottom: 9px;
  color: rgba(255,255,255,.7);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .16em;
}

.mgo-tap span {
  margin-right: 5px;
  color: #eacb66;
  animation: mgo-tap 1s steps(2, end) infinite;
}

.mgo-bottom-mode .mgo-dialogue,
.mgo-bottom-profile .mgo-dialogue {
  margin-bottom: 9px;
}

.mgo-command-box {
  overflow: hidden;
}

.mgo-command {
  width: 100%;
  min-height: 61px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border: 0;
  border-bottom: 1px solid rgba(255,255,255,.12);
  background: rgba(4,8,10,.82);
  color: #fff;
  text-align: left;
  appearance: none;
}

.mgo-command:last-child {
  border-bottom: 0;
}

.mgo-command.is-default {
  background:
    linear-gradient(90deg, rgba(229,190,80,.16), rgba(229,190,80,.03));
  box-shadow: inset 3px 0 0 #e9c659;
}

.mgo-command:active {
  background: rgba(229,190,80,.18);
  transform: translateX(2px);
}

.mgo-command-icon {
  width: 29px;
  flex: 0 0 29px;
  font-size: 20px;
  text-align: center;
}

.mgo-command-main {
  min-width: 0;
  flex: 1;
}

.mgo-command-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 950;
}

.mgo-command-title em {
  padding: 2px 6px;
  border: 1px solid rgba(237,202,99,.72);
  color: #f3d77d;
  font-size: 8px;
  font-style: normal;
}

.mgo-command-sub {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: rgba(255,255,255,.62);
  font-size: 10px;
  font-weight: 680;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mgo-command-arrow {
  color: #e9c65c;
  font-family: Georgia, serif;
  font-size: 24px;
}

.mgo-family-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
}

.mgo-family {
  min-height: 74px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 0;
  border-right: 1px solid rgba(255,255,255,.12);
  border-bottom: 1px solid rgba(255,255,255,.12);
  background: rgba(4,8,10,.84);
  color: #fff;
  text-align: left;
}

.mgo-family:nth-child(2n) {
  border-right: 0;
}

.mgo-family:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.mgo-family:active {
  background: rgba(229,190,80,.18);
}

.mgo-family-icon {
  width: 25px;
  flex: 0 0 25px;
  color: #e6c965;
  font-size: 15px;
  text-align: center;
}

.mgo-family b {
  display: block;
  font-size: 12px;
  line-height: 1.2;
}

.mgo-family small {
  display: block;
  margin-top: 4px;
  color: rgba(255,255,255,.55);
  font-size: 9px;
}

.mgo-progress-label {
  margin-top: 8px;
  color: rgba(255,255,255,.55);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .14em;
  text-align: center;
  text-shadow: 0 2px 5px #000;
}

.mgo-clear {
  display: inline-block;
  margin-bottom: 10px;
  padding: 4px 7px;
  border: 1px solid rgba(255,223,120,.72);
  color: #ffe17b;
  font-size: 9px;
  font-weight: 950;
  letter-spacing: .12em;
}

.mgo-next-tease {
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid rgba(255,255,255,.11);
  color: rgba(255,255,255,.72);
  font-size: 11px;
  font-weight: 750;
}

.mgo-scene-profileDone .mgo-world {
  filter: brightness(.88) saturate(.9);
}

@keyframes mgo-tap {
  0%, 44% { transform: translateY(0); opacity: .65; }
  45%, 100% { transform: translateY(2px); opacity: 1; }
}

@keyframes mgo-start-pulse {
  0%, 48% { opacity: .86; }
  49%, 100% { opacity: 1; }
}

@media (max-height: 720px) {
  .mgo-title-area {
    top: max(5dvh, calc(env(safe-area-inset-top) + 8px));
  }

  .mgo-logo {
    font-size: clamp(34px, 10vw, 46px);
  }

  .mgo-title-copy {
    margin-top: 9px;
    font-size: 12px;
  }

  .mgo-title-copy b {
    font-size: 14px;
  }

  .mgo-speaker {
    bottom: 166px;
    width: min(48vw, 196px);
  }

  .mgo-dialogue {
    min-height: 129px;
    padding: 27px 15px 21px;
  }

  .mgo-dialogue.is-compact {
    min-height: 0;
    padding: 23px 14px 12px;
  }

  .mgo-copy {
    font-size: 13px;
    line-height: 1.58;
  }

  .mgo-command {
    min-height: 53px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .mgo-family {
    min-height: 62px;
  }
}

@media (max-width: 374px) {
  .mgo-bottom {
    padding-left: 9px;
    padding-right: 9px;
  }

  .mgo-logo {
    font-size: 38px;
  }

  .mgo-speaker {
    bottom: 164px;
    width: min(50vw, 180px);
  }

  .mgo-command {
    gap: 8px;
    padding-left: 9px;
    padding-right: 9px;
  }

  .mgo-command-title {
    font-size: 12px;
  }

  .mgo-command-sub {
    font-size: 9px;
  }

  .mgo-family {
    padding-left: 8px;
    padding-right: 8px;
  }

  .mgo-family b {
    font-size: 11px;
  }
}

@media (min-width: 481px) {
  .mgo-root {
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at center, #123346 0%, #071014 48%, #020303 100%);
  }

  .mgo-stage {
    border-left: 1px solid rgba(255,255,255,.08);
    border-right: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 0 80px rgba(0,0,0,.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mgo-start,
  .mgo-tap span {
    animation: none;
  }
}
`;
