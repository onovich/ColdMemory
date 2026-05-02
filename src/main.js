import { GameController } from './logic/game-controller.js';
import { renderApp } from './ui/render.js';
import { DebrisShooter } from './ui/shooter.js';

export function bootstrapColdMemory(root) {
  const controller = new GameController();
  let shooter = null;

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
      targetHits: viewModel.blocked ? viewModel.stage.combatClearTarget : 5,
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
    renderApp(root, state, viewModel);
    syncShooter();
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