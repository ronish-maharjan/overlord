import type { GuildTextBasedChannel } from 'discord.js';
import { container } from '../../../container';
import { ModerationSettingsServiceError } from '../../../services/moderation/moderationSettings.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleSetModLogsChannel(params: {
  context: CommandContext;
  channel: GuildTextBasedChannel;
}): Promise<void> {
  const { context, channel } = params;

  try {
    await container.moderationSettingsService.setModLogsChannel({
      guildId: context.guildId,
      channelId: channel.id,
    });

    await context.reply({
      content: `Set the moderation logs channel to ${channel}.`,
    });
  } catch (error) {
    if (error instanceof ModerationSettingsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to set mod logs channel:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while setting the moderation logs channel.')],
    });
  }
}
