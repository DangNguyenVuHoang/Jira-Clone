import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { fetchProjects, deleteProjectAPI } from "../app/projectSlice";
import Button from "../components/ui/Button";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import CreateProjectModal from "../components/CreateProjectModal";
import EditProjectModal from "../components/EditProjectModal";
import AssignUserModal from "../components/AssignUserModal";
import MembersModal from "../components/MembersModal";

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.project);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // ← mỗi trang tối đa 10
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [assignProjectId, setAssignProjectId] = useState(null);
  const [viewMembersOf, setViewMembersOf] = useState(null);

  // 🟢 Fetch all projects when page loads
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Khi danh sách projects thay đổi, quay về trang 1 để thấy project mới nhất
  useEffect(() => {
    setPage(1);
  }, [projects]);

  // 🔃 Sort projects: project mới tạo gần nhất lên đầu.
  const sortedProjects = useMemo(() => {
    const arr = Array.isArray(projects) ? [...projects] : [];
    arr.sort((a, b) => {
      // ưu tiên trường createdAt / createAt nếu có, fallback theo id (giả sử id tăng dần)
      const aTime =
        a.createdAt || a.createAt || a.created_at || a.createdAtTimestamp || null;
      const bTime =
        b.createdAt || b.createAt || b.created_at || b.createdAtTimestamp || null;

      if (aTime && bTime) {
        return new Date(bTime) - new Date(aTime); // mới -> cũ
      }
      if (a.id != null && b.id != null) {
        return b.id - a.id; // id lớn hơn => mới hơn
      }
      return 0;
    });
    return arr;
  }, [projects]);

  // 🔍 Search filter (áp dụng trên danh sách đã sort)
  const filtered = useMemo(() => {
    return sortedProjects.filter((p) =>
      p.projectName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [sortedProjects, search]);

  // 🧾 Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const currentProjects = filtered.slice(start, start + pageSize);

  // 🗑 Delete project
  const handleDelete = (id) => {
    if (confirm("Bạn có chắc muốn xoá dự án này?")) {
      dispatch(deleteProjectAPI(id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">
          Project management
        </h1>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Tìm kiếm dự án..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={() => dispatch(fetchProjects())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Làm mới
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <FiPlus /> Tạo dự án
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 animate-pulse">Đang tải danh sách...</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 w-16">ID</th>
                <th className="text-left px-4 py-3">Project name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Creator</th>
                <th className="text-left px-4 py-3">Members</th>
                <th className="text-center px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-600">{p.id}</td>

                  <td className="px-4 py-3">
                    <Link
                      to={`/projects/${p.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {p.projectName}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {p.categoryName || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-md text-xs font-medium">
                      {p.creator?.name || "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Avatars (click để mở popup list) */}
                      <button
                        onClick={() => setViewMembersOf(p)}
                        className="flex items-center -space-x-2"
                        title="Xem thành viên"
                      >
                        {p.members?.slice(0, 3).map((m) => (
                          <img
                            key={m.userId}
                            src={m.avatar}
                            title={m.name}
                            alt={m.name}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          />
                        ))}
                        {(!p.members || p.members.length === 0) && (
                          <span className="text-gray-400 text-xs italic">
                            —
                          </span>
                        )}
                        {p.members?.length > 3 && (
                          <div className="w-8 h-8 flex items-center justify-center text-xs bg-gray-200 rounded-full border-2 border-white text-gray-600">
                            +{p.members.length - 3}
                          </div>
                        )}
                      </button>

                      {/* Nút + để assign */}
                      <button
                        onClick={() => setAssignProjectId(p.id)}
                        title="Thêm thành viên"
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        title="Chỉnh sửa"
                        onClick={() => setEditProject(p)}
                        className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Xoá"
                        className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentProjects.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-500 py-8 italic"
                  >
                    Không tìm thấy dự án nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-1 rounded border text-sm ${
              page === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 border-gray-300"
            }`}
          >
            ‹
          </button>

          {Array.from({ length: totalPages })
            .map((_, i) => i + 1)
            .filter((i) => {
              if (totalPages <= 5) return true;
              if (i === 1 || i === totalPages) return true;
              if (i >= page - 1 && i <= page + 1) return true;
              return false;
            })
            .map((i, idx, arr) => {
              const prev = arr[idx - 1];
              const next = arr[idx + 1];
              const showDotsBefore = prev && i - prev > 1;
              const showDotsAfter = next && next - i > 1;

              return (
                <div key={i} className="flex items-center">
                  {showDotsBefore && (
                    <span className="px-2 text-gray-400 select-none">…</span>
                  )}
                  <button
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 rounded border text-sm ${
                      page === i
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    {i}
                  </button>
                  {showDotsAfter && (
                    <span className="px-2 text-gray-400 select-none">…</span>
                  )}
                </div>
              );
            })}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`px-3 py-1 rounded border text-sm ${
              page === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100 border-gray-300"
            }`}
          >
            ›
          </button>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
        />
      )}
    {/* Modals assignUsertoProject */}
      {assignProjectId && (
        <AssignUserModal
          projectId={assignProjectId}
          onClose={() => setAssignProjectId(null)}
        />
      )}
    {/* Modals view members */}
      {viewMembersOf && (
        <MembersModal
          project={viewMembersOf}
          onClose={() => setViewMembersOf(null)}
        />
      )}
    </div>
  );
}
