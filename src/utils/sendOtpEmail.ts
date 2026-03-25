import { sendEmail } from "../config/email";

export const sendOtpEmail = async (email: string, otp: string) => {

  const subject = "Your OTP Verification Code";

  const message = `
Your OTP is: ${otp}

This OTP will expire in 5 minutes.

Do not share this code with anyone.
`;

  await sendEmail(email, subject, message);
};