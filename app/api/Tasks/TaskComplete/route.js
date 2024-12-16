// app/api/tasks/route.js

import dbConnect from "@/lib/Mongo/Connectdb";
import { Completetask } from "@/modals/completetask/CompleteTask";

// app/api/tasks/route.js

export async function POST(req) {
  try {
    await dbConnect();
    const { taskdata } = await req.json();
    console.log('Received Data:', taskdata);
    const task = new Completetask({
      title: taskdata.title,
      description: taskdata.description,
      emojiIcon: taskdata.emojiIcon || '😊', 
      category: taskdata.category,
    });
    await task.save();
    console.log('Saved task:', task);
    return new Response(JSON.stringify(task), { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ message: 'Failed to create task', error: error.message }), { status: 500 });
  }
}