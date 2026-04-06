import { container } from '../../../container';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { createModerationCaseEmbed } from '../../../utils/embeds/moderationEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleCaseLookup(params: {
  context: CommandContext;
  caseId: number;
}): Promise<void> {
  const { context, caseId } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    const action = await container.moderationService.getCase(context.guildId, caseId);

    if (!action) {
      await context.reply({
        embeds: [createErrorEmbed(`Could not find case #${caseId}.`)],
      });
      return;
    }

    const moderator =
      (await context.source.client.users.fetch(action.moderatorUserId).catch(() => null)) ??
      null;

    const target =
      (await context.source.client.users.fetch(action.targetUserId).catch(() => null)) ??
      null;

    await context.reply({
      embeds: [
        createModerationCaseEmbed({
          action,
          moderatorLabel: moderator
            ? `${moderator.tag} (\`${moderator.id}\`)`
            : `Unknown User (\`${action.moderatorUserId}\`)`,
          targetLabel: target
            ? `${target.tag} (\`${target.id}\`)`
            : `Unknown User (\`${action.targetUserId}\`)`,
        }),
      ],
    });
  } catch (error) {
    console.error('Failed to load moderation case:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while loading that case.')],
    });
  }
}
