import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, default: "" },
    contact: { type: String, default: "" },
    image: { type: String, default: "" },
    isSocialLogin: { type: Boolean, default: false },
    token: { type: String },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date },
    role: { type: String, enum: ["admin", "user", "manager", "readonly"], default: "user" },
    team: { type: String, default: "" },
    isVerified: { type: Boolean, default: false }, // Added for email verification
  },
  { timestamps: true }
);

userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", userSchema);