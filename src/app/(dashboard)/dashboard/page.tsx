"use client";

import { useSession } from "next-auth/react";
import { getGreeting } from "@/lib/utils";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingOverviewChart } from "@/components/dashboard/SpendingOverviewChart";
import { Suspense } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is your spending overview for this month.
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <SummaryCards />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Spending Overview</h3>
          <p className="text-sm text-muted-foreground mb-4">Your daily expenses over the last 30 days.</p>
          <Suspense fallback={<div className="h-[300px] skeleton rounded-xl" />}>
            <SpendingOverviewChart />
          </Suspense>
        </div>
        <div className="col-span-3 rounded-2xl border bg-card p-6 shadow-sm">
           <h3 className="text-lg font-semibold mb-6">Recent Transactions</h3>
           <Suspense fallback={<div className="h-[300px] skeleton rounded-xl" />}>
            <RecentTransactions />
           </Suspense>
        </div>
      </div>
    </div>
  );
}
