// app/api/tasks/route.js

import dbConnect from "@/lib/Mongo/Connectdb";
import Task from "@/modals/Task/Task";


export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    console.log('Received Data:', data);

    // Ensure category is an array
    const category = Array.isArray(data.category) ? data.category : [data.category];

    const task = new Task({
      title: data.title,
      description: data.description,
      emojiIcon: data.emojiIcon || '😊', 
      category: category,
    });
    
    await task.save();
    console.log('Saved task:', task);
    return new Response(JSON.stringify(task), { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ message: 'Failed to create task', error: error.message }), { status: 500 });
  }
}

