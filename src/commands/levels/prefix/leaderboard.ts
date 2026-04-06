import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleLevelLeaderboard } from '../shared/leaderboard.handler';

const command: PrefixCommand = {
  name: 'leaderboard',
  aliases: ['top', 'lb', 'levels'],

  async execute(message) {
    const context = new CommandContext(message);

    await handleLevelLeaderboard({
      context,
      page: 1,
    });
  },
};

export default command;
