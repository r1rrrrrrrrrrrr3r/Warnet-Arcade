const outputDiv = document.getElementById('output');
const commandInput = document.getElementById('command-input');

/* ---------- rendering helpers ---------- */

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function print(html, cls){
  const div = document.createElement('div');
  div.className = 'line' + (cls ? (' ' + cls) : '');
  div.innerHTML = html;
  outputDiv.appendChild(div);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

function tag(label, cls){ return `<span class="tag ${cls}">${label}</span>`; }

function sys(msg){ print(`${tag('SYS','tag-sys')}${msg}`, 'txt-sys'); }
function cmdEcho(msg){ print(`${tag('CMD','tag-cmd')}<span class="txt-dim">${esc(msg)}</span>`); }
function hit(msg){ print(`${tag('HIT','tag-hit')}${msg}`); }
function dmgEnemy(msg){ print(`${tag('DMG','tag-dmg')}${msg}`, 'txt-enemy'); }
function healMsg(msg){ print(`${tag('HEAL','tag-heal')}${msg}`, 'txt-player'); }
function lootMsg(msg){ print(`${tag('LOOT','tag-loot')}${msg}`, 'txt-loot'); }
function lvlMsg(msg){ print(`${tag('LVL','tag-lvl')}${msg}`, 'txt-boss'); }
function warnMsg(msg){ print(`${tag('WARN','tag-warn')}${msg}`, 'txt-enemy'); }
function bossMsg(msg){ print(`${tag('BOSS','tag-boss')}${msg}`, 'txt-boss'); }
function header(msg){ print(`<span class="txt-header">${msg}</span>`); }
function blank(){ print('&nbsp;'); }

function healthBar(current, max, width){
  width = width || 18;
  current = Math.max(0, current);
  const ratio = max > 0 ? current / max : 0;
  const filled = Math.max(0, Math.min(width, Math.round(ratio * width)));
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const cls = ratio < 0.3 ? 'bar-low' : (ratio < 0.6 ? 'bar-mid' : 'bar-high');
  return `<span class="${cls}">[${bar}]</span> ${current}/${max}`;
}

/* ---------- data ---------- */

const SHOP_ITEMS = [
  { id:'minor',     name:'Minor Potion',    kind:'heal', heal:15, price:10, sell:3  },
  { id:'health',    name:'Health Potion',   kind:'heal', heal:35, price:20, sell:7  },
  { id:'elixir',    name:'Greater Elixir',  kind:'heal', heal:70, price:45, sell:15 },
  { id:'whetstone', name:'Whetstone',       kind:'atk',  amount:3,  price:40 },
  { id:'ironplate', name:'Iron Plate',      kind:'def',  amount:3,  price:40 },
  { id:'charm',     name:'Vitality Charm',  kind:'hp',   amount:15, price:55 }
];
function findShopItem(id){ return SHOP_ITEMS.find(i => i.id === id); }

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

/* ---------- classes ---------- */

class Enemy {
  constructor(name, health, attackPower, defensePower){
    this.name = name;
    this.health = health;
    this.maxHealth = health;
    this.attackPower = attackPower;
    this.defensePower = defensePower;
  }
  calculateDamageToPlayer(player){
    let base = Math.floor(Math.random() * 10) + 1;
    let dmg = base + this.attackPower - player.defensePower;
    const crit = Math.random() < 0.08;
    if (crit) dmg = Math.round(dmg * 1.5);
    dmg = Math.max(1, dmg);
    return { dmg, crit };
  }
  attackPlayer(player){
    const { dmg, crit } = this.calculateDamageToPlayer(player);
    player.health -= dmg;
    const bar = healthBar(player.health, player.maxHealth);
    if (crit) print(`${tag('CRIT','tag-warn')}${esc(this.name)} lands a brutal hit on <b>${esc(player.name)}</b> for <b>${dmg}</b> damage! ${bar}`, 'txt-enemy');
    else dmgEnemy(`${esc(this.name)} attacks ${esc(player.name)} for ${dmg} damage. ${bar}`);
  }
}

class Player {
  constructor(name, money){
    this.name = name;
    this.health = 100;
    this.maxHealth = 100;
    this.defensePower = 5;
    this.attackPower = 25;
    this.level = 1;
    this.experience = 0;
    this.money = money;
    this.inventory = [];
    this.hasUpgradedStats = false;
  }
  isAlive(){ return this.health > 0; }
  rng(){ return Math.floor(Math.random() * 10) + 1; }

  calculateDamage(enemy){
    let base = Math.floor(Math.random() * 10) + 1;
    let dmg = base + this.attackPower - enemy.defensePower;
    const crit = Math.random() < 0.12;
    if (crit) dmg = Math.round(dmg * 1.5);
    dmg = Math.max(1, dmg);
    return { dmg, crit };
  }
  normalAttack(enemy){
    const { dmg, crit } = this.calculateDamage(enemy);
    enemy.health -= dmg;
    const bar = healthBar(enemy.health, enemy.maxHealth);
    if (crit) print(`${tag('CRIT','tag-warn')}<b>${esc(this.name)}</b> lands a critical hit on ${esc(enemy.name)} for <b>${dmg}</b> damage! ${bar}`, 'txt-player');
    else hit(`${esc(this.name)} strikes ${esc(enemy.name)} for ${dmg} damage. ${bar}`);
  }

  addPotion(id, qty){
    qty = qty || 1;
    const def = findShopItem(id);
    const entry = this.inventory.find(p => p.id === id);
    if (entry) entry.qty += qty;
    else this.inventory.push({ id: def.id, name: def.name, heal: def.heal, qty: qty });
  }

  totalPotions(){ return this.inventory.reduce((sum, p) => sum + p.qty, 0); }

  gainExperience(exp){
    this.experience += exp;
    sys(`You gained ${exp} experience.`);
    while (this.experience >= 100 * this.level) {
      this.experience -= 100 * this.level;
      this.level++;
      this.hasUpgradedStats = false;
      lvlMsg(`Level up! You are now level ${this.level}. A new stat boost is available.`);
    }
  }

  upgradeStats(choice){
    const roll = this.rng();
    if (choice === 1) {
      this.maxHealth += roll; this.health = this.maxHealth;
      lvlMsg(`Your vitality grows! Max HP +${roll} (now ${this.maxHealth}).`);
    } else if (choice === 2) {
      this.attackPower += roll;
      lvlMsg(`Your strength grows! Attack +${roll} (now ${this.attackPower}).`);
    } else {
      this.defensePower += roll;
      lvlMsg(`Your fortitude grows! Defense +${roll} (now ${this.defensePower}).`);
    }
    this.hasUpgradedStats = true;
  }

  statusPanel(){
    header('\n=== STATUS ===');
    print(`Name     <span class="txt-dim">:</span> ${esc(this.name)}`);
    print(`Level    <span class="txt-dim">:</span> ${this.level} <span class="txt-dim">(XP ${this.experience}/${100 * this.level})</span>`);
    print(`Health   <span class="txt-dim">:</span> ${healthBar(this.health, this.maxHealth)}`);
    print(`Attack   <span class="txt-dim">:</span> ${this.attackPower}`);
    print(`Defense  <span class="txt-dim">:</span> ${this.defensePower}`);
    print(`Gold     <span class="txt-dim">:</span> <span class="txt-loot">${this.money}</span>`);
    print(`Bag      <span class="txt-dim">:</span> ${this.inventory.length ? esc(this.inventory.map(p => `${p.name} x${p.qty}`).join(', ')) : 'empty'}`);
  }
}

/* ---------- game state ---------- */

let player = null;
let currentState = "AWAITING_NAME";

/* ---------- menus ---------- */

function showMenu(){
  header('\n=== MAIN MENU ===');
  print(`<span class="txt-dim">1.</span> Explore`);
  print(`<span class="txt-dim">2.</span> Shop`);
  print(`<span class="txt-dim">3.</span> Upgrade Stats ${player.hasUpgradedStats ? '<span class="txt-dim">(used)</span>' : '<span class="txt-loot">(available!)</span>'}`);
  print(`<span class="txt-dim">4.</span> View Stats`);
  print(`<span class="txt-dim">5.</span> Use Item <span class="txt-dim">(${player.totalPotions()} carried)</span>`);
  print(`<span class="txt-dim">6.</span> Quit`);
  print(`<span class="txt-dim">(type a number, or a word like shop / fight / status)</span>`);
}

function showShop(){
  header('\n=== SHOP ===');
  print(`<span class="txt-dim">-- Potions --</span>`);
  SHOP_ITEMS.filter(i => i.kind === 'heal').forEach((it, i) => {
    const owned = player.inventory.find(p => p.id === it.id);
    print(`<span class="txt-dim">${i + 1}.</span> ${it.name} <span class="txt-dim">- ${it.price}g, heals ${it.heal} HP</span>${owned ? ` <span class="txt-loot">(x${owned.qty})</span>` : ''}`);
  });
  print(`<span class="txt-dim">-- Upgrades (permanent) --</span>`);
  SHOP_ITEMS.filter(i => i.kind !== 'heal').forEach((it, i) => {
    const label = it.kind === 'atk' ? `+${it.amount} ATK` : it.kind === 'def' ? `+${it.amount} DEF` : `+${it.amount} Max HP & full heal`;
    print(`<span class="txt-dim">${i + 4}.</span> ${it.name} <span class="txt-dim">- ${it.price}g, ${label}</span>`);
  });
  print(`<span class="txt-dim">7.</span> Sell a Potion`);
  print(`<span class="txt-dim">8.</span> Exit Shop`);
  print(`<span class="txt-dim">Your gold:</span> <span class="txt-loot">${player.money}</span>`);
}

function showSellMenu(){
  header('\n=== SELL POTIONS ===');
  player.inventory.forEach((p, i) => {
    const def = findShopItem(p.id);
    print(`<span class="txt-dim">${i + 1}.</span> ${p.name} x${p.qty} <span class="txt-dim">(sell ${def.sell}g each)</span>`);
  });
  print(`<span class="txt-dim">0.</span> Cancel`);
}

function showItemMenu(){
  header('\n=== USE ITEM ===');
  player.inventory.forEach((p, i) => {
    print(`<span class="txt-dim">${i + 1}.</span> ${p.name} x${p.qty} <span class="txt-dim">(heals ${p.heal} HP)</span>`);
  });
  print(`<span class="txt-dim">0.</span> Cancel`);
}

function showUpgradeMenu(){
  header('\n=== CHOOSE YOUR BOOST ===');
  print(`<span class="txt-dim">1.</span> Vitality <span class="txt-dim">(Max HP)</span>`);
  print(`<span class="txt-dim">2.</span> Strength <span class="txt-dim">(Attack)</span>`);
  print(`<span class="txt-dim">3.</span> Fortitude <span class="txt-dim">(Defense)</span>`);
  print(`<span class="txt-dim">0.</span> Cancel`);
}

/* ---------- enemy tiers & scaling ---------- */

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
  strange: { chance: 0.12, scale: 1.10 },
  normal:  { chance: 0.65, scale: 1.00 }
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

// Picks a random enemy template, weighted so boss/rare/strange enemies
// are uncommon, then scales its stats up with both player level and
// its tier so the world keeps pace as you grow stronger.
function pickScaledEnemy(){
  const tier = pickTier();
  const pool = ENEMY_TIERS[tier].length ? ENEMY_TIERS[tier] : ENEMY_TIERS.normal;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const levelScale = 1 + (player.level - 1) * 0.12;
  const totalScale = levelScale * TIER_INFO[tier].scale;
  return {
    tier,
    template: {
      name: base.name,
      health: Math.max(1, Math.round(base.health * totalScale)),
      attackPower: Math.max(1, Math.round(base.attackPower * totalScale)),
      defensePower: Math.max(0, Math.round(base.defensePower * totalScale))
    }
  };
}

/* ---------- combat & exploration ---------- */

function battleRecap(){
  print(`<span class="txt-dim">HP:</span> ${healthBar(player.health, player.maxHealth)}   <span class="txt-dim">Gold:</span> <span class="txt-loot">${player.money}</span>`);
}

function runCombat(template, rewardMult, tier){
  rewardMult = rewardMult || 1;
  const enemy = new Enemy(template.name, template.health, template.attackPower, template.defensePower);

  if (tier === 'boss' || template.name.includes('(BOSS)')) bossMsg(`A colossal presence rises before you: <b>${esc(enemy.name)}</b>!`);
  else if (tier === 'rare' || template.name.includes('(Rare)')) lootMsg(`A rare encounter! <b>${esc(enemy.name)}</b> appears!`);
  else if (tier === 'strange' || template.name.includes('(???)')) print(`${tag('???','tag-boss')}Something isn't right... <b>${esc(enemy.name)}</b> emerges!`, 'txt-boss');
  else sys(`You encounter <b>${esc(enemy.name)}</b>! Get ready to fight.`);

  while (player.isAlive() && enemy.health > 0) {
    player.normalAttack(enemy);
    if (enemy.health <= 0) {
      lootMsg(`${esc(enemy.name)} has been defeated!`);
      const moneyReward = Math.round((10 + template.health + template.attackPower + template.defensePower) * rewardMult);
      player.money += moneyReward;
      lootMsg(`You earned ${moneyReward} gold. (Total: ${player.money})`);
      const expGained = Math.round((45 + template.health + template.attackPower + template.defensePower) * rewardMult);
      player.gainExperience(expGained);
      break;
    }
    enemy.attackPlayer(player);
  }

  if (!player.isAlive()) {
    gameOver(enemy.name);
  } else {
    battleRecap();
    showMenu();
  }
}

function doTreasure(){
  const amount = 5 + Math.floor(Math.random() * 10) + player.level * 2;
  player.money += amount;
  lootMsg(`You stumble upon a hidden stash of coins! +${amount} gold. (Total: ${player.money})`);
}

function doFindItem(){
  const pool = ['minor', 'minor', 'minor', 'health', 'health', 'elixir'];
  const id = pool[Math.floor(Math.random() * pool.length)];
  const def = findShopItem(id);
  player.addPotion(id, 1);
  lootMsg(`You find a ${def.name} lying on the ground and pick it up!`);
}

function doAmbush(){
  const { template, tier } = pickScaledEnemy();
  const buffed = {
    name: `${template.name} (Ambush)`,
    health: Math.round(template.health * 1.3) + 3,
    attackPower: Math.round(template.attackPower * 1.2) + 2,
    defensePower: Math.round(template.defensePower * 1.1)
  };
  warnMsg(`You've been ambushed!`);
  runCombat(buffed, 1.6, tier);
}

function explore(){
  const r = Math.random();
  if (r < 0.60) {
    const { template, tier } = pickScaledEnemy();
    runCombat(template, 1, tier);
  } else if (r < 0.75) {
    doTreasure(); showMenu();
  } else if (r < 0.90) {
    doFindItem(); showMenu();
  } else {
    doAmbush();
  }
}

function gameOver(enemyName){
  currentState = 'GAME_OVER';
  warnMsg(`${esc(player.name)} has fallen to ${esc(enemyName)}...`);
  sys(`Your journey ends here. [SIMULATION TERMINATED]`);
  sys(`Type <b>restart</b> to begin a new adventure.`);
}

/* ---------- input handling ---------- */

const ALIASES = {
  explore:'1', fight:'1', shop:'2', upgrade:'3',
  stats:'4', status:'4', use:'5', item:'5', items:'5',
  quit:'6', exit:'6'
};

function processCommand(raw){
  const cleanInput = raw.trim();
  cmdEcho(cleanInput || '(empty)');
  const lower = cleanInput.toLowerCase();

  if (currentState === 'GAME_OVER') {
    if (lower === 'restart') {
      header('\n=== NEW GAME ===');
      currentState = 'AWAITING_NAME';
      commandInput.disabled = false;
      sys('What is your name?');
    } else {
      sys(`Type <b>restart</b> to play again.`);
    }
    return;
  }

  if (currentState === 'AWAITING_NAME') {
    if (cleanInput.length > 20) {
      sys('That name is too long! Try something shorter (20 characters max).');
      return;
    }
    const startingMoney = Math.floor(Math.random() * 11) + 5;
    player = new Player(cleanInput || 'Hero', startingMoney);
    sys(`${esc(player.name)}... That's your name, right? How could you have forgotten it? You suddenly lose consciousness again, and the interface of this strange RPG game opens up.`);
    currentState = 'MAIN_MENU';
    showMenu();
    return;
  }

  if (currentState === 'MAIN_MENU') {
    const cmd = ALIASES[lower] || cleanInput;
    switch (cmd) {
      case '1':
        explore();
        break;
      case '2':
        currentState = 'SHOP_MENU';
        showShop();
        break;
      case '3':
        if (player.hasUpgradedStats) {
          sys('You have already claimed your stat boost for this level.');
          showMenu();
        } else {
          currentState = 'UPGRADE_MENU';
          showUpgradeMenu();
        }
        break;
      case '4':
        player.statusPanel();
        showMenu();
        break;
      case '5':
        if (player.inventory.length === 0) {
          sys('Your bag is empty. There is nothing to use.');
          showMenu();
        } else {
          currentState = 'ITEM_MENU';
          showItemMenu();
        }
        break;
      case '6':
        sys('You step back from this strange world.');
        sys('Thanks for playing! Refresh the page to start a new adventure.');
        commandInput.disabled = true;
        break;
      default:
        warnMsg('Invalid choice. Please enter a valid option.');
        showMenu();
        break;
    }
    return;
  }

  if (currentState === 'SHOP_MENU') {
    if (/^[1-6]$/.test(cleanInput)) {
      const item = SHOP_ITEMS[parseInt(cleanInput, 10) - 1];
      if (player.money < item.price) {
        warnMsg(`Not enough gold for ${item.name}. (Need ${item.price}g, have ${player.money}g)`);
      } else {
        player.money -= item.price;
        if (item.kind === 'heal') {
          player.addPotion(item.id, 1);
          lootMsg(`Purchased ${item.name}. (${player.money}g left)`);
        } else if (item.kind === 'atk') {
          player.attackPower += item.amount;
          lootMsg(`Purchased ${item.name}! Attack +${item.amount} (now ${player.attackPower}).`);
        } else if (item.kind === 'def') {
          player.defensePower += item.amount;
          lootMsg(`Purchased ${item.name}! Defense +${item.amount} (now ${player.defensePower}).`);
        } else if (item.kind === 'hp') {
          player.maxHealth += item.amount;
          player.health = player.maxHealth;
          lootMsg(`Purchased ${item.name}! Max HP +${item.amount} (now ${player.maxHealth}), fully healed.`);
        }
      }
      showShop();
    } else if (cleanInput === '7') {
      if (player.inventory.length === 0) {
        sys('You have no potions to sell.');
        showShop();
      } else {
        currentState = 'SHOP_SELL';
        showSellMenu();
      }
    } else if (cleanInput === '8') {
      currentState = 'MAIN_MENU';
      showMenu();
    } else {
      warnMsg('Invalid choice.');
      showShop();
    }
    return;
  }

  if (currentState === 'SHOP_SELL') {
    if (cleanInput === '0') {
      currentState = 'SHOP_MENU';
      showShop();
      return;
    }
    const idx = parseInt(cleanInput, 10) - 1;
    const entry = player.inventory[idx];
    if (!entry || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showSellMenu();
      return;
    }
    const def = findShopItem(entry.id);
    player.money += def.sell;
    entry.qty--;
    if (entry.qty <= 0) player.inventory.splice(idx, 1);
    lootMsg(`Sold 1 ${def.name} for ${def.sell}g. (${player.money}g total)`);
    currentState = 'SHOP_MENU';
    showShop();
    return;
  }

  if (currentState === 'ITEM_MENU') {
    if (cleanInput === '0') {
      currentState = 'MAIN_MENU';
      showMenu();
      return;
    }
    const idx = parseInt(cleanInput, 10) - 1;
    const entry = player.inventory[idx];
    if (!entry || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showItemMenu();
      return;
    }
    const before = player.health;
    player.health = Math.min(player.maxHealth, player.health + entry.heal);
    const healed = player.health - before;
    entry.qty--;
    if (entry.qty <= 0) player.inventory.splice(idx, 1);
    healMsg(`${esc(player.name)} uses ${entry.name} and recovers ${healed} HP. ${healthBar(player.health, player.maxHealth)}`);
    currentState = 'MAIN_MENU';
    showMenu();
    return;
  }

  if (currentState === 'UPGRADE_MENU') {
    if (cleanInput === '0') {
      currentState = 'MAIN_MENU';
      showMenu();
      return;
    }
    if (!/^[1-3]$/.test(cleanInput)) {
      warnMsg('Invalid choice.');
      showUpgradeMenu();
      return;
    }
    player.upgradeStats(parseInt(cleanInput, 10));
    currentState = 'MAIN_MENU';
    showMenu();
    return;
  }
}

commandInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    if (commandInput.disabled) return;
    const command = commandInput.value;
    processCommand(command);
    commandInput.value = '';
  }
});

/* ---------- boot ---------- */

(function init(){
  header('==============================');
  header('=== A Very Normal RPG Game ===');
  header('==============================');
  sys('You suddenly wake up in this game world. You are playing a very strange RPG game. You come to your senses.');
  sys('What is your name?');
})();