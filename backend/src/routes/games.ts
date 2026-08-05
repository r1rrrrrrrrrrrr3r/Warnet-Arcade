import { FastifyInstance } from 'fastify';
import { prisma } from '../db';

export default async function gameRoutes(server: FastifyInstance) {
  server.get('/games', async (request, reply) => {
    const games = await prisma.game.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        engine: true
      }
    });
    return games;
  });

  server.get('/games/:slug', {
    schema: {
      params: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            pattern: '^[a-z0-9-]+$'
          }
        },
        required: ['slug']
      }
    }
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const game = await prisma.game.findUnique({
      where: { slug }
    });

    if (!game) {
      return reply.status(404).send({
        message: "Game not found"
      });
    }

    if (!game.published) {
      return reply.status(404).send({
        message: "Game not found"
      });
    }

    return {
      id: game.id,
      title: game.title,
      slug: game.slug,
      description: game.description,
      devComment: game.devComment,
      coverImage: game.coverImage,
      engine: game.engine,
      entryFile: game.entryFile,
      featured: game.featured
    };
  });
}