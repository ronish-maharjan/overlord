import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleCaseLookup } from '../shared/case.handler';

const command: PrefixCommand = {
  name: 'case',
  aliases: ['showcase'],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const caseId = Number(args[0]);

    if (!Number.isInteger(caseId)) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?case <id>`')],
      });
      return;
    }

    await handleCaseLookup({
      context,
      caseId,
    });
  },
};

export default command;
