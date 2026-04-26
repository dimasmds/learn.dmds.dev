/**
 * Seed script for gamification badges
 * Run with: npx tsx scripts/seed-badges.ts
 *
 * Idempotent — uses ON CONFLICT DO NOTHING
 */
import { randomUUID } from 'crypto';

import pool from '../lib/infrastructures/database/pool';

interface SeedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  category: string;
  criteria: object;
  xpReward: number;
}

const badges: SeedBadge[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Langkah Pertama',
    description: 'Selesaikan lesson pertamamu',
    icon: '🌱',
    type: 'first_lesson',
    category: 'learning',
    criteria: { type: 'lessons_completed', count: 1 },
    xpReward: 50,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Pemula Rajin',
    description: 'Selesaikan 5 lesson',
    icon: '📚',
    type: 'completion',
    category: 'learning',
    criteria: { type: 'lessons_completed', count: 5 },
    xpReward: 100,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Pelajar Setia',
    description: 'Selesaikan 10 lesson',
    icon: '🎓',
    type: 'completion',
    category: 'learning',
    criteria: { type: 'lessons_completed', count: 10 },
    xpReward: 250,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Pemanas 3 Hari',
    description: 'Raih streak 3 hari berturut-turut',
    icon: '🔥',
    type: 'streak',
    category: 'streak',
    criteria: { type: 'streak_days', count: 3 },
    xpReward: 50,
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Pejuang Mingguan',
    description: 'Raih streak 7 hari berturut-turut',
    icon: '💪',
    type: 'streak',
    category: 'streak',
    criteria: { type: 'streak_days', count: 7 },
    xpReward: 150,
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'Master Streak',
    description: 'Raih streak 30 hari berturut-turut',
    icon: '🏆',
    type: 'streak_master',
    category: 'streak',
    criteria: { type: 'streak_days', count: 30 },
    xpReward: 500,
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    name: 'Kolektor XP',
    description: 'Kumpulkan 500 XP',
    icon: '⭐',
    type: 'xp',
    category: 'mastery',
    criteria: { type: 'total_xp', count: 500 },
    xpReward: 100,
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    name: 'Penjelajah',
    description: 'Coba semua tipe step',
    icon: '🧭',
    type: 'explorer',
    category: 'mastery',
    criteria: { type: 'step_types_completed', count: 9 },
    xpReward: 200,
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    name: 'Jawaban Sempurna',
    description: 'Selesaikan 10 step tanpa salah',
    icon: '🎯',
    type: 'perfect',
    category: 'mastery',
    criteria: { type: 'perfect_steps', count: 10 },
    xpReward: 150,
  },
];

async function seed() {
  console.log('🌱 Seeding badges...');

  for (const badge of badges) {
    await pool.query(
      `INSERT INTO badges (id, name, description, icon, type, category, criteria, xp_reward)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        badge.id,
        badge.name,
        badge.description,
        badge.icon,
        badge.type,
        badge.category,
        JSON.stringify(badge.criteria),
        badge.xpReward,
      ],
    );
  }

  console.log(`✅ Seeded ${badges.length} badges`);
  console.log('\n🎉 Badges seeded successfully!');

  await pool.end();
}

seed();
