import express from "express"
import { registerUser } from "../controllers/auth/register-controller.js"
import { loginUser } from "../controllers/auth/login-controller.js"
import { resendVerificationOTP, verifyOtp } from "../controllers/auth/verifyotp-controller.js"

const router = express.Router()

router.get("/", (req, res) => {
    res.send("This is Auth route")
})

router.post("/register", registerUser)
router.post("/login", loginUser)

router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendVerificationOTP)

export default router