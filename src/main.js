import { GameController } from './logic/game-controller.js';
import { UPGRADE_CONFIG, getNextUpgradeLevel } from './data/upgrades.js';
import { renderApp } from './ui/render.js';
import { DebrisShooter } from './ui/shooter.js';

export function bootstrapColdMemory(root) {
  const controller = new GameController();
  let shooter = null;
  let previousState = null;
  let previousViewModel = null;

  function createUpgradeAffordabilitySignature(state) {
    return UPGRADE_CONFIG
      .filter((upgrade) => state.stageIndex + 1 >= upgrade.unlockStage)
      .map((upgrade) => {
        const nextLevel = getNextUpgradeLevel(state, upgrade.id);
        if (!upgrade.implemented) {
          return `${upgrade.id}:planned`;
        }

        if (!nextLevel) {
          return `${upgrade.id}:max`;
        }

        return `${upgrade.id}:${state.points >= nextLevel.cost}`;
      })
      .join('|');
  }

  function createStructuralSnapshot(state, viewModel) {
    return {
      gameState: state.gameState,
      currentView: state.currentView,
      stageIndex: state.stageIndex,
      revealedNormalNodes: state.revealedNormalNodes,
      criticalUnlocked: state.criticalUnlocked,
      battleCleared: state.battleCleared,
      isDecoding: state.isDecoding,
      isEvaOpen: state.isEvaOpen,
      upgrades: JSON.stringify(state.upgrades),
      upgradeAffordability: createUpgradeAffordabilitySignature(state),
      recentEvents: state.recentEvents.join('|'),
      endingState: state.endingState,
      blocked: viewModel.blocked,
      canDecode: viewModel.canDecode,
      canUnlockCriticalWithEvidence: viewModel.canUnlockCriticalWithEvidence,
      canUnlockCriticalWithPoints: viewModel.canUnlockCriticalWithPoints,
      motherHint: viewModel.motherHint
    };
  }

  function shouldFullRender(state, viewModel) {
    if (!previousState || !previousViewModel) {
      return true;
    }

    const previousSnapshot = createStructuralSnapshot(previousState, previousViewModel);
    const currentSnapshot = createStructuralSnapshot(state, viewModel);
    return Object.keys(currentSnapshot).some((key) => currentSnapshot[key] !== previousSnapshot[key]);
  }

  function patchLiveRegions(state, viewModel) {
    const shell = root.querySelector('[data-shell]');
    const device = root.querySelector('[data-device]');
    shell?.classList.toggle('cm-shell--glitch', state.glitch);
    device?.classList.toggle('cm-device--glitch', state.glitch);

    const distanceNode = root.querySelector('[data-distance-number]');
    if (distanceNode) {
      distanceNode.textContent = String(Math.floor(state.distance));
    }

    const energyNode = root.querySelector('[data-energy-number]');
    if (energyNode) {
      energyNode.textContent = String(Math.floor(state.energy));
    }

    const energyBar = root.querySelector('[data-energy-bar]');
    if (energyBar) {
      energyBar.style.width = `${state.energy}%`;
    }

    const pointsNode = root.querySelector('[data-points-value]');
    if (pointsNode) {
      pointsNode.textContent = String(state.points);
    }

    const evidenceNode = root.querySelector('[data-evidence-value]');
    if (evidenceNode) {
      evidenceNode.textContent = String(state.evidence);
    }

    const rateNode = root.querySelector('[data-rate-value]');
    if (rateNode) {
      rateNode.textContent = viewModel.autoPointRate.total.toFixed(2);
    }

    if (state.isDecoding) {
      const progressLabel = root.querySelector('[data-decode-progress-label]');
      if (progressLabel) {
        progressLabel.textContent = `${Math.floor(state.decodeProgress)}%`;
      }

      const progressBar = root.querySelector('[data-decode-progress-bar]');
      if (progressBar) {
        progressBar.style.width = `${state.decodeProgress}%`;
      }
    }
  }

  function syncShooter() {
    if (shooter) {
      shooter.destroy();
      shooter = null;
    }

    const state = controller.getState();
    const viewModel = controller.getViewModel();
    if (!state.isEvaOpen) {
      return;
    }

    const mountNode = root.querySelector('[data-shooter-root]');
    if (!mountNode) {
      return;
    }

    shooter = new DebrisShooter({
      mountNode,
      targetHits: viewModel.blocked ? viewModel.criticalBattle.targetHits : 5,
      combatMode: viewModel.blocked,
      onComplete: () => {
        if (shooter) {
          shooter.destroy();
          shooter = null;
        }
        controller.completeEvaMission();
      }
    });
  }

  function render() {
    const state = controller.getState();
    const viewModel = controller.getViewModel();
    if (shouldFullRender(state, viewModel)) {
      renderApp(root, state, viewModel);
      syncShooter();
    } else {
      patchLiveRegions(state, viewModel);
    }

    previousState = structuredClone(state);
    previousViewModel = structuredClone(viewModel);
  }

  root.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) {
      return;
    }

    const { action } = actionTarget.dataset;
    switch (action) {
      case 'wake-up':
        controller.wakeUp();
        break;
      case 'toggle-autopilot':
        controller.toggleAutoPilot();
        break;
      case 'decode':
        controller.startDecoding();
        break;
      case 'open-eva':
        if (!actionTarget.disabled) {
          controller.openEva();
        }
        break;
      case 'toggle-view':
        controller.toggleView();
        break;
      case 'unlock-critical-evidence':
        controller.unlockCriticalWithEvidence();
        break;
      case 'unlock-critical-points':
        controller.unlockCriticalWithPoints();
        break;
      case 'advance-stage':
        controller.advanceStage();
        break;
      case 'purchase-upgrade':
        controller.purchaseUpgrade(actionTarget.dataset.upgradeId);
        break;
      case 'choose-ending':
        controller.chooseEnding(actionTarget.dataset.endingId);
        break;
      case 'close-eva':
        controller.closeEva();
        break;
      default:
        break;
    }
  });

  controller.subscribe(render);
  render();

  window.addEventListener('beforeunload', () => {
    controller.destroy();
    if (shooter) {
      shooter.destroy();
    }
  });
}

const root = document.getElementById('app');
if (root) {
  bootstrapColdMemory(root);
}