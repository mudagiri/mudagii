import React from 'react';
import type {JobCode} from './classifierV1';
import {jobCharacterAsset} from './job-character-assets-v1';
import {JOB_FREE_GUIDES} from './job-free-guide-v1';
import JobCharacterCard from './JobCharacterCard';
import './line-bonus-preview-v1.css';

type Props={jobCode:JobCode;onAddLine:()=>void;onSkip:()=>void};
export default function LineBonusPreviewV1({jobCode,onAddLine,onSkip}:Props){
 const asset=jobCharacterAsset(jobCode);const guide=JOB_FREE_GUIDES[jobCode];
 return <main className="mpp-line-bonus" style={{'--job-accent':asset.accent} as React.CSSProperties}><section>
  <div className="mpp-line-bonus-kicker">LINE LIMITED / QUEST REWARD</div><h1>CLASS専用<br/>お金の攻略ガイド</h1>
  <JobCharacterCard jobCode={jobCode} variant="compact"/>
  <div className="mpp-line-bonus-title"><small>あなたに届く特典</small><b>{guide.title}</b></div>
  <ul><li>あなたの「武器」と活かし方</li><li>ハマりやすい3つの罠</li><li>使う・貯める判断ルール</li><li>7日間ミニクエスト</li><li>結果をあとから見返せる保存導線</li></ul>
  <div className="mpp-line-bonus-sample"><span>攻略ガイドから一部公開</span><p><b>WEAPON</b>{guide.weapon}</p><p><b>7 DAYS QUEST</b>{guide.quest7}</p></div>
  <button className="mpp-primary" onClick={onAddLine}>無料で攻略ガイドを受け取る</button><button className="mpp-ghost" onClick={onSkip}>今は受け取らず家計診断へ</button>
  <p className="mpp-line-bonus-note">LINE追加後も、家計クエストはそのまま続けられます。</p>
 </section></main>;
}
