import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
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
