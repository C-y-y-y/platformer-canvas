class Enemy {
  constructor(x, y, width, height, health, damage) {
    this.position = { x: x, y: y };
    this.width = width;
    this.height = height;

    this.health = health;
    this.maxHealth = health;
    this.damage = damage;

    this.isDead = false;
    this.isInvulnerable = false;

    this.damageFlashTime = 0;
    this.damageFlashDuration = TIMINGS.DAMAGE_FLASH_DURATION;

    this.hasDealtDamageToPlayer = false;
  }

  draw(ctx, devMode = false) {
    if (this.damageFlashTime > 0) {
      ctx.fillStyle = COLORS.DAMAGE_FLASH;
    } else {
      ctx.fillStyle = this.getColor();
    }

    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    if (devMode) {
      this.drawHealthBar(ctx);
      this.drawDebugInfo(ctx);
    }
  }

  getColor() {
    return '#e67e22';
  }

  drawHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = DEBUG.HEALTH_BAR_HEIGHT;
    const barX = this.position.x;
    const barY = this.position.y - DEBUG.HEALTH_BAR_OFFSET;

    ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthPercentage = this.health / this.maxHealth;
    ctx.fillStyle = COLORS.HEALTH_BAR_FG;
    ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
  }

  drawDebugInfo(ctx) {
    if (this.aggroRange) {
      this.drawDebugCircle(ctx, this.aggroRange, COLORS.AGGRO_RANGE);
    }
    if (this.attackRange) {
      this.drawDebugCircle(ctx, this.attackRange, COLORS.ATTACK_RANGE);
    }
    if (this.attackHitbox) {
      ctx.fillStyle = COLORS.ATTACK_HITBOX;
      ctx.fillRect(this.attackHitbox.x, this.attackHitbox.y, this.attackHitbox.width, this.attackHitbox.height);
    }
    if (this.state) {
      ctx.fillStyle = '#fff';
      ctx.font = DEBUG.FONT_SIZE;
      ctx.fillText(this.state, this.position.x, this.position.y - DEBUG.STATE_TEXT_OFFSET);
    }
  }

  drawDebugCircle(ctx, radius, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      radius,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  update() {
    if (this.damageFlashTime > 0) {
      this.damageFlashTime -= TIMINGS.FRAME_TIME;
    }

    if (!this.isAttacking()) {
      this.hasDealtDamageToPlayer = false;
    }
  }

  isAttacking() {
    return false;
  }

  takeDamage(amount) {
    if (this.isDead || this.isInvulnerable) return;

    this.health -= amount;
    this.damageFlashTime = this.damageFlashDuration;

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }

  checkPlayerCollision(player) {
    const playerRect = {
      x: player.position.x,
      y: player.position.y,
      width: player.width,
      height: player.height
    };
    return checkCollision(this.getRect(), playerRect);
  }

  getRect() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    };
  }

  getDistanceToPlayer(player) {
    const dx = (player.position.x + player.width / 2) - (this.position.x + this.width / 2);
    const dy = (player.position.y + player.height / 2) - (this.position.y + this.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  getHorizontalDistanceToPlayer(player) {
    return (player.position.x + player.width / 2) - (this.position.x + this.width / 2);
  }
}