import type { SlashCommand } from '../../bot/types/command';
import setrep from '../rep/slash/setrep';
import giverep from '../rep/slash/giverep';
import rep from '../rep/slash/rep';
import toprep from '../rep/slash/toprep';
import xp from '../levels/slash/xp';
import setlevel from '../levels/slash/setlevel';
import leaderboard from '../levels/slash/leaderboard';
import setlevelrole from '../levels/slash/setlevelrole';
import removelevelrole from '../levels/slash/removelevelrole';
import levelroles from '../levels/slash/levelroles';
import setlevellogschannel from '../levels/slash/setlevellogschannel';
import removelevellogschannel from '../levels/slash/removelevellogschannel';
export const slashCommands: SlashCommand[] = [
  giverep,
  rep,
  toprep,
  setrep,

  xp,
  setlevel,
  leaderboard,
  setlevelrole,
  removelevelrole,
  levelroles,
  setlevellogschannel,
  removelevellogschannel,
];
export const slashCommandMap = new Map(
  slashCommands.map((command) => [command.data.name, command]),
);
