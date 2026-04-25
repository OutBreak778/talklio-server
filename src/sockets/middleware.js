import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

export const socketAuthMiddleware = (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.token;

    if (!token) {
      logger.warn("❌ No token provided");
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    logger.info(`✅ Socket authenticated: ${decoded.id}`);

    next();
  } catch (error) {
    logger.error("❌ Socket auth failed", error.message);
    next(new Error("Unauthorized"));
  }
};
