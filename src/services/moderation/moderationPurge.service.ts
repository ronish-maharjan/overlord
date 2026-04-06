import type { TextChannel, NewsChannel, ThreadChannel } from 'discord.js';

type PurgeableChannel = TextChannel | NewsChannel | ThreadChannel;

export interface PurgeResult {
  deletedCount: number;
}

export class ModerationPurgeService {
  private readonly MAX_PURGE_AMOUNT = 100;

  validateAmount(amount: number): number {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new Error('Purge amount must be at least 1.');
    }

    if (amount > this.MAX_PURGE_AMOUNT) {
      throw new Error(`Purge amount cannot exceed ${this.MAX_PURGE_AMOUNT}.`);
    }

    return amount;
  }

  async purgeAll(channel: PurgeableChannel, amount: number): Promise<PurgeResult> {
    const validated = this.validateAmount(amount);
    const deleted = await channel.bulkDelete(validated, true);
    return { deletedCount: deleted.size };
  }

  async purgeUser(
    channel: PurgeableChannel,
    amount: number,
    userId: string,
  ): Promise<PurgeResult> {
    const validated = this.validateAmount(amount);

    const messages = await channel.messages.fetch({ limit: validated });
    const filtered = messages.filter((message) => message.author.id === userId);

    const deleted = await channel.bulkDelete(filtered, true);

    return { deletedCount: deleted.size };
  }

  async purgeContains(
    channel: PurgeableChannel,
    amount: number,
    text: string,
  ): Promise<PurgeResult> {
    const validated = this.validateAmount(amount);
    const needle = text.toLowerCase();

    const messages = await channel.messages.fetch({ limit: validated });
    const filtered = messages.filter((message) =>
      message.content.toLowerCase().includes(needle),
    );

    const deleted = await channel.bulkDelete(filtered, true);

    return { deletedCount: deleted.size };
  }

  async cleanup(
    channel: PurgeableChannel,
    amount: number,
    botUserId: string,
    prefix: string,
  ): Promise<PurgeResult> {
    const validated = this.validateAmount(amount);

    const messages = await channel.messages.fetch({ limit: validated });
    const filtered = messages.filter(
      (message) =>
        message.author.id === botUserId ||
        message.content.startsWith(prefix),
    );

    const deleted = await channel.bulkDelete(filtered, true);

    return { deletedCount: deleted.size };
  }
}
