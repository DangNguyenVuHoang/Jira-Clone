// src/services/taskService.js
import { api } from "./api";

const CYBERSOFT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCA4NSIsIkhldEhhblN0cmluZyI6IjExLzAyLzIwMjYiLCJIZXRIYW5UaW1lIjoiMTc3MDc2ODAwMDAwMCIsIm5iZiI6MTc0MzAxMjAwMCwiZXhwIjoxNzcwOTE5MjAwfQ._5a1o_PuNL8CuHuGdsi1TABKYJwuMsnG5uSKAILfaY8";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jira_token") || ""}`,
  TokenCybersoft: CYBERSOFT_TOKEN,
});

// ... các hàm đã có: getProjectDetail, createTask, updateStatus, getStatuses, getPriorities, getTaskTypes, assignUserTask, removeUserFromTask

export const taskService = {
  // giữ nguyên các hàm có sẵn ở bản bạn đang dùng
  getProjectDetail: (projectId) =>
    api.get("/Project/getProjectDetail", {
      params: { id: projectId },
      headers: { TokenCybersoft: CYBERSOFT_TOKEN },
    }),

  createTask: (payload) =>
    api.post("/Project/createTask", payload, { headers: authHeaders() }),

  updateStatus: ({ taskId, statusId }) =>
    api.put(
      "/Project/updateStatus",
      { taskId, statusId },
      { headers: authHeaders() }
    ),
  
  // 🆕 1) GET task detail
  getTaskDetail: (taskId) =>
    api.get("/Project/getTaskDetail", {
      params: { taskId },
      headers: { TokenCybersoft: CYBERSOFT_TOKEN },
    }),

  // 🆕 2) UPDATE task
  updateTask: (payload) =>
    api.post("/Project/updateTask", payload, { headers: authHeaders() }),

  // 🆕 3) REMOVE task
  removeTask: (taskId) =>
    api.delete("/Project/removeTask", {
      params: { taskId },
      headers: authHeaders(),
    }),

  // đã có 4) REMOVE user khỏi task (để rõ ràng ghi lại)
  removeUserFromTask: ({ taskId, userId }) =>
    api.post(
      "/Project/removeUserFromTask",
      { taskId, userId },
      { headers: authHeaders() }
    ),

  // đã có ASSIGN user vào task
  assignUserTask: ({ taskId, userId }) =>
    api.post(
      "/Project/assignUserTask",
      { taskId, userId },
      { headers: authHeaders() }
    ),

  getStatuses: () =>
    api.get("/Status/getAll", { headers: { TokenCybersoft: CYBERSOFT_TOKEN } }),

  getPriorities: () =>
    api.get("/Priority/getAll", {
      params: { id: 0 },
      headers: { TokenCybersoft: CYBERSOFT_TOKEN },
    }),

  getTaskTypes: () =>
    api.get("/TaskType/getAll", {
      headers: { TokenCybersoft: CYBERSOFT_TOKEN },
    }),

// Các hàm cập nhật khác
  updatePriority: ({ taskId, priorityId }) =>
    api.put(
      "/Project/updatePriority",
      { taskId, priorityId }, // LƯU Ý: không có dấu phẩy thừa ở cuối!
      {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      }
    ),

  updateDescription: ({ taskId, description }) =>
    api.put("/Task/updateDescription", { taskId, description }),

  updateTimeTracking: ({ taskId, timeTrackingSpent, timeTrackingRemaining }) =>
    api.put("/Task/updateTimeTracking", {
      taskId,
      timeTrackingSpent,
      timeTrackingRemaining,
    }),

  updateEstimate: ({ taskId, originalEstimate }) =>
    api.put("/Task/updateEstimate", { taskId, originalEstimate }),

    // ===== Comments =====
  insertComment: ({ taskId, contentComment }) =>
    api.post("/Comment/insertComment", { taskId, contentComment }),

    // Lấy tất cả comment theo taskId (GET /Comment/getAll?taskId=...)
  getComments: (taskId) =>
    api.get("/Comment/getAll", { params: { taskId } }),
  // Sửa comment: theo cURL yêu cầu dùng query params id & contentComment
  updateComment: ({ id, contentComment }) =>
    api.put("/Comment/updateComment", null, {
      params: { id, contentComment },
    }),

  deleteComment: ({ idComment }) =>
    api.delete(`/Comment/deleteComment?idComment=${idComment}`),
};
