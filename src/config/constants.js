import dotenv from "dotenv"
dotenv.config({quiet: true})

export const MONGO_URI = process.env.MONGO_URI
export const PORT = process.env.PORT || 5001
export const NODE_ENV = process.env.NODE_ENV
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
export const JWT_EXPIRE = process.env.JWT_EXPIRE