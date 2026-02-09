class Orc extends Enemy {
  constructor(x, y) {
    const stats = ENEMY_STATS.ORC;
    super(x, y, stats.width, stats.height, stats.health, stats.damage);

    this.speed = stats.speed;
    this.gravity = PHYSICS.GRAVITY;
    this.velocity = { x: 0, y: 0 };
    this.isGrounded = false;

    this.state = 'idle';
    this.aggroRange = stats.aggroRange;
    this.aggroRangeVertical = stats.aggroRange / 2;
    this.attackRange = stats.attackRange;
    this.attackCooldown = 0;
    this.attackCooldownMax = stats.attackCooldown;
    this.loseAggroDistance = stats.loseAggroDistance;

    this.idleTimer = 0;
    this.idleTimerMax = stats.idleTimer;
    this.attackDuration = stats.attackDuration;

    this.attackHitbox = null;
    this.attackTimer = 0;
    this.attackHitboxRange = stats.attackHitboxRange || 40;
    this.attackStartTime = null;

    this.attackWindupTimer = 0;
    this.attackWindupDuration = 250;

    this.spawnX = x;
    this.maxChaseDistance = 300;

    // Направление взгляда орка
    this.direction = 1;
  }

  getColor() {
    return ENEMY_STATS.ORC.color;
  }

  isAttacking() {
    return this.state === 'attack' && this.attackTimer > 0;
  }

  update(platforms = [], player = null) {
    super.update();

    if (this.attackCooldown > 0) {
      this.attackCooldown -= TIMINGS.FRAME_TIME;
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= TIMINGS.FRAME_TIME;
      if (this.attackTimer <= 0) {
        this.attackHitbox = null;
      }
    }

    if (this.attackWindupTimer > 0) {
      this.attackWindupTimer -= TIMINGS.FRAME_TIME;
      if (this.attackWindupTimer <= 0) {
        this.performAttack();
        this.attackTimer = this.attackDuration;
        this.attackStartTime = Date.now();
      }
    }

    if (this.state === 'attack' && this.attackStartTime) {
      const elapsed = Date.now() - this.attackStartTime;
      if (elapsed >= this.attackDuration) {
        this.state = 'chase';
        this.attackStartTime = null;
      }
    }

    this.applyPhysics();
    this.handleCollisions(platforms);

    if (!player) {
      this.idleBehavior();
      return;
    }

    const distanceToPlayer = this.getDistanceToPlayer(player);
    const horizontalDistance = this.getHorizontalDistanceToPlayer(player);
    const absHorizontalDistance = Math.abs(horizontalDistance);
    const verticalDistance = Math.abs((player.position.y + player.height / 2) - (this.position.y + this.height / 2));

    if (this.state === 'idle' && absHorizontalDistance < this.aggroRange && verticalDistance < this.aggroRangeVertical) {
      this.state = 'chase';
    }

    if (this.state === 'chase' && (distanceToPlayer > this.loseAggroDistance || verticalDistance > this.aggroRangeVertical * 1.5)) {
      this.state = 'idle';
      this.idleTimer = this.idleTimerMax;
    }

    if (this.state === 'chase') {
      this.chaseBehavior(player, horizontalDistance, distanceToPlayer, platforms);
    } else {
      this.idleBehavior();
    }
  }

  idleBehavior() {
    this.velocity.x = 0;

    if (this.idleTimer > 0) {
      this.idleTimer -= TIMINGS.FRAME_TIME;
    }
  }

  chaseBehavior(player, horizontalDistance, distanceToPlayer, platforms) {
    if (distanceToPlayer < this.attackRange && this.attackCooldown <= 0) {
      this.state = 'attack';
      this.velocity.x = 0;
      this.attackCooldown = this.attackCooldownMax;
      this.attackWindupTimer = this.attackWindupDuration;
      return;
    }

    const distanceFromSpawn = Math.abs(this.position.x - this.spawnX);
    if (distanceFromSpawn > this.maxChaseDistance) {
      this.state = 'idle';
      this.idleTimer = this.idleTimerMax;
      return;
    }

    const moveDirection = horizontalDistance > 10 ? 1 : (horizontalDistance < -10 ? -1 : 0);

    if (moveDirection !== 0) {
      const noGroundAhead = this.isEdgeAhead(platforms, moveDirection);

      if (noGroundAhead) {
        this.velocity.x = 0;
        return;
      }

      this.velocity.x = this.speed * moveDirection;
      this.direction = moveDirection; // Обновляем направление взгляда
    } else {
      this.velocity.x = 0;
    }
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

      if (checkCollision(this.getRect(), platformRect)) {
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
        } else if (minOverlap === overlapLeft) {
          this.position.x = platform.x - this.width;
          this.velocity.x = 0;
        } else if (minOverlap === overlapRight) {
          this.position.x = platform.x + platform.width;
          this.velocity.x = 0;
        }
      }
    });

    this.isGrounded = onPlatform;
  }

  isEdgeAhead(platforms, direction) {
    const checkDistance = 5;
    const checkX = direction === 1
      ? this.position.x + this.width + checkDistance
      : this.position.x - checkDistance;
    const checkY = this.position.y + this.height + 5;

    for (let platform of platforms) {
      if (checkX >= platform.x &&
        checkX <= platform.x + platform.width &&
        checkY >= platform.y &&
        checkY <= platform.y + platform.height) {
        return false;
      }
    }

    return true;
  }

  performAttack() {
    const hitboxWidth = this.attackHitboxRange;
    const hitboxHeight = this.height * 0.6;

    // Используем сохраненное направление взгляда вместо velocity.x
    this.attackHitbox = {
      x: this.direction === 1
        ? this.position.x + this.width
        : this.position.x - hitboxWidth,
      y: this.position.y + this.height * 0.2,
      width: hitboxWidth,
      height: hitboxHeight
    };
  }

  shouldDamagePlayer(player) {
    if (this.isDead || player.isInvulnerable) return false;
    if (this.hasDealtDamageToPlayer) return false;
    if (this.attackHitbox && this.attackTimer > 0) {
      const playerRect = {
        x: player.position.x,
        y: player.position.y,
        width: player.width,
        height: player.height
      };
      return checkCollision(this.attackHitbox, playerRect);
    }
    return false;
  }
}