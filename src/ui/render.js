import { STORY_STAGES } from '../data/stages.js';
import { getDecodeRatio } from '../logic/progression.js';

function renderBootScreen() {
  return `
    <section class="console boot">
      <div class="boot__hero">
        <div>
          <div class="boot__eyebrow">Space Horror Idle Clicker</div>
          <h1 class="boot__title">COLD<br />MEMORY</h1>
          <p class="boot__subtitle">
            冷记忆是一款太空惊悚题材的放置点击游戏。玩家在复古飞船终端上恢复记忆、维持航行、执行 EVA 清障，逐步揭开克隆体与时间锚点实验的真相。
          </p>
        </div>

        <div class="boot__actions">
          <button class="button" data-action="wake-up">执行唤醒程序</button>
          <button class="button-secondary" type="button" disabled>Unity 移植规划中</button>
        </div>
      </div>

      <aside class="boot__sidebar">
        <article class="boot__card">
          <div class="eyebrow">Project Identity</div>
          <strong>COLD MEMORY / 冷记忆</strong>
          <span>当前版本为无构建依赖的 Web 原型，适合直接部署到 GitHub Pages，后续将作为 Unity 移植时的玩法与叙事参考。</span>
        </article>
        <article class="boot__card">
          <div class="eyebrow">Core Loop</div>
          <span>自动巡航累积航程</span>
          <span>手动解析记忆片段</span>
          <span>EVA 清障处理剧情阻塞</span>
          <span>回收能源，推进章节</span>
        </article>
        <article class="boot__card">
          <div class="eyebrow">Delivery</div>
          <span>无需打包工具</span>
          <span>支持 GitHub Pages 静态托管</span>
          <span>数据 / 逻辑 / 表现 已拆分</span>
        </article>
      </aside>
    </section>
  `;
}

function renderStoryLines(stage, revealedLines) {
  return stage.content
    .slice(0, revealedLines)
    .map((line, index) => {
      const classes = ['chapter__line'];
      if (index === revealedLines - 1) {
        classes.push('chapter__line--active');
      } else {
        classes.push('chapter__line--past');
      }

      if (line.startsWith('系统提示')) {
        classes.push('chapter__line--directive');
      }

      return `<p class="${classes.join(' ')}">${line}</p>`;
    })
    .join('');
}

function renderBlockedBox() {
  return `
    <div class="danger-box">
      <strong>Route Hazard Locked</strong>
      <p>检测到高密度碎片与异常磁场干扰，自动巡航与记忆解析已被迫挂起。</p>
      <p>必须进入 EVA 外部终端手动清理航道，才能继续推进剧情。</p>
    </div>
  `;
}

function renderDecodePanel(state, viewModel) {
  if (!viewModel.canDecode) {
    return '';
  }

  if (state.isDecoding) {
    return `
      <section class="action-panel">
        <div class="action-panel__header">
          <span>Parsing Memory Signal</span>
          <span>${Math.floor(getDecodeRatio(state))}%</span>
        </div>
        <div class="progress" style="--progress: ${getDecodeRatio(state)}%"><span></span></div>
      </section>
    `;
  }

  return `
    <section class="action-panel">
      <div class="action-panel__header">
        <span>Memory Parsing Ready</span>
        <span>${viewModel.stageProgress}</span>
      </div>
      <button class="button" data-action="decode">解析记忆片段</button>
    </section>
  `;
}

function renderControls(state, viewModel) {
  const autopilotClass = state.autoPilot ? 'control control--active' : 'control';
  const evaDisabled = viewModel.evaUnlocked ? '' : 'control--disabled';
  const evaClass = viewModel.blocked ? 'control-danger' : `control ${evaDisabled}`.trim();
  const evaLabel = viewModel.blocked ? '强制清障' : 'EVA 扫描';
  const evaHint = viewModel.blocked
    ? '航道被锁定。完成外部清障才能继续。'
    : viewModel.evaUnlocked
      ? '常规回收可补充 25% 能源。'
      : '继续恢复记忆后解锁 EVA。';
  const disabled = viewModel.evaUnlocked ? '' : 'disabled';

  return `
    <div class="controls">
      <button class="${autopilotClass}" data-action="toggle-autopilot">
        <strong>${state.autoPilot ? '停止巡航' : '自动巡航'}</strong>
        <span>${state.autoPilot ? '主引擎正在推进航程。' : '持续消耗能源换取航程推进。'}</span>
      </button>
      <button class="${evaClass}" data-action="open-eva" ${disabled}>
        <strong>${evaLabel}</strong>
        <span>${evaHint}</span>
      </button>
    </div>
  `;
}

function renderDashboard(state, viewModel) {
  const { stage } = viewModel;

  return `
    <section class="console dashboard">
      <header class="dashboard__header">
        <div class="brand">
          <div class="eyebrow">${stage.chapter} / PIONEER-04 TERMINAL</div>
          <h1>COLD MEMORY</h1>
          <p>${stage.summary}</p>
        </div>

        <div class="metrics">
          <article class="metric">
            <span class="metric__label">Voyage Distance</span>
            <span class="metric__value">${Math.floor(state.distance)} km</span>
            <span class="metric__hint">接近章节阈值时会触发剧情阻塞</span>
          </article>
          <article class="metric">
            <span class="metric__label">Power Core</span>
            <span class="metric__value">${Math.floor(state.energy)}%</span>
            <span class="metric__hint">自动巡航每跳会持续耗能</span>
          </article>
          <article class="metric">
            <span class="metric__label">Signal Strength</span>
            <span class="metric__value">${viewModel.signalStrength}%</span>
            <span class="metric__hint">信号越弱，真相越接近</span>
          </article>
        </div>
      </header>

      <div class="dashboard__content">
        <article class="chapter">
          <div class="chapter__header">
            <div>
              <div class="eyebrow">Recovered Memory Archive</div>
              <div class="title">${stage.title}</div>
            </div>
            <div class="eyebrow">Chunk ${viewModel.stageCode} / ${STORY_STAGES.length}</div>
          </div>

          <div class="chapter__body">
            ${renderStoryLines(stage, state.revealedLines)}
            ${viewModel.blocked ? renderBlockedBox() : ''}
          </div>

          ${renderDecodePanel(state, viewModel)}
        </article>

        <aside class="aside">
          <section class="log">
            <div class="log__header">
              <span>Recent Events</span>
              <span>${viewModel.logState}</span>
            </div>
            ${state.recentEvents.map((entry) => `<p>${entry}</p>`).join('')}
          </section>

          <section class="mission">
            <div class="mission__header">
              <span>Current Objectives</span>
              <span>ops</span>
            </div>
            <ul>
              <li>维持能源储备，避免巡航中断</li>
              <li>手动解析当前章节的全部记忆片段</li>
              <li>在 EVA 环节清除阻塞航道的碎片</li>
              <li>逐章推进，定位先驱者-04 的真相</li>
            </ul>
          </section>

          ${renderControls(state, viewModel)}
        </aside>
      </div>

      <div class="footer-note">Web prototype for GitHub Pages now, Unity migration later.</div>
    </section>
  `;
}

function renderModal(state, viewModel) {
  if (!state.isEvaOpen) {
    return '';
  }

  return `
    <section class="modal">
      <div class="modal__card">
        <div class="modal__header">
          <div>
            <div class="eyebrow">External Terminal</div>
            <div class="title">${viewModel.blocked ? '航道强制清障' : '常规残骸回收'}</div>
          </div>
          ${viewModel.blocked ? '' : '<button data-action="close-eva" aria-label="关闭 EVA 终端">×</button>'}
        </div>
        <div data-shooter-root></div>
        <p class="modal__hint">
          ${viewModel.blocked
            ? '完成本次外部清障后，下一章节将自动解锁。'
            : '常规回收作业可直接补充 25% 飞船能源。'}
        </p>
      </div>
    </section>
  `;
}

export function renderApp(root, state, viewModel) {
  root.innerHTML = `
    <main class="shell">
      ${state.screen === 'boot' ? renderBootScreen() : renderDashboard(state, viewModel)}
      ${renderModal(state, viewModel)}
    </main>
  `;
}