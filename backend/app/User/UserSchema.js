import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tokens: {
      accessToken: {
        token: String,
        expireAt: Date,
      },
      refreshToken: {
        token: String,
        expireAt: Date,
      },
    },
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("User", userSchema);

export default UserSchema;
