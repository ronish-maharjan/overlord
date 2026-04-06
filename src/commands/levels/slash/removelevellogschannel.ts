import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleRemoveLevelLogsChannel } from '../shared/removelevellogschannel.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('removelevellogschannel')
    .setDescription('Remove the configured level logs channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const context = new CommandContext(interaction);

    await handleRemoveLevelLogsChannel({
      context,
    });
  },
};

export default command;
