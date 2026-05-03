export class DebrisShooter {
  constructor({ mountNode, targetHits, combatMode, onComplete, onShotAttempt }) {
    this.mountNode = mountNode;
    this.targetHits = targetHits;
    this.combatMode = combatMode;
    this.onComplete = onComplete;
    this.onShotAttempt = onShotAttempt;
    this.score = 0;
    this.frame = 0;
    this.playerX = 240;
    this.bullets = [];
    this.targets = [];
    this.animationFrame = null;

    this.handleMove = this.handleMove.bind(this);
    this.loop = this.loop.bind(this);

    this.render();
    this.start();
  }

  render() {
    const progressText = this.combatMode
      ? `清除: <strong data-score>${this.score}</strong> / ${this.targetHits}`
      : `回收命中: <strong data-score>${this.score}</strong>`;

    this.mountNode.innerHTML = `
      <div class="shooter">
        <div class="shooter__meta">
          <span>系统: ${this.combatMode ? '作战模式' : '探索模式'}</span>
          <span>${progressText}</span>
        </div>
        <canvas width="280" height="380"></canvas>
      </div>
    `;

    this.canvas = this.mountNode.querySelector('canvas');
    this.scoreNode = this.mountNode.querySelector('[data-score]');
    this.context = this.canvas.getContext('2d');
  }

  getScore() {
    return this.score;
  }

  start() {
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('touchmove', this.handleMove, { passive: true });
    this.loop();
  }

  destroy() {
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('touchmove', this.handleMove);
  }

  handleMove(event) {
    const pointer = event.touches ? event.touches[0] : event;
    const rect = this.canvas.getBoundingClientRect();
    const nextX = pointer.clientX - rect.left;
    const scaleX = this.canvas.width / rect.width;
    this.playerX = Math.max(20, Math.min(this.canvas.width - 20, nextX * scaleX));
  }

  loop() {
    this.frame += 1;
    this.drawBackdrop();
    this.spawnTargets();
    this.spawnBullets();
    this.updateBullets();
    this.updateTargets();
    this.drawPlayer();
    this.detectHits();

    if (this.combatMode && this.score >= this.targetHits) {
      this.onComplete(this.score);
      return;
    }

    this.animationFrame = window.requestAnimationFrame(this.loop);
  }

  drawBackdrop() {
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  spawnTargets() {
    const spawnRate = this.combatMode ? 30 : 50;
    if (this.frame % spawnRate !== 0) {
      return;
    }

    this.targets.push({
      id: `${this.frame}-${Math.random()}`,
      x: Math.random() * (this.canvas.width - 30) + 15,
      y: -20,
      size: 18,
      speed: 1.5 + Math.random() * 2
    });
  }

  spawnBullets() {
    if (this.frame % 10 !== 0) {
      return;
    }

    if (typeof this.onShotAttempt === 'function' && !this.onShotAttempt()) {
      return;
    }

    this.bullets.push({
      id: `b-${this.frame}-${Math.random()}`,
      x: this.playerX,
      y: this.canvas.height - 52
    });
  }

  updateBullets() {
    this.bullets = this.bullets.filter((bullet) => bullet.y > -24);
    this.bullets.forEach((bullet) => {
      bullet.y -= 8;
      this.context.fillStyle = '#4af626';
      this.context.fillRect(bullet.x - 1, bullet.y, 2, 8);
    });
  }

  updateTargets() {
    this.targets = this.targets.filter((target) => target.y < this.canvas.height + 30);
    this.targets.forEach((target) => {
      target.y += target.speed;
      this.context.strokeStyle = '#4af626';
      this.context.lineWidth = 1.5;
      this.context.strokeRect(target.x - target.size / 2, target.y - target.size / 2, target.size, target.size);
    });
  }

  drawPlayer() {
    const y = this.canvas.height - 40;
    this.context.strokeStyle = '#4af626';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(this.playerX, y - 12);
    this.context.lineTo(this.playerX - 12, y + 12);
    this.context.lineTo(this.playerX + 12, y + 12);
    this.context.closePath();
    this.context.stroke();
  }

  detectHits() {
    const hitBullets = new Set();
    const hitTargets = new Set();

    this.bullets.forEach((bullet) => {
      this.targets.forEach((target) => {
        if (hitTargets.has(target.id)) {
          return;
        }

        const withinX = Math.abs(bullet.x - target.x) < 12;
        const withinY = Math.abs(bullet.y - target.y) < 12;
        if (withinX && withinY) {
          hitBullets.add(bullet.id);
          hitTargets.add(target.id);
          this.score += 1;
          this.scoreNode.textContent = String(this.score);
        }
      });
    });

    if (hitBullets.size > 0) {
      this.bullets = this.bullets.filter((bullet) => !hitBullets.has(bullet.id));
    }

    if (hitTargets.size > 0) {
      this.targets = this.targets.filter((target) => !hitTargets.has(target.id));
    }
  }
}