"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, PlusCircle, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "List", href: "/transactions", icon: Receipt },
  { name: "Add", href: "#", icon: PlusCircle, isAdd: true },
  { name: "Stats", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav({ onAddClick }: { onAddClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe lg:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href && !item.isAdd;

          if (item.isAdd) {
            return (
              <button
                key="add"
                onClick={onAddClick}
                className="group flex flex-col items-center justify-center gap-1 p-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform active:scale-95">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium text-primary">Add</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl p-2 min-w-[64px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
