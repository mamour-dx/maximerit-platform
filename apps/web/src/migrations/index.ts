import * as migration_20260920_232903_initial from './20260920_232903_initial';
import * as migration_20260921_105512_acquisition from './20260921_105512_acquisition';
import * as migration_20260921_124701_pages_content from './20260921_124701_pages_content';
import * as migration_20260921_125936_ats from './20260921_125936_ats';
import * as migration_20260921_132909_parse_proposal from './20260921_132909_parse_proposal';

export const migrations = [
  {
    up: migration_20260920_232903_initial.up,
    down: migration_20260920_232903_initial.down,
    name: '20260920_232903_initial',
  },
  {
    up: migration_20260921_105512_acquisition.up,
    down: migration_20260921_105512_acquisition.down,
    name: '20260921_105512_acquisition',
  },
  {
    up: migration_20260921_124701_pages_content.up,
    down: migration_20260921_124701_pages_content.down,
    name: '20260921_124701_pages_content',
  },
  {
    up: migration_20260921_125936_ats.up,
    down: migration_20260921_125936_ats.down,
    name: '20260921_125936_ats',
  },
  {
    up: migration_20260921_132909_parse_proposal.up,
    down: migration_20260921_132909_parse_proposal.down,
    name: '20260921_132909_parse_proposal'
  },
];
