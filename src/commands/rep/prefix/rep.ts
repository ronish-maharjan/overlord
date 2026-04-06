import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleRepProfile } from '../shared/rep.handler';

const command: PrefixCommand = {
  name: 'rep',
  aliases: [],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.guild) {
      await context.reply({
        embeds: [createErrorEmbed('This command can only be used inside a server.')],
      });
      return;
    }

    if (!args[0]) {
      const selfMember = await message.guild.members
        .fetch(message.author.id)
        .catch(() => null);

      if (!selfMember) {
        await context.reply({
          embeds: [createErrorEmbed('Could not load your server profile.')],
        });
        return;
      }

      await handleRepProfile({
        context,
        targetMember: selfMember,
        includeCooldown: true,
      });
      return;
    }

    const member = await resolveMemberFromMessage(message, args[0]);

    if (!member) {
      await context.reply({
        embeds: [createErrorEmbed('Could not find that member in this server.')],
      });
      return;
    }

    await handleRepProfile({
      context,
      targetMember: member,
      includeCooldown: member.id === message.author.id,
    });
  },
};

export default command;
