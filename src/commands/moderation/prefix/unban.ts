import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleUnban } from '../shared/unban.handler';

const command: PrefixCommand = {
  name: 'unban',
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
    const reason = args.slice(1).join(' ').trim() || 'No reason provided';

    if (!targetInput) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?unban <userId>`')],
      });
      return;
    }

    const userId = targetInput.replace(/[<@!>]/g, '');
    const targetUser = await message.client.users.fetch(userId).catch(() => null);

    if (!targetUser) {
      await context.reply({
        embeds: [createErrorEmbed('Could not find that user.')],
      });
      return;
    }

    await handleUnban({
      context,
      targetUser,
      reason,
    });
  },
};

export default command;
