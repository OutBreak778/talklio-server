import { io } from "socket.io-client";

// 🔥 put a REAL JWT token here (from your login API)
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTc1NmIzNzU0NTViNWMwYzM4YTZjYSIsImVtYWlsIjoibWlzaHJhbi4yMDAzQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzc3MTE3Nzk0LCJleHAiOjE3Nzc3MjI1OTR9.EeaqdwJH1AA8EQXBv8xoAHrOG-ZJxhOTdwKMVufulLU";

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