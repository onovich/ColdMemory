export const BATTLE_CONFIG = {
  'battle-cold-start': {
    id: 'battle-cold-start',
    label: '推进喷口压制',
    description: '清除附着在推进喷口周围的高密度污染聚合体。',
    targetHits: 10,
    rewardPoints: 70,
    rewardEvidence: 1
  },
  'battle-quarantine': {
    id: 'battle-quarantine',
    label: '散热阵列净空',
    description: '压制沿着外壳散热片重新聚集的聚合体。',
    targetHits: 12,
    rewardPoints: 85,
    rewardEvidence: 1
  },
  'battle-echo-contamination': {
    id: 'battle-echo-contamination',
    label: '回声结构切离',
    description: '阻止污染结构沿散热网络继续学习舰体布局。',
    targetHits: 14,
    rewardPoints: 100,
    rewardEvidence: 1
  },
  'battle-mother-split': {
    id: 'battle-mother-split',
    label: '协议仲裁火线',
    description: '以人工作战结果代替失效的自动仲裁。',
    targetHits: 16,
    rewardPoints: 115,
    rewardEvidence: 1
  },
  'battle-return-window': {
    id: 'battle-return-window',
    label: '归航窗口封锁',
    description: '清除逼近归航窗口的最终一轮污染实体。',
    targetHits: 18,
    rewardPoints: 130,
    rewardEvidence: 1
  },
  'battle-cold-memory': {
    id: 'battle-cold-memory',
    label: '最终授权净场',
    description: '在提交最终裁决前，完成最后一轮净空。',
    targetHits: 20,
    rewardPoints: 160,
    rewardEvidence: 1
  }
};

export function getCriticalBattle(stage) {
  return BATTLE_CONFIG[stage.battleId];
}

export function getDailySalvageReward(stageIndex, multiplier = 1) {
  const basePoints = 18 + stageIndex * 6;
  return {
    points: Math.round(basePoints * multiplier),
    energy: 20
  };
}