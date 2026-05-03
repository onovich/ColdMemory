import {
  AUTO_DRIVE_DISTANCE_PER_TICK,
  AUTO_DRIVE_ENERGY_PER_TICK,
  DECODE_DURATION_MS,
  DECODE_TICK_MS,
  EVA_RECOVERY,
  STORY_STAGES
} from '../data/stages.js';
import { createStatusSnapshot, getCurrentStage, isStoryBlocked, isEvaUnlocked } from './progression.js';
import { createStore } from './store.js';

const INITIAL_STATE = {
  gameState: 'BOOT',
  currentView: 'TERMINAL',
  distance: 0,
  energy: 90,
  stageIndex: 0,
  revealedLines: 1,
  decodeProgress: 0,
  isDecoding: false,
  isEvaOpen: false,
  evaUnlocked: false,
  glitch: false,
  recentEvents: ['低温舱信号恢复。等待唤醒。']
};

export class GameController {
  constructor() {
    this.store = createStore(INITIAL_STATE);
    this.decodeTimer = null;
    this.glitchCooldown = null;
    this.autoPilotTimer = window.setInterval(() => this.tickAutoDrive(), 200);
    this.glitchTimer = window.setInterval(() => this.tickGlitch(), 3000);
  }

  destroy() {
    if (this.autoPilotTimer) {
      window.clearInterval(this.autoPilotTimer);
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

  wakeUp() {
    this.store.patchState({
      gameState: 'IDLE',
      recentEvents: [
        '唤醒程序完成。先驱者-04 号主终端接管。',
        ...this.getState().recentEvents
      ].slice(0, 4)
    });
  }

  toggleAutoPilot() {
    const state = this.getState();
    if (state.gameState === 'BOOT') {
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

  toggleView() {
    const state = this.getState();
    if (state.gameState === 'BOOT') {
      return;
    }

    this.store.patchState({
      currentView: state.currentView === 'TERMINAL' ? 'ARCHIVE' : 'TERMINAL'
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

  tickAutoDrive() {
    const state = this.getState();
    if (
      state.gameState !== 'AUTO_PILOT' ||
      state.isEvaOpen ||
      isStoryBlocked(state) ||
      state.energy <= 0
    ) {
      return;
    }

    const nextEnergy = Math.max(0, state.energy - AUTO_DRIVE_ENERGY_PER_TICK);
    this.store.patchState({
      distance: state.distance + AUTO_DRIVE_DISTANCE_PER_TICK,
      energy: nextEnergy,
      gameState: nextEnergy > 0 ? state.gameState : 'IDLE'
    });
  }

  startDecoding() {
    const state = this.getState();
    const stage = getCurrentStage(state);
    if (state.isDecoding || isStoryBlocked(state, stage) || state.revealedLines >= stage.content.length) {
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
        this.revealNextLine();
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

  revealNextLine() {
    const state = this.getState();
    const stage = getCurrentStage(state);
    const revealedLines = Math.min(stage.content.length, state.revealedLines + 1);
    const unlocked = isEvaUnlocked(
      {
        ...state,
        revealedLines
      },
      stage
    );

    this.store.patchState({
      revealedLines,
      isDecoding: false,
      decodeProgress: 0,
      evaUnlocked: unlocked,
      recentEvents: [
        `记忆片段 ${revealedLines}/${stage.content.length} 已恢复。`,
        ...state.recentEvents
      ].slice(0, 4)
    });
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

  completeEvaMission() {
    const state = this.getState();
    const stage = getCurrentStage(state);

    if (isStoryBlocked(state, stage)) {
      const nextStageIndex = Math.min(STORY_STAGES.length - 1, state.stageIndex + 1);
      this.store.patchState({
        isEvaOpen: false,
        stageIndex: nextStageIndex,
        revealedLines: 1,
        distance: state.distance + 12,
        energy: Math.min(100, state.energy + 8),
        recentEvents: [
          `航道清理完成。${STORY_STAGES[nextStageIndex].title} 已接入。`,
          ...state.recentEvents
        ].slice(0, 4)
      });
      return;
    }

    this.store.patchState({
      isEvaOpen: false,
      energy: Math.min(100, state.energy + EVA_RECOVERY),
      recentEvents: ['回收作业完成。动力核心恢复 30%。', ...state.recentEvents].slice(0, 4)
    });
  }
}