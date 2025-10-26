import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/Users/signin", {
        email,
        passWord: password,
      });

      const { accessToken, name, email: userEmail } = res.data.content;

      // 🔹 Lưu token + user info vào localStorage
      localStorage.setItem("jira_token", accessToken);
      localStorage.setItem("jira_user", JSON.stringify({ name, userEmail }));

      navigate("/projects");
    } catch (err) {
      console.error(err);
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-96">
        <h1 className="text-xl font-semibold mb-6 text-center text-blue-600">
          Jira Clone – Đăng nhập
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
