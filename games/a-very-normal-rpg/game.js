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

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

/* ---------- status effects (buffs / debuffs / DoTs) ---------- */

const STATUS_LABELS = {
  poison: 'Poison', burn: 'Burn', defenseDown: 'Defense Down',
  atkDown: 'Attack Down', atkUp: 'Attack Up', defUp: 'Defense Up'
};
function statusLabel(type){ return STATUS_LABELS[type] || type; }

function effAttack(entity){
  let atk = entity.attackPower + (entity.weapon ? (entity.weapon.attackPower || 0) : 0);
  (entity.statuses || []).forEach(s => {
    if (s.type === 'atkUp') atk += s.amount;
    if (s.type === 'atkDown') atk -= s.amount;
  });
  return Math.max(0, atk);
}
function effDefense(entity){
  let def = entity.defensePower + (entity.armor ? (entity.armor.defensePower || 0) : 0);
  (entity.statuses || []).forEach(s => {
    if (s.type === 'defUp') def += s.amount;
    if (s.type === 'defenseDown') def -= s.amount;
  });
  return Math.max(0, def);
}

function applyStatus(entity, def){
  const existing = entity.statuses.find(s => s.type === def.type);
  if (existing) {
    existing.amount = Math.max(existing.amount, def.amount);
    existing.duration = Math.max(existing.duration, def.duration);
  } else {
    entity.statuses.push({ type: def.type, amount: def.amount, duration: def.duration });
  }
}

// Applied at the start of an entity's turn: ticks DoTs and expires timers.
function tickStatuses(entity){
  if (!entity.statuses || !entity.statuses.length) return;
  const remaining = [];
  entity.statuses.forEach(s => {
    if (s.type === 'poison' || s.type === 'burn') {
      entity.health -= s.amount;
      print(`${tag(s.type === 'burn' ? 'BURN' : 'PSN', 'tag-dmg')}${esc(entity.name)} takes ${s.amount} ${s.type} damage. ${healthBar(Math.max(0, entity.health), entity.maxHealth)}`, 'txt-enemy');
    }
    s.duration--;
    if (s.duration > 0) remaining.push(s);
    else print(`${tag('SYS', 'tag-sys')}${esc(entity.name)}'s ${statusLabel(s.type)} wears off.`);
  });
  entity.statuses = remaining;
}

/* ---------- classes ---------- */

class Enemy {
  constructor(name, health, attackPower, defensePower){
    this.name = name;
    this.health = health;
    this.maxHealth = health;
    this.attackPower = attackPower;
    this.defensePower = defensePower;
    this.statuses = [];
  }
  isAlive(){ return this.health > 0; }
  calculateDamageToTarget(target){
    let base = Math.floor(Math.random() * 10) + 1;
    const atk = effAttack(this);
    const def = effDefense(target);
    let dmg = base + atk - def;
    const crit = Math.random() < 0.08;
    if (crit) dmg = Math.round(dmg * 1.5);
    dmg = Math.max(1, dmg);
    return { dmg, crit };
  }
  attackTarget(target){
    const { dmg, crit } = this.calculateDamageToTarget(target);
    target.health -= dmg;
    const bar = healthBar(Math.max(0, target.health), target.maxHealth);
    if (crit) print(`${tag('CRIT','tag-warn')}${esc(this.name)} lands a brutal hit on <b>${esc(target.name)}</b> for <b>${dmg}</b> damage! ${bar}`, 'txt-enemy');
    else dmgEnemy(`${esc(this.name)} attacks ${esc(target.name)} for ${dmg} damage. ${bar}`);
  }
}

class Ally {
  constructor(name, health, attackPower, defensePower, opts){
    opts = opts || {};
    this.name = name;
    this.health = health;
    this.maxHealth = health;
    this.attackPower = attackPower;
    this.defensePower = defensePower;
    this.statuses = [];
    this.isHealer = !!opts.healer;
  }
  isAlive(){ return this.health > 0; }
}

class Player {
  constructor(name, money){
    this.name = name;
    this.health = 100;
    this.maxHealth = 100;
    this.defensePower = 5;
    this.attackPower = 25;
    this.mp = 20;
    this.maxMp = 20;
    this.level = 1;
    this.experience = 0;
    this.money = money;
    this.inventory = [];
    this.gear = [];               // owned but not equipped gear ids
    this.weapon = DEFAULT_WEAPON;
    this.armor = DEFAULT_ARMOR;
    this.statuses = [];
    this.unlockedSkills = [];
    this.pendingSkillChoice = null;
    this.party = [];              // active Ally instances
    this.hasUpgradedStats = false;
  }
  isAlive(){ return this.health > 0; }
  rng(){ return Math.floor(Math.random() * 10) + 1; }

  calculateDamage(enemy, multiplier){
    multiplier = multiplier || 1;
    let base = this.rng();
    const atk = effAttack(this);
    const def = effDefense(enemy);
    let dmg = base + atk - def;
    const crit = Math.random() < 0.12;
    if (crit) dmg = dmg * 1.5;
    dmg = Math.round(dmg * multiplier);
    dmg = Math.max(1, dmg);
    return { dmg, crit };
  }
  normalAttack(enemy){
    const { dmg, crit } = this.calculateDamage(enemy, 1);
    enemy.health -= dmg;
    const bar = healthBar(Math.max(0, enemy.health), enemy.maxHealth);
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
  hasSkill(id){ return this.unlockedSkills.includes(id); }

  // Called on every level-up; every other level offers a skill choice
  // if there's something new left to learn.
  queueSkillChoice(){
    const known = new Set(this.unlockedSkills);
    const pending = this.pendingSkillChoice || [];
    const candidates = SKILLS.filter(s => s.unlockLevel <= this.level && !known.has(s.id) && !pending.includes(s.id));
    if (!candidates.length) return;
    if (candidates.length === 1) {
      this.unlockedSkills.push(candidates[0].id);
      lvlMsg(`You've learned a new skill: <b>${esc(candidates[0].name)}</b>!`);
      return;
    }
    const pool = [...candidates];
    const pick1 = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const pick2 = pool[Math.floor(Math.random() * pool.length)];
    this.pendingSkillChoice = [pick1.id, pick2.id];
  }

  gainExperience(exp){
    this.experience += exp;
    sys(`You gained ${exp} experience.`);
    while (this.experience >= 100 * this.level) {
      this.experience -= 100 * this.level;
      this.level++;
      this.hasUpgradedStats = false;
      this.maxMp += 3;
      this.mp = this.maxMp;
      lvlMsg(`Level up! You are now level ${this.level}. A new stat boost is available.`);
      if (this.level % 2 === 0) this.queueSkillChoice();
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
    print(`Floor    <span class="txt-dim">:</span> ${currentFloor} <span class="txt-dim">(${Math.min(floorEncounters, encountersRequiredForFloor(currentFloor))}/${encountersRequiredForFloor(currentFloor)} cleared)</span>`);
    print(`Level    <span class="txt-dim">:</span> ${this.level} <span class="txt-dim">(XP ${this.experience}/${100 * this.level})</span>`);
    print(`Health   <span class="txt-dim">:</span> ${healthBar(this.health, this.maxHealth)}`);
    print(`Mana     <span class="txt-dim">:</span> ${this.mp}/${this.maxMp}`);
    print(`Attack   <span class="txt-dim">:</span> ${effAttack(this)} <span class="txt-dim">(base ${this.attackPower} + weapon ${this.weapon.attackPower || 0})</span>`);
    print(`Defense  <span class="txt-dim">:</span> ${effDefense(this)} <span class="txt-dim">(base ${this.defensePower} + armor ${this.armor.defensePower || 0})</span>`);
    print(`Weapon   <span class="txt-dim">:</span> ${esc(this.weapon.name)}`);
    print(`Armor    <span class="txt-dim">:</span> ${esc(this.armor.name)}`);
    print(`Gold     <span class="txt-dim">:</span> <span class="txt-loot">${this.money}</span>`);
    print(`Bag      <span class="txt-dim">:</span> ${this.inventory.length ? esc(this.inventory.map(p => `${p.name} x${p.qty}`).join(', ')) : 'empty'}`);
    print(`Gear     <span class="txt-dim">:</span> ${this.gear.length ? esc(this.gear.map(id => findEquipment(id).name).join(', ')) : 'none'}`);
    print(`Skills   <span class="txt-dim">:</span> ${this.unlockedSkills.length ? esc(this.unlockedSkills.map(id => findSkill(id).name).join(', ')) : 'none learned'}`);
    print(`Party    <span class="txt-dim">:</span> ${this.party.length ? esc(this.party.map(a => a.name).join(', ')) : 'traveling alone'} <span class="txt-dim">(${this.party.length + 1}/${PARTY_MAX + 1})</span>`);
  }
}

/* ---------- game state ---------- */

let player = null;
let currentState = "AWAITING_NAME";
let combat = null;          // active combat session, or null
let currentEvent = null;    // active event encounter, or null
let currentFloor = 1;
let floorEncounters = 0;
const FLOOR_BASE_REQUIRED = 4;
const PARTY_MAX = 3;        // + the player = 4 total, per design

function encountersRequiredForFloor(floor){
  return FLOOR_BASE_REQUIRED + Math.floor((floor - 1) * 1.5);
}

// Central "what next" router. Anything that finishes an action should call
// this instead of showMenu() directly, so a pending skill-choice prompt
// (queued mid-combat) always gets surfaced before the main menu.
function returnToMenu(){
  if (currentState === 'GAME_OVER') return;
  if (player.pendingSkillChoice && player.pendingSkillChoice.length) {
    currentState = 'SKILL_CHOICE_MENU';
    showSkillChoiceMenu();
  } else {
    currentState = 'MAIN_MENU';
    showMenu();
  }
}

/* ---------- menus ---------- */

function showMenu(){
  header('\n=== MAIN MENU ===');
  print(`<span class="txt-dim">1.</span> Explore`);
  print(`<span class="txt-dim">2.</span> Shop`);
  print(`<span class="txt-dim">3.</span> Upgrade Stats ${player.hasUpgradedStats ? '<span class="txt-dim">(used)</span>' : '<span class="txt-loot">(available!)</span>'}`);
  print(`<span class="txt-dim">4.</span> View Stats`);
  print(`<span class="txt-dim">5.</span> Use Item <span class="txt-dim">(${player.totalPotions()} carried)</span>`);
  print(`<span class="txt-dim">6.</span> Equipment`);
  print(`<span class="txt-dim">7.</span> Party <span class="txt-dim">(${player.party.length}/${PARTY_MAX})</span>`);
  print(`<span class="txt-dim">8.</span> Quit`);
  print(`<span class="txt-dim">(type a number, or a word like shop / fight / status / equip / party)</span>`);
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
  print(`<span class="txt-dim">8.</span> Buy Gear`);
  print(`<span class="txt-dim">9.</span> Exit Shop`);
  print(`<span class="txt-dim">Your gold:</span> <span class="txt-loot">${player.money}</span>`);
}

function gearShopPool(){
  return EQUIPMENT_ITEMS.filter(i => i.rarity === 'common' || i.rarity === 'uncommon');
}
function showGearShop(){
  header('\n=== BUY GEAR ===');
  print(`<span class="txt-dim">Rare & epic gear can't be bought - find it exploring, in battle, or from events.</span>`);
  gearShopPool().forEach((it, i) => {
    const stat = it.slot === 'weapon' ? `+${it.attackPower} ATK` : `+${it.defensePower} DEF`;
    print(`<span class="txt-dim">${i + 1}.</span> ${it.name} <span class="txt-dim">- ${it.price}g, ${it.slot} (${stat})</span>`);
  });
  print(`<span class="txt-dim">0.</span> Back to Shop`);
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

function showEquipMenu(){
  header('\n=== EQUIPMENT ===');
  print(`Weapon   <span class="txt-dim">:</span> ${esc(player.weapon.name)} <span class="txt-dim">(+${player.weapon.attackPower || 0} ATK)</span>`);
  print(`Armor    <span class="txt-dim">:</span> ${esc(player.armor.name)} <span class="txt-dim">(+${player.armor.defensePower || 0} DEF)</span>`);
  if (!player.gear.length) {
    print(`<span class="txt-dim">You have no other gear. Find some exploring, in battle, or in the shop.</span>`);
  } else {
    print(`<span class="txt-dim">-- Owned Gear --</span>`);
    player.gear.forEach((id, i) => {
      const it = findEquipment(id);
      const stat = it.slot === 'weapon' ? `+${it.attackPower} ATK` : `+${it.defensePower} DEF`;
      print(`<span class="txt-dim">${i + 1}.</span> ${it.name} <span class="txt-dim">(${it.slot}, ${stat}, ${it.rarity})</span>`);
    });
  }
  print(`<span class="txt-dim">0.</span> Back`);
}

function showPartyMenu(){
  header('\n=== PARTY ===');
  print(`<span class="txt-dim">-</span> ${esc(player.name)} (You) ${healthBar(player.health, player.maxHealth)}`);
  if (!player.party.length) {
    print(`<span class="txt-dim">You travel alone. Recruit allies during fights (bargain / power check) or from events.</span>`);
  } else {
    player.party.forEach((a, i) => {
      print(`<span class="txt-dim">${i + 1}.</span> ${esc(a.name)}${a.isHealer ? ' <span class="txt-dim">(healer)</span>' : ''} ${healthBar(Math.max(0, a.health), a.maxHealth)} <span class="txt-dim">(ATK ${a.attackPower} / DEF ${a.defensePower})</span>`);
    });
    print(`<span class="txt-dim">Type a number to dismiss that ally, or 0 to go back.</span>`);
  }
  print(`<span class="txt-dim">Party size: ${player.party.length + 1}/${PARTY_MAX + 1}</span>`);
  if (!player.party.length) print(`<span class="txt-dim">0.</span> Back`);
}

function showSkillChoiceMenu(){
  header('\n=== NEW TECHNIQUE AVAILABLE ===');
  sys('Choose a technique to master:');
  player.pendingSkillChoice.forEach((id, i) => {
    const s = findSkill(id);
    print(`<span class="txt-dim">${i + 1}.</span> <b>${esc(s.name)}</b> <span class="txt-dim">(MP ${s.mpCost})</span> - ${esc(s.desc)}`);
  });
}

/* ---------- enemy scaling ---------- */

// Picks a random enemy template, weighted so boss/rare/strange enemies
// are uncommon, then scales its stats with player level AND floor depth
// so the world keeps pace as you grow stronger and descend further.
function pickScaledEnemy(){
  const tier = pickTier();
  const pool = ENEMY_TIERS[tier].length ? ENEMY_TIERS[tier] : ENEMY_TIERS.normal;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const levelScale = 1 + (player.level - 1) * 0.12;
  const floorScale = 1 + (currentFloor - 1) * 0.15;
  const totalScale = levelScale * floorScale * TIER_INFO[tier].scale;
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

/* ---------- gear drops ---------- */

function pickWeightedGear(){
  const r = Math.random();
  let acc = 0;
  for (const rarity of ['common', 'uncommon', 'rare', 'epic']) {
    acc += RARITY_WEIGHTS[rarity];
    if (r < acc) {
      const pool = EQUIPMENT_ITEMS.filter(i => i.rarity === rarity);
      if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return EQUIPMENT_ITEMS[0];
}
function maybeDropGear(chance){
  if (Math.random() < chance) {
    const item = pickWeightedGear();
    player.gear.push(item.id);
    lootMsg(`You found a ${esc(item.name)}! Check Equipment to gear up.`);
    return true;
  }
  return false;
}

/* ---------- party / allies ---------- */

function convertEnemyToAlly(enemy){
  const cleanName = enemy.name.replace(/\s*\(.*?\)\s*/g, '').trim() || enemy.name;
  return new Ally(
    cleanName,
    Math.max(10, Math.round(enemy.maxHealth * 0.7)),
    Math.max(1, Math.round(enemy.attackPower * 0.6)),
    Math.max(0, Math.round(enemy.defensePower * 0.6))
  );
}

function addAllyToParty(ally){
  if (player.party.length >= PARTY_MAX) {
    warnMsg(`Your party is full (max ${PARTY_MAX + 1} including you). ${esc(ally.name)} wanders off.`);
    return false;
  }
  player.party.push(ally);
  lootMsg(`<b>${esc(ally.name)}</b> joins your party!`);
  return true;
}

function pickRandomAllyTemplate(){
  const t = ALLY_EVENT_POOL[Math.floor(Math.random() * ALLY_EVENT_POOL.length)];
  const scale = 1 + (player.level - 1) * 0.08;
  return {
    name: t.name,
    health: Math.round(t.health * scale),
    attackPower: Math.round(t.attackPower * scale),
    defensePower: Math.round(t.defensePower * scale),
    healer: t.healer
  };
}

// Ally AI during combat: healers triage the lowest-HP ally/player,
// otherwise everyone just attacks the enemy.
function allyAct(ally, enemy){
  if (!ally.isAlive() || !enemy || enemy.health <= 0) return;
  if (ally.isHealer) {
    const candidates = [player, ...player.party.filter(a => a.isAlive())];
    candidates.sort((a, b) => (a.health / a.maxHealth) - (b.health / b.maxHealth));
    const target = candidates[0];
    if (target.health / target.maxHealth < 0.6) {
      const healAmt = Math.round(ally.attackPower * 1.2) + 5;
      target.health = Math.min(target.maxHealth, target.health + healAmt);
      healMsg(`${esc(ally.name)} heals ${esc(target.name)} for ${healAmt} HP. ${healthBar(target.health, target.maxHealth)}`);
      return;
    }
  }
  const base = Math.floor(Math.random() * 6) + 1;
  const dmg = Math.max(1, base + ally.attackPower - enemy.defensePower);
  enemy.health -= dmg;
  hit(`${esc(ally.name)} strikes ${esc(enemy.name)} for ${dmg} damage. ${healthBar(Math.max(0, enemy.health), enemy.maxHealth)}`);
}

/* ---------- combat (event-driven state machine) ---------- */

function announceEncounter(enemy, tier, isAmbush){
  if (isAmbush) warnMsg(`You've been ambushed by <b>${esc(enemy.name)}</b>!`);
  else if (tier === 'boss') bossMsg(`A colossal presence rises before you: <b>${esc(enemy.name)}</b>!`);
  else if (tier === 'rare') lootMsg(`A rare encounter! <b>${esc(enemy.name)}</b> appears!`);
  else if (tier === 'strange') print(`${tag('???','tag-boss')}Something isn't right... <b>${esc(enemy.name)}</b> emerges!`, 'txt-boss');
  else sys(`You encounter <b>${esc(enemy.name)}</b>! Get ready to fight.`);
}

function startCombat(template, rewardMult, tier, opts){
  opts = opts || {};
  rewardMult = rewardMult || 1;
  const enemy = new Enemy(template.name, template.health, template.attackPower, template.defensePower);
  combat = {
    enemy,
    tier,
    rewardMult,
    recruitable: opts.recruitable !== false && tier !== 'boss',
    isFloorBoss: !!opts.isFloorBoss
  };
  currentState = 'COMBAT';
  announceEncounter(enemy, tier, opts.isAmbush);
  beginPlayerTurn();
}

function showCombatMenu(){
  header('\n=== COMBAT ===');
  print(`${esc(combat.enemy.name)} ${healthBar(Math.max(0, combat.enemy.health), combat.enemy.maxHealth)}`);
  print(`${esc(player.name)} ${healthBar(player.health, player.maxHealth)} <span class="txt-dim">MP</span> ${player.mp}/${player.maxMp}`);
  player.party.forEach(a => print(`${esc(a.name)} ${healthBar(Math.max(0, a.health), a.maxHealth)}`));
  const canRecruit = combat.recruitable && player.party.length < PARTY_MAX;
  print(`<span class="txt-dim">1.</span> Attack  <span class="txt-dim">2.</span> Skill  <span class="txt-dim">3.</span> Item  <span class="txt-dim">4.</span> Flee${canRecruit ? '  <span class="txt-dim">5.</span> Recruit' : ''}`);
}

function showSkillMenu(){
  header('\n=== CHOOSE A SKILL ===');
  player.unlockedSkills.forEach((id, i) => {
    const s = findSkill(id);
    print(`<span class="txt-dim">${i + 1}.</span> ${esc(s.name)} <span class="txt-dim">(MP ${s.mpCost})</span> - ${esc(s.desc)}`);
  });
  print(`<span class="txt-dim">0.</span> Cancel <span class="txt-dim">(MP ${player.mp}/${player.maxMp})</span>`);
}

function showRecruitMenu(){
  const bargainCost = Math.max(15, Math.round((combat.enemy.maxHealth + combat.enemy.attackPower + combat.enemy.defensePower) * 1.5));
  const checkChance = clamp(0.15 + (effAttack(player) - combat.enemy.defensePower) * 0.015, 0.05, 0.85);
  combat.bargainCost = bargainCost;
  combat.checkChance = checkChance;
  header('\n=== RECRUIT ===');
  print(`<span class="txt-dim">1.</span> Bargain - pay ${bargainCost}g for guaranteed recruitment <span class="txt-dim">(you have ${player.money}g)</span>`);
  print(`<span class="txt-dim">2.</span> Power Check - ~${Math.round(checkChance * 100)}% chance, free but risky if it fails`);
  print(`<span class="txt-dim">0.</span> Cancel`);
}

// Start of the player's turn: tick DoTs, then show the combat menu.
function beginPlayerTurn(){
  if (!combat) return;
  tickStatuses(player);
  if (!player.isAlive()) { gameOver(combat.enemy.name); return; }
  currentState = 'COMBAT';
  showCombatMenu();
}

// Called after the player's chosen action resolves. Runs ally turns,
// then the enemy's turn, then loops back to the player.
function afterPlayerAction(){
  if (!combat) return;
  if (combat.enemy.health <= 0) { winCombat(); return; }
  player.party.forEach(a => { if (combat && combat.enemy.health > 0) allyAct(a, combat.enemy); });
  if (!combat) return;
  if (combat.enemy.health <= 0) { winCombat(); return; }
  tickStatuses(combat.enemy);
  if (combat.enemy.health <= 0) { winCombat(); return; }
  enemyTurn();
}

function enemyTurn(){
  if (!combat) return;
  const targets = [{ ref: player, weight: 2 }, ...player.party.filter(a => a.isAlive()).map(a => ({ ref: a, weight: 1 }))];
  const totalWeight = targets.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  let target = targets[0].ref;
  for (const t of targets) {
    if (r < t.weight) { target = t.ref; break; }
    r -= t.weight;
  }
  combat.enemy.attackTarget(target);
  if (target === player && !player.isAlive()) { gameOver(combat.enemy.name); return; }
  if (target !== player && !target.isAlive()) warnMsg(`${esc(target.name)} has fallen in battle!`);
  beginPlayerTurn();
}

function attemptFlee(){
  const chance = 0.55;
  if (Math.random() < chance) {
    sys(`${esc(player.name)} flees from the battle!`);
    combat = null;
    returnToMenu();
  } else {
    warnMsg(`${esc(player.name)} tries to flee but fails!`);
    enemyTurn();
  }
}

function useSkillInCombat(skillId){
  const skill = findSkill(skillId);
  if (!skill) { warnMsg('Unknown skill.'); showCombatMenu(); return; }
  if (player.mp < skill.mpCost) {
    warnMsg(`Not enough MP for ${skill.name}. (Need ${skill.mpCost}, have ${player.mp})`);
    showCombatMenu();
    return;
  }
  player.mp -= skill.mpCost;
  if (skill.type === 'damage') {
    const { dmg, crit } = player.calculateDamage(combat.enemy, skill.mult);
    combat.enemy.health -= dmg;
    if (crit) print(`${tag('CRIT','tag-warn')}<b>${esc(player.name)}</b> unleashes <b>${esc(skill.name)}</b> on ${esc(combat.enemy.name)} for <b>${dmg}</b> damage!`, 'txt-player');
    else hit(`${esc(player.name)} uses <b>${esc(skill.name)}</b> on ${esc(combat.enemy.name)} for ${dmg} damage. ${healthBar(Math.max(0, combat.enemy.health), combat.enemy.maxHealth)}`);
    if (skill.debuff && Math.random() < skill.debuff.chance) {
      applyStatus(combat.enemy, skill.debuff);
      print(`${tag('SYS','tag-sys')}${esc(combat.enemy.name)} is afflicted with ${statusLabel(skill.debuff.type)}!`);
    }
  } else if (skill.type === 'heal') {
    const before = player.health;
    player.health = Math.min(player.maxHealth, player.health + skill.power);
    healMsg(`${esc(player.name)} uses <b>${esc(skill.name)}</b> and recovers ${player.health - before} HP. ${healthBar(player.health, player.maxHealth)}`);
  } else if (skill.type === 'buff') {
    applyStatus(player, skill.buff);
    lvlMsg(`${esc(player.name)} uses <b>${esc(skill.name)}</b>! ${statusLabel(skill.buff.type)} active.`);
  } else if (skill.type === 'debuff') {
    applyStatus(combat.enemy, skill.debuff);
    warnMsg(`${esc(player.name)} uses <b>${esc(skill.name)}</b> on ${esc(combat.enemy.name)}!`);
  }
  afterPlayerAction();
}

function winCombat(){
  const enemy = combat.enemy;
  const rewardMult = combat.rewardMult;
  const wasBoss = combat.isFloorBoss;
  lootMsg(`${esc(enemy.name)} has been defeated!`);
  const moneyReward = Math.round((10 + enemy.maxHealth + enemy.attackPower + enemy.defensePower) * rewardMult);
  player.money += moneyReward;
  lootMsg(`You earned ${moneyReward} gold. (Total: ${player.money})`);
  const expGained = Math.round((45 + enemy.maxHealth + enemy.attackPower + enemy.defensePower) * rewardMult);
  player.gainExperience(expGained);
  maybeDropGear(wasBoss ? 0.9 : 0.25);

  // surviving allies recover a bit, downed allies are patched back up
  player.party.forEach(a => {
    if (a.health <= 0) a.health = 1;
    else a.health = Math.min(a.maxHealth, a.health + Math.round(a.maxHealth * 0.15));
  });

  if (wasBoss) {
    currentFloor++;
    floorEncounters = 0;
    bossMsg(`You have conquered Floor ${currentFloor - 1}! The world grows more dangerous as you descend to Floor ${currentFloor}.`);
  } else {
    floorEncounters++;
    sys(`Floor ${currentFloor} progress: ${Math.min(floorEncounters, encountersRequiredForFloor(currentFloor))}/${encountersRequiredForFloor(currentFloor)} encounters cleared.`);
  }

  combat = null;
  battleRecap();
  returnToMenu();
}

/* ---------- exploration ---------- */

function battleRecap(){
  print(`<span class="txt-dim">HP:</span> ${healthBar(player.health, player.maxHealth)}   <span class="txt-dim">Gold:</span> <span class="txt-loot">${player.money}</span>`);
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
  startCombat(buffed, 1.6, tier, { isAmbush: true });
}

function startFloorBoss(){
  const pool = ENEMY_TIERS.boss.length ? ENEMY_TIERS.boss : ENEMY_TIERS.normal;
  const base = pool[Math.floor(Math.random() * pool.length)];
  const floorScale = 1 + (currentFloor - 1) * 0.25;
  const levelScale = 1 + (player.level - 1) * 0.12;
  const totalScale = floorScale * levelScale * 1.35;
  const template = {
    name: base.name,
    health: Math.max(1, Math.round(base.health * totalScale)),
    attackPower: Math.max(1, Math.round(base.attackPower * totalScale)),
    defensePower: Math.max(0, Math.round(base.defensePower * totalScale))
  };
  bossMsg(`Floor ${currentFloor}'s guardian emerges to bar your path!`);
  startCombat(template, 1.8, 'boss', { recruitable: false, isFloorBoss: true });
}

/* ---------- events ---------- */

function renderEventChoices(){
  header(`\n=== ${currentEvent.title.toUpperCase()} ===`);
  print(esc(currentEvent.text));
  currentEvent.choices.forEach((c, i) => {
    const costLabel = c.cost ? ` <span class="txt-dim">(${c.cost}g)</span>` : '';
    print(`<span class="txt-dim">${i + 1}.</span> ${esc(c.label)}${costLabel}`);
  });
}

function triggerEvent(){
  currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  currentState = 'EVENT_MENU';
  renderEventChoices();
}

function resolveEventOutcome(choice){
  const o = choice.outcome;
  switch (o.type) {
    case 'nothing':
      sys('Nothing happens. You move on.');
      break;
    case 'heal':
      player.health = player.maxHealth;
      healMsg(`${esc(player.name)} feels completely restored! ${healthBar(player.health, player.maxHealth)}`);
      break;
    case 'buff':
      player[o.stat] += o.amount;
      lootMsg(`Your ${o.stat === 'attackPower' ? 'Attack' : 'Defense'} increased by ${o.amount}!`);
      break;
    case 'gearOrTrap':
      if (Math.random() < 0.7) {
        maybeDropGear(1);
      } else {
        const dmg = 5 + Math.floor(Math.random() * 10);
        player.health = Math.max(1, player.health - dmg);
        warnMsg(`It was trapped! You take ${dmg} damage. ${healthBar(player.health, player.maxHealth)}`);
      }
      break;
    case 'trapOrTreasure':
      if (Math.random() < 0.5) {
        doTreasure();
      } else {
        const dmg = 5 + Math.floor(Math.random() * 10);
        player.health = Math.max(1, player.health - dmg);
        warnMsg(`A trap springs! You take ${dmg} damage. ${healthBar(player.health, player.maxHealth)}`);
      }
      break;
    case 'allyPaid': {
      const t = pickRandomAllyTemplate();
      addAllyToParty(new Ally(t.name, t.health, t.attackPower, t.defensePower, { healer: t.healer }));
      break;
    }
    case 'allyPowerCheck': {
      const chance = clamp(0.3 + player.level * 0.03, 0.2, 0.85);
      if (Math.random() < chance) {
        const t = pickRandomAllyTemplate();
        addAllyToParty(new Ally(t.name, t.health, t.attackPower, t.defensePower, { healer: t.healer }));
      } else {
        warnMsg('They were not impressed and walk away.');
      }
      break;
    }
    case 'skill': {
      const candidates = SKILLS.filter(s => s.unlockLevel <= player.level + 2 && !player.hasSkill(s.id));
      if (candidates.length) {
        const s = candidates[Math.floor(Math.random() * candidates.length)];
        player.unlockedSkills.push(s.id);
        lvlMsg(`The trainer teaches you <b>${esc(s.name)}</b>!`);
      } else {
        player.maxMp += 5; player.mp = player.maxMp;
        lootMsg('You already know every technique they could teach. They show you a breathing exercise instead. Max MP +5!');
      }
      break;
    }
  }
}

function explore(){
  if (combat) return;
  if (floorEncounters >= encountersRequiredForFloor(currentFloor)) {
    startFloorBoss();
    return;
  }
  const r = Math.random();
  if (r < 0.42) {
    const { template, tier } = pickScaledEnemy();
    startCombat(template, 1, tier);
  } else if (r < 0.55) {
    doTreasure(); returnToMenu();
  } else if (r < 0.68) {
    doFindItem(); returnToMenu();
  } else if (r < 0.78) {
    maybeDropGear(1); returnToMenu();
  } else if (r < 0.92) {
    triggerEvent();
  } else {
    doAmbush();
  }
}

function gameOver(enemyName){
  currentState = 'GAME_OVER';
  combat = null;
  warnMsg(`${esc(player.name)} has fallen to ${esc(enemyName)}...`);
  sys(`Your journey ends here. [SIMULATION TERMINATED]`);
  sys(`Type <b>restart</b> to begin a new adventure.`);
}

/* ---------- input handling ---------- */

const ALIASES = {
  explore:'1', fight:'1', shop:'2', upgrade:'3',
  stats:'4', status:'4', use:'5', item:'5', items:'5',
  equip:'6', equipment:'6', gear:'6',
  party:'7', allies:'7',
  quit:'8', exit:'8'
};

const COMBAT_ALIASES = {
  attack:'1', atk:'1', skill:'2', skills:'2',
  item:'3', use:'3', flee:'4', run:'4', recruit:'5'
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
    combat = null;
    currentEvent = null;
    currentFloor = 1;
    floorEncounters = 0;
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
        currentState = 'EQUIP_MENU';
        showEquipMenu();
        break;
      case '7':
        currentState = 'PARTY_MENU';
        showPartyMenu();
        break;
      case '8':
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
      currentState = 'SHOP_GEAR';
      showGearShop();
    } else if (cleanInput === '9') {
      returnToMenu();
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

  if (currentState === 'SHOP_GEAR') {
    if (cleanInput === '0') {
      currentState = 'SHOP_MENU';
      showShop();
      return;
    }
    const pool = gearShopPool();
    const idx = parseInt(cleanInput, 10) - 1;
    const item = pool[idx];
    if (!item || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showGearShop();
      return;
    }
    if (player.money < item.price) {
      warnMsg(`Not enough gold for ${item.name}. (Need ${item.price}g, have ${player.money}g)`);
      showGearShop();
      return;
    }
    player.money -= item.price;
    player.gear.push(item.id);
    lootMsg(`Purchased ${item.name}! Check Equipment to equip it. (${player.money}g left)`);
    showGearShop();
    return;
  }

  if (currentState === 'ITEM_MENU') {
    if (cleanInput === '0') {
      returnToMenu();
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
    returnToMenu();
    return;
  }

  if (currentState === 'EQUIP_MENU') {
    if (cleanInput === '0') {
      returnToMenu();
      return;
    }
    const idx = parseInt(cleanInput, 10) - 1;
    const itemId = player.gear[idx];
    const item = itemId && findEquipment(itemId);
    if (!item || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showEquipMenu();
      return;
    }
    const old = item.slot === 'weapon' ? player.weapon : player.armor;
    if (item.slot === 'weapon') player.weapon = item; else player.armor = item;
    player.gear.splice(idx, 1);
    if (old && old.id !== 'w_fists' && old.id !== 'a_rags') player.gear.push(old.id);
    lootMsg(`Equipped ${item.name}.`);
    showEquipMenu();
    return;
  }

  if (currentState === 'PARTY_MENU') {
    if (cleanInput === '0') {
      returnToMenu();
      return;
    }
    if (!player.party.length) {
      warnMsg('Invalid choice.');
      showPartyMenu();
      return;
    }
    const idx = parseInt(cleanInput, 10) - 1;
    const ally = player.party[idx];
    if (!ally || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showPartyMenu();
      return;
    }
    player.party.splice(idx, 1);
    sys(`${esc(ally.name)} leaves your party.`);
    showPartyMenu();
    return;
  }

  if (currentState === 'UPGRADE_MENU') {
    if (cleanInput === '0') {
      returnToMenu();
      return;
    }
    if (!/^[1-3]$/.test(cleanInput)) {
      warnMsg('Invalid choice.');
      showUpgradeMenu();
      return;
    }
    player.upgradeStats(parseInt(cleanInput, 10));
    returnToMenu();
    return;
  }

  if (currentState === 'SKILL_CHOICE_MENU') {
    const choices = player.pendingSkillChoice || [];
    const idx = parseInt(cleanInput, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= choices.length) {
      warnMsg('Invalid selection.');
      showSkillChoiceMenu();
      return;
    }
    const skill = findSkill(choices[idx]);
    player.unlockedSkills.push(skill.id);
    player.pendingSkillChoice = null;
    lvlMsg(`You've learned <b>${esc(skill.name)}</b>!`);
    returnToMenu();
    return;
  }

  if (currentState === 'EVENT_MENU') {
    const idx = parseInt(cleanInput, 10) - 1;
    const choice = currentEvent && currentEvent.choices[idx];
    if (!choice || isNaN(idx)) {
      warnMsg('Invalid choice.');
      renderEventChoices();
      return;
    }
    if (choice.cost && player.money < choice.cost) {
      warnMsg(`Not enough gold. Need ${choice.cost}g, have ${player.money}g.`);
      renderEventChoices();
      return;
    }
    if (choice.cost) player.money -= choice.cost;
    resolveEventOutcome(choice);
    currentEvent = null;
    returnToMenu();
    return;
  }

  if (currentState === 'COMBAT') {
    const cmd = COMBAT_ALIASES[lower] || cleanInput;
    switch (cmd) {
      case '1':
        player.normalAttack(combat.enemy);
        afterPlayerAction();
        break;
      case '2':
        if (!player.unlockedSkills.length) {
          warnMsg('You have not learned any skills yet.');
          showCombatMenu();
        } else {
          currentState = 'COMBAT_SKILL_MENU';
          showSkillMenu();
        }
        break;
      case '3':
        if (!player.inventory.length) {
          warnMsg('You have no items to use.');
          showCombatMenu();
        } else {
          currentState = 'COMBAT_ITEM_MENU';
          showItemMenu();
        }
        break;
      case '4':
        attemptFlee();
        break;
      case '5':
        if (combat.recruitable && player.party.length < PARTY_MAX) {
          currentState = 'COMBAT_RECRUIT_MENU';
          showRecruitMenu();
        } else {
          warnMsg('There is no one here to recruit.');
          showCombatMenu();
        }
        break;
      default:
        warnMsg('Invalid choice. (attack / skill / item / flee)');
        showCombatMenu();
        break;
    }
    return;
  }

  if (currentState === 'COMBAT_SKILL_MENU') {
    if (cleanInput === '0') {
      currentState = 'COMBAT';
      showCombatMenu();
      return;
    }
    const idx = parseInt(cleanInput, 10) - 1;
    const skillId = player.unlockedSkills[idx];
    if (!skillId || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showSkillMenu();
      return;
    }
    currentState = 'COMBAT';
    useSkillInCombat(skillId);
    return;
  }

  if (currentState === 'COMBAT_ITEM_MENU') {
    if (cleanInput === '0') {
      currentState = 'COMBAT';
      showCombatMenu();
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
    currentState = 'COMBAT';
    afterPlayerAction();
    return;
  }

  if (currentState === 'COMBAT_RECRUIT_MENU') {
    if (cleanInput === '0') {
      currentState = 'COMBAT';
      showCombatMenu();
      return;
    }
    if (cleanInput === '1') {
      if (player.money < combat.bargainCost) {
        warnMsg(`Not enough gold. Need ${combat.bargainCost}g.`);
        showRecruitMenu();
        return;
      }
      player.money -= combat.bargainCost;
      addAllyToParty(convertEnemyToAlly(combat.enemy));
      combat = null;
      returnToMenu();
      return;
    }
    if (cleanInput === '2') {
      if (Math.random() < combat.checkChance) {
        addAllyToParty(convertEnemyToAlly(combat.enemy));
        combat = null;
        returnToMenu();
      } else {
        warnMsg(`${esc(combat.enemy.name)} refuses and lashes out!`);
        currentState = 'COMBAT';
        enemyTurn();
      }
      return;
    }
    warnMsg('Invalid choice.');
    showRecruitMenu();
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