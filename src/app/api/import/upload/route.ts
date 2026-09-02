import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { parseCSV, enrichWithCategories } from "@/lib/import/csvParser";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ExpenseDoc {
  userId: string;
  date: Date;
  amount: number;
  description: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      return NextResponse.json({ error: "Only CSV files are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be under 5MB." }, { status: 400 });
    }

    const text = await file.text();
    const { rows, errors, detectedColumns } = parseCSV(text);

    if (errors.length > 0 && rows.length === 0) {
      return NextResponse.json({ error: errors[0] }, { status: 422 });
    }

    const enriched = enrichWithCategories(rows);

    const userId = session.user.id;
    const expenses = await getCollection<ExpenseDoc>("Expense");
    const existingExpenses = await expenses
      .find({ userId })
      .project({ date: 1, amount: 1, description: 1 })
      .toArray();

    const withDuplicates = enriched.map((tx) => {
      const txDate = new Date(tx.date);
      const isDuplicate = existingExpenses.some((e) => {
        const dateDiff = Math.abs(e.date.getTime() - txDate.getTime());
        const withinOneDay = dateDiff < 86400000;
        const sameAmount = Math.abs(e.amount - tx.amount) < 0.01;
        const descMatch =
          e.description.toLowerCase().includes(tx.description.slice(0, 8).toLowerCase()) ||
          tx.description.toLowerCase().includes(e.description.slice(0, 8).toLowerCase());
        return withinOneDay && sameAmount && descMatch;
      });

      return { ...tx, isDuplicate };
    });

    return NextResponse.json({
      transactions: withDuplicates,
      detectedColumns,
      errors,
      count: withDuplicates.length,
    });
  } catch (error) {
    console.error("[POST /api/import/upload]", error);
    return NextResponse.json(
      { error: "We couldn't understand this file. Please upload a CSV with date, description, and amount columns." },
      { status: 500 }
    );
  }
}
