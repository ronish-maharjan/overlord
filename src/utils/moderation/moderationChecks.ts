import type { Guild, GuildMember, User } from 'discord.js';

export class ModerationTargetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModerationTargetValidationError';
  }
}

export function validateModerationTarget(params: {
  guild: Guild;
  moderatorMember: GuildMember | null;
  targetMember?: GuildMember | null;
  targetUser: User;
  action: 'warn' | 'kick' | 'ban' | 'timeout' | 'untimeout';
  disallowBots?: boolean;
}): void {
  const {
    guild,
    moderatorMember,
    targetMember = null,
    targetUser,
    action,
    disallowBots = true,
  } = params;

  const botMember = guild.members.me;

  if (!moderatorMember) {
    throw new ModerationTargetValidationError(
      'Could not resolve your member data in this server.',
    );
  }

  if (targetUser.id === moderatorMember.id) {
    throw new ModerationTargetValidationError(
      `You cannot ${action} yourself.`,
    );
  }

  if (targetUser.id === guild.ownerId) {
    throw new ModerationTargetValidationError(
      `You cannot ${action} the server owner.`,
    );
  }

  if (targetUser.id === guild.client.user.id) {
    throw new ModerationTargetValidationError(
      `You cannot ${action} the bot.`,
    );
  }

  if (disallowBots && targetUser.bot) {
    throw new ModerationTargetValidationError(
      `You cannot ${action} a bot user.`,
    );
  }

  if (!targetMember) {
    return;
  }

  // Moderator hierarchy check
  if (guild.ownerId !== moderatorMember.id) {
    if (
      moderatorMember.roles.highest.comparePositionTo(targetMember.roles.highest) <= 0
    ) {
      throw new ModerationTargetValidationError(
        `You cannot ${action} a member with an equal or higher role.`,
      );
    }
  }

  // Bot hierarchy check
  if (!botMember) {
    throw new ModerationTargetValidationError(
      'Could not resolve bot member data in this server.',
    );
  }

  if (
    botMember.roles.highest.comparePositionTo(targetMember.roles.highest) <= 0
  ) {
    throw new ModerationTargetValidationError(
      `I cannot ${action} that member because their top role is higher than or equal to mine.`,
    );
  }
}
