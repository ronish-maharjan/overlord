import { env } from '../../config/env';
import { REP_CONSTANTS } from '../../config/constants';
import { RepRepository } from '../../repositories/rep/rep.repository';
import { calculateRepCooldown } from './rep.cooldown';
import type {
    GiveRepResult,
    RepCooldownStatus,
    RepLeaderboardEntry,
    RepProfile,
} from '../../types/rep';

export class RepServiceError extends Error {
    public readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'RepServiceError';
        this.code = code;
    }
}

export class RepService {
    constructor(private readonly repRepository: RepRepository) {}

    private getCooldownConfigForGuild(_guildId: string) {
        return {
            sameUserCooldownMinutes: env.REP_SAME_USER_COOLDOWN_MINUTES,
            differentUserCooldownMinutes: env.REP_DIFFERENT_USER_COOLDOWN_MINUTES,
        };
    }

    async getCooldownStatus(
        guildId: string,
        userId: string,
        receiverUserId?: string,
        now: Date = new Date(),
    ): Promise<RepCooldownStatus> {
            const latestTransaction =
                await this.repRepository.getLatestRepTransactionByGiver(guildId, userId);

            const cooldownConfig = this.getCooldownConfigForGuild(guildId);

            return calculateRepCooldown({
                latestTransaction,
                nextReceiverUserId: receiverUserId,
                sameUserCooldownMinutes: cooldownConfig.sameUserCooldownMinutes,
                differentUserCooldownMinutes: cooldownConfig.differentUserCooldownMinutes,
                now,
            });
        }

        async giveRep(params: {
            guildId: string | null;
            giverUserId: string;
            receiverUserId: string;
            receiverIsBot: boolean;
            now?: Date;
        }): Promise<GiveRepResult> {
            const now = params.now ?? new Date();

            if (!params.guildId) {
                throw new RepServiceError(
                    'GUILD_ONLY',
                    'This command can only be used inside a server.',
                );
            }

            if (params.giverUserId === params.receiverUserId) {
                throw new RepServiceError('SELF_REP', "You can't give rep to yourself!");
            }

            if (params.receiverIsBot) {
                throw new RepServiceError('BOT_REP', "You can't give rep to a bot user!");
            }

            const cooldownConfig = this.getCooldownConfigForGuild(params.guildId);

            const latestTransaction =
                await this.repRepository.getLatestRepTransactionByGiver(
                    params.guildId,
                    params.giverUserId,
            );

            const cooldownStatus = calculateRepCooldown({
                latestTransaction,
                nextReceiverUserId: params.receiverUserId,
                sameUserCooldownMinutes: cooldownConfig.sameUserCooldownMinutes,
                differentUserCooldownMinutes: cooldownConfig.differentUserCooldownMinutes,
                now,
            });

            if (cooldownStatus.onCooldown) {
                throw new RepServiceError(
                    'COOLDOWN_ACTIVE',
                    "You're on cooldown! Try again later.",
                );
            }

            const result = await this.repRepository.giveRep({
                guildId: params.guildId,
                giverUserId: params.giverUserId,
                receiverUserId: params.receiverUserId,
                now,
            });

            const isSameUser =
                latestTransaction?.receiverUserId === params.receiverUserId;

            const cooldownMinutes = isSameUser
                ? cooldownConfig.sameUserCooldownMinutes
                : cooldownConfig.differentUserCooldownMinutes;

                const nextAvailableAt = new Date(now.getTime() + cooldownMinutes * 60 * 1000);

                return {
                    giverUserId: params.giverUserId,
                    receiverUserId: params.receiverUserId,
                    guildId: params.guildId,
                    receiverNewTotal: result.receiverStats.repsReceived,
                    nextAvailableAt,
                };
        }

        async getRepProfile(params: {
            guildId: string | null;
            userId: string;
            includeCooldown?: boolean;
            now?: Date;
        }): Promise<{
            profile: RepProfile;
            cooldownStatus?: RepCooldownStatus;
        }> {
            const now = params.now ?? new Date();

            if (!params.guildId) {
                throw new RepServiceError(
                    'GUILD_ONLY',
                    'This command can only be used inside a server.',
                );
            }

            const stats = await this.repRepository.ensureAndGetUserStats(
                params.guildId,
                params.userId,
            );

            if (!stats) {
                throw new RepServiceError(
                    'PROFILE_NOT_FOUND',
                    'Could not load reputation profile.',
                );
            }

            const rank = await this.repRepository.getUserRank(params.guildId, params.userId);

            const profile: RepProfile = {
                guildId: stats.guildId,
                userId: stats.userId,
                repsReceived: stats.repsReceived,
                repsGiven: stats.repsGiven,
                lastRepGivenAt: stats.lastRepGivenAt ?? null,
                rank,
            };

            let cooldownStatus: RepCooldownStatus | undefined;

            if (params.includeCooldown) {
                cooldownStatus = await this.getCooldownStatus(
                    params.guildId,
                    params.userId,
                    undefined,
                    now,
                );
            }

            return {
                profile,
                cooldownStatus,
            };
        }

        async getLeaderboard(params: {
            guildId: string | null;
            page?: number;
        }): Promise<{
            entries: RepLeaderboardEntry[];
            page: number;
            totalPages: number;
            totalUsers: number;
            pageSize: number;
        }> {
            if (!params.guildId) {
                throw new RepServiceError(
                    'GUILD_ONLY',
                    'This command can only be used inside a server.',
                );
            }

            const pageSize = REP_CONSTANTS.LEADERBOARD_PAGE_SIZE;
            const requestedPage = Math.max(1, params.page ?? 1);

            const totalUsers = await this.repRepository.countLeaderboardUsers(params.guildId);
            const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
            const page = Math.min(requestedPage, totalPages);

            const entries = await this.repRepository.getLeaderboardPage({
                guildId: params.guildId,
                page,
                pageSize,
            });

            return {
                entries,
                page,
                totalPages,
                totalUsers,
                pageSize,
            };
        }
        async setRep(params: {
            guildId: string | null;
            targetUserId: string;
            value: number;
            now?: Date;
        }): Promise<void> {
            const now = params.now ?? new Date();

            if (!params.guildId) {
                throw new RepServiceError(
                    'GUILD_ONLY',
                    'This command can only be used inside a server.',
                );
            }

            if (params.value < 0) {
                throw new RepServiceError(
                    'INVALID_REP_VALUE',
                    'Reputation cannot be negative.',
                );
            }

            await this.repRepository.setRepReceived(
                params.guildId,
                params.targetUserId,
                params.value,
                now,
            );
        }
}
