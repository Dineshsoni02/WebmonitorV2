import jwt from "jsonwebtoken";
import { messages } from "../constants/responseMessages.js";
import UserSchema from "../User/UserSchema.js";

const secretKey = process.env.SECRET_KEY || "fallback_secret";

export const getExpiry = (days) => Math.floor(Date.now() / 1000 + days * 86400);

export const generateToken = (data, expiry) => {
  if (!expiry) expiry = getExpiry(1);

  const token = jwt.sign({ data, expiry }, secretKey);
  return token;
};

export const decodeToken = (token) => {
  let data;

  try {
    data = jwt.verify(token, secretKey);
  } catch (error) {
    console.log("error verifying token", error);
  }

  return data;
};

export const generateNewAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({
      status: false,
      message: messages.NO_REFRESH_TOKEN,
    });
    return;
  }

  const user = await UserSchema.findOne({
    "tokens.refreshToken.token": refreshToken,
  });

  if (!user) {
    res.status(422).json({
      status: false,
      message: messages.USER_NOT_FOUND,
    });
    return;
  }

  const aTokenExp = getExpiry(1);
  const rTokenExp = getExpiry(7);
  const rToken = generateToken(
    { email: user.email, name: user.name },
    rTokenExp
  );
  const aToken = generateToken(
    { email: user.email, name: user.name },
    aTokenExp
  );

  user.tokens.accessToken = {
    token: aToken,
    expireAt: new Date(aTokenExp * 1000),
  };
  user.tokens.refreshToken = {
    token: rToken,
    expireAt: new Date(rTokenExp * 1000),
  };
  try {
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({
      status: true,
      message: messages.ACCESS_TOKEN_CREATED,
      data: userObj,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: messages.ACCESS_TOKEN_CREATION_ERROR,
    });
  }
};

export const checkExpiry = (token) => {
  const decoded = jwt.verify(token, secretKey);
  return decoded.exp < Date.now() / 1000;
};

         