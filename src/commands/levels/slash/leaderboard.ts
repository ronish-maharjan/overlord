import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleLevelLeaderboard } from '../shared/leaderboard.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server XP leaderboard.'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const context = new CommandContext(interaction);

    await handleLevelLeaderboard({
      context,
      page: 1,
    });
  },
};

export default command;
