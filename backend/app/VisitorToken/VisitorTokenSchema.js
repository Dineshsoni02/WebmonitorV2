import mongoose from "mongoose";
const { Schema } = mongoose;

const visitorTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["anonymous", "claimed", "expired"],
      default: "anonymous",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    // Rate limiting: track IP for abuse prevention
    createdFromIP: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for cleanup queries
visitorTokenSchema.index({ status: 1, expiresAt: 1 });

const VisitorTokenSchema = mongoose.model("VisitorToken", visitorTokenSchema);

export default VisitorTokenSchema;
