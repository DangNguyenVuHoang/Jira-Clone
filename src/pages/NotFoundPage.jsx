import { Link, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const isAuthed = Boolean(localStorage.getItem("jira_token"));

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white border rounded-2xl shadow-sm p-6 sm:p-10 text-center">
        {/* Illustration */}
        <div className="mx-auto w-40 sm:w-56">
          <svg viewBox="0 0 300 200" className="w-full h-auto">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e5e7eb" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="300" height="200" rx="16" fill="url(#g)" />
            <g transform="translate(40,40)">
              <rect x="0" y="0" width="220" height="120" rx="10" fill="white" stroke="#e5e7eb" />
              <rect x="16" y="20" width="120" height="12" rx="6" fill="#e5e7eb" />
              <rect x="16" y="44" width="188" height="10" rx="5" fill="#f1f5f9" />
              <rect x="16" y="62" width="188" height="10" rx="5" fill="#f1f5f9" />
              <rect x="16" y="80" width="128" height="10" rx="5" fill="#f1f5f9" />
              <circle cx="185" cy="20" r="8" fill="#93c5fd" />
            </g>
            <text x="150" y="178" textAnchor="middle" fontSize="28" fill="#64748b" fontWeight="700">
              404
            </text>
          </svg>
        </div>

        {/* Text */}
        <h1 className="mt-6 text-xl sm:text-2xl font-semibold text-gray-800">
          Page not found
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Có vẻ như trang bạn tìm không tồn tại hoặc đã được di chuyển.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            ← Quay lại
          </button>

          {isAuthed ? (
            <Link
              to="/projects"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Về trang Projects
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Đến trang Đăng nhập
            </Link>
          )}
        </div>

        {/* Helper links */}
        <div className="mt-4 text-xs sm:text-sm text-gray-500">
          Hoặc kiểm tra lại đường dẫn URL bạn đã nhập.
        </div>
      </div>
    </div>
  );
}
