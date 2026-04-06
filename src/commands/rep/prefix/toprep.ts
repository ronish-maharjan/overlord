import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleTopRep } from '../shared/toprep.handler';

const command: PrefixCommand = {
  name: 'toprep',
  aliases: ['reptop','tr'],

  async execute(message) {
    const context = new CommandContext(message);

    await handleTopRep({
      context,
      page: 1,
    });
  },
};

export default command;
