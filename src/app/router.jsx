import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectBoardPage from "../pages/ProjectBoardPage";
import AppLayout from "../layout/AppLayout";
import PrivateRoute from "./PrivateRoute";
import DashboardPage from "../pages/DashboardPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <ProjectsPage /> },
          { path: "/projects", element: <ProjectsPage /> },
          { path: "/projects/:id", element: <ProjectBoardPage /> },
          { path: "/dashboard", element: <DashboardPage /> },
        ],
      },
    ],
  },
]);
