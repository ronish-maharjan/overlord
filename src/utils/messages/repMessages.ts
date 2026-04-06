import { formatDuration } from '../time/formatDuration';

export function createGiveRepSuccessMessage(username: string): string {
  return `Gave 1 rep to **${username}**`;
}

export function createGiveRepCooldownMessage(remainingMs: number): string {
  return `You're on cooldown! Try again in **${formatDuration(remainingMs)}**.`;
}

export function createCannotRepBotMessage(): string {
  return `You can't give rep to a bot user!`;
}

export function createCannotRepSelfMessage(): string {
  return `You can't give rep to yourself!`;
}

export function createMemberNotFoundMessage(): string {
  return `Couldn't find that user in this server!`;
}

export function createGuildOnlyRepMessage(): string {
  return `This command can only be used inside a server!`;
}
