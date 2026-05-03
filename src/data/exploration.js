export const EXPLORATION_TIERS = [
  {
    id: 'near-salvage',
    title: 'T1 近程回收',
    unlockStage: 1,
    durationSeconds: 45,
    fixedRewardPoints: 20,
    randomRewardPoints: [0, 6],
    energyReward: 6
  },
  {
    id: 'hull-maintenance',
    title: 'T2 外壳检修',
    unlockStage: 2,
    durationSeconds: 45,
    fixedRewardPoints: 22,
    randomRewardPoints: [0, 8],
    energyReward: 8
  },
  {
    id: 'deep-bay',
    title: 'T3 深舱勘探',
    unlockStage: 3,
    durationSeconds: 45,
    fixedRewardPoints: 26,
    randomRewardPoints: [0, 12],
    energyReward: 10
  },
  {
    id: 'far-array',
    title: 'T4 远端阵列',
    unlockStage: 4,
    durationSeconds: 45,
    fixedRewardPoints: 30,
    randomRewardPoints: [0, 14],
    energyReward: 12
  },
  {
    id: 'return-outpost',
    title: 'T5 归航前哨',
    unlockStage: 5,
    durationSeconds: 45,
    fixedRewardPoints: 34,
    randomRewardPoints: [0, 16],
    energyReward: 14
  }
];