# Architecture

## Overview

Spendly is a monolithic Next.js application using the App Router. The frontend and backend live in the same codebase, with API routes handling all data operations.

```
Browser → Next.js App Router → API Routes → MongoDB
                ↓
         React Components → fetch() → API Routes
```

## Tech Decisions

**Why native MongoDB driver over Prisma?**
Prisma requires MongoDB to run as a replica set for all write operations. The native driver works with standalone MongoDB out of the box, making local development simpler.

**Why NextAuth Credentials provider?**
JWT-based auth avoids server-side session storage. The JWT callback attaches the user ID to the token, which is used in API routes for authorization.

**Why server-side analytics?**
All aggregation (monthly totals, category breakdowns, comparisons) runs in MongoDB using `$group` and `$match` pipelines. This keeps the client lightweight and leverages MongoDB's aggregation framework.

## Data Flow

### Authentication
```
1. User submits email/password → POST /api/auth/credentials/callback
2. NextAuth calls authorize() → queries MongoDB for user
3. bcrypt.compare() validates password
4. JWT issued with user ID and currency preference
5. Middleware checks JWT on protected routes
```

### Adding an Expense
```
1. User fills form in AddExpenseDialog
2. POST /api/expenses with {amount, description, category, date, notes}
3. Zod validates input
4. MongoDB insertOne() to Expense collection
5. Response returns created expense
6. Transaction list refreshes
```

### CSV Import
```
1. User drags/drops CSV file
2. POST /api/import/upload (multipart form)
3. PapaParse extracts rows with header detection
4. categorizeTransaction() auto-assigns categories
5. Duplicate detection against existing expenses
6. Preview shown to user with checkboxes
7. User confirms → POST /api/import/confirm
8. Bulk insertMany() to Expense collection
```

## Database Collections

| Collection | Purpose |
|-----------|---------|
| User | Account info, email, password hash, currency |
| Expense | All transactions (manual + imported) |
| Category | User's categories (10 defaults + custom) |
| BankStatement | Import metadata (file name, count) |

All collections use MongoDB ObjectId as `_id`. User IDs are stored as strings in related collections (no foreign key enforcement at DB level).

## File Structure

```
src/
├── lib/
│   ├── db.ts              # MongoDB connection singleton
│   ├── auth.ts            # NextAuth config + Credentials provider
│   ├── analytics.ts       # Server-side aggregation functions
│   ├── categorization.ts  # Keyword rules + default categories
│   ├── validations.ts     # Zod schemas for all forms
│   ├── utils.ts           # cn(), formatCurrency(), getCategoryColor()
│   └── import/
│       └── csvParser.ts   # PapaParse wrapper + column detection
├── components/
│   ├── ui/                # shadcn/ui primitives (button, input, card, dialog)
│   ├── layout/            # Sidebar, MobileNav
│   ├── dashboard/         # SummaryCards, RecentTransactions, SpendingOverviewChart
│   └── AddExpenseDialog.tsx
└── app/
    ├── (auth)/            # Login/Register pages
    ├── (dashboard)/       # All main pages with shared layout
    └── api/               # REST API endpoints
```
