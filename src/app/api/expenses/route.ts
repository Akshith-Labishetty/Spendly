import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { expenseSchema } from "@/lib/validations";
import type { ExpenseFilters } from "@/types";
import { ObjectId } from "mongodb";

interface ExpenseDoc {
  _id: ObjectId;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  notes: string | null;
  source: string;
  statementId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);

  const filters: ExpenseFilters = {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    sortBy: (searchParams.get("sortBy") as "date" | "amount") ?? "date",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
    page: parseInt(searchParams.get("page") ?? "1"),
    limit: parseInt(searchParams.get("limit") ?? "20"),
  };

  const where: Record<string, unknown> = { userId };

  if (filters.search) {
    where.description = { $regex: filters.search, $options: "i" };
  }
  if (filters.category && filters.category !== "all") {
    where.category = filters.category;
  }
  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate && { $gte: new Date(filters.startDate) }),
      ...(filters.endDate && { $lte: new Date(filters.endDate + "T23:59:59") }),
    };
  }

  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const skip = (page - 1) * limit;
  const sortField = filters.sortBy ?? "date";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  const expenses = await getCollection<ExpenseDoc>("Expense");
  const [docs, total] = await Promise.all([
    expenses.find(where).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).toArray(),
    expenses.countDocuments(where),
  ]);

  return NextResponse.json({
    expenses: docs.map((d) => ({ ...d, id: d._id.toString() })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = expenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { amount, description, category, date, notes } = parsed.data;
    const now = new Date();

    const expenses = await getCollection<ExpenseDoc>("Expense");
    const result = await expenses.insertOne({
      userId: session.user.id,
      amount,
      description,
      category,
      date: new Date(date),
      notes: notes || null,
      source: "manual",
      statementId: null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { expense: { id: result.insertedId.toString(), userId: session.user.id, amount, description, category, date: new Date(date), notes: notes || null, source: "manual", createdAt: now, updatedAt: now } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/expenses]", error);
    return NextResponse.json(
      { error: "Failed to create expense." },
      { status: 500 }
    );
  }
}
