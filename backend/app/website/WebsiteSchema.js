import mongoose, { Mongoose } from "mongoose";

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user can only add a specific URL once, but multiple users can add the same URL
websiteSchema.index({ url: 1, userId: 1 }, { unique: true });

const WebsiteSchema = mongoose.model("Website", websiteSchema);

export default WebsiteSchema;
