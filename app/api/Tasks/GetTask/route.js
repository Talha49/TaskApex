import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/Mongo/Connectdb";
import Task from "../../../../modals/Task/Task";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch all tasks for the user's tenant
export async function GET(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await Task.find({ tenantId: session.user.tenantId })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks", details: error.message }, { status: 500 });
  }
}
