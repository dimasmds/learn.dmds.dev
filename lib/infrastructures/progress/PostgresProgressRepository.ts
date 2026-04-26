import { Pool } from 'pg';
import type { ProgressRepositoryInterface } from '../../domains/progress/repositories/ProgressRepositoryInterface';
import { UserProgress, type UserProgressProps } from '../../domains/progress/entities/UserProgress';

interface ProgressRow {
  id: string;
  user_id: string;
  step_id: string;
  lesson_id: string;
  status: string;
  attempts: number;
  completed_at: Date | null;
  created_at: Date;
}

interface StepRow {
  lesson_id: string;
}

export class PostgresProgressRepository implements ProgressRepositoryInterface {
  constructor(private pool: Pool) {}

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const result = await this.pool.query<ProgressRow>(
      'SELECT * FROM user_progress WHERE user_id = $1',
      [userId],
    );
    return result.rows.map((row) => this.mapRowToUserProgress(row));
  }

  async getProgressByUserAndLesson(userId: string, lessonId: string): Promise<UserProgress[]> {
    const result = await this.pool.query<ProgressRow>(
      'SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId],
    );
    return result.rows.map((row) => this.mapRowToUserProgress(row));
  }

  async getProgressByUserAndStep(userId: string, stepId: string): Promise<UserProgress | null> {
    const result = await this.pool.query<ProgressRow>(
      'SELECT * FROM user_progress WHERE user_id = $1 AND step_id = $2',
      [userId, stepId],
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToUserProgress(result.rows[0]);
  }

  async upsertProgress(userId: string, stepId: string, status: string): Promise<UserProgress> {
    const existing = await this.pool.query<ProgressRow>(
      'SELECT * FROM user_progress WHERE user_id = $1 AND step_id = $2',
      [userId, stepId],
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      const completedAt = status === 'COMPLETED' ? new Date() : row.completed_at;

      const result = await this.pool.query<ProgressRow>(
        `UPDATE user_progress
         SET status = $1, attempts = attempts + 1, completed_at = $2
         WHERE user_id = $3 AND step_id = $4
         RETURNING *`,
        [status, completedAt, userId, stepId],
      );

      return this.mapRowToUserProgress(result.rows[0]);
    }

    const stepResult = await this.pool.query<StepRow>(
      'SELECT lesson_id FROM steps WHERE id = $1',
      [stepId],
    );

    const lessonId = stepResult.rows[0].lesson_id;
    const id = crypto.randomUUID();
    const now = new Date();
    const completedAt = status === 'COMPLETED' ? now : null;

    const result = await this.pool.query<ProgressRow>(
      `INSERT INTO user_progress (id, user_id, step_id, lesson_id, status, attempts, completed_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, userId, stepId, lessonId, status, 1, completedAt, now],
    );

    return this.mapRowToUserProgress(result.rows[0]);
  }

  private mapRowToUserProgress(row: ProgressRow): UserProgress {
    return UserProgress.reconstitute(row.id, {
      userId: row.user_id,
      stepId: row.step_id,
      lessonId: row.lesson_id,
      status: row.status as UserProgressProps['status'],
      attempts: row.attempts,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.created_at,
    });
  }
}
