import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleLevelRoles } from '../shared/levelroles.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('levelroles')
    .setDescription('View the configured level reward roles.'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const context = new CommandContext(interaction);

    await handleLevelRoles({
      context,
    });
  },
};

export default command;
