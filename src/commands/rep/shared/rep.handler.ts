import type { GuildMember } from 'discord.js';
import { container } from '../../../container';
import { RepServiceError } from '../../../services/rep/rep.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { createRepProfileEmbed } from '../../../utils/embeds/repEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleRepProfile(params: {
  context: CommandContext;
  targetMember: GuildMember;
  includeCooldown?: boolean;
}): Promise<void> {
  const { context, targetMember, includeCooldown = false } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used inside a server.')],
    });
    return;
  }

  try {
    const { profile, cooldownStatus } = await container.repService.getRepProfile({
      guildId: context.guildId,
      userId: targetMember.user.id,
      includeCooldown,
    });

    await context.reply({
      embeds: [
        createRepProfileEmbed({
          member: targetMember,
          profile,
          cooldownStatus,
        }),
      ],
    });
  } catch (error) {
    if (error instanceof RepServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to load rep profile:', error);

    await context.reply({
      embeds: [
        createErrorEmbed(
          'Something went wrong while loading the reputation profile.',
        ),
      ],
    });
  }
}
