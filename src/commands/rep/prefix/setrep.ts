import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetRep } from '../shared/setrep.handler';

const command: PrefixCommand = {
  name: 'setrep',
  aliases: [],

  async execute(message, args) {
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

    const userInput = args[0];
    const valueInput = args[1];

    if (!userInput || !valueInput) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?setrep @user <value>`')],
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, userInput);
    const value = Number(valueInput);

    if (!member || Number.isNaN(value)) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?setrep @user <value>`')],
      });
      return;
    }

    await handleSetRep({
      context,
      targetMember: member,
      value,
    });
  },
};

export default command;
