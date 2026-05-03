import { STORY_STAGES } from '../data/stages.js';
import { getCriticalBattle } from '../data/battles.js';
import { getAutoPointRate } from '../data/upgrades.js';

export function getCurrentStage(state) {
  return STORY_STAGES[state.stageIndex] ?? STORY_STAGES[STORY_STAGES.length - 1];
}

export function isFinalStage(state) {
  return state.stageIndex >= STORY_STAGES.length - 1;
}

export function hasRevealedAllNormalNodes(state, stage = getCurrentStage(state)) {
  return state.revealedNormalNodes >= stage.normalNodes.length;
}

export function isStoryBlocked(state, stage = getCurrentStage(state)) {
  return (
    state.distance >= stage.triggerDistance &&
    hasRevealedAllNormalNodes(state, stage) &&
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
  const blocked = isStoryBlocked(state, stage);
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
    signalStrength: Math.max(8, 100 - Math.floor(state.distance / 12)),
    stageProgress: `${Math.min(state.revealedNormalNodes, stage.normalNodes.length)}/${stage.normalNodes.length}`,
    stageCode: String(state.stageIndex + 1).padStart(2, '0'),
    motherHint: getMotherDirective(state, stage, blocked),
    visibleNodes: getVisibleNodesForStage(state, state.stageIndex),
    criticalBattle,
    autoPointRate
  };
}