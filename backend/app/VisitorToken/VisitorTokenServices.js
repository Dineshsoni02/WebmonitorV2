import { v4 as uuidv4 } from "uuid";
import VisitorTokenSchema from "./VisitorTokenSchema.js";
import WebsiteSchema from "../website/WebsiteSchema.js";

// Token expiry duration: 7 days
const TOKEN_EXPIRY_DAYS = 7;

/**
 * Create a new visitor token
 */
export const createVisitorToken = async (req, res) => {
  try {
    const clientIP = req.ip || req.connection?.remoteAddress || "unknown";

    // Check rate limit: max 5 tokens per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await VisitorTokenSchema.countDocuments({
      createdFromIP: clientIP,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentTokens >= 5) {
      return res.status(429).json({
        status: false,
        message: "Too many tokens created. Please try again later.",
      });
    }

    // Generate new token
    const token = uuidv4();
    const expiresAt = new Date(
      Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    const newToken = new VisitorTokenSchema({
      token,
      status: "anonymous",
      expiresAt,
      createdFromIP: clientIP,
    });

    await newToken.save();

    res.status(201).json({
      status: true,
      message: "Visitor token created",
      data: {
        token,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating visitor token:", error);
    res.status(500).json({
      status: false,
      message: "Failed to create visitor token",
      error: error.message,
    });
  }
};

/**
 * Validate an existing visitor token
 */
export const validateVisitorToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Token is required",
      });
    }

    const visitorToken = await VisitorTokenSchema.findOne({ token });

    if (!visitorToken) {
      return res.status(404).json({
        status: false,
        message: "Token not found",
      });
    }

    // Check if expired
    if (
      visitorToken.status === "expired" ||
      (visitorToken.expiresAt && new Date() > visitorToken.expiresAt)
    ) {
      // Mark as expired if not already
      if (visitorToken.status !== "expired") {
        await VisitorTokenSchema.findByIdAndUpdate(visitorToken._id, {
          status: "expired",
        });
      }

      return res.status(410).json({
        status: false,
        message: "Token has expired",
        isExpired: true,
      });
    }

    res.status(200).json({
      status: true,
      message: "Token is valid",
      data: {
        token: visitorToken.token,
        status: visitorToken.status,
        expiresAt: visitorToken.expiresAt,
        isClaimed: visitorToken.status === "claimed",
      },
    });
  } catch (error) {
    console.error("Error validating visitor token:", error);
    res.status(500).json({
      status: false,
      message: "Failed to validate token",
      error: error.message,
    });
  }
};

/**
 * Claim a visitor token (link to user account)
 * Called during signup/login
 */
export const claimVisitorToken = async (token, userId) => {
  try {
    if (!token || !userId) {
      return { success: false, message: "Token and userId are required" };
    }

    // Find and validate token
    const visitorToken = await VisitorTokenSchema.findOne({
      token,
      status: "anonymous",
    });

    if (!visitorToken) {
      return { success: false, message: "Valid anonymous token not found" };
    }

    // Check if already expired
    if (visitorToken.expiresAt && new Date() > visitorToken.expiresAt) {
      await VisitorTokenSchema.findByIdAndUpdate(visitorToken._id, {
        status: "expired",
      });
      return { success: false, message: "Token has expired" };
    }

    // Update token to claimed status
    await VisitorTokenSchema.findByIdAndUpdate(visitorToken._id, {
      status: "claimed",
      userId: userId,
      claimedAt: new Date(),
      expiresAt: null, // No longer expires once claimed
    });

    // Transfer all websites from this visitor token to the user
    const transferResult = await WebsiteSchema.updateMany(
      { visitorToken: token, userId: null },
      { userId: userId, ownerStatus: "claimed" }
    );

    console.log(
      `Claimed token ${token} for user ${userId}. Transferred ${transferResult.modifiedCount} websites.`
    );

    return {
      success: true,
      message: "Token claimed successfully",
      websitesTransferred: transferResult.modifiedCount,
    };
  } catch (error) {
    console.error("Error claiming visitor token:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Get statistics for a visitor token
 */
export const getVisitorTokenStats = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Token is required",
      });
    }

    const visitorToken = await VisitorTokenSchema.findOne({ token });

    if (!visitorToken) {
      return res.status(404).json({
        status: false,
        message: "Token not found",
      });
    }

    // Get count of websites associated with this token
    const websiteCount = await WebsiteSchema.countDocuments({
      visitorToken: token,
    });

    res.status(200).json({
      status: true,
      data: {
        token: visitorToken.token,
        status: visitorToken.status,
        createdAt: visitorToken.createdAt,
        expiresAt: visitorToken.expiresAt,
        isClaimed: visitorToken.status === "claimed",
        websiteCount,
      },
    });
  } catch (error) {
    console.error("Error getting token stats:", error);
    res.status(500).json({
      status: false,
      message: "Failed to get token statistics",
      error: error.message,
    });
  }
};
