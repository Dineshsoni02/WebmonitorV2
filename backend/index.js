import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./app/User/UserRoute.js";
import webRoutes from "./app/website/WebsiteRoute.js";
import visitorTokenRoutes from "./app/VisitorToken/VisitorTokenRoute.js";
import cron from "node-cron";
import WebsiteSchema from "./app/website/WebsiteSchema.js";
import { getResponseTime, checkSSL, checkSEO, checkUptime } from "./app/utils/siteStats.js";
import { sendEmail } from "./app/utils/sendEmail.js";
import { cleanupExpiredTokens, purgeOldExpiredTokens } from "./app/utils/cleanup.js";

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
// CRON JOBS
// ============================================

// Daily website check - runs at 9:00 AM every day
cron.schedule("0 9 * * *", async () => {
  console.log("🔄 Running daily website check...");
  
  try {
    const allWebsites = await WebsiteSchema.find({}).populate({
      path: "userId",
      select: ["name", "email"],
    });
    
    if (!allWebsites.length) {
      console.log("No websites to check");
      return;
    }

    console.log(`Checking ${allWebsites.length} websites...`);

    for (let i = 0; i < allWebsites.length; i++) {
      const website = allWebsites[i];
      const url = website.url;

      try {
        const isUp = await checkUptime(url);
        
        let updateData;
        if (isUp) {
          const [responseTime, sslInfo, seoInfo] = await Promise.all([
            getResponseTime(url),
            checkSSL(url),
            checkSEO(url),
          ]);

          updateData = {
            isActive: true,
            status: "online",
            responseTime: responseTime || 0,
            lastCheckedAt: new Date(),
            ssl: {
              isValid: sslInfo?.isValid || false,
              issuer: sslInfo?.issuer || null,
              validFrom: sslInfo?.validFrom || null,
              validTo: sslInfo?.validTo || null,
              daysRemaining: sslInfo?.daysRemaining || null,
              error: sslInfo?.error || null,
            },
            seo: seoInfo?.error
              ? { error: seoInfo.error }
              : {
                  title: seoInfo?.title,
                  titleLength: seoInfo?.titleLength,
                  metaDescription: seoInfo?.metaDescription,
                  metaDescriptionLength: seoInfo?.metaDescriptionLength,
                  h1Count: seoInfo?.h1Count,
                  h2Count: seoInfo?.h2Count,
                  imageCount: seoInfo?.imageCount,
                  imagesWithoutAlt: seoInfo?.imagesWithoutAlt,
                  issues: seoInfo?.issues || [],
                  hasIssues: seoInfo?.hasIssues || false,
                },
          };
        } else {
          updateData = {
            isActive: false,
            status: "offline",
            lastCheckedAt: new Date(),
          };
        }

        await WebsiteSchema.findByIdAndUpdate(website._id, updateData);

        // Send email notification if site went down
        if (!isUp && website.isActive && website.userId?.email) {
          const { name, email } = website.userId;
          await sendEmail(
            email,
            "Website is down",
            `Hi ${name}, the website ${url} is down as we checked on ${new Date().toLocaleString()}`
          );
        }

        console.log(`✓ Checked ${url}: ${isUp ? "online" : "offline"}`);
      } catch (error) {
        console.error(`Error checking ${url}:`, error.message);
      }
    }

    console.log("✅ Daily website check completed");
  } catch (error) {
    console.error("❌ Daily website check failed:", error);
  }
});

// Daily cleanup - runs at midnight every day
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Running daily cleanup...");
  
  try {
    await cleanupExpiredTokens();
    await purgeOldExpiredTokens();
    console.log("✅ Daily cleanup completed");
  } catch (error) {
    console.error("❌ Daily cleanup failed:", error);
  }
});

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

