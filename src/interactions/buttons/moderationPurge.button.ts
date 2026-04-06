import type { ButtonInteraction, TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { container } from '../../container';
import { createErrorEmbed } from '../../utils/embeds/errorEmbeds';
import {
  parseModerationPurgeCustomId,
} from '../../utils/pagination/moderationPurgeConfirmation';

type PurgeableChannel = TextChannel | NewsChannel | ThreadChannel;

export async function handleModerationPurgeButton(
  interaction: ButtonInteraction,
): Promise<void> {
  const parsed = parseModerationPurgeCustomId(interaction.customId);

  if (!parsed) return;

  if (interaction.user.id !== parsed.commandUserId) {
    await interaction.reply({
      embeds: [createErrorEmbed('Only the user who initiated this purge can use these buttons.')],
      ephemeral: true,
    });
    return;
  }

  if (parsed.action === 'cancel') {
    await interaction.update({
      content: 'The purge operation has been canceled.',
      embeds: [],
      components: [],
    });
    return;
  }

  const channel = await interaction.client.channels.fetch(parsed.channelId).catch(() => null);

  if (!channel || !('bulkDelete' in channel)) {
    await interaction.update({
      embeds: [createErrorEmbed('This channel no longer supports purging.')],
      components: [],
    });
    return;
  }

  try {
    let deletedCount = 0;

    if (parsed.mode === 'all') {
      const result = await container.moderationPurgeService.purgeAll(
        channel as PurgeableChannel,
        parsed.amount,
      );
      deletedCount = result.deletedCount;
    }

    if (parsed.mode === 'user') {
      if (!parsed.targetUserId) {
        await interaction.update({
          embeds: [createErrorEmbed('Missing target user for purge.')],
          components: [],
        });
        return;
      }

      const result = await container.moderationPurgeService.purgeUser(
        channel as PurgeableChannel,
        parsed.amount,
        parsed.targetUserId,
      );
      deletedCount = result.deletedCount;
    }

    await interaction.update({
      content: `Deleted **${deletedCount}** messages.`,
      embeds: [],
      components: [],
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong while performing the purge.';

    await interaction.update({
      embeds: [createErrorEmbed(message)],
      components: [],
    });
  }
}
