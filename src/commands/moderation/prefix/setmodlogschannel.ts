import { PermissionFlagsBits, ChannelType } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetModLogsChannel } from '../shared/setmodlogschannel.handler';

const command: PrefixCommand = {
  name: 'setmodlogschannel',
  aliases: [],

  async execute(message) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const channel = message.mentions.channels.first();

    if (!channel || channel.type !== ChannelType.GuildText) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?setmodlogschannel #channel`')],
      });
      return;
    }

    await handleSetModLogsChannel({
      context,
      channel,
    });
  },
};

export default command;
