import VisitorTokenSchema from "./VisitorTokenSchema.js";

/**
 * Middleware to validate visitor token from request headers
 * Used for guest routes that require a valid visitor token
 */
export const validateVisitorTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["x-visitor-token"];

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Visitor token is required. Include X-Visitor-Token header.",
      });
    }

    const visitorToken = await VisitorTokenSchema.findOne({ token });

    if (!visitorToken) {
      return res.status(401).json({
        status: false,
        message: "Invalid visitor token",
      });
    }

    // Check if token is expired
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

      return res.status(401).json({
        status: false,
        message: "Visitor token has expired. Please create a new one.",
        isExpired: true,
      });
    }

    // Attach token info to request
    req.visitorToken = {
      token: visitorToken.token,
      status: visitorToken.status,
      isClaimed: visitorToken.status === "claimed",
      userId: visitorToken.userId,
    };

    next();
  } catch (error) {
    console.error("Visitor token middleware error:", error);
    return res.status(500).json({
      status: false,
      message: "Error validating visitor token",
      error: error.message,
    });
  }
};

/**
 * Optional middleware - allows requests with or without visitor token
 * Attaches token info if present, otherwise continues
 */
export const optionalVisitorTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["x-visitor-token"];

    if (!token) {
      req.visitorToken = null;
      return next();
    }

    const visitorToken = await VisitorTokenSchema.findOne({ token });

    if (
      !visitorToken ||
      visitorToken.status === "expired" ||
      (visitorToken.expiresAt && new Date() > visitorToken.expiresAt)
    ) {
      req.visitorToken = null;
      return next();
    }

    req.visitorToken = {
      token: visitorToken.token,
      status: visitorToken.status,
      isClaimed: visitorToken.status === "claimed",
      userId: visitorToken.userId,
    };

    next();
  } catch (error) {
    console.error("Optional visitor token middleware error:", error);
    req.visitorToken = null;
    next();
  }
};
