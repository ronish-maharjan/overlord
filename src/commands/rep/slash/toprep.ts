import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleTopRep } from '../shared/toprep.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('toprep')
    .setDescription('View the server reputation leaderboard.'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const context = new CommandContext(interaction);

    await handleTopRep({
      context,
      page: 1,
    });
  },
};

export default command;
