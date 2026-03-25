import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./route/auth.route";
import paymentRoutes from "./route/payment.routes";
import chatroute from "./route/chat.routes"

const app = express();


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat",chatroute)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Chatbot API running"
  });
});

export default app;