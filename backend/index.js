import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./app/User/UserRoute.js";
import webRoutes from "./app/website/WebsiteRoute.js";
import cron from "node-cron";
import WebsiteSchema from "./app/website/WebsiteSchema.js";
import { isSiteActive } from "./app/utils/siteStats.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(userRoutes);
app.use(webRoutes);
const PORT = process.env.PORT || 5000;

// cron.schedule("* 9 * * *", async () => {
cron.schedule("* * * * *", async () => {
  const allWebsites = await WebsiteSchema.find({}).populate({
    path: "userId",
    select: ["name", "email"],
  });
  if (!allWebsites.length) return;

  for (let i = 0; i < allWebsites.length; i++) {
    const website = allWebsites[i];
    const url = website.url;
    const isActive = await isSiteActive(url);
    WebsiteSchema.updateOne({ _id: website.id }, { isActive });

    if (!isActive && website.isActive) {
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend is running at http://localhost:${PORT}`);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("mongoose is connected"))
    .catch((err) => {
      console.log("error connecting mongoose", err);
    });
});
