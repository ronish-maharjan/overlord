import type { LatestRepTransaction, RepCooldownStatus } from '../../types/rep';

export function calculateRepCooldown(params: {
  latestTransaction: LatestRepTransaction | null;
  nextReceiverUserId?: string;
  sameUserCooldownMinutes: number;
  differentUserCooldownMinutes: number;
  now?: Date;
}): RepCooldownStatus {
  const now = params.now ?? new Date();

  if (!params.latestTransaction) {
    return {
      onCooldown: false,
      nextAvailableAt: null,
      remainingMs: 0,
      cooldownType: null,
    };
  }

  const isSameUser =
    params.nextReceiverUserId !== undefined &&
    params.latestTransaction.receiverUserId === params.nextReceiverUserId;

  const cooldownMinutes = isSameUser
    ? params.sameUserCooldownMinutes
    : params.differentUserCooldownMinutes;

  const cooldownType = isSameUser ? 'same-user' : 'different-user';

  const nextAvailableAt = new Date(
    params.latestTransaction.createdAt.getTime() + cooldownMinutes * 60 * 1000,
  );

  const remainingMs = nextAvailableAt.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return {
      onCooldown: false,
      nextAvailableAt,
      remainingMs: 0,
      cooldownType,
    };
  }

  return {
    onCooldown: true,
    nextAvailableAt,
    remainingMs,
    cooldownType,
  };
}
