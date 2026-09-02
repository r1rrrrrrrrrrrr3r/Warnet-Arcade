/* ---------- active skills (cost MP, unlocked via leveling) ---------- */
/* type: 'damage' | 'debuff' | 'heal' | 'buff' | 'drain' | 'restoreMp'
   - damage/drain/debuff can target any enemy when more than one is present
   - heal/buff/restoreMp always target the player */

const SKILLS = [
  { id:'heavy_strike',    name:'Heavy Strike',    mpCost:8,  unlockLevel:2, type:'damage',
    mult:1.8, desc:'A powerful blow dealing 180% weapon damage.' },
  { id:'cleave',          name:'Cleave',          mpCost:6,  unlockLevel:2, type:'damage',
    mult:1.3, desc:'A wide swing dealing 130% damage, sometimes shattering enemy defense.',
    debuff:{ type:'defenseDown', amount:3, duration:2, chance:0.5 } },
  { id:'heal',            name:'Heal',            mpCost:10, unlockLevel:3, type:'heal',
    power:30, desc:'Restore 30 HP.' },
  { id:'frost_lance',     name:'Frost Lance',     mpCost:9,  unlockLevel:3, type:'damage',
    mult:1.2, desc:'A piercing blast of frost that chills the enemy, lowering their attack.',
    debuff:{ type:'atkDown', amount:4, duration:2, chance:0.65 } },
  { id:'poison_strike',   name:'Poison Strike',   mpCost:7,  unlockLevel:4, type:'damage',
    mult:1.0, desc:'A quick strike that poisons the enemy.',
    debuff:{ type:'poison', amount:5, duration:3, chance:1 } },
  { id:'meditate',        name:'Meditate',        mpCost:0,  unlockLevel:4, type:'restoreMp',
    power:15, desc:'Focus your breathing to restore 15 MP. Costs no MP.' },
  { id:'guard_break',     name:'Guard Break',     mpCost:9,  unlockLevel:5, type:'debuff',
    desc:'Shatter the enemy\'s defense for a few turns.',
    debuff:{ type:'defenseDown', amount:6, duration:2, chance:1 } },
  { id:'vampiric_strike', name:'Vampiric Strike', mpCost:11, unlockLevel:6, type:'drain',
    mult:1.1, drainPct:0.5, desc:'Drain life from the enemy, healing yourself for half the damage dealt.' },
  { id:'battle_cry',      name:'Battle Cry',      mpCost:12, unlockLevel:6, type:'buff',
    desc:'Rally yourself, boosting your own attack for a few turns.',
    buff:{ type:'atkUp', amount:8, duration:3 } },
  { id:'second_wind',     name:'Second Wind',     mpCost:15, unlockLevel:7, type:'heal',
    power:60, desc:'A greater restoration of 60 HP.' },
  { id:'execute',         name:'Execute',         mpCost:18, unlockLevel:8, type:'damage',
    mult:2.5, desc:'A devastating strike dealing 250% weapon damage.' },
  { id:'berserk',         name:'Berserk',         mpCost:14, unlockLevel:9, type:'buff',
    desc:'Enter a rage: greatly boosts attack but lowers your defense for a few turns.',
    buff:{ type:'atkUp', amount:16, duration:3 },
    selfDebuff:{ type:'defenseDown', amount:6, duration:3 } },
];
function findSkill(id){ return SKILLS.find(s => s.id === id); }