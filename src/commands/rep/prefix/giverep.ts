import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleGiveRep } from '../shared/giverep.handler';

const command: PrefixCommand = {
  name: 'giverep',
  aliases: ['repgive', 'gr'],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.guild) {
      await context.reply({
        embeds: [createErrorEmbed('This command can only be used inside a server.')],
      });
      return;
    }

    const input = args[0];
    if (!input) {
      await context.reply({
        embeds: [createErrorEmbed('Usage: `?giverep @user`')],
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, input);

    await handleGiveRep({
      context,
      receiverMember: member,
    });
  },
};

export default command;
