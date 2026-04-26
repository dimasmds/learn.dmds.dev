import { afterAll, afterEach, beforeAll, describe, it, expect } from 'vitest';
import { PostgresLearningRepository } from '../PostgresLearningRepository';
import { createDatabaseTestContext, type DatabaseTestContext } from '../../../tests/helpers/database';

describe.sequential('PostgresLearningRepository', () => {
  const db = createDatabaseTestContext();
  let repository: PostgresLearningRepository;

  // Test data IDs (explicit for cross-table references)
  const unitId = '11111111-1111-1111-1111-111111111111';
  const lessonId = '22222222-2222-2222-2222-222222222222';
  const stepId = '33333333-3333-3333-3333-333333333333';

  beforeAll(async () => {
    await db.setup();
    repository = new PostgresLearningRepository(db.pool);
  });

  afterEach(async () => {
    await db.query('DELETE FROM steps');
    await db.query('DELETE FROM lessons');
    await db.query('DELETE FROM units');
  });

  afterAll(async () => {
    await db.teardown();
  });

  // Helper to insert a full unit → lesson → step chain
  async function seedUnitLessonStep(overrides: {
    unitId?: string;
    lessonId?: string;
    stepId?: string;
    unitTitle?: string;
    unitSlug?: string;
    unitOrder?: number;
    lessonTitle?: string;
    lessonSlug?: string;
    lessonOrder?: number;
    stepType?: string;
    stepOrder?: number;
    stepInstruction?: string;
  } = {}): Promise<void> {
    const uId = overrides.unitId ?? unitId;
    const lId = overrides.lessonId ?? lessonId;
    const sId = overrides.stepId ?? stepId;

    await db.query(
      `INSERT INTO units (id, title, description, slug, order_num, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uId, overrides.unitTitle ?? 'Test Unit', 'A test unit', overrides.unitSlug ?? 'test-unit', overrides.unitOrder ?? 1],
    );
    await db.query(
      `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
      [lId, uId, overrides.lessonTitle ?? 'Test Lesson', 'A test lesson', overrides.lessonSlug ?? 'test-lesson', overrides.lessonOrder ?? 1],
    );
    await db.query(
      `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        sId, lId,
        overrides.stepType ?? 'theory',
        overrides.stepOrder ?? 1,
        overrides.stepInstruction ?? 'Read this',
        JSON.stringify({ text: 'Hello World' }),
        JSON.stringify({}),
        JSON.stringify([]),
        10,
      ],
    );
  }

  describe('getUnits', () => {
    it('should return empty array when no units exist', async () => {
      const units = await repository.getUnits();
      expect(units).toEqual([]);
    });

    it('should return all units ordered by order_num', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Unit B', 'Second', 'unit-b', 2],
      );
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Unit A', 'First', 'unit-a', 1],
      );

      const units = await repository.getUnits();
      expect(units).toHaveLength(2);
      expect(units[0].props.title).toBe('Unit A');
      expect(units[1].props.title).toBe('Unit B');
    });

    it('should map unit fields correctly', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'My Unit', 'Description here', 'my-unit', 5],
      );

      const units = await repository.getUnits();
      expect(units).toHaveLength(1);
      const u = units[0];
      expect(u.id).toBe(unitId);
      expect(u.props.title).toBe('My Unit');
      expect(u.props.description).toBe('Description here');
      expect(u.props.slug).toBe('my-unit');
      expect(u.props.order).toBe(5);
    });
  });

  describe('getUnitById', () => {
    it('should return null when unit not found', async () => {
      const result = await repository.getUnitById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });

    it('should return unit by id', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'Find Me', 'desc', 'find-me', 1],
      );

      const result = await repository.getUnitById(unitId);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(unitId);
      expect(result!.props.title).toBe('Find Me');
    });
  });

  describe('getLessonsByUnitId', () => {
    it('should return empty array when no lessons exist for unit', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'Unit', 'desc', 'unit', 1],
      );

      const lessons = await repository.getLessonsByUnitId(unitId);
      expect(lessons).toEqual([]);
    });

    it('should return lessons ordered by order_num', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'Unit', 'desc', 'unit', 1],
      );
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
        ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', unitId, 'Lesson B', 'desc', 'lesson-b', 2],
      );
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
        ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', unitId, 'Lesson A', 'desc', 'lesson-a', 1],
      );

      const lessons = await repository.getLessonsByUnitId(unitId);
      expect(lessons).toHaveLength(2);
      expect(lessons[0].props.title).toBe('Lesson A');
      expect(lessons[1].props.title).toBe('Lesson B');
    });

    it('should map lesson fields correctly including is_project', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'Unit', 'desc', 'unit', 1],
      );
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at) VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())`,
        [lessonId, unitId, 'Project', 'Build something', 'project', 3],
      );

      const lessons = await repository.getLessonsByUnitId(unitId);
      expect(lessons).toHaveLength(1);
      const l = lessons[0];
      expect(l.id).toBe(lessonId);
      expect(l.props.unitId).toBe(unitId);
      expect(l.props.title).toBe('Project');
      expect(l.props.slug).toBe('project');
      expect(l.props.order).toBe(3);
    });

    it('should not return lessons from other units', async () => {
      const otherUnitId = '99999999-9999-9999-9999-999999999999';
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'Unit A', 'desc', 'unit-a', 1],
      );
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [otherUnitId, 'Unit B', 'desc', 'unit-b', 2],
      );
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
        [lessonId, unitId, 'A Lesson', 'desc', 'a-lesson', 1],
      );

      const lessons = await repository.getLessonsByUnitId(otherUnitId);
      expect(lessons).toEqual([]);
    });
  });

  describe('getLessonById', () => {
    it('should return null when lesson not found', async () => {
      const result = await repository.getLessonById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });

    it('should return lesson by id', async () => {
      await seedUnitLessonStep();

      const result = await repository.getLessonById(lessonId);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(lessonId);
      expect(result!.props.title).toBe('Test Lesson');
    });
  });

  describe('getStepsByLessonId', () => {
    it('should return empty array when no steps exist for lesson', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'Unit', 'desc', 'unit', 1],
      );
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
        [lessonId, unitId, 'Lesson', 'desc', 'lesson', 1],
      );

      const steps = await repository.getStepsByLessonId(lessonId);
      expect(steps).toEqual([]);
    });

    it('should return steps ordered by order_num', async () => {
      await db.query(
        `INSERT INTO units (id, title, description, slug, order_num, created_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [unitId, 'Unit', 'desc', 'unit', 1],
      );
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
        [lessonId, unitId, 'Lesson', 'desc', 'lesson', 1],
      );
      await db.query(
        `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', lessonId, 'theory', 2, 'Step 2', '{}', '{}', '[]', 10],
      );
      await db.query(
        `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', lessonId, 'fill-blank', 1, 'Step 1', '{"text":"___"}', '{"answer":"hello"}', '["think simple"]', 15],
      );

      const steps = await repository.getStepsByLessonId(lessonId);
      expect(steps).toHaveLength(2);
      expect(steps[0].props.order).toBe(1);
      expect(steps[0].props.type).toBe('fill-blank');
      expect(steps[1].props.order).toBe(2);
      expect(steps[1].props.type).toBe('theory');
    });

    it('should map step JSONB fields correctly', async () => {
      await seedUnitLessonStep({
        stepType: 'fill-blank',
        stepInstruction: 'Fill in the blank',
      });

      const steps = await repository.getStepsByLessonId(lessonId);
      expect(steps).toHaveLength(1);
      const s = steps[0];
      expect(s.props.lessonId).toBe(lessonId);
      expect(s.props.type).toBe('fill-blank');
      expect(s.props.instruction).toBe('Fill in the blank');
      expect(s.props.content).toEqual({ text: 'Hello World' });
      expect(s.props.xpReward).toBe(10);
    });

    it('should not return steps from other lessons', async () => {
      const otherLessonId = '88888888-8888-8888-8888-888888888888';
      await seedUnitLessonStep();
      await db.query(
        `INSERT INTO lessons (id, unit_id, title, description, slug, order_num, is_project, created_at) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())`,
        [otherLessonId, unitId, 'Other Lesson', 'desc', 'other-lesson', 2],
      );
      await db.query(
        `INSERT INTO steps (id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        ['cccccccc-cccc-cccc-cccc-cccccccccccc', otherLessonId, 'theory', 1, 'Other step', '{}', '{}', '[]', 5],
      );

      const steps = await repository.getStepsByLessonId(lessonId);
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe(stepId);
    });
  });

  describe('getStepById', () => {
    it('should return null when step not found', async () => {
      const result = await repository.getStepById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });

    it('should return step by id with all fields', async () => {
      await seedUnitLessonStep({
        stepType: 'multiple-choice',
        stepInstruction: 'Pick one',
      });

      const result = await repository.getStepById(stepId);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(stepId);
      expect(result!.props.type).toBe('multiple-choice');
      expect(result!.props.instruction).toBe('Pick one');
      expect(result!.props.content).toEqual({ text: 'Hello World' });
      expect(result!.props.solution).toEqual({});
      expect(result!.props.hints).toEqual([]);
      expect(result!.props.xpReward).toBe(10);
    });
  });
});
