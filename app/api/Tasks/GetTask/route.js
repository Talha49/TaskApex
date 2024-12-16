// app/api/tasks/route.js

import dbConnect from "@/lib/Mongo/Connectdb";
import Task from "@/modals/Task/Task";


export async function GET(req) {
  try {
    await dbConnect();
    const tasks = await Task.find({});
    return new Response(JSON.stringify(tasks), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch tasks', error: error.message }), { status: 500 });
  }
}
