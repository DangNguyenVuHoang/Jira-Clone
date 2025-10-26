import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchIssues,
  createIssue,
  deleteIssueAPI,
} from "../app/issueSlice";
import IssueBoard from "../components/IssueBoard";
import IssueModal from "../components/IssueModal";
import Button from "../components/ui/Button";

export default function ProjectBoardPage() {
  const { id } = useParams(); // projectId
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);

  // 🔹 Lấy dữ liệu project và issues từ Redux
  const project = useSelector((state) =>
    state.project.projects.find((p) => String(p.id) === String(id))
  );
  const { issues, loading } = useSelector((state) => state.issue);
  const projectIssues = issues[id] || [];

  // 🔹 Gọi API load task khi vào project board
  useEffect(() => {
    if (id) dispatch(fetchIssues(id));
  }, [id, dispatch]);

  // 🔹 Tạo task mới
  const handleAdd = (title, desc) => {
    // Dữ liệu gửi đúng schema của Cybersoft API
    const form = {
      projectId: Number(id),
      taskName: title,
      description: desc,
      statusId: "1", // To Do (default)
      originalEstimate: 1,
      timeTrackingSpent: 0,
      timeTrackingRemaining: 0,
      typeId: 1, // Task type
      priorityId: 2, // Medium
    };
    dispatch(createIssue(form));
  };

  if (!project)
    return <p className="text-gray-600 italic text-center mt-10">
      Project not found.
    </p>;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {project.projectName || project.name} Board
        </h1>
        <Button onClick={() => setOpenModal(true)}>+ New Issue</Button>
      </div>

      {/* Board hiển thị task thật */}
      {loading ? (
        <p className="text-gray-500">Đang tải danh sách task...</p>
      ) : (
        <IssueBoard projectId={id} issues={projectIssues} />
      )}

      {/* Modal tạo task */}
      {openModal && (
        <IssueModal
          onClose={() => setOpenModal(false)}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
}
