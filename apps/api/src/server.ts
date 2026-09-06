import 'dotenv/config';
import Fastify from 'fastify';
import { getBranding } from './config/branding.js';
import { prisma } from './lib/prisma.js';
import path from 'node:path';

const isDev = process.env.NODE_ENV !== 'production';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: {
      targets: [
        ...(isDev
          ? [
              {
                target: 'pino-pretty',
                level: 'info',
                options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
              },
            ]
          : []),
        {
          target: 'pino-roll',
          level: 'info',
          options: {
            file: path.join('logs', 'api.log'),
            frequency: 'daily',
            mkdir: true,
          },
        },
      ],
    },
  },
});


app.get('/health', async () => ({ status: 'ok' }));

app.get('/config/branding', async () => getBranding());

const PORT = Number(process.env.PORT ?? 3000);

app
  .listen({ port: PORT, host: '0.0.0.0' })
  .then(() => app.log.info(`API escuchando en el puerto ${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});