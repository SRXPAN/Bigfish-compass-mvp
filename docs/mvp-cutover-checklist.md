# BigFish Compass MVP - Master Checklist & Roadmap

## ✅ Phase 1: Repository Setup & Legacy Cleanup (COMPLETED)
- [x] Keep old remote as `legacy-origin`
- [x] Add new remote as `origin` (`Bigfish-compass-mvp`)
- [x] Create migration branch: `feat/bigfish-mvp-core`
- [x] Safe Legacy Removal: Deleted all pure e-learning modules (lessons, materials, gamification, leaderboard).
- [x] Generated clean `init_bigfish` Prisma migration.

---

## 🚀 Phase 2: Core MVP Development (Current Phase)

### Sprint 1: Lovable UI Merge & Auth Integration
- [ ] **Dependencies:** Merge Lovable's `package.json` (Tailwind, Shadcn, Lucide) into `bigfish-front`.
- [ ] **Styling:** Transfer `tailwind.config.js` and global CSS variables from Lovable to `bigfish-front`.
- [ ] **Component Transfer:** Move Lovable UI pages into `bigfish-front/src/client-ui`.
- [ ] **Routing Updates:** Update `App.tsx` to map public routes (`/`, `/quiz`, `/login`) to Lovable components, while keeping `/admin/*` intact.
- [ ] **Auth Connect:** Refactor Lovable's Login/Register components to trigger existing `AuthContext.tsx` logic.

### Sprint 2: Database Domain Rework & Quiz Logic
- [ ] **Schema Update:** Adapt `Quiz`, `Question`, and `QuizAttempt` models for career assessments (e.g., scoring weights, categories).
- [ ] **Dynamic Data Fetching:** Replace hardcoded Lovable questions with API calls (`GET /api/quiz/:id`).
- [ ] **Test Builder UI:** Update Admin pages to support creating career questions and assigning category weights.
- [ ] **Result Calculation:** Create backend endpoint to calculate raw assessment scores (Analytics vs. Creative) upon submission.

### Sprint 3: Deep i18n & AI Report Generation
- [ ] **i18n Architecture:** Verify `Translation` and `TranslationValue` tables logic for multi-language questions.
- [ ] **AI Context Injection (`ai.service.ts`):** Build prompt combining user test scores + user profile + database of careers.
- [ ] **JSON Mode Enforcement:** Ensure OpenAI returns strict JSON formatting to prevent frontend rendering errors.
- [ ] **Report UI:** Connect Lovable `/results/:id` page to securely fetch and render the AI-generated JSON.
- [ ] **Language Guardrails:** Add fallback logic if LLM response locale mismatches user's requested locale.

### Sprint 4: B2B Access Logic & Stripe Monetization
- [ ] **Role Migration:** Ensure complete separation of `student`, `counselor`, and `admin` roles in frontend `RequireRole.tsx`.
- [ ] **Access Code Flow:** Create endpoints for generating and redeeming cohort access codes.
- [ ] **Counselor Dashboard:** Build UI for counselors to view their cohort's AI reports.
- [ ] **Stripe Billing:** Implement checkout for one-time tests / B2B access.
- [ ] **Entitlement Checks:** Add middleware to verify payment/access code before allowing test submission.

---

## 🏁 Phase 3: Production Readiness
- [ ] E2E smoke tests for role-based user flows.
- [ ] Billing test mode validation.
- [ ] Error tracking and audit verification.
- [ ] Deployment (Cloudflare Pages for Frontend, Render for Backend).