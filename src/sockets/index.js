import { Server } from "socket.io";
import logger from "../utils/logger.js";
import { socketAuthMiddleware } from "./middleware.js";
import User from "../models/user-model.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
        transports: ["websocket"], // 🔥 IMPORTANT
    },
  });

  // 🔥 attach auth middleware
  io.use(socketAuthMiddleware);

  // 🔥 connection lifecycle
  io.on("connection", async (socket) => {
    const userId = socket.user.id;
    const user = await User.findById(userId).select("email, role")

    logger.info(`🔌 Connected: ${socket.id}, 👤 Socket User: ${socket.user.email}`);

    // join room
    socket.join(userId);
    logger.info(`📥 Joined room: ${userId}`);

    socket.on("disconnect", () => {
      logger.info(`❌ Disconnected: ${socket.id}`);
    });
  });

  return io;
};

// 🔥 optional: global access (important later)
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};