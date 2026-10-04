import type {MudagiriPoseId} from './mudagiri-personality-visual-v1';

const VITE_BASE=((import.meta as any).env?.BASE_URL as string|undefined)||'./';
const NORMALIZED_BASE=VITE_BASE.endsWith('/')?VITE_BASE:`${VITE_BASE}/`;
const MUDAGIRI_ASSET_BASE=`${NORMALIZED_BASE}assets/mudagiri` as const;
export const MUDAGIRI_POSE_WEB_BASE=`${MUDAGIRI_ASSET_BASE}/poses/v1` as const;

const FILES:Record<MudagiriPoseId,string>={
  IDLE_01:'MUDAGIRI_POSE_01_IDLE_01.webp',
  IDLE_02:'MUDAGIRI_POSE_02_IDLE_02.webp',
  GUIDE:'MUDAGIRI_POSE_03_GUIDE.webp',
  EXPLAIN:'MUDAGIRI_POSE_04_EXPLAIN.webp',
  LISTEN:'MUDAGIRI_POSE_05_LISTEN.webp',
  THINK:'MUDAGIRI_POSE_06_THINK.webp',
  QUESTION:'MUDAGIRI_POSE_07_QUESTION.webp',
  SURPRISE:'MUDAGIRI_POSE_08_SURPRISE.webp',
  WORRY:'MUDAGIRI_POSE_09_WORRY.webp',
  HAPPY:'MUDAGIRI_POSE_10_HAPPY.webp',
  CELEBRATE:'MUDAGIRI_POSE_11_CELEBRATE.webp',
  PROUD:'MUDAGIRI_POSE_12_PROUD.webp',
  RELIEF:'MUDAGIRI_POSE_13_RELIEF.webp',
  RUN:'MUDAGIRI_POSE_14_RUN.webp',
  POINT_FORWARD:'MUDAGIRI_POSE_15_POINT_FORWARD.webp',
  READY:'MUDAGIRI_POSE_16_READY.webp',
  ATTACK:'MUDAGIRI_POSE_17_ATTACK.webp',
  WIN:'MUDAGIRI_POSE_18_WIN.webp',
  COMPLETE:'MUDAGIRI_POSE_19_COMPLETE.webp',
  CHECK:'MUDAGIRI_POSE_20_CHECK.webp',
  ANALYZE:'MUDAGIRI_POSE_21_ANALYZE.webp',
  UNLOCK:'MUDAGIRI_POSE_22_UNLOCK.webp',
  RESULT:'MUDAGIRI_POSE_23_RESULT.webp',
  SHARE:'MUDAGIRI_POSE_24_SHARE.webp',
  CTA:'MUDAGIRI_POSE_25_CTA.webp',
};

export const MUDAGIRI_POSE_ASSET=Object.fromEntries(
  Object.entries(FILES).map(([key,file])=>[key,`${MUDAGIRI_POSE_WEB_BASE}/${file}`]),
) as Record<MudagiriPoseId,string>;

export const MUDAGIRI_BACKGROUND_ASSET={
  guildHall:`${MUDAGIRI_ASSET_BASE}/backgrounds/money-personality/v1/MP_BG_01_GUILD_HALL.webp`,
  classUnlock:`${MUDAGIRI_ASSET_BASE}/backgrounds/money-personality/v1/MP_BG_02_JOB_UNLOCK.webp`,
  nextQuest:`${MUDAGIRI_ASSET_BASE}/backgrounds/money-personality/v1/MP_BG_03_NEXT_QUEST.webp`,
} as const;
