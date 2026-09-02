import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

interface CategoryDoc {
  _id: ObjectId;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
}

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await getCollection<CategoryDoc>("Category");
  const docs = await categories
    .find({ userId: session.user.id })
    .sort({ name: 1 })
    .toArray();

  return NextResponse.json({
    categories: docs.map((d) => ({ ...d, id: d._id.toString() })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, color, icon } = body;

  if (!name || !color || !icon) {
    return NextResponse.json(
      { error: "Name, color, and icon are required." },
      { status: 400 }
    );
  }

  const categories = await getCollection<CategoryDoc>("Category");
  const existing = await categories.findOne({
    userId: session.user.id,
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Category already exists." },
      { status: 409 }
    );
  }

  const result = await categories.insertOne({
    userId: session.user.id,
    name,
    color,
    icon,
    isDefault: false,
    createdAt: new Date(),
  });

  return NextResponse.json(
    { category: { id: result.insertedId.toString(), userId: session.user.id, name, color, icon, isDefault: false, createdAt: new Date() } },
    { status: 201 }
  );
}
