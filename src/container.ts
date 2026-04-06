import { RepRepository } from './repositories/rep/rep.repository';
import { RepService } from './services/rep/rep.service';

import { LevelsRepository } from './repositories/levels/levels.repository';
import { LevelRoleRewardsRepository } from './repositories/levels/levelRoleRewards.repository';
import { LevelSettingsRepository } from './repositories/levels/levelSettings.repository';
import { LevelsService } from './services/levels/levels.service';

import { ModerationRepository } from './repositories/moderation/moderation.repository';
import { ModerationSettingsRepository } from './repositories/moderation/moderationSettings.repository';
import { ModerationService } from './services/moderation/moderation.service';
import { ModerationSettingsService } from './services/moderation/moderationSettings.service';
import { ModerationPurgeService } from './services/moderation/moderationPurge.service';

const repRepository = new RepRepository();
const repService = new RepService(repRepository);

const levelsRepository = new LevelsRepository();
const levelRoleRewardsRepository = new LevelRoleRewardsRepository();
const levelSettingsRepository = new LevelSettingsRepository();

const levelsService = new LevelsService(
  levelsRepository,
  levelRoleRewardsRepository,
  levelSettingsRepository,
);

const moderationRepository = new ModerationRepository();
const moderationSettingsRepository = new ModerationSettingsRepository();

const moderationService = new ModerationService(
  moderationRepository,
  moderationSettingsRepository,
);

const moderationSettingsService = new ModerationSettingsService(
  moderationSettingsRepository,
);

const moderationPurgeService = new ModerationPurgeService();

export const container = {
  repRepository,
  repService,

  levelsRepository,
  levelRoleRewardsRepository,
  levelSettingsRepository,
  levelsService,

  moderationRepository,
  moderationSettingsRepository,
  moderationService,
  moderationSettingsService,
  moderationPurgeService,
};
