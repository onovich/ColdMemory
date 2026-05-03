import {
  AUTO_DRIVE_DISTANCE_PER_TICK,
  AUTO_DRIVE_ENERGY_PER_TICK,
  DECODE_DURATION_MS,
  DECODE_TICK_MS,
  STORY_STAGES
} from '../data/stages.js';
import { ECONOMY } from '../data/economy.js';
import { getCriticalBattle } from '../data/battles.js';
import { EXPLORATION_TIERS } from '../data/exploration.js';
import {
  UPGRADE_CONFIG,
  getAutoPointRate,
  getCombatRewardMultiplier,
  getExplorationRewardMultiplier,
  getNextUpgradeLevel
} from '../data/upgrades.js';
import {
  canUnlockCriticalWithEvidence,
  canUnlockCriticalWithPoints,
  createStatusSnapshot,
  getCurrentStage,
  isStoryBlocked,
  isEvaUnlocked
} from './progression.js';
import { createStore } from './store.js';

function getUpgradeGuideEvent(stageNumber) {
  const unlockedTitles = UPGRADE_CONFIG
    .filter((upgrade) => upgrade.unlockStage === stageNumber)
    .map((upgrade) => upgrade.title);

  if (unlockedTitles.length === 0) {
    return null;
  }

  return `系统升级入口已开放：${unlockedTitles.join(' / ')}。可前往 [升级] 面板查看。`;
}

function getCurrentExplorationTier(stageIndex) {
  const unlockedStage = stageIndex + 1;
  return EXPLORATION_TIERS
    .filter((tier) => tier.unlockStage <= unlockedStage)
    .at(-1) ?? EXPLORATION_TIERS[0];
}

function rollRange(minValue, maxValue) {
  const min = Math.round(minValue);
  const max = Math.round(maxValue);
  if (max <= min) {
    return min;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createInitialState() {
  return {
  gameState: 'BOOT',
  currentView: 'TERMINAL',
  distance: 0,
  energy: 90,
  stageIndex: 0,
  revealedNormalNodes: 1,
  criticalUnlocked: false,
  battleCleared: false,
  decodeProgress: 0,
  isDecoding: false,
  isEvaOpen: false,
  glitch: false,
  points: 0,
  evidence: 0,
  autoPointBuffer: 0,
  upgrades: {
    archiveRelay: 0,
    salvageArray: 0,
    decodeCache: 0,
    scoutDrones: 0
  },
  endingState: null,
  lastPointGainAt: Date.now(),
  recentEvents: ['低温舱信号恢复。等待唤醒。'],
  stats: {
    earnedPoints: 0,
    spentPoints: 0,
    decodedNodes: 1,
    battlesWon: 0,
    criticalUnlocks: 0,
    endingChoice: null
  }
  };
}

export class GameController {
  constructor() {
    this.store = createStore(createInitialState());
    this.decodeTimer = null;
    this.glitchCooldown = null;
    this.systemTimer = window.setInterval(() => this.tickSystems(), ECONOMY.systemTickMs);
    this.glitchTimer = window.setInterval(() => this.tickGlitch(), 3000);
  }

  destroy() {
    if (this.systemTimer) {
      window.clearInterval(this.systemTimer);
    }

    if (this.glitchTimer) {
      window.clearInterval(this.glitchTimer);
    }

    if (this.glitchCooldown) {
      window.clearTimeout(this.glitchCooldown);
    }

    this.stopDecodeTimer();
  }

  subscribe(listener) {
    return this.store.subscribe(listener);
  }

  getState() {
    return this.store.getState();
  }

  getViewModel() {
    return createStatusSnapshot(this.getState());
  }

  reset() {
    this.stopDecodeTimer();
    this.store.setState(createInitialState());
  }

  setView(view) {
    const state = this.getState();
    if (state.gameState === 'BOOT') {
      return;
    }

    this.store.patchState({ currentView: view });
  }

  toggleView() {
    const state = this.getState();
    if (state.gameState === 'BOOT') {
      return;
    }

    this.store.patchState({
      currentView: state.currentView === 'TERMINAL' ? 'ARCHIVE' : 'TERMINAL'
    });
  }

  createPointGainPatch(state, amount, eventText, extraPatch = {}, extraStats = {}) {
    const safeAmount = Math.max(0, Math.round(amount));
    const mergedStats = {
      ...state.stats,
      ...(extraPatch.stats ?? {}),
      earnedPoints: state.stats.earnedPoints + safeAmount,
      ...extraStats
    };

    return {
      ...extraPatch,
      points: state.points + safeAmount,
      lastPointGainAt: safeAmount > 0 ? Date.now() : state.lastPointGainAt,
      recentEvents: eventText ? [`${eventText}${safeAmount > 0 ? ` (+${safeAmount} 记忆点)` : ''}。`, ...state.recentEvents].slice(0, 4) : state.recentEvents,
      stats: mergedStats
    };
  }

  createPointSpendPatch(state, amount, eventText, extraPatch = {}, extraStats = {}) {
    const safeAmount = Math.max(0, Math.round(amount));
    const mergedStats = {
      ...state.stats,
      ...(extraPatch.stats ?? {}),
      spentPoints: state.stats.spentPoints + safeAmount,
      ...extraStats
    };

    return {
      ...extraPatch,
      points: Math.max(0, state.points - safeAmount),
      recentEvents: eventText ? [`${eventText} (-${safeAmount} 记忆点)。`, ...state.recentEvents].slice(0, 4) : state.recentEvents,
      stats: mergedStats
    };
  }

  wakeUp() {
    const state = this.getState();
    if (state.gameState !== 'BOOT') {
      return;
    }

    const stage = getCurrentStage(state);
    const firstNode = stage.normalNodes[0];
    const initialPoints = firstNode?.rewardPoints ?? 0;
    const guideEvent = getUpgradeGuideEvent(state.stageIndex + 1);

    this.store.patchState({
      gameState: 'IDLE',
      points: state.points + initialPoints,
      lastPointGainAt: initialPoints > 0 ? Date.now() : state.lastPointGainAt,
      recentEvents: [
        guideEvent,
        firstNode ? `记录节点 1/${stage.normalNodes.length} 已接入 (+${initialPoints} 记忆点)。` : null,
        '唤醒程序完成。先驱者-04 号主终端接管。',
        ...state.recentEvents
      ].filter(Boolean).slice(0, 4),
      stats: {
        ...state.stats,
        earnedPoints: state.stats.earnedPoints + initialPoints,
        decodedNodes: firstNode ? 1 : 0
      }
    });
  }

  toggleAutoPilot() {
    const state = this.getState();
    if (state.gameState === 'BOOT' || state.criticalUnlocked || state.endingState) {
      return;
    }

    const gameState = state.gameState === 'AUTO_PILOT' ? 'IDLE' : 'AUTO_PILOT';
    this.store.patchState({
      gameState,
      recentEvents: [
        gameState === 'AUTO_PILOT' ? '自动巡航启动。' : '自动巡航已挂起。',
        ...state.recentEvents
      ].slice(0, 4)
    });
  }

  tickGlitch() {
    const state = this.getState();
    if (state.gameState === 'BOOT' || Math.random() <= 0.95) {
      return;
    }

    this.store.patchState({ glitch: true });
    this.glitchCooldown = window.setTimeout(() => {
      this.store.patchState({ glitch: false });
      this.glitchCooldown = null;
    }, Math.random() * 200 + 100);
  }

  tickSystems() {
    const state = this.getState();
    if (state.gameState === 'BOOT' || state.endingState) {
      return;
    }

    const blocked = isStoryBlocked(state);

    const autoPointRate = getAutoPointRate(state);
    const tickSeconds = ECONOMY.systemTickMs / 1000;
    const autopilotIncome = state.gameState === 'AUTO_PILOT' ? autoPointRate.autopilot : 0;
    const pointGain = (autoPointRate.passive + autopilotIncome) * tickSeconds;
    const nextBuffer = state.autoPointBuffer + pointGain;
    const gainedPoints = Math.floor(nextBuffer);
    const patch = {
      autoPointBuffer: nextBuffer - gainedPoints
    };

    let recentEvents = state.recentEvents;
    let stats = state.stats;
    if (gainedPoints > 0) {
      patch.points = state.points + gainedPoints;
      patch.lastPointGainAt = Date.now();
      stats = {
        ...stats,
        earnedPoints: stats.earnedPoints + gainedPoints
      };
    }

    if (state.gameState === 'AUTO_PILOT' && blocked) {
      patch.gameState = 'IDLE';
      recentEvents = ['航道阻塞，自动巡航已挂起。', ...recentEvents].slice(0, 4);
    }

    let nextEnergy = state.energy;
    const energyRegenPerSecond = ECONOMY.baseEnergyRegenPerSecond + autoPointRate.energyPerSecond;
    if (energyRegenPerSecond > 0) {
      nextEnergy = Math.min(100, nextEnergy + energyRegenPerSecond * tickSeconds);
    }

    if (
      state.gameState === 'AUTO_PILOT' &&
      !state.isEvaOpen &&
      !blocked &&
      !state.criticalUnlocked &&
      nextEnergy > 0
    ) {
      nextEnergy = Math.max(0, nextEnergy - AUTO_DRIVE_ENERGY_PER_TICK);
      patch.distance = state.distance + AUTO_DRIVE_DISTANCE_PER_TICK;
      patch.gameState = nextEnergy > 0 ? state.gameState : 'IDLE';
    }

    if (!Object.is(nextEnergy, state.energy)) {
      patch.energy = nextEnergy;
    }

    if (Date.now() - state.lastPointGainAt >= ECONOMY.inactivityGrantThresholdMs) {
      patch.points = (patch.points ?? state.points) + ECONOMY.inactivityGrantPoints;
      patch.lastPointGainAt = Date.now();
      recentEvents = [`母亲补助已发放 (+${ECONOMY.inactivityGrantPoints} 记忆点)。`, ...state.recentEvents].slice(0, 4);
      stats = {
        ...stats,
        earnedPoints: stats.earnedPoints + ECONOMY.inactivityGrantPoints
      };
    }

    if (recentEvents !== state.recentEvents) {
      patch.recentEvents = recentEvents;
    }

    if (stats !== state.stats) {
      patch.stats = stats;
    }

    this.store.patchState(patch);
  }

  consumeEvaShotEnergy() {
    const state = this.getState();
    if (state.gameState === 'BOOT' || !state.isEvaOpen || state.energy < ECONOMY.evaShotEnergyCost) {
      return false;
    }

    this.store.patchState({
      energy: Math.max(0, state.energy - ECONOMY.evaShotEnergyCost)
    });

    return true;
  }

  startDecoding() {
    const state = this.getState();
    const stage = getCurrentStage(state);
    if (state.isDecoding || isStoryBlocked(state, stage) || state.revealedNormalNodes >= stage.normalNodes.length || state.criticalUnlocked) {
      return;
    }

    this.stopDecodeTimer();
    this.store.patchState({
      isDecoding: true,
      decodeProgress: 0
    });

    const increment = 100 / (DECODE_DURATION_MS / DECODE_TICK_MS);
    this.decodeTimer = window.setInterval(() => {
      const current = this.getState();
      const nextProgress = current.decodeProgress + increment;
      if (nextProgress >= 100) {
        this.stopDecodeTimer();
        this.revealNextNode();
        return;
      }

      this.store.patchState({ decodeProgress: nextProgress });
    }, DECODE_TICK_MS);
  }

  stopDecodeTimer() {
    if (this.decodeTimer) {
      window.clearInterval(this.decodeTimer);
      this.decodeTimer = null;
    }
  }

  revealNextNode() {
    const state = this.getState();
    const stage = getCurrentStage(state);
    const nextNode = stage.normalNodes[state.revealedNormalNodes];
    if (!nextNode) {
      return;
    }

    const autoPointRate = getAutoPointRate(state);
    const rewardPoints = nextNode.rewardPoints + autoPointRate.manualBonus;
    const revealedNormalNodes = Math.min(stage.normalNodes.length, state.revealedNormalNodes + 1);

    this.store.patchState(this.createPointGainPatch(state, rewardPoints, `记录节点 ${revealedNormalNodes}/${stage.normalNodes.length} 已恢复`, {
      revealedNormalNodes,
      isDecoding: false,
      decodeProgress: 0,
      stats: {
        decodedNodes: state.stats.decodedNodes + 1
      }
    }));
  }

  openEva() {
    const state = this.getState();
    if (state.gameState === 'BOOT' || !isEvaUnlocked(state)) {
      return;
    }

    this.store.patchState({
      isEvaOpen: true,
      gameState: 'IDLE',
      recentEvents: ['EVA 终端连接建立。', ...state.recentEvents].slice(0, 4)
    });
  }

  closeEva() {
    const state = this.getState();
    if (isStoryBlocked(state)) {
      return;
    }

    this.store.patchState({
      isEvaOpen: false,
      recentEvents: ['EVA 连接已断开。', ...state.recentEvents].slice(0, 4)
    });
  }

  completeEvaMission(score = 0) {
    const state = this.getState();
    const stage = getCurrentStage(state);
    const safeScore = Math.max(0, Math.round(score));

    if (isStoryBlocked(state, stage)) {
      const battle = getCriticalBattle(stage);
      const basePoints = Math.round(battle.rewardPoints * getCombatRewardMultiplier(state));
      const hitBonus = Math.round(safeScore * ECONOMY.evaCombatPointBonusPerHit);
      this.store.patchState(this.createPointGainPatch(state, basePoints + hitBonus, `${battle.label} 完成（命中 ${safeScore}）`, {
        isEvaOpen: false,
        battleCleared: true,
        evidence: state.evidence + battle.rewardEvidence,
        energy: Math.min(100, state.energy + 8),
        stats: {
          battlesWon: state.stats.battlesWon + 1
        }
      }));
      return;
    }

    const tier = getCurrentExplorationTier(state.stageIndex);
    const randomBonus = rollRange(tier.randomRewardPoints[0], tier.randomRewardPoints[1]);
    const scoreReward = safeScore * ECONOMY.evaExplorationPointPerHit;
    const rawPoints = safeScore > 0 ? tier.fixedRewardPoints + randomBonus + scoreReward : 0;
    const points = Math.round(rawPoints * getExplorationRewardMultiplier(state));
    const energyReward = safeScore > 0 ? tier.energyReward : 0;

    this.store.patchState(this.createPointGainPatch(state, points, `${tier.title} 探索结算（命中 ${safeScore}）`, {
      isEvaOpen: false,
      energy: Math.min(100, state.energy + energyReward),
      stats: {
        battlesWon: state.stats.battlesWon + 1
      }
    }));
  }

  unlockCriticalWithEvidence() {
    const state = this.getState();
    const stage = getCurrentStage(state);
    if (!canUnlockCriticalWithEvidence(state, stage)) {
      return;
    }

    this.store.patchState({
      criticalUnlocked: true,
      battleCleared: false,
      evidence: state.evidence - stage.criticalNode.requiredEvidence,
      gameState: 'IDLE',
      recentEvents: [`${stage.criticalNode.title} 已用关键证词接入。`, ...state.recentEvents].slice(0, 4),
      stats: {
        ...state.stats,
        criticalUnlocks: state.stats.criticalUnlocks + 1
      }
    });
  }

  unlockCriticalWithPoints() {
    const state = this.getState();
    const stage = getCurrentStage(state);
    if (!canUnlockCriticalWithPoints(state, stage)) {
      return;
    }

    this.store.patchState(this.createPointSpendPatch(state, stage.criticalNode.unlockCostPoints, `${stage.criticalNode.title} 已用记忆点强制接入`, {
      criticalUnlocked: true,
      battleCleared: false,
      gameState: 'IDLE'
    }, {
      criticalUnlocks: state.stats.criticalUnlocks + 1
    }));
  }

  advanceStage() {
    const state = this.getState();
    if (!state.criticalUnlocked || state.stageIndex >= STORY_STAGES.length - 1) {
      return;
    }

    const nextStageIndex = Math.min(STORY_STAGES.length - 1, state.stageIndex + 1);
    const nextStage = STORY_STAGES[nextStageIndex];
    const firstNode = nextStage.normalNodes[0];
    const initialPoints = firstNode?.rewardPoints ?? 0;
    const guideEvent = getUpgradeGuideEvent(nextStageIndex + 1);

    this.store.patchState({
      stageIndex: nextStageIndex,
      revealedNormalNodes: 1,
      criticalUnlocked: false,
      battleCleared: false,
      gameState: 'IDLE',
      currentView: 'TERMINAL',
      points: state.points + initialPoints,
      lastPointGainAt: initialPoints > 0 ? Date.now() : state.lastPointGainAt,
      recentEvents: [
        guideEvent,
        firstNode ? `记录节点 1/${nextStage.normalNodes.length} 已接入 (+${initialPoints} 记忆点)。` : null,
        `${nextStage.title} 已接入。`,
        ...state.recentEvents
      ].filter(Boolean).slice(0, 4),
      stats: {
        ...state.stats,
        earnedPoints: state.stats.earnedPoints + initialPoints,
        decodedNodes: state.stats.decodedNodes + (firstNode ? 1 : 0)
      }
    });
  }

  chooseEnding(choiceId) {
    const state = this.getState();
    const stage = getCurrentStage(state);
    const choices = stage.criticalNode.endingChoices ?? [];
    const selectedChoice = choices.find((choice) => choice.id === choiceId);
    if (!state.criticalUnlocked || !selectedChoice) {
      return;
    }

    this.store.patchState({
      endingState: choiceId,
      gameState: 'IDLE',
      currentView: 'TERMINAL',
      isEvaOpen: false,
      recentEvents: [`最终裁决已提交：${selectedChoice.title}。`, ...state.recentEvents].slice(0, 4),
      stats: {
        ...state.stats,
        endingChoice: choiceId
      }
    });
  }

  purchaseUpgrade(upgradeId) {
    const state = this.getState();
    const config = UPGRADE_CONFIG.find((upgrade) => upgrade.id === upgradeId);
    if (!config || !config.implemented || state.stageIndex + 1 < config.unlockStage) {
      return;
    }

    const nextLevel = getNextUpgradeLevel(state, upgradeId);
    if (!nextLevel || state.points < nextLevel.cost) {
      return;
    }

    this.store.patchState(this.createPointSpendPatch(state, nextLevel.cost, `${config.title} 升级完成`, {
      upgrades: {
        ...state.upgrades,
        [upgradeId]: (state.upgrades[upgradeId] ?? 0) + 1
      }
    }));
  }
}