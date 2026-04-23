# BigFish Compass MVP - Cutover Checklist

## 1. Repository Setup
- [x] Keep old remote as `legacy-origin`
- [x] Add new remote as `origin` (`Bigfish-compass-mvp`)
- [ ] Create `main` protection rules in GitHub
- [ ] Create `develop` and `release/mvp` branches

## 2. Cleanup Preparation (Non-Destructive)
- [ ] Tag current state: `git tag pre-bigfish-migration`
- [ ] Create migration branch: `git checkout -b feat/bigfish-mvp-core`
- [ ] Freeze legacy e-learning endpoints from further feature changes

## 3. Domain Rework
- [ ] Add Prisma entities for tests, sessions, responses, recommendations, reports, access codes
- [ ] Add role update/migration to `student | counselor | admin`
- [ ] Implement access code flows
- [ ] Implement Stripe billing + entitlement checks

## 4. AI and Language Quality
- [ ] Standardize prompt templates by locale
- [ ] Add language guardrail tests for report generation
- [ ] Add fallback logic if LLM response locale mismatches target locale

## 5. Frontend MVP Surfaces
- [ ] Student test flow + result page
- [ ] Counselor dashboard for cohort results
- [ ] Admin pages for users/codes/content
- [ ] Basic test builder UI

## 6. Safe Legacy Removal
Remove only after replacement is verified:
- [ ] lessons/materials/topic pages and APIs
- [ ] pure e-learning gamification screens
- [ ] unused shared types tied to removed modules

## 7. Production Readiness
- [ ] E2E smoke tests for role-based user flows
- [ ] Billing test mode validation
- [ ] Error tracking and audit verification
- [ ] Deployment checklist and rollback plan

## Recommended First Commands
```bash
git fetch --all
git checkout -b feat/bigfish-mvp-core
git tag pre-bigfish-migration
```
