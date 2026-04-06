import { REST, Routes } from 'discord.js';
import { env } from '../config/env';
import { slashCommands } from '../commands/slash';
import { logger } from '../utils/logger/logger';

async function main() {
  const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

  const commandData = slashCommands.map((command) => command.data.toJSON());

  logger.info(`Registering ${commandData.length} slash commands...`);

  await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), {
    body: commandData,
  });

  logger.info('Slash commands registered successfully.');
}

main().catch((error) => {
  logger.error('Failed to register slash commands', error);
  process.exit(1);
});
