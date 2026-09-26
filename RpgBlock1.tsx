import React, { useEffect, useMemo, useState } from 'react';
import type { ToneMode } from './tone-mode-v3';
import { ENEMY_ASSETS } from './enemy-assets-v1';

export type FamilyProfile = 'single' | 'couple' | 'children' | 'other';

type Props = {
  step: 'intro' | 'profile';
  toneMode: ToneMode;
  onBegin: (mode: ToneMode) => void;
  onFamilySelect: (profile: FamilyProfile) => void;
};

type Scene = 'opening' | 'profile' | 'complete' | 'scan' | 'battle';

type BattleBranch = 'defeat' | 'spare' | 'unknown';

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
