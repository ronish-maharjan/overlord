import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleHistory } from '../shared/history.handler';

const command: PrefixCommand = {
  name: 'history',
  aliases: ['his'],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const targetInput = args[0];
    if (!targetInput) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?history @user`')],
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, targetInput);

    if (!member) {
      await context.reply({
        embeds: [createErrorEmbed('Could not find that member in this server.')],
      });
      return;
    }

    await handleHistory({
      context,
      targetUserId: member.id,
      targetLabel: member.user.tag,
      page: 1,
    });
  },
};

export default command;
