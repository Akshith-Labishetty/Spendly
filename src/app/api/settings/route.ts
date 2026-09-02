import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import bcrypt from "bcryptjs";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations";
import { ObjectId } from "mongodb";

interface UserDoc {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseDoc { _id: ObjectId; userId: string }
interface CategoryDoc { _id: ObjectId; userId: string }
interface StatementDoc { _id: ObjectId; userId: string }

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getCollection<UserDoc>("User");
  let user: UserDoc | null;
  try {
    user = await users.findOne({ _id: new ObjectId(session.user.id) });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: { id: user._id.toString(), name: user.name, email: user.email, currency: user.currency, createdAt: user.createdAt },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type } = body;

  if (type === "profile") {
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const users = await getCollection<UserDoc>("User");
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name) update.name = parsed.data.name;
    if (parsed.data.currency) update.currency = parsed.data.currency;

    await users.updateOne({ _id: new ObjectId(session.user.id) }, { $set: update });
    const updated = await users.findOne({ _id: new ObjectId(session.user.id) });

    return NextResponse.json({
      user: { id: updated!._id.toString(), name: updated!.name, email: updated!.email, currency: updated!.currency },
    });
  }

  if (type === "password") {
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const users = await getCollection<UserDoc>("User");
    const user = await users.findOne({ _id: new ObjectId(session.user.id) });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { passwordHash: newHash, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Password updated successfully." });
  }

  return NextResponse.json({ error: "Invalid request type." }, { status: 400 });
}

export async function DELETE(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const [expenses, categories, statements, users] = await Promise.all([
    getCollection<ExpenseDoc>("Expense"),
    getCollection<CategoryDoc>("Category"),
    getCollection<StatementDoc>("BankStatement"),
    getCollection<UserDoc>("User"),
  ]);

  await Promise.all([
    expenses.deleteMany({ userId }),
    categories.deleteMany({ userId }),
    statements.deleteMany({ userId }),
  ]);
  await users.deleteOne({ _id: new ObjectId(userId) });

  return NextResponse.json({ message: "Account deleted." });
}
