import type { ButtonInteraction, Interaction } from 'discord.js';
import { slashCommandMap } from '../commands/slash';
import { handleRepLeaderboardButton } from './buttons/repLeaderboard.button';
import { handleLevelLeaderboardButton } from './buttons/levelLeaderboard.button';
import { handleModerationPurgeButton } from './buttons/moderationPurge.button';
import { parseRepLeaderboardCustomId } from '../utils/pagination/leaderboardPagination';
import { parseLevelLeaderboardCustomId } from '../utils/pagination/levelLeaderboardPagination';
import { parseModerationPurgeCustomId } from '../utils/pagination/moderationPurgeConfirmation';
import { createErrorEmbed } from '../utils/embeds/errorEmbeds';
import { logger } from '../utils/logger/logger';

export async function routeInteraction(interaction: Interaction): Promise<void> {
  try {
    if (interaction.isButton()) {
      await routeButtonInteraction(interaction);
      return;
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
}

async function routeButtonInteraction(
  interaction: ButtonInteraction,
): Promise<void> {
  if (parseRepLeaderboardCustomId(interaction.customId)) {
    await handleRepLeaderboardButton(interaction);
    return;
  }

  if (parseLevelLeaderboardCustomId(interaction.customId)) {
    await handleLevelLeaderboardButton(interaction);
    return;
  }

  if (parseModerationPurgeCustomId(interaction.customId)) {
    await handleModerationPurgeButton(interaction);
    return;
  }
}
