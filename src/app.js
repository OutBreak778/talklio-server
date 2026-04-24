import express from "express"
import logger from "./utils/logger.js"
import dotenv from "dotenv"
import authRoute from "./routes/auth-route.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
dotenv.config({
  path: "./.env",
})

app.set('trust proxy', 1);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/auth", authRoute)

export {app}