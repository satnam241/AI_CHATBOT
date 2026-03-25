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
import { sendOtpEmail } from "../utils/sendOtpEmail";

export const sendOtp = async (req: Request, res: Response) => {

  try {

    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or phone required"
      });
    }

    const otp = generateOtp();

    //const key = email || phone;

    saveOtp(phone||email, otp);


    /* Send OTP via Email */
    if (email) {
      await sendOtpEmail(email, otp);
    }

    /* Send OTP via SMS (optional) */
    if (phone) {
      await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: phone
      });
    }

    res.json({
      message: "OTP sent successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to send OTP"
    });

  }
};
/* ================= SIGNUP ================= */
export const signup = async (req: Request, res: Response) => {

  try {

    const { name, email, phone, purpose, otp } = req.body;

    const key = email || phone;

    if (!key) {
      return res.status(400).json({
        message: "Email or phone required"
      });
    }

    const storedOtp = getOtp(key);

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (Date.now() > storedOtp.expires) {
      deleteOtp(key);
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    deleteOtp(key);

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
        password: "otp_user"
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

    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email required"
      });
    }

    const storedOtp = getOtp(email);

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (Date.now() > storedOtp.expires) {
      deleteOtp(email);
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    deleteOtp(email);

    const user = await prisma.user.findUnique({
      where: { email }
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