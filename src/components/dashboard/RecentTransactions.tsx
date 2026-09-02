"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency, getCategoryColor } from "@/lib/utils";
import { format } from "date-fns";
import { UtensilsCrossed, ShoppingBag, ShoppingCart, Car, FileText, Tv, Heart, Plane, BookOpen, MoreHorizontal, ArrowUpRight, Receipt, Zap } from "lucide-react";
import Link from "next/link";
import { Expense } from "@/types";

const ICON_MAP: Record<string, any> = {
  Food: UtensilsCrossed,
  "Q-Commerce": Zap,
  Shopping: ShoppingBag,
  "E-Commerce": ShoppingCart,
  Transport: Car,
  Bills: FileText,
  Entertainment: Tv,
  Health: Heart,
  Travel: Plane,
  Education: BookOpen,
  Other: MoreHorizontal,
};

export function RecentTransactions() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const currency = session?.user?.currency || "INR";

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/expenses?limit=5");
        const json = await res.json();
        if (json.expenses) {
          setTransactions(json.expenses);
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full skeleton" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 skeleton rounded" />
              <div className="h-3 w-1/4 skeleton rounded" />
            </div>
            <div className="h-4 w-16 skeleton rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Receipt className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <p className="text-sm font-medium">No recent transactions</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add an expense to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-5 flex-1">
        {transactions.map((tx) => {
          const Icon = ICON_MAP[tx.category] || MoreHorizontal;
          const color = getCategoryColor(tx.category);

          return (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none mb-1">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category} • {format(new Date(tx.date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="font-semibold">
                -{formatCurrency(tx.amount, currency)}
              </div>
            </div>
          );
        })}
      </div>
      <Link 
        href="/transactions" 
        className="flex items-center justify-center gap-1 mt-6 text-sm font-medium text-primary hover:underline"
      >
        View all transactions
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

