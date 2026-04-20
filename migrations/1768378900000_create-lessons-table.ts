import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('lessons', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: { literal: true, value: 'gen_random_uuid()' },
    },
    unit_id: {
      type: 'UUID',
      notNull: true,
      references: 'units(id)',
      onDelete: 'CASCADE',
    },
    title: { type: 'VARCHAR(200)', notNull: true },
    description: { type: 'TEXT', notNull: true },
    slug: { type: 'VARCHAR(200)', notNull: true },
    order_num: { type: 'INTEGER', notNull: true },
    is_project: { type: 'BOOLEAN', notNull: true, default: { literal: true, value: 'FALSE' } },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
  });

  pgm.addConstraint('lessons', 'uq_lessons_slug', { unique: ['slug'] });
  pgm.addConstraint('lessons', 'uq_lessons_unit_order', {
    unique: ['unit_id', 'order_num'],
  });

  pgm.createIndex('lessons', ['unit_id'], { name: 'idx_lessons_unit_id' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('lessons');
}
