# ⛳ GolfHeroes — Premium MERN Full-Stack Platform

> **Track Scores · Win Prizes · Support Charity**
>
> *A high-converting, modern SaaS experience designed to disrupt the golf industry through charitable impact and interactive competition.*

---

## 🚀 Project Walkthrough: The User Journey

### 1. Discovery & Onboarding
- **Public Visitor**: Explores the landing page, discovers the "How it Works" workflow, and browses the charity directory without needing an account.
- **Signup**: Quick registration with instant access to the "Free" tier.

### 2. The Subscription Experience
- **Premium Tiers**: Users can choose between **Monthly** and **Yearly** plans via a high-converting Pricing section.
- **Instant Activation**: Simulated payment flow ensures immediate access to premium features (Score logging & Draws).
- **Theme Choice**: Users can switch between **Dark** and **Light** modes at any time for their preferred viewing experience.

### 3. Golf Performance Tracking
- **Score Entry**: Simple, responsive form to log Stableford scores (1-45).
- **Rolling Logic**: The system automatically retains only the **latest 5 scores**. Adding a 6th score replaces the oldest entry, ensuring a dynamic performance profile.
- **Validation**: Strict enforcement of unique dates and valid score ranges.

### 4. The Monthly Draw & Rewards
- **Automatic Entry**: Subscribers are automatically entered into the monthly draw.
- **Transparency**: Users can view the latest winning numbers and their personal match status (e.g., "3-match" winner or "No Match" participation).
- **Jackpot Rollover**: If no one hits the 5-match jackpot, the prize pool rolls over to the next month, increasing excitement.

### 5. Giving Back
- **Charity Selection**: Users select their favorite charity from a curated list.
- **Contribution**: 10% of every subscription goes to the chosen charity, with an option to increase this percentage directly from the dashboard.

### 6. Winner Verification
- **Proof Upload**: Winners upload a screenshot of their score card for verification.
- **Admin Review**: Admins verify the proof and mark the prize as "Paid," providing a secure and auditable reward lifecycle.

---

## ✅ PRD Requirement Checklist

### 01 | Subscription Engine
- [x] **Monthly & Yearly Plans**: Fully implemented with tiered access logic.
- [x] **Access Control**: Features like score entry and draw details are locked for non-subscribers.
- [x] **Lifecycle Management**: Handles renewal dates and status checks on every request.

### 02 | Score Experience
- [x] **Input Range**: Enforced 1–45 (Stableford format).
- [x] **Rolling 5-Score Logic**: Newest replaces oldest automatically.
- [x] **Reverse Chronology**: Scores displayed most-recent first.

### 03 | Draw & Reward Engine
- [x] **Multiple Match Types**: Logic for 5, 4, and 3-number matches.
- [x] **Dual Draw Logic**: Support for both **Random** and **Algorithmic** (score-frequency based) draws.
- [x] **Simulation Mode**: Admins can simulate and review draws before publishing.
- [x] **Rollover Support**: 5-match jackpot carries forward if unclaimed.

### 04 | Charity Integration
- [x] **Contribution Model**: Minimum 10% enforced; user-updatable percentage.
- [x] **Directory**: Searchable charity list with detailed profiles and mission statements.
- [x] **Spotlight**: Featured charities highlighted on the homepage.

### 05 | Dashboard (User & Admin)
- [x] **User Panel**: Subscription status, Score entry, Participation history, and Winnings overview.
- [x] **Admin Panel**: User mgmt, Draw simulation/publishing, Charity CRUD, and Winner verification.
- [x] **Reports**: Total users, total pool, and charity contribution analytics.

### 06 | UI / UX Excellence
- [x] **Modern Aesthetic**: Dark deep-gray/black theme with neon green accents (SaaS feel).
- [x] **Theme Toggle**: Real-time Light/Dark mode switching.
- [x] **Responsive**: Mobile-first design (Grid stacks on mobile, expands on desktop).
- [x] **Animations**: Subtle transitions and hover effects (e.g., pricing card scaling).

---

## 📁 Project Structure

```text
golf-heroes/
├── backend/                  # Express + MongoDB API
│   ├── controllers/          # Business logic (Draws, Scores, Charity)
│   ├── middleware/           # Auth & Role-based access control
│   ├── models/               # Mongoose schemas (User, Draw, Score, Charity)
│   ├── routes/               # API endpoints
│   ├── utils/                # Helper scripts (DB Seeding)
│   └── server.js             # Entry point
│
├── frontend/                 # React + Tailwind SPA
│   ├── public/               # Static assets (Favicon, Logo)
│   ├── src/
│   │   ├── components/       # UI Components (Pricing, Shared)
│   │   ├── context/          # State Management (Auth, Theme)
│   │   ├── pages/            # View Components (Dashboard, Admin)
│   │   ├── services/         # API Service Layer (Axios)
│   │   ├── styles/           # Global & Tailwind CSS
│   │   └── App.js            # Main routing
│   ├── tailwind.config.js    # Design system configuration
│   └── postcss.config.js     # CSS processing
│
└── package.json              # Root script for concurrent development
```

---

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Context API (State), Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Authentication**: JWT (JSON Web Tokens) with cookie/header storage.
- **Branding**: Custom-generated high-res Favicon and logo assets.

---

## 🚀 Installation & Setup

1. **Clone the repo** and run `npm install` in the root.
2. **Install all workspace dependencies**: `npm run install:all`.
3. **Configure .env**:
   - Backend: `PORT=5000`, `MONGO_URI`, `JWT_SECRET`.
   - Frontend: `REACT_APP_API_URL=http://localhost:5000/api`.
4. **Seed the DB**: `npm run seed`.
5. **Start Dev Mode**: `npm run dev`.

---

## 🔑 Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@golfheroes.com` | `Admin1234!` |
| **Player** | `player@golfheroes.com` | `Player1234!` |
| **Free User** | `free@golfheroes.com` | `Free1234!` |

---

## 🚢 Final Deployment Note
The project is **fully complete** and meets all functional and technical requirements of the PRD. Live payment gateways (Stripe) and email triggers have been skipped as per the selection process instructions, replaced with robust internal logic simulations.

*Project ready for final evaluation and deployment.*
