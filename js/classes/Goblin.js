class Goblin extends Enemy {
  constructor(x, y, patrolStart, patrolEnd) {
    const stats = ENEMY_STATS.GOBLIN;
    super(x, y, stats.width, stats.height, stats.health, stats.damage);

    this.patrolStart = patrolStart;
    this.patrolEnd = patrolEnd;
    this.speed = stats.speed;
    this.chaseSpeed = stats.chaseSpeed;
    this.retreatSpeed = stats.retreatSpeed;
    this.direction = 1;

    this.state = 'patrol';
    this.aggroRange = stats.aggroRange;
    this.aggroRangeVertical = stats.aggroRange / 2;
    this.attackRange = stats.attackRange;
    this.attackCooldown = 0;
    this.attackCooldownMax = stats.attackCooldown;
    this.loseAggroDistance = stats.loseAggroDistance;

    this.pauseTimer = 0;
    this.pauseDuration = stats.pauseDuration;
    this.isPaused = false;

    this.retreatTimer = 0;
    this.retreatDuration = stats.retreatDuration;

    this.attackHitbox = null;
    this.attackDuration = stats.attackDuration;
    this.attackTimer = 0;
    this.attackHitboxRange = stats.attackHitboxRange;
    this.attackStartTime = null;

    this.attackWindupTimer = 0;
    this.attackWindupDuration = 150;

    this.velocity = { x: 0, y: 0 };
    this.gravity = PHYSICS.GRAVITY;
    this.isGrounded = false;
  }

  getColor() {
    return ENEMY_STATS.GOBLIN.color;
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
        this.state = 'retreat';
        this.retreatTimer = this.retreatDuration;
        this.attackStartTime = null;
      }
    }

    this.applyPhysics();
    this.handleCollisions(platforms);

    if (!player) {
      this.patrolBehavior();
      return;
    }

    const horizontalDistance = this.getHorizontalDistanceToPlayer(player);
    const absHorizontalDistance = Math.abs(horizontalDistance);
    const verticalDistance = Math.abs((player.position.y + player.height / 2) - (this.position.y + this.height / 2));

    if (this.state === 'patrol' && absHorizontalDistance < this.aggroRange && verticalDistance < this.aggroRangeVertical) {
      this.state = 'chase';
      this.isPaused = false;
    }

    if ((this.state === 'chase' || this.state === 'retreat') && (absHorizontalDistance > this.loseAggroDistance || verticalDistance > this.aggroRangeVertical * 1.5)) {
      this.state = 'patrol';
    }

    if (this.state === 'retreat') {
      this.retreatBehavior(player);
    } else if (this.state === 'attack') {
      this.attackBehavior();
    } else if (this.state === 'chase') {
      this.chaseBehavior(player, horizontalDistance, absHorizontalDistance);
    } else {
      this.patrolBehavior();
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

  patrolBehavior() {
    if (this.position.x < this.patrolStart) {
      this.position.x = this.patrolStart;
      this.direction = 1;
      this.isPaused = true;
      this.pauseTimer = this.pauseDuration;
      this.velocity.x = 0;
      return;
    } else if (this.position.x + this.width > this.patrolEnd) {
      this.position.x = this.patrolEnd - this.width;
      this.direction = -1;
      this.isPaused = true;
      this.pauseTimer = this.pauseDuration;
      this.velocity.x = 0;
      return;
    }

    if (this.isPaused) {
      this.pauseTimer -= TIMINGS.FRAME_TIME;
      if (this.pauseTimer <= 0) {
        this.isPaused = false;
      }
      this.velocity.x = 0;
      return;
    }

    this.velocity.x = this.speed * this.direction;

    if (this.direction === 1 && this.position.x + this.width >= this.patrolEnd) {
      this.direction = -1;
      this.position.x = this.patrolEnd - this.width;
      this.isPaused = true;
      this.pauseTimer = this.pauseDuration;
      this.velocity.x = 0;
    } else if (this.direction === -1 && this.position.x <= this.patrolStart) {
      this.direction = 1;
      this.position.x = this.patrolStart;
      this.isPaused = true;
      this.pauseTimer = this.pauseDuration;
      this.velocity.x = 0;
    }
  }

  chaseBehavior(player, horizontalDistance, absHorizontalDistance) {
    if (absHorizontalDistance < this.attackRange && this.attackCooldown <= 0) {
      this.state = 'attack';
      this.attackCooldown = this.attackCooldownMax;
      this.attackWindupTimer = this.attackWindupDuration;
      this.velocity.x = 0;
      return;
    }

    const shouldMoveLeft = horizontalDistance < -5;
    const shouldMoveRight = horizontalDistance > 5;

    if (shouldMoveLeft || shouldMoveRight) {
      const moveDirection = shouldMoveRight ? 1 : -1;
      this.velocity.x = this.chaseSpeed * moveDirection;
      this.direction = moveDirection;
    } else {
      this.velocity.x = 0;
    }

    if (this.position.x < this.patrolStart) {
      this.position.x = this.patrolStart;
      this.velocity.x = 0;
    } else if (this.position.x + this.width > this.patrolEnd) {
      this.position.x = this.patrolEnd - this.width;
      this.velocity.x = 0;
    }
  }

  attackBehavior() {
    this.velocity.x = 0;
  }

  retreatBehavior(player) {
    this.retreatTimer -= TIMINGS.FRAME_TIME;

    const horizontalDistance = this.getHorizontalDistanceToPlayer(player);
    const retreatDirection = horizontalDistance > 0 ? -1 : 1;

    this.velocity.x = this.retreatSpeed * retreatDirection;
    this.direction = retreatDirection;

    if (this.position.x < this.patrolStart) {
      this.position.x = this.patrolStart;
      this.velocity.x = 0;
    } else if (this.position.x + this.width > this.patrolEnd) {
      this.position.x = this.patrolEnd - this.width;
      this.velocity.x = 0;
    }

    if (this.retreatTimer <= 0) {
      const absHorizontalDistance = Math.abs(horizontalDistance);
      const verticalDistance = Math.abs((player.position.y + player.height / 2) - (this.position.y + this.height / 2));

      if (absHorizontalDistance < this.aggroRange && verticalDistance < this.aggroRangeVertical) {
        this.state = 'chase';
      } else {
        this.state = 'patrol';
      }
    }
  }

  performAttack() {
    const hitboxWidth = this.attackHitboxRange;
    const hitboxHeight = this.height * 0.6;

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