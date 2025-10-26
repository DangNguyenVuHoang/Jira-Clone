import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/ui/Button";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-white border-r transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b text-blue-600 font-bold">
          {collapsed ? "J" : "Jira Clone"}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md transition font-medium ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md transition font-medium ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Projects
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md transition font-medium ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Settings
          </NavLink>
        </nav>

        {/* Collapse Button */}
        <div className="border-t h-12 flex items-center justify-center">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {collapsed ? "›" : "‹ Collapse"}
          </button>
        </div>
      </aside>

      {/* Main section */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between bg-white border-b px-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-700">User</span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
