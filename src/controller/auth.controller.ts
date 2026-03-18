import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt";
import jwt from "jsonwebtoken";
import twilio from "twilio";

import { generateOtp } from "../utils/generateOtp";
import { saveOtp, getOtp, deleteOtp } from "../utils/otpStore";
import client from "../utils/twilio";
/* ================= SIGNUP ================= */
export const sendOtp = async (req: Request, res: Response) => {

  try {

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number required"
      });
    }

    const otp = generateOtp();

    saveOtp(phone, otp);

    await client.messages.create({
      body: `Your verification OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone
    });

    res.json({
      message: "OTP sent successfully"
    });

  } catch (error: any) {
    console.log("Twilio Error:", error.message);
  
    res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};
/* ================= SIGNUP ================= */
export const signup = async (req: Request, res: Response) => {

  try {

    const { name, email, phone, purpose, otp } = req.body;

    const storedOtp = getOtp(phone);

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (Date.now() > storedOtp.expires) {
      deleteOtp(phone);
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    deleteOtp(phone);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        purpose,
        password: "otp_user" // required by schema
      }
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      accessToken,
      refreshToken,
      user
    });

  } catch (error) {

    res.status(500).json({
      message: "Signup failed"
    });

  }
};

/* ================= LOGIN ================= */
export const login = async (req: Request, res: Response) => {

  try {

    const { phone, otp } = req.body;

    const storedOtp = getOtp(phone);

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (Date.now() > storedOtp.expires) {
      deleteOtp(phone);
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    deleteOtp(phone);

    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      accessToken,
      refreshToken
    });

  } catch (error) {

    res.status(500).json({
      message: "Login failed"
    });

  }
};
/* ================= REFRESH TOKEN ================= */

export const refreshAccessToken = async (req: Request, res: Response) => {

  try {

    const { refreshToken } = req.body;

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    );

    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      accessToken: newAccessToken
    });

  } catch (error) {

    res.status(401).json({
      message: "Token refresh failed"
    });

  }
};