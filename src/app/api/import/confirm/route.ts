import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { z } from "zod";

const confirmSchema = z.object({
  fileName: z.string(),
  transactions: z.array(
    z.object({
      date: z.string(),
      description: z.string(),
      amount: z.number().positive(),
      category: z.string(),
      selected: z.boolean(),
    })
  ),
});

interface StatementDoc {
  userId: string;
  fileName: string;
  fileType: string;
  importedAt: Date;
  transactionCount: number;
}

interface ExpenseDoc {
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  source: string;
  statementId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = confirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
    }

    const { fileName, transactions } = parsed.data;
    const selectedTxs = transactions.filter((t) => t.selected);

    if (selectedTxs.length === 0) {
      return NextResponse.json({ error: "No transactions selected." }, { status: 400 });
    }

    const userId = session.user.id;
    const now = new Date();

    const statements = await getCollection<StatementDoc>("BankStatement");
    const statementResult = await statements.insertOne({
      userId,
      fileName,
      fileType: "csv",
      importedAt: now,
      transactionCount: selectedTxs.length,
    });

    const statementId = statementResult.insertedId.toString();

    const expenses = await getCollection<ExpenseDoc>("Expense");
    await expenses.insertMany(
      selectedTxs.map((tx) => ({
        userId,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        date: new Date(tx.date),
        source: "import",
        statementId,
        createdAt: now,
        updatedAt: now,
      }))
    );

    return NextResponse.json({
      message: `Successfully imported ${selectedTxs.length} transactions.`,
      statementId,
      count: selectedTxs.length,
    });
  } catch (error) {
    console.error("[POST /api/import/confirm]", error);
    return NextResponse.json(
      { error: "Failed to import transactions. Please try again." },
      { status: 500 }
    );
  }
}
