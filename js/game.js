const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

canvas.width = 1024;
canvas.height = 576;

let DEV_MODE = false;

const platformSprites = {
  stone: new Image(),
  moss: new Image(),
  crystal: new Image(),
  stalactite: new Image()
};

platformSprites.stone.src = 'assets/sprites/platforms/platform-large-2.png';
platformSprites.moss.src = 'assets/sprites/platforms/platform-medium-3.png';
platformSprites.crystal.src = 'assets/sprites/platforms/platform-large-1.png';
platformSprites.stalactite.src = 'assets/sprites/platforms/platform-large-7.png';

const backgroundImage = new Image();
backgroundImage.src = 'assets/sprites/backgrounds/cave-bg.png';

const playerSpriteSheet = new Image();
playerSpriteSheet.src = 'assets/sprites/player/player-spritesheet.png';

const swordSlashSprite = new Image();
swordSlashSprite.src = 'assets/sprites/effects/sword-slash.png';

const parallaxLayers = [{ image: backgroundImage, speed: 0.3, y: 0 }];

let imagesLoaded = 0;
const totalImages = 4;

const imageLoadHandlers = {
  onLoad: (name) => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      console.log('All sprites loaded, starting game...');
    }
  },
  onError: (name) => {
    console.error(`Failed to load ${name}`);
    imagesLoaded++;
  }
};

swordSlashSprite.onload = () => imageLoadHandlers.onLoad('sword slash');
swordSlashSprite.onerror = () => imageLoadHandlers.onError('sword slash');

platformSprites.stone.onload = () => imageLoadHandlers.onLoad('platform');
platformSprites.stone.onerror = () => imageLoadHandlers.onError('platform');

backgroundImage.onload = () => imageLoadHandlers.onLoad('background');
backgroundImage.onerror = () => imageLoadHandlers.onError('background');

playerSpriteSheet.onload = () => {
  imageLoadHandlers.onLoad('player sprite sheet');
  if (player) player.loadSpriteSheet(playerSpriteSheet);
};
playerSpriteSheet.onerror = () => imageLoadHandlers.onError('player sprite sheet');

const currentLevel = level1;
let player;
let platforms = [];
let enemies = [];
const camera = { x: 0, y: 0 };

let lastTime = 0;
let frameCount = 0;
let fps = 0;

let devButtonBounds = { x: 0, y: 0, width: 0, height: 0 };

function initGame() {
  player = new Player(currentLevel.playerStart.x, currentLevel.playerStart.y);
  platforms = currentLevel.platforms.map(p => new Platform(p.x, p.y, p.width, p.height, p.type));
  spawnEnemies();
}

function spawnEnemies() {
  enemies = [];

  currentLevel.enemies.forEach(enemyData => {
    let enemy;

    switch (enemyData.type) {
      case 'goblin':
        enemy = new Goblin(enemyData.x, enemyData.y, enemyData.patrolStart, enemyData.patrolEnd);
        break;
      case 'flyingImp':
        enemy = new FlyingImp(enemyData.x, enemyData.y, enemyData.patrolStart, enemyData.patrolEnd);
        break;
      case 'orc':
        enemy = new Orc(enemyData.x, enemyData.y);
        break;
      default:
        console.error(`Unknown enemy type: ${enemyData.type}`);
        return;
    }

    if (enemy) {
      enemies.push(enemy);
    }
  });
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (
    mouseX >= devButtonBounds.x &&
    mouseX <= devButtonBounds.x + devButtonBounds.width &&
    mouseY >= devButtonBounds.y &&
    mouseY <= devButtonBounds.y + devButtonBounds.height
  ) {
    DEV_MODE = !DEV_MODE;
  }
});

function drawDevModeButton(ctx) {
  const buttonX = canvas.width - 120;
  const buttonY = 10;
  const buttonWidth = 110;
  const buttonHeight = 30;

  ctx.fillStyle = DEV_MODE ? '#27ae60' : '#95a5a6';
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

  ctx.fillStyle = '#fff';
  ctx.font = '14px monospace';
  ctx.fillText(DEV_MODE ? 'DEV: ON' : 'DEV: OFF', buttonX + 15, buttonY + 20);

  return { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
}

function drawPlayerUI(ctx) {
  const uiPadding = 15;
  const barHeight = 20;
  const barWidth = 200;
  const spacing = 10;
  const iconSize = 50;
  const iconSpacing = 10;

  const hpBarX = uiPadding;
  const hpBarY = uiPadding;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(hpBarX - 5, hpBarY - 5, barWidth + 10, barHeight + 10);

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.strokeRect(hpBarX, hpBarY, barWidth, barHeight);

  const hpPercent = player.health / player.maxHealth;
  const hpColor = hpPercent > 0.5 ? '#27ae60' : hpPercent > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillStyle = hpColor;
  ctx.fillRect(hpBarX + 2, hpBarY + 2, (barWidth - 4) * hpPercent, barHeight - 4);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`HP: ${player.health}/${player.maxHealth}`, hpBarX + barWidth / 2, hpBarY + barHeight / 2 + 4);

  const iconX = hpBarX + barWidth + iconSpacing;
  const iconY = hpBarY;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(iconX - 5, iconY - 5, iconSize + 10, iconSize + 10);

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 3;
  ctx.strokeRect(iconX, iconY, iconSize, iconSize);

  drawWeaponIcon(ctx, iconX, iconY, iconSize, player.weapon);

  const weaponStats = player.getWeaponStats();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(weaponStats.name.toUpperCase(), iconX + iconSize / 2, iconY + iconSize + 15);

  const dashBarX = uiPadding;
  const dashBarY = hpBarY + barHeight + spacing;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(dashBarX - 5, dashBarY - 5, barWidth + 10, barHeight + 10);

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.strokeRect(dashBarX, dashBarY, barWidth, barHeight);

  const dashPercent = player.getDashCooldownPercent();
  const dashColor = player.canDash ? '#3498db' : '#95a5a6';
  ctx.fillStyle = dashColor;
  ctx.fillRect(dashBarX + 2, dashBarY + 2, (barWidth - 4) * dashPercent, barHeight - 4);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  const dashText = player.canDash ? 'DASH READY' : 'DASH';
  ctx.fillText(dashText, dashBarX + barWidth / 2, dashBarY + barHeight / 2 + 4);

  ctx.textAlign = 'left';
}

function drawWeaponIcon(ctx, x, y, size, weaponType) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.save();

  if (weaponType === 'sword') {
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.35);
    ctx.lineTo(centerX + size * 0.08, centerY + size * 0.1);
    ctx.lineTo(centerX - size * 0.08, centerY + size * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.35);
    ctx.lineTo(centerX - size * 0.04, centerY + size * 0.1);
    ctx.stroke();

    ctx.fillStyle = '#f39c12';
    ctx.fillRect(centerX - size * 0.2, centerY + size * 0.08, size * 0.4, size * 0.08);

    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(centerX - size * 0.06, centerY + size * 0.12, size * 0.12, size * 0.25);

    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(centerX, centerY + size * 0.4, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

  } else if (weaponType === 'spear') {
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = size * 0.08;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.4);
    ctx.lineTo(centerX, centerY + size * 0.4);
    ctx.stroke();

    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.45);
    ctx.lineTo(centerX + size * 0.1, centerY - size * 0.25);
    ctx.lineTo(centerX - size * 0.1, centerY - size * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.45);
    ctx.lineTo(centerX - size * 0.05, centerY - size * 0.3);
    ctx.stroke();

  } else if (weaponType === 'hammer') {
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(centerX - size * 0.05, centerY - size * 0.1, size * 0.1, size * 0.5);

    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(centerX - size * 0.25, centerY - size * 0.3, size * 0.5, size * 0.25);

    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(centerX - size * 0.25, centerY - size * 0.3, size * 0.5, size * 0.08);

    ctx.fillStyle = '#34495e';
    ctx.fillRect(centerX - size * 0.25, centerY - size * 0.12, size * 0.5, size * 0.04);
    ctx.fillRect(centerX - size * 0.05, centerY + size * 0.1, size * 0.1, size * 0.05);
    ctx.fillRect(centerX - size * 0.05, centerY + size * 0.3, size * 0.1, size * 0.05);
  }

  ctx.restore();
}

function updateCamera() {
  camera.x = player.position.x - canvas.width / 2;
  camera.y = player.position.y - canvas.height / 2;
  camera.x = Math.max(0, camera.x);
  camera.x = Math.min(currentLevel.width - canvas.width, camera.x);
  camera.y = Math.max(0, camera.y);
  camera.y = Math.min(currentLevel.height - canvas.height, camera.y);
}

function drawParallaxBackground() {
  parallaxLayers.forEach(layer => {
    if (!layer.image || !layer.image.complete || layer.image.naturalWidth === 0) {
      ctx.fillStyle = '#0f0f1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const parallaxX = camera.x * layer.speed;
    const parallaxY = camera.y * layer.speed + layer.y;
    const bgWidth = layer.image.width;
    const bgHeight = layer.image.height;
    const startX = Math.floor(parallaxX / bgWidth) * bgWidth - parallaxX;
    const tilesNeeded = Math.ceil(canvas.width / bgWidth) + 1;

    for (let i = 0; i < tilesNeeded; i++) {
      ctx.drawImage(layer.image, startX + (i * bgWidth), -parallaxY, bgWidth, bgHeight);
    }
  });
}

function updateGame() {
  player.update(platforms, { width: currentLevel.width, height: currentLevel.height });

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];

    if (enemy.isDead) {
      enemies.splice(i, 1);
      continue;
    }

    enemy.update(platforms, player);

    if (enemy.shouldDamagePlayer && enemy.shouldDamagePlayer(player)) {
      player.takeDamage(enemy.damage);
      enemy.hasDealtDamageToPlayer = true;
    }
  }

  const attackHitbox = player.getAttackHitbox();
  if (attackHitbox && !player.hasDealtDamage) {
    enemies.forEach(enemy => {
      if (!enemy.isDead && checkCollision(attackHitbox, enemy.getRect())) {
        const weaponStats = player.getWeaponStats();
        enemy.takeDamage(weaponStats.damage);
        player.hasDealtDamage = true;
      }
    });
  }

  updateCamera();
}

function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawParallaxBackground();

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  platforms.forEach(platform => platform.draw(ctx));
  enemies.forEach(enemy => enemy.draw(ctx, DEV_MODE));
  player.draw(ctx);

  if (DEV_MODE) {
    drawDebugPlayer(ctx);
  }

  player.drawSlashEffect(ctx);

  ctx.restore();

  if (!DEV_MODE) {
    drawPlayerUI(ctx);
  }

  if (DEV_MODE) {
    drawDebugUI(ctx);
  }

  devButtonBounds = drawDevModeButton(ctx);
}

function drawDebugPlayer(ctx) {
  const spriteName = player.getCurrentSprite();
  const o = player.spriteOffsets[spriteName] || player.spriteOffsets.idle;
  const dx = player.position.x + o.ox;
  const dy = player.position.y + o.oy;

  ctx.strokeStyle = '#2ecc71';
  ctx.lineWidth = 2;
  ctx.strokeRect(dx, dy, player.render.w, player.render.h);

  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2;
  ctx.strokeRect(player.position.x, player.position.y, player.width, player.height);

  const attackHitbox = player.getAttackHitbox();
  if (attackHitbox) {
    ctx.fillStyle = 'rgba(231, 76, 60, 0.5)';
    ctx.fillRect(attackHitbox.x, attackHitbox.y, attackHitbox.width, attackHitbox.height);
  }
}

function drawDebugUI(ctx) {
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';

  const debugInfo = [
    `FPS: ${fps}`,
    `Player: ${Math.round(player.position.x)}, ${Math.round(player.position.y)}`,
    `HP: ${player.health}/${player.maxHealth}`,
    `Camera: ${Math.round(camera.x)}, ${Math.round(camera.y)}`,
    `Weapon: ${player.getWeaponStats().name}`,
    `DMG: ${player.getWeaponStats().damage} | RNG: ${player.getWeaponStats().range} | CD: ${player.getWeaponStats().cooldown}ms`,
    `Facing: ${player.facingDirection === 1 ? 'RIGHT' : 'LEFT'}`,
    `Enemies: ${enemies.length}`
  ];

  debugInfo.forEach((text, index) => {
    ctx.fillText(text, 10, 25 + (index * 25));
  });
}

function animate(currentTime = 0) {
  frameCount++;
  if (currentTime - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = currentTime;
  }

  updateGame();
  renderGame();

  requestAnimationFrame(animate);
}

initGame();
animate();