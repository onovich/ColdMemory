export const UPGRADE_CONFIG = [
  {
    id: 'archiveRelay',
    title: '档案继电器',
    summary: '维持基础记忆点回流。',
    unlockStage: 1,
    implemented: true,
    levels: [
      { cost: 40, passivePerSecond: 0.15, energyPerSecond: 0.04 },
      { cost: 90, passivePerSecond: 0.2, energyPerSecond: 0.05 },
      { cost: 160, passivePerSecond: 0.3, energyPerSecond: 0.06 }
    ]
  },
  {
    id: 'salvageArray',
    title: '回收阵列',
    summary: '强化作战收益，并在自动巡航时提供被动记忆点。',
    unlockStage: 2,
    implemented: true,
    levels: [
      { cost: 80, combatRewardMultiplier: 0.2, autopilotPerSecond: 0.1 },
      { cost: 140, combatRewardMultiplier: 0.15, autopilotPerSecond: 0.15 },
      { cost: 220, combatRewardMultiplier: 0.15, autopilotPerSecond: 0.25 }
    ]
  },
  {
    id: 'decodeCache',
    title: '解码缓存器',
    summary: '提升手动剧情收益，并提供后台解析记忆点。',
    unlockStage: 3,
    implemented: true,
    levels: [
      { cost: 50, manualRewardBonus: 4, passivePerSecond: 0.05 },
      { cost: 100, manualRewardBonus: 8, passivePerSecond: 0.1 },
      { cost: 180, manualRewardBonus: 12, passivePerSecond: 0.2 }
    ]
  },
  {
    id: 'scoutDrones',
    title: '勘探无人机',
    summary: '强化 EVA 探索收益并缩短回收作业周期。',
    unlockStage: 2,
    implemented: true,
    levels: [
      { cost: 60, explorationRewardMultiplier: 0.15, explorationEnabled: true },
      { cost: 120, explorationRewardMultiplier: 0.15, explorationDurationDelta: -5 },
      { cost: 200, explorationRewardMultiplier: 0.2, explorationDurationDelta: -5 }
    ]
  }
];

function getUpgradeConfig(id) {
  return UPGRADE_CONFIG.find((upgrade) => upgrade.id === id);
}

export function getUpgradeLevel(state, id) {
  return state.upgrades?.[id] ?? 0;
}

export function getNextUpgradeLevel(state, id) {
  const config = getUpgradeConfig(id);
  if (!config) {
    return null;
  }

  const currentLevel = getUpgradeLevel(state, id);
  return config.levels[currentLevel] ?? null;
}

export function getUpgradeEffects(state) {
  const effects = {
    passivePerSecond: 0,
    autopilotPerSecond: 0,
    manualRewardBonus: 0,
    combatRewardMultiplier: 0,
    explorationRewardMultiplier: 0,
    energyPerSecond: 0
  };

  UPGRADE_CONFIG.forEach((upgrade) => {
    const level = getUpgradeLevel(state, upgrade.id);
    upgrade.levels.slice(0, level).forEach((entry) => {
      effects.passivePerSecond += entry.passivePerSecond ?? 0;
      effects.autopilotPerSecond += entry.autopilotPerSecond ?? 0;
      effects.manualRewardBonus += entry.manualRewardBonus ?? 0;
      effects.combatRewardMultiplier += entry.combatRewardMultiplier ?? 0;
      effects.explorationRewardMultiplier += entry.explorationRewardMultiplier ?? 0;
      effects.energyPerSecond += entry.energyPerSecond ?? 0;
    });
  });

  return effects;
}

export function getCombatRewardMultiplier(state) {
  return 1 + getUpgradeEffects(state).combatRewardMultiplier;
}

export function getAutoPointRate(state) {
  const effects = getUpgradeEffects(state);
  return {
    passive: effects.passivePerSecond,
    autopilot: effects.autopilotPerSecond,
    total: effects.passivePerSecond + effects.autopilotPerSecond,
    manualBonus: effects.manualRewardBonus,
    energyPerSecond: effects.energyPerSecond
  };
}

export function getExplorationRewardMultiplier(state) {
  return 1 + getUpgradeEffects(state).explorationRewardMultiplier;
}

export function formatUpgradeEffect(upgradeId, levelEntry) {
  if (!levelEntry) {
    return '已满级';
  }

  const effects = [];
  if (levelEntry.passivePerSecond) {
    effects.push(`常驻 +${levelEntry.passivePerSecond.toFixed(2)} 记忆点/秒`);
  }

  if (levelEntry.autopilotPerSecond) {
    effects.push(`巡航 +${levelEntry.autopilotPerSecond.toFixed(2)} 记忆点/秒`);
  }

  if (levelEntry.manualRewardBonus) {
    effects.push(`普通剧情 +${levelEntry.manualRewardBonus} 记忆点`);
  }

  if (levelEntry.combatRewardMultiplier) {
    effects.push(`战斗奖励 +${Math.round(levelEntry.combatRewardMultiplier * 100)}%`);
  }

  if (levelEntry.energyPerSecond) {
    effects.push(`核心能级 +${levelEntry.energyPerSecond.toFixed(2)}%/秒`);
  }

  if (upgradeId === 'scoutDrones' && !effects.length) {
    effects.push('探索收益与持续时间修正');
  }

  return effects.join(' / ');
}