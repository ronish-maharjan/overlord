import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleWarn } from '../shared/warn.handler';

const command: PrefixCommand = {
  name: 'warn',
  aliases: [],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const targetInput = args[0];
    const reason = args.slice(1).join(' ').trim();

    if (!targetInput || !reason) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?warn @user <reason>`')],
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, targetInput);

    await handleWarn({
      context,
      targetMember: member,
      reason,
    });
  },
};

export default command;
