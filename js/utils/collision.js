function checkCollision(rect1, rect2) {
  if (!rect1 || !rect2) return false;

  return rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y;
}

function checkPlatformCollision(player, platform) {
  const playerRect = {
    x: player.position.x,
    y: player.position.y,
    width: player.width,
    height: player.height
  };

  const platformRect = {
    x: platform.x,
    y: platform.y,
    width: platform.width,
    height: platform.height
  };

  if (!checkCollision(playerRect, platformRect)) {
    return false;
  }

  if (player.velocity.y > 0) {
    const playerBottom = player.position.y + player.height;
    const playerBottomPrevious = playerBottom - player.velocity.y;

    if (playerBottomPrevious <= platform.y) {
      return true;
    }
  }

  return false;
}