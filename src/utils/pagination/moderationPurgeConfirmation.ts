import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
} from 'discord.js';

const MOD_PURGE_CONFIRM_PREFIX = 'mod_purge';

export type ModerationPurgeMode = 'all' | 'user';

export interface ModerationPurgeConfirmData {
  action: 'confirm' | 'cancel';
  mode: ModerationPurgeMode;
  commandUserId: string;
  channelId: string;
  amount: number;
  targetUserId?: string;
}

export function buildModerationPurgeCustomId(
  data: ModerationPurgeConfirmData,
): string {
  return [
    MOD_PURGE_CONFIRM_PREFIX,
    data.action,
    data.mode,
    data.commandUserId,
    data.channelId,
    data.amount,
    data.targetUserId ?? 'none',
  ].join(':');
}

export function parseModerationPurgeCustomId(
  customId: string,
): ModerationPurgeConfirmData | null {
  const parts = customId.split(':');

  if (parts.length !== 7) return null;
  if (parts[0] !== MOD_PURGE_CONFIRM_PREFIX) return null;

  const action = parts[1];
  const mode = parts[2];
  const commandUserId = parts[3];
  const channelId = parts[4];
  const amount = Number(parts[5]);
  const targetUserId = parts[6] === 'none' ? undefined : parts[6];

  if (
    (action !== 'confirm' && action !== 'cancel') ||
    (mode !== 'all' && mode !== 'user') ||
    !commandUserId ||
    !channelId ||
    Number.isNaN(amount) ||
    amount < 1
  ) {
    return null;
  }

  return {
    action,
    mode,
    commandUserId,
    channelId,
    amount,
    targetUserId,
  };
}

export function createModerationPurgeConfirmationButtons(
  data: Omit<ModerationPurgeConfirmData, 'action'>,
) {
  const confirmButton = new ButtonBuilder()
    .setCustomId(
      buildModerationPurgeCustomId({
        ...data,
        action: 'confirm',
      }),
    )
    .setLabel('Confirm')
    .setStyle(ButtonStyle.Danger);

  const cancelButton = new ButtonBuilder()
    .setCustomId(
      buildModerationPurgeCustomId({
        ...data,
        action: 'cancel',
      }),
    )
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Secondary);

  return [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      confirmButton,
      cancelButton,
    ),
  ];
}
