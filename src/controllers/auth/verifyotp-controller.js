import User from "../../models/user-model.js";
import logger from "../../utils/logger.js";
import emailService from "../../utils/sendMail.js";

// Verify OTP endpoint
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+emailVerificationOTP +emailVerificationExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified. Please login.",
      });
    }

    // Increment verification attempts
    await user.incrementVerificationAttempts();

    // Check if account is locked
    if (user.isLocked()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Too many failed attempts. Account locked for ${remainingTime} minutes.`,
      });
    }

    // Verify OTP
    const verification = user.verifyOTP(otp);

    if (!verification.valid) {
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: verification.message,
        attemptsLeft: 5 - (user.verificationAttempts || 0),
      });
    }

    // Save verified user
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.fullName);

    logger.info(`Email verified successfully: ${user._id} | ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
      data: {
        email: user.email,
        verifiedAt: user.emailVerifiedAt,
      },
    });

  } catch (error) {
    logger.error(`Email verification failed: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};

// ✅ Resend Email Verification OTP
export const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    logger.info(`Resend verification OTP requested for: ${email}`);

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified. Please login.",
      });
    }

    // Check cooldown (prevent spam)
    const lastRequest = user.lastVerificationRequest || 0;
    const cooldown = 60 * 1000; // 60 seconds
    
    if (Date.now() - lastRequest < cooldown) {
      const timeLeft = Math.ceil((cooldown - (Date.now() - lastRequest)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeLeft} seconds before requesting another code.`,
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    user.lastVerificationRequest = Date.now();
    await user.save();

    // Send verification email
    await emailService.sendVerificationOTP(user.email, otp, 10);

    logger.info(`Verification OTP resent to: ${email}`);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
      data: {
        email: user.email,
        expiresIn: "10 minutes"
      }
    });

  } catch (error) {
    logger.error(`Resend verification OTP error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again.",
    });
  }
};