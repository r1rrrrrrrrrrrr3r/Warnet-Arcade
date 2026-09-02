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

/* ---------- rarity & enemy-tag coloring ---------- */

function rarityClass(rarity){ return 'rarity-' + (rarity || 'common'); }
function gearNameHtml(item){ return `<span class="${rarityClass(item.rarity)}">${esc(item.name)}</span>`; }

// Wraps the trailing "(BOSS)" / "(Rare)" / "(???)" / "(777)" tag embedded in
// an enemy's name with a colored inline span, leaving the rest of the name
// in the default color.
function formatEnemyName(rawName){
  return esc(rawName)
    .replace(/\((BOSS)\)/i, '<span class="tag-inline-boss">($1)</span>')
    .replace(/\((Rare)\)/i, '<span class="tag-inline-rare">($1)</span>')
    .replace(/\((\?\?\?)\)/, '<span class="tag-inline-strange">(???)</span>')
    .replace(/\((777)\)/, '<span class="tag-inline-strange">(777)</span>');
}

/* ---------- status effects (buffs / debuffs / DoTs) ---------- */

const STATUS_LABELS = {
  poison: 'Poison', burn: 'Burn', defenseDown: 'Defense Down',
  atkDown: 'Attack Down', atkUp: 'Attack Up', defUp: 'Defense Up'
};
function statusLabel(type){ return STATUS_LABELS[type] || type; }
const NEGATIVE_STATUSES = ['poison', 'burn', 'defenseDown', 'atkDown'];

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
    const base = Math.floor(Math.random() * 10) + 1;
    const atk = effAttack(this);
    const def = effDefense(target);
    const mitigation = 100 / (100 + def);
    let dmg = (base + atk) * mitigation;
    const crit = Math.random() < 0.08;
    if (crit) dmg *= 1.5;
    dmg = Math.max(1, Math.round(dmg));
    return { dmg, crit };
  }
  attackTarget(target){
    const { dmg, crit } = this.calculateDamageToTarget(target);
    target.health -= dmg;
    const bar = healthBar(Math.max(0, target.health), target.maxHealth);
    const nameHtml = formatEnemyName(this.name);
    if (crit) print(`${tag('CRIT','tag-warn')}${nameHtml} lands a brutal hit on <b>${esc(target.name)}</b> for <b>${dmg}</b> damage! ${bar}`, 'txt-enemy');
    else dmgEnemy(`${nameHtml} attacks ${esc(target.name)} for ${dmg} damage. ${bar}`);
  }
}

function computeRatio(value, base, fallback){
  return base > 0 ? value / base : fallback;
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
    // Ratios relative to the player's stats at the moment of recruitment.
    // syncToPlayer() uses these to keep the ally scaled to the player's
    // current power, so they don't fall behind in the late game.
    this.hpRatio = opts.hpRatio != null ? opts.hpRatio : 0.5;
    this.atkRatio = opts.atkRatio != null ? opts.atkRatio : 0.5;
    this.defRatio = opts.defRatio != null ? opts.defRatio : 0.4;
  }
  isAlive(){ return this.health > 0; }
  // Rescales this ally's stats to the player's current power level,
  // preserving their current HP percentage.
  syncToPlayer(p){
    const newMaxHealth = Math.max(10, Math.round(p.maxHealth * this.hpRatio));
    const hpPct = this.maxHealth > 0 ? this.health / this.maxHealth : 1;
    this.maxHealth = newMaxHealth;
    this.health = Math.round(newMaxHealth * hpPct);
    this.attackPower = Math.max(1, Math.round(effAttack(p) * this.atkRatio));
    this.defensePower = Math.max(0, Math.round(effDefense(p) * this.defRatio));
  }
}

function syncPartyToPlayer(){
  player.party.forEach(a => a.syncToPlayer(player));
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
    const base = this.rng();
    const atk = effAttack(this);
    const def = effDefense(enemy);
    const mitigation = 100 / (100 + def);
    let dmg = (base + atk) * mitigation;
    const crit = Math.random() < 0.12;
    if (crit) dmg *= 1.5;
    dmg = Math.max(1, Math.round(dmg * multiplier));
    return { dmg, crit };
  }
  normalAttack(enemy){
    const { dmg, crit } = this.calculateDamage(enemy, 1);
    enemy.health -= dmg;
    const bar = healthBar(Math.max(0, enemy.health), enemy.maxHealth);
    const nameHtml = formatEnemyName(enemy.name);
    if (crit) print(`${tag('CRIT','tag-warn')}<b>${esc(this.name)}</b> lands a critical hit on ${nameHtml} for <b>${dmg}</b> damage! ${bar}`, 'txt-player');
    else hit(`${esc(this.name)} strikes ${nameHtml} for ${dmg} damage. ${bar}`);
  }

  // Generic consumable handling: potions, mana draughts, and cures all
  // live in the same inventory array, distinguished by `kind`.
  addConsumable(id, qty){
    qty = qty || 1;
    const def = findShopItem(id);
    const entry = this.inventory.find(p => p.id === id);
    if (entry) entry.qty += qty;
    else this.inventory.push({ id: def.id, name: def.name, kind: def.kind, heal: def.heal, restore: def.restore, qty });
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
    print(`Weapon   <span class="txt-dim">:</span> ${gearNameHtml(this.weapon)}`);
    print(`Armor    <span class="txt-dim">:</span> ${gearNameHtml(this.armor)}`);
    print(`Gold     <span class="txt-dim">:</span> <span class="txt-loot">${this.money}</span>`);
    print(`Bag      <span class="txt-dim">:</span> ${this.inventory.length ? esc(this.inventory.map(p => `${p.name} x${p.qty}`).join(', ')) : 'empty'}`);
    print(`Gear     <span class="txt-dim">:</span> ${this.gear.length ? this.gear.map(id => gearNameHtml(findEquipment(id))).join(', ') : 'none'}`);
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
let exploreCounter = 0;     // drives the predictable event cadence
let pendingItemUse = null;  // { idx, fromCombat } while choosing who a consumable is used on
const FLOOR_BASE_REQUIRED = 4;
const PARTY_MAX = 3;        // + the player = 4 total, per design
const EVENT_INTERVAL = 4;   // every 4th explore guarantees an event (e.g. 3 encounters, then 1 event)

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
  print(`<span class="txt-dim">0.</span> Quit`);
  print(`<span class="txt-dim">(type a number, or a word like shop / fight / status / equip / party)</span>`);
}

function shopItemLabel(it){
  if (it.kind === 'heal') return `heals ${it.heal} HP`;
  if (it.kind === 'mp') return `restores ${it.restore} MP`;
  if (it.kind === 'cure') return `cures poison/burn/weakening effects`;
  if (it.kind === 'atk') return `+${it.amount} ATK (permanent)`;
  if (it.kind === 'def') return `+${it.amount} DEF (permanent)`;
  if (it.kind === 'hp') return `+${it.amount} Max HP & full heal (permanent)`;
  if (it.kind === 'maxmp') return `+${it.amount} Max MP & full restore (permanent)`;
  return '';
}

function potionMerchantItems(){
  return SHOP_ITEMS.filter(it => it.kind === 'heal' || it.kind === 'mp' || it.kind === 'cure');
}
function giftShopItems(){
  return SHOP_ITEMS.filter(it => it.kind === 'atk' || it.kind === 'def' || it.kind === 'hp' || it.kind === 'maxmp');
}
function gearShopPool(){
  return EQUIPMENT_ITEMS.filter(i => i.rarity === 'common' || i.rarity === 'uncommon');
}

// Shared pagination for any "browse your owned gear" list (Equipment menu,
// Blacksmith's sell-gear menu) so a big gear collection stays scannable.
const GEAR_PAGE_SIZE = 6;
let gearPage = 0;
function gearTotalPages(list){ return Math.max(1, Math.ceil(list.length / GEAR_PAGE_SIZE)); }
function gearPageItems(list, page){
  const start = page * GEAR_PAGE_SIZE;
  return list.slice(start, start + GEAR_PAGE_SIZE);
}
function gearPageFooter(list, page){
  const totalPages = gearTotalPages(list);
  if (totalPages <= 1) return '';
  return `<span class="txt-dim">Page ${page + 1}/${totalPages} - type n for next page, p for previous page</span>`;
}

function showShopHub(){
  header('\n=== SHOP ===');
  print(`<span class="txt-dim">1.</span> Potion Merchant <span class="txt-dim">(potions, mana, antidotes)</span>`);
  print(`<span class="txt-dim">2.</span> Blacksmith <span class="txt-dim">(buy & sell weapons/armor)</span>`);
  print(`<span class="txt-dim">3.</span> Gift Shop <span class="txt-dim">(permanent stat boosts)</span>`);
  print(`<span class="txt-dim">0.</span> Back`);
  print(`<span class="txt-dim">Your gold:</span> <span class="txt-loot">${player.money}</span>`);
}

function showPotionMerchant(){
  header('\n=== POTION MERCHANT ===');
  const items = potionMerchantItems();
  items.forEach((it, i) => {
    const owned = player.inventory.find(p => p.id === it.id);
    print(`<span class="txt-dim">${i + 1}.</span> ${it.name} <span class="txt-dim">- ${it.price}g, ${shopItemLabel(it)}</span>${owned ? ` <span class="txt-loot">(x${owned.qty})</span>` : ''}`);
  });
  print(`<span class="txt-dim">${items.length + 1}.</span> Sell a Potion`);
  print(`<span class="txt-dim">0.</span> Back`);
  print(`<span class="txt-dim">Your gold:</span> <span class="txt-loot">${player.money}</span>`);
}

function showPotionSellMenu(){
  header('\n=== SELL POTIONS ===');
  if (!player.inventory.length) {
    print(`<span class="txt-dim">You have nothing to sell.</span>`);
  } else {
    player.inventory.forEach((p, i) => {
      const def = findShopItem(p.id);
      print(`<span class="txt-dim">${i + 1}.</span> ${p.name} x${p.qty} <span class="txt-dim">(sell ${def.sell}g each)</span>`);
    });
  }
  print(`<span class="txt-dim">0.</span> Cancel`);
}

function showGiftShop(){
  header('\n=== GIFT SHOP ===');
  print(`<span class="txt-dim">Permanent boosts, applied immediately.</span>`);
  giftShopItems().forEach((it, i) => {
    print(`<span class="txt-dim">${i + 1}.</span> ${it.name} <span class="txt-dim">- ${it.price}g, ${shopItemLabel(it)}</span>`);
  });
  print(`<span class="txt-dim">0.</span> Back`);
  print(`<span class="txt-dim">Your gold:</span> <span class="txt-loot">${player.money}</span>`);
}

function showBlacksmith(){
  header('\n=== BLACKSMITH ===');
  print(`<span class="txt-dim">Rare, epic & legendary gear can't be bought - find it exploring, in battle, or from events.</span>`);
  const pool = gearShopPool();
  pool.forEach((it, i) => {
    const stat = it.slot === 'weapon' ? `+${it.attackPower} ATK` : `+${it.defensePower} DEF`;
    print(`<span class="txt-dim">${i + 1}.</span> ${gearNameHtml(it)} <span class="txt-dim">- ${it.price}g, ${it.slot} (${stat})</span>`);
  });
  print(`<span class="txt-dim">${pool.length + 1}.</span> Sell Gear <span class="txt-dim">(${player.gear.length} owned)</span>`);
  print(`<span class="txt-dim">0.</span> Back`);
  print(`<span class="txt-dim">Your gold:</span> <span class="txt-loot">${player.money}</span>`);
}

function showBlacksmithSellMenu(){
  header('\n=== SELL GEAR ===');
  if (!player.gear.length) {
    print(`<span class="txt-dim">You have no gear to sell.</span>`);
  } else {
    const totalPages = gearTotalPages(player.gear);
    if (gearPage >= totalPages) gearPage = totalPages - 1;
    gearPageItems(player.gear, gearPage).forEach((id, i) => {
      const it = findEquipment(id);
      print(`<span class="txt-dim">${i + 1}.</span> ${gearNameHtml(it)} <span class="txt-dim">(${it.rarity}, sell ${it.sell}g)</span>`);
    });
    const footer = gearPageFooter(player.gear, gearPage);
    if (footer) print(footer);
  }
  print(`<span class="txt-dim">0.</span> Cancel`);
}

function itemDetailLabel(p){
  if (p.kind === 'heal') return `heals ${p.heal} HP`;
  if (p.kind === 'mp') return `restores ${p.restore} MP`;
  if (p.kind === 'cure') return `cures ailments`;
  return '';
}
function showItemMenu(){
  header('\n=== USE ITEM ===');
  player.inventory.forEach((p, i) => {
    print(`<span class="txt-dim">${i + 1}.</span> ${p.name} x${p.qty} <span class="txt-dim">(${itemDetailLabel(p)})</span>`);
  });
  print(`<span class="txt-dim">0.</span> Cancel`);
}

function showItemTargetMenu(){
  const entry = player.inventory[pendingItemUse.idx];
  header('\n=== USE ON WHO? ===');
  print(`<span class="txt-dim">Using:</span> ${esc(entry.name)}`);
  print(`<span class="txt-dim">1.</span> ${esc(player.name)} (You) ${healthBar(player.health, player.maxHealth)}`);
  player.party.forEach((a, i) => {
    print(`<span class="txt-dim">${i + 2}.</span> ${esc(a.name)} ${healthBar(Math.max(0, a.health), a.maxHealth)}`);
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
  print(`Weapon   <span class="txt-dim">:</span> ${gearNameHtml(player.weapon)} <span class="txt-dim">(+${player.weapon.attackPower || 0} ATK)</span>`);
  print(`Armor    <span class="txt-dim">:</span> ${gearNameHtml(player.armor)} <span class="txt-dim">(+${player.armor.defensePower || 0} DEF)</span>`);
  if (!player.gear.length) {
    print(`<span class="txt-dim">You have no other gear. Find some exploring, in battle, or in the shop.</span>`);
  } else {
    const totalPages = gearTotalPages(player.gear);
    if (gearPage >= totalPages) gearPage = totalPages - 1;
    print(`<span class="txt-dim">-- Owned Gear --</span>`);
    gearPageItems(player.gear, gearPage).forEach((id, i) => {
      const it = findEquipment(id);
      const stat = it.slot === 'weapon' ? `+${it.attackPower} ATK` : `+${it.defensePower} DEF`;
      print(`<span class="txt-dim">${i + 1}.</span> ${gearNameHtml(it)} <span class="txt-dim">(${it.slot}, ${stat}, ${it.rarity})</span>`);
    });
    const footer = gearPageFooter(player.gear, gearPage);
    if (footer) print(footer);
  }
  print(`<span class="txt-dim">0.</span> Back`);
}

function showPartyMenu(){
  syncPartyToPlayer();
  header('\n=== PARTY ===');
  print(`<span class="txt-dim">-</span> ${esc(player.name)} (You) ${healthBar(player.health, player.maxHealth)}`);
  if (!player.party.length) {
    print(`<span class="txt-dim">You travel alone. Recruit allies during fights (bargain / power check) or from events.</span>`);
  } else {
    player.party.forEach((a, i) => {
      print(`<span class="txt-dim">${i + 1}.</span> ${esc(a.name)}${a.isHealer ? ' <span class="txt-dim">(healer)</span>' : ''} ${healthBar(Math.max(0, a.health), a.maxHealth)} <span class="txt-dim">(ATK ${a.attackPower} / DEF ${a.defensePower})</span>`);
    });
    print(`<span class="txt-dim">Type a number to dismiss that ally.</span>`);
  }
  print(`<span class="txt-dim">Party size: ${player.party.length + 1}/${PARTY_MAX + 1}</span>`);
  print(`<span class="txt-dim">0.</span> Back`);
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

function highestTier(tiers){
  const order = ['boss', 'rare', 'strange', 'normal'];
  for (const t of order) if (tiers.includes(t)) return t;
  return 'normal';
}

// How many enemies you could face this fight scales with your party size:
// solo adventurers only ever face 1, but each ally raises the ceiling
// (2 allies -> up to 2 enemies possible), capped at 4 as the party grows.
function maxPartyEnemyCap(){
  return Math.max(1, Math.min(4, player.party.length));
}
function rollEnemyCount(){
  const maxEnemies = maxPartyEnemyCap();
  if (maxEnemies <= 1) return 1;
  const r = Math.random();
  let acc = 0;
  for (const n of [4, 3, 2]) {
    if (maxEnemies >= n) {
      const chance = n === 4 ? 0.05 : n === 3 ? 0.15 : 0.35;
      acc += chance;
      if (r < acc) return n;
    }
  }
  return 1;
}

/* ---------- gear drops ---------- */

function pickWeightedGear(){
  const r = Math.random();
  let acc = 0;
  for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary']) {
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
    lootMsg(`You found a ${gearNameHtml(item)}! Check Equipment to gear up.`);
    return true;
  }
  return false;
}

/* ---------- consumable effects (potions usable on self or allies) ---------- */

function applyConsumable(entry, target){
  if (entry.kind === 'heal') {
    const before = target.health;
    target.health = Math.min(target.maxHealth, target.health + entry.heal);
    const healed = target.health - before;
    if (target === player) healMsg(`${esc(player.name)} uses ${entry.name} and recovers ${healed} HP. ${healthBar(target.health, target.maxHealth)}`);
    else healMsg(`${esc(player.name)} gives ${esc(target.name)} a ${entry.name}, healing ${healed} HP. ${healthBar(target.health, target.maxHealth)}`);
  } else if (entry.kind === 'mp') {
    const before = player.mp;
    player.mp = Math.min(player.maxMp, player.mp + entry.restore);
    healMsg(`${esc(player.name)} uses ${entry.name} and recovers ${player.mp - before} MP. (${player.mp}/${player.maxMp})`);
  } else if (entry.kind === 'cure') {
    const hadStatus = (target.statuses || []).some(s => NEGATIVE_STATUSES.includes(s.type));
    target.statuses = (target.statuses || []).filter(s => !NEGATIVE_STATUSES.includes(s.type));
    const who = target === player ? esc(player.name) : esc(target.name);
    if (hadStatus) healMsg(`${esc(player.name)} uses ${entry.name} on ${who}, clearing all ailments!`);
    else sys(`${who} had no ailments - the ${entry.name} is used anyway.`);
  }
}
function applyConsumableAndConsume(idx, target){
  const entry = player.inventory[idx];
  if (!entry) return;
  applyConsumable(entry, target);
  entry.qty--;
  if (entry.qty <= 0) player.inventory.splice(idx, 1);
}

/* ---------- party / allies ---------- */

function convertEnemyToAlly(enemy){
  const cleanName = enemy.name.replace(/\s*\(.*?\)\s*/g, '').trim() || enemy.name;
  const rawHp = Math.max(10, Math.round(enemy.maxHealth * 0.7));
  const rawAtk = Math.max(1, Math.round(enemy.attackPower * 0.6));
  const rawDef = Math.max(0, Math.round(enemy.defensePower * 0.6));
  return new Ally(cleanName, rawHp, rawAtk, rawDef, {
    hpRatio: computeRatio(rawHp, player.maxHealth, 0.5),
    atkRatio: computeRatio(rawAtk, effAttack(player), 0.5),
    defRatio: computeRatio(rawDef, effDefense(player), 0.4)
  });
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

function makeAllyFromTemplate(t){
  return new Ally(t.name, t.health, t.attackPower, t.defensePower, {
    healer: t.healer,
    hpRatio: computeRatio(t.health, player.maxHealth, 0.5),
    atkRatio: computeRatio(t.attackPower, effAttack(player), 0.4),
    defRatio: computeRatio(t.defensePower, effDefense(player), 0.35)
  });
}

// Ally AI during combat: healers triage the lowest-HP ally/player,
// otherwise everyone just picks a random alive enemy to attack.
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
  const mitigation = 100 / (100 + effDefense(enemy));
  const crit = Math.random() < 0.08;
  let dmg = (base + ally.attackPower) * mitigation;
  if (crit) dmg *= 1.5;
  dmg = Math.max(1, Math.round(dmg));
  enemy.health -= dmg;
  const critTag = crit ? `${tag('CRIT','tag-warn')}` : '';
  hit(`${critTag}${esc(ally.name)} strikes ${formatEnemyName(enemy.name)} for ${dmg} damage. ${healthBar(Math.max(0, enemy.health), enemy.maxHealth)}`);
}

/* ---------- combat (event-driven state machine, supports multiple enemies) ---------- */

function announceEncounter(enemies, tier, isAmbush){
  const names = enemies.map(e => formatEnemyName(e.name));
  const label = names.length > 1 ? names.map(n => `<b>${n}</b>`).join(', ') : `<b>${names[0]}</b>`;
  if (isAmbush) warnMsg(`You've been ambushed by ${label}!`);
  else if (tier === 'boss') bossMsg(`A colossal presence rises before you: ${label}!`);
  else if (tier === 'rare') lootMsg(`A rare encounter! ${label} appears!`);
  else if (tier === 'strange') print(`${tag('???','tag-boss')}Something isn't right... ${label} emerges!`, 'txt-boss');
  else if (enemies.length > 1) sys(`You encounter a group: ${label}! Get ready to fight.`);
  else sys(`You encounter ${label}! Get ready to fight.`);
}

function startCombat(templates, rewardMult, tier, opts){
  opts = opts || {};
  rewardMult = rewardMult || 1;
  const list = Array.isArray(templates) ? templates : [templates];
  const enemies = list.map(t => new Enemy(t.name, t.health, t.attackPower, t.defensePower));
  combat = {
    enemies,
    tier,
    rewardMult,
    recruitable: opts.recruitable !== false && tier !== 'boss',
    isFloorBoss: !!opts.isFloorBoss,
    pendingAction: null
  };
  syncPartyToPlayer();
  currentState = 'COMBAT';
  announceEncounter(enemies, tier, opts.isAmbush);
  beginPlayerTurn();
}

function showCombatMenu(){
  header('\n=== COMBAT ===');
  const multi = combat.enemies.length > 1;
  combat.enemies.forEach((e, i) => {
    if (e.isAlive()) print(`${multi ? `<span class="txt-dim">${i + 1}.</span> ` : ''}${formatEnemyName(e.name)} ${healthBar(e.health, e.maxHealth)}`);
  });
  print(`${esc(player.name)} ${healthBar(player.health, player.maxHealth)} <span class="txt-dim">MP</span> ${player.mp}/${player.maxMp}`);
  player.party.forEach(a => print(`${esc(a.name)} ${healthBar(Math.max(0, a.health), a.maxHealth)}`));
  const aliveCount = combat.enemies.filter(e => e.isAlive()).length;
  const canRecruit = combat.recruitable && aliveCount === 1 && player.party.length < PARTY_MAX;
  print(`<span class="txt-dim">1.</span> Attack  <span class="txt-dim">2.</span> Skill  <span class="txt-dim">3.</span> Item  <span class="txt-dim">4.</span> Flee${canRecruit ? '  <span class="txt-dim">5.</span> Recruit' : ''}`);
}

function showTargetMenu(){
  header('\n=== CHOOSE TARGET ===');
  combat.enemies.forEach((e, i) => {
    if (e.isAlive()) print(`<span class="txt-dim">${i + 1}.</span> ${formatEnemyName(e.name)} ${healthBar(e.health, e.maxHealth)}`);
  });
  print(`<span class="txt-dim">0.</span> Cancel`);
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
  const target = combat.enemies.find(e => e.isAlive());
  const bargainCost = Math.max(15, Math.round((target.maxHealth + target.attackPower + target.defensePower) * 1.5));
  const checkChance = clamp(0.15 + (effAttack(player) - target.defensePower) * 0.015, 0.05, 0.85);
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
  if (!player.isAlive()) {
    const culprit = combat.enemies.find(e => e.isAlive()) || combat.enemies[0];
    gameOver(culprit ? culprit.name : 'the poison coursing through your veins');
    return;
  }
  currentState = 'COMBAT';
  showCombatMenu();
}

// Called after the player's chosen action resolves. Runs ally turns
// (each picks a random alive enemy), then the enemy turn, then loops
// back to the player.
function afterPlayerAction(){
  if (!combat) return;
  if (combat.enemies.every(e => !e.isAlive())) { winCombat(); return; }
  player.party.forEach(a => {
    if (!combat) return;
    const aliveEnemies = combat.enemies.filter(e => e.isAlive());
    if (a.isAlive() && aliveEnemies.length) allyAct(a, aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]);
  });
  if (!combat) return;
  if (combat.enemies.every(e => !e.isAlive())) { winCombat(); return; }
  combat.enemies.forEach(e => { if (e.isAlive()) tickStatuses(e); });
  if (combat.enemies.every(e => !e.isAlive())) { winCombat(); return; }
  enemyTurn();
}

function enemyTurn(){
  if (!combat) return;
  const aliveEnemies = combat.enemies.filter(e => e.isAlive());
  for (const enemy of aliveEnemies) {
    if (!player.isAlive()) return;
    const targets = [{ ref: player, weight: 2 }, ...player.party.filter(a => a.isAlive()).map(a => ({ ref: a, weight: 1 }))];
    if (!targets.length) break;
    const totalWeight = targets.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * totalWeight;
    let target = targets[0].ref;
    for (const t of targets) {
      if (r < t.weight) { target = t.ref; break; }
      r -= t.weight;
    }
    enemy.attackTarget(target);
    if (target === player && !player.isAlive()) { gameOver(enemy.name); return; }
    if (target !== player && !target.isAlive()) warnMsg(`${esc(target.name)} has fallen in battle!`);
  }
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

// target is only needed for damage/debuff/drain skills when more than one
// enemy is alive; heal/buff/restoreMp always act on the player.
function useSkillInCombat(skillId, target){
  const skill = findSkill(skillId);
  if (!skill) { warnMsg('Unknown skill.'); showCombatMenu(); return; }
  if (player.mp < skill.mpCost) {
    warnMsg(`Not enough MP for ${skill.name}. (Need ${skill.mpCost}, have ${player.mp})`);
    showCombatMenu();
    return;
  }
  player.mp -= skill.mpCost;

  if (skill.type === 'damage' || skill.type === 'drain') {
    if (!target) target = combat.enemies.find(e => e.isAlive());
    if (!target) { showCombatMenu(); return; }
    const { dmg, crit } = player.calculateDamage(target, skill.mult);
    target.health -= dmg;
    const nameHtml = formatEnemyName(target.name);
    if (crit) print(`${tag('CRIT','tag-warn')}<b>${esc(player.name)}</b> unleashes <b>${esc(skill.name)}</b> on ${nameHtml} for <b>${dmg}</b> damage!`, 'txt-player');
    else hit(`${esc(player.name)} uses <b>${esc(skill.name)}</b> on ${nameHtml} for ${dmg} damage. ${healthBar(Math.max(0, target.health), target.maxHealth)}`);
    if (skill.debuff && Math.random() < skill.debuff.chance) {
      applyStatus(target, skill.debuff);
      print(`${tag('SYS','tag-sys')}${nameHtml} is afflicted with ${statusLabel(skill.debuff.type)}!`);
    }
    if (skill.type === 'drain') {
      const healAmt = Math.round(dmg * (skill.drainPct || 0.5));
      const before = player.health;
      player.health = Math.min(player.maxHealth, player.health + healAmt);
      healMsg(`${esc(player.name)} drains ${player.health - before} HP from the strike. ${healthBar(player.health, player.maxHealth)}`);
    }
  } else if (skill.type === 'debuff') {
    if (!target) target = combat.enemies.find(e => e.isAlive());
    if (!target) { showCombatMenu(); return; }
    applyStatus(target, skill.debuff);
    warnMsg(`${esc(player.name)} uses <b>${esc(skill.name)}</b> on ${formatEnemyName(target.name)}!`);
  } else if (skill.type === 'heal') {
    const before = player.health;
    player.health = Math.min(player.maxHealth, player.health + skill.power);
    healMsg(`${esc(player.name)} uses <b>${esc(skill.name)}</b> and recovers ${player.health - before} HP. ${healthBar(player.health, player.maxHealth)}`);
  } else if (skill.type === 'restoreMp') {
    const before = player.mp;
    player.mp = Math.min(player.maxMp, player.mp + skill.power);
    healMsg(`${esc(player.name)} uses <b>${esc(skill.name)}</b> and recovers ${player.mp - before} MP. (${player.mp}/${player.maxMp})`);
  } else if (skill.type === 'buff') {
    applyStatus(player, skill.buff);
    if (skill.selfDebuff) applyStatus(player, skill.selfDebuff);
    lvlMsg(`${esc(player.name)} uses <b>${esc(skill.name)}</b>! ${statusLabel(skill.buff.type)} active${skill.selfDebuff ? ` (and ${statusLabel(skill.selfDebuff.type)})` : ''}.`);
  }
  afterPlayerAction();
}

function winCombat(){
  const enemies = combat.enemies;
  const rewardMult = combat.rewardMult;
  const wasBoss = combat.isFloorBoss;
  const label = enemies.length > 1 ? 'The group has' : `${formatEnemyName(enemies[0].name)} has`;
  lootMsg(`${label} been defeated!`);

  const statSum = enemies.reduce((acc, e) => acc + e.maxHealth + e.attackPower + e.defensePower, 0);
  const moneyReward = Math.max(1, Math.round((3 * enemies.length + statSum * 0.15) * rewardMult));
  player.money += moneyReward;
  lootMsg(`You earned ${moneyReward} gold. (Total: ${player.money})`);
  const expGained = Math.round((45 * enemies.length + statSum) * rewardMult);
  player.gainExperience(expGained);
  enemies.forEach(() => maybeDropGear(wasBoss ? 0.9 : 0.18));

  // re-sync ally stats first in case this kill just leveled the player up,
  // then heal everyone 25% of their (now current) max HP - a downed ally
  // comes back at 25% rather than a token 1 HP
  syncPartyToPlayer();
  player.party.forEach(a => {
    const healAmt = Math.round(a.maxHealth * 0.25);
    if (a.health <= 0) a.health = Math.min(a.maxHealth, healAmt);
    else a.health = Math.min(a.maxHealth, a.health + healAmt);
  });

  if (wasBoss) {
    currentFloor++;
    floorEncounters = 0;
    exploreCounter = 0;
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

const FIND_ITEM_POOL = ['minor', 'minor', 'minor', 'health', 'health', 'elixir', 'mana', 'antidote'];
function doFindItem(){
  const id = FIND_ITEM_POOL[Math.floor(Math.random() * FIND_ITEM_POOL.length)];
  const def = findShopItem(id);
  player.addConsumable(id, 1);
  lootMsg(`You find a ${def.name} lying on the ground and pick it up!`);
}

function doAmbush(){
  const count = rollEnemyCount();
  const templates = [];
  const tiers = [];
  for (let i = 0; i < count; i++) {
    const { template, tier } = pickScaledEnemy();
    templates.push({
      name: `${template.name} (Ambush)`,
      health: Math.round(template.health * 1.3) + 3,
      attackPower: Math.round(template.attackPower * 1.2) + 2,
      defensePower: Math.round(template.defensePower * 1.1)
    });
    tiers.push(tier);
  }
  startCombat(templates, 1.6, highestTier(tiers), { isAmbush: true });
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
  print(`<span class="txt-dim">0.</span> Leave`);
}

function triggerEvent(){
  currentEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  currentState = 'EVENT_MENU';
  renderEventChoices();
}

function grantRandomConsumable(){
  const pool = ['minor', 'health', 'elixir', 'mana', 'greatmana', 'antidote'];
  const id = pool[Math.floor(Math.random() * pool.length)];
  const def = findShopItem(id);
  player.addConsumable(id, 1);
  lootMsg(`You found a ${def.name}!`);
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
      addAllyToParty(makeAllyFromTemplate(t));
      break;
    }
    case 'allyPowerCheck': {
      const chance = clamp(0.3 + player.level * 0.03, 0.2, 0.85);
      if (Math.random() < chance) {
        const t = pickRandomAllyTemplate();
        addAllyToParty(makeAllyFromTemplate(t));
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
    case 'item':
      grantRandomConsumable();
      break;
    case 'haggle': {
      const chance = clamp(0.35 + player.level * 0.02, 0.25, 0.7);
      if (Math.random() < chance) grantRandomConsumable();
      else sys('The haggling fails. The merchant shrugs and packs up.');
      break;
    }
    case 'wishBuff': {
      const roll = Math.random();
      if (roll < 0.34) { player.attackPower += 2; lootMsg('The well grants you strength! Attack +2.'); }
      else if (roll < 0.67) { player.defensePower += 2; lootMsg('The well grants you resilience! Defense +2.'); }
      else { player.mp = player.maxMp; healMsg(`${esc(player.name)}'s mana is fully restored!`); }
      break;
    }
    case 'partyHeal': {
      player.health = player.maxHealth;
      player.party.forEach(a => { a.health = a.maxHealth; });
      healMsg(`Everyone rests and recovers fully. ${healthBar(player.health, player.maxHealth)}`);
      break;
    }
    case 'wagerStrength': {
      const chance = clamp(0.4 + (player.attackPower - 25) * 0.005, 0.2, 0.8);
      if (Math.random() < chance) {
        const winnings = choice.cost * 2;
        player.money += winnings;
        lootMsg(`You win the arm-wrestle! You collect ${winnings}g.`);
      } else {
        warnMsg('You lose the arm-wrestle. The brawler pockets your wager.');
      }
      break;
    }
    case 'curseForPower': {
      player.attackPower += 4;
      applyStatus(player, { type: 'defenseDown', amount: 5, duration: 3 });
      warnMsg(`Dark power surges through you! Attack +4 permanently, but your Defense feels weakened for a while.`);
      break;
    }
    case 'statTrade': {
      const gainAmt = o.gain === 'maxMp' ? 8 : 5;
      const loseAmt = o.lose === 'maxMp' ? 8 : 5;
      player[o.gain] += gainAmt;
      player[o.lose] = Math.max(1, player[o.lose] - loseAmt);
      if (o.gain === 'maxMp') player.mp = Math.min(player.mp, player.maxMp);
      lootMsg(`The guardians honor the trade. ${o.gain === 'maxMp' ? 'Max MP' : 'Attack'} +${gainAmt}, ${o.lose === 'maxMp' ? 'Max MP' : 'Attack'} -${loseAmt}.`);
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
  exploreCounter++;
  if (exploreCounter % EVENT_INTERVAL === 0) {
    triggerEvent();
    return;
  }
  const r = Math.random();
  if (r < 0.55) {
    const count = rollEnemyCount();
    const templates = [];
    const tiers = [];
    for (let i = 0; i < count; i++) {
      const { template, tier } = pickScaledEnemy();
      templates.push(template);
      tiers.push(tier);
    }
    startCombat(templates, 1, highestTier(tiers));
  } else if (r < 0.68) {
    doTreasure(); returnToMenu();
  } else if (r < 0.80) {
    doFindItem(); returnToMenu();
  } else if (r < 0.90) {
    maybeDropGear(1); returnToMenu();
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
  quit:'0', exit:'0'
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
    exploreCounter = 0;
    pendingItemUse = null;
    gearPage = 0;
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
        showShopHub();
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
        gearPage = 0;
        currentState = 'EQUIP_MENU';
        showEquipMenu();
        break;
      case '7':
        currentState = 'PARTY_MENU';
        showPartyMenu();
        break;
      case '0':
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
    if (cleanInput === '0') { returnToMenu(); return; }
    if (cleanInput === '1') { currentState = 'SHOP_POTION'; showPotionMerchant(); return; }
    if (cleanInput === '2') { currentState = 'SHOP_BLACKSMITH'; showBlacksmith(); return; }
    if (cleanInput === '3') { currentState = 'SHOP_GIFTSHOP'; showGiftShop(); return; }
    warnMsg('Invalid choice.');
    showShopHub();
    return;
  }

  if (currentState === 'SHOP_POTION') {
    const items = potionMerchantItems();
    if (cleanInput === '0') { currentState = 'SHOP_MENU'; showShopHub(); return; }
    const idxNum = parseInt(cleanInput, 10);
    if (!isNaN(idxNum) && idxNum >= 1 && idxNum <= items.length) {
      const item = items[idxNum - 1];
      if (player.money < item.price) {
        warnMsg(`Not enough gold for ${item.name}. (Need ${item.price}g, have ${player.money}g)`);
      } else {
        player.money -= item.price;
        player.addConsumable(item.id, 1);
        lootMsg(`Purchased ${item.name}. (${player.money}g left)`);
      }
      showPotionMerchant();
    } else if (idxNum === items.length + 1) {
      if (player.inventory.length === 0) {
        sys('You have no potions to sell.');
        showPotionMerchant();
      } else {
        currentState = 'SHOP_POTION_SELL';
        showPotionSellMenu();
      }
    } else {
      warnMsg('Invalid choice.');
      showPotionMerchant();
    }
    return;
  }

  if (currentState === 'SHOP_POTION_SELL') {
    if (cleanInput === '0') {
      currentState = 'SHOP_POTION';
      showPotionMerchant();
      return;
    }
    const idx = parseInt(cleanInput, 10) - 1;
    const entry = player.inventory[idx];
    if (!entry || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showPotionSellMenu();
      return;
    }
    const def = findShopItem(entry.id);
    player.money += def.sell;
    entry.qty--;
    if (entry.qty <= 0) player.inventory.splice(idx, 1);
    lootMsg(`Sold 1 ${def.name} for ${def.sell}g. (${player.money}g total)`);
    currentState = 'SHOP_POTION';
    showPotionMerchant();
    return;
  }

  if (currentState === 'SHOP_GIFTSHOP') {
    const items = giftShopItems();
    if (cleanInput === '0') { currentState = 'SHOP_MENU'; showShopHub(); return; }
    const idxNum = parseInt(cleanInput, 10);
    if (!isNaN(idxNum) && idxNum >= 1 && idxNum <= items.length) {
      const item = items[idxNum - 1];
      if (player.money < item.price) {
        warnMsg(`Not enough gold for ${item.name}. (Need ${item.price}g, have ${player.money}g)`);
      } else {
        player.money -= item.price;
        if (item.kind === 'atk') {
          player.attackPower += item.amount;
          lootMsg(`Purchased ${item.name}! Attack +${item.amount} (now ${player.attackPower}).`);
        } else if (item.kind === 'def') {
          player.defensePower += item.amount;
          lootMsg(`Purchased ${item.name}! Defense +${item.amount} (now ${player.defensePower}).`);
        } else if (item.kind === 'hp') {
          player.maxHealth += item.amount;
          player.health = player.maxHealth;
          lootMsg(`Purchased ${item.name}! Max HP +${item.amount} (now ${player.maxHealth}), fully healed.`);
        } else if (item.kind === 'maxmp') {
          player.maxMp += item.amount;
          player.mp = player.maxMp;
          lootMsg(`Purchased ${item.name}! Max MP +${item.amount} (now ${player.maxMp}), fully restored.`);
        }
      }
      showGiftShop();
    } else {
      warnMsg('Invalid choice.');
      showGiftShop();
    }
    return;
  }

  if (currentState === 'SHOP_BLACKSMITH') {
    const pool = gearShopPool();
    if (cleanInput === '0') { currentState = 'SHOP_MENU'; showShopHub(); return; }
    const idxNum = parseInt(cleanInput, 10);
    if (!isNaN(idxNum) && idxNum >= 1 && idxNum <= pool.length) {
      const item = pool[idxNum - 1];
      if (player.money < item.price) {
        warnMsg(`Not enough gold for ${item.name}. (Need ${item.price}g, have ${player.money}g)`);
      } else {
        player.money -= item.price;
        player.gear.push(item.id);
        lootMsg(`Purchased ${gearNameHtml(item)}! Check Equipment to equip it. (${player.money}g left)`);
      }
      showBlacksmith();
    } else if (idxNum === pool.length + 1) {
      if (!player.gear.length) {
        sys('You have no gear to sell.');
        showBlacksmith();
      } else {
        gearPage = 0;
        currentState = 'SHOP_BLACKSMITH_SELL';
        showBlacksmithSellMenu();
      }
    } else {
      warnMsg('Invalid choice.');
      showBlacksmith();
    }
    return;
  }

  if (currentState === 'SHOP_BLACKSMITH_SELL') {
    if (cleanInput === '0') {
      gearPage = 0;
      currentState = 'SHOP_BLACKSMITH';
      showBlacksmith();
      return;
    }
    if (lower === 'n') {
      gearPage = Math.min(gearTotalPages(player.gear) - 1, gearPage + 1);
      showBlacksmithSellMenu();
      return;
    }
    if (lower === 'p') {
      gearPage = Math.max(0, gearPage - 1);
      showBlacksmithSellMenu();
      return;
    }
    const idxOnPage = parseInt(cleanInput, 10) - 1;
    const absoluteIdx = gearPage * GEAR_PAGE_SIZE + idxOnPage;
    const itemId = player.gear[absoluteIdx];
    const item = itemId && findEquipment(itemId);
    if (!item || isNaN(idxOnPage)) {
      warnMsg('Invalid selection.');
      showBlacksmithSellMenu();
      return;
    }
    player.gear.splice(absoluteIdx, 1);
    player.money += item.sell;
    lootMsg(`Sold ${gearNameHtml(item)} for ${item.sell}g. (${player.money}g total)`);
    showBlacksmithSellMenu();
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
    if (entry.kind === 'mp' || player.party.length === 0) {
      applyConsumableAndConsume(idx, player);
      returnToMenu();
    } else {
      pendingItemUse = { idx, fromCombat: false };
      currentState = 'ITEM_TARGET_MENU';
      showItemTargetMenu();
    }
    return;
  }

  if (currentState === 'ITEM_TARGET_MENU') {
    if (cleanInput === '0') {
      const fromCombat = pendingItemUse && pendingItemUse.fromCombat;
      pendingItemUse = null;
      if (fromCombat) { currentState = 'COMBAT'; showCombatMenu(); }
      else { returnToMenu(); }
      return;
    }
    const targets = [player, ...player.party];
    const idx = parseInt(cleanInput, 10) - 1;
    const target = targets[idx];
    if (!target || isNaN(idx)) {
      warnMsg('Invalid selection.');
      showItemTargetMenu();
      return;
    }
    const entry = player.inventory[pendingItemUse.idx];
    const fromCombat = pendingItemUse.fromCombat;
    if (!entry) {
      warnMsg('That item is no longer available.');
      pendingItemUse = null;
      if (fromCombat) { currentState = 'COMBAT'; showCombatMenu(); } else { returnToMenu(); }
      return;
    }
    applyConsumableAndConsume(pendingItemUse.idx, target);
    pendingItemUse = null;
    if (fromCombat) { currentState = 'COMBAT'; afterPlayerAction(); }
    else { returnToMenu(); }
    return;
  }

  if (currentState === 'EQUIP_MENU') {
    if (cleanInput === '0') {
      gearPage = 0;
      returnToMenu();
      return;
    }
    if (lower === 'n') {
      gearPage = Math.min(gearTotalPages(player.gear) - 1, gearPage + 1);
      showEquipMenu();
      return;
    }
    if (lower === 'p') {
      gearPage = Math.max(0, gearPage - 1);
      showEquipMenu();
      return;
    }
    const idxOnPage = parseInt(cleanInput, 10) - 1;
    const absoluteIdx = gearPage * GEAR_PAGE_SIZE + idxOnPage;
    const itemId = player.gear[absoluteIdx];
    const item = itemId && findEquipment(itemId);
    if (!item || isNaN(idxOnPage)) {
      warnMsg('Invalid selection.');
      showEquipMenu();
      return;
    }
    const old = item.slot === 'weapon' ? player.weapon : player.armor;
    if (item.slot === 'weapon') player.weapon = item; else player.armor = item;
    player.gear.splice(absoluteIdx, 1);
    if (old && old.id !== 'w_fists' && old.id !== 'a_rags') player.gear.push(old.id);
    lootMsg(`Equipped ${gearNameHtml(item)}.`);
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
    if (cleanInput === '0') {
      sys('You decide not to engage and move on.');
      currentEvent = null;
      returnToMenu();
      return;
    }
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
      case '1': {
        const aliveEnemies = combat.enemies.filter(e => e.isAlive());
        if (aliveEnemies.length > 1) {
          combat.pendingAction = { kind: 'attack' };
          currentState = 'COMBAT_TARGET_MENU';
          showTargetMenu();
        } else {
          player.normalAttack(aliveEnemies[0]);
          afterPlayerAction();
        }
        break;
      }
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
      case '5': {
        const aliveEnemies = combat.enemies.filter(e => e.isAlive());
        if (combat.recruitable && aliveEnemies.length === 1 && player.party.length < PARTY_MAX) {
          currentState = 'COMBAT_RECRUIT_MENU';
          showRecruitMenu();
        } else {
          warnMsg('There is no one here to recruit.');
          showCombatMenu();
        }
        break;
      }
      default:
        warnMsg('Invalid choice. (attack / skill / item / flee)');
        showCombatMenu();
        break;
    }
    return;
  }

  if (currentState === 'COMBAT_TARGET_MENU') {
    if (cleanInput === '0') {
      combat.pendingAction = null;
      currentState = 'COMBAT';
      showCombatMenu();
      return;
    }
    const idx = parseInt(cleanInput, 10) - 1;
    const target = combat.enemies[idx];
    if (!target || isNaN(idx) || !target.isAlive()) {
      warnMsg('Invalid target.');
      showTargetMenu();
      return;
    }
    const action = combat.pendingAction;
    combat.pendingAction = null;
    currentState = 'COMBAT';
    if (action.kind === 'attack') {
      player.normalAttack(target);
      afterPlayerAction();
    } else if (action.kind === 'skill') {
      useSkillInCombat(action.skillId, target);
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
    const skill = findSkill(skillId);
    const needsTarget = skill.type === 'damage' || skill.type === 'debuff' || skill.type === 'drain';
    const aliveEnemies = combat.enemies.filter(e => e.isAlive());
    if (needsTarget && aliveEnemies.length > 1) {
      combat.pendingAction = { kind: 'skill', skillId };
      currentState = 'COMBAT_TARGET_MENU';
      showTargetMenu();
    } else {
      currentState = 'COMBAT';
      useSkillInCombat(skillId, needsTarget ? aliveEnemies[0] : null);
    }
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
    if (entry.kind === 'mp' || player.party.length === 0) {
      applyConsumableAndConsume(idx, player);
      currentState = 'COMBAT';
      afterPlayerAction();
    } else {
      pendingItemUse = { idx, fromCombat: true };
      currentState = 'ITEM_TARGET_MENU';
      showItemTargetMenu();
    }
    return;
  }

  if (currentState === 'COMBAT_RECRUIT_MENU') {
    const target = combat.enemies.find(e => e.isAlive());
    if (cleanInput === '0') {
      currentState = 'COMBAT';
      showCombatMenu();
      return;
    }
    if (cleanInput === '1') {
      if (!target) { currentState = 'COMBAT'; showCombatMenu(); return; }
      if (player.money < combat.bargainCost) {
        warnMsg(`Not enough gold. Need ${combat.bargainCost}g.`);
        showRecruitMenu();
        return;
      }
      player.money -= combat.bargainCost;
      addAllyToParty(convertEnemyToAlly(target));
      combat = null;
      returnToMenu();
      return;
    }
    if (cleanInput === '2') {
      if (!target) { currentState = 'COMBAT'; showCombatMenu(); return; }
      if (Math.random() < combat.checkChance) {
        addAllyToParty(convertEnemyToAlly(target));
        combat = null;
        returnToMenu();
      } else {
        warnMsg(`${formatEnemyName(target.name)} refuses and lashes out!`);
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