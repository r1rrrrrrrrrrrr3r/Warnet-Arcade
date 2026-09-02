/* ---------- enemy data ---------- */

const allEnemies = [
    // Humans
    {name:"Thief", health:10, attackPower:3, defensePower:1},
    {name:"Guard", health:15, attackPower:5, defensePower:2},
    {name:"Furry", health:1, attackPower:1, defensePower:1},
    {name:"Weeb (Rare)", health:10, attackPower:10, defensePower:1},
    {name:"Sorcerer", health:35, attackPower:10, defensePower:5},
    {name:"Knight", health:40, attackPower:10, defensePower:8},
    {name:"Clown (Rare)", health:99, attackPower:1, defensePower:1},
    {name:"Ninja", health:15, attackPower:30, defensePower:1},
    {name:"Sumo", health:9, attackPower:9, defensePower:9},
    {name:"Samurai", health:30, attackPower:7, defensePower:3},
    {name:"Idol Fan (Rare)", health:5, attackPower:5, defensePower:5},
    {name:"Gamer (Rare)", health:7, attackPower:7, defensePower:7},
    {name:"Ordinary Office Worker (Rare)", health:4, attackPower:1, defensePower:2},
    {name:"Soldier", health:30, attackPower:20, defensePower:10},
    {name:"Influencer (Rare)", health:8, attackPower:8, defensePower:8},
    {name:"Mage", health:15, attackPower:33, defensePower:6},
    {name:"Witch", health:18, attackPower:31, defensePower:7},
    {name:"Warlock", health:20, attackPower:31, defensePower:17},
    {name:"Berserker", health:20, attackPower:15, defensePower:7},
    {name:"Cowboy", health:10, attackPower:30, defensePower:5},
    {name:"Outlaw", health:10, attackPower:28, defensePower:7},
    {name:"Robot", health:20, attackPower:5, defensePower:20},
    {name:"Cyborg", health:20, attackPower:10, defensePower:10},
    {name:"Hero (Rare)", health:20, attackPower:20, defensePower:20},
    {name:"Villain (Rare)", health:20, attackPower:20, defensePower:20},
    {name:"Hunter", health:7, attackPower:13, defensePower:6},
    {name:"Police", health:10, attackPower:10, defensePower:10},
    {name:"King (Rare)", health:15, attackPower:15, defensePower:15},
    {name:"Murderer (Rare)", health:15, attackPower:10, defensePower:10},
    {name:"Assasin", health:7, attackPower:12, defensePower:7},
    {name:"Tank", health:30, attackPower:5, defensePower:20},

    // Animals
    {name:"Tiger", health:22, attackPower:13, defensePower:3},
    {name:"Bear", health:20, attackPower:10, defensePower:3},
    {name:"Piranha", health:5, attackPower:12, defensePower:3},
    {name:"Gorilla", health:30, attackPower:8, defensePower:8},
    {name:"Rabbit", health:5, attackPower:3, defensePower:1},
    {name:"Ant (Rare)", health:1, attackPower:1, defensePower:1},
    {name:"Spider", health:2, attackPower:8, defensePower:1},
    {name:"Bat", health:2, attackPower:8, defensePower:2},
    {name:"Snail (Rare)", health:1, attackPower:1, defensePower:9},
    {name:"Shark", health:5, attackPower:18, defensePower:3},
    {name:"Octopus (Rare)", health:7, attackPower:8, defensePower:9},
    {name:"Crab", health:6, attackPower:6, defensePower:9},
    {name:"Eagle (Rare)", health:10, attackPower:20, defensePower:1},
    {name:"Turtle (Rare)", health:20, attackPower:1, defensePower:20},
    {name:"Mosquito (Rare)", health:1, attackPower:1, defensePower:1},
    {name:"Fly (Rare)", health:1, attackPower:1, defensePower:1},
    {name:"Porcupine", health:5, attackPower:7, defensePower:6},
    {name:"Monkey", health:5, attackPower:8, defensePower:8},

    // Strange
    {name:"Car (???)", health:30, attackPower:10, defensePower:10},
    {name:"Meteor (???)", health:1, attackPower:45, defensePower:1},
    {name:"Alien", health:1, attackPower:1, defensePower:30},
    {name:"Paper (???)", health:1, attackPower:1, defensePower:1},
    {name:"Robot", health:9, attackPower:1, defensePower:9},
    {name:"Cheese (???)", health:2, attackPower:2, defensePower:2},
    {name:"Truck (???)", health:1, attackPower:35, defensePower:1},
    {name:"Toilet (???)", health:1, attackPower:3, defensePower:1},
    {name:"13 (???)", health:13, attackPower:13, defensePower:13},
    {name:"Fixer (???)", health:13, attackPower:13, defensePower:13},
    {name:"Round Tofu (???)", health:1, attackPower:1, defensePower:1},
    {name:"BOB (???)", health:1, attackPower:1, defensePower:1},
    {name:"TANK (???)", health:50, attackPower:30, defensePower:20},
    {name:"Jester (???)", health:33, attackPower:33, defensePower:33},

    // Monsters
    {name:"Goblin", health:20, attackPower:8, defensePower:3},
    {name:"Orc", health:33, attackPower:13, defensePower:3},
    {name:"Skeleton", health:25, attackPower:6, defensePower:2},
    {name:"Vampire", health:30, attackPower:15, defensePower:2},
    {name:"Slime", health:10, attackPower:5, defensePower:2},
    {name:"Zombie", health:28, attackPower:7, defensePower:3},
    {name:"Demon (Rare)", health:66, attackPower:6, defensePower:6},
    {name:"Golem (Rare)", health:50, attackPower:10, defensePower:10},
    {name:"Elf", health:20, attackPower:14, defensePower:7},
    {name:"Griffin (Rare)", health:23, attackPower:33, defensePower:8},
    {name:"Giant (Rare)", health:33, attackPower:33, defensePower:8},
    {name:"Bloodfiend (Rare)", health:23, attackPower:12, defensePower:8},
    {name:"Dragon (Rare)", health:33, attackPower:35, defensePower:15},

    // Mythology Bosses
    {name:"Cerberus, The Hell Gatekeeper (BOSS)", health:33, attackPower:23, defensePower:13},
    {name:"Kraken, The Sea Nightmare (BOSS)", health:60, attackPower:28, defensePower:10},
    {name:"Leviathan, The Absolute Abyss (BOSS)", health:45, attackPower:13, defensePower:13},
    {name:"Hydra, The Regenerating Terror (BOSS)", health:99, attackPower:9, defensePower:9},
    {name:"Medusa, The Snake Queen (BOSS)", health:36, attackPower:16, defensePower:26},
    {name:"Minotaurus, The Labyrinth King (BOSS)", health:50, attackPower:10, defensePower:10},
    {name:"Chimera, The Three Headed Monster (BOSS)", health:33, attackPower:23, defensePower:13},
    {name:"Cyclops, The One Eyed (BOSS)", health:55, attackPower:12, defensePower:12},
    {name:"Lucifer, The Fallen Angel (BOSS)", health:66, attackPower:66, defensePower:6},

    // Animal Bosses
    {name:"Megalodon, The Ancient Shark (BOSS)", health:45, attackPower:20, defensePower:13},
    {name:"Tyrannosaurusrex, The Apex Predator (BOSS)", health:45, attackPower:20, defensePower:13},
    {name:"Mammoth, The Artic Giant (BOSS)", health:35, attackPower:18, defensePower:9},

    // Other World Bosses
    {name:"%&*@!$, The Dragon of Freedom (BOSS)", health:70, attackPower:28, defensePower:12},
    {name:"@#$%^&, The Slime Devil (BOSS)", health:100, attackPower:38, defensePower:8},
    {name:"!*&^$%, The Shadow Thief (BOSS)", health:100, attackPower:42, defensePower:5},
    {name:"?@#$, The DOOM Slayer (BOSS)", health:120, attackPower:25, defensePower:10},
    {name:"&%, The Supreme Machine (BOSS)", health:50, attackPower:50, defensePower:10},
    {name:"*&^%$#, The Black Silence (BOSS)", health:100, attackPower:30, defensePower:10},
    {name:"$@!%*&, The Yellow Cantatiotura (BOSS)", health:100, attackPower:10, defensePower:10},
    {name:"%^&*@!$#, The Kairo Robot (BOSS)", health:100, attackPower:20, defensePower:10},
    {name:"!@#$%^, The Man Who Speaks in Hands (BOSS)", health:66, attackPower:66, defensePower:66},
    {name:"?*&^%$#, The Emanator of Nihility (BOSS)", health:99, attackPower:59, defensePower:29},
    {name:"@#$% &*!?, The Planter of Apocalypse (BOSS)", health:30, attackPower:20, defensePower:10},
    {name:"^&*%$, The Wither Storm (BOSS)", health:60, attackPower:40, defensePower:20},
    {name:"%$#@!, The Builderman (BOSS)", health:50, attackPower:30, defensePower:20},
    {name:"&*@, The Wall Of Flesh (BOSS)", health:130, attackPower:30, defensePower:20},
    {name:"!@#$%^&*@!, The Growganoth (BOSS)", health:100, attackPower:40, defensePower:40},
    {name:"%^&*@! $#@!, The Justiciar of Silence (BOSS)", health:100, attackPower:40, defensePower:40},
    {name:"!*$%&^, The Disgraced One (BOSS)", health:120, attackPower:22, defensePower:5},

    // Friends
    {name:"ReDoom, The Programmer of This Game (???)", health:42, attackPower:6, defensePower:9},
    {name:"Keriescen, The Programmer of This Game (???)", health:42, attackPower:6, defensePower:9},
    {name:"Unknown999GG, The Unknown Void (???)", health:42, attackPower:6, defensePower:9},
    {name:"Xmeet, The Nuclear Harbringer (???)", health:42, attackPower:6, defensePower:9},
    {name:"Feqed, The Mouse (777)", health:42, attackPower:6, defensePower:9},
    {name:"Phynax, The First King (???)", health:42, attackPower:6, defensePower:9},
    {name:"Dainzel, The Winter Veteran (???)", health:42, attackPower:6, defensePower:9},
    {name:"Pinsen, The Guitar Prince (???)", health:42, attackPower:6, defensePower:9},
    {name:"Nick894630, The Idiotic Bum (???)", health:42, attackPower:6, defensePower:9},
    {name:"Shinmon, The King of Destruction (???)", health:42, attackPower:6, defensePower:9},
];

/* ---------- tier classification & scaling weights ---------- */

const ENEMY_TIERS = { boss: [], rare: [], strange: [], normal: [] };
allEnemies.forEach(e => {
  if (e.name.includes('(BOSS)')) ENEMY_TIERS.boss.push(e);
  else if (e.name.includes('(Rare)')) ENEMY_TIERS.rare.push(e);
  else if (e.name.includes('(???)') || e.name.includes('(777)')) ENEMY_TIERS.strange.push(e);
  else ENEMY_TIERS.normal.push(e);
});

const TIER_INFO = {
  boss:    { chance: 0.08, scale: 1.35 },
  rare:    { chance: 0.15, scale: 1.15 },
  strange: { chance: 0.07, scale: 1.10 },
  normal:  { chance: 0.70, scale: 1.00 }
};

function pickTier(){
  const r = Math.random();
  let acc = 0;
  for (const key of ['boss', 'rare', 'strange', 'normal']) {
    acc += TIER_INFO[key].chance;
    if (r < acc) return key;
  }
  return 'normal';
}