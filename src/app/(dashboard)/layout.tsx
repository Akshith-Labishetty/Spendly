"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    const handler = () => setAddDialogOpen(true);
    window.addEventListener("open-add-expense", handler);
    return () => window.removeEventListener("open-add-expense", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {children}
          </div>
        </main>
      </div>
      <MobileNav onAddClick={() => setAddDialogOpen(true)} />
      <AddExpenseDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
