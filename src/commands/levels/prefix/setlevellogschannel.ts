import { PermissionFlagsBits, ChannelType } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetLevelLogsChannel } from '../shared/setlevellogschannel.handler';

const command: PrefixCommand = {
  name: 'setlevellogschannel',
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

    const channel = message.mentions.channels.first();

    if (!channel || channel.type !== ChannelType.GuildText) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?setlevellogschannel #channel`')],
      });
      return;
    }

    await handleSetLevelLogsChannel({
      context,
      channel,
    });
  },
};

export default command;
