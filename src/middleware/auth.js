import jwt from "jsonwebtoken";
import User from "../models/user-model.js"

export const userProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⚠️ Critical: attach full user (without password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};