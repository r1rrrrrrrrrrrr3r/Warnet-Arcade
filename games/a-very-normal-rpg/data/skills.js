/* ---------- active skills (cost MP, unlocked via leveling) ---------- */

const SKILLS = [
  { id:'heavy_strike',  name:'Heavy Strike',  mpCost:8,  unlockLevel:2, type:'damage',
    mult:1.8, desc:'A powerful blow dealing 180% weapon damage.' },
  { id:'cleave',        name:'Cleave',        mpCost:6,  unlockLevel:2, type:'damage',
    mult:1.3, desc:'A wide swing dealing 130% damage, sometimes shattering enemy defense.',
    debuff:{ type:'defenseDown', amount:3, duration:2, chance:0.5 } },
  { id:'heal',          name:'Heal',          mpCost:10, unlockLevel:3, type:'heal',
    power:30, desc:'Restore 30 HP.' },
  { id:'poison_strike', name:'Poison Strike', mpCost:7,  unlockLevel:4, type:'damage',
    mult:1.0, desc:'A quick strike that poisons the enemy.',
    debuff:{ type:'poison', amount:5, duration:3, chance:1 } },
  { id:'guard_break',   name:'Guard Break',   mpCost:9,  unlockLevel:5, type:'debuff',
    desc:'Shatter the enemy\'s defense for a few turns.',
    debuff:{ type:'defenseDown', amount:6, duration:2, chance:1 } },
  { id:'battle_cry',    name:'Battle Cry',    mpCost:12, unlockLevel:6, type:'buff',
    desc:'Rally yourself, boosting your own attack for a few turns.',
    buff:{ type:'atkUp', amount:8, duration:3 } },
  { id:'second_wind',   name:'Second Wind',   mpCost:15, unlockLevel:7, type:'heal',
    power:60, desc:'A greater restoration of 60 HP.' },
  { id:'execute',       name:'Execute',       mpCost:18, unlockLevel:8, type:'damage',
    mult:2.5, desc:'A devastating strike dealing 250% weapon damage.' },
];
function findSkill(id){ return SKILLS.find(s => s.id === id); }