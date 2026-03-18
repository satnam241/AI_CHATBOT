import { Router } from "express";

import {
  sendOtp,
  signup,
  login,
  refreshAccessToken
} from "../controller/auth.controller";

const router = Router();

/* Health check */
router.get("/", (req, res) => {
  res.json({ message: "Auth route working" });
});

/* OTP */
router.post("/send-otp", sendOtp);

/* Signup */
router.post("/signup", signup);

/* Login */
router.post("/login", login);

/* Refresh token */
router.post("/refresh", refreshAccessToken);

export default router;