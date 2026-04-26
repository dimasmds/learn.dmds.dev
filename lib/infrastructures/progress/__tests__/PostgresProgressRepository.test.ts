import { afterAll, afterEach, beforeAll, beforeEach, describe, it, expect } from 'vitest';
import { PostgresProgressRepository } from '../PostgresProgressRepository';
import { createDatabaseTestContext, type DatabaseTestContext } from '../../../tests/helpers/database';

describe.sequential('PostgresProgressRepository', () => {
  const db = createDatabaseTestContext();
  let repository: PostgresProgressRepository;

  // Explicit IDs for cross-table references
  const userId = '44444444-4444-4444-4444-444444444444';
  const unitId = '55555555-5555-5555-5555-555555555555';
  const lessonId = '66666666-6666-6666-6666-666666666666';
  const stepId = '77777777-7777-7777-7777-777777777777';
  const step2Id = '88888888-8888-8888-8888-888888888888';

  beforeAll(async () => {
    await db.setup();
    repository = new PostgresProgressRepository(db.pool);
  });

  afterEach(async () => {
    await db.query('DELETE FROM user_progress');
    await db.query('DELETE FROM steps');
    await db.query('DELETE FROM lessons');
    await db.query('DELETE FROM units');
    await db.query('DELETE FROM users');
  });

  afterAll(async () => {
    await db.teardown();
  });

  // Seed a user + unit + lesson + steps for FK constraints
  async function seedLearningData(): Promise<void> {
    await db.query(
      `INSERT INTO users (id, username, email, password_hash, display_name, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, 'testprogress', 'progress@test.com', '$2a$10$hash', 'Test User'],
    );
    await db.query(
      `INSERT INTO units (id, title, description, slug, order_num, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [unitId, 'Unit', 'desc', 'unit', 1],
    );
    await db.query(
      `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
      [lessonId, unitId, 'Lesson', 'desc', 'lesson', 1],
    );
    await db.query(
      `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [stepId, lessonId, 'theory', 1, 'Step 1', '{}', '{}', '[]', 10],
    );
    await db.query(
      `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [step2Id, lessonId, 'fill-blank', 2, 'Step 2', '{}', '{}', '[]', 15],
    );
  }

  describe('getUserProgress', () => {
    it('should return empty array when user has no progress', async () => {
      await seedLearningData();
      const progress = await repository.getUserProgress(userId);
      expect(progress).toEqual([]);
    });

    it('should return all progress for a user', async () => {
      await seedLearningData();
      await db.query(
        `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [crypto.randomUUID(), userId, stepId, lessonId, 'COMPLETED', 1, new Date()],
      );
      await db.query(
        `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [crypto.randomUUID(), userId, step2Id, lessonId, 'IN_PROGRESS', 2, null],
      );

      const progress = await repository.getUserProgress(userId);
      expect(progress).toHaveLength(2);
    });

    it('should not return progress from other users', async () => {
      const otherUserId = '99999999-9999-9999-9999-999999999999';
      await seedLearningData();
      await db.query(
        `INSERT INTO users (id, username, email, password_hash, display_name, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [otherUserId, 'other', 'other@test.com', '$2a$10$hash', 'Other'],
      );
      await db.query(
        `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [crypto.randomUUID(), otherUserId, stepId, lessonId, 'COMPLETED', 1, new Date()],
      );

      const progress = await repository.getUserProgress(userId);
      expect(progress).toEqual([]);
    });
  });

  describe('getProgressByUserAndLesson', () => {
    it('should return empty array when no progress for lesson', async () => {
      await seedLearningData();
      const progress = await repository.getProgressByUserAndLesson(userId, lessonId);
      expect(progress).toEqual([]);
    });

    it('should return only progress for specific lesson', async () => {
      const otherLessonId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const otherStepId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
      await seedLearningData();

      // Add another lesson + step
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
        [otherLessonId, unitId, 'Other Lesson', 'desc', 'other-lesson', 2],
      );
      await db.query(
        `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [otherStepId, otherLessonId, 'theory', 1, 'Other step', '{}', '{}', '[]', 5],
      );

      // Progress for lessonId
      await db.query(
        `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [crypto.randomUUID(), userId, stepId, lessonId, 'COMPLETED', 1, new Date()],
      );
      // Progress for otherLessonId
      await db.query(
        `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [crypto.randomUUID(), userId, otherStepId, otherLessonId, 'IN_PROGRESS', 1, null],
      );

      const progress = await repository.getProgressByUserAndLesson(userId, lessonId);
      expect(progress).toHaveLength(1);
      expect(progress[0].props.stepId).toBe(stepId);
    });
  });

  describe('getProgressByUserAndStep', () => {
    it('should return null when no progress for step', async () => {
      await seedLearningData();
      const result = await repository.getProgressByUserAndStep(userId, stepId);
      expect(result).toBeNull();
    });

    it('should return progress for specific step', async () => {
      await seedLearningData();
      await db.query(
        `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [crypto.randomUUID(), userId, stepId, lessonId, 'IN_PROGRESS', 3, null],
      );

      const result = await repository.getProgressByUserAndStep(userId, stepId);
      expect(result).not.toBeNull();
      expect(result!.props.userId).toBe(userId);
      expect(result!.props.stepId).toBe(stepId);
      expect(result!.props.lessonId).toBe(lessonId);
      expect(result!.props.status).toBe('IN_PROGRESS');
      expect(result!.props.attempts).toBe(3);
      expect(result!.props.completedAt).toBeNull();
    });
  });

  describe('upsertProgress', () => {
    beforeEach(async () => {
      await seedLearningData();
    });

    it('should insert new progress when none exists', async () => {
      const result = await repository.upsertProgress(userId, stepId, 'IN_PROGRESS');

      expect(result).not.toBeNull();
      expect(result.props.userId).toBe(userId);
      expect(result.props.stepId).toBe(stepId);
      expect(result.props.lessonId).toBe(lessonId);
      expect(result.props.status).toBe('IN_PROGRESS');
      expect(result.props.attempts).toBe(1);
      expect(result.props.completedAt).toBeNull();
    });

    it('should set completed_at when status is COMPLETED (insert)', async () => {
      const result = await repository.upsertProgress(userId, stepId, 'COMPLETED');

      expect(result.props.status).toBe('COMPLETED');
      expect(result.props.completedAt).not.toBeNull();
      expect(result.props.completedAt).toBeInstanceOf(Date);
    });

    it('should auto-resolve lesson_id from step', async () => {
      const result = await repository.upsertProgress(userId, stepId, 'IN_PROGRESS');
      // lesson_id was fetched from steps table, not passed as parameter
      expect(result.props.lessonId).toBe(lessonId);
    });

    it('should update existing progress (upsert)', async () => {
      // First insert
      await repository.upsertProgress(userId, stepId, 'IN_PROGRESS');

      // Then update
      const result = await repository.upsertProgress(userId, stepId, 'COMPLETED');

      expect(result.props.status).toBe('COMPLETED');
      expect(result.props.attempts).toBe(2);
      expect(result.props.completedAt).not.toBeNull();
    });

    it('should increment attempts on update', async () => {
      await repository.upsertProgress(userId, stepId, 'IN_PROGRESS');
      await repository.upsertProgress(userId, stepId, 'IN_PROGRESS');
      const result = await repository.upsertProgress(userId, stepId, 'COMPLETED');

      expect(result.props.attempts).toBe(3);
    });

    it('should only have one progress row per user+step after upsert', async () => {
      await repository.upsertProgress(userId, stepId, 'IN_PROGRESS');
      await repository.upsertProgress(userId, stepId, 'COMPLETED');

      const progress = await repository.getProgressByUserAndStep(userId, stepId);
      expect(progress).not.toBeNull();
      expect(progress!.props.attempts).toBe(2);
    });
  });

  describe('mapRowToUserProgress', () => {
    it('should map all fields correctly for COMPLETED status', async () => {
      await seedLearningData();
      const completedAt = new Date();
      const progressId = crypto.randomUUID();

      await db.query(
        `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [progressId, userId, stepId, lessonId, 'COMPLETED', 5, completedAt],
      );

      const result = await repository.getProgressByUserAndStep(userId, stepId);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(progressId);
      expect(result!.props.userId).toBe(userId);
      expect(result!.props.stepId).toBe(stepId);
      expect(result!.props.lessonId).toBe(lessonId);
      expect(result!.props.status).toBe('COMPLETED');
      expect(result!.props.attempts).toBe(5);
      expect(result!.props.completedAt).not.toBeNull();
    });
  });
});
