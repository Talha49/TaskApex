import dbConnect from "@/lib/Mongo/Connectdb";
import Task from "@/modals/Task/Task";

export async function POST(req) {
  try {
    await dbConnect();

    const data = await req.json();
    console.log('Received Data:', data);

    // Validate required fields
    const { userId, title, description, category } = data;
    if (!userId || !title || !description || !category) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const task = new Task({
      userId,
      title,
      description,
      emojiIcon: data.emojiIcon || '😊',
      category: Array.isArray(category) ? category : [category],
    });

    await task.save();
    return Response.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);

    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      return Response.json({ message: 'Duplicate key error' }, { status: 400 });
    }

    // Generic error response
    return Response.json({ message: error.message }, { status: 500 });
  }
}
