import { STORY_STAGES } from '../data/stages.js';

export function getCurrentStage(state) {
  return STORY_STAGES[state.stageIndex] ?? STORY_STAGES[STORY_STAGES.length - 1];
}

export function isFinalStage(state) {
  return state.stageIndex >= STORY_STAGES.length - 1;
}

export function hasRevealedFullStage(state, stage = getCurrentStage(state)) {
  return state.revealedLines >= stage.content.length;
}

export function isStoryBlocked(state, stage = getCurrentStage(state)) {
  return (
    state.distance >= stage.triggerDistance &&
    hasRevealedFullStage(state, stage) &&
    !isFinalStage(state)
  );
}

export function isEvaUnlocked(state, stage = getCurrentStage(state)) {
  if (state.evaUnlocked) {
    return true;
  }

  return typeof stage.unlockEvaAtLine === 'number' && state.revealedLines >= stage.unlockEvaAtLine;
}

export function canDecode(state, stage = getCurrentStage(state)) {
  return !state.isDecoding && !isStoryBlocked(state, stage) && state.revealedLines < stage.content.length;
}

export function getDecodeRatio(state) {
  return Math.max(0, Math.min(100, state.decodeProgress));
}

export function createStatusSnapshot(state) {
  const stage = getCurrentStage(state);
  const blocked = isStoryBlocked(state, stage);
  const logState = hasRevealedFullStage(state, stage) ? 'archived' : 'active';

  return {
    stage,
    blocked,
    evaUnlocked: isEvaUnlocked(state, stage),
    canDecode: canDecode(state, stage),
    logState,
    signalStrength: Math.max(8, 100 - Math.floor(state.distance / 12)),
    stageProgress: `${Math.min(state.revealedLines, stage.content.length)}/${stage.content.length}`,
    stageCode: String(state.stageIndex + 1).padStart(2, '0'),
    motherHint: blocked ? '!! 航道检测到阻塞 !!' : stage.motherHint
  };
}