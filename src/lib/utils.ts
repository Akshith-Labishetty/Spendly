import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees (or any currency).
 */
export function formatCurrency(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/**
 * Get initials from a name.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get the greeting based on time of day.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Truncate a string to a max length.
 */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

/**
 * Get a color hex for a given category name.
 */
const CATEGORY_COLORS: Record<string, string> = {
  Food: "#F59E0B",
  "Q-Commerce": "#14B8A6",
  Shopping: "#8B5CF6",
  "E-Commerce": "#6366F1",
  Transport: "#3B82F6",
  Bills: "#EF4444",
  Entertainment: "#EC4899",
  Health: "#10B981",
  Travel: "#06B6D4",
  Education: "#F97316",
  Other: "#6B7280",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#6B7280";
}
