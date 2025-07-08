import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend is running on ${PORT}`);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("mongoose is connected"))
    .catch((err) => {
      console.log("error connecting mongoose", err);
    });
});
