import { Message } from 'discord.js';
import { container } from '../../../container';
import { RepServiceError } from '../../../services/rep/rep.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import {
  createEmptyLeaderboardEmbed,
  createRepLeaderboardEmbed,
} from '../../../utils/embeds/repEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';
import {
  attachLeaderboardTimeout,
  createRepLeaderboardButtons,
} from '../../../utils/pagination/leaderboardPagination';
import {
  formatRepLeaderboardLine,
  resolveRepLeaderboardUsernameFromContext,
} from '../../../utils/rep/repLeaderboardFormatter';

export async function handleTopRep(params: {
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
    const leaderboard = await container.repService.getLeaderboard({
      guildId: context.guildId,
      page,
    });

    const commandPrefix = context.isSlash ? '/' : '?';

    if (leaderboard.totalUsers === 0) {
      await context.reply({
        embeds: [createEmptyLeaderboardEmbed(commandPrefix)],
      });
      return;
    }

    const lines = await Promise.all(
      leaderboard.entries.map(async (entry) => {
        const username = await resolveRepLeaderboardUsernameFromContext(
          context,
          entry.userId,
        );
        return formatRepLeaderboardLine(entry.rank, entry.repsReceived, username);
      }),
    );

    const embed = createRepLeaderboardEmbed({
      lines,
      page: leaderboard.page,
      totalUsers: leaderboard.totalUsers,
      pageSize: leaderboard.pageSize,
      prefix: commandPrefix,
    });

    const components =
      leaderboard.totalPages > 1
        ? createRepLeaderboardButtons({
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
      attachLeaderboardTimeout({
        message: response,
      });
    }
  } catch (error) {
    if (error instanceof RepServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to load rep leaderboard:', error);

    await context.reply({
      embeds: [
        createErrorEmbed(
          'Something went wrong while loading the reputation leaderboard.',
        ),
      ],
    });
  }
}
