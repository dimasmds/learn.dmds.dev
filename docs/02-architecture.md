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
| DI Container | TBD (Awilix atau instances-container) | - |
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

## Environment

### Local Development
- PostgreSQL berjalan di Docker (docker-compose.yml)
- Next.js dev server
- Database: `localhost:5432` (dev), `localhost:5433` (test)

### Production
- Database: Supabase (PostgreSQL managed)
- Hosting: Vercel
- Domain: learn.dmds.dev (CNAME to Vercel)
