import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ObjectId } from "mongoose";

interface User {
  userId: string | ObjectId;
  email: string;
};

// Generate Access Token
export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.userId.toString(),
      email: user.email,
    
    },
    process.env.JWT_ACCESS as string, // Type assertion to ensure it's a string
    {  expiresIn: "10d",}
  );
};

// Generate Refresh Token
export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.userId.toString(),
    },
    process.env.JWT_REFRESH as string,
    { expiresIn: "30d" }
  );
};


// Generate a unique reset token
export const generateToken =  (): string => crypto.randomBytes(64).toString("hex");

// hast the token using sha256
export const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");

// Function to check if a token is expired
export const isTokenExpired = (expiresAt: string | Date): boolean => {
  return new Date() > new Date(expiresAt);
};