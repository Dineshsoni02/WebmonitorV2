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
      accessToken: String,
      refreshToken: String,
    },
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("User", userSchema);

export default UserSchema;
