import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/Mongo/Connectdb";
import Task from "../../../../modals/Task/Task";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


// POST: Create a new task
export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, category, emojiIcon } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const task = new Task({
      tenantId: session.user.tenantId,
      createdBy: session.user.id,
      title,
      description,
      category: Array.isArray(category) ? category : [category],
      emojiIcon: emojiIcon || "😊",
    });

    await task.save();
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task", details: error.message }, { status: 500 });
  }
}
