/* ---------- random event encounters ---------- */

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
];