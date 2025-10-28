import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { projectService } from "../services/projectService";

/* ===============================
   🟢 Fetch all projects
   =============================== */
export const fetchProjects = createAsyncThunk(
  "project/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await projectService.getAll();
      console.log("📦 [fetchProjects] response:", res.data);
      return res.data.content || [];
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch projects";
      console.error("❌ [fetchProjects] error:", msg);
      return rejectWithValue(msg);
    }
  }
);

/* ===============================
   🟢 Create new project
   =============================== */
export const createProject = createAsyncThunk(
  "project/create",
  async (form, { rejectWithValue }) => {
    try {
      const res = await projectService.create(form);
      console.log("✅ [createProject] success:", res.data);
      return res.data.content;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create project";
      console.error("❌ [createProject] error:", msg);
      return rejectWithValue(msg);
    }
  }
);

/* ===============================
   🟠 Update project
   =============================== */
export const updateProjectAPI = createAsyncThunk(
  "project/update",
  async ({ id, form }, { rejectWithValue }) => {
    try {
      const res = await projectService.update(id, form);
      console.log("✏️  [updateProject] success:", res.data);
      return res.data.content; // backend trả về project đã cập nhật
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update project";
      console.error("❌ [updateProject] error:", msg);
      return rejectWithValue(msg);
    }
  }
);

/* ===============================
   🔴 Delete project
   =============================== */
export const deleteProjectAPI = createAsyncThunk(
  "project/delete",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await projectService.delete(projectId);
      console.log("🗑️ [deleteProject] success:", res.data);
      return projectId;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete project";
      console.error("❌ [deleteProject] error:", msg);
      return rejectWithValue(msg);
    }
  }
);

/* ===============================
   ➕ Assign user to project
   =============================== */
export const assignUserToProject = createAsyncThunk(
  "project/assignUser",
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const res = await projectService.assignUser(projectId, userId);
      return { projectId, userId, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to assign user"
      );
    }
  }
);

/* ===============================
   ➖ Remove user from project
   =============================== */
export const removeUserFromProject = createAsyncThunk(
  "project/removeUser",
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const res = await projectService.removeUser(projectId, userId);
      return { projectId, userId, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove user"
      );
    }
  }
);

/* ===============================
   🧱 Slice
   =============================== */
const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProjectError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== Fetch ===== */
      .addCase(fetchProjects.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProjects.fulfilled, (s, a) => {
        s.loading = false;
        s.projects = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchProjects.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ===== Create ===== */
      .addCase(createProject.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createProject.fulfilled, (s, a) => {
        s.loading = false;
        if (a.payload && !s.projects.some((p) => p.id === a.payload.id)) {
          s.projects.push(a.payload);
        }
      })
      .addCase(createProject.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ===== Update ===== */
      .addCase(updateProjectAPI.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateProjectAPI.fulfilled, (s, a) => {
        s.loading = false;
        const updated = a.payload;
        if (!updated) return;
        s.projects = s.projects.map((p) =>
          p.id === updated.id ? { ...p, ...updated } : p
        );
      })
      .addCase(updateProjectAPI.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ===== Delete ===== */
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
      })

      /* ===== Assign user ===== */
      .addCase(assignUserToProject.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(assignUserToProject.fulfilled, (s, a) => {
        s.loading = false;
        const { projectId, userId } = a.payload || {};
        const proj = s.projects.find((p) => p.id === projectId);
        if (!proj) return;

        // Optimistic update: thêm user placeholder nếu chưa có
        if (!Array.isArray(proj.members)) proj.members = [];
        const exists = proj.members.some((m) => m.userId === userId);
        if (!exists) {
          proj.members.push({
            userId,
            name: "New member",
            avatar: `https://ui-avatars.com/api/?name=U${userId}`,
          });
        }
      })
      .addCase(assignUserToProject.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ===== Remove user ===== */
      .addCase(removeUserFromProject.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(removeUserFromProject.fulfilled, (s, a) => {
        s.loading = false;
        const { projectId, userId } = a.payload || {};
        const proj = s.projects.find((p) => p.id === projectId);
        if (!proj || !Array.isArray(proj.members)) return;
        proj.members = proj.members.filter((m) => m.userId !== userId);
      })
      .addCase(removeUserFromProject.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
