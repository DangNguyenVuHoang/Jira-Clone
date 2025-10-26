import { api } from "./api";

export const issueService = {
  // 🔹 Lấy task theo project ID
  getByProject: (projectId) =>
    api.get(`/Project/getTaskDetailByProjectId?id=${projectId}`),

  // 🔹 Tạo task mới
  create: (data) => api.post("/Project/createTask", data),

  // 🔹 Cập nhật trạng thái task
  updateStatus: (taskId, statusId) =>
    api.put("/Project/updateStatus", { taskId, statusId }),

  // 🔹 Xoá task
  delete: (taskId) => api.delete(`/Project/removeTask?taskId=${taskId}`),
};
