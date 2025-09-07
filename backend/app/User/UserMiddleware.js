import { messages } from "../constants/responseMessages.js";
import UserSchema from "../User/UserSchema.js";
import { checkExpiry } from "../utils/token.js";

export const authenticateUserMiddleware = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    res.status(400).json({
      status: false,
      message: messages.NO_TOKEN,
    });
    return;
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    const user = await UserSchema.findOne({
      "tokens.accessToken.token": token,
    });

    if (!user) {
      return res.status(422).json({
        status: false,
        message: messages.INVALID_TOKEN,
      });
    }
    const isExpired = checkExpiry(token);
    if (isExpired) {
      return res.status(401).json({
        status: false,
        message: messages.TOKEN_EXPIRED,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({
      status: false,
      message: messages.SERVER_ERROR || "Internal server error.",
    });
  }
};
