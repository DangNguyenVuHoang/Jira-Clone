// src/app/taskSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskService } from "../services/taskService";

// ===== Thunks =====
export const updateTaskStatus = createAsyncThunk(
  "task/updateStatus",
  async ({ taskId, statusId }) => {
    const res = await taskService.updateStatus({ taskId, statusId });
    return { taskId, statusId, server: res.data };
  }
);

export const updateTaskPriority = createAsyncThunk(
  "task/updatePriority",
  async ({ taskId, priorityId }) => {
    const res = await taskService.updatePriority({ taskId, priorityId });
    return { taskId, priorityId, server: res.data };
  }
);

export const updateTaskDescription = createAsyncThunk(
  "task/updateDescription",
  async ({ taskId, description }) => {
    const res = await taskService.updateDescription({ taskId, description });
    return { taskId, description, server: res.data };
  }
);

export const updateTaskTimeTracking = createAsyncThunk(
  "task/updateTimeTracking",
  async ({ taskId, timeTrackingSpent, timeTrackingRemaining }) => {
    const res = await taskService.updateTimeTracking({
      taskId,
      timeTrackingSpent,
      timeTrackingRemaining,
    });
    return { taskId, timeTrackingSpent, timeTrackingRemaining, server: res.data };
  }
);

export const updateTaskEstimate = createAsyncThunk(
  "task/updateEstimate",
  async ({ taskId, originalEstimate }) => {
    const res = await taskService.updateEstimate({ taskId, originalEstimate });
    return { taskId, originalEstimate, server: res.data };
  }
);

export const addComment = createAsyncThunk(
  "task/insertComment",
  async ({ taskId, contentComment }) => {
    const res = await taskService.insertComment({ taskId, contentComment });
    return { taskId, comment: res.data?.content || res.data };
  }
);

export const editComment = createAsyncThunk(
  "task/updateComment",
  async ({ id, contentComment }) => {
    const res = await taskService.updateComment({ id, contentComment });
    return { id, contentComment, server: res.data };
  }
);

export const removeComment = createAsyncThunk(
  "task/deleteComment",
  async ({ idComment }) => {
    await taskService.deleteComment({ idComment });
    return { idComment };
  }
);

// ===== Slice =====
const initialState = {
  activeTask: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setActiveTask(state, action) {
      state.activeTask = action.payload;
    },
    patchActiveTask(state, action) {
      if (!state.activeTask) return;
      state.activeTask = { ...state.activeTask, ...action.payload };
    },
    clearTaskState(state) {
      state.activeTask = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const start = (state) => {
      state.loading = true;
      state.error = null;
    };
    const fail = (state, action) => {
      state.loading = false;
      state.error = action.error?.message || "Lỗi không xác định";
    };

    // Status
    builder.addCase(updateTaskStatus.pending, start);
    builder.addCase(updateTaskStatus.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask?.taskId === payload.taskId) {
        state.activeTask.statusId = payload.statusId;
      }
    });
    builder.addCase(updateTaskStatus.rejected, fail);

    // Priority
    builder.addCase(updateTaskPriority.pending, start);
    builder.addCase(updateTaskPriority.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask?.taskId === payload.taskId) {
        state.activeTask.priorityId = payload.priorityId;
      }
    });
    builder.addCase(updateTaskPriority.rejected, fail);

    // Description
    builder.addCase(updateTaskDescription.pending, start);
    builder.addCase(updateTaskDescription.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask?.taskId === payload.taskId) {
        state.activeTask.description = payload.description;
      }
    });
    builder.addCase(updateTaskDescription.rejected, fail);

    // Time tracking
    builder.addCase(updateTaskTimeTracking.pending, start);
    builder.addCase(updateTaskTimeTracking.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask?.taskId === payload.taskId) {
        state.activeTask.timeTrackingSpent = payload.timeTrackingSpent;
        state.activeTask.timeTrackingRemaining = payload.timeTrackingRemaining;
      }
    });
    builder.addCase(updateTaskTimeTracking.rejected, fail);

    // Estimate
    builder.addCase(updateTaskEstimate.pending, start);
    builder.addCase(updateTaskEstimate.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask?.taskId === payload.taskId) {
        state.activeTask.originalEstimate = payload.originalEstimate;
      }
    });
    builder.addCase(updateTaskEstimate.rejected, fail);

    // Comment insert
    builder.addCase(addComment.pending, start);
    builder.addCase(addComment.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask) {
        const list = Array.isArray(state.activeTask.comments)
          ? state.activeTask.comments
          : [];
        state.activeTask.comments = [payload.comment, ...list];
      }
    });
    builder.addCase(addComment.rejected, fail);

    // Comment update
    builder.addCase(editComment.pending, start);
    builder.addCase(editComment.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask?.comments) {
        state.activeTask.comments = state.activeTask.comments.map((c) =>
          c.id === payload.id ? { ...c, contentComment: payload.contentComment } : c
        );
      }
    });
    builder.addCase(editComment.rejected, fail);

    // Comment delete
    builder.addCase(removeComment.pending, start);
    builder.addCase(removeComment.fulfilled, (state, { payload }) => {
      state.loading = false;
      if (state.activeTask?.comments) {
        state.activeTask.comments = state.activeTask.comments.filter(
          (c) => c.id !== payload.idComment
        );
      }
    });
    builder.addCase(removeComment.rejected, fail);
  },
});

export const { setActiveTask, patchActiveTask, clearTaskState } = taskSlice.actions;
export default taskSlice.reducer;