import * as migration_20260920_232903_initial from './20260920_232903_initial';

export const migrations = [
  {
    up: migration_20260920_232903_initial.up,
    down: migration_20260920_232903_initial.down,
    name: '20260920_232903_initial'
  },
];
