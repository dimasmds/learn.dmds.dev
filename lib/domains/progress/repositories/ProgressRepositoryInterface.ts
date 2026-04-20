import { UserProgress } from '../entities/UserProgress';

export interface ProgressRepositoryInterface {
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getProgressByUserAndLesson(userId: string, lessonId: string): Promise<UserProgress[]>;
  getProgressByUserAndStep(userId: string, stepId: string): Promise<UserProgress | null>;
  upsertProgress(userId: string, stepId: string, status: string): Promise<UserProgress>;
}
