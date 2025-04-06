import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/Mongo/Connectdb";
import Task from "../../../../modals/Task/Task";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


// PUT: Update a task
export async function PUT(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, description, category, emojiIcon } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const task = await Task.findOne({ _id: id, tenantId: session.user.tenantId });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Only creator or admin can update
    if (session.user.role !== "admin" && task.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category ? (Array.isArray(category) ? category : [category]) : task.category;
    task.emojiIcon = emojiIcon || task.emojiIcon;

    await task.save();
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task", details: error.message }, { status: 500 });
  }
}

