import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleRemoveLevelLogsChannel } from '../shared/removelevellogschannel.handler';

const command: PrefixCommand = {
  name: 'removelevellogschannel',
  aliases: [],

  async execute(message) {
    const context = new CommandContext(message);

    if (!message.guild || !message.member) {
      await context.reply({
        embeds: [createErrorEmbed('This command can only be used inside a server.')],
      });
      return;
    }

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    await handleRemoveLevelLogsChannel({
      context,
    });
  },
};

export default command;
