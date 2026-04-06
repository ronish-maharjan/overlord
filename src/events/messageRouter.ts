import type { Message } from 'discord.js';
import { env } from '../config/env';
import { prefixCommandMap } from '../commands/prefix';
import { handleMessageRepTrigger } from './messageRepTrigger';
import { handleLevelMessageXp } from './levelMessageXp';
import { createErrorEmbed } from '../utils/embeds/errorEmbeds';
import { logger } from '../utils/logger/logger';
import { syncMemberLevelRoles } from './levelRoleSync';

export async function routeMessage(message: Message): Promise<void> {
  try {
    if (message.author.bot) return;

    await handleMessageRepTrigger(message).catch((error) => {
      logger.error('Auto rep trigger handler failed', error);
    });

    await handleLevelMessageXp(message).catch((error) => {
      logger.error('Level XP message handler failed', error);
    });

    if (!message.content.startsWith(env.PREFIX)) return;

    const withoutPrefix = message.content.slice(env.PREFIX.length).trim();
    if (!withoutPrefix.length) return;

    const args = withoutPrefix.split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = prefixCommandMap.get(commandName);
    if (!command) return;

    await command.execute(message, args);

    if (message.member) {
      await syncMemberLevelRoles(message.member).catch((error) => {
        logger.error('Level role sync after prefix command failed', error);
      });
    }
  } catch (error) {
    logger.error('Prefix command handler failed', error);

    await message
      .reply({
        embeds: [
          createErrorEmbed(
            'Something went wrong while executing this command.',
          ),
        ],
      })
      .catch(() => null);
  }
}
