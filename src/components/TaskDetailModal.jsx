// src/components/TaskDetailModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { taskService } from "../services/taskService";
import { Editor } from "@tinymce/tinymce-react";
import { FiX, FiTrash2, FiSave } from "react-icons/fi";

const priorityTone = (id) => {
  const map = {
    1: "bg-red-100 text-red-700 border-red-200",
    2: "bg-orange-100 text-orange-700 border-orange-200",
    3: "bg-yellow-100 text-yellow-700 border-yellow-200",
    4: "bg-green-100 text-green-700 border-green-200",
  };
  return map[id] || "bg-gray-100 text-gray-700 border-gray-200";
};

export default function TaskDetailModal({
  project,
  taskId,
  onClose,
  onUpdated,
  onRemoved,
}) {
  const editorRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [task, setTask] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);

  const [labels, setLabels] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyPoint, setStoryPoint] = useState("");

  // Comments
  const [comments, setComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState("");

  const members = useMemo(() => project?.members || [], [project]);

  // ===== Fetch =====
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [detailRes, s, p, tt, cmtRes] = await Promise.all([
          taskService.getTaskDetail(taskId),
          taskService.getStatuses(),
          taskService.getPriorities(),
          taskService.getTaskTypes(),
          taskService.getComments(taskId),
        ]);
        if (!mounted) return;
        const detail = detailRes?.data?.content || null;
        setTask(detail);
        setStatuses(s?.data?.content || []);
        setPriorities(p?.data?.content || []);
        setTaskTypes(tt?.data?.content || []);
        setComments(cmtRes?.data?.content || []);
        setTimeout(() => {
          if (editorRef.current && detail?.description != null) {
            editorRef.current.setContent(detail.description || "<p></p>");
          }
        }, 0);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [taskId]);

  const assigneeIds = new Set(
    (task?.assigness || []).map((u) => u.id ?? u.userId)
  );

  // ===== Helper: gộp patch về updateTask =====
  const updateTaskPartial = async (patch = {}) => {
    const listUserAssign = (task.assigness || []).map((u) => u.id ?? u.userId);
    const payload = {
      taskId: task.taskId,
      taskName: patch.taskName ?? task.taskName,
      description:
        patch.description ??
        (editorRef.current?.getContent() || task.description || ""),
      statusId: String(patch.statusId ?? task.statusId),
      originalEstimate: Number(
        patch.originalEstimate ?? task.originalEstimate ?? 0
      ),
      timeTrackingSpent: Number(
        patch.timeTrackingSpent ?? task.timeTrackingSpent ?? 0
      ),
      timeTrackingRemaining: Number(
        patch.timeTrackingRemaining ?? task.timeTrackingRemaining ?? 0
      ),
      projectId: Number(task.projectId ?? project?.id),
      typeId: Number(patch.typeId ?? task.typeId),
      priorityId: Number(patch.priorityId ?? task.priorityId),
      listUserAssign,
    };
    await taskService.updateTask(payload);
  };

  // ===== Assignee add/remove =====
  const toggleAssignee = async (userId) => {
    if (!task) return;
    const existed = assigneeIds.has(userId);

    if (existed) {
      const prev = task.assigness || [];
      setTask((t) => ({
        ...t,
        assigness: prev.filter((u) => (u.id ?? u.userId) !== userId),
      }));
      try {
        await taskService.removeUserFromTask({ taskId, userId });
      } catch {
        setTask((t) => ({ ...t, assigness: prev }));
        alert("Gỡ người dùng khỏi task thất bại!");
      }
    } else {
      const prev = task.assigness || [];
      const m = members.find((x) => x.userId === userId);
      const optimistic = [
        ...prev,
        { id: userId, userId, name: m?.name, avatar: m?.avatar },
      ];
      setTask((t) => ({ ...t, assigness: optimistic }));
      try {
        await taskService.assignUserTask({ taskId, userId });
      } catch {
        setTask((t) => ({ ...t, assigness: prev }));
        alert("Thêm người dùng vào task thất bại!");
      }
    }
  };

  // ===== Field handlers (dùng updateTask) =====
  const handleChangeStatus = async (statusId) => {
    if (!task) return;
    const prev = task.statusId;
    setTask((t) => ({ ...t, statusId }));
    try {
      await updateTaskPartial({ statusId });
    } catch (e) {
      setTask((t) => ({ ...t, statusId: prev }));
      alert(e?.response?.data?.message || "Cập nhật trạng thái thất bại!");
    }
  };

  const handleChangePriority = async (priorityId) => {
    if (!task) return;
    const prev = task.priorityId;
    setTask((t) => ({ ...t, priorityId }));
    try {
      await updateTaskPartial({ priorityId: Number(priorityId) });
    } catch (e) {
      setTask((t) => ({ ...t, priorityId: prev }));
      alert(e?.response?.data?.message || "Cập nhật độ ưu tiên thất bại!");
    }
  };

  const saveDescriptionOnly = async () => {
    if (!task) return;
    const html = editorRef.current?.getContent() || "";
    const prev = task.description;
    setTask((t) => ({ ...t, description: html }));
    try {
      await updateTaskPartial({ description: html });
      if (editorRef.current) editorRef.current.setContent(html);
    } catch (e) {
      setTask((t) => ({ ...t, description: prev }));
      if (editorRef.current) editorRef.current.setContent(prev || "<p></p>");
      alert(e?.response?.data?.message || "Lưu mô tả thất bại!");
    }
  };

  const saveEstimate = async () => {
    if (!task) return;
    const val = Math.max(0, parseInt(task.originalEstimate || 0, 10) || 0);
    setTask((t) => ({ ...t, originalEstimate: val }));
    try {
      await updateTaskPartial({ originalEstimate: val });
    } catch (e) {
      alert(e?.response?.data?.message || "Cập nhật Estimate thất bại!");
    }
  };

  const saveTimeTracking = async () => {
    if (!task) return;
    const spent = Math.max(0, parseInt(task.timeTrackingSpent || 0, 10) || 0);
    const remaining = Math.max(
      0,
      parseInt(task.timeTrackingRemaining || 0, 10) || 0
    );
    setTask((t) => ({
      ...t,
      timeTrackingSpent: spent,
      timeTrackingRemaining: remaining,
    }));
    try {
      await updateTaskPartial({
        timeTrackingSpent: spent,
        timeTrackingRemaining: remaining,
      });
    } catch (e) {
      alert(e?.response?.data?.message || "Cập nhật Time Tracking thất bại!");
    }
  };

  // ===== Comments =====
  const refreshComments = async () => {
    try {
      const res = await taskService.getComments(taskId);
      setComments(res?.data?.content || []);
    } catch (e) {
      console.warn("Refresh comments failed", e);
    }
  };

  const addComment = async () => {
    const contentComment = (commentDraft || "").trim();
    if (!contentComment) return;
    try {
      await taskService.insertComment({ taskId, contentComment });
      setCommentDraft("");
      await refreshComments();
    } catch (e) {
      alert(e?.response?.data?.message || "Thêm bình luận thất bại!");
    }
  };

  const updateCommentById = async (id, nextText) => {
    const contentComment = (nextText || "").trim();
    if (!id) return;
    const prev = comments;
    setComments((list) =>
      list.map((c) =>
        (c.id ?? c.idComment) === id
          ? { ...c, contentComment, content: contentComment }
          : c
      )
    );
    try {
      await taskService.updateComment({ id, contentComment });
      await refreshComments();
    } catch (e) {
      setComments(prev);
      alert(e?.response?.data?.message || "Sửa bình luận thất bại!");
    }
  };

  const deleteComment = async (c) => {
    const idComment = c.idComment ?? c.id;
    const prev = comments;
    setComments(prev.filter((x) => (x.id ?? x.idComment) !== idComment));
    try {
      await taskService.deleteComment({ idComment });
    } catch (e) {
      setComments(prev);
      alert(e?.response?.data?.message || "Xoá bình luận thất bại!");
    }
  };

  // ===== Save all =====
  const save = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const listUserAssign = (task.assigness || []).map(
        (u) => u.id ?? u.userId
      );
      await taskService.updateTask({
        taskId: task.taskId,
        taskName: task.taskName,
        description: editorRef.current?.getContent() || task.description || "",
        statusId: String(task.statusId),
        originalEstimate: task.originalEstimate ?? 0,
        timeTrackingSpent: task.timeTrackingSpent ?? 0,
        timeTrackingRemaining: task.timeTrackingRemaining ?? 0,
        projectId: Number(project.id),
        typeId: Number(task.typeId),
        priorityId: Number(task.priorityId),
        listUserAssign,
      });
      onUpdated?.();
      onClose();
    } catch (e) {
      alert(e?.response?.data?.message || "Cập nhật task thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Bạn chắc chắn muốn xoá task này?")) return;
    setRemoving(true);
    try {
      await taskService.removeTask(taskId);
      onRemoved?.();
      onClose();
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá task thất bại!");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6">
          Đang tải task...
        </div>
      </div>
    );
  }
  if (!task) return null;

  const assigneeIdsMemo = assigneeIds;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-[95vw] md:max-w-4xl lg:max-w-6xl rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-3 sm:px-5 md:px-6 py-3 md:py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[11px] sm:text-xs md:text-sm px-2 py-1 rounded border bg-blue-50 text-blue-700 border-blue-200">
              #{task.taskId}
            </span>
            <input
              value={task.taskName || ""}
              onChange={(e) =>
                setTask((t) => ({ ...t, taskName: e.target.value }))
              }
              className="flex-1 min-w-0 text-sm sm:text-base md:text-lg font-semibold text-gray-800 border rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
              placeholder="Task name"
            />
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={remove}
              disabled={removing}
              className="hidden md:inline-flex px-3 py-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
            >
              <FiTrash2 className="mr-1" />{" "}
              {removing ? "Removing..." : "Remove"}
            </button>
            {/* <button
              onClick={save}
              disabled={saving}
              className={`px-3 py-2 rounded-md text-white flex items-center ${
                saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FiSave className="mr-1" /> {saving ? "Saving..." : "Save"}
            </button> */}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 sm:px-5 md:px-6 py-4 md:py-5 max-h-[90vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* LEFT */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="text-xs sm:text-sm text-gray-600">
                  Status
                </label>
                <select
                  value={task.statusId}
                  onChange={(e) => handleChangeStatus(e.target.value)}
                  className="w-full sm:w-auto border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((s) => (
                    <option key={s.statusId} value={s.statusId}>
                      {s.statusName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <section>
                <h3 className="text-sm md:text-base font-semibold mb-2">
                  Description
                </h3>
                <Editor
                  apiKey="wv8f190u7jmh5z7ytex8e74q6gbmp76nbnsrl3renxmmkco5"
                  onInit={(_, editor) => (editorRef.current = editor)}
                  initialValue={task.description || "<p></p>"}
                  init={{
                    height: 240,
                    menubar: false,
                    plugins:
                      "advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime table",
                    toolbar:
                      "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat",
                    branding: false,
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <button
                    onClick={saveDescriptionOnly}
                    className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                  >
                    <FiSave className="mr-1" /> Save description
                  </button>
                </div>
              </section>

              {/* Comments */}
              <section>
                <h3 className="text-sm md:text-base font-semibold mb-2">
                  Comments
                </h3>
                <div className="flex gap-2">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addComment();
                    }}
                  />
                  <button
                    onClick={addComment}
                    className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Gửi
                  </button>
                </div>
                <ul className="mt-3 space-y-2">
                  {comments.length === 0 && (
                    <li className="text-xs text-gray-500 italic">
                      Chưa có bình luận
                    </li>
                  )}
                  {comments.map((c) => (
                    <CommentRow
                      key={c.id ?? c.idComment}
                      c={c}
                      onChange={(nextText) =>
                        updateCommentById(c.id ?? c.idComment, nextText)
                      }
                      onDelete={() => deleteComment(c)}
                    />
                  ))}
                </ul>
              </section>
            </div>

            {/* RIGHT – Details */}
            <aside className="space-y-4">
              <div className="rounded-xl border bg-white p-3 sm:p-4 space-y-3 overflow-hidden">
                <h4 className="text-sm md:text-base font-semibold">Details</h4>

                {/* Assignee */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Assignee</div>
                  {members.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
                      {members.map((m) => {
                        const checked = assigneeIdsMemo.has(m.userId);
                        return (
                          <label
                            key={m.userId}
                            className={`flex items-center gap-2 border rounded-lg px-2 py-1.5 cursor-pointer ${
                              checked
                                ? "bg-blue-50 border-blue-300"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAssignee(m.userId)}
                            />
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm truncate">{m.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Chưa có thành viên trong project
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Priority</div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <select
                      value={task.priorityId}
                      onChange={(e) => handleChangePriority(e.target.value)}
                      className="w-full sm:w-auto border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {priorities.map((p) => (
                        <option key={p.priorityId} value={p.priorityId}>
                          {p.priority}
                        </option>
                      ))}
                    </select>
                    <span
                      className={
                        "inline-block w-fit text-xs px-2 py-1 rounded border " +
                        priorityTone(Number(task.priorityId))
                      }
                    >
                      {priorities.find(
                        (x) => String(x.priorityId) === String(task.priorityId)
                      )?.priority || "—"}
                    </span>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Type</div>
                  <select
                    value={task.typeId}
                    onChange={(e) =>
                      setTask((t) => ({ ...t, typeId: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {taskTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.taskType}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time tracking / Estimate (wrap-friendly) */}
                <div className="space-y-3">
                  {/* Original estimate */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Original estimate
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={String(task.originalEstimate ?? 0)}
                        onChange={(e) => {
                          const digits = (e.target.value || "").replace(
                            /\D/g,
                            ""
                          );
                          setTask((t) => ({
                            ...t,
                            originalEstimate: parseInt(digits || "0", 10),
                          }));
                        }}
                        onBlur={saveEstimate}
                        className="w-24 sm:w-28 border rounded-lg px-2 py-1.5 text-sm"
                      />
                      <span className="text-sm text-gray-500 shrink-0">h</span>
                      <div className="hidden sm:block flex-1 min-w-0">
                        <div className="text-xs text-gray-500 truncate">
                          Estimate:{" "}
                          {Math.max(
                            0,
                            parseInt(task.originalEstimate || 0, 10) || 0
                          )}
                          h
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spent & Remaining (Remaining xuống dòng riêng) */}
                  <div className="space-y-3">
                    {/* Spent control */}
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                      <button
                        className="px-2 py-1 text-sm rounded hover:bg-gray-100"
                        onClick={() =>
                          setTask((t) => ({
                            ...t,
                            timeTrackingSpent: Math.max(
                              0,
                              (parseInt(t.timeTrackingSpent || 0, 10) || 0) - 1
                            ),
                          }))
                        }
                        title="Decrease 1h"
                      >
                        -1h
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={String(task.timeTrackingSpent ?? 0)}
                        onChange={(e) => {
                          const digits = (e.target.value || "").replace(
                            /\D/g,
                            ""
                          );
                          setTask((t) => ({
                            ...t,
                            timeTrackingSpent: parseInt(digits || "0", 10),
                          }));
                        }}
                        onBlur={saveTimeTracking}
                        className="w-24 sm:w-28 text-sm px-2 py-1"
                      />
                      <button
                        className="px-2 py-1 text-sm rounded hover:bg-gray-100"
                        onClick={() =>
                          setTask((t) => ({
                            ...t,
                            timeTrackingSpent:
                              (parseInt(t.timeTrackingSpent || 0, 10) || 0) + 1,
                          }))
                        }
                        title="Increase 1h"
                      >
                        +1h
                      </button>
                    </div>

                    {/* Remaining + Sync (luôn xuống dòng riêng) */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 justify-start">
                      <div className="text-xs text-gray-500 shrink-0">
                        Remaining
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={String(
                          task.timeTrackingRemaining ??
                            Math.max(
                              0,
                              (parseInt(task.originalEstimate || 0, 10) || 0) -
                                (parseInt(task.timeTrackingSpent || 0, 10) || 0)
                            )
                        )}
                        onChange={(e) => {
                          const digits = (e.target.value || "").replace(
                            /\D/g,
                            ""
                          );
                          setTask((t) => ({
                            ...t,
                            timeTrackingRemaining: parseInt(digits || "0", 10),
                          }));
                        }}
                        onBlur={saveTimeTracking}
                        className="w-24 sm:w-28 border rounded-lg px-2 py-1 text-sm"
                      />
                      <button
                        className="shrink-0 text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border"
                        onClick={() =>
                          setTask((t) => ({
                            ...t,
                            timeTrackingRemaining: Math.max(
                              0,
                              (parseInt(t.originalEstimate || 0, 10) || 0) -
                                (parseInt(t.timeTrackingSpent || 0, 10) || 0)
                            ),
                          }))
                        }
                        title="Sync remaining from estimate - spent"
                      >
                        Sync
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---- Comment Row component ---- */
function CommentRow({ c, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.contentComment || c.content || "");

  return (
    <li className="border rounded-lg p-2 sm:p-3">
      <div className="flex items-start gap-2 sm:gap-3">
        {"avatar" in c ? (
          <img
            src={c.avatar}
            alt="."
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] sm:text-xs text-gray-500">
            {c.user?.name || c.name || "User"}
          </div>

          {editing ? (
            <div className="mt-1 flex gap-2">
              <input
                className="flex-1 border rounded-lg px-2 py-1 text-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button
                className="px-2 py-1 text-sm rounded bg-blue-600 text-white"
                onClick={() => {
                  onChange(draft);
                  setEditing(false);
                }}
              >
                Lưu
              </button>
              <button
                className="px-2 py-1 text-sm rounded border"
                onClick={() => {
                  setDraft(c.contentComment || c.content || "");
                  setEditing(false);
                }}
              >
                Huỷ
              </button>
            </div>
          ) : (
            <div className="mt-1 text-sm whitespace-pre-wrap break-words">
              {c.contentComment || c.content}
            </div>
          )}

          <div className="mt-2 flex items-center gap-3 text-[11px] sm:text-xs text-blue-600">
            {!editing && (
              <button
                className="hover:underline"
                onClick={() => setEditing(true)}
              >
                Sửa
              </button>
            )}
            <button className="hover:underline text-red-600" onClick={onDelete}>
              Xoá
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
