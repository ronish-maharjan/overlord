import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetLevel } from '../shared/setlevel.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a user’s level.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option.setName('user').setDescription('Target member').setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName('level').setDescription('New level').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
        ephemeral: true,
      });
      return;
    }

    const user = interaction.options.getUser('user', true);
    const level = interaction.options.getInteger('level', true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const context = new CommandContext(interaction);

    await handleSetLevel({
      context,
      targetMember: member,
      level,
    });
  },
};

export default command;
