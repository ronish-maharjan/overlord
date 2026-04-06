import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleRemoveModLogsChannel } from '../shared/removemodlogschannel.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('removemodlogschannel')
    .setDescription('Remove the moderation logs channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const context = new CommandContext(interaction);

    await handleRemoveModLogsChannel({
      context,
    });
  },
};

export default command;
