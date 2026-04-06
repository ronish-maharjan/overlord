import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleSetLevelLogsChannel } from '../shared/setlevellogschannel.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setlevellogschannel')
    .setDescription('Set the level logs channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel for level log messages')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel', true);
    const context = new CommandContext(interaction);

    await handleSetLevelLogsChannel({
      context,
      channel,
    });
  },
};

export default command;
