import type { TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { container } from '../../../container';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createModerationPurgeConfirmationButtons } from '../../../utils/pagination/moderationPurgeConfirmation';

type PurgeableChannel = TextChannel | NewsChannel | ThreadChannel;

const CONFIRMATION_THRESHOLD = 50;

export async function handlePurgeAll(params: {
  context: CommandContext;
  amount: number;
}): Promise<void> {
  const { context, amount } = params;

  const channel = context.source.channel as PurgeableChannel;

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
        content: `Are you sure you want to delete up to **${amount}** messages?`,
        components: createModerationPurgeConfirmationButtons({
          mode: 'all',
          commandUserId: context.user.id,
          channelId: channel.id,
          amount,
        }),
      });
      return;
    }

    const result = await container.moderationPurgeService.purgeAll(channel, amount);

    await context.reply({
      content: `Deleted **${result.deletedCount}** messages.`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong while purging messages.';

    await context.reply({
      embeds: [createErrorEmbed(message)],
    });
  }
}
