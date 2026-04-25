import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import logger from "./utils/logger.js";
import connectDB from "./config/db.js"
import { app } from "./app.js";
import { socketAuthMiddleware } from "./sockets/middleware.js";
import { initSocket } from "./sockets/index.js";


dotenv.config();

let server;

const startServer = async () => {
  try {
    // 1. Connect to DB
    await connectDB();
    logger.info("✅ MongoDB connected successfully");

    // 2. Create HTTP server (NO await here)
    const httpServer = http.createServer(app);

    initSocket(httpServer)

    // 5. Start server
    server = httpServer.listen(process.env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${process.env.PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

  } catch (error) {
    logger.error("❌ Failed to start server:", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();