import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handlePurgeAll } from '../shared/purgeAll.handler';
import { handlePurgeUser } from '../shared/purgeUser.handler';
import { handlePurgeContains } from '../shared/purgeContains.handler';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('all')
        .setDescription('Delete recent messages')
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('How many recent messages to delete')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('Delete recent messages from a specific user')
        .addUserOption((option) =>
          option.setName('user').setDescription('Target member').setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('How many recent messages to scan')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('contains')
        .setDescription('Delete recent messages containing text')
        .addStringOption((option) =>
          option.setName('text').setDescription('Text to search for').setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('amount')
            .setDescription('How many recent messages to scan')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    const context = new CommandContext(interaction);

    if (subcommand === 'all') {
      const amount = interaction.options.getInteger('amount', true);
      await handlePurgeAll({ context, amount });
      return;
    }

    if (subcommand === 'user') {
      const user = interaction.options.getUser('user', true);
      const amount = interaction.options.getInteger('amount', true);
      const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

      await handlePurgeUser({
        context,
        targetMember: member,
        amount,
      });
      return;
    }

    if (subcommand === 'contains') {
      const text = interaction.options.getString('text', true);
      const amount = interaction.options.getInteger('amount', true);

      await handlePurgeContains({
        context,
        amount,
        text,
      });
      return;
    }

    await interaction.reply({
      embeds: [createErrorEmbed('Unknown purge subcommand.')],
      ephemeral: true,
    });
  },
};

export default command;
