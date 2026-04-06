import type { PrefixCommand } from '../../bot/types/command';
import setrep from '../rep/prefix/setrep';
import giverep from '../rep/prefix/giverep';
import rep from '../rep/prefix/rep';
import toprep from '../rep/prefix/toprep';
import xp from '../levels/prefix/xp';
import setlevel from '../levels/prefix/setlevel';
import leaderboard from '../levels/prefix/leaderboard';
import setlevelrole from '../levels/prefix/setlevelrole';
import removelevelrole from '../levels/prefix/removelevelrole';
import levelroles from '../levels/prefix/levelroles';
import setlevellogschannel from '../levels/prefix/setlevellogschannel';
import removelevellogschannel from '../levels/prefix/removelevellogschannel';
export const prefixCommandMap = new Map<string, PrefixCommand>();
export const prefixCommands: PrefixCommand[] = [
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
for (const command of prefixCommands) {
  prefixCommandMap.set(command.name, command);

  for (const alias of command.aliases ?? []) {
    prefixCommandMap.set(alias, command);
  }
}
