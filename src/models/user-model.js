import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password must be at least 8 characters"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png",
    },

    status: {
      type: String,
      enum: ["online", "offline", "busy", "away"],
      default: "offline",
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    refreshToken: { type: String, select: false },

    passwordResetToken: String,
    passwordResetExpires: Date,

    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    devices: [
      {
        deviceId: String,
        deviceName: String,
        lastUsed: Date,
        fcmToken: String,
      },
    ],

    // ✅ Email Verification OTP Fields
    emailVerificationOTP: {
      type: String,
      select: false, // Don't return by default
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    // ✅ Optional: Track verification attempts
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    lastVerificationAttempt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.methods.generateOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationOTP = otp;
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.verificationAttempts = 0;
  this.lastVerificationAttempt = null;

  return otp;
};

// ✅ Method to verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
  // Check if OTP exists and not expired
  if (!this.emailVerificationOTP || !this.emailVerificationExpires) {
    return { valid: false, message: "No OTP found. Please request a new one." };
  }

  // Check if expired
  if (Date.now() > this.emailVerificationExpires) {
    return { valid: false, message: "OTP expired. Please request a new one." };
  }

  // Check OTP match
  if (this.emailVerificationOTP !== enteredOTP) {
    return { valid: false, message: "Invalid OTP. Please try again." };
  }

  // Mark as verified
  this.isVerified = true;
  this.emailVerifiedAt = Date.now();

  // Clear OTP fields
  this.emailVerificationOTP = undefined;
  this.emailVerificationExpires = undefined;
  this.verificationAttempts = 0;
  this.lastVerificationAttempt = null;

  return { valid: true, message: "Email verified successfully." };
};

// ✅ Method to check if OTP is expired
userSchema.methods.isOTPExpired = function () {
  return (
    this.emailVerificationExpires && Date.now() > this.emailVerificationExpires
  );
};

// ✅ Method to resend OTP (with cooldown)
userSchema.methods.canResendOTP = function () {
  if (!this.lastVerificationAttempt) return true;

  const cooldown = 60 * 1000; // 1 minute cooldown
  return Date.now() - this.lastVerificationAttempt > cooldown;
};

// ✅ Method to increment verification attempts
userSchema.methods.incrementVerificationAttempts = async function () {
  this.verificationAttempts = (this.verificationAttempts || 0) + 1;
  this.lastVerificationAttempt = Date.now();

  // Lock after 5 failed attempts for 15 minutes
  if (this.verificationAttempts >= 5) {
    this.lockUntil = Date.now() + 15 * 60 * 1000;
  }

  await this.save({ validateBeforeSave: false });
};

// ✅ Clean up expired OTPs (optional - run via cron job)
userSchema.statics.cleanupExpiredOTPs = async function () {
  const result = await this.updateMany(
    {
      emailVerificationExpires: { $lt: Date.now() },
      isVerified: false,
    },
    {
      $unset: {
        emailVerificationOTP: "",
        emailVerificationExpires: "",
      },
    },
  );
  return result;
};

// ✅ Virtual to check if email is verified
userSchema.virtual("isEmailVerified").get(function () {
  return this.isVerified === true;
});

// ✅ Virtual to get verification status
userSchema.virtual("verificationStatus").get(function () {
  if (this.isVerified) return "verified";
  if (
    this.emailVerificationExpires &&
    Date.now() < this.emailVerificationExpires
  )
    return "pending";
  if (
    this.emailVerificationExpires &&
    Date.now() > this.emailVerificationExpires
  )
    return "expired";
  return "not_requested";
});

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// Virtuals
userSchema.virtual("fullProfile").get(function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    avatar: this.avatar,
    status: this.status,
    lastActive: this.lastActive,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
    currentStatus: this.currentStatus,
  };
});

userSchema.virtual("currentStatus").get(function () {
  if (!this.lastActive) return "offline";

  const inactiveTime = Date.now() - this.lastActive;

  // If user was active in last 5 minutes → consider online
  if (inactiveTime < 1 * 60 * 1000) {
    // 5 minutes
    return "online";
  } else {
    return "offline";
  }
});
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.emailVerificationOTP;
    delete ret.emailVerificationExpires;
    delete ret.verificationAttempts;
    delete ret.lastVerificationAttempt;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
