import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/prisma";
//import "./config/redis";

const PORT = process.env.PORT

const startServer = async () => {
  try {

    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server startup failed", error);
    process.exit(1);
  }
};

startServer();