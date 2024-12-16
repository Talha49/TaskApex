// app/api/tasks/route.js

import dbConnect from "@/lib/Mongo/Connectdb";
import { Completetask } from "@/modals/completetask/CompleteTask";


export async function GET(req) {
  try {
    await dbConnect();
    const tasks = await Completetask.find({});
    return new Response(JSON.stringify(tasks), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch tasks', error: error.message }), { status: 500 });
  }
}
