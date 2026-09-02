import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getMonthlyTotals,
  getCategoryTotals,
  getDailyTotals,
  getMonthComparison,
  getCurrentMonthStats,
  getSpendingInsights,
} from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "overview";

  try {
    switch (type) {
      case "monthly":
        return NextResponse.json({
          data: await getMonthlyTotals(userId, 6),
        });

      case "categories": {
        const monthParam = searchParams.get("month");
        const date = monthParam ? new Date(monthParam) : new Date();
        return NextResponse.json({
          data: await getCategoryTotals(userId, date),
        });
      }

      case "daily": {
        const days = parseInt(searchParams.get("days") ?? "30");
        return NextResponse.json({
          data: await getDailyTotals(userId, Math.min(days, 90)),
        });
      }

      case "comparison":
        return NextResponse.json({
          data: await getMonthComparison(userId),
        });

      case "insights":
        return NextResponse.json({
          data: await getSpendingInsights(userId),
        });

      case "overview":
      default: {
        const [stats, comparison, categories, daily] = await Promise.all([
          getCurrentMonthStats(userId),
          getMonthComparison(userId),
          getCategoryTotals(userId),
          getDailyTotals(userId, 30),
        ]);
        return NextResponse.json({ data: { stats, comparison, categories, daily } });
      }
    }
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json(
      { error: "Failed to load analytics." },
      { status: 500 }
    );
  }
}
