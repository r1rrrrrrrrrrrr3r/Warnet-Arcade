/* ---------- consumables & permanent upgrades ---------- */

const SHOP_ITEMS = [
  { id:'minor',     name:'Minor Potion',    kind:'heal', heal:15, price:10, sell:3  },
  { id:'health',    name:'Health Potion',   kind:'heal', heal:35, price:20, sell:7  },
  { id:'elixir',    name:'Greater Elixir',  kind:'heal', heal:70, price:45, sell:15 },
  { id:'whetstone', name:'Whetstone',       kind:'atk',  amount:3,  price:40 },
  { id:'ironplate', name:'Iron Plate',      kind:'def',  amount:3,  price:40 },
  { id:'charm',     name:'Vitality Charm',  kind:'hp',   amount:15, price:55 }
];
function findShopItem(id){ return SHOP_ITEMS.find(i => i.id === id); }

/* ---------- equipable gear ---------- */
/* rare/epic gear is intentionally NOT sold in the shop - it only drops
   from exploration, combat victories, and events, so loot stays exciting. */

const EQUIPMENT_ITEMS = [
  // weapons
  { id:'w_dagger',     name:'Rusty Dagger',        slot:'weapon', attackPower:4,  price:30,  rarity:'common'   },
  { id:'w_sword',      name:'Iron Sword',          slot:'weapon', attackPower:9,  price:70,  rarity:'common'   },
  { id:'w_axe',        name:'Battle Axe',          slot:'weapon', attackPower:14, price:120, rarity:'uncommon' },
  { id:'w_katana',     name:'Moonlit Katana',      slot:'weapon', attackPower:20, price:220, rarity:'rare'     },
  { id:'w_zweihander', name:'Zweihander of Ruin',  slot:'weapon', attackPower:30, price:400, rarity:'epic'     },
  // armor
  { id:'a_leather',    name:'Leather Vest',        slot:'armor', defensePower:4,  price:30,  rarity:'common'   },
  { id:'a_chain',      name:'Chainmail',           slot:'armor', defensePower:9,  price:70,  rarity:'common'   },
  { id:'a_plate',      name:'Plate Armor',         slot:'armor', defensePower:14, price:120, rarity:'uncommon' },
  { id:'a_dragon',     name:'Dragonscale Mail',    slot:'armor', defensePower:20, price:220, rarity:'rare'     },
  { id:'a_aegis',      name:'Aegis of the Ancients',slot:'armor', defensePower:30, price:400, rarity:'epic'    },
];
function findEquipment(id){ return EQUIPMENT_ITEMS.find(i => i.id === id); }

const DEFAULT_WEAPON = { id:'w_fists', name:'Bare Fists', slot:'weapon', attackPower:0 };
const DEFAULT_ARMOR  = { id:'a_rags',  name:'Cloth Rags', slot:'armor',  defensePower:0 };

const RARITY_WEIGHTS = { common:0.50, uncommon:0.30, rare:0.15, epic:0.05 };