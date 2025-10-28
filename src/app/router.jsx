// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import AppLayout from "../layout/AppLayout";
import PrivateRoute from "./PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import NotFoundPage from "../pages/NotFoundPage"; // ✅ thêm

export const router = createBrowserRouter([
  // Public
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },

  // Protected
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/projects" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/projects", element: <ProjectsPage /> },
          { path: "/projects/:id", element: <ProjectDetailPage /> },

          // 404 bên trong layout (user đã đăng nhập)
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },

  // Fallback 404 (user chưa đăng nhập / route lạ)
  { path: "*", element: <NotFoundPage /> },
]);
