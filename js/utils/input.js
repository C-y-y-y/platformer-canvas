const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
  shift: false,
  alt: false,
  f: false,
  mouseLeft: false,
  lastHorizontal: ''
};

window.addEventListener('keydown', (e) => {
  switch(e.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.w = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.a = true;
      keys.lastHorizontal = 'a';
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.s = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.d = true;
      keys.lastHorizontal = 'd';
      break;
    case 'Space':
      keys.space = true;
      e.preventDefault();
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      keys.shift = true;
      break;
    case 'AltLeft':
    case 'AltRight':
      keys.alt = true;
      e.preventDefault();
      break;
    case 'KeyF':
      keys.f = true;
      break;
    case 'Digit1':
      if (player) player.setWeapon('sword');
      break;
    case 'Digit2':
      if (player) player.setWeapon('spear');
      break;
    case 'Digit3':
      if (player) player.setWeapon('hammer');
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch(e.code) {
    case 'KeyW':
    case 'ArrowUp':
      keys.w = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      keys.a = false;
      if (keys.d) {
        keys.lastHorizontal = 'd';
      } else {
        keys.lastHorizontal = '';
      }
      break;
    case 'KeyS':
    case 'ArrowDown':
      keys.s = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      keys.d = false;
      if (keys.a) {
        keys.lastHorizontal = 'a';
      } else {
        keys.lastHorizontal = '';
      }
      break;
    case 'Space':
      keys.space = false;
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      keys.shift = false;
      break;
    case 'AltLeft':
    case 'AltRight':
      keys.alt = false;
      break;
    case 'KeyF':
      keys.f = false;
      break;
  }
});

window.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    keys.mouseLeft = true;
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) {
    keys.mouseLeft = false;
  }
});