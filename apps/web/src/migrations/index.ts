import * as migration_20260920_232903_initial from './20260920_232903_initial';
import * as migration_20260921_105512_acquisition from './20260921_105512_acquisition';

export const migrations = [
  {
    up: migration_20260920_232903_initial.up,
    down: migration_20260920_232903_initial.down,
    name: '20260920_232903_initial',
  },
  {
    up: migration_20260921_105512_acquisition.up,
    down: migration_20260921_105512_acquisition.down,
    name: '20260921_105512_acquisition'
  },
];
