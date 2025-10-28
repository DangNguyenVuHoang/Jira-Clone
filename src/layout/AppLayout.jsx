import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { FiHome, FiFolder, FiSettings } from "react-icons/fi";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar: mobile drawer + desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // User info
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("jira_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Close drawer khi chuyển route
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("jira_token");
    localStorage.removeItem("jira_user");
    navigate("/login");
  };

  const navItem =
    "flex items-center gap-3 px-3 py-2 rounded-md transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const navActive = "bg-blue-100 text-blue-700";
  const navInactive = "text-gray-700 hover:bg-gray-100";

  const Sidebar = (
    <aside
      className={`flex h-full flex-col bg-white border-r transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      aria-label="Sidebar"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b">
        <span className="text-blue-600 font-bold tracking-wide">
          {collapsed ? "J" : "Jira Clone"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${navItem} ${isActive ? navActive : navInactive}`
          }
          aria-label="Dashboard"
        >
          <FiHome className="text-lg" />
          <span className={`${collapsed ? "hidden" : ""}`}>Dashboard</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `${navItem} ${isActive ? navActive : navInactive}`
          }
          aria-label="Projects"
        >
          <FiFolder className="text-lg" />
          <span className={`${collapsed ? "hidden" : ""}`}>Projects</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${navItem} ${isActive ? navActive : navInactive}`
          }
          aria-label="Settings"
        >
          <FiSettings className="text-lg" />
          <span className={`${collapsed ? "hidden" : ""}`}>Settings</span>
        </NavLink>
      </nav>

      {/* Collapse Button (desktop & tablet) */}
      <div className="border-t h-12 items-center justify-center hidden md:flex">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded-md hover:bg-gray-100"
          aria-label="Toggle collapse sidebar"
        >
          {collapsed ? "›" : "‹ Collapse"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex bg-gray-100 text-gray-800">
      {/* ============= Sidebar ============= */}
      {/* Desktop / Tablet: cố định */}
      <div className="hidden md:block">{Sidebar}</div>

      {/* Mobile: Drawer + Overlay */}
      <div className="md:hidden">
        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        )}
        {/* Drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: 256 }}
        >
          {Sidebar}
        </div>
      </div>

      {/* ============= Main ============= */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between bg-white border-b px-3 sm:px-4 md:px-6">
          {/* Left: hamburger (mobile) + title */}
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="text-base sm:text-lg md:text-xl font-semibold">
              {/* simple route-based title */}
              {location.pathname.startsWith("/projects")
                ? "Projects"
                : location.pathname.startsWith("/settings")
                ? "Settings"
                : "Dashboard"}
            </h1>
          </div>

          {/* Right: user + logout */}
          <div className="flex items-center gap-3">
            {/* User pill */}
            <div className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-full bg-gray-50 border">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                {(user?.name || user?.userEmail || "U").slice(0, 1).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 max-w-[140px] truncate">
                {user?.name || user?.userEmail || "User"}
              </span>
            </div>

            <Button
              variant="secondary"
              onClick={handleLogout}
              className="text-sm px-3 py-2"
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
