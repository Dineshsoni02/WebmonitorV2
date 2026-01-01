import mongoose from "mongoose";

const { Schema } = mongoose;

const websiteSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    websiteName: {
      type: String,
    },
    // Unified ownership model: either userId OR visitorToken
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    visitorToken: {
      type: String,
      default: null,
    },
    ownerStatus: {
      type: String,
      enum: ["guest", "claimed", "active"],
      default: "guest",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Status tracking
    status: {
      type: String,
      enum: ["online", "offline", "unknown"],
      default: "unknown",
    },
    responseTime: {
      type: Number,
      default: null,
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
    // Persistent SSL data (rarely changes)
    ssl: {
      isValid: { type: Boolean, default: false },
      issuer: { type: String, default: null },
      subject: { type: String, default: null },
      validFrom: { type: Date, default: null },
      validTo: { type: Date, default: null },
      daysRemaining: { type: Number, default: null },
      error: { type: String, default: null },
    },
    // Persistent SEO data (slow-changing)
    seo: {
      title: { type: String, default: null },
      titleLength: { type: Number, default: null },
      metaDescription: { type: String, default: null },
      metaDescriptionLength: { type: Number, default: null },
      h1Count: { type: Number, default: null },
      h2Count: { type: Number, default: null },
      imageCount: { type: Number, default: null },
      imagesWithoutAlt: { type: Number, default: null },
      issues: { type: [String], default: [] },
      hasIssues: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
// User can only add a specific URL once (when logged in)
websiteSchema.index(
  { url: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $exists: true }
    }
  }
);
// Visitor can only add a specific URL once (when guest)

websiteSchema.index(
  { url: 1, visitorToken: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $exists: true }
    }
  }
);


// Fast lookup by visitorToken for guest data
websiteSchema.index({ visitorToken: 1 });
// Fast lookup by userId for logged-in users
websiteSchema.index({ userId: 1 });

const WebsiteSchema = mongoose.model("Website", websiteSchema);

export default WebsiteSchema;
