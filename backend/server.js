import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import phonepeRoute from "./routes/phonepe/phonepeRoute.js";
import connectDB from "./config/db.js";
import User from "./models/User.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://update-page-nu.vercel.app",
    ],
    credentials: true,
  })
);

// ✅ MongoDB
connectDB();

// =======================
// ✅ Register API
// =======================
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, phone, role } = req.body;

    if (!fullName || !email || !phone || !role) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser = await User.create({
      fullName,
      email,
      phone,
      role,
    });

    res.json({ success: true, userId: newUser._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});


// PhonePe Routes
app.use("/api", phonepeRoute);

// Health Route
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});