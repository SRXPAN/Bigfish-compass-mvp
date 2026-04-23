# BigFish Compass MVP - Feature Map

## Goal
Reuse about 70% of this codebase and adapt it from e-learning to a career-guidance SaaS for teens (14-18), counselors, and schools.

## Keep With Minimal Changes
- Backend auth foundation: `elearn-backend/src/routes/auth.ts`, `elearn-backend/src/services/auth.service.ts`, `elearn-backend/src/services/token.service.ts`
- Role middleware and access checks: `elearn-backend/src/middleware/auth.ts`
- Error handling and request middleware: `elearn-backend/src/middleware/errorHandler.ts`, `elearn-backend/src/middleware/requestId.ts`, `elearn-backend/src/middleware/rateLimit.ts`
- Frontend auth context and protected routing: `elearn-front/src/auth/AuthContext.tsx`, `elearn-front/src/components/RequireAuth.tsx`, `elearn-front/src/components/RequireRole.tsx`
- i18n foundation: `elearn-front/src/i18n/*`, `elearn-backend/src/utils/i18n.ts`, `elearn-backend/src/routes/i18n.ts`
- Shared API typing structure: `packages/shared/src/*`
- Storage and file upload base (for reports/attachments): `elearn-backend/src/services/storage.service.ts`, `elearn-backend/src/routes/files.ts`
- Admin shell components and layout patterns: `elearn-front/src/pages/admin/*`, `elearn-front/src/components/admin/*`

## Refactor For MVP Requirements
- Roles: map existing roles to `student`, `counselor`, `admin`
- Domain entities: replace topics/lessons/materials with tests/questions/reports/recommendations
- Dashboard routes: shift to student progress + counselor cohort monitoring
- AI service: adapt to recommendation + report generation pipeline with strict language controls
- Quiz engine: convert to assessment/test builder with multilingual prompts and scoring dimensions
- Progress service: replace learning XP with assessment completion, profile fit scores, and action plans

## New Modules Needed
- Access codes module
  - School/group code creation, usage limits, activation windows
  - Student join flow by code
- Stripe billing module
  - Subscription/payment for school or consultant access
  - Entitlement checks in API middleware
- Recommendation orchestration
  - Multi-test aggregation into single strategy
  - Deterministic prompt templates per language
- Report generation module
  - Structured report JSON + PDF export layer
  - Language consistency validation checks

## Likely Remove Or Archive (After Migration)
- Learning content routes/services not needed for career guidance:
  - `elearn-backend/src/routes/lessons.ts`
  - `elearn-backend/src/routes/topics.ts`
  - `elearn-backend/src/services/materials.service.ts`
  - `elearn-backend/src/services/topics.service.ts`
  - `elearn-front/src/pages/LessonView.tsx`
  - `elearn-front/src/pages/Materials.tsx`
- Gamification-only logic if not in product scope:
  - `elearn-backend/src/utils/gamification.ts`
  - `elearn-front/src/pages/Leaderboard.tsx`

## Data Model Shift (High Level)
From:
- topic -> lesson -> material -> quiz

To:
- assessment_template -> assessment_session -> responses -> profile_scores -> recommendation -> report

## Migration Strategy
1. Create new Prisma models in parallel (do not delete old models immediately).
2. Add v2 API routes for new domain (`/api/v2/...`).
3. Wire frontend pages to new v2 APIs behind feature flags.
4. Migrate seed data for tests/careers/recommendations.
5. Remove legacy learning routes/pages only after parity is validated.
