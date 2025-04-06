import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Removed required: true
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);