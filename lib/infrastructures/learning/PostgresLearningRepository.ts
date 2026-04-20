import { Pool } from 'pg';
import type { LearningRepositoryInterface } from '../../domains/learning/repositories/LearningRepositoryInterface';
import { Unit } from '../../domains/learning/entities/Unit';
import { Lesson } from '../../domains/learning/entities/Lesson';
import { Step } from '../../domains/learning/entities/Step';

interface UnitRow {
  id: string;
  title: string;
  description: string;
  slug: string;
  order_num: number;
  created_at: Date;
}

interface LessonRow {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  slug: string;
  order_num: number;
  is_project: boolean;
  created_at: Date;
}

interface StepRow {
  id: string;
  lesson_id: string;
  type: string;
  order_num: number;
  instruction: string;
  content: string;
  solution: string;
  hints: string;
  xp_reward: number;
  created_at: Date;
}

export class PostgresLearningRepository implements LearningRepositoryInterface {
  constructor(private pool: Pool) {}

  async getUnits(): Promise<Unit[]> {
    const result = await this.pool.query<UnitRow>(
      'SELECT id, title, description, slug, order_num, created_at FROM units ORDER BY order_num ASC',
    );
    return result.rows.map((row) => this.mapRowToUnit(row));
  }

  async getUnitById(id: string): Promise<Unit | null> {
    const result = await this.pool.query<UnitRow>(
      'SELECT id, title, description, slug, order_num, created_at FROM units WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUnit(result.rows[0]);
  }

  async getLessonsByUnitId(unitId: string): Promise<Lesson[]> {
    const result = await this.pool.query<LessonRow>(
      'SELECT id, unit_id, title, description, slug, order_num, is_project, created_at FROM lessons WHERE unit_id = $1 ORDER BY order_num ASC',
      [unitId],
    );
    return result.rows.map((row) => this.mapRowToLesson(row));
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const result = await this.pool.query<LessonRow>(
      'SELECT id, unit_id, title, description, slug, order_num, is_project, created_at FROM lessons WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToLesson(result.rows[0]);
  }

  async getStepsByLessonId(lessonId: string): Promise<Step[]> {
    const result = await this.pool.query<StepRow>(
      'SELECT id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at FROM steps WHERE lesson_id = $1 ORDER BY order_num ASC',
      [lessonId],
    );
    return result.rows.map((row) => this.mapRowToStep(row));
  }

  async getStepById(id: string): Promise<Step | null> {
    const result = await this.pool.query<StepRow>(
      'SELECT id, lesson_id, type, order_num, instruction, content, solution, hints, xp_reward, created_at FROM steps WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToStep(result.rows[0]);
  }

  private mapRowToUnit(row: UnitRow): Unit {
    return Unit.reconstitute(row.id, {
      title: row.title,
      description: row.description,
      slug: row.slug,
      order: row.order_num,
      lessonIds: [],
      createdAt: row.created_at,
      updatedAt: row.created_at,
    });
  }

  private mapRowToLesson(row: LessonRow): Lesson {
    return Lesson.reconstitute(row.id, {
      unitId: row.unit_id,
      title: row.title,
      description: row.description,
      slug: row.slug,
      order: row.order_num,
      steps: [],
      createdAt: row.created_at,
      updatedAt: row.created_at,
    });
  }

  private mapRowToStep(row: StepRow): Step {
    return Step.reconstitute(row.id, {
      lessonId: row.lesson_id,
      type: row.type,
      order: row.order_num,
      instruction: row.instruction,
      content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content ?? {},
      solution: typeof row.solution === 'string' ? JSON.parse(row.solution) : row.solution ?? {},
      hints: typeof row.hints === 'string' ? JSON.parse(row.hints) : row.hints ?? [],
      xpReward: row.xp_reward,
      createdAt: row.created_at,
      updatedAt: row.created_at,
    });
  }
}
