import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type ButtonInteraction,
  type Message,
  type MessageActionRowComponentBuilder,
} from 'discord.js';
import { REP_CONSTANTS } from '../../config/constants';

export interface RepLeaderboardCustomIdData {
  action: 'prev' | 'next';
  guildId: string;
  userId: string;
  page: number;
}

export function buildRepLeaderboardCustomId(
  data: RepLeaderboardCustomIdData,
): string {
  return `${REP_CONSTANTS.LEADERBOARD_CUSTOM_ID_PREFIX}:${data.action}:${data.guildId}:${data.userId}:${data.page}`;
}

export function parseRepLeaderboardCustomId(
  customId: string,
): RepLeaderboardCustomIdData | null {
  const parts = customId.split(':');

  if (parts.length !== 5) return null;
  if (parts[0] !== REP_CONSTANTS.LEADERBOARD_CUSTOM_ID_PREFIX) return null;

  const action = parts[1];
  const guildId = parts[2];
  const userId = parts[3];
  const page = Number(parts[4]);

  if (
    (action !== 'prev' && action !== 'next') ||
    !guildId ||
    !userId ||
    Number.isNaN(page) ||
    page < 1
  ) {
    return null;
  }

  return {
    action,
    guildId,
    userId,
    page,
  };
}

export function createRepLeaderboardButtons(params: {
  guildId: string;
  userId: string;
  page: number;
  totalPages: number;
  disabled?: boolean;
}): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  const { guildId, userId, page, totalPages, disabled = false } = params;

  const previousButton = new ButtonBuilder()
    .setCustomId(
      buildRepLeaderboardCustomId({
        action: 'prev',
        guildId,
        userId,
        page: Math.max(1, page - 1),
      }),
    )
    .setLabel('Previous')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(disabled || page <= 1);

  const nextButton = new ButtonBuilder()
    .setCustomId(
      buildRepLeaderboardCustomId({
        action: 'next',
        guildId,
        userId,
        page: Math.min(totalPages, page + 1),
      }),
    )
    .setLabel('Next')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(disabled || page >= totalPages);

  return [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      previousButton,
      nextButton,
    ),
  ];
}

export async function disableMessageComponents(message: Message): Promise<void> {
  const disabledRows = message.components.map((row) => {
    const rebuiltRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>();

    for (const component of row.components) {
      if (component.type === 2) {
        rebuiltRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
      }
    }

    return rebuiltRow;
  });

  await message.edit({
    components: disabledRows,
  });
}

export async function denyUnauthorizedLeaderboardInteraction(
  interaction: ButtonInteraction,
): Promise<void> {
  await interaction.reply({
    content: 'Only the user who opened this leaderboard can use these buttons.',
    ephemeral: true,
  });
}

export function attachLeaderboardTimeout(params: {
  message: Message;
  timeoutMs?: number;
}): void {
  const { message, timeoutMs = REP_CONSTANTS.BUTTON_TIMEOUT_MS } = params;

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeoutMs,
  });

  collector.on('end', async () => {
    try {
      if (!message.editable) return;
      if (!message.components.length) return;

      await disableMessageComponents(message);
    } catch (error) {
      console.error('Failed to disable leaderboard buttons after timeout:', error);
    }
  });
}
