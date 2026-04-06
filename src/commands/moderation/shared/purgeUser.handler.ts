import type { GuildMember, TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { container } from '../../../container';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createModerationPurgeConfirmationButtons } from '../../../utils/pagination/moderationPurgeConfirmation';

type PurgeableChannel = TextChannel | NewsChannel | ThreadChannel;

const CONFIRMATION_THRESHOLD = 50;

export async function handlePurgeUser(params: {
  context: CommandContext;
  targetMember: GuildMember | null;
  amount: number;
}): Promise<void> {
  const { context, targetMember, amount } = params;

  const channel = context.source.channel as PurgeableChannel;

  if (!targetMember) {
    await context.reply({
      embeds: [createErrorEmbed('Could not find that member in this server.')],
    });
    return;
  }

  if (!('bulkDelete' in channel)) {
    await context.reply({
      embeds: [createErrorEmbed('This channel does not support purging.')],
    });
    return;
  }

  try {
    container.moderationPurgeService.validateAmount(amount);

    if (amount >= CONFIRMATION_THRESHOLD) {
      await context.reply({
        content: `Are you sure you want to scan up to **${amount}** messages and delete those from **${targetMember.user.username}**?`,
        components: createModerationPurgeConfirmationButtons({
          mode: 'user',
          commandUserId: context.user.id,
          channelId: channel.id,
          amount,
          targetUserId: targetMember.id,
        }),
      });
      return;
    }

    const result = await container.moderationPurgeService.purgeUser(
      channel,
      amount,
      targetMember.id,
    );

    await context.reply({
      content: `Deleted **${result.deletedCount}** messages from **${targetMember.user.username}**.`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong while purging messages.';

    await context.reply({
      embeds: [createErrorEmbed(message)],
    });
  }
}
