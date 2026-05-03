import { STORY_STAGES } from '../data/stages.js';
import { UPGRADE_CONFIG, formatUpgradeEffect, getNextUpgradeLevel, getUpgradeLevel } from '../data/upgrades.js';
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

function renderNode(node, isLatest) {
  if (node.type === 'critical') {
    return `
      <article class="cm-story-card cm-story-card--critical">
        <div class="cm-story-card__eyebrow">关键剧情</div>
        <h3 class="cm-story-card__title">${node.title}</h3>
        <p class="cm-story-card__body cm-story-card__body--critical">${node.text}</p>
      </article>
    `;
  }

  const className = isLatest ? 'cm-story-card cm-story-card--active' : 'cm-story-card cm-story-card--past';
  return `
    <article class="${className}">
      <div class="cm-story-card__eyebrow">普通剧情</div>
      <p class="cm-story-card__body">${node.text}</p>
      <div class="cm-story-card__reward">+${node.rewardPoints} 记忆点</div>
    </article>
  `;
}

function renderStoryLines(nodes) {
  return nodes
    .map((node, index) => renderNode(node, index === nodes.length - 1 && node.type === 'normal'))
    .join('');
}

function renderBlockedBox(viewModel) {
  return `
    <div class="cm-blocked">
      <div class="cm-blocked__title">${icon('alert')}<span>致命阻塞</span></div>
      <p>${viewModel.criticalBattle.description}</p>
      <div class="cm-blocked__meta">清除目标: ${viewModel.criticalBattle.targetHits} / 奖励: ${viewModel.criticalBattle.rewardPoints} 记忆点 + 1 关键证词</div>
      <button class="cm-blocked__button" data-action="open-eva">手动清空航道</button>
    </div>
  `;
}

function renderCriticalUnlockPanel(state, viewModel) {
  const stage = viewModel.stage;
  const evidenceDisabled = viewModel.canUnlockCriticalWithEvidence ? '' : 'disabled';
  const pointsDisabled = viewModel.canUnlockCriticalWithPoints ? '' : 'disabled';

  return `
    <div class="cm-critical-panel">
      <div class="cm-critical-panel__eyebrow">关键剧情待接入</div>
      <h3>${stage.criticalNode.title}</h3>
      <p>${stage.criticalNode.text}</p>
      <div class="cm-critical-panel__actions">
        <button class="cm-secondary-button" data-action="unlock-critical-evidence" ${evidenceDisabled}>
          使用关键证词 (${stage.criticalNode.requiredEvidence})
        </button>
        <button class="cm-secondary-button" data-action="unlock-critical-points" ${pointsDisabled}>
          消耗 ${stage.criticalNode.unlockCostPoints} 点强制接入
        </button>
      </div>
    </div>
  `;
}

function renderPostCriticalPanel(state, viewModel) {
  const stage = viewModel.stage;
  if (state.stageIndex === STORY_STAGES.length - 1) {
    if (state.endingState) {
      const ending = stage.criticalNode.endingChoices.find((choice) => choice.id === state.endingState);
      if (!ending) {
        return '';
      }

      return `
        <div class="cm-ending-panel">
          <div class="cm-critical-panel__eyebrow">终局已提交</div>
          <h3>${ending.resultTitle}</h3>
          <div class="cm-ending-panel__body">
            ${ending.resultLines.map((line) => `<p>${line}</p>`).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="cm-ending-panel">
        <div class="cm-critical-panel__eyebrow">最终裁决</div>
        <h3>${stage.criticalNode.title}</h3>
        <div class="cm-ending-choice-list">
          ${stage.criticalNode.endingChoices.map((choice) => `
            <button class="cm-ending-choice" data-action="choose-ending" data-ending-id="${choice.id}">
              <strong>${choice.title}</strong>
              <span>${choice.summary}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="cm-critical-panel">
      <div class="cm-critical-panel__eyebrow">关键剧情已归档</div>
      <h3>${stage.criticalNode.title}</h3>
      <p>该章节的关键判断已经完成，可以继续接入下一章。</p>
      <div class="cm-critical-panel__actions">
        <button class="cm-secondary-button" data-action="advance-stage">接入下一章</button>
      </div>
    </div>
  `;
}

function renderUpgradePanel(state) {
  const unlockedUpgrades = UPGRADE_CONFIG.filter((upgrade) => state.stageIndex + 1 >= upgrade.unlockStage);
  return `
    <section class="cm-upgrades">
      <div class="cm-subsection-title">系统升级</div>
      <div class="cm-upgrade-list">
        ${unlockedUpgrades.map((upgrade) => {
          const level = getUpgradeLevel(state, upgrade.id);
          const nextLevel = getNextUpgradeLevel(state, upgrade.id);
          const disabled = !upgrade.implemented || !nextLevel || state.points < nextLevel.cost ? 'disabled' : '';
          return `
            <article class="cm-upgrade-card ${upgrade.implemented ? '' : 'cm-upgrade-card--locked'}">
              <div class="cm-upgrade-card__top">
                <div>
                  <h4>${upgrade.title}</h4>
                  <p>${upgrade.summary}</p>
                </div>
                <span>Lv.${level}</span>
              </div>
              <div class="cm-upgrade-card__effect">${formatUpgradeEffect(upgrade.id, nextLevel)}</div>
              <button class="cm-upgrade-card__button" data-action="purchase-upgrade" data-upgrade-id="${upgrade.id}" ${disabled}>
                ${!upgrade.implemented ? '待开发' : nextLevel ? `升级 ${nextLevel.cost} 点` : '已满级'}
              </button>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderRecentEvents(state) {
  return `
    <section class="cm-events">
      <div class="cm-subsection-title">最近事件</div>
      <div class="cm-events__list">
        ${state.recentEvents.map((eventText) => `<p>${eventText}</p>`).join('')}
      </div>
    </section>
  `;
}

function renderActionPanel(state, viewModel) {
  if (state.criticalUnlocked) {
    return renderPostCriticalPanel(state, viewModel);
  }

  if (viewModel.blocked) {
    if (state.battleCleared || viewModel.canUnlockCriticalWithEvidence || viewModel.canUnlockCriticalWithPoints) {
      return renderCriticalUnlockPanel(state, viewModel);
    }

    return renderBlockedBox(viewModel);
  }

  return renderDecodePanel(state, viewModel);
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
        <div class="cm-stage-summary">${viewModel.stage.summary}</div>
        ${renderStoryLines(viewModel.visibleNodes)}
        ${renderActionPanel(state, viewModel)}
        ${renderUpgradePanel(state)}
        ${renderRecentEvents(state)}
      </div>
    </div>
  `;
}

function renderArchiveView(state) {
  const visibleStages = STORY_STAGES.slice(0, state.stageIndex + 1)
    .map((stage, stageIndex) => {
      const normalCount = stageIndex < state.stageIndex ? stage.normalNodes.length : Math.min(state.revealedNormalNodes, stage.normalNodes.length);
      const nodes = stage.normalNodes
        .slice(0, normalCount)
        .map((node) => `<p>${node.text}</p>`)
        .join('');
      const critical = stageIndex < state.stageIndex || (stageIndex === state.stageIndex && state.criticalUnlocked)
        ? `<div class="cm-archive-entry__critical"><strong>${stage.criticalNode.title}</strong><p>${stage.criticalNode.text}</p></div>`
        : '';

      return `
        <div class="cm-archive-entry">
          <h3>${stage.title}</h3>
          <div class="cm-archive-entry__body">${nodes}${critical}</div>
        </div>
      `;
    })
    .join('');

  const emptyState = state.stageIndex === 0 && state.revealedNormalNodes === 1
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
      <div class="cm-status__economy">
        <div class="cm-economy-chip"><strong>${state.points}</strong><span>记忆点</span></div>
        <div class="cm-economy-chip"><strong>${state.evidence}</strong><span>关键证词</span></div>
        <div class="cm-economy-chip"><strong>${viewModel.autoPointRate.total.toFixed(2)}</strong><span>点/秒</span></div>
      </div>
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
          ? `${viewModel.criticalBattle.label}: ${viewModel.criticalBattle.description}`
          : '日常巡检: 清理区域碎片可稳定核心能级并回收记忆点。右上角断开连接。'}
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