import { messages } from "../constants/responseMessages.js";
import UserSchema from "../User/UserSchema.js";

export const validateAccessToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(400).json({
      status: false,
      message: messages.NO_TOKEN,
    });
    return;
  }

  const user = await UserSchema.findOne({
    "tokens.accessToken.token": token,
  });

  if (!user) {
    res.status(422).json({
      status: false,
      message: messages.INVALID_TOKEN,
    });
    return;
  }

  req.user;
  next();
};
