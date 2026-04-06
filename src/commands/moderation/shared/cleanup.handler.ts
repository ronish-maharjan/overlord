import type { TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { container } from '../../../container';
import { env } from '../../../config/env';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

type PurgeableChannel = TextChannel | NewsChannel | ThreadChannel;

export async function handleCleanup(params: {
  context: CommandContext;
  amount: number;
}): Promise<void> {
  const { context, amount } = params;

  const channel = context.source.channel as PurgeableChannel;

  if (!('bulkDelete' in channel)) {
    await context.reply({
      embeds: [createErrorEmbed('This channel does not support cleanup.')],
    });
    return;
  }

  try {
    const result = await container.moderationPurgeService.cleanup(
      channel,
      amount,
      context.source.client.user.id,
      env.PREFIX,
    );

    await context.reply({
      content: `Cleaned up **${result.deletedCount}** bot/command messages.`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong while cleaning up messages.';

    await context.reply({
      embeds: [createErrorEmbed(message)],
    });
  }
}
