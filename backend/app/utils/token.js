import jwt from "jsonwebtoken";

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
