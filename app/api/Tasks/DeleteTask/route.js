// app/api/Tasks/DeleteTask/route.js

import dbConnect from "@/lib/Mongo/Connectdb";
import Task from "@/modals/Task/Task";


export async function DELETE(req) {
  try {
    await dbConnect();
    const { taskIds } = await req.json();

    if (!taskIds || taskIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No task IDs provided' }), { status: 400 });
    }

    const result = await Task.deleteMany({ id: { $in: taskIds } });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: 'No tasks found with the provided IDs' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: `${result.deletedCount} task(s) deleted successfully` }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to delete task(s)', error: error.message }), { status: 500 });
  }
}