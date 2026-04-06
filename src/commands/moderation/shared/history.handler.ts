import { container } from '../../../container';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { createModerationHistoryEmbed } from '../../../utils/embeds/moderationEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

const HISTORY_PAGE_SIZE = 10;

export async function handleHistory(params: {
  context: CommandContext;
  targetUserId: string;
  targetLabel: string;
  page?: number;
}): Promise<void> {
  const { context, targetUserId, targetLabel, page = 1 } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    const history = await container.moderationService.getHistory({
      guildId: context.guildId,
      targetUserId,
      page,
      pageSize: HISTORY_PAGE_SIZE,
    });

    if (history.totalEntries === 0) {
      await context.reply({
        embeds: [createErrorEmbed('No moderation history found for that user.')],
      });
      return;
    }

    const lines = await Promise.all(
      history.entries.map(async (entry) => {
        const moderator =
          (await context.source.client.users.fetch(entry.moderatorUserId).catch(() => null)) ??
          null;

        const created = `<t:${Math.floor(entry.createdAt.getTime() / 1000)}:R>`;
        const moderatorText = moderator ? moderator.tag : entry.moderatorUserId;

        let line = `**#${entry.id} • ${entry.actionType.toUpperCase()}**\n`;
        line += `Moderator: ${moderatorText}\n`;
        line += `Reason: ${entry.reason}\n`;
        line += `Created: ${created}`;

        if (entry.expiresAt) {
          line += `\nExpires: <t:${Math.floor(entry.expiresAt.getTime() / 1000)}:R>`;
        }

        return line;
      }),
    );

    await context.reply({
      embeds: [
        createModerationHistoryEmbed({
          targetLabel,
          lines,
          page: history.page,
          totalPages: history.totalPages,
        }),
      ],
    });
  } catch (error) {
    console.error('Failed to load moderation history:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while loading moderation history.')],
    });
  }
}
