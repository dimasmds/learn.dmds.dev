import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('badges', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: { literal: true, value: 'gen_random_uuid()' },
    },
    name: { type: 'VARCHAR(100)', notNull: true },
    description: { type: 'TEXT', notNull: true },
    icon: { type: 'VARCHAR(10)', notNull: true },
    type: { type: 'VARCHAR(50)', notNull: true },
    category: { type: 'VARCHAR(50)', notNull: true },
    criteria: { type: 'JSONB', notNull: true, default: '{}' },
    xp_reward: { type: 'INTEGER', notNull: true, default: 0 },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('badges');
}
