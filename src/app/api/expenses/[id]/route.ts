import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { updateExpenseSchema } from "@/lib/validations";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const expenses = await getCollection<ExpenseDoc>("Expense");
  let doc: ExpenseDoc | null;
  try {
    doc = await expenses.findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!doc || doc.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ expense: { ...doc, id: doc._id.toString() } });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const expenses = await getCollection<ExpenseDoc>("Expense");

  let existing: ExpenseDoc | null;
  try {
    existing = await expenses.findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { amount, description, category, date, notes } = parsed.data;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (amount !== undefined) update.amount = amount;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (date !== undefined) update.date = new Date(date);
    if (notes !== undefined) update.notes = notes || null;

    await expenses.updateOne({ _id: new ObjectId(id) }, { $set: update });

    const updated = await expenses.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ expense: { ...updated!, id: updated!._id.toString() } });
  } catch (error) {
    console.error("[PUT /api/expenses/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update expense." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const expenses = await getCollection<ExpenseDoc>("Expense");

  let existing: ExpenseDoc | null;
  try {
    existing = await expenses.findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await expenses.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ message: "Deleted successfully." });
}
