import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import gameRoutes from './routes/games';

const server = Fastify({ logger: true });

server.register(cors);

server.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/',
});

server.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    message: "Route not found"
  });
});

server.setErrorHandler((error, request, reply) => {
  reply.status(500).send({
    message: "Internal server error"
  });
});

server.get('/', async (request, reply) => {
  return { status: 'ok' };
});

server.register(gameRoutes);

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();