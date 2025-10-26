import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { projectService } from "../services/projectService";

// 🟢 Lấy tất cả dự án
export const fetchProjects = createAsyncThunk(
  "project/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await projectService.getAll();
      return res.data.content;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
    }
  }
);

// 🟢 Tạo dự án mới (authorize)
export const createProject = createAsyncThunk(
  "project/create",
  async (form, { rejectWithValue }) => {
    try {
      const res = await projectService.create(form);
      return res.data.content;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create project");
    }
  }
);

// 🟢 Xoá dự án
export const deleteProjectAPI = createAsyncThunk(
  "project/delete",
  async (id, { rejectWithValue }) => {
    try {
      await projectService.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete project");
    }
  }
);

// 🧱 Slice
const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== Fetch =====
      .addCase(fetchProjects.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProjects.fulfilled, (s, a) => {
        s.loading = false;
        s.projects = a.payload;
      })
      .addCase(fetchProjects.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ===== Create =====
      .addCase(createProject.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createProject.fulfilled, (s, a) => {
        s.loading = false;
        s.projects.push(a.payload);
      })
      .addCase(createProject.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ===== Delete =====
      .addCase(deleteProjectAPI.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteProjectAPI.fulfilled, (s, a) => {
        s.loading = false;
        s.projects = s.projects.filter((p) => p.id !== a.payload);
      })
      .addCase(deleteProjectAPI.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export default projectSlice.reducer;
