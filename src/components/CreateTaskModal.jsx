// src/components/CreateTaskModal.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { taskService } from "../services/taskService";
import { Editor } from "@tinymce/tinymce-react";

export default function CreateTaskModal({ project, onClose, onSuccess }) {
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    taskName: "",
    description: "",
    statusId: "",
    priorityId: "",
    typeId: "",
    assignees: [], // userId[]
  });

  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const members = useMemo(() => project?.members || [], [project]);

  useEffect(() => {
    let mounted = true;
    const loadMeta = async () => {
      try {
        setLoadingMeta(true);
        const [st, pr, tt] = await Promise.all([
          taskService.getStatuses(),
          taskService.getPriorities(),
          taskService.getTaskTypes(),
        ]);
        if (!mounted) return;
        setStatuses(st?.data?.content || []);
        setPriorities(pr?.data?.content || []);
        setTaskTypes(tt?.data?.content || []);
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
    return () => {
      mounted = false;
    };
  }, []);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toggleAssignee = (userId) => {
    setForm((s) => {
      const exists = s.assignees.includes(userId);
      return {
        ...s,
        assignees: exists
          ? s.assignees.filter((id) => id !== userId)
          : [...s.assignees, userId],
      };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        taskName: form.taskName.trim(),
        description: editorRef.current?.getContent() || "",
        statusId: form.statusId,
        originalEstimate: 0,
        timeTrackingSpent: 0,
        timeTrackingRemaining: 0,
        projectId: Number(project.id),
        typeId: Number(form.typeId),
        priorityId: Number(form.priorityId),
        listUserAssign: form.assignees, // backend thường tự gán từ đây
      };

      const res = await taskService.createTask(payload);

      // 👉 Cố gắng lấy taskId từ response để post-assign (nếu cần)
      const created = res?.data?.content;
      const taskId =
        (created && (created.taskId || created.id || created.taskIdNew)) || null;

      if (taskId && Array.isArray(form.assignees) && form.assignees.length > 0) {
        // Gọi assignUserTask tuần tự (có thể song song Promise.all nếu muốn)
        for (const userId of form.assignees) {
          try {
            await taskService.assignUserTask({ taskId, userId });
          } catch (e) {
            // Không chặn flow tạo task; chỉ cảnh báo
            console.warn("assignUserTask failed:", { taskId, userId }, e);
          }
        }
      } else if (!taskId) {
        console.warn(
          "[CreateTaskModal] Không tìm thấy taskId từ response. " +
            "Có thể backend đã gán user từ listUserAssign trong createTask."
        );
      }

      onSuccess?.(); // reload board
      onClose();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Tạo task thất bại. Vui lòng kiểm tra dữ liệu."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Task</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task name</label>
                <input
                  name="taskName"
                  value={form.taskName}
                  onChange={update}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên task"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="statusId"
                  value={form.statusId}
                  onChange={update}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn status --</option>
                  {statuses.map((s) => (
                    <option key={s.statusId} value={s.statusId}>
                      {s.statusName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priorityId"
                  value={form.priorityId}
                  onChange={update}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn priority --</option>
                  {priorities.map((p) => (
                    <option key={p.priorityId} value={p.priorityId}>
                      {p.priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task type</label>
                <select
                  name="typeId"
                  value={form.typeId}
                  onChange={update}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn type --</option>
                  {taskTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.taskType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Assignees</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {members.map((m) => {
                    const checked = form.assignees.includes(m.userId);
                    return (
                      <label
                        key={m.userId}
                        className={`flex items-center gap-2 border rounded-lg px-2 py-1.5 cursor-pointer ${
                          checked ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAssignee(m.userId)}
                        />
                        <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full" />
                        <span className="text-sm truncate">{m.name}</span>
                      </label>
                    );
                  })}
                  {members.length === 0 && (
                    <div className="text-xs text-gray-500 italic">Chưa có thành viên</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Editor
                apiKey="wv8f190u7jmh5z7ytex8e74q6gbmp76nbnsrl3renxmmkco5"
                onInit={(_, editor) => (editorRef.current = editor)}
                initialValue={form.description || "<p></p>"}
                init={{
                  height: 300,
                  menubar: false,
                  plugins:
                    "advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime table",
                  toolbar:
                    "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat",
                  branding: false,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingMeta}
              className={`px-4 py-2 rounded-md text-white ${
                submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
