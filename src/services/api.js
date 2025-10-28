import axios from "axios";
import xhrAdapter from "axios/lib/adapters/xhr.js"; // 👈 ép Axios dùng XHR thay vì Fetch

// ⚙️ Thiết lập adapter
axios.defaults.adapter = xhrAdapter;

// 🚀 Tạo instance Axios mặc định
export const api = axios.create({
  baseURL: "https://jiranew.cybersoft.edu.vn/api",
  headers: {
    "Content-Type": "application/json",
    TokenCybersoft:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFeHBpcmVkIjoiMjUvMTIvMjAyNSAxMjo0NTowOCBBTSIsIkhvc3QiOiJodHRwczovL2ppcmFuZXcuY3liZXJzb2Z0LmVkdS52biIsIk5hbWUiOiJKaXJhIENsb25lIFN0dWRlbnQiLCJpYXQiOjE3MzI1MTgyOTgsImV4cCI6MTczMjUyNjA5OH0.QyPw5hLKMM-wfXy1CW7H0HH3f9JbED50VvhHcGMrCSs",
  },
});

// 🔐 Tự động thêm token Authorization nếu đã login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jira_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 🧭 Debug log hiển thị trong Console
  console.log("🚀 [REQUEST]", config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("✅ [RESPONSE]", res.status, res.config.url);
    return res;
  },
  (err) => {
    console.error("❌ [ERROR]", err.response?.status, err.response?.config?.url);
    return Promise.reject(err);
  }
);
console.log("⚙️ Axios Adapter đang dùng:", api.defaults.adapter?.name || "unknown");
