import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { resolveMemberFromGuild } from '../../../utils/discord/memberResolver';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleBan } from '../shared/ban.handler';

const command: PrefixCommand = {
  name: 'ban',
  aliases: [],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.guild || !message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const targetInput = args[0];
    const reason = args.slice(1).join(' ').trim();

    if (!targetInput || !reason) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?ban <userId|@user> <reason>`')],
      });
      return;
    }

    const userId = targetInput.replace(/[<@!>]/g, '');
    const targetUser = await message.client.users.fetch(userId).catch(() => null);
    const member = await resolveMemberFromGuild(message.guild, userId);

    if (!targetUser) {
      await context.reply({
        embeds: [createErrorEmbed('Could not find that user.')],
      });
      return;
    }

    await handleBan({
      context,
      targetUser,
      targetMember: member,
      reason,
    });
  },
};

export default command;
