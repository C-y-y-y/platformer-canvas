class Player {
  constructor(x, y) {
    this.position = { x: x, y: y };
    this.width = PLAYER.WIDTH;
    this.height = PLAYER.HEIGHT;
    this.velocity = { x: 0, y: 0 };
    this.spawnPoint = { x: x, y: y };

    this.health = PLAYER.HEALTH;
    this.maxHealth = PLAYER.HEALTH;

    this.speed = PLAYER.SPEED;
    this.maxSpeed = PLAYER.MAX_SPEED;
    this.airAcceleration = PLAYER.AIR_ACCELERATION;
    this.airFriction = PLAYER.AIR_FRICTION;
    this.gravity = PHYSICS.GRAVITY;

    this.jumpPower = PHYSICS.PLAYER_JUMP_POWER;
    this.crouchJumpPower = PHYSICS.PLAYER_CROUCH_JUMP_POWER;

    this.isCrouching = false;
    this.normalHeight = PLAYER.HEIGHT;
    this.crouchHeight = PLAYER.HEIGHT / 2;
    this.crouchSpeedMultiplier = PLAYER.CROUCH_SPEED_MULTIPLIER;

    this.isDashing = false;
    this.canDash = true;
    this.dashSpeed = PLAYER.DASH_SPEED;
    this.dashDuration = PLAYER.DASH_DURATION;
    this.dashIframes = PLAYER.DASH_IFRAMES;
    this.isInvulnerable = false;
    this.dashCooldown = PLAYER.DASH_COOLDOWN;
    this.dashCooldownTimer = 0;

    this.isGrounded = false;
    this.facingDirection = 1;
    this.weapon = 'sword';

    this.isAttacking = false;
    this.attackCooldown = 0;
    this.hasDealtDamage = false;

    this.isDead = false;
    this.deathZoneY = PLAYER.DEATH_ZONE_Y;
    this.attackStartTime = 0;

    this.spriteSheet = null;
    this.initSpriteConfig();
  }

  initSpriteConfig() {
    this.spriteConfig = {
      sheetWidth: 1680,
      sheetHeight: 512,
      cols: 5,
      rows: 2,
      spriteWidth: 336,
      spriteHeight: 256,
      sprites: {
        idle: { col: 0, row: 0 },
        run: { col: 1, row: 0 },
        jump: { col: 2, row: 0 },
        crouch: { col: 3, row: 0 },
        dash: { col: 4, row: 0 },
        attackSword: { col: 0, row: 1 },
        attackSpear: { col: 1, row: 1 },
        attackHammer: { col: 2, row: 1 },
        hurt: { col: 3, row: 1 },
        death: { col: 4, row: 1 }
      }
    };

    this.render = { w: 84, h: 64 };

    this.spriteOffsets = {
      idle: { ox: -18, oy: 0 },
      run: { ox: -18, oy: 0 },
      jump: { ox: -18, oy: 0 },
      crouch: { ox: -18, oy: -32 },
      dash: { ox: -18, oy: 0 },
      attackSword: { ox: -18, oy: 0 },
      attackSpear: { ox: -18, oy: 0 },
      attackHammer: { ox: -18, oy: 0 },
      hurt: { ox: -18, oy: 0 },
      death: { ox: -18, oy: 0 }
    };
  }

  loadSpriteSheet(image) {
    this.spriteSheet = image;
    this.spriteConfig.sheetWidth = image.naturalWidth;
    this.spriteConfig.sheetHeight = image.naturalHeight;
    this.spriteConfig.spriteWidth = Math.floor(image.naturalWidth / this.spriteConfig.cols);
    this.spriteConfig.spriteHeight = Math.floor(image.naturalHeight / this.spriteConfig.rows);
  }

  takeDamage(amount) {
    if (this.isInvulnerable || this.isDead) return;

    this.health -= amount;

    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  draw(ctx) {
    if (this.isInvulnerable) {
      ctx.globalAlpha = Math.sin(Date.now() / 50) * 0.5 + 0.5;
    }

    if (!this.spriteSheet || !this.spriteSheet.complete) {
      ctx.fillStyle = '#3498db';
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      ctx.globalAlpha = 1.0;
      return;
    }

    const spriteName = this.getCurrentSprite();
    const o = this.spriteOffsets[spriteName] || this.spriteOffsets.idle;
    const dx = this.position.x + o.ox;
    const dy = this.position.y + o.oy;

    const sprite = this.spriteConfig.sprites[spriteName];
    const sx = sprite.col * this.spriteConfig.spriteWidth;
    const sy = sprite.row * this.spriteConfig.spriteHeight;

    ctx.save();

    if (this.facingDirection === -1) {
      ctx.translate(dx + this.render.w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.spriteSheet,
        sx, sy,
        this.spriteConfig.spriteWidth,
        this.spriteConfig.spriteHeight,
        0, 0,
        this.render.w, this.render.h
      );
    } else {
      ctx.drawImage(
        this.spriteSheet,
        sx, sy,
        this.spriteConfig.spriteWidth,
        this.spriteConfig.spriteHeight,
        dx, dy,
        this.render.w, this.render.h
      );
    }

    ctx.restore();
    ctx.globalAlpha = 1.0;
  }

  getCurrentSprite() {
    if (this.isDead) return 'death';
    if (this.isAttacking) {
      if (this.weapon === 'sword') return 'attackSword';
      if (this.weapon === 'spear') return 'attackSpear';
      if (this.weapon === 'hammer') return 'attackHammer';
    }
    if (this.isDashing) return 'dash';
    if (this.isCrouching) return 'crouch';
    if (!this.isGrounded) return 'jump';
    if (Math.abs(this.velocity.x) > 0.1) return 'run';
    return 'idle';
  }

  update(platforms = [], levelBounds = null) {
    this.updateDashCooldown();
    this.handleCrouch();
    this.handleMovement();
    this.handleDash();
    this.handleJump();
    this.handleAttack();
    this.applyPhysics();
    this.handleCollisions(platforms);
    this.constrainToLevel(levelBounds);
    this.checkDeathZone();
  }

  constrainToLevel(levelBounds) {
    if (!levelBounds) return;

    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = 0;
    }

    if (this.position.x + this.width > levelBounds.width) {
      this.position.x = levelBounds.width - this.width;
      this.velocity.x = 0;
    }
  }

  handleCrouch() {
    if (!this.isGrounded) return;

    const crouchKey = keys.s || keys.alt;

    if (crouchKey && !this.isCrouching) {
      const heightDiff = this.normalHeight - this.crouchHeight;
      this.position.y += heightDiff;
      this.height = this.crouchHeight;
      this.isCrouching = true;
    } else if (!crouchKey && this.isCrouching) {
      const heightDiff = this.normalHeight - this.crouchHeight;
      this.position.y -= heightDiff;
      this.height = this.normalHeight;
      this.isCrouching = false;
    }
  }

  handleDash() {
    if (!keys.shift || !this.canDash || !this.isGrounded) return;

    this.startDash();
  }

  startDash() {
    this.isDashing = true;
    this.canDash = false;
    this.isInvulnerable = true;
    this.dashCooldownTimer = this.dashCooldown;

    const direction = this.facingDirection;
    this.velocity.x = this.dashSpeed * direction;

    setTimeout(() => this.isDashing = false, this.dashDuration);
    setTimeout(() => this.isInvulnerable = false, this.dashIframes);
    setTimeout(() => this.canDash = true, this.dashCooldown);
  }

  updateDashCooldown() {
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= TIMINGS.FRAME_TIME;
      if (this.dashCooldownTimer < 0) this.dashCooldownTimer = 0;
    }
  }

  getDashCooldownPercent() {
    if (this.canDash) return 1;
    return 1 - (this.dashCooldownTimer / this.dashCooldown);
  }

  handleMovement() {
    if (this.isDashing) return;
    if (this.isGrounded) {
      this.handleGroundMovement();
    } else {
      this.handleAirMovement();
    }
  }

  handleGroundMovement() {
    const currentSpeed = this.isCrouching
      ? this.speed * this.crouchSpeedMultiplier
      : this.speed;

    if (keys.d && keys.lastHorizontal === 'd') {
      this.velocity.x = currentSpeed;
      this.facingDirection = 1;
    } else if (keys.a && keys.lastHorizontal === 'a') {
      this.velocity.x = -currentSpeed;
      this.facingDirection = -1;
    } else {
      this.velocity.x = 0;
    }
  }

  handleAirMovement() {
    if (keys.d && keys.lastHorizontal === 'd') {
      this.velocity.x += this.airAcceleration;
      this.facingDirection = 1;
    } else if (keys.a && keys.lastHorizontal === 'a') {
      this.velocity.x -= this.airAcceleration;
      this.facingDirection = -1;
    }

    this.velocity.x *= this.airFriction;

    if (this.velocity.x > this.maxSpeed) this.velocity.x = this.maxSpeed;
    if (this.velocity.x < -this.maxSpeed) this.velocity.x = -this.maxSpeed;
  }

  handleJump() {
    if (!((keys.space || keys.w) && this.isGrounded)) return;

    this.velocity.y = this.isCrouching ? this.crouchJumpPower : this.jumpPower;
    this.isGrounded = false;

    if (this.isCrouching) {
      const heightDiff = this.normalHeight - this.crouchHeight;
      this.position.y -= heightDiff;
      this.height = this.normalHeight;
      this.isCrouching = false;
    }
  }

  handleAttack() {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= TIMINGS.FRAME_TIME;
    }

    if (!this.isAttacking && this.hasDealtDamage) {
      this.hasDealtDamage = false;
    }

    if ((keys.f || keys.mouseLeft) && this.attackCooldown <= 0) {
      this.performAttack();
    }
  }

  performAttack() {
    const weaponStats = this.getWeaponStats();

    this.isAttacking = true;
    this.attackCooldown = weaponStats.cooldown;
    this.attackStartTime = Date.now();

    setTimeout(() => this.isAttacking = false, 150);
  }

  getAttackHitbox() {
    if (!this.isAttacking) return null;

    const weaponStats = this.getWeaponStats();
    const direction = this.facingDirection;

    return {
      x: direction === 1
        ? this.position.x + this.width
        : this.position.x - weaponStats.range,
      y: this.position.y + this.height / 3,
      width: weaponStats.range,
      height: this.height / 2,
    };
  }

  applyPhysics() {
    this.velocity.y += this.gravity;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  handleCollisions(platforms) {
    let onPlatform = false;

    platforms.forEach(platform => {
      const platformRect = {
        x: platform.x,
        y: platform.y,
        width: platform.width,
        height: platform.height
      };

      const playerRect = {
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height
      };

      if (checkCollision(playerRect, platformRect)) {
        const overlapLeft = (this.position.x + this.width) - platform.x;
        const overlapRight = (platform.x + platform.width) - this.position.x;
        const overlapTop = (this.position.y + this.height) - platform.y;
        const overlapBottom = (platform.y + platform.height) - this.position.y;

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapTop && this.velocity.y > 0) {
          this.velocity.y = 0;
          this.position.y = platform.y - this.height;
          onPlatform = true;
        } else if (minOverlap === overlapBottom && this.velocity.y < 0) {
          this.velocity.y = 0;
          this.position.y = platform.y + platform.height;
        } else if (minOverlap === overlapLeft && this.velocity.x > 0) {
          this.velocity.x = 0;
          this.position.x = platform.x - this.width;
        } else if (minOverlap === overlapRight && this.velocity.x < 0) {
          this.velocity.x = 0;
          this.position.x = platform.x + platform.width;
        }
      }
    });

    this.isGrounded = onPlatform;
  }

  setWeapon(weaponKey) {
    if (WEAPONS[weaponKey]) {
      this.weapon = weaponKey;
    }
  }

  getWeaponStats() {
    return WEAPONS[this.weapon];
  }

  checkDeathZone() {
    if (this.position.y > this.deathZoneY) {
      this.die();
    }
  }

  die() {
    this.respawn();
  }

  respawn() {
    this.position.x = this.spawnPoint.x;
    this.position.y = this.spawnPoint.y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.isDead = false;
    this.isGrounded = false;
    this.health = this.maxHealth;
    this.canDash = true;
    this.dashCooldownTimer = 0;
  }

  setSpawnPoint(x, y) {
    this.spawnPoint.x = x;
    this.spawnPoint.y = y;
  }

  drawSlashEffect(ctx) {
    if (!this.isAttacking) return;

    const elapsed = Date.now() - this.attackStartTime;
    const progress = elapsed / 300;
    const alpha = 1 - progress;

    if (alpha <= 0) return;

    const weaponStats = this.getWeaponStats();
    const direction = this.facingDirection;
    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;

    if (this.weapon === 'sword') {
      if (!swordSlashSprite || !swordSlashSprite.complete) return;

      ctx.save();
      ctx.globalAlpha = alpha;

      const slashWidth = 50;
      const slashHeight = 50;

      const slashX = direction === 1
        ? centerX + this.width / 2 - 5
        : centerX - this.width / 2 - slashWidth + 5;
      const slashY = centerY - slashHeight / 2.5;

      if (direction === -1) {
        ctx.translate(slashX + slashWidth, slashY);
        ctx.scale(-1, 1);
        ctx.drawImage(swordSlashSprite, 0, 0, slashWidth, slashHeight);
      } else {
        ctx.drawImage(swordSlashSprite, slashX, slashY, slashWidth, slashHeight);
      }

      ctx.restore();
    } else if (this.weapon === 'spear') {
      const length = weaponStats.range;
      const x = direction === 1 ? centerX + this.width / 2 : centerX - this.width / 2 - length;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#3498db';
      ctx.fillRect(x, centerY - 2, length, 4);
      ctx.restore();
    } else if (this.weapon === 'hammer') {
      const size = weaponStats.range;
      const x = direction === 1 ? centerX + this.width / 2 : centerX - this.width / 2 - size;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(241, 196, 15, 0.5)';
      ctx.beginPath();
      ctx.arc(x + size / 2, centerY, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
