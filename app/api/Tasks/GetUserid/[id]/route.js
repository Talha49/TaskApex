// app/api/Tasks/GetUserid/[userId]/route.js
import dbConnect from "@/lib/Mongo/Connectdb";
import Task from "@/modals/Task/Task";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const  userId  = params.id;

    if (!userId) {
      return Response.json({ message: "UserId is required" }, { status: 400 });
    }

    const tasks = await Task.find({ userId: userId })
    return Response.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return Response.json({ message: error.message }, { status: 500 });
  }
}