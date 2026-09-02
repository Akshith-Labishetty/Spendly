# Spendly — Personal Expense Tracker

A full-stack personal finance application built with Next.js and MongoDB.

## Features

- **Dashboard** — Spending overview with charts, summary cards, and recent transactions
- **Transactions** — Add, search, and delete expenses with category tagging
- **CSV Import** — Drag-and-drop bank statement upload with auto-categorization
- **Analytics** — Monthly trends, category breakdowns, spending insights
- **Categories** — 10 built-in categories with smart keyword-based auto-assignment
- **Auth** — Secure login/register with JWT sessions and bcrypt password hashing
- **Responsive** — Works on desktop and mobile with bottom navigation bar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui (Radix primitives) |
| Database | MongoDB (native driver) |
| Auth | NextAuth.js v5 (Credentials provider) |
| Charts | Recharts |
| Validation | Zod + React Hook Form |
| CSV Parsing | PapaParse |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL="mongodb://localhost:27017/spendly"
AUTH_SECRET="your-super-secret-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

For MongoDB Atlas, replace `DATABASE_URL` with your connection string:
```
mongodb+srv://<user>:<password>@cluster.mongodb.net/spendly?retryWrites=true&w=majority
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Create an account

Register at `/register` and start adding expenses.

## Project Structure

```
spendly/
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & Register pages
│   │   ├── (dashboard)/       # Main app pages
│   │   │   ├── dashboard/     # Overview with charts
│   │   │   ├── transactions/  # Expense list + add/delete
│   │   │   ├── analytics/     # Charts and insights
│   │   │   ├── import/        # CSV upload
│   │   │   └── settings/      # Profile & password
│   │   └── api/               # Backend API routes
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities, auth, DB, analytics
│   └── types/                 # TypeScript types
├── Docs/                      # Documentation
└── testdata.csv               # Sample CSV for testing import
```

## Documentation

- [Architecture](Docs/ARCHITECTURE.md) — System design and data flow
- [API Reference](Docs/API.md) — All backend endpoints
- [CSV Import Guide](Docs/IMPORT.md) — How CSV parsing and categorization works
- [Categories](Docs/CATEGORIES.md) — Category system and customization

## License

MIT
