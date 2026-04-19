import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  pgm.createTable('users', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: { literal: true, value: 'gen_random_uuid()' },
    },
    username: { type: 'VARCHAR(20)', notNull: true },
    email: { type: 'VARCHAR(255)', notNull: true },
    password_hash: { type: 'VARCHAR(255)', notNull: true },
    display_name: { type: 'VARCHAR(50)', notNull: true },
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

  pgm.addConstraint('users', 'uq_users_username', { unique: ['username'] });
  pgm.addConstraint('users', 'uq_users_email', { unique: ['email'] });
  pgm.sql(`ALTER TABLE users ADD CONSTRAINT ck_users_username_format CHECK (username ~ '^[a-zA-Z][a-zA-Z0-9_-]{2,19}$')`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('users');
}
