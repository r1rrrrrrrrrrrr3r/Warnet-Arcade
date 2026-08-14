import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.game.deleteMany();

  const games = [
    {
      slug: "barathrum",
      title: "Barathrum",
      description:
        "Barathrum is a turn based pixel art deckbuilding roguelite where every descent into the abyss presents a new challenge waiting to be overcome. Players must navigate dangerous encounters, collect powerful cards, unlock new abilities, and carefully shape their strategy as each run progresses. Every decision has lasting consequences, from choosing which cards to add to the deck to deciding how valuable skill points should be invested throughout the journey. Combat revolves around thoughtful planning rather than quick reactions. Understanding enemy behavior, managing limited resources, and making efficient use of every card are essential to surviving increasingly difficult battles. The constantly changing nature of each run ensures that no two adventures feel the same, encouraging experimentation with different builds and strategies.",
      devComment:
        "Barathrum started as an idea inspired by my appreciation for strategy games, roguelites, and deckbuilding mechanics. I wanted to create an experience where success is determined less by luck and more by the player's ability to plan ahead, adapt to changing situations, and make meaningful decisions throughout an entire run. From the earliest prototypes, the focus has always been on creating gameplay that feels rewarding through careful thinking rather than repetitive grinding.\n\nEvery major system in the game has been designed with replayability in mind. The card system encourages players to discover unique combinations and experiment with different playstyles. Character progression allows each run to develop naturally based on the choices the player makes instead of following a predetermined path. Enemy encounters are designed to present different tactical problems that require observation, resource management, and strategic execution instead of relying on a single dominant strategy.\n\nBeyond being a game, Barathrum is also a personal learning journey. It serves as a project where I continue to improve my understanding of game architecture, gameplay programming, balancing, user interface design, and overall player experience. Building the game has involved countless iterations, testing sessions, redesigns, and technical challenges, each contributing valuable lessons that shape both the project and my growth as a developer.\n\nAlthough Barathrum is still under active development, the long term vision remains unchanged. The goal is to deliver a polished tactical roguelite that offers satisfying progression, meaningful choices, and high replay value while maintaining a distinctive retro pixel art presentation. Every update represents another step toward transforming an experimental prototype into a complete experience that players can enjoy returning to again and again.",
      coverImage: "/games/barathrum/cover.png",
      engine: "Unity WebGL",
      entryFile: "/games/barathrum/index.html",
      featured: true,
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