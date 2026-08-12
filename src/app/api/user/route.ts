import { db } from "@/db";
import { usersTable } from "@/db/schema/user.schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all users
export async function GET() {
  try {
    const users = await db.select().from(usersTable);

    return NextResponse.json(
      {
        users,
        message: "Users fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch users:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// CREATE user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, age, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        {
          message: "Name and email are required",
        },
        { status: 400 }
      );
    }

    const user: typeof usersTable.$inferInsert = {
      name,
      age,
      email,
    };

    const [createdUser] = await db
      .insert(usersTable)
      .values(user)
      .returning();

    return NextResponse.json(
      {
        user: createdUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create user:", error);

    return NextResponse.json(
      {
        message: "Failed to create user",
      },
      { status: 500 }
    );
  }
}

// UPDATE user
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, name, age } = body;

    if (!email) {
      return NextResponse.json(
        {
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        name,
        age,
      })
      .where(eq(usersTable.email, email))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: updatedUser,
        message: "User updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update user:", error);

    return NextResponse.json(
      {
        message: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    const [deletedUser] = await db
      .delete(usersTable)
      .where(eq(usersTable.email, email))
      .returning();

    if (!deletedUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: deletedUser,
        message: "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete user:", error);

    return NextResponse.json(
      {
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}