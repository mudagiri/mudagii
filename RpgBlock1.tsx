import React, { useEffect, useState } from 'react';
import { TONE_MODES, type ToneMode } from './tone-mode-v3';

export type FamilyProfile = 'single' | 'couple' | 'children' | 'other';

type Props = {
  step: 'intro' | 'profile';
  toneMode: ToneMode;
  onBegin: (mode: ToneMode) => void;
  onFamilySelect: (profile: FamilyProfile) => void;
};

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

export default function RpgBlock1({ step, toneMode, onBegin, onFamilySelect }: Props) {
  const [lineIndex, setLineIndex] = useState(0);
  const [selectedFamily, setSelectedFamily] = useState<FamilyProfile | null>(null);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (step === 'intro') setLineIndex(0);
  }, [step]);

  const advanceIntro = () => {
    if (step !== 'intro' || lineIndex >= INTRO_LINES.length - 1) return;
    setLineIndex((i) => Math.min(i + 1, INTRO_LINES.length - 1));
  };

  const chooseMode = (event: React.MouseEvent<HTMLButtonElement>, mode: ToneMode) => {
    event.stopPropagation();
    onBegin(mode);
  };

  const chooseFamily = (event: React.MouseEvent<HTMLButtonElement>, value: FamilyProfile) => {
    event.stopPropagation();
    setSelectedFamily(value);
    onFamilySelect(value);
  };

  const isModeScene = step === 'intro' && lineIndex === INTRO_LINES.length - 1;
  const activeFamily = selectedFamily;

  return (
    <>
      <style>{BLOCK1_CSS}</style>
      <main className="rpg1-root">
        <section
          className={`rpg1-stage ${step === 'profile' ? 'is-profile' : ''}`}
          onClick={step === 'intro' && !isModeScene ? advanceIntro : undefined}
          onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
            if (step === 'intro' && !isModeScene && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              advanceIntro();
            }
          }}
          role={step === 'intro' && !isModeScene ? 'button' : undefined}
          tabIndex={step === 'intro' && !isModeScene ? 0 : -1}
          aria-label={step === 'intro' && !isModeScene ? 'タップして会話を進める' : undefined}
        >
          <img
            className="rpg1-bg"
            src="./assets/page/hero-key-visual.png"
            alt=""
            aria-hidden="true"
          />
          <div className="rpg1-vignette" aria-hidden="true" />
          <div className="rpg1-grain" aria-hidden="true" />

          <header className="rpg1-hud" aria-label="クエスト情報">
            <div>
              <div className="rpg1-kicker">MUDAGIRI / MONEY QUEST</div>
              <div className="rpg1-hud-title">{step === 'intro' ? 'PROLOGUE' : 'STAGE 1 — 冒険者登録'}</div>
            </div>
            <div className="rpg1-hud-badge">{step === 'intro' ? '00' : '01'}</div>
          </header>

          <div className="rpg1-character-wrap" aria-hidden="true">
            <div className="rpg1-character-aura" />
            <img
              className="rpg1-character"
              src={step === 'profile' ? './assets/mascot/thinking.webp' : './assets/mascot/idle.webp'}
              alt=""
            />
          </div>

          {step === 'intro' ? (
            <IntroPanel
              lineIndex={lineIndex}
              isModeScene={isModeScene}
              toneMode={toneMode}
              onChooseMode={chooseMode}
            />
          ) : (
            <ProfilePanel activeFamily={activeFamily} selectedFamily={selectedFamily} onChooseFamily={chooseFamily} />
          )}
        </section>
      </main>
    </>
  );
}

function IntroPanel({
  lineIndex,
  isModeScene,
  toneMode,
  onChooseMode,
}: {
  lineIndex: number;
  isModeScene: boolean;
  toneMode: ToneMode;
  onChooseMode: (event: React.MouseEvent<HTMLButtonElement>, mode: ToneMode) => void;
}) {
  if (isModeScene) {
    return (
      <div className="rpg1-bottom rpg1-bottom--commands">
        <div className="rpg1-dialogue rpg1-dialogue--compact">
          <div className="rpg1-nameplate">ムダギリくん</div>
          <div className="rpg1-copy" aria-live="polite">{INTRO_LINES[lineIndex]}</div>
        </div>

        <div className="rpg1-command-window" aria-label="診断モードを選択">
          {(Object.entries(TONE_MODES) as [ToneMode, (typeof TONE_MODES)[ToneMode]][]).map(([key, mode]) => (
            <button
              key={key}
              type="button"
              className={`rpg1-command ${toneMode === key ? 'is-current' : ''}`}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => onChooseMode(event, key)}
            >
              <span className="rpg1-command-icon" aria-hidden="true">{mode.icon}</span>
              <span className="rpg1-command-text">
                <span className="rpg1-command-title">
                  {mode.name}
                  {'recommended' in mode && mode.recommended ? <em>おすすめ</em> : null}
                </span>
                <span className="rpg1-command-sub">{mode.tagline}</span>
              </span>
              <span className="rpg1-command-arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rpg1-bottom">
      <div className="rpg1-dialogue">
        <div className="rpg1-nameplate">ムダギリくん</div>
        <div className="rpg1-copy" aria-live="polite">{INTRO_LINES[lineIndex]}</div>
        <div className="rpg1-tap" aria-hidden="true"><span>▼</span> TAP</div>
      </div>
    </div>
  );
}

function ProfilePanel({
  activeFamily,
  selectedFamily,
  onChooseFamily,
}: {
  activeFamily: FamilyProfile | null;
  selectedFamily: FamilyProfile | null;
  onChooseFamily: (event: React.MouseEvent<HTMLButtonElement>, value: FamilyProfile) => void;
}) {
  return (
    <div className="rpg1-bottom rpg1-bottom--profile">
      <div className="rpg1-dialogue rpg1-dialogue--compact">
        <div className="rpg1-nameplate">ムダギリくん</div>
        <div className="rpg1-copy" aria-live="polite">
          {selectedFamily ? (
            <>よし。比較する世界線は決まった。<br /><strong>次の情報も順番に登録していくぞ。</strong></>
          ) : (
            <>まずは、お前の<strong>パーティ構成</strong>を教えろ。</>
          )}
        </div>
      </div>

      <div className="rpg1-command-window rpg1-family-grid" aria-label="世帯構成を選択">
        {FAMILY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`rpg1-command rpg1-family-command ${activeFamily === option.value ? 'is-current' : ''}`}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => onChooseFamily(event, option.value)}
            aria-pressed={activeFamily === option.value}
          >
            <span className="rpg1-family-mark" aria-hidden="true">{option.icon}</span>
            <span className="rpg1-command-text">
              <span className="rpg1-command-title">{option.title}</span>
              <span className="rpg1-command-sub">{option.sub}</span>
            </span>
            {activeFamily === option.value ? <span className="rpg1-check" aria-hidden="true">✓</span> : null}
          </button>
        ))}
      </div>

      <div className="rpg1-block-caption">
        PROFILE 01 / PARTY
      </div>
    </div>
  );
}

const BLOCK1_CSS = String.raw`
:root {
  color-scheme: dark;
}

.rpg1-root,
.rpg1-root * {
  box-sizing: border-box;
}

.rpg1-root {
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  overflow: hidden;
  background: #050505;
  color: #fff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif;
  overscroll-behavior: none;
}

.rpg1-stage {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100svh;
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
  isolation: isolate;
  background: #090909;
  touch-action: manipulation;
  outline: none;
}

.rpg1-bg,
.rpg1-vignette,
.rpg1-grain {
  position: absolute;
  inset: 0;
}

.rpg1-bg {
  z-index: -5;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  image-rendering: pixelated;
  transform: scale(1.015);
}

.rpg1-vignette {
  z-index: -4;
  background:
    linear-gradient(180deg, rgba(0,0,0,.66) 0%, rgba(0,0,0,.08) 24%, rgba(0,0,0,.04) 48%, rgba(0,0,0,.55) 72%, rgba(0,0,0,.96) 100%),
    radial-gradient(circle at 50% 40%, rgba(255,199,77,.06), transparent 38%),
    radial-gradient(circle at center, transparent 45%, rgba(0,0,0,.62) 100%);
  pointer-events: none;
}

.rpg1-grain {
  z-index: -3;
  opacity: .16;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(0deg, rgba(255,255,255,.022) 0 1px, transparent 1px 3px);
  mix-blend-mode: soft-light;
}

.rpg1-hud {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding:
    max(14px, env(safe-area-inset-top))
    max(16px, env(safe-area-inset-right))
    0
    max(16px, env(safe-area-inset-left));
  text-shadow: 0 2px 10px rgba(0,0,0,.9);
}

.rpg1-kicker {
  color: #e6c46a;
  font-size: 9px;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: .19em;
}

.rpg1-hud-title {
  margin-top: 5px;
  color: rgba(255,255,255,.9);
  font-size: 12px;
  line-height: 1.2;
  font-weight: 850;
  letter-spacing: .05em;
}

.rpg1-hud-badge {
  min-width: 35px;
  padding: 6px 7px;
  border: 1px solid rgba(230,196,106,.75);
  background: rgba(0,0,0,.58);
  color: #f0d27f;
  font-size: 11px;
  line-height: 1;
  font-weight: 950;
  text-align: center;
  letter-spacing: .08em;
  box-shadow: 0 5px 18px rgba(0,0,0,.26);
}

.rpg1-character-wrap {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: clamp(178px, 24dvh, 232px);
  width: min(67vw, 302px);
  aspect-ratio: 1 / 1;
  transform: translateX(-50%);
  pointer-events: none;
}

.rpg1-character-aura {
  position: absolute;
  left: 50%;
  bottom: 1%;
  width: 72%;
  height: 23%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(230,196,106,.22), rgba(230,196,106,0) 70%);
  filter: blur(12px);
}

.rpg1-character {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  image-rendering: pixelated;
  filter: drop-shadow(0 16px 22px rgba(0,0,0,.66));
  animation: rpg1-float 3.2s ease-in-out infinite;
}

.rpg1-bottom {
  position: absolute;
  z-index: 20;
  left: 0;
  right: 0;
  bottom: 0;
  padding:
    0
    max(12px, env(safe-area-inset-right))
    max(12px, calc(env(safe-area-inset-bottom) + 8px))
    max(12px, env(safe-area-inset-left));
}

.rpg1-dialogue,
.rpg1-command-window {
  width: 100%;
  border: 1px solid rgba(255,255,255,.83);
  background: linear-gradient(180deg, rgba(11,11,12,.96), rgba(2,2,3,.94));
  box-shadow:
    0 0 0 1px rgba(0,0,0,.95),
    0 0 0 3px rgba(230,196,106,.28),
    0 16px 40px rgba(0,0,0,.48);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.rpg1-dialogue {
  position: relative;
  min-height: 148px;
  padding: 29px 18px 25px;
}

.rpg1-dialogue--compact {
  min-height: 0;
  padding: 25px 16px 15px;
}

.rpg1-nameplate {
  position: absolute;
  top: -11px;
  left: 13px;
  padding: 5px 10px;
  border: 1px solid #e6c46a;
  background: #080808;
  color: #f1d37e;
  font-size: 10px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: .08em;
  box-shadow: 0 5px 14px rgba(0,0,0,.4);
}

.rpg1-copy {
  max-width: 34em;
  color: rgba(255,255,255,.96);
  font-size: clamp(14px, 4vw, 16px);
  line-height: 1.72;
  font-weight: 670;
  letter-spacing: .015em;
  text-shadow: 0 2px 8px rgba(0,0,0,.8);
}

.rpg1-copy strong {
  color: #fff0b8;
  font-weight: 900;
}

.rpg1-tap {
  position: absolute;
  right: 14px;
  bottom: 9px;
  color: rgba(255,255,255,.58);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .16em;
}

.rpg1-tap span {
  display: inline-block;
  margin-right: 5px;
  color: #e6c46a;
  animation: rpg1-tap 1s steps(2, end) infinite;
}

.rpg1-bottom--commands .rpg1-dialogue,
.rpg1-bottom--profile .rpg1-dialogue {
  margin-bottom: 9px;
}

.rpg1-command-window {
  overflow: hidden;
}

.rpg1-command {
  width: 100%;
  min-height: 61px;
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  border-bottom: 1px solid rgba(255,255,255,.13);
  background: rgba(7,7,8,.82);
  color: #fff;
  text-align: left;
  cursor: pointer;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background .14s ease, transform .14s ease, box-shadow .14s ease;
}

.rpg1-command:last-child {
  border-bottom: 0;
}

.rpg1-command:hover,
.rpg1-command:focus-visible {
  background: rgba(230,196,106,.12);
  outline: none;
  box-shadow: inset 3px 0 0 #e6c46a;
}

.rpg1-command:active {
  transform: translateX(2px);
}

.rpg1-command.is-current {
  background: linear-gradient(90deg, rgba(230,196,106,.18), rgba(230,196,106,.035));
  box-shadow: inset 3px 0 0 #e6c46a;
}

.rpg1-command-icon {
  width: 29px;
  flex: 0 0 29px;
  font-size: 20px;
  line-height: 1;
  text-align: center;
  filter: saturate(.82);
}

.rpg1-command-text {
  min-width: 0;
  flex: 1;
}

.rpg1-command-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 900;
}

.rpg1-command-title em {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 2px 6px;
  border: 1px solid rgba(230,196,106,.72);
  color: #e9ca74;
  font-size: 8px;
  font-style: normal;
  letter-spacing: .05em;
}

.rpg1-command-sub {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: rgba(255,255,255,.56);
  font-size: 10px;
  line-height: 1.3;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rpg1-command-arrow {
  flex: 0 0 auto;
  color: #e6c46a;
  font-family: Georgia, serif;
  font-size: 24px;
  line-height: 1;
}

.rpg1-bottom--profile {
  padding-bottom: max(10px, calc(env(safe-area-inset-bottom) + 6px));
}

.rpg1-family-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.rpg1-family-command {
  min-width: 0;
  min-height: 69px;
  border-right: 1px solid rgba(255,255,255,.13);
}

.rpg1-family-command:nth-child(2n) {
  border-right: 0;
}

.rpg1-family-command:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.rpg1-family-mark {
  width: 24px;
  flex: 0 0 24px;
  color: #d8bd71;
  font-size: 14px;
  text-align: center;
}

.rpg1-check {
  flex: 0 0 auto;
  color: #f1d37e;
  font-size: 14px;
  font-weight: 950;
}

.rpg1-block-caption {
  margin-top: 8px;
  color: rgba(255,255,255,.34);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: .13em;
  text-align: center;
}

.rpg1-stage.is-profile .rpg1-character-wrap {
  bottom: clamp(250px, 35dvh, 324px);
  width: min(58vw, 268px);
}

@keyframes rpg1-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes rpg1-tap {
  0%, 44% { transform: translateY(0); opacity: .55; }
  45%, 100% { transform: translateY(2px); opacity: 1; }
}

@media (min-width: 481px) {
  .rpg1-root {
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at center, #18160f 0, #070707 42%, #020202 100%);
  }

  .rpg1-stage {
    border-left: 1px solid rgba(255,255,255,.08);
    border-right: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 0 80px rgba(0,0,0,.8);
  }
}

@media (max-height: 720px) {
  .rpg1-character-wrap {
    bottom: 172px;
    width: min(55vw, 232px);
  }

  .rpg1-stage.is-profile .rpg1-character-wrap {
    bottom: 238px;
    width: min(48vw, 216px);
  }

  .rpg1-dialogue {
    min-height: 132px;
    padding: 26px 15px 22px;
  }

  .rpg1-dialogue--compact {
    min-height: 0;
    padding: 23px 14px 12px;
  }

  .rpg1-copy {
    font-size: 13px;
    line-height: 1.58;
  }

  .rpg1-command {
    min-height: 53px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .rpg1-family-command {
    min-height: 60px;
  }
}

@media (max-width: 374px) {
  .rpg1-bottom {
    padding-left: 9px;
    padding-right: 9px;
  }

  .rpg1-hud {
    padding-left: 12px;
    padding-right: 12px;
  }

  .rpg1-command {
    gap: 8px;
    padding-left: 9px;
    padding-right: 9px;
  }

  .rpg1-command-icon {
    width: 24px;
    flex-basis: 24px;
    font-size: 18px;
  }

  .rpg1-command-title {
    font-size: 12px;
  }

  .rpg1-command-sub {
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rpg1-character,
  .rpg1-tap span {
    animation: none;
  }

  .rpg1-command {
    transition: none;
  }
}
`;
