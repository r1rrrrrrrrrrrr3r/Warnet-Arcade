import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const games = [
    {
      slug: 'cmd-rpg',
      title: 'CMD RPG',
      description: 'Permainan RPG berbasis command line klasik dengan sistem pertarungan turn-based.',
      coverImage: '/games/cpp/cmd-rpg/cover.png',
      engine: 'C++',
      entryFile: '/games/cpp/cmd-rpg/index.html',
      featured: false,
      published: true
    },
    {
      slug: 'scratch-demo',
      title: 'Scratch Demo',
      description: 'Demonstrasi interaktif logika pemrograman dasar.',
      coverImage: '/games/scratch/demo/cover.png',
      engine: 'Scratch',
      entryFile: '/games/scratch/demo/index.html',
      featured: false,
      published: true
    },
    {
      slug: 'unity-demo',
      title: 'Unity Demo',
      description: 'Prototipe permainan 3D sederhana dengan interaksi fisika dasar.',
      coverImage: '/games/unity/demo/cover.png',
      engine: 'Unity WebGL',
      entryFile: '/games/unity/demo/index.html',
      featured: true,
      published: true
    }
  ]

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: game
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })