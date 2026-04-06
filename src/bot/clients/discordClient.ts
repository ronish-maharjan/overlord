import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  type Message,
} from 'discord.js';
import { logger } from '../../utils/logger/logger';
import { syncMemberLevelRoles } from '../../events/levelRoleSync';
import { routeInteraction } from '../../interactions/router';
import { routeMessage } from '../../events/messageRouter';

export function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

  client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Logged in as ${readyClient.user.tag}`);
  });

  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      await syncMemberLevelRoles(member);
    } catch (error) {
      logger.error('Level role sync on member join failed', error);
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    await routeInteraction(interaction);

    if (interaction.isChatInputCommand() && interaction.inGuild()) {
      const member = interaction.member;
      if (member && !Array.isArray(member)) {
        await syncMemberLevelRoles(member).catch((error) => {
          logger.error('Level role sync after slash command failed', error);
        });
      }
    }
  });

  client.on(Events.MessageCreate, async (message: Message) => {
    await routeMessage(message);
  });

  return client;
}
