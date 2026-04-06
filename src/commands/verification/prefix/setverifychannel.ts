import { ChannelType, PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetVerifyChannel } from '../shared/setverifychannel.handler';

const command: PrefixCommand = {
  name: 'setverifychannel',
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
        embeds: [createErrorEmbed('Usage: `?setverifychannel #channel`')],
      });
      return;
    }

    await handleSetVerifyChannel({
      context,
      channel,
    });
  },
};

export default command;
