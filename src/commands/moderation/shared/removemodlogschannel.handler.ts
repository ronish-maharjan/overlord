import { container } from '../../../container';
import { ModerationSettingsServiceError } from '../../../services/moderation/moderationSettings.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleRemoveModLogsChannel(params: {
  context: CommandContext;
}): Promise<void> {
  const { context } = params;

  try {
    await container.moderationSettingsService.removeModLogsChannel({
      guildId: context.guildId,
    });

    await context.reply({
      content: 'Removed the moderation logs channel.',
    });
  } catch (error) {
    if (error instanceof ModerationSettingsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
      return;
    }

    console.error('Failed to remove mod logs channel:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while removing the moderation logs channel.')],
      ephemeral: true,
    });
  }
}
