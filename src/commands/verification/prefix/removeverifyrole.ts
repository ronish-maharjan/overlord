import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleRemoveVerifyRole } from '../shared/removeverifyrole.handler';

const command: PrefixCommand = {
  name: 'removeverifyrole',
  aliases: [],

  async execute(message) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    await handleRemoveVerifyRole({
      context,
    });
  },
};

export default command;
