import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { issueService } from "../services/issueService";

// 🟢 Lấy danh sách task của 1 project
export const fetchIssues = createAsyncThunk(
  "issue/fetchAll",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await issueService.getByProject(projectId);
      return { projectId, data: res.data.content.lstTask };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải danh sách task"
      );
    }
  }
);

// 🟢 Tạo task mới
export const createIssue = createAsyncThunk(
  "issue/create",
  async (form, { rejectWithValue }) => {
    try {
      const res = await issueService.create(form);
      return res.data.content;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tạo task mới"
      );
    }
  }
);

// 🟢 Cập nhật trạng thái task
export const updateIssueStatus = createAsyncThunk(
  "issue/updateStatus",
  async ({ taskId, statusId }, { rejectWithValue }) => {
    try {
      const res = await issueService.updateStatus(taskId, statusId);
      return res.data.content;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể cập nhật trạng thái task"
      );
    }
  }
);

// 🟢 Xoá task
export const deleteIssueAPI = createAsyncThunk(
  "issue/delete",
  async (taskId, { rejectWithValue }) => {
    try {
      await issueService.delete(taskId);
      return taskId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể xoá task"
      );
    }
  }
);

// 🧱 Slice Redux
const issueSlice = createSlice({
  name: "issue",
  initialState: {
    issues: {}, // lưu theo projectId: { [projectId]: [listTask] }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== FETCH =====
      .addCase(fetchIssues.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchIssues.fulfilled, (s, a) => {
        s.loading = false;
        s.issues[a.payload.projectId] = a.payload.data;
      })
      .addCase(fetchIssues.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ===== CREATE =====
      .addCase(createIssue.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createIssue.fulfilled, (s, a) => {
        s.loading = false;
        const projId = a.payload.projectId;
        if (!s.issues[projId]) s.issues[projId] = [];
        s.issues[projId].push(a.payload);
      })
      .addCase(createIssue.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ===== UPDATE =====
      .addCase(updateIssueStatus.fulfilled, (s, a) => {
        const updatedTask = a.payload;
        for (const proj in s.issues) {
          const idx = s.issues[proj]?.findIndex((t) => t.taskId === updatedTask.taskId);
          if (idx >= 0) {
            s.issues[proj][idx] = updatedTask;
          }
        }
      })

      // ===== DELETE =====
      .addCase(deleteIssueAPI.fulfilled, (s, a) => {
        for (const proj in s.issues) {
          s.issues[proj] = s.issues[proj].filter((t) => t.taskId !== a.payload);
        }
      });
  },
});

export default issueSlice.reducer;
