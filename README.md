# ⛳ GolfHeroes

**A subscription-driven MERN platform combining golf score tracking, monthly prize draws, and charitable giving.**

Built as a full-stack training assignment for [Digital Heroes](https://digitalheroes.co.in) — PRD v1.0, March 2026.

---

## What It Does

GolfHeroes lets golfers subscribe, log their Stableford scores, automatically enter monthly prize draws, and direct a share of their subscription to a charity they care about.

| Feature | Summary |
|---|---|
| **Subscriptions** | Monthly & yearly plans with tiered access control |
| **Score Tracking** | Log Stableford scores (1–45); rolling window of latest 5 |
| **Monthly Draw** | 3, 4, and 5-number match prizes with jackpot rollover |
| **Charity Giving** | Minimum 10% of subscription auto-directed to chosen charity |
| **Admin Panel** | Draw management, user control, charity CRUD, winner verification |

---

## Assignment Scope — What's Included & What's Not

This project was built against the Digital Heroes PRD as a **trainee selection assignment**.

✅ **Fully implemented:**
- Subscription engine with Monthly / Yearly plans and access control
- Stableford score entry with rolling 5-score logic and duplicate-date validation
- Draw engine — both Random and Algorithmic (score-frequency weighted) modes
- Draw simulation mode (admin previews before publishing)
- Jackpot rollover when no 5-match winner
- Prize pool auto-calculation and split across match tiers (40% / 35% / 25%)
- Charity selection, contribution percentage, and directory with search
- User dashboard — subscription status, scores, draw history, winnings
- Admin dashboard — users, draws, charities, winner verification, reports
- Winner proof upload and Pending → Paid payout lifecycle
- Dark / Light theme toggle, mobile-first responsive layout

⚠️ **Intentionally excluded (per assignment instructions):**
- **Live payment gateway** — Stripe integration is not connected. Subscription flow uses an internal simulation; plans activate immediately without a real transaction.
- **Email notifications** — Draw results, winner alerts, and system emails are not sent. The logic hooks exist but no email provider is wired up.

Both exclusions were explicitly permitted in the assignment brief.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Tailwind CSS, Context API, Axios |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT (header/cookie storage) |

---

## Project Structure

```
golf-heroes/
├── backend/
│   ├── controllers/      # Business logic — draws, scores, charities
│   ├── middleware/        # JWT auth, role-based access control
│   ├── models/            # Mongoose schemas — User, Draw, Score, Charity
│   ├── routes/            # REST API endpoints
│   ├── utils/             # DB seeding scripts
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Shared UI — Pricing, Nav, Cards
│   │   ├── context/       # Auth & Theme state (Context API)
│   │   ├── pages/         # Dashboard, Admin, Landing, Charity
│   │   └── services/      # Axios API layer
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── package.json           # Root — concurrent dev scripts
```

---

## Local Setup

```bash
# 1. Install dependencies
npm install
npm run install:all

# 2. Configure environment variables

# backend/.env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret

# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api

# 3. Seed the database
npm run seed

# 4. Start dev server (frontend + backend concurrently)
npm run dev
```

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@golfheroes.com | Admin1234! |
| Subscriber | player@golfheroes.com | Player1234! |
| Free User | free@golfheroes.com | Free1234! |

---

## PRD Coverage

Built against **Digital Heroes PRD v1.0** — all core modules implemented:

- `01` Subscription Engine
- `02` Score Management (5-score rolling logic, Stableford 1–45, unique dates)
- `03` Draw & Reward Engine (random + algorithmic, simulation, rollover)
- `04` Prize Pool Logic (tiered distribution, jackpot carry-forward)
- `05` Charity System (10% minimum, user-adjustable, directory + profiles)
- `06` Winner Verification (proof upload, admin approval, payout tracking)
- `07` User Dashboard (all required modules)
- `08` Admin Dashboard (full control — users, draws, charities, reports)
- `09` UI/UX (mobile-first, dark/light theme, modern non-golf aesthetic)

Excluded: live Stripe payment and email triggers (permitted by assignment instructions).
