import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./app/User/UserRoute.js";
import webRoutes from "./app/website/WebsiteRoute.js";
import visitorTokenRoutes from "./app/VisitorToken/VisitorTokenRoute.js";

// Note: Cron jobs have been moved to Python workers for better performance
// See /workers directory for scheduled background tasks

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Enable trust proxy for rate limiting by IP
app.set("trust proxy", 1);

app.use(userRoutes);
app.use(webRoutes);
app.use(visitorTokenRoutes);

const PORT = process.env.PORT || 5000;

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Backend is running at http://localhost:${PORT}`);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
      console.log("❌ Error connecting to MongoDB:", err);
    });
});

