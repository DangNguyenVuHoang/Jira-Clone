import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { updateProjectAPI, fetchProjects } from "../app/projectSlice";
import { projectService } from "../services/projectService";
import { Editor } from "@tinymce/tinymce-react";

export default function EditProjectModal({ project, onClose }) {
  const dispatch = useDispatch();
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    projectName: project?.projectName || "",
    description: project?.description || "",
    categoryId: project?.categoryId ? String(project.categoryId) : "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);

  // Load categories từ API thật
  useEffect(() => {
    const loadCats = async () => {
      try {
        setCatLoading(true);
        const res = await projectService.getCategories();
        setCategories(res.data.content || []);
      } finally {
        setCatLoading(false);
      }
    };
    loadCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Lấy HTML từ TinyMCE
    const descriptionHtml =
      editorRef.current?.getContent() ?? form.description ?? "";

    try {
      const payload = {
        id: project.id,
        form: {
          projectName: form.projectName.trim(),
          description: descriptionHtml,
          categoryId: Number(form.categoryId),
        },
      };
      const res = await dispatch(updateProjectAPI(payload));
      if (!res.error) {
        await dispatch(fetchProjects());
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Edit Project</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Top row: id / name / category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project id
                </label>
                <input
                  type="text"
                  value={project?.id ?? ""}
                  disabled
                  className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project name
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={form.projectName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Tên dự án"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Category
                </label>
                {catLoading ? (
                  <div className="text-sm text-gray-500">Đang tải...</div>
                ) : (
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
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
            </div>

            {/* Description (TinyMCE) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Editor
                apiKey="wv8f190u7jmh5z7ytex8e74q6gbmp76nbnsrl3renxmmkco5" // 👈 thêm dòng này
                onInit={(_, editor) => (editorRef.current = editor)}
                initialValue={form.description || "<p></p>"}
                init={{
                  height: 360,
                  menubar: false,
                  statusbar: true,
                  plugins:
                    "advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime table",
                  toolbar:
                    "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat",
                  branding: false,
                  content_style:
                    "body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:14px}",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
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
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
