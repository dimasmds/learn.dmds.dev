import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('xp_transactions', {
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
    amount: { type: 'INTEGER', notNull: true },
    source: { type: 'VARCHAR(50)', notNull: true },
    source_id: { type: 'UUID' },
    description: { type: 'TEXT', notNull: true },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
  });

  pgm.sql('ALTER TABLE xp_transactions ADD CONSTRAINT ck_xp_transactions_amount_positive CHECK (amount > 0)');

  pgm.createIndex('xp_transactions', ['user_id'], { name: 'idx_xp_transactions_user_id' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('xp_transactions');
}
