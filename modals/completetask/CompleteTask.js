// lib/models/taskModel.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


const completetaskSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  emojiIcon: {
    type: String,
    required: true,
    default: '😎'
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
    enum: ['Home', 'Office', 'College','Personal','Study'] 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Completetask = mongoose.models.Completetask || mongoose.model('Completetask', completetaskSchema);

// Export both models
export {  Completetask };
