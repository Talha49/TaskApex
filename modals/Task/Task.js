// lib/models/taskModel.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({

  userId: {
    type: String,  // Changed from ObjectId to String
    required: true
  },

  emojiIcon: {
    type: String,
    required: true,
    default: '😊'
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.every(cat => ['Home', 'Office', 'College', 'Personal', 'Study'].includes(cat));
      },
      message: props => `${props.value} contains an invalid category!`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);


export default Task;