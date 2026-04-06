import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleSetVerifyChannel } from '../shared/setverifychannel.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setverifychannel')
    .setDescription('Set the verify channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Verify channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel', true);
    const context = new CommandContext(interaction);

    await handleSetVerifyChannel({
      context,
      channel,
    });
  },
};

export default command;
