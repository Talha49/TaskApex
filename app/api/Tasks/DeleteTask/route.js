import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/Mongo/Connectdb";
import Task from "../../../../modals/Task/Task";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE: Delete one or more tasks
export async function DELETE(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskIds } = await req.json();

    if (!taskIds || (Array.isArray(taskIds) && taskIds.length === 0)) {
      return NextResponse.json({ error: "No task IDs provided" }, { status: 400 });
    }

    const ids = Array.isArray(taskIds) ? taskIds : [taskIds];
    const tasks = await Task.find({ _id: { $in: ids }, tenantId: session.user.tenantId });

    if (tasks.length === 0) {
      return NextResponse.json({ error: "No tasks found" }, { status: 404 });
    }

    // Only admin can delete
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete tasks" }, { status: 403 });
    }

    const result = await Task.deleteMany({ _id: { $in: ids }, tenantId: session.user.tenantId });
    return NextResponse.json({ message: `${result.deletedCount} task(s) deleted` });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete tasks", details: error.message }, { status: 500 });
  }
}