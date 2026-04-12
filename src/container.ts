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

import { VerificationSettingsRepository } from './repositories/verification/verificationSettings.repository';
import { VerificationService } from './services/verification/verification.service';

import { TagRepository } from './repositories/tag/tag.repository';
import { TagService } from './services/tag/tag.service';

// Repositories
const repRepository = new RepRepository();
const levelsRepository = new LevelsRepository();
const levelRoleRewardsRepository = new LevelRoleRewardsRepository();
const levelSettingsRepository = new LevelSettingsRepository();
const moderationRepository = new ModerationRepository();
const moderationSettingsRepository = new ModerationSettingsRepository();
const verificationSettingsRepository = new VerificationSettingsRepository();
const tagRepository = new TagRepository();

// Services
const repService = new RepService(repRepository);

const levelsService = new LevelsService(
  levelsRepository,
  levelRoleRewardsRepository,
  levelSettingsRepository,
);

const moderationService = new ModerationService(
  moderationRepository,
  moderationSettingsRepository,
);

const moderationSettingsService = new ModerationSettingsService(
  moderationSettingsRepository,
);

const moderationPurgeService = new ModerationPurgeService();

const verificationService = new VerificationService(
  verificationSettingsRepository,
);

const tagService = new TagService(tagRepository);

export const container = {
  // Verification
  verificationSettingsRepository,
  verificationService,

  // Rep
  repRepository,
  repService,

  // Levels
  levelsRepository,
  levelRoleRewardsRepository,
  levelSettingsRepository,
  levelsService,

  // Moderation
  moderationRepository,
  moderationSettingsRepository,
  moderationService,
  moderationSettingsService,
  moderationPurgeService,

  // Tags
  tagRepository,
  tagService,
};
