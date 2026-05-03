import { STORY_STAGES } from '../data/stages.js';
import { getCriticalBattle } from '../data/battles.js';
import { getStageBlockerConditions } from '../data/blockers.js';
import { UPGRADE_CONFIG, getAutoPointRate } from '../data/upgrades.js';

export function getCurrentStage(state) {
  return STORY_STAGES[state.stageIndex] ?? STORY_STAGES[STORY_STAGES.length - 1];
}

export function isFinalStage(state) {
  return state.stageIndex >= STORY_STAGES.length - 1;
}

function meetsBlockCondition(state, stage, condition) {
  switch (condition.type) {
    case 'distance':
      return state.distance >= (condition.value ?? stage.triggerDistance ?? 0);
    case 'all-normal-revealed':
      return hasRevealedAllNormalNodes(state, stage);
    case 'upgrade-level': {
      const level = state.upgrades?.[condition.upgradeId] ?? 0;
      return level >= (condition.level ?? 0);
    }
    case 'critical-unlocked':
      return state.criticalUnlocked === Boolean(condition.value);
    case 'points':
      return state.points >= (condition.value ?? 0);
    case 'evidence':
      return state.evidence >= (condition.value ?? 0);
    default:
      return false;
  }
}

function describeBlockCondition(condition) {
  const upgradeTitle = UPGRADE_CONFIG.find((upgrade) => upgrade.id === condition.upgradeId)?.title ?? condition.upgradeId;

  switch (condition.type) {
    case 'distance':
      return `航程达到 ${Math.round(condition.value ?? 0)} KM`;
    case 'all-normal-revealed':
      return '当前章节普通剧情全部解锁';
    case 'upgrade-level':
      return `${upgradeTitle} 达到 Lv.${condition.level ?? 0}`;
    case 'critical-unlocked':
      return condition.value ? '关键剧情已解锁' : '关键剧情未解锁';
    case 'points':
      return `记忆点达到 ${Math.round(condition.value ?? 0)}`;
    case 'evidence':
      return `关键证词达到 ${Math.round(condition.value ?? 0)}`;
    default:
      return '未知条件';
  }
}

export function hasRevealedAllNormalNodes(state, stage = getCurrentStage(state)) {
  return state.revealedNormalNodes >= stage.normalNodes.length;
}

export function isStoryBlocked(state, stage = getCurrentStage(state)) {
  const blockerConditions = getStageBlockerConditions(stage);
  const shouldBlock = blockerConditions.every((condition) => meetsBlockCondition(state, stage, condition));

  return (
    shouldBlock &&
    !state.criticalUnlocked &&
    !state.endingState
  );
}

export function isEvaUnlocked(state, stage = getCurrentStage(state)) {
  return typeof stage.unlockEvaAtNode === 'number' && state.revealedNormalNodes >= stage.unlockEvaAtNode;
}

export function canDecode(state, stage = getCurrentStage(state)) {
  return !state.isDecoding && !isStoryBlocked(state, stage) && state.revealedNormalNodes < stage.normalNodes.length && !state.criticalUnlocked && !state.endingState;
}

export function getDecodeRatio(state) {
  return Math.max(0, Math.min(100, state.decodeProgress));
}

export function canUnlockCriticalWithEvidence(state, stage = getCurrentStage(state)) {
  return !state.criticalUnlocked && state.evidence >= stage.criticalNode.requiredEvidence;
}

export function canUnlockCriticalWithPoints(state, stage = getCurrentStage(state)) {
  return !state.criticalUnlocked && state.points >= stage.criticalNode.unlockCostPoints;
}

export function getVisibleNodesForStage(state, stageIndex) {
  const stage = STORY_STAGES[stageIndex] ?? STORY_STAGES[STORY_STAGES.length - 1];
  const isPastStage = stageIndex < state.stageIndex;
  const visibleNormalCount = isPastStage ? stage.normalNodes.length : Math.min(state.revealedNormalNodes, stage.normalNodes.length);
  const nodes = stage.normalNodes.slice(0, visibleNormalCount);

  if (isPastStage || (stageIndex === state.stageIndex && state.criticalUnlocked)) {
    nodes.push(stage.criticalNode);
  }

  return nodes;
}

function getMotherDirective(state, stage, blocked) {
  if (state.endingState === 'return') {
    return stage.motherProtocol.endingReturn ?? stage.motherProtocol.criticalUnlocked;
  }

  if (state.endingState === 'shutdown') {
    return stage.motherProtocol.endingShutdown ?? stage.motherProtocol.criticalUnlocked;
  }

  if (state.criticalUnlocked) {
    return stage.motherProtocol.criticalUnlocked;
  }

  if (blocked) {
    if (state.battleCleared || canUnlockCriticalWithEvidence(state, stage) || canUnlockCriticalWithPoints(state, stage)) {
      return stage.motherProtocol.criticalReady;
    }

    return stage.motherProtocol.blocked;
  }

  if (state.gameState === 'AUTO_PILOT') {
    return stage.motherProtocol.autopilot;
  }

  if (state.revealedNormalNodes >= Math.max(1, stage.normalNodes.length - 1)) {
    return stage.motherProtocol.warning ?? stage.motherProtocol.baseline;
  }

  return stage.motherProtocol.baseline;
}

export function createStatusSnapshot(state) {
  const stage = getCurrentStage(state);
  const blockerConditions = getStageBlockerConditions(stage);
  const blocked = isStoryBlocked(state, stage);
  const pendingBlockerConditions = blockerConditions
    .filter((condition) => !meetsBlockCondition(state, stage, condition))
    .map((condition) => describeBlockCondition(condition));
  const logState = hasRevealedAllNormalNodes(state, stage) ? 'archived' : 'active';
  const autoPointRate = getAutoPointRate(state);
  const criticalBattle = getCriticalBattle(stage);

  return {
    stage,
    blocked,
    evaUnlocked: isEvaUnlocked(state, stage),
    canDecode: canDecode(state, stage),
    criticalUnlocked: state.criticalUnlocked,
    canUnlockCriticalWithEvidence: canUnlockCriticalWithEvidence(state, stage),
    canUnlockCriticalWithPoints: canUnlockCriticalWithPoints(state, stage),
    finalStage: isFinalStage(state),
    allNormalRevealed: hasRevealedAllNormalNodes(state, stage),
    logState,
    pendingBlockerConditions,
    stageProgress: `${Math.min(state.revealedNormalNodes, stage.normalNodes.length)}/${stage.normalNodes.length}`,
    stageCode: String(state.stageIndex + 1).padStart(2, '0'),
    motherHint: getMotherDirective(state, stage, blocked),
    visibleNodes: getVisibleNodesForStage(state, state.stageIndex),
    criticalBattle,
    autoPointRate
  };
}