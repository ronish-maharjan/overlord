import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleXpProfile } from '../shared/xp.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('xp')
    .setDescription('View your XP, level, and rank.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The member whose XP you want to view')
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({
        embeds: [createErrorEmbed('This command can only be used in a server.')],
        ephemeral: true,
      });
      return;
    }

    const targetUser = interaction.options.getUser('user') ?? interaction.user;
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      await interaction.reply({
        embeds: [createErrorEmbed('Could not find that member in this server.')],
        ephemeral: true,
      });
      return;
    }

    const context = new CommandContext(interaction);

    await handleXpProfile({
      context,
      targetMember,
    });
  },
};

export default command;
