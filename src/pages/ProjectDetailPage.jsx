// src/pages/ProjectDetailPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProjects } from "../app/projectSlice";
import { statusService } from "../services/statusService";
import { taskService } from "../services/taskService";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskDetailModal from "../components/TaskDetailModal";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((s) => s.project);

  const [statuses, setStatuses] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);

  const [tasksByStatus, setTasksByStatus] = useState({}); // { [statusId]: Task[] }
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [openTaskId, setOpenTaskId] = useState(null); // ✅ mở modal chi tiết

  // Lấy project list nếu trống
  useEffect(() => {
    if (!projects || projects.length === 0) {
      dispatch(fetchProjects());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lấy project hiện tại
  const project = useMemo(
    () => projects.find((p) => String(p.id) === String(id)),
    [projects, id]
  );

  // Load danh sách status
  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      try {
        setStatusLoading(true);
        const res = await statusService.getAll();
        const data = Array.isArray(res?.data?.content) ? res.data.content : [];
        if (mounted) setStatuses(data);
      } catch {
        // fallback nếu API thay đổi
        const fallback = [
          { statusId: "1", statusName: "BACKLOG", alias: "tồn đọng" },
          { statusId: "2", statusName: "SELECTED FOR DEVELOPMENT", alias: "được chọn để phát triển" },
          { statusId: "3", statusName: "IN PROGRESS", alias: "trong tiến trình" },
          { statusId: "4", statusName: "DONE", alias: "hoàn thành" },
        ];
        if (mounted) setStatuses(fallback);
      } finally {
        if (mounted) setStatusLoading(false);
      }
    };
    loadStatus();
    return () => { mounted = false; };
  }, []);

  // Load tasks theo projectId
  const loadTasks = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingTasks(true);
      const res = await taskService.getProjectDetail(id);
      const detail = res?.data?.content;
      let mapping = {};
      if (detail?.lstTask?.length) {
        // [{statusId,statusName,lstTaskDeTail:[...]}]
        detail.lstTask.forEach((col) => {
          mapping[col.statusId] = col.lstTaskDeTail || [];
        });
      } else {
        mapping = {};
        (statuses || []).forEach((s) => (mapping[s.statusId] = []));
      }
      setTasksByStatus(mapping);
    } catch {
      const empty = {};
      (statuses || []).forEach((s) => (empty[s.statusId] = []));
      setTasksByStatus(empty);
    } finally {
      setLoadingTasks(false);
    }
  }, [id, statuses]);

  useEffect(() => {
    // chỉ load khi đã có danh sách status (để có key statusId)
    if (statuses.length > 0) {
      loadTasks();
    }
  }, [statuses, loadTasks]);

  // Kéo-thả đổi trạng thái
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    if (srcCol === dstCol && destination.index === source.index) return;

    const taskId = Number(draggableId);

    // Optimistic UI
    setTasksByStatus((prev) => {
      const next = { ...prev };
      const srcList = Array.from(next[srcCol] || []);
      const [moved] = srcList.splice(source.index, 1);
      const dstList = Array.from(next[dstCol] || []);
      dstList.splice(destination.index, 0, { ...moved, statusId: dstCol });
      next[srcCol] = srcList;
      next[dstCol] = dstList;
      return next;
    });

    try {
      await taskService.updateStatus({ taskId, statusId: dstCol });
      await loadTasks(); // đồng bộ tuyệt đối
    } catch {
      await loadTasks(); // revert
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const onCreateSuccess = async () => {
    await loadTasks();
  };

  const onTaskUpdatedOrRemoved = async () => {
    await loadTasks();
    setOpenTaskId(null);
  };

  if (loading && !project) {
    return <div className="p-6 text-gray-500">Đang tải dự án...</div>;
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Không tìm thấy dự án.</p>
        <Link to="/projects" className="text-blue-600 hover:underline">
          ← Quay lại Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {project.projectName}
          </h1>
        <p className="text-sm text-gray-500">
            ID: {project.id} • Category: {project.categoryName || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenCreate(true)}
            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            + Create Task
          </button>
          <Link
            to="/projects"
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Members strip */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Members:</span>
        <div className="flex -space-x-2">
          {project.members?.slice(0, 6).map((m) => (
            <img
              key={m.userId}
              src={m.avatar}
              title={m.name}
              alt={m.name}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            />
          ))}
          {project.members?.length > 6 && (
            <div className="w-8 h-8 flex items-center justify-center text-xs bg-gray-200 rounded-full border-2 border-white text-gray-600">
              +{project.members.length - 6}
            </div>
          )}
          {(!project.members || project.members.length === 0) && (
            <span className="text-xs text-gray-400 italic">—</span>
          )}
        </div>
      </div>

      {/* Board (Statuses + Tasks) */}
      <div className="mt-2">
        {statusLoading || loadingTasks ? (
          <p className="text-gray-500">Đang tải trạng thái & task...</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statuses.map((st) => (
                <Droppable key={st.statusId} droppableId={st.statusId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white border rounded-xl shadow-sm p-3 min-h-[260px] flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">
                          {st.statusName}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {(tasksByStatus[st.statusId] || []).length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        {(tasksByStatus[st.statusId] || []).length === 0 ? (
                          <div className="text-xs text-gray-400 italic">
                            No tasks
                          </div>
                        ) : (
                          (tasksByStatus[st.statusId] || []).map((t, idx) => (
                            <Draggable
                              key={t.taskId}
                              draggableId={String(t.taskId)}
                              index={idx}
                            >
                              {(prov) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className="border rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setOpenTaskId(t.taskId)} // ✅ mở modal chi tiết
                                >
                                  <div className="font-medium text-sm text-gray-800 truncate">
                                    {t.taskName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    #{t.taskId}
                                    {t.assigness?.length
                                      ? ` • Assignees: ${t.assigness
                                          .map((a) => a.name)
                                          .join(", ")}`
                                      : ""}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                      </div>

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Modal tạo task */}
      {openCreate && (
        <CreateTaskModal
          project={project}
          onClose={() => setOpenCreate(false)}
          onSuccess={onCreateSuccess}
        />
      )}

      {/* Modal chi tiết/sửa task */}
      {openTaskId && (
        <TaskDetailModal
          project={project}
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onUpdated={onTaskUpdatedOrRemoved}
          onRemoved={onTaskUpdatedOrRemoved}
        />
      )}
    </div>
  );
}
