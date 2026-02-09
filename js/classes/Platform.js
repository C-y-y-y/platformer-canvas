class Platform {
  constructor(x, y, width, height, type = 'stone') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }

  draw(ctx) {
    const sprite = platformSprites[this.type];

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = '#5a5a6a';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText('Loading...', this.x + 10, this.y + 15);
    }
  }
}