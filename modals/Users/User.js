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
    role: {
      type: String,
      enum: ["admin", "user", "manager", "readonly"],
      default: "user",  // Default role is "user"
    },
    team: {
      type: String,
      default: "",      // Field to associate the user with a team
    },
  },
  {
    timestamps: true,  // Automatically creates createdAt and updatedAt fields
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
