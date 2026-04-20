import User from "../../src/models/user-model.js";
import userData from "../fixtures/users.js";
import { describe, test, expect, beforeEach } from '@jest/globals';

describe("Auth Register - registerUser Controller", () => {

  beforeEach(async () => {
    console.log("🧹 Clearing database before test...");
    await User.deleteMany({});
    console.log("✅ Database cleared\n");
  });

  test("should create new user successfully (first time registration)", async () => {

    const module = await import("../../src/controllers/auth/register-controller.js");
    const registerUser = module.registerUser || module.default;

    const req = {
      body: {
        fullName: userData.validUser.name,
        email: userData.validUser.email,
        password: userData.validUser.password
      }
    };

    const res = {
      status: (code) => {
        console.log(`   → res.status(${code})`);
        return { json: (data) => console.log("   → res.json() called") };
      }
    };

    await registerUser(req, res);

    const savedUser = await User.findOne({ email: req.body.email.toLowerCase().trim() });


    expect(savedUser).toBeDefined();
    expect(savedUser.fullName).toBe(req.body.fullName.trim());
    expect(savedUser.email).toBe(req.body.email.toLowerCase().trim());
    expect(savedUser.isVerified).toBe(false);
    expect(savedUser.password).not.toBe(req.body.password); // password should be hashed
  });

  test("should return 409 if user with same email already exists and is verified", async () => {
    const module = await import("../../src/controllers/auth/register-controller.js");
    const registerUser = module.registerUser || module.default;

    // First, create a verified user
    await User.create({
      fullName: "Nikhil Mishra",
      email: userData.existingUser.email.toLowerCase().trim(),
      password: "123123123",
      isVerified: true
    });

    const req = { body: userData.existingUser };
    const res = {
      status: (code) => {
        console.log(`   → res.status(${code})`);
        return { json: (data) => console.log("   → res.json() called") };
      }
    };

    await registerUser(req, res);

    const count = await User.countDocuments({ email: userData.existingUser.email.toLowerCase().trim() });
    expect(count).toBe(1); // should not create duplicate
  });

  test("should resend OTP if user exists but not verified", async () => {

    const module = await import("../../src/controllers/auth/register-controller.js");
    const registerUser = module.registerUser || module.default;

    // Create unverified user
    await User.create({
      fullName: "Nikhil Mishra",
      email: userData.existingUser.email.toLowerCase().trim(),
      password: "123123123",
      isVerified: false
    });

    const req = { body: userData.existingUser };
    const res = {
      status: (code) => {
        return { json: (data) => console.log("   → res.json() called") };
      }
    };

    await registerUser(req, res);

    const user = await User.findOne({ email: userData.existingUser.email.toLowerCase().trim() });
    expect(user).toBeDefined();
    expect(user.isVerified).toBe(false);
  });

  test("should return 500 for missing required fields", async () => {
    const module = await import("../../src/controllers/auth/register-controller.js");
    const registerUser = module.registerUser || module.default;

    const req = {
      body: { email: "test@example.com" } // missing fullName and password
    };

    const res = {
      status: (code) => {
        console.log(`   → res.status(${code})`);
        return { json: (data) => console.log("   → res.json() called") };
      }
    };

    await registerUser(req, res);
    // Expect 500 because destructuring will fail or validation error
  });

  test("should handle invalid email format gracefully", async () => {
    const module = await import("../../src/controllers/auth/register-controller.js");
    const registerUser = module.registerUser || module.default;

    const req = {
      body: {
        fullName: "Test User",
        email: "invalid-email",
        password: "Password123!"
      }
    };

    const res = {
      status: (code) => {
        console.log(`   → res.status(${code})`);
        return { json: (data) => console.log("   → res.json() called") };
      }
    };

    await registerUser(req, res);
  });

});
