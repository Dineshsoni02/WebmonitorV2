import bcrypt from "bcrypt";
import UserSchema from "./UserSchema.js";
import { validateEmail } from "../utils/validation.js";
import { generateToken, getExpiry } from "../utils/token.js";
import { messages } from "../constants/responseMessages.js";

export const signupUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ status: false, message: messages.FIELDS_REQUIRED });

  if (!validateEmail(email))
    return res
      .status(400)
      .json({ status: false, message: messages.EMAIL_INVALID });

  const existingUser = await UserSchema.findOne({ email });
  if (existingUser)
    return res
      .status(400)
      .json({ status: false, message: messages.USER_EXISTS });

  const hashedPassword = await bcrypt.hash(password, 10);

  const aTokenExp = getExpiry(1);
  const rTokenExp = getExpiry(30);

  const aToken = generateToken({ email, name }, aTokenExp);
  const rToken = generateToken({ email, name }, rTokenExp);

  const newUser = new UserSchema({
    name,
    email,
    password: hashedPassword,
    tokens: {
      accessToken: { token: aToken, expireAt: new Date(aTokenExp * 1000) },
      refreshToken: { token: rToken, expireAt: new Date(rTokenExp * 1000) },
    },
  });

  try {
    const user = await newUser.save();
    const userObj = user.toObject();
    delete userObj.password;
    res
      .status(201)
      .json({ status: true, message: messages.SIGNUP_SUCCESS, data: userObj });
  } catch (err) {
    res
      .status(400)
      .json({ status: false, message: messages.SIGNUP_ERROR, error: err });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ status: false, message: messages.FIELDS_REQUIRED });

  const user = await UserSchema.findOne({ email });
  if (!user)
    return res
      .status(422)
      .json({ status: false, message: messages.USER_NOT_FOUND });

  const matched = await bcrypt.compare(password, user.password);

  if (!matched)
    return res
      .status(422)
      .json({ status: false, message: messages.PASSWORD_INCORRECT });

  const aTokenExp = getExpiry(1);
  const rTokenExp = getExpiry(30);

  const aToken = generateToken({ email }, aTokenExp);
  const rToken = generateToken({ email}, rTokenExp);

  user.tokens = {
    accessToken: { token: aToken, expireAt: new Date(aTokenExp * 1000) },
    refreshToken: { token: rToken, expireAt: new Date(rTokenExp * 1000) },
  };

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  res
    .status(200)
    .json({ status: true, message: messages.LOGIN_SUCCESS, data: userObj });
};
