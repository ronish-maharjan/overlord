import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { resolveMemberFromMessage } from '../../../utils/discord/memberResolver';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handlePurgeAll } from '../shared/purgeAll.handler';
import { handlePurgeUser } from '../shared/purgeUser.handler';
import { handlePurgeContains } from '../shared/purgeContains.handler';

const command: PrefixCommand = {
  name: 'purge',
  aliases: ['remove', 'clean', 'clear'],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const sub = args[0]?.toLowerCase();

    if (!sub) {
      await context.reply({
        embeds: [
          createErrorEmbed(
            'Usage: `?purge all <amount>` | `?purge user @user <amount>` | `?purge contains <text> <amount>`',
          ),
        ],
      });
      return;
    }

    if (sub === 'all') {
      const amount = Number(args[1] ?? 100);
      await handlePurgeAll({ context, amount });
      return;
    }

    if (sub === 'user') {
      const member = await resolveMemberFromMessage(message, args[1]);
      const amount = Number(args[2] ?? 100);

      await handlePurgeUser({
        context,
        targetMember: member,
        amount,
      });
      return;
    }

    if (sub === 'contains') {
      if (args.length < 3) {
        await context.reply({
          embeds: [createErrorEmbed('Usage: `?purge contains <text> <amount>`')],
        });
        return;
      }

      const amount = Number(args[args.length - 1]);
      const text = args.slice(1, -1).join(' ');

      await handlePurgeContains({
        context,
        amount,
        text,
      });
      return;
    }

    await context.reply({
      embeds: [createErrorEmbed('Unknown purge subcommand.')],
    });
  },
};

export default command;
