import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { projectService } from "../services/projectService";
import { assignUserToProject, fetchProjects } from "../app/projectSlice";

export default function AssignUserModal({ projectId, onClose }) {
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (k = keyword) => {
    setLoading(true);
    try {
      const res = await projectService.searchUsers(k);
      setList(res.data.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(""); }, []); // load gợi ý ban đầu

  const assign = async (userId) => {
    const res = await dispatch(assignUserToProject({ projectId, userId }));
    if (!res.error) {
      await dispatch(fetchProjects());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
        <h3 className="text-lg font-semibold mb-3">Thêm thành viên</h3>
        <div className="flex gap-2 mb-3">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Nhập tên tài khoản để tìm..."
            className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => search()}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Tìm
          </button>
        </div>
        <div className="max-h-72 overflow-auto divide-y">
          {loading && <p className="text-sm text-gray-500 py-3">Đang tìm...</p>}
          {!loading && list.length === 0 && (
            <p className="text-sm text-gray-500 py-3 italic">Không có kết quả</p>
          )}
          {list.map(u => (
            <div key={u.userId} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium text-sm">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
              <button
                onClick={() => assign(u.userId)}
                className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
              >
                Thêm
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">Đóng</button>
        </div>
      </div>
    </div>
  );
}
