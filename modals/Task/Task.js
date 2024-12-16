// lib/models/taskModel.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
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