import Express from "express"
import { userProtect } from "../middleware/auth.js"
import { getProfile } from "../controllers/users/profile-controller.js"

const router = Express.Router()

router.get("/profile/me", userProtect, getProfile)

export default router