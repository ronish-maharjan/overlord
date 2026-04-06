import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleCleanup } from '../shared/cleanup.handler';

const command: PrefixCommand = {
  name: 'cleanup',
  aliases: [],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const amount = args[0] ? Number(args[0]) : 100;

    await handleCleanup({
      context,
      amount,
    });
  },
};

export default command;
