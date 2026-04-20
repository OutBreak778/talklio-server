import bcrypt from "bcryptjs";

import User from "../../models/user-model.js";
import logger from "../../utils/logger.js";
import emailService from "../../utils/sendMail.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    logger.info(`Registration attempt for email: ${email || "no-email"}`);

    // Check if user already exists
    let user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // ✅ CASE 1: User already exists
    if (user) {
      logger.warn(`Email already exists: ${email}`);
      
      // Check if user is already verified
      if (user.isVerified) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists. Please login instead.",
          exists: true,
          verified: true,
        });
      }
      
      // ✅ User exists but NOT verified - Resend OTP
      logger.info(`User not verified. Resending OTP to: ${email}`);
      
      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();
      
      // Send verification email
      await emailService.sendVerificationOTP(email, otp, 10);
      
      return res.status(200).json({
        success: true,
        message: "Account not verified. New verification code sent to your email.",
        data: {
          email: user.email,
          requiresVerification: true,
          userId: user._id,
          existingUser: true
        },
      });
    }

    // ✅ CASE 2: New user - Create account
    // Hash password directly in controller
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with hashed password
    user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: false,
    });

    // Generate OTP for new user
    const otp = user.generateOTP();
    await user.save();

    // Send verification email
    await emailService.sendVerificationOTP(email, otp, 10);

    logger.info(`New user created and OTP sent: ${user._id} | ${user.email}`);

    // Return user data
    return res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for verification code.",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
        },
        requiresVerification: true,
      },
    });
    
  } catch (error) {
    logger.error(`Registration failed for email: ${req.body?.email}`, {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
    });

    console.error("Full error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register user. Please try again later.",
    });
  }
};
