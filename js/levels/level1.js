const level1 = {
  width: 3200,
  height: 576,

  playerStart: {
    x: 100,
    y: 470
  },

  platforms: [
    { x: 0, y: 520, width: 240, height: 96, type: 'stone' },
    { x: 240, y: 480, width: 270, height: 136, type: 'stone' },
    { x: 510, y: 480, width: 270, height: 136, type: 'stone' },
    { x: 780, y: 520, width: 240, height: 96, type: 'stone' },
    { x: 1020, y: 560, width: 180, height: 56, type: 'stone' },
    { x: 1440, y: 560, width: 180, height: 56, type: 'stone' },
    { x: 1140, y: 420, width: 210, height: 30, type: 'moss' },
    { x: 1620, y: 500, width: 420, height: 116, type: 'stone' },
    { x: 2040, y: 520, width: 360, height: 96, type: 'stone' },
    { x: 150, y: 350, width: 180, height: 30, type: 'stone' },
    { x: 420, y: 280, width: 240, height: 30, type: 'moss' },
    { x: 850, y: 330, width: 210, height: 30, type: 'stone' },
    { x: 700, y: 200, width: 150, height: 25, type: 'moss' },
    { x: 1170, y: 250, width: 125, height: 25, type: 'stone' },
    { x: 2040, y: 220, width: 360, height: 30, type: 'moss' },
    { x: 960, y: 100, width: 240, height: 25, type: 'stone' },
    { x: 1500, y: 140, width: 360, height: 25, type: 'stone' },
    { x: 2550, y: 490, width: 200, height: 86, type: 'stone' },
    { x: 2750, y: 520, width: 150, height: 56, type: 'moss' },
    { x: 2900, y: 520, width: 300, height: 56, type: 'moss' },
  ],

  enemies: [
    { type: 'goblin', x: 300, y: 445, patrolStart: 240, patrolEnd: 780 },
    { type: 'goblin', x: 850, y: 485, patrolStart: 780, patrolEnd: 1020 },
    { type: 'goblin', x: 1050, y: 525, patrolStart: 1020, patrolEnd: 1200 },
    { type: 'flyingImp', x: 1100, y: 300, patrolStart: 1020, patrolEnd: 1350 },
    { type: 'goblin', x: 1200, y: 385, patrolStart: 1140, patrolEnd: 1350 },
    { type: 'flyingImp', x: 1300, y: 250, patrolStart: 1200, patrolEnd: 1620 },
    { type: 'orc', x: 1450, y: 505 },
    { type: 'flyingImp', x: 1700, y: 350, patrolStart: 1620, patrolEnd: 2040 },
    { type: 'goblin', x: 1750, y: 465, patrolStart: 1620, patrolEnd: 2040 },
    { type: 'orc', x: 1900, y: 465 },
    { type: 'flyingImp', x: 2100, y: 180, patrolStart: 2040, patrolEnd: 2400 },
    { type: 'orc', x: 2200, y: 485 },
    { type: 'orc', x: 2800, y: 465 },
  ],

  shrines: []
};