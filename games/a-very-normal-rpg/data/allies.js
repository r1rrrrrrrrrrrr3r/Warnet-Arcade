/* ---------- named allies offered by event encounters ---------- */
/* allies recruited mid-combat instead come from the defeated enemy itself
   (see convertEnemyToAlly in game.js) */

const ALLY_EVENT_POOL = [
  { name:'Wandering Swordsman', health:40, attackPower:12, defensePower:6  },
  { name:'Apprentice Mage',     health:30, attackPower:16, defensePower:3  },
  { name:'Lost Scout',          health:35, attackPower:10, defensePower:8  },
  { name:'Retired Knight',      health:55, attackPower:9,  defensePower:14 },
  { name:'Traveling Healer',    health:32, attackPower:6,  defensePower:6, healer:true },
  { name:'Grizzled Ranger',     health:38, attackPower:14, defensePower:7  },
  { name:'Rookie Squire',       health:45, attackPower:7,  defensePower:10 },
  { name:'Shady Rogue',         health:28, attackPower:18, defensePower:2  },
  { name:'Runaway Bard',        health:33, attackPower:11, defensePower:5, healer:true },
  { name:'Field Medic',         health:36, attackPower:5,  defensePower:8, healer:true },
  { name:'Exiled Monk',         health:42, attackPower:13, defensePower:9  },
  { name:'Village Blacksmith',  health:50, attackPower:10, defensePower:11 },
];