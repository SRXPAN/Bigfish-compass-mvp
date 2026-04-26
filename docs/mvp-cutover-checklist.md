# BigFish Compass MVP - Master Technical Roadmap

## ✅ Phase 1: Legacy E-Learning Cleanup (COMPLETED)
- [x] Repository initialized and stripped of old LMS fat.
- [x] Database schema cleaned (kept User, Auth, Quiz core).
- [x] Unused frontend components and backend routes removed.

---

## 🚀 Phase 2: Core MVP Development (CURRENT)

### 🎨 Sprint 1: Lovable UI Merge & Core Routing
**Goal:** Integrate the new design system and connect existing Auth without breaking the backend.
- [ ] **Dependencies:** Merge `package.json` (Tailwind, Shadcn, Lucide) from Lovable.
- [ ] **Styling:** Transfer `tailwind.config.js` and global CSS variables (`index.css`).
- [ ] **Component Transfer:** Move UI pages into `src/client-ui`.
- [ ] **Auth Connect:** Refactor Lovable's Login/Register components to trigger existing `AuthContext.tsx`.
- [ ] **Protected Routing:** Set up public routes (`/login`, `/`) and protected shells (`/dashboard`, `/counselor/*`, `/admin/*`).

### 🗄️ Sprint 2: Database Rework & Student Flow (Tokens)
**Goal:** Implement the "1 Token = 1 Test" logic and the Student Quiz experience.
- [ ] **Schema Updates:** Add `tokens` (Int) to `User`. Update `Quiz` for Career assessments (Weights, Archetypes).
- [ ] **Student Dashboard:** Build `/dashboard` where a user sees available tests.
- [ ] **Quiz Flow:** Fetch questions dynamically (`GET /api/quiz/:id`).
- [ ] **Token Consumption:** Deduct 1 Token when a student starts a test.
- [ ] **Submission Logic:** Endpoint to calculate raw category scores upon test completion.

### 🧠 Sprint 3: Deep AI Integration & i18n
**Goal:** Connect OpenAI for report generation and build the translation engine.
- [ ] **Context Assembly:** Build strict prompt combining user raw scores + available Careers DB.
- [ ] **JSON Enforcement:** Ensure OpenAI returns strict JSON for the Results Dashboard.
- [ ] **Results UI:** Map the AI JSON to the Lovable Results page (with loading states).
- [ ] **Admin AI Translator:** Utility to auto-translate questions/careers into 7 languages.
- [ ] **Human Override:** Admin UI to manually edit AI-translated text.

### 💳 Sprint 4: Commerce, B2B Access & Admin Superpowers
**Goal:** Make the platform sellable to schools and manageable for support.
- [ ] **Counselor Schema:** Add `seatsAvailable` (Int) to Counselor profile. Create `AccessCode` model (`code`, `maxUses`, `currentUses`).
- [ ] **Stripe B2C:** Checkout session to buy 1 Token for $10.
- [ ] **Stripe B2B (Counselor):** Checkout session to buy Packages (e.g., 30 seats for $200).
- [ ] **Cohort Management:** Counselor UI to generate codes from available seats and view student reports.
- [ ] **Paywall UI:** Block test access if `tokens === 0`, showing "Pay with Stripe" or "Enter Access Code".
- [ ] **Admin Impersonation:** Build "Log in as user" feature for tech support.
- [ ] **Admin Billing:** Dashboard to manually grant Tokens or Seats.

---

## 🏁 Phase 3: Production Readiness
- [ ] E2E smoke tests for role-based user flows.
- [ ] Billing test mode validation.
- [ ] Error tracking and audit verification.
- [ ] Deployment (Cloudflare Pages for Frontend, Render for Backend).