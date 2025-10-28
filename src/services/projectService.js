// src/services/projectService.js
import { api } from "./api";

/**
 * Bật log nhanh bằng:  window.API_DEBUG = true
 * Tắt log:              window.API_DEBUG = false
 */
const logOn = () => typeof window !== "undefined" && window.API_DEBUG;

// 🔐 Token Cybersoft (bắt buộc xác thực với server)
const CYBERSOFT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCA4NSIsIkhldEhhblN0cmluZyI6IjExLzAyLzIwMjYiLCJIZXRIYW5UaW1lIjoiMTc3MDc2ODAwMDAwMCIsIm5iZiI6MTc0MzAxMjAwMCwiZXhwIjoxNzcwOTE5MjAwfQ._5a1o_PuNL8CuHuGdsi1TABKYJwuMsnG5uSKAILfaY8";

/* ===========================================================
   🧠 Helper: logging wrapper
   =========================================================== */
async function withLog(label, fn) {
  const t0 = performance.now();
  if (logOn()) console.groupCollapsed(`📡 ${label}`);
  try {
    const res = await fn();
    if (logOn()) {
      console.log("↳ status:", res.status);
      console.log("↳ url   :", res.config?.baseURL + res.config?.url);
      console.log("↳ method:", res.config?.method?.toUpperCase());
      if (res.config?.method !== "get")
        console.log("↳ payload:", res.config?.data);
      console.log("↳ data  :", res.data);
      console.log(`⏱️  time : ${(performance.now() - t0).toFixed(1)} ms`);
      console.groupEnd();
    }
    return res;
  } catch (err) {
    if (logOn()) {
      console.error("❌ error :", err?.response?.status, err?.response?.data);
      console.log(`⏱️  time : ${(performance.now() - t0).toFixed(1)} ms`);
      console.groupEnd();
    }
    throw err;
  }
}

/* ===========================================================
   🚀 Project Service – Giao tiếp với API Cybersoft
   =========================================================== */
export const projectService = {
  // 🟢 Lấy tất cả dự án (public)
  getAll: () =>
    withLog("GET  /Project/getAllProject", () =>
      api.get("/Project/getAllProject", {
        headers: { TokenCybersoft: CYBERSOFT_TOKEN },
      })
    ),

  // 🟢 Lấy chi tiết dự án
  getDetail: (id) =>
    withLog(`GET  /Project/getProjectDetail?id=${id}`, () =>
      api.get(`/Project/getProjectDetail`, {
        params: { id },
        headers: { TokenCybersoft: CYBERSOFT_TOKEN },
      })
    ),

  // 🟢 Lấy danh sách loại dự án (Category)
  getCategories: () =>
    withLog("GET  /ProjectCategory", () =>
      api.get("/ProjectCategory", {
        headers: { TokenCybersoft: CYBERSOFT_TOKEN },
      })
    ),

  // 🟢 Tạo mới dự án (Authorize)
  create: (data) =>
    withLog("POST /Project/createProjectAuthorize", () => {
      const token = localStorage.getItem("jira_token");
      return api.post("/Project/createProjectAuthorize", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          TokenCybersoft: CYBERSOFT_TOKEN,
        },
      });
    }),

  // 🟠 Cập nhật dự án (Authorize)
  update: (projectId, data) =>
    withLog(`PUT /Project/updateProject?projectId=${projectId}`, () => {
      const token = localStorage.getItem("jira_token");
      return api.put(`/Project/updateProject`, data, {
        params: { projectId },
        headers: {
          Authorization: `Bearer ${token}`,
          TokenCybersoft: CYBERSOFT_TOKEN,
        },
      });
    }),

  // 🔴 Xoá dự án (Authorize)
  delete: (projectId) =>
    withLog(`DELETE /Project/deleteProject?projectId=${projectId}`, () => {
      const token = localStorage.getItem("jira_token");
      return api.delete(`/Project/deleteProject`, {
        params: { projectId },
        headers: {
          Authorization: `Bearer ${token}`,
          TokenCybersoft: CYBERSOFT_TOKEN,
        },
      });
    }),

    // 🔎 Tìm user theo keyword (để assign)
  searchUsers: (keyword) =>
    withLog(`GET  /Users/getUser?keyword=${keyword || ""}`, () =>
      api.get("/Users/getUser", {
        params: { keyword },
        headers: { TokenCybersoft: CYBERSOFT_TOKEN },
      })
    ),

  // ➕ Gán user vào project
  assignUser: (projectId, userId) =>
    withLog("POST /Project/assignUserProject", () => {
      const token = localStorage.getItem("jira_token");
      return api.post(
        "/Project/assignUserProject",
        { projectId, userId },
        { headers: { Authorization: `Bearer ${token}`, TokenCybersoft: CYBERSOFT_TOKEN } }
      );
    }),

  // ➖ Gỡ user khỏi project
  removeUser: (projectId, userId) =>
    withLog("POST /Project/removeUserFromProject", () => {
      const token = localStorage.getItem("jira_token");
      return api.post(
        "/Project/removeUserFromProject",
        { projectId, userId },
        { headers: { Authorization: `Bearer ${token}`, TokenCybersoft: CYBERSOFT_TOKEN } }
      );
    }),
};
