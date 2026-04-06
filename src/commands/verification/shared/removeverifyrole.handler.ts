import { container } from '../../../container';
import { VerificationServiceError } from '../../../services/verification/verification.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleRemoveVerifyRole(params: {
  context: CommandContext;
}): Promise<void> {
  const { context } = params;

  try {
    await container.verificationService.removeVerifiedRole({
      guildId: context.guildId,
    });

    await context.reply({
      content: 'Removed the verify role.',
    });
  } catch (error) {
    if (error instanceof VerificationServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
      return;
    }

    console.error('Failed to remove verify role:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while removing the verify role.')],
      ephemeral: true,
    });
  }
}
