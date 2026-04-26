import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('streaks', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: { literal: true, value: 'gen_random_uuid()' },
    },
    user_id: {
      type: 'UUID',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    current_count: { type: 'INTEGER', notNull: true, default: 0 },
    longest_count: { type: 'INTEGER', notNull: true, default: 0 },
    last_activity_date: { type: 'DATE' },
    freeze_count: { type: 'INTEGER', notNull: true, default: 3 },
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

  pgm.addConstraint('streaks', 'uq_streaks_user_id', { unique: ['user_id'] });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('streaks');
}
