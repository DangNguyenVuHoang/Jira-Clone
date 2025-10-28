import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/Users/signin", {
        email,
        passWord: password,
      });

      const { accessToken, name, email: userEmail } = res.data.content;

      localStorage.setItem("jira_token", accessToken);
      localStorage.setItem("jira_user", JSON.stringify({ name, userEmail }));

      navigate("/projects");
    } catch (err) {
      console.error(err);
      setError("Sai tài khoản hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* ===== Left section (banner) ===== */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-700 to-blue-500 items-center justify-center text-white p-10">
        <div className="max-w-md text-center">
          <img
            src="https://seeklogo.com/images/A/atlassian-jira-logo-074B07A467-seeklogo.com.png"
            alt="Jira Logo"
            className="w-20 h-20 mx-auto mb-6"
          />
          <h2 className="text-3xl font-semibold mb-3">Jira Clone Platform</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Quản lý dự án, nhiệm vụ và cộng tác nhóm hiệu quả hơn với giao diện hiện đại được
            lấy cảm hứng từ Atlassian Jira.
          </p>
        </div>
      </div>

      {/* ===== Right section (form) ===== */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <img
              src="https://seeklogo.com/images/A/atlassian-jira-logo-074B07A467-seeklogo.com.png"
              alt="Logo"
              className="w-14 h-14 mx-auto mb-2 md:hidden"
            />
            <h1 className="text-2xl font-semibold text-gray-800">Đăng nhập vào Jira Clone</h1>
            <p className="text-gray-500 text-sm mt-1">
              Quản lý dự án dễ dàng & nhanh chóng
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            <p>
              Chưa có tài khoản?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
