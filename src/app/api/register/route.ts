import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCollection } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { DEFAULT_CATEGORIES } from "@/lib/categorization";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const users = await getCollection<UserDoc>("User");
    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    const result = await users.insertOne({
      name,
      email,
      passwordHash,
      currency: "INR",
      createdAt: now,
      updatedAt: now,
    });

    const userId = result.insertedId.toString();

    const categories = await getCollection("Category");
    await categories.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({
        userId,
        name: c.name,
        color: c.color,
        icon: c.icon,
        isDefault: true,
        createdAt: now,
      }))
    );

    return NextResponse.json(
      { message: "Account created successfully.", userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
