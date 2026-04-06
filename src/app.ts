import { env } from './config/env';
import { createDiscordClient } from './bot/clients/discordClient';
import { logger } from './utils/logger/logger';
import express, { Request, Response } from 'express';

async function bootstrap() {
  const app = express();

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      bot: client.isReady() ? 'online' : 'connecting',
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Health server running on port ${PORT}`);
  });

  const client = createDiscordClient();
  await client.login(env.DISCORD_TOKEN);
  logger.info('Bot startup complete.');
}

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap application', error);
  process.exit(1);
});
