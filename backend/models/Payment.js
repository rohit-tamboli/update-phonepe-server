import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    merchantTransactionId: {
      type: String,
      required: true,
      unique: true,
    },
    merchantUserId: String,
    name: String,

    // ✅ New fields
    email: String,
    role: String,

    mobileNumber: String,
    amount: Number,

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;