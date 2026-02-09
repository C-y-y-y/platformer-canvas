// ========================================
// GAME CONSTANTS
// Централизованное хранение всех констант игры
// ========================================

const PHYSICS = {
  GRAVITY: 0.8,
  PLAYER_JUMP_POWER: -15,
  PLAYER_CROUCH_JUMP_POWER: -18,
  ORC_JUMP_POWER: -12,
};

const PLAYER = {
  WIDTH: 48,
  HEIGHT: 64,
  HEALTH: 100,
  SPEED: 5,
  MAX_SPEED: 5,
  AIR_ACCELERATION: 0.5,
  AIR_FRICTION: 0.92,
  CROUCH_SPEED_MULTIPLIER: 0.5,
  DASH_SPEED: 10,
  DASH_DURATION: 200,
  DASH_IFRAMES: 300,
  DASH_COOLDOWN: 1000,
  ROLL_SPEED: 7.5,
  ROLL_DURATION: 300,
  ROLL_IFRAMES: 400,
  DEATH_ZONE_Y: 800,
};

const ENEMY_STATS = {
  GOBLIN: {
    width: 35,
    height: 35,
    health: 40,
    damage: 10,
    speed: 1.5,
    chaseSpeed: 3.5,
    retreatSpeed: 3,
    aggroRange: 200,
    attackRange: 40,
    loseAggroDistance: 350,
    attackCooldown: 1000,
    pauseDuration: 1000,
    retreatDuration: 800,
    attackDuration: 300,
    attackHitboxRange: 45,
    color: '#27ae60',
  },

  FLYING_IMP: {
    width: 30,
    height: 30,
    health: 30,
    damage: 15,
    speed: 2,
    diveSpeed: 8,
    aggroRange: 300,
    attackRange: 20,
    loseAggroDistance: 450,
    attackCooldown: 2000,
    sineAmplitude: 40,
    sineSpeed: 0.05,
    returnTimer: 1000,
    color: '#9b59b6',
  },

  ORC: {
    width: 45,
    height: 55,
    health: 60,
    damage: 20,
    speed: 2.5,
    aggroRange: 400,
    attackRange: 50,
    loseAggroDistance: 600,
    attackCooldown: 1500,
    jumpCooldown: 1000,
    idleTimer: 2000,
    attackDuration: 300,
    color: '#c0392b',
  },
};

const TIMINGS = {
  DAMAGE_FLASH_DURATION: 200,
  FRAME_TIME: 16,
};

const COLORS = {
  DAMAGE_FLASH: '#e74c3c',
  AGGRO_RANGE: 'rgba(255, 255, 255, 0.1)',
  ATTACK_RANGE: 'rgba(231, 76, 60, 0.3)',
  ATTACK_HITBOX: 'rgba(231, 76, 60, 0.3)',
  HEALTH_BAR_BG: '#c0392b',
  HEALTH_BAR_FG: '#27ae60',
};

const DEBUG = {
  HEALTH_BAR_HEIGHT: 4,
  HEALTH_BAR_OFFSET: 10,
  FONT_SIZE: '10px monospace',
  STATE_TEXT_OFFSET: 15,
};