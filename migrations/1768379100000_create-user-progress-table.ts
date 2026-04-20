import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('user_progress', {
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
    step_id: {
      type: 'UUID',
      notNull: true,
      references: 'steps(id)',
      onDelete: 'CASCADE',
    },
    lesson_id: {
      type: 'UUID',
      notNull: true,
      references: 'lessons(id)',
      onDelete: 'CASCADE',
    },
    status: { type: 'VARCHAR(20)', notNull: true, default: "'NOT_STARTED'" },
    attempts: { type: 'INTEGER', notNull: true, default: { literal: true, value: '0' } },
    completed_at: { type: 'TIMESTAMPTZ' },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
  });

  pgm.sql(`ALTER TABLE user_progress ADD CONSTRAINT ck_progress_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'))`);
  pgm.sql('ALTER TABLE user_progress ADD CONSTRAINT ck_progress_attempts CHECK (attempts >= 0)');
  pgm.addConstraint('user_progress', 'uq_progress_user_step', {
    unique: ['user_id', 'step_id'],
  });

  pgm.createIndex('user_progress', ['user_id', 'lesson_id'], { name: 'idx_progress_user_lesson' });
  pgm.createIndex('user_progress', ['user_id'], { name: 'idx_progress_user_id' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('user_progress');
}
