import express from "express"
import { registerUser } from "../controllers/auth/register-controller.js"
import { loginUser } from "../controllers/auth/login-controller.js"
import { resendVerificationOTP, verifyOtp } from "../controllers/auth/verifyotp-controller.js"
import { generalLimiter, loginLimiter, registerLimiter } from "../middleware/rateLimiter.js"

const router = express.Router()

router.get("/", (req, res) => {
    res.send("This is Auth route")
})

router.post("/register", registerLimiter, registerUser)
router.post("/login", loginLimiter, loginUser)

router.post("/verify-otp", generalLimiter, verifyOtp)
router.post("/resend-otp", generalLimiter, resendVerificationOTP)

export default router