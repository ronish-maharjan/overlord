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

function formatLeaderboardLine(rank: number, xp: number, level: number, username: string): string {
  const rankText = `${rank}.`.padEnd(6, ' ');
  return `${rankText}${xp} XP (Lv ${level}) - ${username}`;
}

async function resolveLeaderboardUsername(
  interaction: ButtonInteraction,
  userId: string,
): Promise<string> {
  if (!interaction.guild) return 'Unknown User';

  try {
    const member = await interaction.guild.members.fetch(userId);
    return member.user.tag;
  } catch {
    try {
      const user = await interaction.client.users.fetch(userId);
      return user.tag;
    } catch {
      return 'Unknown User';
    }
  }
}

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
        const username = await resolveLeaderboardUsername(interaction, entry.userId);
        return formatLeaderboardLine(entry.rank, entry.xp, entry.level, username);
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
