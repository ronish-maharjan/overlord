import type { ButtonInteraction } from 'discord.js';
import { container } from '../../container';
import { createErrorEmbed } from '../../utils/embeds/errorEmbeds';
import {
  createEmptyLeaderboardEmbed,
  createRepLeaderboardEmbed,
} from '../../utils/embeds/repEmbeds';
import {
  createRepLeaderboardButtons,
  denyUnauthorizedLeaderboardInteraction,
  parseRepLeaderboardCustomId,
} from '../../utils/pagination/leaderboardPagination';
import {
  formatRepLeaderboardLine,
  resolveRepLeaderboardUsernameFromInteraction,
} from '../../utils/rep/repLeaderboardFormatter';

export async function handleRepLeaderboardButton(
  interaction: ButtonInteraction,
): Promise<void> {
  const parsed = parseRepLeaderboardCustomId(interaction.customId);

  if (!parsed) return;

  if (!interaction.guildId || !interaction.guild) {
    await interaction.reply({
      embeds: [createErrorEmbed('This interaction can only be used in a server.')],
      ephemeral: true,
    });
    return;
  }

  if (interaction.user.id !== parsed.userId) {
    await denyUnauthorizedLeaderboardInteraction(interaction);
    return;
  }

  try {
    const leaderboard = await container.repService.getLeaderboard({
      guildId: interaction.guildId,
      page: parsed.page,
    });

    if (leaderboard.totalUsers === 0) {
      await interaction.update({
        embeds: [createEmptyLeaderboardEmbed('/')],
        components: [],
      });
      return;
    }

    const lines = await Promise.all(
      leaderboard.entries.map(async (entry) => {
        const username = await resolveRepLeaderboardUsernameFromInteraction(
          interaction,
          entry.userId,
        );
        return formatRepLeaderboardLine(entry.rank, entry.repsReceived, username);
      }),
    );

    await interaction.update({
      embeds: [
        createRepLeaderboardEmbed({
          lines,
          page: leaderboard.page,
          totalUsers: leaderboard.totalUsers,
          pageSize: leaderboard.pageSize,
          prefix: '/',
        }),
      ],
      components:
        leaderboard.totalPages > 1
          ? createRepLeaderboardButtons({
              guildId: interaction.guildId,
              userId: parsed.userId,
              page: leaderboard.page,
              totalPages: leaderboard.totalPages,
            })
          : [],
    });
  } catch (error) {
    console.error('Failed to handle rep leaderboard button:', error);

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
