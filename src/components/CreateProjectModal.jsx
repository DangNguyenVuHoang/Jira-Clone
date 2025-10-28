import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createProject, fetchProjects } from "../app/projectSlice";
import { api } from "../services/api";

export default function CreateProjectModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    projectName: "",
    description: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);

  // 🟢 Load danh sách category từ API thật
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCatLoading(true);
        const res = await api.get("/ProjectCategory");
        setCategories(res.data.content || []);
      } catch (err) {
        console.error("❌ Load categories failed:", err.response?.data || err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 🟢 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🟢 Handle create project submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      alert("Vui lòng chọn loại dự án!");
      return;
    }
    setLoading(true);
    try {
      const res = await dispatch(createProject(form));
      if (!res.error) {
        await dispatch(fetchProjects());
        onClose();
      }
    } catch (err) {
      console.error("❌ Create project failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4 relative animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          Tạo dự án mới
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tên dự án</label>
            <input
              type="text"
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nhập tên dự án..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Mô tả chi tiết về dự án..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Loại dự án</label>
            {catLoading ? (
              <p className="text-gray-500 text-sm">Đang tải loại dự án...</p>
            ) : (
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Chọn loại dự án --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.projectCategoryName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Đang tạo..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
