import type { PrefixCommand } from '../../bot/types/command';

// Rep
import giverep from '../rep/prefix/giverep';
import rep from '../rep/prefix/rep';
import toprep from '../rep/prefix/toprep';
import setrep from '../rep/prefix/setrep';

// Levels
import xp from '../levels/prefix/xp';
import setlevel from '../levels/prefix/setlevel';
import leaderboard from '../levels/prefix/leaderboard';
import setlevelrole from '../levels/prefix/setlevelrole';
import removelevelrole from '../levels/prefix/removelevelrole';
import levelroles from '../levels/prefix/levelroles';
import setlevellogschannel from '../levels/prefix/setlevellogschannel';
import removelevellogschannel from '../levels/prefix/removelevellogschannel';

// Moderation
import warn from '../moderation/prefix/warn';
import kick from '../moderation/prefix/kick';
import ban from '../moderation/prefix/ban';
import unban from '../moderation/prefix/unban';
import timeout from '../moderation/prefix/timeout';
import untimeout from '../moderation/prefix/untimeout';
import history from '../moderation/prefix/history';
import moderationCase from '../moderation/prefix/case';
import setmodlogschannel from '../moderation/prefix/setmodlogschannel';
import removemodlogschannel from '../moderation/prefix/removemodlogschannel';
import cleanup from '../moderation/prefix/cleanup';
import purge from '../moderation/prefix/purge';

//verification
import setverifyrole from '../verification/prefix/setverifyrole';
import removeverifyrole from '../verification/prefix/removeverifyrole';
import setverifychannel from '../verification/prefix/setverifychannel';
import removeverifychannel from '../verification/prefix/removeverifychannel';

export const prefixCommands: PrefixCommand[] = [
    // verification
    setverifychannel,
    removeverifychannel,
    setverifyrole,
    removeverifyrole,

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

export const prefixCommandMap = new Map<string, PrefixCommand>();

for (const command of prefixCommands) {
    prefixCommandMap.set(command.name, command);

    for (const alias of command.aliases ?? []) {
        prefixCommandMap.set(alias, command);
    }
}
