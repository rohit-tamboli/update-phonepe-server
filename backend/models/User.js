import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, unique: true },
    phone: String,
    role: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);