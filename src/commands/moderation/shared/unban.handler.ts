import type { User } from 'discord.js';
import { container } from '../../../container';
import { ModerationServiceError } from '../../../services/moderation/moderation.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { sendModerationLog } from '../../../utils/moderation/moderationNotifier';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleUnban(params: {
  context: CommandContext;
  targetUser: User;
  reason: string;
}): Promise<void> {
  const { context, targetUser, reason } = params;

  if (!context.source.guild) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
      ephemeral: true,
    });
    return;
  }

  try {
    const action = await container.moderationService.unban({
      guild: context.source.guild,
      targetUser,
      moderatorUser: context.user,
      reason,
      channelId: context.source.channelId,
      messageId: 'id' in context.source ? context.source.id : null,
    });

    await sendModerationLog({
      guild: context.source.guild,
      moderatorUser: context.user,
      targetUser,
      action,
    });

    await context.reply({
      content: `Unbanned **${targetUser.username}** (Case #${action.id}).`,
    });
  } catch (error) {
    if (error instanceof ModerationServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
      return;
    }

    console.error('Failed to unban user:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while unbanning that user.')],
      ephemeral: true,
    });
  }
}
