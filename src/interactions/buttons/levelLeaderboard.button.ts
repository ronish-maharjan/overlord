import type { ButtonInteraction } from 'discord.js';
import { container } from '../../container';
import { createErrorEmbed } from '../../utils/embeds/errorEmbeds';
import {
  createEmptyLevelLeaderboardEmbed,
  createLevelLeaderboardEmbed,
} from '../../utils/embeds/levelEmbeds';
import {
  createLevelLeaderboardButtons,
  denyUnauthorizedLevelLeaderboardInteraction,
  parseLevelLeaderboardCustomId,
} from '../../utils/pagination/levelLeaderboardPagination';
import {
  formatLevelLeaderboardLine,
  resolveLevelLeaderboardUsernameFromInteraction,
} from '../../utils/levels/levelLeaderboardFormatter';

export async function handleLevelLeaderboardButton(
  interaction: ButtonInteraction,
): Promise<void> {
  const parsed = parseLevelLeaderboardCustomId(interaction.customId);

  if (!parsed) return;

  if (!interaction.guildId || !interaction.guild) {
    await interaction.reply({
      embeds: [createErrorEmbed('This interaction can only be used in a server.')],
      ephemeral: true,
    });
    return;
  }

  if (interaction.user.id !== parsed.userId) {
    await denyUnauthorizedLevelLeaderboardInteraction(interaction);
    return;
  }

  try {
    const leaderboard = await container.levelsService.getLeaderboard({
      guildId: interaction.guildId,
      page: parsed.page,
    });

    if (leaderboard.totalUsers === 0) {
      await interaction.update({
        embeds: [createEmptyLevelLeaderboardEmbed('/')],
        components: [],
      });
      return;
    }

    const lines = await Promise.all(
      leaderboard.entries.map(async (entry) => {
        const username = await resolveLevelLeaderboardUsernameFromInteraction(
          interaction,
          entry.userId,
        );
        return formatLevelLeaderboardLine(
          entry.rank,
          entry.xp,
          entry.level,
          username,
        );
      }),
    );

    await interaction.update({
      embeds: [
        createLevelLeaderboardEmbed({
          lines,
          page: leaderboard.page,
          totalUsers: leaderboard.totalUsers,
          pageSize: leaderboard.pageSize,
          prefix: '/',
        }),
      ],
      components:
        leaderboard.totalPages > 1
          ? createLevelLeaderboardButtons({
              guildId: interaction.guildId,
              userId: parsed.userId,
              page: leaderboard.page,
              totalPages: leaderboard.totalPages,
            })
          : [],
    });
  } catch (error) {
    console.error('Failed to handle level leaderboard button:', error);

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        embeds: [
          createErrorEmbed(
            'Something went wrong while updating the leaderboard.',
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        createErrorEmbed(
          'Something went wrong while updating the leaderboard.',
        ),
      ],
      ephemeral: true,
    });
  }
}
