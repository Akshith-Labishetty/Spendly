"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency, getCategoryColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { MonthlyTotal, CategoryTotal, SpendingInsight } from "@/types";
import { Info, AlertTriangle, TrendingDown, CheckCircle2 } from "lucide-react";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [monthly, setMonthly] = useState<MonthlyTotal[]>([]);
  const [categories, setCategories] = useState<CategoryTotal[]>([]);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const currency = session?.user?.currency || "INR";

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [monthlyRes, catRes, insightsRes] = await Promise.all([
          fetch("/api/analytics?type=monthly"),
          fetch("/api/analytics?type=categories"),
          fetch("/api/analytics?type=insights"),
        ]);
        
        const [monthlyData, catData, insightsData] = await Promise.all([
          monthlyRes.json(),
          catRes.json(),
          insightsRes.json(),
        ]);

        if (monthlyData.data) setMonthly(monthlyData.data.reverse()); // Chronological
        if (catData.data) setCategories(catData.data);
        if (insightsData.data) setInsights(insightsData.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into your spending patterns.
        </p>
      </div>

      {/* Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="skeleton h-[100px] rounded-2xl border-none shadow-none" />
          ))
        ) : insights.length === 0 ? (
          <div className="col-span-3 text-center p-6 text-muted-foreground border border-dashed rounded-2xl">
            Not enough data to generate insights.
          </div>
        ) : (
          insights.map((insight, i) => {
            const Icon = 
              insight.type === "positive" ? CheckCircle2 :
              insight.type === "warning" ? AlertTriangle : Info;
              
            const colorClass = 
              insight.type === "positive" ? "text-green-500 bg-green-500/10" :
              insight.type === "warning" ? "text-orange-500 bg-orange-500/10" : 
              "text-blue-500 bg-blue-500/10";

            return (
              <Card key={i} className="flex flex-row items-center p-4 gap-4">
                <div className={`p-3 rounded-full ${colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 text-sm font-medium leading-tight">
                  {insight.message}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Spending Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
            <CardDescription>Your total expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] skeleton rounded-xl opacity-20" />
            ) : monthly.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-xl">
                No data available
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="text-[0.70rem] uppercase text-muted-foreground mb-1">
                                {label}
                              </div>
                              <div className="font-bold">
                                {formatCurrency(payload[0].value as number, currency)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Where your money went this month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] skeleton rounded-xl opacity-20" />
            ) : categories.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-xl">
                No data available
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(data.category) }} />
                              <div>
                                <div className="text-[0.70rem] uppercase text-muted-foreground mb-1">
                                  {data.category}
                                </div>
                                <div className="font-bold">
                                  {formatCurrency(data.total, currency)}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {/* Custom Legend */}
            {!loading && categories.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {categories.slice(0, 6).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(cat.category) }} />
                      <span className="truncate max-w-[80px]">{cat.category}</span>
                    </div>
                    <span className="font-medium text-muted-foreground">
                      {formatCurrency(cat.total, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
