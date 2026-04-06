import { Message } from 'discord.js';
import { container } from '../../../container';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import {
  createEmptyLevelLeaderboardEmbed,
  createLevelLeaderboardEmbed,
} from '../../../utils/embeds/levelEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';
import {
  attachLevelLeaderboardTimeout,
  createLevelLeaderboardButtons,
} from '../../../utils/pagination/levelLeaderboardPagination';
import {
  formatLevelLeaderboardLine,
  resolveLevelLeaderboardUsernameFromContext,
} from '../../../utils/levels/levelLeaderboardFormatter';

export async function handleLevelLeaderboard(params: {
  context: CommandContext;
  page?: number;
}): Promise<void> {
  const { context, page = 1 } = params;

  if (!context.guildId || !context.source.guild) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used inside a server.')],
    });
    return;
  }

  try {
    const leaderboard = await container.levelsService.getLeaderboard({
      guildId: context.guildId,
      page,
    });

    const commandPrefix = context.isSlash ? '/' : '?';

    if (leaderboard.totalUsers === 0) {
      await context.reply({
        embeds: [createEmptyLevelLeaderboardEmbed(commandPrefix)],
      });
      return;
    }

    const lines = await Promise.all(
      leaderboard.entries.map(async (entry) => {
        const username = await resolveLevelLeaderboardUsernameFromContext(
          context,
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

    const embed = createLevelLeaderboardEmbed({
      lines,
      page: leaderboard.page,
      totalUsers: leaderboard.totalUsers,
      pageSize: leaderboard.pageSize,
      prefix: commandPrefix,
    });

    const components =
      leaderboard.totalPages > 1
        ? createLevelLeaderboardButtons({
            guildId: context.guildId,
            userId: context.user.id,
            page: leaderboard.page,
            totalPages: leaderboard.totalPages,
          })
        : [];

    const response = await context.reply({
      embeds: [embed],
      components,
    });

    if (response instanceof Message && components.length > 0) {
      attachLevelLeaderboardTimeout({
        message: response,
      });
    }
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to load level leaderboard:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while loading the leaderboard.')],
    });
  }
}
