import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetLevel } from '../shared/setlevel.handler';

const command: PrefixCommand = {
  name: 'setlevel',
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
    const levelInput = args[1];

    if (!userInput || !levelInput) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?setlevel @user <level>`')],
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, userInput);
    const level = Number(levelInput);

    if (!member || Number.isNaN(level)) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?setlevel @user <level>`')],
      });
      return;
    }

    await handleSetLevel({
      context,
      targetMember: member,
      level,
    });
  },
};

export default command;
