import axios from "axios";

// 🔹 Base URL (API thật)
export const api = axios.create({
  baseURL: "https://jiranew.cybersoft.edu.vn/api",
  headers: {
    "Content-Type": "application/json",
    TokenCybersoft:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFeHBpcmVkIjoiMjUvMTIvMjAyNSAxMjo0NTowOCBBTSIsIkhvc3QiOiJodHRwczovL2ppcmFuZXcuY3liZXJzb2Z0LmVkdS52biIsIk5hbWUiOiJKaXJhIENsb25lIFN0dWRlbnQiLCJpYXQiOjE3MzI1MTgyOTgsImV4cCI6MTczMjUyNjA5OH0.QyPw5hLKMM-wfXy1CW7H0HH3f9JbED50VvhHcGMrCSs", // 🔸 token mặc định Cybersoft
  },
});

// 🔹 Thêm token Authorization nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jira_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
