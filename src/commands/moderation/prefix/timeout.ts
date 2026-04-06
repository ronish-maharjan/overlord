import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { parseDuration } from '../../../utils/time/parseDuration';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleTimeout } from '../shared/timeout.handler';

const command: PrefixCommand = {
  name: 'timeout',
  aliases: ['ti'],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const targetInput = args[0];
    const durationInput = args[1];
    const reason = args.slice(2).join(' ').trim();

    if (!targetInput || !durationInput || !reason) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?timeout @user <10m|2h|3d> <reason>`')],
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, targetInput);
    const durationMs = parseDuration(durationInput);

    if (!durationMs) {
      await context.reply({
        embeds: [createErrorEmbed('Invalid duration. Use formats like `10m`, `2h`, or `3d`.')],
      });
      return;
    }

    const expiresAt = new Date(Date.now() + durationMs);

    await handleTimeout({
      context,
      targetMember: member,
      expiresAt,
      reason,
    });
  },
};

export default command;
