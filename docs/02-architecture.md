# 02 — Architecture

## Referensi

Arsitektur mengikuti pola **Clean Architecture** dari proyek `dicoding-dev/mooc-bijakcerdas`, disesuaikan untuk skala MVP.

## Tech Stack

| Kategori | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js (App Router) | 16+ |
| Bahasa | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS + Neobrutalism Components (shadcn/ui) | v4 |
| Code Editor | CodeMirror 6 | 6.x |
| State (Server) | @tanstack/react-query | 5.x |
| State (Client) | Zustand | 5.x |
| Database | PostgreSQL | 16 |
| ORM/Query | node-postgres (pg) | - |
| Migrasi | node-pg-migrate | - |
|| DI Container | Awilix | - |
| Framework CA | @kopiketuk/framework | - |
| Auth | JWT (jose) + httpOnly cookie | - |
| Testing | Vitest + React Testing Library | - |
| DevOps | Docker Compose (local) + Vercel (prod) | - |
| Package Manager | pnpm (Corepack) | 10+ |

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                          │
│  ├── app/            (Next.js App Router — pages & routes)   │
│  ├── features/       (Feature modules — UI + hooks)          │
│  └── controllers/    (HTTP request handlers)                 │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                           │
│  └── usecases/       (Business logic — satu use case/file)   │
├─────────────────────────────────────────────────────────────┤
│  DOMAIN LAYER                                                │
│  ├── entities/       (Domain objects dengan invariant)       │
│  ├── value-objects/  (Validated value types)                 │
│  ├── repositories/   (Interface ONLY — tanpa implementasi)   │
│  └── errors/         (Domain-specific errors)                │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                                        │
│  ├── repositories/   (PostgreSQL implementation)             │
│  ├── services/       (JwtService, external APIs)             │
│  ├── database/       (Pool config, connections)              │
│  └── container.ts    (DI container setup)                    │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rule

- **Domain** — TIDAK boleh bergantung pada layer manapun. Pure TypeScript.
- **Application** — Bergantung pada Domain (via repository interface).
- **Infrastructure** — Mengimplementasikan interface Domain.
- **Presentation** — Bergantung pada Application (via use case).

## Project Structure

```
learn.dmds.dev/
├── app/                              # Next.js App Router
│   ├── (marketing)/                  # Public pages (landing, pricing)
│   │   ├── page.tsx                  # Landing page
│   │   └── layout.tsx
│   ├── (app)/                        # Authenticated app
│   │   ├── dashboard/page.tsx        # Learning dashboard
│   │   ├── learn/
│   │   │   └── [lessonId]/page.tsx   # Lesson player
│   │   ├── profile/page.tsx          # User profile + badges
│   │   └── layout.tsx                # App shell (nav, sidebar)
│   ├── api/                          # API Route Handlers
│   │   ├── auth/                     # Login, register, logout, refresh
│   │   ├── lessons/                  # Get lessons, steps
│   │   ├── progress/                 # Update progress, streaks
│   │   ├── exercises/                # Submit answers, validate
│   │   └── gamification/            # XP, badges
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Tailwind + Neobrutalism CSS vars
│
├── features/                         # Feature-driven frontend modules
│   ├── landing/                      # Landing page feature
│   │   ├── components/
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── auth/                         # Auth feature
│   │   ├── components/
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── dashboard/                    # Dashboard feature (learning path map)
│   │   ├── components/
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── lesson-player/                # Lesson player (core feature)
│   │   ├── components/
│   │   │   ├── StepRenderer.tsx      # Routes to correct step component
│   │   │   ├── TheoryStep.tsx
│   │   │   ├── FillBlankStep.tsx
│   │   │   ├── MultipleChoiceStep.tsx
│   │   │   ├── ReorderStep.tsx
│   │   │   ├── SpotBugStep.tsx
│   │   │   ├── LiveCodeStep.tsx      # CodeMirror integration
│   │   │   ├── LivePreviewStep.tsx   # Split screen + preview
│   │   │   ├── OutputPredictionStep.tsx
│   │   │   ├── MatchingStep.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── hooks/
│   │   │   ├── useLesson.ts
│   │   │   ├── useStepNavigation.ts
│   │   │   └── useXP.ts
│   │   └── types.ts
│   ├── profile/                      # Profile + badges
│   └── gamification/                 # Streak display, XP counter, badges
│
├── lib/                              # Backend/Domain logic
│   ├── applications/
│   │   ├── usecases/
│   │   │   ├── auth/                 # Register, Login, Logout, RefreshToken
│   │   │   ├── learning/            # GetLessons, GetLessonDetail, GetSteps
│   │   │   ├── progress/            # UpdateProgress, CompleteLesson, GetStreak
│   │   │   ├── exercise/            # SubmitAnswer, ValidateCode
│   │   │   └── gamification/        # AwardXP, GetBadges, CheckAchievements
│   │   └── base/
│   │       └── dependencies.ts       # Shared UseCase deps interface
│   ├── domains/
│   │   ├── auth/
│   │   │   ├── entities/            # User, AuthSession
│   │   │   ├── value-objects/       # Email, Password, Username
│   │   │   ├── repositories/        # AuthRepository interface
│   │   │   └── errors/
│   │   ├── learning/
│   │   │   ├── entities/            # Unit, Lesson, Step
│   │   │   ├── value-objects/       # StepType, LessonOrder, CodeContent
│   │   │   ├── repositories/        # LessonRepository interface
│   │   │   └── errors/
│   │   ├── progress/
│   │   │   ├── entities/            # UserProgress, Streak
│   │   │   ├── value-objects/       # CompletionStatus, StreakCount
│   │   │   ├── repositories/        # ProgressRepository interface
│   │   │   └── errors/
│   │   └── gamification/
│   │       ├── entities/            # Badge, UserBadge, XP
│   │       ├── value-objects/       # XPAmount, BadgeType
│   │       ├── repositories/        # GamificationRepository interface
│   │       └── errors/
│   ├── infrastructures/
│   │   ├── container.ts             # DI container
│   │   ├── database/
│   │   │   └── pool.ts              # PostgreSQL pool
│   │   ├── repositories/            # PostgresXxxRepository implementations
│   │   └── services/
│   │       ├── JwtService.ts
│   │       └── PasswordService.ts   # bcrypt hashing
│   ├── presentations/
│   │   ├── controllers/             # AuthController, LessonController, etc.
│   │   └── utils/                   # Auth helpers, response helpers
│   ├── commons/
│   │   └── env.ts
│   └── tests/
│       └── helpers/
│           └── factories.ts          # Mock factories for all repos/services
│
├── components/                       # Shared UI components (Neobrutalism)
│   ├── ui/                           # Neobrutalism base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   └── layout/                       # App shell components
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── bottom-nav.tsx
│
├── hooks/                            # Shared hooks
│   ├── useGetData.ts                 # React Query GET wrapper
│   ├── useMutateData.ts              # React Query mutation wrapper
│   └── useAuth.ts                    # Auth state
│
├── contexts/                         # React Contexts
│   └── auth-context/                 # Auth provider
│
├── content/                          # Lesson content data
│   ├── units/
│   │   ├── unit-1-html/
│   │   │   ├── lessons/
│   │   │   │   ├── lesson-01.ts      # Step definitions
│   │   │   │   ├── lesson-02.ts
│   │   │   │   └── ...
│   │   │   └── index.ts             # Unit metadata
│   │   ├── unit-2-css/
│   │   └── unit-3-js/
│   └── index.ts                      # Content registry
│
├── migrations/                       # Database migrations (node-pg-migrate)
├── scripts/                          # Seeders, content generators
├── public/                           # Static assets
├── Dockerfile
├── docker-compose.yml                # PostgreSQL for local dev
├── vitest.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Feature Module Convention

Setiap feature module mengikuti struktur ini:

```
features/{feature-name}/
├── components/         # React components
├── hooks.ts           # Data fetching + state logic
├── types.ts           # Feature-specific types
└── __tests__/         # Feature tests
```

Pemisahan strict:
- `hooks.ts` — semua logic dan data fetching (bisa di-unit test)
- `components/*.tsx` — render only (minimal logic)

## API Convention

API routes adalah thin wrapper yang delegate ke Controller:

```typescript
// app/api/lessons/route.ts
export const GET = (req: NextRequest) => LessonController.index(req);
```

Controller resolve Use Case dari DI Container:

```typescript
// lib/presentations/controllers/LessonController.ts
static async index(req: NextRequest) {
  const getLessonsUseCase = container.getInstance('GetLessonsUseCase');
  const result = await getLessonsUseCase.execute();
  return NextResponse.json(result);
}
```

## State Management

### Dual State Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION                           │
│                                                           │
│  ┌─────────────────┐       ┌─────────────────────────┐   │
│  │  React Query     │       │  Zustand Stores          │   │
│  │  (Server State)  │       │  (Client State)          │   │
│  │                  │       │                          │   │
│  │  • Lesson data   │       │  • Auth state            │   │
│  │  • Progress data  │       │  • Lesson player state   │   │
│  │  • Badge data    │       │  • UI state              │   │
│  │  • XP history    │       │  • Code editor state     │   │
│  │                  │       │                          │   │
│  │  Auto-cached     │       │  Manual, bisa di-unit    │   │
│  │  Auto-refetched  │       │  test tanpa React        │   │
│  └─────────────────┘       └─────────────────────────┘   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### React Query — Server State

Untuk data yang berasal dari API (async, bisa stale, perlu cache):

```typescript
// hooks/useGetData.ts
export function useGetData<T>(key: string[], fetcher: () => Promise<T>) {
  return useQuery({ queryKey: key, queryFn: fetcher });
}

// hooks/useMutateData.ts
export function useMutateData<T>(key: string[], mutator: (data: T) => Promise<void>) {
  return useMutation({ mutationFn: mutator, onSuccess: () => invalidateQueries(key) });
}
```

**Usage examples:**
```typescript
// features/dashboard/hooks.ts
const { data: units } = useGetData(['units'], () => fetch('/api/units').then(r => r.json()));
const { data: streak } = useGetData(['streak'], () => fetch('/api/gamification/streak').then(r => r.json()));
```

### Zustand — Client State

Untuk state UI yang synchronous, perlu diakses cross-component, dan harus bisa di-unit test secara independen.

#### Store Structure

```
stores/
├── auth-store.ts          # Auth state (user, isAuthenticated)
├── lesson-player-store.ts # Active lesson state (current step, answers, timer)
├── ui-store.ts            # UI state (sidebar, modals, theme)
└── code-editor-store.ts   # Code editor state (current code, language)
```

#### 1. Auth Store

```typescript
// stores/auth-store.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}));
```

**Integrasi dengan React Query:** Auth store di-set dari React Query response. useAuth hook menggabungkan keduanya.

#### 2. Lesson Player Store

```typescript
// stores/lesson-player-store.ts
interface LessonPlayerState {
  // Current lesson context
  lessonId: string | null;
  steps: Step[];
  currentStepIndex: number;

  // Per-step state
  answers: Map<string, string>;        // stepId → user answer
  attempts: Map<string, number>;       // stepId → attempt count
  stepStatus: Map<string, StepStatus>; // stepId → CORRECT | WRONG | PENDING

  // Timing
  lessonStartTime: number | null;
}

interface LessonPlayerActions {
  startLesson: (lessonId: string, steps: Step[]) => void;
  goToStep: (index: number) => void;
  submitAnswer: (stepId: string, answer: string) => void;
  markCorrect: (stepId: string) => void;
  markWrong: (stepId: string) => void;
  resetLesson: () => void;
}

export const useLessonPlayerStore = create<LessonPlayerState & LessonPlayerActions>()(
  (set, get) => ({
    lessonId: null,
    steps: [],
    currentStepIndex: 0,
    answers: new Map(),
    attempts: new Map(),
    stepStatus: new Map(),
    lessonStartTime: null,

    startLesson: (lessonId, steps) => set({
      lessonId,
      steps,
      currentStepIndex: 0,
      answers: new Map(),
      attempts: new Map(),
      stepStatus: new Map(),
      lessonStartTime: Date.now(),
    }),

    goToStep: (index) => set({ currentStepIndex: index }),

    submitAnswer: (stepId, answer) => {
      const newAnswers = new Map(get().answers);
      const newAttempts = new Map(get().attempts);
      newAnswers.set(stepId, answer);
      newAttempts.set(stepId, (newAttempts.get(stepId) || 0) + 1);
      set({ answers: newAnswers, attempts: newAttempts });
    },

    markCorrect: (stepId) => {
      const newStatus = new Map(get().stepStatus);
      newStatus.set(stepId, 'CORRECT');
      set({ stepStatus: newStatus });
    },

    markWrong: (stepId) => {
      const newStatus = new Map(get().stepStatus);
      newStatus.set(stepId, 'WRONG');
      set({ stepStatus: newStatus });
    },

    resetLesson: () => set({
      lessonId: null, steps: [], currentStepIndex: 0,
      answers: new Map(), attempts: new Map(), stepStatus: new Map(),
      lessonStartTime: null,
    }),
  })
);
```

**Kenapa bukan React state?** Karena lesson player state perlu diakses dari banyak component bersarang (StepRenderer, ProgressBar, CodeEditor, FeedbackPanel) tanpa prop drilling. Dan store ini bisa di-unit test tanpa render React.

#### 3. UI Store

```typescript
// stores/ui-store.ts
interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  celebrationActive: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  triggerCelebration: () => void;
  stopCelebration: () => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  sidebarOpen: false,
  activeModal: null,
  celebrationActive: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  triggerCelebration: () => set({ celebrationActive: true }),
  stopCelebration: () => set({ celebrationActive: false }),
}));
```

#### 4. Code Editor Store

```typescript
// stores/code-editor-store.ts
interface CodeEditorState {
  code: string;
  language: 'html' | 'css' | 'javascript';
  readOnly: boolean;
  highlightedLines: number[];
}

interface CodeEditorActions {
  setCode: (code: string) => void;
  setLanguage: (lang: 'html' | 'css' | 'javascript') => void;
  setReadOnly: (readOnly: boolean) => void;
  setHighlightedLines: (lines: number[]) => void;
}

export const useCodeEditorStore = create<CodeEditorState & CodeEditorActions>()((set) => ({
  code: '',
  language: 'html',
  readOnly: false,
  highlightedLines: [],

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setReadOnly: (readOnly) => set({ readOnly }),
  setHighlightedLines: (highlightedLines) => set({ highlightedLines }),
}));
```

### Testing Zustand Stores

Setiap store bisa di-unit test tanpa React component:

```typescript
// stores/__tests__/lesson-player-store.test.ts
import { useLessonPlayerStore } from '../lesson-player-store';
import { mockSteps } from '@/lib/tests/helpers/factories';

describe('LessonPlayerStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLessonPlayerStore.getState().resetLesson();
  });

  it('should start a lesson correctly', () => {
    const { startLesson } = useLessonPlayerStore.getState();
    startLesson('lesson-1', mockSteps);

    const state = useLessonPlayerStore.getState();
    expect(state.lessonId).toBe('lesson-1');
    expect(state.currentStepIndex).toBe(0);
    expect(state.lessonStartTime).toBeDefined();
  });

  it('should track answer submissions and attempts', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.submitAnswer('step-1', '<h1>');

    const state = useLessonPlayerStore.getState();
    expect(state.answers.get('step-1')).toBe('<h1>');
    expect(state.attempts.get('step-1')).toBe(1);
  });

  it('should advance to next step on correct answer', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.goToStep(1);

    expect(useLessonPlayerStore.getState().currentStepIndex).toBe(1);
  });
});
```

### Data Flow Summary

```
User Action (click, type)
       ↓
Zustand Store (update client state instantly)
       ↓
React Query Mutation (sync to server)
       ↓
On Success → invalidate related queries (refetch stale data)
       ↓
React Query Cache updated → UI re-renders with fresh data
```

Example: User completes a step
1. User submits answer → `lessonPlayerStore.submitAnswer()`
2. Validator checks → `lessonPlayerStore.markCorrect()`
3. API call → `useMutateData` POST /api/progress/step
4. On success → invalidate `['progress']` and `['stats']` queries
5. Dashboard XP counter auto-updates from refetched data

## Environment

### Local Development
- PostgreSQL berjalan di Docker (docker-compose.yml)
- Next.js dev server
- Database: `localhost:5432` (dev), `localhost:5433` (test)

### Production
- Database: Supabase (PostgreSQL managed)
- Hosting: Vercel
- Domain: learn.dmds.dev (CNAME to Vercel)
