# 06 — Milestones & Roadmap

## Overview

Development dibagi menjadi 6 milestone. Setiap milestone menghasilkan output yang bisa di-demo dan di-test secara independen.

```
M1: Foundation ───────→ M2: Auth ───────→ M3: Learning Engine
                                                  │
                                                  ↓
M6: Polish & Launch ←── M5: Content ←── M4: Gamification
```

---

## M1: Foundation (Week 1-2)

**Goal:** Project setup, Clean Architecture skeleton, Docker, CI/CD pipeline

### Deliverables

- [x] GitHub repo created
- [ ] Next.js 16 project initialized dengan TypeScript strict
- [ ] Tailwind CSS v4 + Neobrutalism components configured
- [ ] Clean Architecture directory structure created
- [ ] Docker Compose: PostgreSQL 16 (dev + test database)
- [ ] DI Container setup
- [ ] @kopiketuk/framework integrated
- [ ] Vitest configured with coverage
- [ ] GitHub Actions CI: type check → lint → test → build
- [ ] Base Neobrutalism UI components: Button, Card, Input, Badge
- [ ] App shell layout: Header, Sidebar (desktop), Bottom Nav (mobile)

### Testing Requirements
- [ ] CI pipeline green
- [ ] Test infrastructure working (factories, mocks)
- [ ] 1 sample use case with unit test
- [ ] Coverage reporting configured

### Key Files
```
package.json, tsconfig.json, next.config.ts, tailwind.config.ts
vitest.config.ts, docker-compose.yml, Dockerfile
.github/workflows/ci.yml
lib/domains/ (skeleton)
lib/applications/ (skeleton)
lib/infrastructures/ (skeleton)
components/ui/ (base components)
```

---

## M2: Authentication (Week 3)

**Goal:** User bisa register, login, logout. JWT + httpOnly cookie.

### Deliverables

- [ ] Auth domain: User entity, AuthSession entity
- [ ] Value Objects: Email, Username, Password validation
- [ ] Use Cases: RegisterUser, LoginUser, LogoutUser, RefreshToken, GetCurrentUser
- [ ] JWT service (access token + refresh token rotation)
- [ ] Password hashing (bcrypt)
- [ ] API Routes: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, POST /api/auth/refresh, GET /api/auth/me
- [ ] Auth middleware (protect routes)
- [ ] Frontend: Login page, Register page
- [ ] Auth context + useAuth hook
- [ ] Auth guard for protected pages

### Testing Requirements
- [ ] Domain: User entity tests (create, validation, invariants)
- [ ] Domain: Email, Username, Password VO tests
- [ ] Application: All 5 use case tests (mock repositories)
- [ ] Infrastructure: AuthRepository integration tests (real DB)
- [ ] Presentation: AuthController tests
- [ ] Feature: Login/Register component tests
- [ ] Coverage: Domain 90%, Application 85%, Presentation 75%

### Database Migrations
- [ ] 001_create_users.js
- [ ] 002_create_auth_sessions.js

---

## M3: Learning Engine (Week 4-5)

**Goal:** User bisa melihat learning path, membuka lesson, dan mengerjakan step interaktif.

### Deliverables

- [ ] Learning domain: Unit, Lesson, Step entities + Value Objects
- [ ] Progress domain: UserProgress entity + Value Objects
- [ ] Use Cases: GetUnits, GetLessonDetail, GetSteps, StartLesson, CompleteStep
- [ ] API Routes: GET /api/units, GET /api/lessons/:id, GET /api/steps/:lessonId, POST /api/progress/step
- [ ] Step validator service (client-side)
- [ ] CodeMirror 6 integration component
- [ ] All 8 step type components:
  - [ ] TheoryStep
  - [ ] FillBlankStep
  - [ ] MultipleChoiceStep
  - [ ] ReorderStep (with @dnd-kit)
  - [ ] SpotBugStep
  - [ ] LiveCodeStep (JavaScript sandbox)
  - [ ] LivePreviewStep (HTML/CSS split screen)
  - [ ] OutputPredictionStep
  - [ ] MatchingStep
- [ ] Lesson Player: step navigation, progress bar, feedback system
- [ ] Dashboard: Learning path map (visual node-based)
- [ ] Content data structure + 1 sample lesson (3-5 steps)

### Testing Requirements
- [ ] Domain: All entity + VO tests
- [ ] Application: All use case tests with mock repos
- [ ] Infrastructure: LessonRepository, ProgressRepository integration tests
- [ ] Step Validator: Unit tests for each step type validation
- [ ] JavaScript Sandbox: Edge case tests (infinite loop prevention, error handling)
- [ ] Feature: StepRenderer + each step component tests
- [ ] Live Preview: iframe sandbox security tests

### Database Migrations
- [ ] 003_create_units.js
- [ ] 004_create_lessons.js
- [ ] 005_create_steps.js
- [ ] 006_create_user_progress.js

---

## M4: Gamification (Week 6)

**Goal:** Streaks, XP, badges yang bekerja terintegrasi dengan progress.

### Deliverables

- [ ] Gamification domain: Badge, UserBadge, XPTransaction entities
- [ ] Streak logic: daily increment, reset, freeze
- [ ] Badge criteria checker
- [ ] Use Cases: CompleteStep (cross-domain: progress + XP + badge check), AwardXP, GetBadges, GetUserStats, UpdateStreak
- [ ] API Routes: GET /api/gamification/stats, GET /api/gamification/badges
- [ ] Dashboard: XP counter, streak display, badge showcase
- [ ] Step completion: celebration animation + XP popup
- [ ] Streak notification logic

### Testing Requirements
- [ ] Domain: Badge, XP entity tests
- [ ] Domain: Streak business logic tests (increment, reset, freeze)
- [ ] Application: CompleteStepUseCase integration across domains
- [ ] Application: BadgeCriteriaChecker tests (all criteria types)
- [ ] Application: StreakUpdateUseCase edge cases (timezone, midnight boundary)
- [ ] Infrastructure: All gamification repo integration tests
- [ ] Feature: Dashboard component tests

### Database Migrations
- [ ] 007_create_streaks.js
- [ ] 008_create_badges.js
- [ ] 009_create_user_badges.js
- [ ] 010_create_xp_transactions.js

### Seed Data
- [ ] 9 initial badges

---

## M5: Content (Week 7-9)

**Goal:** Full konten untuk 3 unit (HTML, CSS, JS). Setiap lesson lengkap dengan 5-8 step.

### Deliverables

- [ ] Unit 1 — Halaman Pertamaku (HTML): 7 lessons + project
- [ ] Unit 2 — Warnai Duniamu (CSS): 8 lessons + project
- [ ] Unit 3 — Bawa Hidup (JavaScript): 9 lessons + project
- [ ] Setiap lesson: 5-8 steps dengan mix tipe interaksi
- [ ] Setiap project: langkah-langkah guided
- [ ] Content seeder script
- [ ] Content preview tool (internal, untuk review konten)

### Content Quality Checklist per Lesson
- [ ] Ada tujuan pembelajaran yang jelas
- [ ] Dimulai dengan konteks/motivasi (kenapa ini penting?)
- [ ] Teori singkat + contoh kode
- [ ] Minimal 3 step interaktif per lesson
- [ ] Hints yang membantu tanpa memberi jawaban langsung
- [ ] Bahasa Indonesia yang natural, conversational
- [ ] Ilustrasi/visual untuk konsep abstrak

### Content Count Estimate
- 24 lessons + 3 projects = 27 lessons
- Average 6 steps per lesson = ~162 steps
- Breakdown by type (approximate):
  - Theory: 30%
  - Fill in the Blank: 20%
  - Multiple Choice: 10%
  - Live Code: 15%
  - Live Preview: 10%
  - Output Prediction: 5%
  - Reorder: 5%
  - Spot the Bug: 3%
  - Matching: 2%

---

## M6: Polish & Launch (Week 10-11)

**Goal:** Production-ready. UI polish, testing, deployment.

### Deliverables

- [ ] Landing page (marketing page for non-authenticated users)
- [ ] Onboarding flow (preview 3 steps → sign up)
- [ ] Profile page (display name, stats, badges)
- [ ] SEO: meta tags, sitemap, Open Graph
- [ ] Responsive design QA (mobile, tablet, desktop)
- [ ] Accessibility audit (keyboard nav, screen reader, contrast)
- [ ] Performance optimization (lazy loading, bundle analysis)
- [ ] Error handling & loading states
- [ ] Vercel deployment configured
- [ ] Domain learn.dmds.dev pointed to Vercel
- [ ] Supabase production database provisioned
- [ ] Production secrets configured (JWT_SECRET, DATABASE_URL)
- [ ] Monitoring / error tracking setup

### Testing Requirements
- [ ] E2E critical path tests (register → login → complete lesson → earn badge)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Load testing (simultaneous users)
- [ ] Security review (XSS in code editor, SQL injection, JWT security)

---

## Open Questions

1. **DI Container** — Awilix atau instances-container? Keputusan saat M1.
2. **Email verification** — Perlu untuk MVP? Atau langsung bisa pakai setelah register?
3. **Content authoring tool** — Perlu UI untuk author konten, atau cukup edit TypeScript files?
4. **Offline support** — PWA/service worker untuk akses offline? Nice-to-have untuk future.
5. **Analytics** — Perlu tracking (Plausible, Umami) untuk MVP?

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| CodeMirror mobile UX jelek | Tinggi — target mobile-first | Test sejak M3, fallback ke textarea simple |
| Konten terlalu banyak untuk 1 orang | Tinggi — timeline bisa mepet | Content bisa ditambah bertahap, MVP cukup Unit 1 saja |
| JavaScript sandbox tidak aman | Medium — XSS risk | iframe sandbox + CSP, jangan eval langsung |
| Neobrutalism unmaintained | Rendah — kita copy langsung | Fork dan maintain sendiri |
| Supabase free tier limit | Rendah — MVP users sedikit | Monitor, scale ke paid jika perlu |
