import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('auth_sessions', {
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
    refresh_token_hash: { type: 'VARCHAR(255)', notNull: true },
    expires_at: { type: 'TIMESTAMPTZ', notNull: true },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
  });

  pgm.addConstraint('auth_sessions', 'uq_auth_sessions_token', {
    unique: ['refresh_token_hash'],
  });

  pgm.createIndex('auth_sessions', ['user_id'], { name: 'idx_auth_sessions_user_id' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('auth_sessions');
}
