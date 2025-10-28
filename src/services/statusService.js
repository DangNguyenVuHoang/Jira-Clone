// src/services/statusService.js
import { api } from "./api";

const CYBERSOFT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCA4NSIsIkhldEhhblN0cmluZyI6IjExLzAyLzIwMjYiLCJIZXRIYW5UaW1lIjoiMTc3MDc2ODAwMDAwMCIsIm5iZiI6MTc0MzAxMjAwMCwiZXhwIjoxNzcwOTE5MjAwfQ._5a1o_PuNL8CuHuGdsi1TABKYJwuMsnG5uSKAILfaY8";

export const statusService = {
  // API Cybersoft thường là /Status/getAll
  getAll: () =>
    api.get("/Status/getAll", {
      headers: { TokenCybersoft: CYBERSOFT_TOKEN },
    }),
};
