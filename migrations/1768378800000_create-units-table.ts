import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('units', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: { literal: true, value: 'gen_random_uuid()' },
    },
    title: { type: 'VARCHAR(100)', notNull: true },
    description: { type: 'TEXT', notNull: true },
    slug: { type: 'VARCHAR(100)', notNull: true },
    order_num: { type: 'INTEGER', notNull: true },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: { literal: true, value: 'NOW()' },
    },
  });

  pgm.addConstraint('units', 'uq_units_slug', { unique: ['slug'] });
  pgm.addConstraint('units', 'uq_units_order', { unique: ['order_num'] });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('units');
}
