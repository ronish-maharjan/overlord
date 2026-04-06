import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  type Message,
} from 'discord.js';
import { env } from '../../config/env';
import { slashCommandMap } from '../../commands/slash';
import { prefixCommandMap } from '../../commands/prefix';
import { logger } from '../../utils/logger/logger';
import { parseRepLeaderboardCustomId } from '../../utils/pagination/leaderboardPagination';
import { handleRepLeaderboardButton } from '../../interactions/buttons/repLeaderboard.button';
import { createErrorEmbed } from '../../utils/embeds/errorEmbeds';
import { handleMessageRepTrigger } from '../../events/messageRepTrigger';
import { handleLevelMessageXp } from '../../events/levelMessageXp';
import { syncMemberLevelRoles } from '../../events/levelRoleSync';
import { parseLevelLeaderboardCustomId } from '../../utils/pagination/levelLeaderboardPagination';
import { handleLevelLeaderboardButton } from '../../interactions/buttons/levelLeaderboard.button';

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
    try {
      if (interaction.isButton()) {
        if (parseRepLeaderboardCustomId(interaction.customId)) {
          await handleRepLeaderboardButton(interaction);
          return;
        }

        if (parseLevelLeaderboardCustomId(interaction.customId)) {
          await handleLevelLeaderboardButton(interaction);
          return;
        }
      }

      if (!interaction.isChatInputCommand()) return;

      const command = slashCommandMap.get(interaction.commandName);

      if (!command) {
        await interaction.reply({
          embeds: [createErrorEmbed('Unknown command.')],
          ephemeral: true,
        });
        return;
      }

      await command.execute(interaction);

      if (interaction.inGuild()) {
        const member = interaction.member;
        if (member && !Array.isArray(member)) {
          await syncMemberLevelRoles(member).catch((error) => {
            logger.error('Level role sync after slash command failed', error);
          });
        }
      }
    } catch (error) {
      logger.error('Interaction handler failed', error);

      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction
            .followUp({
              embeds: [
                createErrorEmbed(
                  'Something went wrong while executing this command.',
                ),
              ],
              ephemeral: true,
            })
            .catch(() => null);
        } else {
          await interaction
            .reply({
              embeds: [
                createErrorEmbed(
                  'Something went wrong while executing this command.',
                ),
              ],
              ephemeral: true,
            })
            .catch(() => null);
        }
      }
    }
  });

  client.on(Events.MessageCreate, async (message: Message) => {
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
  });

  return client;
}
