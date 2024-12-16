// lib/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: "",
    },
    contact: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    isSocialLogin: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String, // To store the JWT token
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
