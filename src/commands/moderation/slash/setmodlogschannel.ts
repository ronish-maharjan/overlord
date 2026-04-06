import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleSetModLogsChannel } from '../shared/setmodlogschannel.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setmodlogschannel')
    .setDescription('Set the moderation logs channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target logs channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel', true);
    const context = new CommandContext(interaction);

    await handleSetModLogsChannel({
      context,
      channel,
    });
  },
};

export default command;
