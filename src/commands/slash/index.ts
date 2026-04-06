import type { SlashCommand } from '../../bot/types/command';

// Rep
import giverep from '../rep/slash/giverep';
import rep from '../rep/slash/rep';
import toprep from '../rep/slash/toprep';
import setrep from '../rep/slash/setrep';

// Levels
import xp from '../levels/slash/xp';
import setlevel from '../levels/slash/setlevel';
import leaderboard from '../levels/slash/leaderboard';
import setlevelrole from '../levels/slash/setlevelrole';
import removelevelrole from '../levels/slash/removelevelrole';
import levelroles from '../levels/slash/levelroles';
import setlevellogschannel from '../levels/slash/setlevellogschannel';
import removelevellogschannel from '../levels/slash/removelevellogschannel';

// Moderation
import warn from '../moderation/slash/warn';
import kick from '../moderation/slash/kick';
import ban from '../moderation/slash/ban';
import unban from '../moderation/slash/unban';
import timeout from '../moderation/slash/timeout';
import untimeout from '../moderation/slash/untimeout';
import history from '../moderation/slash/history';
import moderationCase from '../moderation/slash/case';
import setmodlogschannel from '../moderation/slash/setmodlogschannel';
import removemodlogschannel from '../moderation/slash/removemodlogschannel';
import cleanup from '../moderation/slash/cleanup';
import purge from '../moderation/slash/purge';

export const slashCommands: SlashCommand[] = [
  // Rep
  giverep,
  rep,
  toprep,
  setrep,

  // Levels
  xp,
  setlevel,
  leaderboard,
  setlevelrole,
  removelevelrole,
  levelroles,
  setlevellogschannel,
  removelevellogschannel,

  // Moderation
  warn,
  kick,
  ban,
  unban,
  timeout,
  untimeout,
  history,
  moderationCase,
  setmodlogschannel,
  removemodlogschannel,
  cleanup,
  purge,
];

export const slashCommandMap = new Map(
  slashCommands.map((command) => [command.data.name, command]),
);
