import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('steps', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: { literal: true, value: 'gen_random_uuid()' },
    },
    lesson_id: {
      type: 'UUID',
      notNull: true,
      references: 'lessons(id)',
      onDelete: 'CASCADE',
    },
    type: { type: 'VARCHAR(30)', notNull: true },
    order_num: { type: 'INTEGER', notNull: true },
    instruction: { type: 'TEXT', notNull: true },
    content: { type: 'JSONB', notNull: true, default: '{}' },
    solution: { type: 'JSONB', notNull: true, default: '{}' },
    hints: { type: 'JSONB', notNull: true, default: '[]' },
    xp_reward: { type: 'INTEGER', notNull: true, default: { literal: true, value: '10' } },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
  });

  pgm.sql(`ALTER TABLE steps ADD CONSTRAINT ck_steps_type CHECK (type IN (
    'theory', 'fill-blank', 'multiple-choice', 'reorder',
    'spot-bug', 'live-code', 'live-preview',
    'output-prediction', 'matching'
  ))`);
  pgm.sql('ALTER TABLE steps ADD CONSTRAINT ck_steps_xp_positive CHECK (xp_reward > 0)');
  pgm.addConstraint('steps', 'uq_steps_lesson_order', {
    unique: ['lesson_id', 'order_num'],
  });

  pgm.createIndex('steps', ['lesson_id'], { name: 'idx_steps_lesson_id' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('steps');
}
