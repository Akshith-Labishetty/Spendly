import Link from "next/link";
import { Wallet, PieChart, UploadCloud, TrendingDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl text-primary">
            <Wallet className="h-7 w-7" />
            Spendly
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
          The simple way to track your money
        </div>
        
        <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight text-balance mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Understand where your <span className="text-primary">money goes.</span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 text-balance animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          A beautifully simple personal expense tracker designed to help you regain control of your finances without the clutter.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link href="/register">
            <Button size="xl" className="rounded-full font-semibold">
              Start tracking for free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="xl" variant="outline" className="rounded-full font-semibold">
              View live demo
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="p-6 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Beautiful Dashboard</h3>
            <p className="text-muted-foreground">Get a clear, visual overview of your monthly spending habits at a glance.</p>
          </div>

          <div className="p-6 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Bank CSV Import</h3>
            <p className="text-muted-foreground">Skip manual entry. Upload your bank statement and we'll auto-categorize it.</p>
          </div>

          <div className="p-6 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
            <p className="text-muted-foreground">Compare spending across months and see exactly which categories drain your wallet.</p>
          </div>
        </div>
      </main>

      <footer className="border-t py-10 px-6 text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-2 font-semibold text-foreground mb-4">
          <Wallet className="h-5 w-5 text-primary" />
          Spendly
        </div>
        <p className="text-sm">Built as a production-quality portfolio project.</p>
      </footer>
    </div>
  );
}
