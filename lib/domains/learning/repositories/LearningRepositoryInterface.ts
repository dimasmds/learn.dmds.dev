import { Unit } from '../entities/Unit';
import { Lesson } from '../entities/Lesson';
import { Step } from '../entities/Step';

export interface LearningRepositoryInterface {
  getUnits(): Promise<Unit[]>;
  getUnitById(id: string): Promise<Unit | null>;
  getLessonsByUnitId(unitId: string): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | null>;
  getStepsByLessonId(lessonId: string): Promise<Step[]>;
  getStepById(id: string): Promise<Step | null>;
}
