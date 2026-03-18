import jwt, { Secret } from "jsonwebtoken";

const accessSecret: Secret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret: Secret = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    accessSecret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    refreshSecret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any }
  );
};