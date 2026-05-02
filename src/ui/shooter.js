export class DebrisShooter {
  constructor({ mountNode, targetHits, combatMode, onComplete }) {
    this.mountNode = mountNode;
    this.targetHits = targetHits;
    this.combatMode = combatMode;
    this.onComplete = onComplete;
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
    this.mountNode.innerHTML = `
      <div class="shooter">
        <div class="shooter__meta">
          <span>mode: ${this.combatMode ? 'hazard purge' : 'routine scan'}</span>
          <span>removed: <strong data-score>${this.score}</strong> / ${this.targetHits}</span>
        </div>
        <canvas width="480" height="480"></canvas>
      </div>
    `;

    this.canvas = this.mountNode.querySelector('canvas');
    this.scoreNode = this.mountNode.querySelector('[data-score]');
    this.context = this.canvas.getContext('2d');
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

    if (this.score >= this.targetHits) {
      this.onComplete();
      return;
    }

    this.animationFrame = window.requestAnimationFrame(this.loop);
  }

  drawBackdrop() {
    this.context.fillStyle = '#02050a';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let index = 0; index < 24; index += 1) {
      const x = (index * 91 + this.frame * 0.7) % this.canvas.width;
      const y = (index * 47 + this.frame * 1.3) % this.canvas.height;
      this.context.fillStyle = index % 5 === 0 ? '#ffd36a' : '#8cf0ff';
      this.context.fillRect(x, y, 2, 2);
    }
  }

  spawnTargets() {
    const spawnRate = this.combatMode ? 28 : 40;
    if (this.frame % spawnRate !== 0) {
      return;
    }

    this.targets.push({
      id: `${this.frame}-${Math.random()}`,
      x: 20 + Math.random() * (this.canvas.width - 40),
      y: -24,
      size: 16 + Math.random() * 10,
      speed: 1.6 + Math.random() * (this.combatMode ? 2 : 1.2)
    });
  }

  spawnBullets() {
    if (this.frame % 10 !== 0) {
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
      this.context.fillStyle = '#b6f7ff';
      this.context.fillRect(bullet.x - 1.5, bullet.y, 3, 14);
    });
  }

  updateTargets() {
    this.targets = this.targets.filter((target) => target.y < this.canvas.height + 30);
    this.targets.forEach((target) => {
      target.y += target.speed;
      this.context.strokeStyle = this.combatMode ? '#ff6a7a' : '#8cf0ff';
      this.context.lineWidth = 1.5;
      this.context.strokeRect(target.x - target.size / 2, target.y - target.size / 2, target.size, target.size);
    });
  }

  drawPlayer() {
    const y = this.canvas.height - 34;
    this.context.strokeStyle = '#8cf0ff';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(this.playerX, y - 14);
    this.context.lineTo(this.playerX - 14, y + 14);
    this.context.lineTo(this.playerX + 14, y + 14);
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

        const withinX = bullet.x >= target.x - target.size / 2 && bullet.x <= target.x + target.size / 2;
        const withinY = bullet.y >= target.y - target.size / 2 && bullet.y <= target.y + target.size / 2;
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