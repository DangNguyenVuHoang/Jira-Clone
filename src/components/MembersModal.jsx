import { useDispatch } from "react-redux";
import { useState } from "react";
import { removeUserFromProject, fetchProjects } from "../app/projectSlice";

export default function MembersModal({ project, onClose }) {
  const dispatch = useDispatch();
  const [localMembers, setLocalMembers] = useState(project.members || []);
  const [removingId, setRemovingId] = useState(null);

  const removeUser = async (userId) => {
    if (!confirm("Bạn có chắc muốn gỡ thành viên này khỏi dự án?")) return;

    setRemovingId(userId);

    const res = await dispatch(
      removeUserFromProject({ projectId: project.id, userId })
    );

    if (!res.error) {
      // ✅ Cập nhật ngay danh sách local (xoá user vừa gỡ)
      setLocalMembers((prev) => prev.filter((m) => m.userId !== userId));

      // ✅ Sau đó gọi fetchProjects để đồng bộ backend
      await dispatch(fetchProjects());
    } else {
      alert("Gỡ thất bại, vui lòng thử lại!");
    }

    setRemovingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
        <h3 className="text-lg font-semibold mb-3">
          Members –{" "}
          <span className="text-gray-600">{project.projectName}</span>
        </h3>

        <div className="max-h-80 overflow-auto divide-y">
          {localMembers.length === 0 ? (
            <p className="text-sm text-gray-500 py-3 italic">
              Chưa có thành viên.
            </p>
          ) : (
            localMembers.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-sm">{m.name}</div>
                    {m.email && (
                      <div className="text-xs text-gray-500">{m.email}</div>
                    )}
                  </div>
                </div>

                <button
                  disabled={removingId === m.userId}
                  onClick={() => removeUser(m.userId)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    removingId === m.userId
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >
                  {removingId === m.userId ? "Đang gỡ..." : "Gỡ"}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
