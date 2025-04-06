import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emojiIcon: {
    type: String,
    required: true,
    default: "😊",
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.every((cat) =>
          ["Home", "Office", "College", "Personal", "Study"].includes(cat)
        );
      },
      message: (props) => `${props.value} contains an invalid category!`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

TaskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);