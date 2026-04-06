import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleKick } from '../shared/kick.handler';

const command: PrefixCommand = {
  name: 'kick',
  aliases: [],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.KickMembers)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const targetInput = args[0];
    const reason = args.slice(1).join(' ').trim();

    if (!targetInput || !reason) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?kick @user <reason>`')],
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, targetInput);

    await handleKick({
      context,
      targetMember: member,
      reason,
    });
  },
};

export default command;
