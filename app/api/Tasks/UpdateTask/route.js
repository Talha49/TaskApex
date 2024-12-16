// app/api/tasks/route.js

import dbConnect from "@/lib/Mongo/Connectdb";
import Task from "@/modals/Task/Task";


export async function PUT(req) {
  try {
    await dbConnect();
    const { id, ...updateFields } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ message: 'Task ID is required' }), { status: 400 });
    }

    if (!updateFields || Object.keys(updateFields).length === 0) {
      return new Response(JSON.stringify({ message: 'No update fields provided' }), { status: 400 });
    }

    const updatedTask = await Task.findOneAndUpdate({ id: id }, updateFields, { new: true });

    if (!updatedTask) {
      return new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updatedTask), { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return new Response(JSON.stringify({ message: 'Failed to update task', error: error.message }), { status: 500 });
  }
}