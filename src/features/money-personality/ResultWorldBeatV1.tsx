import React from 'react';
import MoneyPersonalityMudagiri from './MoneyPersonalityMudagiri';
import {PERSONALITY_SCENE_VISUALS} from './mudagiri-personality-visual-v1';
import './result-world-beats-v1.css';

type Beat='complete'|'compare'|'next';

const COPY={
  complete:{
    kicker:'QUEST COMPLETE',
    line:'お前のお金タイプ、見つけたぞ。',
    sub:'まずはカードを見てみよう。',
    visual:PERSONALITY_SCENE_VISUALS.resultHero,
  },
  compare:{
    kicker:'TYPE COMPARE',
    line:'自分が分かると、次は「誰と似てるか」が気になってくる。',
    sub:'お金の感覚が近いタイプを見てみよう。',
    visual:PERSONALITY_SCENE_VISUALS.resultDialogue,
  },
  next:{
    kicker:'NEXT QUEST',
    line:'性格は見えた。次は、実際の家計だ。',
    sub:'ここから第2章へ。',
    visual:PERSONALITY_SCENE_VISUALS.householdCta,
  },
} as const;

export default function ResultWorldBeat({beat}:{beat:Beat}){
  const x=COPY[beat];
  return <section className={"mpp17-world-beat is-"+beat} aria-label={x.kicker}>
    <div className="mpp17-world-kicker">{x.kicker}</div>
    <div className="mpp17-world-row">
      <MoneyPersonalityMudagiri visual={x.visual} alt="ムダギリくん"/>
      <div className="mpp17-world-copy">
        <small>ムダギリくん</small>
        <b>{x.line}</b>
        <span>{x.sub}</span>
      </div>
    </div>
  </section>;
}
