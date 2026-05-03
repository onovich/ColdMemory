import { STORY_STAGES } from '../data/stages.js';
import { getDecodeRatio } from '../logic/progression.js';

function icon(name, className = '') {
  // Use absolute time to calculate animation delay so the spin animation remains continuous across frequent DOM replacements
  const delay = className.includes('spin') ? `style="animation-delay: -${(Date.now() % 1000) / 1000}s"` : '';
  const common = `class="icon ${className}" ${delay} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const icons = {
    cpu: `<svg ${common}><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"></path></svg>`,
    loader: `<svg ${common}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`,
    terminal: `<svg ${common}><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
    archive: `<svg ${common}><rect x="3" y="4" width="18" height="4" rx="1"></rect><path d="M5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"></path><path d="M10 12h4"></path></svg>`,
    navigation: `<svg ${common}><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`,
    alert: `<svg ${common}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
    crosshair: `<svg ${common}><circle cx="12" cy="12" r="7"></circle><path d="M12 5v2M12 17v2M5 12h2M17 12h2"></path></svg>`,
    x: `<svg ${common}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    lock: `<svg ${common}><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 1 1 8 0v3"></path></svg>`,
    radio: `<svg ${common}><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.48"></path><path d="M7.76 16.24a6 6 0 0 1 0-8.48"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M4.93 19.07a10 10 0 0 1 0-14.14"></path></svg>`
  };

  return icons[name] ?? '';
}

function renderBootScreen() {
  return `
    <div class="cm-screen__boot pulse-soft">
      <div class="cm-boot__cpu">${icon('cpu', 'icon--xl')}</div>
      <div class="cm-boot__title-group">
        <h1 class="cm-boot__title">冷记忆</h1>
        <p class="cm-boot__subtitle">Cold Memory System v4.0</p>
      </div>
      <button class="cm-boot__button" data-action="wake-up">[ 接入意识终端 ]</button>
    </div>
  `;
}

function renderStoryLines(stage, revealedLines) {
  return stage.content
    .slice(0, revealedLines)
    .map((line, index) => {
      const className = index === revealedLines - 1 ? 'cm-story__line cm-story__line--active' : 'cm-story__line cm-story__line--past';
      return `<p class="${className}">${line}</p>`;
    })
    .join('');
}

function renderBlockedBox() {
  return `
    <div class="cm-blocked">
      <div class="cm-blocked__title">${icon('alert')}<span>致命阻塞</span></div>
      <p>无法在当前环境下同步数据。外部传感器锁定高密度物质。</p>
      <button class="cm-blocked__button" data-action="open-eva">手动清空航道</button>
    </div>
  `;
}

function renderDecodePanel(state, viewModel) {
  if (state.isDecoding) {
    return `
      <div class="cm-decode-panel">
        <div class="cm-decode-panel__header">
          <span><span class="cm-spinner">${icon('loader', 'spin')}</span>数据同步中...</span>
          <span>${Math.floor(getDecodeRatio(state))}%</span>
        </div>
        <div class="cm-progress"><span style="width:${getDecodeRatio(state)}%"></span></div>
      </div>
    `;
  }

  if (!viewModel.canDecode) {
    return '';
  }

  return `
    <div class="cm-decode-panel">
      <button class="cm-decode-button" data-action="decode">[ 解构下一组记录 ]</button>
    </div>
  `;
}

function renderTerminalView(state, viewModel) {
  return `
    <div class="cm-main-view">
      <div class="cm-section-header">
        <h2 class="cm-section-title">${icon('terminal')}实时会话: ${viewModel.stage.title}</h2>
        <span class="cm-section-code">DATA_CHUNK: 0${state.stageIndex + 1}</span>
      </div>
      <div class="cm-scroll custom-scrollbar">
        ${renderStoryLines(viewModel.stage, state.revealedLines)}
        ${viewModel.blocked ? renderBlockedBox() : ''}
      </div>
      ${!viewModel.blocked && state.revealedLines < viewModel.stage.content.length ? renderDecodePanel(state, viewModel) : ''}
    </div>
  `;
}

function renderArchiveView(state) {
  const visibleStages = STORY_STAGES.slice(0, state.stageIndex + 1)
    .map((stage, stageIndex) => {
      const lines = stage.content
        .slice(0, stageIndex < state.stageIndex ? stage.content.length : state.revealedLines)
        .map((line) => `<p>${line}</p>`)
        .join('');

      return `
        <div class="cm-archive-entry">
          <h3>${stage.title}</h3>
          <div class="cm-archive-entry__body">${lines}</div>
        </div>
      `;
    })
    .join('');

  const emptyState = state.stageIndex === 0 && state.revealedLines === 1
    ? '<p class="cm-archive-empty">数据库尚无更多记录...</p>'
    : '';

  return `
    <div class="cm-main-view cm-main-view--archive">
      <div class="cm-section-header">
        <h2 class="cm-section-title">${icon('archive')}历史记忆数据库</h2>
      </div>
      <div class="cm-scroll custom-scrollbar cm-archive-scroll">
        ${visibleStages}
        ${emptyState}
      </div>
    </div>
  `;
}

function renderFooterControls(state, viewModel) {
  const autoActive = state.gameState === 'AUTO_PILOT' ? 'cm-nav-button--active' : '';
  const evaDisabled = !viewModel.evaUnlocked ? 'cm-nav-button--disabled' : '';
  const evaBlocked = viewModel.blocked ? 'cm-nav-button--danger bounce-soft' : '';
  const archiveActive = state.currentView === 'ARCHIVE' ? 'cm-nav-button--selected' : '';

  return `
    <div class="cm-footer">
      <button class="cm-nav-button cm-nav-button--wide ${autoActive}" data-action="toggle-autopilot">
        ${icon('navigation')}
        <span>${state.gameState === 'AUTO_PILOT' ? '停止航行' : '自动巡航'}</span>
      </button>
      <button class="cm-nav-button ${evaDisabled} ${evaBlocked}" data-action="open-eva" ${viewModel.evaUnlocked ? '' : 'disabled'}>
        ${viewModel.evaUnlocked ? icon('crosshair') : icon('lock')}
        <span>EVA</span>
      </button>
      <button class="cm-nav-button ${archiveActive}" data-action="toggle-view">
        ${state.currentView === 'TERMINAL' ? icon('archive') : icon('terminal')}
        <span>${state.currentView === 'TERMINAL' ? '存档' : '终端'}</span>
      </button>
    </div>
  `;
}

function renderActiveScreen(state, viewModel) {
  return `
    <div class="cm-status">
      <div class="cm-status__top">
        <div>
          <div class="cm-status__label">距离目标</div>
          <div class="cm-status__value">${Math.floor(state.distance)} <span>KM</span></div>
        </div>
        <div class="cm-status__right">
          <div class="cm-status__label">核心能级</div>
          <div class="cm-status__value">${Math.floor(state.energy)}%</div>
        </div>
      </div>
      <div class="cm-energy-bar"><span style="width:${state.energy}%"></span></div>
      <div class="cm-status__hint">${icon('loader', state.gameState === 'AUTO_PILOT' ? 'spin' : '')}母亲指令: ${viewModel.motherHint}</div>
    </div>

    <div class="cm-content">
      ${state.currentView === 'TERMINAL' ? renderTerminalView(state, viewModel) : renderArchiveView(state)}
    </div>

    ${renderFooterControls(state, viewModel)}
  `;
}

function renderModal(state, viewModel) {
  if (!state.isEvaOpen) {
    return '';
  }

  return `
    <div class="cm-modal">
      <div class="cm-modal__header">
        <h3>${icon('radio', 'pulse-soft')}外部干预终端</h3>
        ${viewModel.blocked ? '' : '<button data-action="close-eva" aria-label="关闭 EVA 终端">' + icon('x') + '</button>'}
      </div>
      <div class="cm-modal__body" data-shooter-root></div>
      <div class="cm-modal__footer">
        ${viewModel.blocked
          ? '严重警告: 核心航道发现实体。清空该区域以恢复自动航行与数据同步。'
          : '日常巡检: 清理区域碎片可稳定核心能级 (+30%)。右上角断开连接。'}
      </div>
    </div>
  `;
}

export function renderApp(root, state, viewModel) {
  root.innerHTML = `
    <main class="cm-shell ${state.glitch ? 'cm-shell--glitch' : ''}">
      <section class="cm-device ${state.glitch ? 'cm-device--glitch' : ''}">
        <div class="cm-crt-lines"></div>
        <div class="cm-crt-vignette"></div>
        ${state.gameState === 'BOOT' ? renderBootScreen() : renderActiveScreen(state, viewModel)}
        ${renderModal(state, viewModel)}
      </section>
    </main>
  `;
}