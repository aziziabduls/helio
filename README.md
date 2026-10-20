# Helio Events (Full-Stack Platform)

> A state-of-the-art event hosting and discovery platform. Built with Next.js 14 (App Router), Express.js, TypeScript, PostgreSQL, and Prisma ORM.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Prerequisites & Environment](#-prerequisites--environment)
- [Quick Start Guide](#-quick-start-guide)
- [API Reference](#-api-reference)
- [Database & DBeaver Setup](#-database--dbeaver-setup)
- [License](#-license)

---

## 🌟 Overview

**Helio Events** (`helio ✦ events`) brings the polished, fluid aesthetic of modern event management to life with:
- **Portrait (3:4) Event Covers** with ambient page-level color tinting.
- **Frosted Glass Blur Navbars & Toolbars** using dynamic CSS `color-mix` and `backdrop-blur`.
- **Chronological Timeline Layout** with sticky date badges and glowing spine nodes.
- **Custom Community Calendars** with dedicated owner management, banner customization, and timeline feeds.
- **Live Event Creation Canvas** with real-time typography and tint color previews.
- **Interactive RSVPs & Ticketing** supporting free/paid tiers, approval workflows, and digital passes.

---

## 🚀 System Architecture

```mermaid
graph TD
    Client["Browser / Next.js 14 Client (Port 3350)"] -->|"REST API / Bearer JWT"| Server["Express.js + TypeScript (Port 4450)"]
    Server -->|"Prisma ORM"| DB[("PostgreSQL: luma_db (Port 5432)")]
    Client -->|"Frosted Glass & Timelines"| UI["shadcn/ui + Tailwind CSS + Plus Jakarta Sans"]
```

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Sonner |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, JSON Web Tokens (JWT), bcryptjs |
| **Database** | PostgreSQL (`luma_db` on port 5432) |
| **Styling & Fonts** | Plus Jakarta Sans (default), Playfair Display (serif), JetBrains Mono (mono), Space Grotesk |
| **Ports** | Frontend: `http://localhost:3350` · Backend API: `http://localhost:4450` |

---

## ✨ Key Features

### 1. Events Discovery & Timeline (`/` & `/discover`)
- **Homepage Timeline:**
  - Grouped by date with sticky date badges (`badge`), weekday labels, and glowing blue nodes along a vertical spine.
  - Category filtering (`All`, `AI`, `Tech`, `Arts & Culture`, `Food & Drink`, `Running`, `Fitness`).
  - Real-time event search and city filters (`Jakarta`, `San Francisco`, `Singapore`, etc.).
  - Segmented Switcher for **Upcoming** and **Past** events.
- **Curated Discover Hub (`/discover`):**
  - 12 categories with event statistics.
  - Featured community calendars (Google DeepMind, Build Club, Reading Rhythms, South Park Commons, Design Buddies, SpaceXAI, Creative Coffee Club).
  - Global city directory grouped by continent (North America, Europe, Asia & Pacific, South America, Africa).

### 2. Community Calendars (`/calendar/[slug]`)
- Banner cover and avatar with instant upload for calendar owners.
- Subscriber tracking and one-click **Subscribe / Follow** toggle.
- **Owner Edit Modal:** Update calendar title, slug, bio, avatar, banner, and theme tint.
- **Chronological Events Timeline:** Matches the homepage timeline with segmented Upcoming/Past tabs and an empty-state host CTA.

### 3. Live Event Creation (`/create`)
- **Sticky Top Toolbar (`sticky top-11 z-40`):** Back button, theme picker, font selector, and Create/Save button remain locked at the top with frosted glass blur as you scroll.
- **Dynamic Surface Tint & Palette:** Choose from curated preset tints or pick any custom hex; the entire page background, cards, borders, and navbar dynamically sync.
- **Hashtag Category Selector:** Multi-select categories automatically formatted with `#` prefix (e.g., `#Tech`, `#AI`, `#Startup`).
- **Owner-Filtered Calendar Picker:** Only shows calendars created/owned by the logged-in user.
- **Multi-Tier Tickets & Merch:** Free, paid, and approval-gated ticket tiers + event merchandise and add-ons.

### 4. Event Detail & RSVP (`/[slug]`)
- **Ambient Canvas:** The entire page background and navbar tint adapt to the event's theme color.
- **Frosted Glass Navbar:** Uses `color-mix(in srgb, var(--event-page-bg) 80%, transparent)` with `backdrop-blur-md` so blurred content slides underneath seamlessly.
- **RSVP & Registration:** Instant registration with QR code pass, approval badges, and attendee counting.

### 5. Authentication (`AuthModal` & `/login`)
- Token-based JWT authentication (`helio_auth_token`).
- Modal-based or standalone page login/signup with instant session sync across tabs.

---

## 📁 Project Structure

```text
helio/
├── .gitignore                   # Monorepo gitignore
├── README.md                    # Platform documentation
├── package.json                 # Monorepo root scripts
│
├── frontend/                    # Next.js 14 App Router frontend
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # Homepage with event timeline
│       │   ├── [slug]/          # Event detail & RSVP page
│       │   ├── calendar/[slug]/ # Community calendar detail page
│       │   ├── create/          # Event creation live canvas
│       │   ├── discover/        # Category and calendar discovery
│       │   └── login/           # Standalone auth page
│       ├── components/
│       │   ├── Navbar.tsx       # Sticky blurred navbar
│       │   ├── Footer.tsx       # Brand footer
│       │   ├── TimelineSection.tsx # Sticky date spine & event cards
│       │   ├── EventCard.tsx    # Responsive event card
│       │   ├── AuthModal.tsx    # Sign in / Sign up dialog
│       │   └── ui/              # shadcn/ui components (badge, dialog, etc.)
│       ├── context/             # AuthContext & state providers
│       └── lib/
│           ├── api.ts           # Type-safe API client
│           └── utils.ts         # Formatting & styling helpers
│
└── backend/                     # Express.js + Prisma backend
    ├── .gitignore
    ├── .env.example
    ├── package.json
    ├── tsconfig.json
    ├── prisma/
    │   ├── schema.prisma        # PostgreSQL Prisma schema
    │   └── seed.ts              # Database seed script
    └── src/
        ├── index.ts             # Express server entry point
        ├── controllers/         # Event, calendar, auth, and ticket controllers
        ├── routes/              # REST API route handlers
        ├── services/            # Business logic and database operations
        └── middlewares/         # JWT auth and error handling
```

---

## 💻 Prerequisites & Environment

- **Node.js:** `>= 18.x` (v20+ recommended)
- **Package Manager:** `npm` (or `pnpm` / `yarn`)
- **Database:** PostgreSQL `>= 14` (running locally on port `5432`)

---

## 🛠 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/aziziabduls/helio.git
cd helio

# Install root, backend, and frontend dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Configure Backend Environment

Create `backend/.env`:
```env
PORT=4450
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/luma_db?schema=public"
JWT_SECRET="helio_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3350"
```

### 3. Setup Database & Seed Initial Data

```bash
cd backend

# Push schema to PostgreSQL database
npx prisma db push

# Seed community calendars, categories, and events
npm run prisma:seed

cd ..
```

### 4. Start Development Servers

You can start both services from the root or in separate terminal windows:

```bash
# Terminal 1: Backend (Port 4450)
npm run dev:backend

# Terminal 2: Frontend (Port 3350)
npm run dev:frontend
```

Open [http://localhost:3350](http://localhost:3350) in your browser.

---

## 🔌 API Reference

### Health & System
- `GET /api/health` — Service health status check.

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register a new user account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Get current authenticated user profile (`Bearer <token>`).
- `PATCH /api/auth/profile` — Update user bio, avatar, and social links.

### Events (`/api/events`)
- `GET /api/events` — Query events with filters (`timeframe`, `category`, `city`, `search`).
- `GET /api/events/:slug` — Get full event details, ticket tiers, and hosts.
- `POST /api/events` — Create a new event (`Authorization: Bearer <token>`).
- `PUT /api/events/:slug` — Update an existing event.
- `POST /api/events/:id/register` — RSVP / register for an event tier.

### Calendars (`/api/calendars`)
- `GET /api/calendars` — List featured community calendars.
- `GET /api/calendars/:slug` — Get calendar details, subscribers, and hosted events.
- `POST /api/calendars` — Create a new community calendar.
- `PATCH /api/calendars/:slug` — Update calendar branding and profile (owner only).
- `POST /api/calendars/:id/follow` — Toggle follow/subscribe state.

### Categories & Metadata
- `GET /api/categories` — List all categories with active event counts.
- `GET /api/cities` — List popular event cities worldwide.

---

## 🗄 Database & DBeaver Setup

To inspect and manage the PostgreSQL database using **DBeaver** or any standard SQL client:

1. Open **DBeaver** and click **New Database Connection** -> **PostgreSQL**.
2. Fill in the connection settings:
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Database:** `luma_db`
   - **Username:** `postgres` (or your local Postgres user)
   - **Password:** `postgres` (or your local Postgres password)
3. Click **Test Connection** to verify, then **Finish**.
4. You will see the following Prisma tables:
   - `User` — Host and attendee accounts.
   - `Calendar` — Community calendars and owner associations.
   - `Event` — Events with start/end times, location, coordinates, cover image, and `#` categories array.
   - `Ticket` — Ticket tiers (Free, Paid, Approval Required).
   - `Registration` — RSVP records, QR passes, and attendee statuses.
   - `Category` — Official event categories.
   - `Merchandise` — Add-on event goods.

---

## 📄 License

This project is created for educational and development purposes.
