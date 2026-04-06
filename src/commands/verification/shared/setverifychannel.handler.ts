import type { GuildTextBasedChannel } from 'discord.js';
import { container } from '../../../container';
import { VerificationServiceError } from '../../../services/verification/verification.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { upsertVerificationMessage } from '../../../utils/verification/verificationMessage';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleSetVerifyChannel(params: {
  context: CommandContext;
  channel: GuildTextBasedChannel;
}): Promise<void> {
  const { context, channel } = params;

  try {
    const settings = await container.verificationService.setVerifyChannel({
      guildId: context.guildId,
      channelId: channel.id,
    });

    if (!settings.verifiedRoleId) {
      await context.reply({
        content: `Set the verify channel to ${channel}. No verify role is configured yet.`,
      });
      return;
    }

    await upsertVerificationMessage({
      guildId: context.guildId!,
      channel,
    });

    await context.reply({
      content: `Set the verify channel to ${channel} and updated the verification message there.`,
    });
  } catch (error) {
    if (error instanceof VerificationServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
      return;
    }

    console.error('Failed to set verify channel:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while setting the verify channel.')],
      ephemeral: true,
    });
  }
}
