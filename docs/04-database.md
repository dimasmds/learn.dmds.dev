# 04 — Database Schema

## ERD

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users      │     │  auth_sessions   │     │    badges     │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)      │──┐  │ id (PK)          │     │ id (PK)      │
│ username     │  │  │ user_id (FK)     │     │ name         │
│ email        │  ├──│ refresh_token    │     │ description  │
│ password_hash│  │  │ expires_at       │     │ icon         │
│ display_name │  │  │ created_at       │     │ criteria     │
│ created_at   │  │  └──────────────────┘     │ created_at   │
│ updated_at   │  │                           └──────┬───────┘
└──────┬───────┘  │                                  │
       │          │                           ┌──────┴───────┐
       │          │                           │  user_badges  │
       │          │                           ├──────────────┤
       │          ├───────────────────────────│ id (PK)      │
       │          │                           │ user_id (FK) │
       │          │                           │ badge_id (FK)│
       │          │                           │ awarded_at   │
       │          │                           └──────────────┘
       │          │
       │          │  ┌──────────────┐     ┌──────────────┐
       │          │  │   streaks     │     │ xp_transactions│
       │          │  ├──────────────┤     ├──────────────┤
       │          ├──│ id (PK)      │     │ id (PK)      │
       │          │  │ user_id (FK) │     │ user_id (FK) │
       │          │  │ current      │     │ amount       │
       │          │  │ longest      │     │ source       │
       │          │  │ last_active  │     │ reference_id │
       │          │  │ freezes      │     │ created_at   │
       │          │  │ updated_at   │     └──────────────┘
       │          │  └──────────────┘
       │          │
       │          │  ┌──────────────────┐
       │          │  │  user_progress   │
       │          │  ├──────────────────┤
       │          └──│ id (PK)          │
       │             │ user_id (FK)     │
       │             │ step_id (FK)     │
       │             │ lesson_id (FK)   │
       │             │ status           │
       │             │ attempts         │
       │             │ completed_at     │
       │             │ created_at       │
       │             └──────────────────┘
       │
       │             ┌──────────────┐     ┌──────────────┐
       │             │    units      │     │   lessons     │
       │             ├──────────────┤     ├──────────────┤
       │             │ id (PK)      │──┐  │ id (PK)      │
       │             │ title        │  ├──│ unit_id (FK)  │
       │             │ description  │  │  │ title         │
       │             │ slug         │  │  │ description   │
       │             │ order_num    │  │  │ slug          │
       │             │ created_at   │  │  │ order_num     │
       │             └──────────────┘  │  │ is_project    │
       │                               │  │ created_at    │
       │                               │  └──────┬───────┘
       │                               │         │
       │                               │  ┌──────┴───────┐
       │                               │  │    steps      │
       │                               │  ├──────────────┤
       │                               └──│ id (PK)      │
       │                                  │ lesson_id (FK)│
       │                                  │ type          │
       │                                  │ order_num     │
       │                                  │ instruction   │
       │                                  │ content (JSON)│
       │                                  │ solution (JSON)│
       │                                  │ hints (JSON)  │
       │                                  │ xp_reward     │
       │                                  │ created_at    │
       │                                  └──────────────┘
       │
       │             ┌──────────────┐
       │             │ lesson_content │  (static content table,
       │             ├──────────────┤   seeded from codebase)
       │             │ lesson_id (PK)│
       │             │ steps (JSONB) │
       │             └──────────────┘
```

## Tables

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_users_username UNIQUE (username),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT ck_users_username_format CHECK (username ~ '^[a-zA-Z][a-zA-Z0-9_-]{2,19}$')
);
```

### auth_sessions
```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_auth_sessions_token UNIQUE (refresh_token_hash)
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
```

### units
```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR(100) NOT NULL,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_units_slug UNIQUE (slug),
  CONSTRAINT uq_units_order UNIQUE (order_num)
);
```

### lessons
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR(200) NOT NULL,
  order_num INTEGER NOT NULL,
  is_project BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_lessons_slug UNIQUE (slug),
  CONSTRAINT uq_lessons_unit_order UNIQUE (unit_id, order_num)
);

CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
```

### steps
```sql
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  order_num INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  solution JSONB NOT NULL DEFAULT '{}',
  hints JSONB NOT NULL DEFAULT '[]',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ck_steps_type CHECK (type IN (
    'theory', 'fill-blank', 'multiple-choice', 'reorder',
    'spot-bug', 'live-code', 'live-preview',
    'output-prediction', 'matching'
  )),
  CONSTRAINT ck_steps_xp_positive CHECK (xp_reward > 0),
  CONSTRAINT uq_steps_lesson_order UNIQUE (lesson_id, order_num)
);

CREATE INDEX idx_steps_lesson_id ON steps(lesson_id);
```

### user_progress
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
  attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ck_progress_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  CONSTRAINT ck_progress_attempts CHECK (attempts >= 0),
  CONSTRAINT uq_progress_user_step UNIQUE (user_id, step_id)
);

CREATE INDEX idx_progress_user_lesson ON user_progress(user_id, lesson_id);
CREATE INDEX idx_progress_user_id ON user_progress(user_id);
```

### streaks
```sql
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  streak_freezes INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ck_streaks_current CHECK (current_streak >= 0),
  CONSTRAINT ck_streaks_longest CHECK (longest_streak >= 0),
  CONSTRAINT ck_streaks_freezes CHECK (streak_freezes >= 0)
);
```

### badges
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_badges_name UNIQUE (name)
);
```

### user_badges
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_user_badges UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
```

### xp_transactions
```sql
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source VARCHAR(30) NOT NULL,
  reference_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ck_xp_amount CHECK (amount > 0),
  CONSTRAINT ck_xp_source CHECK (source IN (
    'STEP_COMPLETE', 'LESSON_COMPLETE', 'PROJECT_COMPLETE', 'STREAK_BONUS'
  ))
);

CREATE INDEX idx_xp_user_id ON xp_transactions(user_id);
```

## Migration Strategy

- Menggunakan `node-pg-migrate`
- Migrations diberi nomor urut: `001_create_users.js`, `002_create_auth_sessions.js`, dll.
- Seed data terpisah di `scripts/seed/`:
  - `seed-units.js` — 3 unit (HTML, CSS, JS)
  - `seed-badges.js` — 9 badges awal
  - `seed-lessons.js` — konten lesson (dari content/ directory)
- Local dev: `docker-compose up -d && pnpm run db:migrate && pnpm run db:seed`
- Test: database terpisah di port 5433, di-reset setiap test run
