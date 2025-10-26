import { api } from "./api";

export const projectService = {
  getAll: () => api.get("/Project/getAllProject"),
  getDetail: (id) => api.get(`/Project/getProjectDetail?id=${id}`),
  create: (data) => api.post("/Project/createProjectAuthorize", data),
  delete: (id) => api.delete(`/Project/deleteProject?id=${id}`),
};
