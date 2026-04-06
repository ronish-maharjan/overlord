import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetRep } from '../shared/setrep.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setrep')
    .setDescription('Set a user’s reputation.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option.setName('user').setDescription('Target member').setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName('value').setDescription('New rep value').setRequired(true),
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
    const value = interaction.options.getInteger('value', true);

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const context = new CommandContext(interaction);

    await handleSetRep({
      context,
      targetMember: member,
      value,
    });
  },
};

export default command;
