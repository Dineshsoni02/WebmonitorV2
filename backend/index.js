import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./app/User/UserRoute.js";
import webRoutes from "./app/website/WebsiteRoute.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(userRoutes);
app.use(webRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend is running at http://localhost:${PORT}`);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("mongoose is connected"))
    .catch((err) => {
      console.log("error connecting mongoose", err);
    });
});
