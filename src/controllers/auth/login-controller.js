import User from "../../models/user-model.js";
import logger from "../../utils/logger.js";
import emailService from "../../utils/sendMail.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    logger.info(`Login attempt for email: ${email}`);

    // Find user and explicitly select password
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      logger.warn(`Login failed - User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(423).json({
        success: false,
        message: "Please Verify the Account properly.",
      });
    }

    // Compare password
    let isPasswordMatch;
    try {
      isPasswordMatch = await user.comparePassword(password);
    } catch (compareErr) {
      logger.error("Password compare failed", { error: compareErr.message });
      return res.status(500).json({ success: false, message: "Login error" });
    }

    if (!isPasswordMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save({ validateBeforeSave: false });

      logger.warn(`Failed login attempt for: ${email} (Attempt ${user.loginAttempts})`);

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = Date.now();
    user.lastActive = Date.now();

    // ✅ FIXED: Define deviceId properly
    const deviceId = req.headers["x-device-id"] || `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const deviceName = req.headers["x-device-name"] || req.headers["user-agent"] || "Unknown Device";
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"] || "Unknown";
    const location = req.headers["x-geolocation"] || "Unknown Location";
    
    // Check if this is a new device
    const isNewDevice = !user.devices.some(device => device.deviceId === deviceId);

    // Device Management
    let deviceInfo = {
      deviceId: deviceId,
      deviceName: deviceName,
      lastUsed: new Date(),
      fcmToken: req.body.fcmToken || null,
    };

    // Check if device already exists
    const existingDeviceIndex = user.devices.findIndex(
      (device) => device.deviceId === deviceInfo.deviceId,
    );

    if (existingDeviceIndex !== -1) {
      // Update existing device
      user.devices[existingDeviceIndex].deviceName = deviceInfo.deviceName;
      user.devices[existingDeviceIndex].lastUsed = deviceInfo.lastUsed;
      if (deviceInfo.fcmToken) {
        user.devices[existingDeviceIndex].fcmToken = deviceInfo.fcmToken;
      }
    } else {
      // Add new device
      user.devices.push({
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        lastUsed: deviceInfo.lastUsed,
        fcmToken: deviceInfo.fcmToken,
      });
    }

    // Limit devices to 5
    const MAX_DEVICES = 5;
    if (user.devices.length > MAX_DEVICES) {
      user.devices.sort((a, b) => a.lastUsed - b.lastUsed);
      user.devices.shift();
    }

    // Save user before sending alerts
    await user.save({ validateBeforeSave: false });

    // ✅ Send login alert only for new devices
    try {
      if (isNewDevice) {
        const currentTime = new Date().toLocaleString();
        await emailService.sendLoginAlert(
          user.email,
          user.fullName,
          deviceName,
          location,
          currentTime,
          ipAddress,
        );
        logger.info(`Login alert sent to ${user.email} for new device: ${deviceName}`);
      }
    } catch (alertError) {
      // Don't block login if email fails
      logger.error(`Failed to send login alert email: ${alertError.message}`);
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`Login successful for user: ${user._id} | ${user.email}`);

    const responseData = {
      user: user.fullProfile,
      accessToken,
      refreshToken,
      device: {
        id: deviceInfo.deviceId,
        name: deviceInfo.deviceName,
        isNewDevice: isNewDevice,
      },
    };

    if (deviceInfo) {
      responseData.deviceInfo = deviceInfo;
    }

    return res.status(200).json({
      success: true,
      message: isNewDevice
        ? "Login successful. We've sent an alert to your email."
        : "Login successful",
      data: responseData,
    });
    
  } catch (error) {
    logger.error(`Login error for email: ${req.body?.email}`, {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to login. Please try again later.",
    });
  }
};