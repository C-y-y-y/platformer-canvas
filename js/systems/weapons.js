const WEAPONS = {
  sword: {
    name: 'Sword',
    damage: 20,
    cooldown: 400,
    range: 45,
    description: 'Balanced weapon'
  },

  spear: {
    name: 'Spear',
    damage: 15,
    cooldown: 300,
    range: 80,
    description: 'Fast attacks with long range'
  },

  hammer: {
    name: 'Hammer',
    damage: 35,
    cooldown: 800,
    range: 40,
    description: 'Powerful but slow strikes'
  }
};

let currentWeapon = 'sword';

function setWeapon(weaponKey) {
  if (WEAPONS[weaponKey]) {
    currentWeapon = weaponKey;
    return true;
  }
  return false;
}

function getCurrentWeapon() {
  return WEAPONS[currentWeapon];
}

function getAllWeapons() {
  return WEAPONS;
}