import VisitorTokenSchema from "../VisitorToken/VisitorTokenSchema.js";
import WebsiteSchema from "../website/WebsiteSchema.js";

/**
 * Clean up expired visitor tokens and their associated data
 * Should be run daily via cron job
 */
export const cleanupExpiredTokens = async () => {
  console.log("🧹 Starting cleanup of expired tokens...");

  try {
    // Find expired anonymous tokens
    const expiredTokens = await VisitorTokenSchema.find({
      status: "anonymous",
      expiresAt: { $lt: new Date() },
    });

    if (expiredTokens.length === 0) {
      console.log("✅ No expired tokens to clean up");
      return { tokensExpired: 0, websitesDeleted: 0 };
    }

    const tokenStrings = expiredTokens.map((t) => t.token);

    // Count websites that will be deleted (for logging)
    const websiteCount = await WebsiteSchema.countDocuments({
      visitorToken: { $in: tokenStrings },
      userId: null,
    });

    // Delete orphaned websites (guest websites linked to expired tokens)
    const deleteResult = await WebsiteSchema.deleteMany({
      visitorToken: { $in: tokenStrings },
      userId: null,
    });

    // Mark tokens as expired
    await VisitorTokenSchema.updateMany(
      { token: { $in: tokenStrings } },
      { status: "expired" }
    );

    console.log(
      `✅ Cleanup complete: ${tokenStrings.length} tokens expired, ${deleteResult.deletedCount} websites deleted`
    );

    return {
      tokensExpired: tokenStrings.length,
      websitesDeleted: deleteResult.deletedCount,
    };
  } catch (error) {
    console.error("❌ Cleanup error:", error);
    throw error;
  }
};

/**
 * Clean up very old expired tokens from the database
 * Tokens that have been expired for more than 30 days can be permanently deleted
 */
export const purgeOldExpiredTokens = async () => {
  console.log("🗑️ Purging old expired tokens...");

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await VisitorTokenSchema.deleteMany({
      status: "expired",
      updatedAt: { $lt: thirtyDaysAgo },
    });

    console.log(`✅ Purged ${result.deletedCount} old expired tokens`);

    return { tokensPurged: result.deletedCount };
  } catch (error) {
    console.error("❌ Purge error:", error);
    throw error;
  }
};

/**
 * Get cleanup statistics
 */
export const getCleanupStats = async () => {
  try {
    const now = new Date();

    const [anonymousTokens, claimedTokens, expiredTokens, guestWebsites] =
      await Promise.all([
        VisitorTokenSchema.countDocuments({ status: "anonymous" }),
        VisitorTokenSchema.countDocuments({ status: "claimed" }),
        VisitorTokenSchema.countDocuments({ status: "expired" }),
        WebsiteSchema.countDocuments({ userId: null, ownerStatus: "guest" }),
      ]);

    // Tokens expiring soon (within 24 hours)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiringSoon = await VisitorTokenSchema.countDocuments({
      status: "anonymous",
      expiresAt: { $gte: now, $lt: tomorrow },
    });

    return {
      tokens: {
        anonymous: anonymousTokens,
        claimed: claimedTokens,
        expired: expiredTokens,
        expiringSoon,
      },
      guestWebsites,
    };
  } catch (error) {
    console.error("Error getting cleanup stats:", error);
    throw error;
  }
};
