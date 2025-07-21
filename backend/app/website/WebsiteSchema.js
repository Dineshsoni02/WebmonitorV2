import mongoose, { Mongoose } from "mongoose";

const { Schema } = mongoose;

const websiteSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
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

const WebsiteSchema = mongoose.model("Website", websiteSchema);

export default WebsiteSchema;
