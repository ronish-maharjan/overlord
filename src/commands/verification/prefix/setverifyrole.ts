import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetVerifyRole } from '../shared/setverifyrole.handler';

const command: PrefixCommand = {
  name: 'setverifyrole',
  aliases: [],

  async execute(message) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const role = message.mentions.roles.first();

    if (!role) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?setverifyrole @role`')],
      });
      return;
    }

    await handleSetVerifyRole({
      context,
      role,
    });
  },
};

export default command;
