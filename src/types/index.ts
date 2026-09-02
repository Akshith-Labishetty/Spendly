// Extended Session type to include user ID
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string | null;
  source: string;
  statementId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

export interface BankStatement {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  importedAt: string;
  transactionCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface ExpenseFilters {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface MonthlyTotal {
  month: string;
  total: number;
  year: number;
  monthIndex: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
  color?: string;
}

export interface DailyTotal {
  date: string;
  total: number;
}

export interface MonthComparison {
  currentMonth: string;
  previousMonth: string;
  currentTotal: number;
  previousTotal: number;
  percentChange: number;
  direction: "up" | "down" | "same";
}

export interface SpendingInsight {
  type: "info" | "warning" | "positive";
  message: string;
}

// ─── Import ──────────────────────────────────────────────────────────────────

export interface ImportTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  selected: boolean;
  isDuplicate?: boolean;
}
