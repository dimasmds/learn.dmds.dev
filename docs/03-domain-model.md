# 03 — Domain Model

## Domain Modules

### 1. Auth Domain

#### Entities

**User**
```
User {
  id: string (UUID)
  username: Username
  email: Email
  passwordHash: string
  displayName: string
  createdAt: Date
  updatedAt: Date
}

Invariant:
- username unik
- email unik
- passwordHash tidak null
- displayName minimal 1 karakter

Factory Method:
- User.create({ username, email, passwordHash, displayName }) → User
- user.updateProfile({ displayName }) → User (new instance, immutable)
```

**AuthSession**
```
AuthSession {
  id: string (UUID)
  userId: string
  refreshTokenHash: string
  expiresAt: Date
  createdAt: Date
}

Invariant:
- userId valid
- expiresAt harus di masa depan saat create
- satu user maksimal 5 active sessions
```

#### Value Objects

**Email**
```
Email {
  value: string

  Validation:
  - Format email valid (RFC 5322 simplified)
  - Lowercase
  - Trimmed
}
```

**Username**
```
Username {
  value: string

  Validation:
  - 3-20 karakter
  - Hanya alphanumeric, underscore, hyphen
  - Tidak boleh dimulai dengan angka
}
```

**Password** (tidak disimpan, hanya untuk validasi input)
```
Password {
  Validation:
  - Minimal 8 karakter
  - Ada huruf besar
  - Ada huruf kecil
  - Ada angka
}
```

#### Repository Interfaces

```typescript
interface AuthRepository {
  createUser(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  
  createSession(session: AuthSession): Promise<AuthSession>;
  findSessionByRefreshToken(tokenHash: string): Promise<AuthSession | null>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
}
```

---

### 2. Learning Domain

#### Entities

**Unit**
```
Unit {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

Invariant:
- order unik
- title minimal 1 karakter
```

**Lesson**
```
Lesson {
  id: string
  unitId: string
  title: string
  description: string
  order: number
  steps: Step[]
  isProject: boolean
}

Invariant:
- order unik per unit
- steps tidak boleh kosong
```

**Step**
```
Step {
  id: string
  lessonId: string
  type: StepType
  order: number
  instruction: string
  content: StepContent (polymorphic by type)
  solution: Solution
  hints: string[]
  xpReward: number
}

Invariant:
- order unik per lesson
- type valid (enum StepType)
- xpReward > 0
```

#### Value Objects

**StepType**
```
Enum: 'theory' | 'fill-blank' | 'multiple-choice' | 'reorder'
    | 'spot-bug' | 'live-code' | 'live-preview'
    | 'output-prediction' | 'matching'
```

**StepContent** (discriminated union by type)
```typescript
type StepContent =
  | { type: 'theory'; body: string; image?: string }
  | { type: 'fill-blank'; code: string; blankPositions: number[] }
  | { type: 'multiple-choice'; question: string; options: string[]; correctIndex: number }
  | { type: 'reorder'; blocks: string[]; correctOrder: number[] }
  | { type: 'spot-bug'; code: string; buggyLines: number[] }
  | { type: 'live-code'; initialCode: string; language: 'html' | 'css' | 'javascript' }
  | { type: 'live-preview'; initialCode: string; language: 'html' | 'css' }
  | { type: 'output-prediction'; code: string; language: 'javascript'; expectedOutput: string }
  | { type: 'matching'; pairs: { concept: string; definition: string }[] }
```

**LessonOrder**
```
Validation:
- Positive integer
- Unik per unit
```

#### Repository Interfaces

```typescript
interface LessonRepository {
  getUnits(): Promise<Unit[]>;
  getUnitById(id: string): Promise<Unit | null>;
  getLessonsByUnitId(unitId: string): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | null>;
  getStepsByLessonId(lessonId: string): Promise<Step[]>;
  getStepById(id: string): Promise<Step | null>;
}
```

---

### 3. Progress Domain

#### Entities

**UserProgress**
```
UserProgress {
  id: string
  userId: string
  stepId: string
  lessonId: string
  status: CompletionStatus
  attempts: number
  completedAt: Date | null
  createdAt: Date
}

Invariant:
- satu user satu step = satu progress record
- attempts >= 0
- completedAt hanya ada jika status = COMPLETED
```

**Streak**
```
Streak {
  userId: string
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date | null
  streakFreezes: number
  updatedAt: Date
}

Invariant:
- currentStreak >= 0
- streakFreezes >= 0, max 1 per minggu
- lastActiveDate bisa null (user baru)

Business Rules:
- Streak bertambah kalau user selesai ≥1 lesson di hari itu
- Streak reset ke 0 kalau user skip 1 hari tanpa freeze
- Streak freeze digunakan otomatis saat user tidak aktif
```

#### Value Objects

**CompletionStatus**
```
Enum: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
```

**StreakCount**
```
Validation:
- Non-negative integer
```

#### Repository Interfaces

```typescript
interface ProgressRepository {
  getUserProgress(userId: string, lessonId: string): Promise<UserProgress[]>;
  getStepProgress(userId: string, stepId: string): Promise<UserProgress | null>;
  upsertStepProgress(progress: UserProgress): Promise<UserProgress>;
  getCompletedLessonsCount(userId: string): Promise<number>;
  getCompletedStepsCount(userId: string, lessonId: string): Promise<number>;
  
  getStreak(userId: string): Promise<Streak | null>;
  updateStreak(streak: Streak): Promise<Streak>;
  createStreak(userId: string): Promise<Streak>;
}
```

---

### 4. Gamification Domain

#### Entities

**Badge**
```
Badge {
  id: string
  name: string
  description: string
  icon: string (emoji atau icon key)
  criteria: BadgeCriteria
}

Invariant:
- name unik
- criteria well-defined
```

**UserBadge**
```
UserBadge {
  id: string
  userId: string
  badgeId: string
  awardedAt: Date
}

Invariant:
- satu user tidak bisa dapat badge yang sama 2x
```

**XPTransaction**
```
XPTransaction {
  id: string
  userId: string
  amount: number
  source: XPSource
  referenceId: string (stepId, lessonId, dll)
  createdAt: Date
}

Invariant:
- amount > 0
- source valid
```

#### Value Objects

**BadgeCriteria** (discriminated union)
```typescript
type BadgeCriteria =
  | { type: 'unit_complete'; unitId: string }
  | { type: 'streak_days'; days: number }
  | { type: 'perfect_lesson'; lessonId?: string }
  | { type: 'total_xp'; amount: number }
  | { type: 'speed_run'; maxSeconds: number }
  | { type: 'night_owl'; hours: [number, number] }
```

**XPSource**
```
Enum: 'STEP_COMPLETE' | 'LESSON_COMPLETE' | 'PROJECT_COMPLETE' | 'STREAK_BONUS'
```

#### Repository Interfaces

```typescript
interface GamificationRepository {
  getUserXP(userId: string): Promise<number>;
  addXP(transaction: XPTransaction): Promise<XPTransaction>;
  getXPHistory(userId: string): Promise<XPTransaction[]>;
  
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  hasBadge(userId: string, badgeId: string): Promise<boolean>;
}
```

---

## Cross-Domain Use Cases

Beberapa use case melibatkan lebih dari 1 domain:

**CompleteStepUseCase** (Progress + Gamification + Learning)
1. Validasi step exists
2. Upsert step progress
3. Cek apakah lesson selesai semua
4. Jika ya, award lesson completion XP
5. Cek badge eligibility
6. Update streak

**RegisterUserUseCase** (Auth + Progress + Gamification)
1. Validasi email, username, password
2. Hash password
3. Create user
4. Create initial streak
5. (Tidak perlu award badge — baru register)

## Domain Events (Future)

Untuk MVP, cross-domain logic di-handle langsung di use case. Untuk future, bisa diperkenalkan domain events:

```
StepCompleted → CheckLessonCompletion → AwardXP → CheckBadges
LessonCompleted → UpdateStreak → CheckBadges
```
