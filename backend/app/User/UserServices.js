import bcrypt from "bcrypt";
import UserSchema from "./UserSchema.js";
import jwt from "jsonwebtoken";

const secretKey = "MY_SECRET_KEY";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const aTokenExp = Math.floor(Date.now() / 1000 + 1 * 24 * 60 * 60);
const rTokenExp = Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60);

const generateToken = (data, exp) => {
  if (!exp) exp = aTokenExp;

  const token = jwt.sign({ data, exp }, secretKey);
  return token;
};

const decodeToken = (token) => {
  let data;
  try {
    data = jwt.verify(token, secretKey);
  } catch (_e) {
    console.log("Error verifying token");
  }
  return data;
};

export const signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      status: false,
      message: "All fields are mandatory!!!",
    });
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).json({
      status: false,
      message: "E-mail is invalid",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const aToken = generateToken({ email, name }, aTokenExp);
  const rToken = generateToken({ email, name }, rTokenExp);

  const newUser = new UserSchema({
    name,
    email,
    password: hashedPassword,
    tokens: {
      accessToken: {
        token: aToken,
        expireAt: new Date(aToken * 1000),
      },
      refreshToken: {
        token: rToken,
        expireAt: new Date(rToken * 1000),
      },
    },
  });

  console.log("Saving user:", JSON.stringify(newUser, null, 2));

  newUser
    .save()
    .then((user) => {
      res.status(201).json({
        status: true,
        message: "User Successfully created!",
        data: user,
      });
    })
    .catch((err) => {
      res.status(400).json({
        status: false,
        message: "Error in user signup",
        error: err,
      });
    });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: false,
      message: "All fields are required",
    });
    return;
  }

  const user = await UserSchema.findOne({ email });
  if (!user) {
    res.status(422).json({
      status: false,
      message: "User not found",
    });
    return;
  }
  const dbPassword = user.password;

  const matched = bcrypt.compare(password, dbPassword);
  if (!matched) {
    res.status(422).json({
      status: false,
      message: "Credentials don't matched",
    });
    return;
  }

  res.status(200).json({
    status: true,
    message: "User Successfully logged in",
    data: user,
  });
};
