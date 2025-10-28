import { useState } from "react";
import { api } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    passWord: "",
    name: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.post("/Users/signup", form);
      setMsg({ type: "success", text: "Đăng ký thành công! Chuyển hướng sau 2s..." });
      setTimeout(() => navigate("/login"), 2000);
      console.log("✅ Signup response:", res.data);
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data);
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại!";
      setMsg({ type: "error", text: errorMessage });
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
            Đăng ký tài khoản mới để bắt đầu quản lý dự án, nhiệm vụ, và cộng tác nhóm hiệu quả
            hơn — giao diện được lấy cảm hứng từ Atlassian Jira.
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
            <h1 className="text-2xl font-semibold text-gray-800">Tạo tài khoản Jira Clone</h1>
            <p className="text-gray-500 text-sm mt-1">
              Nhanh chóng và dễ dàng để bắt đầu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {msg && (
              <div
                className={`text-sm p-2 rounded ${
                  msg.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Họ tên
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Mật khẩu
              </label>
              <input
                type="password"
                name="passWord"
                value={form.passWord}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="0123456789"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            <p>
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
