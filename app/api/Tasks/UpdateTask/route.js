// app/api/tasks/route.js

import connectDB from "@/lib/Mongo/Connectdb";
import Task from "@/modals/Task/Task";
import mongoose from 'mongoose';

export async function PUT(req) {
  try {
    console.log('Attempting to connect to the database...');
    await connectDB();
    console.log('Database connected successfully.');

    const { id, updateFields } = await req.json();
    console.log('Request body received:', { id, updateFields });

    if (!id) {
      console.error('Error: Task ID is missing.');
      return new Response(JSON.stringify({ message: 'Task ID is required' }), { status: 400 });
    }

    if (!updateFields || Object.keys(updateFields).length === 0) {
      console.error('Error: No update fields provided.');
      return new Response(JSON.stringify({ message: 'No update fields provided' }), { status: 400 });
    }

    // Sanitize and validate updateFields
    const sanitizedUpdateFields = { ...updateFields };

    // Sanitize the 'category' field to ensure it's an array of valid categories
    if (sanitizedUpdateFields.category) {
      if (!Array.isArray(sanitizedUpdateFields.category)) {
        console.warn('Category is not an array. Attempting to convert...');
        sanitizedUpdateFields.category = [sanitizedUpdateFields.category]; // Convert it into an array
      }
      
      // Ensure all values in the category array are valid categories
      const validCategories = ['Home', 'Office', 'College', 'Personal', 'Study'];
      sanitizedUpdateFields.category = sanitizedUpdateFields.category
        .map(cat => String(cat))  // Ensure all elements are strings
        .filter(cat => validCategories.includes(cat));  // Filter only valid categories

      // Check if we removed any invalid categories
      if (sanitizedUpdateFields.category.length !== updateFields.category.length) {
        console.warn('Invalid categories were filtered out.');
      }
    }

    console.log('Sanitized update fields:', sanitizedUpdateFields);

    console.log('Attempting to update task with ID:', id);
    
    // Convert ID to MongoDB ObjectId
    const updatedTask = await Task.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) }, 
      sanitizedUpdateFields, 
      { new: true }
    );
    console.log('Update result:', updatedTask);

    if (!updatedTask) {
      console.error(`Error: Task with ID ${id} not found.`);
      return new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 });
    }

    console.log('Task updated successfully:', updatedTask);
    return new Response(JSON.stringify(updatedTask), { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return new Response(JSON.stringify({ message: 'Failed to update task', error: error.message }), { status: 500 });
  }
}
