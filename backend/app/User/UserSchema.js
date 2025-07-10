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
    token: {
      accessToken: {
        type: String,
        expireAt: Date,
      },
      refreshToken: {
        type: String,
        expireAt: Date,
      },
    },
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("User", userSchema);

export default UserSchema;
