class FlyingImp extends Enemy {
  constructor(x, y, patrolStart, patrolEnd) {
    const stats = ENEMY_STATS.FLYING_IMP;
    super(x, y, stats.width, stats.height, stats.health, stats.damage);

    this.patrolStart = patrolStart;
    this.patrolEnd = patrolEnd;
    this.baseY = y;
    this.speed = stats.speed;
    this.direction = 1;

    this.sineOffset = 0;
    this.sineAmplitude = stats.sineAmplitude;
    this.sineSpeed = stats.sineSpeed;

    this.state = 'patrol';
    this.diveSpeed = stats.diveSpeed;
    this.diveTarget = null;
    this.aggroRange = stats.aggroRange;
    this.attackRange = stats.attackRange;
    this.attackCooldown = 0;
    this.attackCooldownMax = stats.attackCooldown;
    this.loseAggroDistance = stats.loseAggroDistance;

    this.returnToPatrolTimer = 0;
    this.returnTimer = stats.returnTimer;

    this.attackHitbox = null;
    this.attackDuration = stats.attackDuration || 200;
    this.attackTimer = 0;
    this.attackHitboxRange = stats.attackHitboxRange || 30;
    this.attackStartTime = null;
  }

  getColor() {
    return ENEMY_STATS.FLYING_IMP.color;
  }

  isAttacking() {
    return this.state === 'dive' && this.attackTimer > 0;
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

    if (!player) {
      this.patrolBehavior();
      return;
    }

    const distanceToPlayer = this.getDistanceToPlayer(player);

    if (this.state === 'patrol' && distanceToPlayer < this.aggroRange && this.attackCooldown <= 0) {
      this.state = 'dive';
      this.diveTarget = {
        x: player.position.x + player.width / 2,
        y: player.position.y + player.height / 2
      };
      this.attackCooldown = this.attackCooldownMax;
    }

    if (this.state === 'dive' && distanceToPlayer > this.loseAggroDistance) {
      this.state = 'return';
      this.returnToPatrolTimer = this.returnTimer;
      this.attackHitbox = null;
      this.attackTimer = 0;
    }

    if (this.state === 'dive') {
      this.diveBehavior();
    } else if (this.state === 'return') {
      this.returnBehavior();
    } else {
      this.patrolBehavior();
    }
  }

  patrolBehavior() {
    this.position.x += this.speed * this.direction;

    this.sineOffset += this.sineSpeed;
    this.position.y = this.baseY + Math.sin(this.sineOffset) * this.sineAmplitude;

    if (this.direction === 1 && this.position.x + this.width >= this.patrolEnd) {
      this.direction = -1;
      this.position.x = this.patrolEnd - this.width;
    } else if (this.direction === -1 && this.position.x <= this.patrolStart) {
      this.direction = 1;
      this.position.x = this.patrolStart;
    }
  }

  diveBehavior() {
    if (!this.diveTarget) {
      this.state = 'return';
      this.returnToPatrolTimer = this.returnTimer;
      return;
    }

    const dx = this.diveTarget.x - (this.position.x + this.width / 2);
    const dy = this.diveTarget.y - (this.position.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.attackRange && this.attackTimer <= 0) {
      this.performAttack();
      this.attackTimer = this.attackDuration;
      this.attackStartTime = Date.now();
    }

    if (distance < 10) {
      this.state = 'return';
      this.returnToPatrolTimer = this.returnTimer;
      this.diveTarget = null;
      this.attackHitbox = null;
      this.attackTimer = 0;
      return;
    }

    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    this.position.x += normalizedX * this.diveSpeed;
    this.position.y += normalizedY * this.diveSpeed;

    if (this.attackHitbox) {
      this.updateAttackHitbox();
    }
  }

  returnBehavior() {
    this.returnToPatrolTimer -= TIMINGS.FRAME_TIME;

    const targetX = (this.patrolStart + this.patrolEnd) / 2;
    const targetY = this.baseY;

    const dx = targetX - (this.position.x + this.width / 2);
    const dy = targetY - (this.position.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 20 || this.returnToPatrolTimer <= 0) {
      this.state = 'patrol';
      this.position.y = this.baseY;
      this.sineOffset = 0;
      return;
    }

    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    this.position.x += normalizedX * this.speed * 1.5;
    this.position.y += normalizedY * this.speed * 1.5;
  }

  performAttack() {
    const hitboxSize = this.attackHitboxRange;

    this.attackHitbox = {
      x: this.position.x + this.width / 2 - hitboxSize / 2,
      y: this.position.y + this.height / 2 - hitboxSize / 2,
      width: hitboxSize,
      height: hitboxSize
    };
  }

  updateAttackHitbox() {
    if (this.attackHitbox) {
      const hitboxSize = this.attackHitboxRange;
      this.attackHitbox.x = this.position.x + this.width / 2 - hitboxSize / 2;
      this.attackHitbox.y = this.position.y + this.height / 2 - hitboxSize / 2;
    }
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