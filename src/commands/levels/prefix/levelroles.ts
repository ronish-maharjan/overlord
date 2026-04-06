import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleLevelRoles } from '../shared/levelroles.handler';

const command: PrefixCommand = {
  name: 'levelroles',
  aliases: [],

  async execute(message) {
    const context = new CommandContext(message);

    await handleLevelRoles({
      context,
    });
  },
};

export default command;
