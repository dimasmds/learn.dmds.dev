# M3: Learning Engine — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** User bisa melihat learning path, membuka lesson, dan mengerjakan step interaktif.

**Architecture:** Clean Architecture (existing pattern). TDD per layer: Domain → Application → Infrastructure → Presentation. Zustand for client state, fetch API for server state.

**Tech Stack:** node-pg-migrate, CodeMirror 6, @dnd-kit, Zustand

**Existing patterns to follow:**
- Entity: extends `Entity<string>` from `@kopiketuk/framework`, private constructor, static `create()`, getter props
- Value Object: static `create()` with validation, throws `InvariantError`
- Use Case: extends `ApplicationUseCase<Input,Output>`, receives deps via constructor, registered in container.ts
- Repository: interface in domain, concrete in infrastructure with `Pool` from `pg`
- Controller: static methods, thin wrapper calling use cases via `container.getInstance()`
- API Route: single file re-exporting controller method
- Store: Zustand `create<State & Actions>()`

---

## Phase 1: Domain Layer (Learning + Progress)

### Task 1: StepType Value Object

**Objective:** Create StepType enum validation

**Files:**
- Create: `lib/domains/learning/value-objects/StepType.ts`
- Create: `lib/domains/learning/value-objects/__tests__/StepType.test.ts`

**Step 1: Write failing test**

```typescript
// lib/domains/learning/value-objects/__tests__/StepType.test.ts
import { describe, it, expect } from 'vitest';
import { StepType } from '../StepType';

describe('StepType', () => {
  it('should create valid step type', () => {
    const type = StepType.create('theory');
    expect(type.value).toBe('theory');
  });

  it('should create all 9 types', () => {
    const types = ['theory', 'fill-blank', 'multiple-choice', 'reorder', 'spot-bug', 'live-code', 'live-preview', 'output-prediction', 'matching'];
    types.forEach(t => {
      expect(StepType.create(t).value).toBe(t);
    });
  });

  it('should throw for invalid type', () => {
    expect(() => StepType.create('invalid')).toThrow();
  });
});
```

**Step 2: Implement**

```typescript
// lib/domains/learning/value-objects/StepType.ts
import { InvariantError } from '@kopiketuk/framework';

const VALID_STEP_TYPES = [
  'theory', 'fill-blank', 'multiple-choice', 'reorder',
  'spot-bug', 'live-code', 'live-preview',
  'output-prediction', 'matching',
] as const;

export type StepTypeValue = typeof VALID_STEP_TYPES[number];

export class StepType {
  private constructor(private readonly _value: StepTypeValue) {}

  static create(value: string): StepType {
    if (!VALID_STEP_TYPES.includes(value as StepTypeValue)) {
      throw new InvariantError('STEP_TYPE.INVALID_TYPE');
    }
    return new StepType(value as StepTypeValue);
  }

  get value(): StepTypeValue { return this._value; }
}
```

**Step 3: Run tests, commit**

### Task 2: CompletionStatus Value Object

**Files:**
- Create: `lib/domains/progress/value-objects/CompletionStatus.ts`
- Create: `lib/domains/progress/value-objects/__tests__/CompletionStatus.test.ts`

Same pattern as StepType. Values: `'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'`

### Task 3: Unit Entity

**Files:**
- Create: `lib/domains/learning/entities/Unit.ts`
- Create: `lib/domains/learning/entities/__tests__/Unit.test.ts`

```typescript
// Unit has: id, title, description, slug, order (number), createdAt
// Factory: Unit.create({ title, description, slug, order })
// Invariants: title min 1 char, order positive, slug format
```

### Task 4: Lesson Entity

**Files:**
- Create: `lib/domains/learning/entities/Lesson.ts`
- Create: `lib/domains/learning/entities/__tests__/Lesson.test.ts`

```typescript
// Lesson has: id, unitId, title, description, slug, order, isProject, createdAt
// Factory: Lesson.create({ unitId, title, description, slug, order, isProject })
```

### Task 5: Step Entity

**Files:**
- Create: `lib/domains/learning/entities/Step.ts`
- Create: `lib/domains/learning/entities/__tests__/Step.test.ts`

```typescript
// Step has: id, lessonId, type (StepType), order, instruction, content (JSON), solution (JSON), hints (string[]), xpReward (number)
// Factory: Step.create({ lessonId, type, order, instruction, content, solution, hints, xpReward })
// Invariants: xpReward > 0, instruction min 1 char
```

### Task 6: UserProgress Entity

**Files:**
- Create: `lib/domains/progress/entities/UserProgress.ts`
- Create: `lib/domains/progress/entities/__tests__/UserProgress.test.ts`

```typescript
// UserProgress has: id, userId, stepId, lessonId, status (CompletionStatus), attempts, completedAt, createdAt
// Factory: UserProgress.create({ userId, stepId, lessonId })
// Methods: markAttempt(), complete()
// Invariants: attempts >= 0, completedAt only if COMPLETED
```

### Task 7: Repository Interfaces

**Files:**
- Create: `lib/domains/learning/repositories/LearningRepositoryInterface.ts`
- Create: `lib/domains/progress/repositories/ProgressRepositoryInterface.ts`

```typescript
// LearningRepositoryInterface:
//   getUnits(): Promise<Unit[]>
//   getUnitById(id: string): Promise<Unit | null>
//   getLessonsByUnitId(unitId: string): Promise<Lesson[]>
//   getLessonById(id: string): Promise<Lesson | null>
//   getStepsByLessonId(lessonId: string): Promise<Step[]>

// ProgressRepositoryInterface:
//   getUserProgress(userId: string, lessonId: string): Promise<UserProgress[]>
//   upsertStepProgress(progress: UserProgress): Promise<UserProgress>
//   getCompletedStepsCount(userId: string, lessonId: string): Promise<number>
```

---

## Phase 2: Database Migrations

### Task 8: Create units table migration

**Files:**
- Create: `migrations/1768400000000_create-units-table.ts`

Follow existing migration pattern (see `1768378666686_create-users-table.ts`). Use `pgm.sql()` for CHECK constraints per Bijakcerdas rules.

### Task 9: Create lessons table migration

**Files:**
- Create: `migrations/1768400000001_create-lessons-table.ts`

FK: `unit_id → units(id) ON DELETE CASCADE`

### Task 10: Create steps table migration

**Files:**
- Create: `migrations/1768400000002_create-steps-table.ts`

FK: `lesson_id → lessons(id) ON DELETE CASCADE`, content/solution/hints as JSONB

### Task 11: Create user_progress table migration

**Files:**
- Create: `migrations/1768400000003_create-user-progress-table.ts`

FK: `user_id → users(id)`, `step_id → steps(id)`, `lesson_id → lessons(id)` all ON DELETE CASCADE

### Task 12: Seed 3 units + 1 sample lesson

**Files:**
- Create: `scripts/seed-units.ts`
- Create: `scripts/seed-sample-lesson.ts`

Seed Unit 1 (HTML: "Halaman Pertamaku") with 1 lesson containing 3 sample steps (theory, fill-blank, multiple-choice).

---

## Phase 3: Application Layer (Use Cases)

### Task 13: Update dependencies.ts for Learning + Progress repos

**Files:**
- Modify: `lib/applications/usecases/base/dependencies.ts`

Add `learningRepository` and `progressRepository` to `LearnDmdsUseCaseDependencies`.

### Task 14: GetUnitsUseCase

**Files:**
- Create: `lib/applications/usecases/learning/GetUnitsUseCase.ts`
- Create: `lib/applications/usecases/learning/__tests__/GetUnitsUseCase.test.ts`

### Task 15: GetLessonDetailUseCase

**Files:**
- Create: `lib/applications/usecases/learning/GetLessonDetailUseCase.ts`
- Create: `lib/applications/usecases/learning/__tests__/GetLessonDetailUseCase.test.ts`

Returns lesson + its steps + user progress for each step.

### Task 16: CompleteStepUseCase

**Files:**
- Create: `lib/applications/usecases/progress/CompleteStepUseCase.ts`
- Create: `lib/applications/usecases/progress/__tests__/CompleteStepUseCase.test.ts`

Input: `{ userId, stepId, lessonId, correct: boolean }`
Logic: upsert progress, increment attempts, mark COMPLETED if correct.

---

## Phase 4: Infrastructure Layer

### Task 17: PostgresLearningRepository

**Files:**
- Create: `lib/infrastructures/learning/PostgresLearningRepository.ts`
- Create: `lib/infrastructures/learning/__tests__/PostgresLearningRepository.test.ts`

Integration test with real DB (per Bijakcerdas rules).

### Task 18: PostgresProgressRepository

**Files:**
- Create: `lib/infrastructures/progress/PostgresProgressRepository.ts`
- Create: `lib/infrastructures/progress/__tests__/PostgresProgressRepository.test.ts`

### Task 19: Register new repos + use cases in container.ts

**Files:**
- Modify: `lib/infrastructures/container.ts`

---

## Phase 5: Presentation Layer (API Routes)

### Task 20: LessonController

**Files:**
- Create: `lib/presentations/controllers/learning/LessonController.ts`
- Create: `lib/presentations/controllers/learning/__tests__/LessonController.test.ts`

Methods: `getUnits`, `getLessonDetail` (with steps + progress)

### Task 21: ProgressController

**Files:**
- Create: `lib/presentations/controllers/progress/ProgressController.ts`
- Create: `lib/presentations/controllers/progress/__tests__/ProgressController.test.ts`

Method: `completeStep`

### Task 22: API Routes

**Files:**
- Create: `app/api/units/route.ts` → `GET /api/units`
- Create: `app/api/lessons/[id]/route.ts` → `GET /api/lessons/:id`
- Create: `app/api/progress/step/route.ts` → `POST /api/progress/step`

### Task 23: Update middleware to protect lesson routes

**Files:**
- Modify: `middleware.ts`

Add `/learn/[lessonId]` and `/api/lessons/*`, `/api/units/*`, `/api/progress/*` to protected paths.

---

## Phase 6: Step Validator Service (Client-side)

### Task 24: StepValidator

**Files:**
- Create: `lib/applications/services/StepValidator.ts`
- Create: `lib/applications/services/__tests__/StepValidator.test.ts`

Validates each step type client-side. Theory always passes. Fill-blank: exact match case-insensitive. Multiple-choice: index comparison. Etc.

---

## Phase 7: Zustand Stores

### Task 25: Lesson Player Store

**Files:**
- Create: `lib/presentations/stores/lesson-player-store.ts`
- Create: `lib/presentations/stores/__tests__/lesson-player-store.test.ts`

As defined in architecture doc: currentStepIndex, answers, attempts, stepStatus, navigation actions.

---

## Phase 8: Install New Dependencies

### Task 26: Install CodeMirror + dnd-kit

```bash
pnpm add codemirror @codemirror/lang-html @codemirror/lang-css @codemirror/lang-javascript @codemirror/theme-one-dark @codemirror/view @codemirror/state @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Phase 9: UI Components (Step Type Components)

### Task 27: StepRenderer component

**Files:**
- Create: `features/lesson-player/components/StepRenderer.tsx`

Routes to correct step component based on step.type.

### Task 28: TheoryStep component

**Files:**
- Create: `features/lesson-player/components/TheoryStep.tsx`

Static content + "Lanjut" button.

### Task 29: FillBlankStep component

### Task 30: MultipleChoiceStep component

### Task 31: ReorderStep component (with @dnd-kit)

### Task 32: SpotBugStep component

### Task 33: LiveCodeStep component (CodeMirror)

### Task 34: LivePreviewStep component (split screen)

### Task 35: OutputPredictionStep component

### Task 36: MatchingStep component

---

## Phase 10: Lesson Player Page

### Task 37: Lesson Player page + layout

**Files:**
- Create: `app/(app)/learn/[lessonId]/page.tsx`

Step navigation, progress bar, feedback panel, XP popup.

---

## Phase 11: Dashboard Redesign

### Task 38: Dashboard with learning path map

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

Fetch `/api/units`, show unit cards with lesson lists and progress indicators.

---

## Phase 12: Learn Page Update

### Task 39: Learn page with unit listing

**Files:**
- Modify: `app/(app)/learn/page.tsx`

Fetch units and show clickable lesson cards.

---

## Execution Order

Phase 1-4 can be done sequentially (each task depends on previous).
Phase 5-6 after Phase 4.
Phase 7-8 can be done in parallel with Phase 5-6.
Phase 9-12 after Phase 7-8.

**Suggested PR breakdown:**
1. PR: Phase 1-2 (Domain + Migrations + Seed) — backend foundation
2. PR: Phase 3-5 (Use Cases + Infra + API) — backend complete
3. PR: Phase 6-8 (Validator + Store + Dependencies) — frontend foundation
4. PR: Phase 9 (Step Components) — per step type or batch
5. PR: Phase 10-12 (Lesson Player + Dashboard + Learn page) — UI complete

**Total estimated tasks:** ~39
**Estimated time:** 2-3 weeks of focused work
