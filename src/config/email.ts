import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

if (!refreshToken) {
  throw new Error("GOOGLE_REFRESH_TOKEN missing in .env");
}

oauth2Client.setCredentials({
  refresh_token: refreshToken
});

export const sendEmail = async (to: string, subject: string, text: string) => {

  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token as string
    }
  });

  await transporter.sendMail({
    from: `AI Chatbot <${process.env.GOOGLE_USER}>`,
    to,
    subject,
    text
  });
};