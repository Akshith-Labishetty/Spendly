"use client";

import { useSession } from "next-auth/react";
import { getGreeting } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus, Receipt, CreditCard, Flame } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { MonthComparison, CategoryTotal } from "@/types";

interface DashboardStats {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: CategoryTotal | null;
}

export function SummaryCards() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [comparison, setComparison] = useState<MonthComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/analytics?type=overview");
        const json = await res.json();
        if (json.data) {
          setStats(json.data.stats);
          setComparison(json.data.comparison);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();

    window.addEventListener("focus", fetchStats);
    return () => window.removeEventListener("focus", fetchStats);
  }, []);

  const currency = session?.user?.currency || "INR";

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="skeleton h-[120px] rounded-2xl border-none shadow-none" />
        ))}
      </div>
    );
  }

  const TrendIcon =
    comparison?.direction === "down" ? TrendingDown :
    comparison?.direction === "up" ? TrendingUp : Minus;

  const trendColor =
    comparison?.direction === "down" ? "text-green-500" :
    comparison?.direction === "up" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Spent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spent this Month
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats?.totalSpent || 0, currency)}
          </div>
          {comparison && (
            <p className={`flex items-center text-xs mt-1 font-medium ${trendColor}`}>
              <TrendIcon className="mr-1 h-3 w-3" />
              {comparison.percentChange.toFixed(1)}% compared to {comparison.previousMonth}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Transactions
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.transactionCount || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Purchases this month
          </p>
        </CardContent>
      </Card>

      {/* Average Transaction */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Transaction
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats?.averageTransaction || 0, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per expense this month
          </p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Category
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">
            {stats?.topCategory?.category || "None"}
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {stats?.topCategory ? formatCurrency(stats.topCategory.total, currency) : "No spending yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
