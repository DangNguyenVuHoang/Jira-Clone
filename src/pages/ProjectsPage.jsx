import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchProjects,
  createProject,
  deleteProjectAPI,
} from "../app/projectSlice";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProjectModal from "../components/ProjectModal";
import { Link } from "react-router-dom";

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.project);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🟢 Lấy danh sách project khi load trang
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // 🟢 Thêm project mới (gọi API thật)
  const handleAddProject = (name, desc) => {
    dispatch(
      createProject({
        projectName: name,
        description: desc,
        categoryId: 1, // mặc định (Cybersoft yêu cầu)
      })
    );
  };

  // 🟢 Xoá project thật
  const handleDelete = (id) => {
    if (confirm("Bạn có chắc muốn xoá dự án này?")) {
      dispatch(deleteProjectAPI(id));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ New Project</Button>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500">Đang tải danh sách dự án...</p>}

      {/* Nếu không có project */}
      {!loading && projects.length === 0 && (
        <Card>
          <p className="text-gray-500">Hiện chưa có dự án nào.</p>
        </Card>
      )}

      {/* Danh sách project */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.id}>
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-semibold text-lg text-blue-600 hover:underline"
                  >
                    {p.projectName || p.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {p.description || "Không có mô tả"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  ✕
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal thêm mới */}
      {isModalOpen && (
        <ProjectModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddProject}
        />
      )}
    </div>
  );
}
