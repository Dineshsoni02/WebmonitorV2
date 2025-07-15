import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY || "fallback_secret";

export const getExpiry = (days) => Math.floor(Date.now() / 1000 + days * 86400);
