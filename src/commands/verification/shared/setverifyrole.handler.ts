import type { Role, GuildTextBasedChannel } from 'discord.js';
import { container } from '../../../container';
import { VerificationServiceError } from '../../../services/verification/verification.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { upsertVerificationMessage } from '../../../utils/verification/verificationMessage';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleSetVerifyRole(params: {
  context: CommandContext;
  role: Role;
}): Promise<void> {
  const { context, role } = params;

  if (!context.guildId || !context.source.guild) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used inside a server.')],
      ephemeral: true,
    });
    return;
  }

  try {
    const settings = await container.verificationService.setVerifiedRole({
      guildId: context.guildId,
      roleId: role.id,
    });

    if (!settings.verifyChannelId) {
      await context.reply({
        content: `Set the verify role to ${role}. No verify channel is configured yet.`,
      });
      return;
    }

    const channel = await context.source.guild.channels
      .fetch(settings.verifyChannelId)
      .catch(() => null);

    if (!channel || !('send' in channel) || !('messages' in channel)) {
      await context.reply({
        content: `Set the verify role to ${role}. The configured verify channel could not be used.`,
        ephemeral: true,
      });
      return;
    }

    await upsertVerificationMessage({
      guildId: context.guildId,
      channel: channel as GuildTextBasedChannel,
    });

    await context.reply({
      content: `Set the verify role to ${role} and updated the verification message in ${channel}.`,
    });
  } catch (error) {
    if (error instanceof VerificationServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
      return;
    }

    console.error('Failed to set verify role:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while setting the verify role.')],
      ephemeral: true,
    });
  }
}
