import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.game.deleteMany();

  const games = [
    {
      slug: "barathrum",
      title: "Barathrum",
      description:
        "Barathrum is a turn based, pixel art deckbuilding roguelite where every descent into the abyss presents a new challenge waiting to be overcome. Navigate dangerous encounters, collect powerful skill cards, and manage your SP carefully, because every decision leaves a lasting mark on how far you get. Combat rewards {{cyan}}thoughtful planning{{/cyan}} over quick reactions: reading enemy patterns, budgeting limited resources, and making the most of every card in hand are what separate a short run from a legendary one. With {{amber}}permadeath{{/amber}} on the line and no two runs ever playing the same, Barathrum keeps you coming back to experiment with new builds and strategies. Some say there is even a way to end the descent for good, if you can survive long enough to find it.",
      howToPlay:
        "**The Goal**\n\nFight your way through endless waves of enemies. Every battle draws you deeper, and every choice matters. If your HP ever drops to 0, your run ends permanently, so manage your health with care.\n\n**Combat Basics**\n\nBattles are turn based: you and one enemy trade turns.\n\n- Each turn you choose from a hand of 3 skill cards\n- Every skill costs SP (Skill Points); if you can't afford one, the card grays out and can't be played\n- Once played, a card goes to your discard pile\n- When your draw pile runs dry, the discard pile automatically shuffles back in, so you can never run out of moves\n\n**Managing Your SP**\n\nSP is the resource you are always juggling.\n\n- **Basic, cheaper skills** recharge {{cyan}}SP{{/cyan}} faster: +2 SP\n- **Stronger, pricier skills** only recharge +1 SP\n- Recharge is not instant, it is banked and paid out at the start of your next turn\n- Defeating an enemy also grants an instant +2 SP, on top of everything else\n\nChaining your strongest skills back to back will drain you dry, so mix in cheaper skills to keep your SP engine running.\n\n**Damage, Crits and Defense**\n\n- Damage scales off your Total Attack and the skill's power, then the enemy's Defense mitigates it\n- **Defense Pierce**, from a skill or from permanent victory buffs, cuts through a slice of the enemy's Defense before mitigation is applied\n- **Critical hits** multiply damage; your crit chance is your Total Crit Rate, and enemy crit chance is their own stat, except from {{amber}}Wave 50{{/amber}} onward when every enemy attack becomes a guaranteed crit\n- Some skills **lifesteal**, healing you for a percentage of the damage you just dealt\n- Buff skills grant temporary Attack, Defense, or Crit Rate boosts; offensive buffs clear after your next attack, while a Defense buff sticks around until you actually take a hit\n\n**Facing Enemies**\n\nWave 1 is always a regular Enemy, so there is no ambush right out of the gate. From Wave 2 onward, every new encounter is rolled:\n\n- **Boss**: starts at a 5% chance, climbing 3% higher for every regular Enemy defeated since your last Boss kill, capped at 80%. Beating a Boss resets this pity counter to zero\n- **Miniboss**: a flat 15% chance, unaffected by pity\n- Otherwise, it is a regular **Enemy**\n\n**Escalating Difficulty**\n\nEvery enemy you defeat permanently strengthens the next one you face.\n\n- Before {{amber}}Wave 50{{/amber}}, each kill adds +8% Max HP, +5% Attack, +5% Defense, and +3% Defense Pierce (capped at 70% Pierce)\n- From {{amber}}Wave 50{{/amber}} onward, scaling steepens to +15% Max HP, +10% Attack, and +10% Defense per kill, stacking on top of everything already gained\n- {{amber}}Wave 50{{/amber}} and beyond also guarantees every enemy attack is a critical hit, regardless of that enemy's own Crit Rate\n\n**Winning a Battle**\n\nSurvive a fight and you are rewarded before the next one.\n\n- Instant heal equal to 50% of your Max HP\n- One or more **Victory Buff** rolls: Enemies and Minibosses grant 1 roll, Bosses grant 2 rolls\n- Rolls are independent, so a Boss kill can hand you the same buff twice\n\nThe Victory Buff pool has six possible rewards:\n\n- **+75% Attack**, added permanently based on your current Attack\n- **+50% Defense**, added permanently based on your current Defense\n- **+15% Crit Rate**, permanent (stops appearing once your total Crit Rate is maxed out)\n- **+15% Crit Damage**, permanent, no cap\n- **+25% Max HP**, permanent, also heals you for the same amount immediately (stops appearing once your Max HP cap is reached)\n- **+15% Defense Pierce**, permanent, stacks with any pierce a skill itself grants, combined total capped at 100%\n\n**Winning the Game**\n\nDefeat is not the only ending waiting for you in the abyss. There is a way to win, though it will not announce itself, and it will not come easy.\n\nTo end your descent for good, you must find your way to {{magenta}}the core of Barathrum{{/magenta}} itself, and destroy it.\n\n**Defeat**\n\nIf your HP drops to 0 at any point, the run ends immediately and permanently. There are no second chances, your next attempt starts fresh from Wave 1.",
      devComment:
        "Barathrum started as an idea inspired by my appreciation for **strategy games, roguelites, and deckbuilding mechanics**. I wanted to build an experience where success comes less from luck and more from a player's ability to plan ahead, adapt on the fly, and make meaningful decisions across an entire run. From the earliest prototypes, the goal has always been gameplay that feels rewarding through {{cyan}}careful thinking{{/cyan}} rather than repetitive grinding.\n\nEvery major system was built with replayability in mind. The card system rewards players who experiment and discover unusual combinations. Character progression develops naturally from the choices you make instead of following a fixed path. Enemy encounters are designed to pose different tactical problems, ones that call for observation and resource management rather than a single dominant strategy.\n\nBeyond being a game, Barathrum is also a {{magenta}}personal learning journey{{/magenta}}. It is the project where I keep sharpening my understanding of game architecture, gameplay programming, balancing, UI design, and the overall player experience. Every iteration, playtest, and redesign along the way has taught me something new, both about the game and about myself as a developer.\n\nBarathrum is still under active development, but the long term vision has not changed: a polished tactical roguelite with satisfying progression, meaningful choices, high replay value, and a distinctive retro pixel art look. Every update is another step from experimental prototype toward a complete experience players will want to return to again and again.",
      coverImage: "/games/barathrum/cover.png",
      engine: "Unity",
      entryFile: "/games/barathrum/index.html",
      featured: true,
      published: true,
    },
    {
      slug: "untitled-space-game",
      title: "Untitled Space Game",
      description:
        "Untitled Space Game is a **fast, arcade-style survival shooter** where you pilot the Doomship through open space and hold the line for as long as you can. There is no story here, just you, the void, and everything in it trying to end your run. Move with precision, keep your laser cooldown in check, and watch your ship visibly grow stronger the better you play. Every second alive means weighing risk against reward: dodge {{magenta}}homing asteroids{{/magenta}} and streaking {{cyan}}comets{{/cyan}}, or shoot down the ones you can, all while chasing drifting {{amber}}Batteries{{/amber}} for a much-needed boost. One Score too far in the red and it is over instantly, so the real skill is knowing exactly when to push forward and when to just get out of the way.",
      howToPlay:
        "**The Goal**\n\nSurvive as long as you can and push your Score as high as possible. The instant your Score drops below zero, your run ends immediately, so every hit against you carries real weight.\n\n**Controls**\n\n- W, A, S, and D move the Doomship up, left, down, and right\n- Space or a mouse click fires your laser\n- Your laser has a brief cooldown between shots, so timing beats mashing the trigger\n\n**Hazards**\n\n- {{magenta}}Asteroids{{/magenta}} spawn from the edges of space and drift steadily toward you. Getting hit by one costs {{amber}}10 Score{{/amber}}, but a well-aimed laser shot destroys them before they reach you\n- {{cyan}}Comets{{/cyan}} streak across the screen and cannot be shot down. Getting clipped by one costs {{amber}}5 Score{{/amber}} and sends it briefly into hiding before it returns\n\n**Power-Ups**\n\n- {{cyan}}Batteries{{/cyan}} drift slowly down from the top of the screen. Flying into one restores {{amber}}20 Score{{/amber}}, and grabbing them consistently is what separates a short run from a long one\n\n**Growing Stronger**\n\nEvery 50 Score you bank, the Doomship grows a little larger, a visible sign of how well your run is going.\n\n**Game Over**\n\nThe moment your Score dips below zero, the run ends instantly. There is no warning and no second chance mid-run, so treat every point like it matters, because it does.",
      devComment:
        "Untitled Space Game started as a simple question: how much tension can you build with just movement, a laser, and a handful of things trying to kill you? There is no story here, no boss fight, no big twist. Just an open arena, a ship that visibly grows stronger as you survive, and a Score that can turn against you the moment you get greedy.\n\nI wanted every second of a run to force a real decision. That is why {{cyan}}Asteroids{{/cyan}} can be shot down but {{magenta}}Comets{{/magenta}} cannot, so you are always weighing whether to fight or dodge instead of leaning on one dominant strategy. The {{amber}}Batteries{{/amber}} exist for the same reason, rewarding patience and positioning over panic-firing.\n\nThis project has been a good exercise in keeping a small arcade loop tight and readable, and there is plenty of room to keep building on it: more hazards, more pickups, and maybe a proper sense of progression down the line.",
      coverImage: "/games/untitled-space-game/cover.png",
      engine: "Scratch",
      entryFile: "/games/untitled-space-game/index.html",
      featured: false,
      published: true,
    },
    {
      slug: "drone-at-wars",
      title: "Drone at Wars",
      description:
        "Drone at Wars puts a heavily armed spin on a classic genre. You pilot a nimble, hovering drone through an endless gauntlet of impassable towers. Timing your altitude is crucial, but this time, you have the ability to fight back. Fire your {{cyan}}built-in lasers{{/cyan}} to blast through the metallic structures blocking your path. Scoring requires quick math and reflexes: merely slipping past an obstacle rewards you with a steady trickle of points, but directly destroying a tower yields {{amber}}double the reward{{/amber}}. With tight hitboxes and an ever-scrolling screen, Drone at Wars combines precise maneuvering with satisfying destruction.",
      howToPlay:
        "**The Goal**\n\nStay airborne and rack up the highest score possible. Your run ends the moment your drone crashes into the floor, the ceiling, or any part of an undestroyed tower.\n\n**Controls**\n\n- **Space** to flap your drone and gain altitude.\n- **D** to fire your laser cannon directly ahead.\n\n**Scoring System**\n\nPoints are awarded in two different ways, allowing you to choose your playstyle:\n\n- **Evasion**: Successfully passing a tower without touching it grants {{amber}}1 Score{{/amber}}.\n- **Destruction**: Landing enough laser shots to completely obliterate a tower grants {{amber}}2 Score{{/amber}}.\n\nBalancing your focus between keeping the drone afloat and aiming your lasers is the key to mastering the game.",
      devComment:
        "Drone at Wars holds a special place in my development journey: this was the {{magenta}}first game I ever made on Scratch{{/magenta}}. \n\nI wanted to take a familiar, widely understood mechanic the endless tap-to-flap gameplay and introduce a new layer of player agency. Instead of just being a passive victim of the level generation, I wanted the player to feel empowered to carve their own path. The addition of the laser and the destructible towers instantly changed the dynamic from purely defensive to slightly offensive.\n\nLooking back, this project taught me the foundational basics of game loops, collision detection, and variable management. It is a simple arcade game at its core, but it represents the very beginning of my coding adventure.",
      coverImage: "/games/drone-at-wars/cover.png",
      engine: "Scratch",
      entryFile: "/games/drone-at-wars/index.html",
      featured: false,
      published: true,
    },
  ];

  await prisma.game.createMany({
    data: games,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });