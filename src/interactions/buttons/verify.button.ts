import type { ButtonInteraction } from 'discord.js';
import { container } from '../../container';
import { createErrorEmbed } from '../../utils/embeds/errorEmbeds';
import { VERIFY_BUTTON_CUSTOM_ID } from '../../utils/verification/verificationMessage';

export async function handleVerifyButton(
  interaction: ButtonInteraction,
): Promise<void> {
  if (interaction.customId !== VERIFY_BUTTON_CUSTOM_ID) return;

  if (!interaction.guild || !interaction.guildId || !interaction.member) {
    await interaction.reply({
      embeds: [createErrorEmbed('This button can only be used inside a server.')],
      ephemeral: true,
    });
    return;
  }

  try {
    const settings = await container.verificationService.getSettings(interaction.guildId);

    if (!settings.verifiedRoleId) {
      await interaction.reply({
        embeds: [createErrorEmbed('No verified role has been configured for this server.')],
        ephemeral: true,
      });
      return;
    }

    const member = await interaction.guild.members
      .fetch(interaction.user.id)
      .catch(() => null);

    if (!member) {
      await interaction.reply({
        embeds: [createErrorEmbed('Could not load your member data in this server.')],
        ephemeral: true,
      });
      return;
    }

    const role = interaction.guild.roles.cache.get(settings.verifiedRoleId);

    if (!role) {
      await interaction.reply({
        embeds: [createErrorEmbed('The configured verified role no longer exists.')],
        ephemeral: true,
      });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember) {
      await interaction.reply({
        embeds: [createErrorEmbed('Could not load bot member data in this server.')],
        ephemeral: true,
      });
      return;
    }

    if (botMember.roles.highest.comparePositionTo(role) <= 0) {
      await interaction.reply({
        embeds: [createErrorEmbed('I cannot assign the verified role because it is higher than or equal to my top role.')],
        ephemeral: true,
      });
      return;
    }

    if (member.roles.cache.has(role.id)) {
      await interaction.reply({
        content: 'You are already verified.',
        ephemeral: true,
      });
      return;
    }

    await member.roles.add(role, 'User completed verification');

    await interaction.reply({
      content: `You have been verified and received the **${role.name}** role.`,
      ephemeral: true,
    });
  } catch (error) {
    console.error('Failed to process verify button:', error);

    if (interaction.replied || interaction.deferred) {
      await interaction
        .followUp({
          embeds: [createErrorEmbed('Something went wrong while verifying you.')],
          ephemeral: true,
        })
        .catch(() => null);
      return;
    }

    await interaction
      .reply({
        embeds: [createErrorEmbed('Something went wrong while verifying you.')],
        ephemeral: true,
      })
      .catch(() => null);
  }
}
