/* ---------- random event encounters ---------- */
/* outcome.type is interpreted by resolveEventOutcome() in game.js.
   Events never start combat - they're resolved instantly so the
   deterministic "3 encounters, then an event" cadence stays clean. */

const EVENTS = [
  {
    id: 'shrine',
    title: 'A Quiet Shrine',
    text: 'You find a moss-covered shrine humming with faint energy.',
    choices: [
      { label: 'Pray at the shrine', outcome: { type: 'heal' } },
      { label: 'Leave an offering for a blessing', cost: 10, outcome: { type: 'buff', stat: 'attackPower', amount: 2 } },
      { label: 'Walk away', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'chest',
    title: 'A Locked Chest',
    text: 'A sturdy chest sits half-buried in the dirt.',
    choices: [
      { label: 'Force it open', outcome: { type: 'gearOrTrap' } },
      { label: 'Leave it', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'stranger',
    title: 'A Cloaked Stranger',
    text: 'A cloaked figure offers to join your journey... for a price.',
    choices: [
      { label: 'Pay to recruit them', cost: 40, outcome: { type: 'allyPaid' } },
      { label: 'Ask them to prove their strength (power check)', outcome: { type: 'allyPowerCheck' } },
      { label: 'Decline', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'trainer',
    title: 'A Traveling Trainer',
    text: 'An old trainer offers to teach you a technique.',
    choices: [
      { label: 'Learn a new skill', outcome: { type: 'skill' } },
      { label: 'Decline', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'panel',
    title: 'A Suspicious Floor Panel',
    text: 'The ground ahead looks... off.',
    choices: [
      { label: 'Step carefully around it', outcome: { type: 'nothing' } },
      { label: 'Search it anyway', outcome: { type: 'trapOrTreasure' } },
    ]
  },
  {
    id: 'merchant',
    title: 'A Traveling Merchant',
    text: 'A merchant offers you a sealed satchel of supplies.',
    choices: [
      { label: 'Buy the mystery satchel', cost: 25, outcome: { type: 'item' } },
      { label: 'Try to haggle for it instead', outcome: { type: 'haggle' } },
      { label: 'Just browse and leave', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'well',
    title: 'An Old Well',
    text: 'A well hums with strange magic. Coins glint far below.',
    choices: [
      { label: 'Toss in a coin and make a wish', cost: 5, outcome: { type: 'wishBuff' } },
      { label: 'Climb down for the coins', outcome: { type: 'trapOrTreasure' } },
      { label: 'Walk on', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'campfire',
    title: 'An Abandoned Campfire',
    text: 'The embers still glow. Whoever was here left in a hurry - and left supplies.',
    choices: [
      { label: 'Search the campsite', outcome: { type: 'item' } },
      { label: 'Rest by the fire with your party', outcome: { type: 'partyHeal' } },
      { label: 'Move on quickly', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'library',
    title: 'A Forgotten Library',
    text: 'Dusty tomes line the shelves of a ruined library.',
    choices: [
      { label: 'Study a tome (learn a skill)', outcome: { type: 'skill' } },
      { label: 'Search the shelves for potions instead', outcome: { type: 'item' } },
      { label: 'Leave the dust behind', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'idol',
    title: 'A Cursed Idol',
    text: 'An idol radiates unsettling power. Touching it might not be wise.',
    choices: [
      { label: 'Take the idol anyway (risky)', outcome: { type: 'curseForPower' } },
      { label: 'Leave it be', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'twins',
    title: 'Twin Guardians',
    text: 'Two spectral guardians block the path, offering a trade: strength for wisdom, or wisdom for strength.',
    choices: [
      { label: 'Trade wisdom for strength (+ATK, -Max MP)', outcome: { type: 'statTrade', gain: 'attackPower', lose: 'maxMp' } },
      { label: 'Trade strength for wisdom (+Max MP, -ATK)', outcome: { type: 'statTrade', gain: 'maxMp', lose: 'attackPower' } },
      { label: 'Refuse the trade', outcome: { type: 'nothing' } },
    ]
  },
  {
    id: 'brawler',
    title: 'A Boastful Brawler',
    text: 'A brawler challenges you to an arm-wrestle, wagering coin on the outcome.',
    choices: [
      { label: 'Wager 20g on your strength', cost: 20, outcome: { type: 'wagerStrength' } },
      { label: 'Decline the wager', outcome: { type: 'nothing' } },
    ]
  },
];