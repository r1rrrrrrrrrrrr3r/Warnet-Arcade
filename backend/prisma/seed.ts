import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.game.deleteMany();

  const games = [
    {
      slug: "barathrum",
      title: "Barathrum",
      description:
        "A turn-based pixel-art card roguelite with skill point management.",
      devComment: 
        'Exported with Unity WebGL to test integrating a 3D build inside the arcade cabinet. Physics interactions and WebGL export pipeline were the main things being validated here.',
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