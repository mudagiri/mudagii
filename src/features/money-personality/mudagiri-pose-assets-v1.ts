import type {MudagiriPoseId} from './mudagiri-personality-visual-v1';

export const MUDAGIRI_POSE_WEB_BASE='/assets/mudagiri/poses/v1/web_webp' as const;

const FILES:Record<MudagiriPoseId,string>={
  IDLE_01:'MUDAGIRI_POSE_01_IDLE_01.webp',IDLE_02:'MUDAGIRI_POSE_02_IDLE_02.webp',GUIDE:'MUDAGIRI_POSE_03_GUIDE.webp',EXPLAIN:'MUDAGIRI_POSE_04_EXPLAIN.webp',LISTEN:'MUDAGIRI_POSE_05_LISTEN.webp',THINK:'MUDAGIRI_POSE_06_THINK.webp',QUESTION:'MUDAGIRI_POSE_07_QUESTION.webp',SURPRISE:'MUDAGIRI_POSE_08_SURPRISE.webp',WORRY:'MUDAGIRI_POSE_09_WORRY.webp',HAPPY:'MUDAGIRI_POSE_10_HAPPY.webp',CELEBRATE:'MUDAGIRI_POSE_11_CELEBRATE.webp',PROUD:'MUDAGIRI_POSE_12_PROUD.webp',RELIEF:'MUDAGIRI_POSE_13_RELIEF.webp',RUN:'MUDAGIRI_POSE_14_RUN.webp',POINT_FORWARD:'MUDAGIRI_POSE_15_POINT_FORWARD.webp',READY:'MUDAGIRI_POSE_16_READY.webp',ATTACK:'MUDAGIRI_POSE_17_ATTACK.webp',WIN:'MUDAGIRI_POSE_18_WIN.webp',COMPLETE:'MUDAGIRI_POSE_19_COMPLETE.webp',CHECK:'MUDAGIRI_POSE_20_CHECK.webp',ANALYZE:'MUDAGIRI_POSE_21_ANALYZE.webp',UNLOCK:'MUDAGIRI_POSE_22_UNLOCK.webp',RESULT:'MUDAGIRI_POSE_23_RESULT.webp',SHARE:'MUDAGIRI_POSE_24_SHARE.webp',CTA:'MUDAGIRI_POSE_25_CTA.webp',
};

export const MUDAGIRI_POSE_ASSET=Object.fromEntries(Object.entries(FILES).map(([k,v])=>[k,`${MUDAGIRI_POSE_WEB_BASE}/${v}`])) as Record<MudagiriPoseId,string>;

/* Temporary visual-check fallback until the approved 25 WebP files are copied to public/. */
export const MUDAGIRI_POSE_FALLBACK:Record<MudagiriPoseId,string>={
  IDLE_01:'/assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png',
  IDLE_02:'/assets/prebattle/MUDAGIRI_PROFILE_Q1.png',
  GUIDE:'/assets/prebattle/MUDAGIRI_PROFILE_Q2.png',
  EXPLAIN:'/assets/prebattle/MUDAGIRI_PROFILE_Q2.png',
  LISTEN:'/assets/prebattle/MUDAGIRI_PROFILE_Q3.png',
  THINK:'/assets/prebattle/MUDAGIRI_PROFILE_Q3.png',
  QUESTION:'/assets/prebattle/MUDAGIRI_PROFILE_Q4.png',
  SURPRISE:'/assets/prebattle/MUDAGIRI_PROFILE_Q4.png',
  WORRY:'/assets/prebattle/MUDAGIRI_PROFILE_Q4.png',
  HAPPY:'/assets/prebattle/MUDAGIRI_PROFILE_Q1.png',
  CELEBRATE:'/assets/prebattle/MUDAGIRI_PROFILE_Q5.png',
  PROUD:'/assets/prebattle/MUDAGIRI_PROFILE_Q5.png',
  RELIEF:'/assets/prebattle/MUDAGIRI_PROFILE_Q1.png',
  RUN:'/assets/prebattle/MUDAGIRI_PROFILE_Q1.png',
  POINT_FORWARD:'/assets/prebattle/MUDAGIRI_PROFILE_Q2.png',
  READY:'/assets/battle1/MUDAGIRI_BATTLE_READY.png',
  ATTACK:'/assets/battle1/MUDAGIRI_BATTLE_SWING.png',
  WIN:'/assets/battle1/MUDAGIRI_BATTLE_FOLLOW.png',
  COMPLETE:'/assets/prebattle/MUDAGIRI_PROFILE_Q5.png',
  CHECK:'/assets/prebattle/MUDAGIRI_PROFILE_Q3.png',
  ANALYZE:'/assets/prebattle/MUDAGIRI_PROFILE_Q5.png',
  UNLOCK:'/assets/prebattle/MUDAGIRI_PROFILE_Q5.png',
  RESULT:'/assets/prebattle/MUDAGIRI_MASTER_CANONICAL_DO_NOT_OVERWRITE.png',
  SHARE:'/assets/prebattle/MUDAGIRI_PROFILE_Q1.png',
  CTA:'/assets/prebattle/MUDAGIRI_PROFILE_Q2.png',
};
