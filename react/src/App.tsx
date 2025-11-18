import { Route, Routes, Navigate } from "react-router-dom";
import DashboardPage from "@/pages/dashboard";
import ForumPage from "@/pages/forum";
import ProgressPage from "@/pages/progress";
import ArticlesPage from "@/pages/articles";
import FocusPage from "@/pages/focus";
import LoginPage from "./pages/login";
import RequireAuth from "@/features/auth/RequireAuth";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/forum" element={<RequireAuth><ForumPage /></RequireAuth>} />
      <Route path="/progress" element={<RequireAuth><ProgressPage /></RequireAuth>} />
      <Route path="/articles" element={<RequireAuth><ArticlesPage /></RequireAuth>} />
      <Route path="/focus" element={<RequireAuth><FocusPage /></RequireAuth>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
