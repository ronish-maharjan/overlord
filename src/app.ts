import { env } from './config/env';
import { createDiscordClient } from './bot/clients/discordClient';
import { logger } from './utils/logger/logger';

async function bootstrap() {
  const client = createDiscordClient();

  await client.login(env.DISCORD_TOKEN);

  logger.info('Bot startup complete.');
}

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap application', error);
  process.exit(1);
});
