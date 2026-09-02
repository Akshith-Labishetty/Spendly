import { getCollection } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface ExpenseDoc {
  userId: string;
  amount: number;
  category: string;
  date: Date;
}

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

export async function getMonthlyTotals(
  userId: string,
  months = 6
): Promise<MonthlyTotal[]> {
  const results: MonthlyTotal[] = [];
  const now = new Date();
  const expenses = await getCollection<ExpenseDoc>("Expense");

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const agg = await expenses
      .aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();

    results.push({
      month: format(date, "MMM yyyy"),
      total: agg[0]?.total ?? 0,
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
    });
  }

  return results;
}

export async function getCategoryTotals(
  userId: string,
  date: Date = new Date()
): Promise<CategoryTotal[]> {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const expenses = await getCollection<ExpenseDoc>("Expense");

  const agg = await expenses
    .aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ])
    .toArray();

  return agg.map((a) => ({ category: a._id, total: a.total, count: a.count }));
}

export async function getDailyTotals(
  userId: string,
  days = 30
): Promise<DailyTotal[]> {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  const expenses = await getCollection<ExpenseDoc>("Expense");

  const docs = await expenses
    .find({ userId, date: { $gte: start } })
    .sort({ date: 1 })
    .toArray();

  const map = new Map<string, number>();
  for (const e of docs) {
    const key = format(e.date, "MMM d");
    map.set(key, (map.get(key) ?? 0) + e.amount);
  }

  const result: DailyTotal[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = format(d, "MMM d");
    result.push({ date: key, total: map.get(key) ?? 0 });
  }

  return result;
}

export async function getMonthComparison(userId: string): Promise<MonthComparison> {
  const now = new Date();
  const prev = subMonths(now, 1);
  const expenses = await getCollection<ExpenseDoc>("Expense");

  const [currentAgg, previousAgg] = await Promise.all([
    expenses
      .aggregate([
        { $match: { userId, date: { $gte: startOfMonth(now), $lte: endOfMonth(now) } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    expenses
      .aggregate([
        { $match: { userId, date: { $gte: startOfMonth(prev), $lte: endOfMonth(prev) } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
  ]);

  const currentTotal = currentAgg[0]?.total ?? 0;
  const previousTotal = previousAgg[0]?.total ?? 0;

  let percentChange = 0;
  let direction: "up" | "down" | "same" = "same";

  if (previousTotal > 0) {
    percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
    direction = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "same";
  }

  return {
    currentMonth: format(now, "MMMM"),
    previousMonth: format(prev, "MMMM"),
    currentTotal,
    previousTotal,
    percentChange: Math.abs(percentChange),
    direction,
  };
}

export async function getCurrentMonthStats(userId: string) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const expenses = await getCollection<ExpenseDoc>("Expense");

  const [agg, count, categoryTotals] = await Promise.all([
    expenses
      .aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" }, avg: { $avg: "$amount" } } },
      ])
      .toArray(),
    expenses.countDocuments({ userId, date: { $gte: start, $lte: end } }),
    getCategoryTotals(userId, now),
  ]);

  return {
    totalSpent: agg[0]?.total ?? 0,
    transactionCount: count,
    averageTransaction: agg[0]?.avg ?? 0,
    topCategory: categoryTotals[0] ?? null,
  };
}

export async function getSpendingInsights(userId: string): Promise<SpendingInsight[]> {
  const insights: SpendingInsight[] = [];

  const [comparison, stats, categoryTotals, prevCategoryTotals] = await Promise.all([
    getMonthComparison(userId),
    getCurrentMonthStats(userId),
    getCategoryTotals(userId, new Date()),
    getCategoryTotals(userId, subMonths(new Date(), 1)),
  ]);

  if (comparison.direction === "down" && comparison.previousTotal > 0) {
    insights.push({
      type: "positive",
      message: `You spent ${comparison.percentChange.toFixed(1)}% less than ${comparison.previousMonth}. Great job!`,
    });
  } else if (comparison.direction === "up" && comparison.previousTotal > 0) {
    insights.push({
      type: "warning",
      message: `Your spending is up ${comparison.percentChange.toFixed(1)}% compared to ${comparison.previousMonth}.`,
    });
  }

  if (stats.topCategory) {
    insights.push({
      type: "info",
      message: `Your highest spending category is ${stats.topCategory.category} at Rs.${stats.topCategory.total.toLocaleString("en-IN")}.`,
    });
  }

  if (categoryTotals.length > 0 && prevCategoryTotals.length > 0) {
    for (const curr of categoryTotals.slice(0, 3)) {
      const prev = prevCategoryTotals.find((p) => p.category === curr.category);
      if (prev && prev.total > 0) {
        const pct = ((curr.total - prev.total) / prev.total) * 100;
        if (pct > 20) {
          insights.push({
            type: "warning",
            message: `You spent ${pct.toFixed(0)}% more on ${curr.category} this month.`,
          });
        }
      }
    }
  }

  if (stats.transactionCount > 0) {
    insights.push({
      type: "info",
      message: `You have made ${stats.transactionCount} transactions this month.`,
    });
  }

  if (stats.averageTransaction > 0) {
    insights.push({
      type: "info",
      message: `Your average transaction this month is Rs.${stats.averageTransaction.toFixed(0)}.`,
    });
  }

  return insights;
}
