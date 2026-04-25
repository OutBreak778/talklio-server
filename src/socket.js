import { io } from "socket.io-client";

// 🔥 put a REAL JWT token here (from your login API)
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTYwMDAzZDVmOGI0YTFmZDQ3MzlmNCIsImVtYWlsIjoib3V0YnJlYWs3NzhAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzcxMTY4MTIsImV4cCI6MTc3NzcyMTYxMn0.guy9BuTf_nQ211sVB_ctxQ-OZS3rHZN26IidN9RUx54";

const socket = io("http://localhost:5000", {
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection failed:", err.message);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});