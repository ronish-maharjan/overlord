import { RepRepository } from './repositories/rep/rep.repository';
import { RepService } from './services/rep/rep.service';

import { LevelsRepository } from './repositories/levels/levels.repository';
import { LevelRoleRewardsRepository } from './repositories/levels/levelRoleRewards.repository';
import { LevelSettingsRepository } from './repositories/levels/levelSettings.repository';
import { LevelsService } from './services/levels/levels.service';

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

export const container = {
  repRepository,
  repService,

  levelsRepository,
  levelRoleRewardsRepository,
  levelSettingsRepository,
  levelsService,
};
