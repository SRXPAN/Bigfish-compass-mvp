# � BigFish Compass — Career Guidance Platform for Teens

> AI-powered career assessment platform connecting teenagers (14–18) with personalized education and career recommendations. Built for students, counselors, and schools.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Status](https://img.shields.io/badge/Status-MVP-yellow.svg)]()

---

## 📋 MVP Overview

### Platform Goals
This SaaS helps **teenagers discover their strengths and find career paths** through AI-powered assessments, and enables **schools & counselors to guide cohorts** toward better educational and professional decisions.

### What It Does
1. **Student**  
   → Takes multi-language career assessment  
   → Gets AI-powered career recommendations + education path  
   → Views personalized profile & strategy

2. **Counselor**  
   → Monitors student results in dashboard  
   → Exports cohort reports  
   → Tracks progress over multiple assessments

3. **Admin**  
   → Manages users, schools, access codes  
   → Configures assessments  
   → Views platform analytics

---

## 🏗️ Architecture

### Domain Model (High-Level)
```
Assessment Template
    → Assessment Session (per student)
        → Responses (answers to questions)
            → Profile Scores (dimensions: integrity, creativity, leadership, etc.)
                → Recommendations (top career matches)
                    → Report (exportable, multi-language PDF + JSON)

Access Code  
    → School Cohort (group access)
    → Billing/Entitlement (Stripe integration)
```

### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React, TypeScript, Vite | 18.2, 5.6, 5.1 |
| **Backend** | Node.js, Express, TypeScript | 20+, 4.19, 5.6 |
| **Database** | PostgreSQL, Prisma ORM | 16, 5.19 |
| **AI Integration** | OpenAI / Gemini API | Latest |
| **Billing** | Stripe | Latest |
| **Storage** | Cloudflare R2 / AWS S3 | - |
| **i18n** | Custom TypeScript layer | UA/PL/EN |

### Project Structure
```
bigfish-compass/
├── elearn-backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts           # ✓ Keep (user login/roles)
│   │   │   ├── admin.ts          # ✓ Keep (admin management)
│   │   │   ├── assessments.ts    # 🆕 NEW: Assessment templates & sessions
│   │   │   ├── recommendations.ts# 🆕 NEW: Career recommendations
│   │   │   ├── reports.ts        # 🆕 NEW: Report generation
│   │   │   ├── access-codes.ts   # 🆕 NEW: School cohort codes
│   │   │   ├── billing.ts        # 🆕 NEW: Stripe integration
│   │   │   ├── i18n.ts           # ✓ Keep (localization)
│   │   │   └── [legacy/]         # ⚠️ REMOVE: lessons, topics, quiz
│   │   ├── middleware/           # ✓ Keep auth, CSRF, rateLimit
│   │   ├── services/
│   │   │   ├── ai.service.ts     # ✓ Refactor: Remove report generation
│   │   │   ├── auth.service.ts   # ✓ Keep
│   │   │   ├── recommendations.service.ts  # 🆕 NEW
│   │   │   ├── assessment.service.ts       # 🆕 NEW
│   │   │   ├── report.service.ts           # 🆕 NEW (strict i18n)
│   │   │   └── stripe.service.ts           # 🆕 NEW
│   │   ├── prisma/
│   │   │   └── schema.prisma     # 🔄 ADD new models (see MVP checklist)
│   │   └── utils/
│   │       ├── i18n.ts           # ✓ Keep & enhance
│   │       ├── env.ts            # ✓ Keep
│   │       └── validation.ts      # ✓ Keep
│   └── package.json
│
├── elearn-front/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── [student-assessment]     # 🆕 NEW
│   │   │   ├── [student-results]        # 🆕 NEW
│   │   │   ├── [counselor-dashboard]    # 🆕 NEW
│   │   │   ├── admin/                    # ✓ Keep & extend
│   │   │   └── [legacy/]                 # ⚠️ REMOVE
│   │   ├── components/
│   │   │   ├── AssessmentWidget/        # 🆕 NEW
│   │   │   ├── RecommendationCard/      # 🆕 NEW
│   │   │   └── admin/                    # ✓ Keep
│   │   ├── auth/
│   │   │   └── AuthContext.tsx          # ✓ Keep
│   │   ├── i18n/                         # ✓ Keep & enhance
│   │   └── lib/
│   │       ├── assessmentApi.ts         # 🆕 NEW
│   │       └── http.ts                   # ✓ Keep
│   └── package.json
│
├── packages/shared/
│   ├── src/types/
│   │   ├── index.ts              # 🔄 UPDATE: Replace e-learn models
│   │   └── assessment.ts         # 🆕 NEW
│   └── package.json
│
├── docs/
│   ├── mvp-feature-map.md
│   ├── mvp-cutover-checklist.md
│   └── api-contracts.md          # 🆕 TODO: Document v2 APIs
│
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 20.0.0
- **PostgreSQL** >= 16.0
- **npm** >= 10.0.0

### 1. Install Dependencies
```bash
git clone https://github.com/SRXPAN/Bigfish-compass-mvp.git
cd bigfish-compass
npm install
```

### 2. Backend Setup

```bash
cd elearn-backend
```

Create `.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/bigfish?schema=public"

# Server
PORT=4000
CORS_ORIGIN="http://localhost:5173"
NODE_ENV=development

# Auth
JWT_SECRET="your-secret-key-32-chars-min"

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...   # Or use alternative

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Storage (Cloudflare R2 / AWS S3)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=bigfish-reports

# i18n & Locales
SUPPORTED_LOCALES=ua,pl,en
DEFAULT_LOCALE=ua
```

Initialize database:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

### 3. Frontend Setup

```bash
cd ../elearn-front
```

Create `.env.local`:
```env
VITE_API_URL=http://localhost:4000
VITE_STRIPE_KEY=pk_test_...
```

### 4. Run Locally

**Combined (from root):**
```bash
npm run dev
```

**Or separately:**
```bash
# Terminal 1
cd elearn-backend && npm run dev
# → http://localhost:4000

# Terminal 2
cd elearn-front && npm run dev
# → http://localhost:5173
```

---

## 🎯 MVP Feature Checklist

- [ ] Role-based auth (student, counselor, admin)
- [ ] Multi-language assessments (UA, PL, EN)
- [ ] AI-powered career recommendations
- [ ] Report generation (PDF + JSON export)
- [ ] Access codes for schools
- [ ] Admin dashboard
- [ ] Stripe billing + entitlements
- [ ] Student & counselor dashboards
- [ ] Basic assessment builder UI
- [ ] Audit logging for sensitive actions

See [docs/mvp-cutover-checklist.md](docs/mvp-cutover-checklist.md) for full detail.

---

## 🔗 References

- **Live Prototype**: https://bigfishcompass.lovable.app (Code: 4N9MS6L9)
- **Product Spec**: [docs/product-spec.md](docs/product-spec.md) (TBD)
- **API Contracts**: [docs/api-contracts.md](docs/api-contracts.md) (TBD)
- **Migration Map**: [docs/mvp-feature-map.md](docs/mvp-feature-map.md)

---


---

**Built with ❤️ for the future of career guidance.**

