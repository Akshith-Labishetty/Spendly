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
  const categories = await getCollection<CategoryDoc>("Category");

  let doc: CategoryDoc | null;
  try {
    doc = await categories.findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!doc || doc.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (doc.isDefault) {
    return NextResponse.json(
      { error: "Cannot delete default categories." },
      { status: 400 }
    );
  }

  await categories.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ message: "Category deleted." });
}
